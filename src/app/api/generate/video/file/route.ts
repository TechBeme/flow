import { NextRequest, NextResponse } from "next/server"
import {
    getVertexAccessToken,
    getVertexConfig,
    vertexBaseUrl,
    vertexHeaders,
} from "@/lib/server/vertex-auth"
import {
    findOmniVideo,
    findVeoVideo,
    getVeoModelFromOperation,
} from "@/lib/server/vertex-video"

function isAllowedGoogleVideoUrl(value: string): boolean {
    try {
        const url = new URL(value)
        if (url.protocol !== "https:") return false
        return (
            url.hostname === "storage.googleapis.com" ||
            url.hostname === "aiplatform.googleapis.com" ||
            url.hostname.endsWith("-aiplatform.googleapis.com") ||
            url.hostname.endsWith(".googleusercontent.com")
        )
    } catch {
        return false
    }
}

function gcsToDownloadUrl(uri: string): string | null {
    if (!uri.startsWith("gs://")) return null
    const withoutScheme = uri.slice(5)
    const slashIndex = withoutScheme.indexOf("/")
    if (slashIndex <= 0 || slashIndex === withoutScheme.length - 1) return null

    const bucket = withoutScheme.slice(0, slashIndex)
    const object = withoutScheme.slice(slashIndex + 1)
    return `https://storage.googleapis.com/storage/v1/b/${encodeURIComponent(bucket)}/o/${encodeURIComponent(object)}?alt=media`
}

function bufferedVideoResponse(
    data: string,
    mimeType: string,
    rangeHeader: string | null
): Response {
    const bytes = Buffer.from(data, "base64")
    const baseHeaders = {
        "Content-Type": mimeType,
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": "inline",
        "Accept-Ranges": "bytes",
    }

    const match = rangeHeader?.match(/^bytes=(\d+)-(\d*)$/)
    if (!match) {
        return new Response(bytes, {
            headers: {
                ...baseHeaders,
                "Content-Length": String(bytes.byteLength),
            },
        })
    }

    const start = Number(match[1])
    const requestedEnd = match[2] ? Number(match[2]) : bytes.byteLength - 1
    const end = Math.min(requestedEnd, bytes.byteLength - 1)
    if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || start > end) {
        return new Response(null, {
            status: 416,
            headers: { "Content-Range": `bytes */${bytes.byteLength}` },
        })
    }

    const chunk = bytes.subarray(start, end + 1)
    return new Response(chunk, {
        status: 206,
        headers: {
            ...baseHeaders,
            "Content-Length": String(chunk.byteLength),
            "Content-Range": `bytes ${start}-${end}/${bytes.byteLength}`,
        },
    })
}

async function proxyGoogleVideo(
    uri: string,
    accessToken: string,
    rangeHeader: string | null
): Promise<Response> {
    const url = gcsToDownloadUrl(uri) ?? uri
    if (!isAllowedGoogleVideoUrl(url)) {
        return NextResponse.json({ error: "URL de video invalida" }, { status: 400 })
    }

    const headers: Record<string, string> = { Authorization: `Bearer ${accessToken}` }
    if (rangeHeader) headers.Range = rangeHeader

    const upstream = await fetch(url, { headers, cache: "no-store" })
    if (!upstream.ok || !upstream.body) {
        console.error("[video] Vertex file download error:", upstream.status)
        return NextResponse.json(
            { error: `Nao foi possivel baixar o video (${upstream.status})` },
            { status: upstream.status || 502 }
        )
    }

    const responseHeaders = new Headers({
        "Content-Type": upstream.headers.get("content-type") || "video/mp4",
        "Cache-Control": "private, max-age=3600",
        "Content-Disposition": "inline",
    })
    for (const name of ["accept-ranges", "content-length", "content-range"]) {
        const value = upstream.headers.get(name)
        if (value) responseHeaders.set(name, value)
    }

    return new Response(upstream.body, {
        status: upstream.status,
        headers: responseHeaders,
    })
}

export async function GET(request: NextRequest) {
    let accessToken: string
    let config: Awaited<ReturnType<typeof getVertexConfig>>
    try {
        [accessToken, config] = await Promise.all([
            getVertexAccessToken(),
            getVertexConfig(),
        ])
    } catch (error) {
        console.error("[video-file] Vertex auth error:", error)
        return NextResponse.json(
            { error: (error as Error).message || "Falha ao autenticar no Vertex AI." },
            { status: 500 }
        )
    }

    const rangeHeader = request.headers.get("range")
    const interactionId = request.nextUrl.searchParams.get("interaction")
    if (interactionId) {
        if (!/^[A-Za-z0-9._-]+$/.test(interactionId)) {
            return NextResponse.json({ error: "Interacao de video invalida" }, { status: 400 })
        }

        const interactionUrl = `${vertexBaseUrl(config.globalLocation)}/v1beta1/projects/${config.projectId}/locations/${config.globalLocation}/interactions/${interactionId}`
        const interactionResponse = await fetch(interactionUrl, {
            headers: vertexHeaders(accessToken),
            cache: "no-store",
        })
        if (!interactionResponse.ok) {
            return NextResponse.json(
                { error: `Nao foi possivel carregar o video Omni (${interactionResponse.status})` },
                { status: interactionResponse.status }
            )
        }

        const video = findOmniVideo(await interactionResponse.json())
        if (video?.data) {
            return bufferedVideoResponse(video.data, video.mimeType, rangeHeader)
        }
        if (video?.uri) {
            return proxyGoogleVideo(video.uri, accessToken, rangeHeader)
        }
        return NextResponse.json({ error: "Arquivo de video Omni nao encontrado" }, { status: 404 })
    }

    const operationName = request.nextUrl.searchParams.get("operation")
    if (operationName) {
        const veoModel = getVeoModelFromOperation(operationName, config)
        if (!veoModel) {
            return NextResponse.json({ error: "Operacao de video invalida" }, { status: 400 })
        }

        const operationUrl = `${vertexBaseUrl(config.videoLocation)}/v1/projects/${config.projectId}/locations/${config.videoLocation}/publishers/google/models/${veoModel}:fetchPredictOperation`
        const operationResponse = await fetch(operationUrl, {
            method: "POST",
            headers: vertexHeaders(accessToken),
            body: JSON.stringify({ operationName }),
            cache: "no-store",
        })
        if (!operationResponse.ok) {
            return NextResponse.json(
                { error: `Nao foi possivel carregar o video Veo (${operationResponse.status})` },
                { status: operationResponse.status }
            )
        }

        const video = findVeoVideo(await operationResponse.json())
        if (video?.data) {
            return bufferedVideoResponse(video.data, video.mimeType, rangeHeader)
        }
        if (video?.uri) {
            return proxyGoogleVideo(video.uri, accessToken, rangeHeader)
        }
        return NextResponse.json({ error: "Arquivo de video Veo nao encontrado" }, { status: 404 })
    }

    return NextResponse.json({ error: "Arquivo de video nao informado" }, { status: 400 })
}
