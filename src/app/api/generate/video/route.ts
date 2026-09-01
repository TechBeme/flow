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
    OMNI_MODEL,
    VIDEO_MODEL_MAP,
} from "@/lib/server/vertex-video"

interface VideoRequestBody {
    prompt: string
    model: string
    aspectRatio: string
    durationSeconds?: number
    resolution?: string
    referenceImages?: string[]
}

function parseDataImage(value: string | undefined) {
    if (!value?.startsWith("data:image/")) return null
    const commaIndex = value.indexOf(",")
    if (commaIndex === -1) return null

    const header = value.slice(0, commaIndex)
    const mimeType = header.match(/^data:([^;]+);base64$/)?.[1]
    const data = value.slice(commaIndex + 1)
    if (!mimeType || !data) return null

    return { mimeType, data }
}

async function getVertexSession() {
    const [accessToken, config] = await Promise.all([
        getVertexAccessToken(),
        getVertexConfig(),
    ])
    return { accessToken, config }
}

export async function POST(request: NextRequest) {
    let session: Awaited<ReturnType<typeof getVertexSession>>
    try {
        session = await getVertexSession()
    } catch (error) {
        console.error("[video] Vertex auth error:", error)
        return NextResponse.json(
            { error: (error as Error).message || "Falha ao autenticar no Vertex AI." },
            { status: 500 }
        )
    }

    let body: VideoRequestBody
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Corpo da requisicao invalido" }, { status: 400 })
    }

    const { prompt, model, referenceImages } = body
    if (!prompt || typeof prompt !== "string" || prompt.length > 5000) {
        return NextResponse.json({ error: "Prompt invalido" }, { status: 400 })
    }

    const isOmni = model === "omni"
    const veoModel = VIDEO_MODEL_MAP[model]
    if (!isOmni && !veoModel) {
        return NextResponse.json({ error: "Modelo de video invalido" }, { status: 400 })
    }

    const aspectRatio = body.aspectRatio === "9:16" ? "9:16" : "16:9"
    const initialImage = parseDataImage(referenceImages?.[0])

    if (isOmni) {
        const allowedDurations = [3, 4, 5, 6, 7, 8, 9, 10]
        const durationSeconds = allowedDurations.includes(body.durationSeconds ?? 6)
            ? body.durationSeconds ?? 6
            : 6
        const allowedResolutions = ["360p", "720p", "1080p", "4k"]
        const resolution = allowedResolutions.includes(body.resolution ?? "720p")
            ? body.resolution ?? "720p"
            : "720p"
        const input: unknown = initialImage
            ? [
                { type: "text", text: prompt },
                { type: "image", data: initialImage.data, mime_type: initialImage.mimeType },
            ]
            : prompt
        const omniUrl = `${vertexBaseUrl(session.config.globalLocation)}/v1beta1/projects/${session.config.projectId}/locations/${session.config.globalLocation}/interactions`

        const response = await fetch(omniUrl, {
            method: "POST",
            headers: vertexHeaders(session.accessToken),
            body: JSON.stringify({
                model: OMNI_MODEL,
                input,
                background: true,
                generation_config: {
                    video_config: {
                        task: initialImage ? "image_to_video" : "text_to_video",
                    },
                },
                response_format: {
                    type: "video",
                    aspect_ratio: aspectRatio,
                    duration: `${durationSeconds}s`,
                    resolution,
                },
            }),
        })

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            console.error("[video] Vertex Omni error:", response.status, errorData)
            return NextResponse.json(
                { error: errorData?.error?.message || `Erro do Vertex Omni (${response.status})` },
                { status: response.status }
            )
        }

        const data = await response.json()
        if (!data?.id || typeof data.id !== "string") {
            console.error("[video] Vertex Omni interaction ID missing:", data)
            return NextResponse.json({ error: "O Vertex Omni nao retornou a interacao" }, { status: 502 })
        }

        return NextResponse.json({ interactionId: data.id })
    }

    const allowedResolutions = model === "veo-3.1"
        ? ["720p", "1080p", "4k"]
        : ["720p", "1080p"]
    const resolution = allowedResolutions.includes(body.resolution ?? "720p")
        ? body.resolution ?? "720p"
        : "720p"
    const requestedDuration = [4, 6, 8].includes(body.durationSeconds ?? 8)
        ? body.durationSeconds ?? 8
        : 8
    const durationSeconds = resolution === "720p" ? requestedDuration : 8

    const instance: Record<string, unknown> = { prompt }
    if (initialImage) {
        instance.image = {
            bytesBase64Encoded: initialImage.data,
            mimeType: initialImage.mimeType,
        }
    }

    const veoUrl = `${vertexBaseUrl(session.config.videoLocation)}/v1/projects/${session.config.projectId}/locations/${session.config.videoLocation}/publishers/google/models/${veoModel}:predictLongRunning`
    const response = await fetch(veoUrl, {
        method: "POST",
        headers: vertexHeaders(session.accessToken),
        body: JSON.stringify({
            instances: [instance],
            parameters: {
                aspectRatio,
                durationSeconds,
                resolution,
                sampleCount: 1,
            },
        }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[video] Vertex Veo error:", response.status, errorData)
        return NextResponse.json(
            { error: errorData?.error?.message || `Erro do Vertex Veo (${response.status})` },
            { status: response.status }
        )
    }

    const data = await response.json()
    if (!data?.name || typeof data.name !== "string") {
        console.error("[video] Vertex operation name missing:", data)
        return NextResponse.json({ error: "O Vertex Veo nao retornou a operacao" }, { status: 502 })
    }

    return NextResponse.json({ operationName: data.name })
}

export async function GET(request: NextRequest) {
    let session: Awaited<ReturnType<typeof getVertexSession>>
    try {
        session = await getVertexSession()
    } catch (error) {
        console.error("[video] Vertex auth error:", error)
        return NextResponse.json(
            { error: (error as Error).message || "Falha ao autenticar no Vertex AI." },
            { status: 500 }
        )
    }

    const interactionId = request.nextUrl.searchParams.get("interaction")
    if (interactionId) {
        if (!/^[A-Za-z0-9._-]+$/.test(interactionId)) {
            return NextResponse.json({ error: "Interacao de video invalida" }, { status: 400 })
        }

        const interactionUrl = `${vertexBaseUrl(session.config.globalLocation)}/v1beta1/projects/${session.config.projectId}/locations/${session.config.globalLocation}/interactions/${interactionId}`
        const response = await fetch(interactionUrl, {
            headers: vertexHeaders(session.accessToken),
            cache: "no-store",
        })
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}))
            return NextResponse.json(
                { error: errorData?.error?.message || `Erro ao consultar o Vertex Omni (${response.status})` },
                { status: response.status }
            )
        }

        const data = await response.json()
        if (data.status === "in_progress" || data.status === "queued") {
            return NextResponse.json({ done: false })
        }
        if (data.status !== "completed") {
            return NextResponse.json(
                { error: data.error?.message || `A geracao Omni terminou com status ${data.status}` },
                { status: 502 }
            )
        }

        const video = findOmniVideo(data)
        if (!video?.data && !video?.uri) {
            console.error("[video] Vertex Omni completed without video:", data)
            return NextResponse.json({ error: "O Vertex Omni concluiu sem retornar o video" }, { status: 502 })
        }

        const videoUrl = `/api/generate/video/file?interaction=${encodeURIComponent(interactionId)}`
        return NextResponse.json({ done: true, videoUrl })
    }

    const operationName = request.nextUrl.searchParams.get("operation")
    if (!operationName) {
        return NextResponse.json({ error: "Operacao de video invalida" }, { status: 400 })
    }

    const veoModel = getVeoModelFromOperation(operationName, session.config)
    if (!veoModel) {
        return NextResponse.json({ error: "Operacao de video invalida" }, { status: 400 })
    }

    const operationUrl = `${vertexBaseUrl(session.config.videoLocation)}/v1/projects/${session.config.projectId}/locations/${session.config.videoLocation}/publishers/google/models/${veoModel}:fetchPredictOperation`
    const response = await fetch(operationUrl, {
        method: "POST",
        headers: vertexHeaders(session.accessToken),
        body: JSON.stringify({ operationName }),
        cache: "no-store",
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        console.error("[video] Vertex operation error:", response.status, errorData)
        return NextResponse.json(
            { error: errorData?.error?.message || `Erro ao consultar o Vertex Veo (${response.status})` },
            { status: response.status }
        )
    }

    const data = await response.json()
    if (!data.done) return NextResponse.json({ done: false })

    if (data.error) {
        return NextResponse.json(
            { error: data.error.message || "A geracao de video falhou" },
            { status: 502 }
        )
    }

    const video = findVeoVideo(data)
    if (!video?.data && !video?.uri) {
        console.error("[video] Vertex Veo completed without video:", data)
        return NextResponse.json(
            { error: "O Vertex Veo concluiu sem retornar o arquivo" },
            { status: 502 }
        )
    }

    const videoUrl = `/api/generate/video/file?operation=${encodeURIComponent(operationName)}`
    return NextResponse.json({ done: true, videoUrl })
}
