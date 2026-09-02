import { NextRequest, NextResponse } from "next/server"
import {
    getVertexAccessToken,
    getVertexConfig,
    vertexBaseUrl,
    vertexHeaders,
} from "@/lib/server/vertex-auth"

// ── Model / validation constants ────────────────────────────────────────────

const MODEL_MAP: Record<string, string> = {
    "nano-banana-2-lite": "gemini-3.1-flash-lite-image",
    "nano-banana-2": "gemini-3.1-flash-image",
    "nano-banana-pro": "gemini-3-pro-image",
}

const MODELS_WITH_IMAGE_SIZE = new Set([
    "gemini-3.1-flash-image",
    "gemini-3-pro-image",
])

const MODELS_WITH_THINKING = new Set([
    "gemini-3.1-flash-image",
])

const ALL_VALID_RATIOS = new Set([
    "1:1", "1:4", "1:8", "2:3", "3:2", "3:4",
    "4:1", "4:3", "4:5", "5:4", "8:1", "9:16", "16:9", "21:9",
])

const VALID_IMAGE_SIZES = new Set(["512", "1K", "2K", "4K"])

interface GenerateRequestBody {
    prompt: string
    model: string
    aspectRatio: string
    count: number
    imageSize?: string | null
    thinkingLevel?: string
    referenceImages?: string[]
}

export async function POST(request: NextRequest) {
    let accessToken: string
    let vertexConfig: Awaited<ReturnType<typeof getVertexConfig>>
    try {
        [accessToken, vertexConfig] = await Promise.all([
            getVertexAccessToken(),
            getVertexConfig(),
        ])
    } catch (e) {
        console.error("[generate] Vertex auth error:", e)
        return NextResponse.json(
            { error: (e as Error).message || "Falha ao autenticar no Vertex AI." },
            { status: 500 }
        )
    }

    let body: GenerateRequestBody
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: "Invalid request body" }, { status: 400 })
    }

    const { prompt, model, aspectRatio, count, imageSize, thinkingLevel, referenceImages } = body
    if (!prompt || typeof prompt !== "string" || prompt.length > 5000) {
        return NextResponse.json({ error: "Invalid prompt" }, { status: 400 })
    }

    const validCounts = [1, 2, 3, 4]
    const safeCount = validCounts.includes(count) ? count : 1
    const safeRatio = ALL_VALID_RATIOS.has(aspectRatio) ? aspectRatio : null
    const safeImageSize = imageSize && VALID_IMAGE_SIZES.has(imageSize) ? imageSize : null

    const geminiModel = MODEL_MAP[model] || "gemini-3.1-flash-image"
    const url = `${vertexBaseUrl(vertexConfig.globalLocation)}/v1/projects/${vertexConfig.projectId}/locations/${vertexConfig.globalLocation}/publishers/google/models/${geminiModel}:generateContent`
    const headers = vertexHeaders(accessToken)

    const imageConfig: Record<string, string> = {}
    if (safeRatio) imageConfig.aspectRatio = safeRatio
    if (safeImageSize && MODELS_WITH_IMAGE_SIZE.has(geminiModel)) {
        imageConfig.imageSize = safeImageSize
    }

    const thinkingConfig =
        MODELS_WITH_THINKING.has(geminiModel) && thinkingLevel
            ? { thinkingLevel }
            : undefined

    const contentParts: Record<string, unknown>[] = []
    if (Array.isArray(referenceImages)) {
        for (const img of referenceImages) {
            if (typeof img === "string" && img.startsWith("data:")) {
                const [header, data] = img.split(",")
                const mimeType = header.match(/data:([^;]+)/)?.[1] ?? "image/png"
                contentParts.push({ inlineData: { mimeType, data } })
            }
        }
    }
    contentParts.push({ text: prompt })

    const requestBody = {
        safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "OFF" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "OFF" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "OFF" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "OFF" },
        ],
        contents: [
            {
                role: "user",
                parts: contentParts,
            },
        ],
        generationConfig: {
            responseModalities: ["IMAGE"],
            imageConfig,
            ...(thinkingConfig && { thinkingConfig }),
        },
    }

    const FETCH_TIMEOUT_MS = 4 * 60 * 1000

    const promises = Array.from({ length: safeCount }, async () => {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
        try {
            const res = await fetch(url, {
                method: "POST",
                headers,
                body: JSON.stringify(requestBody),
                signal: controller.signal,
            })

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}))
                console.error("[generate] Vertex API error:", res.status, errData)
                return { error: errData?.error?.message || `API error ${res.status}` }
            }

            const data = await res.json()
            const parts = data?.candidates?.[0]?.content?.parts || []

            let imageData: string | null = null
            let mimeType = "image/png"
            let text: string | null = null

            for (const part of parts) {
                if (part.inlineData) {
                    imageData = part.inlineData.data
                    mimeType = part.inlineData.mimeType || "image/png"
                } else if (part.text && !part.thought) {
                    text = part.text
                }
            }

            if (!imageData) {
                const finishReason = data?.candidates?.[0]?.finishReason as string | undefined
                const blockReason = data?.promptFeedback?.blockReason as string | undefined
                const reason = finishReason ?? blockReason

                let userMessage: string
                switch (reason) {
                    case "IMAGE_SAFETY":
                        userMessage = "A imagem foi bloqueada por violar as políticas de uso do Google. Tente reformular o prompt ou usar outra imagem de referência."
                        break
                    case "IMAGE_OTHER":
                        userMessage = "O modelo não conseguiu gerar uma imagem com esse prompt. Tente reformular ou use uma imagem de referência compatível."
                        break
                    case "SAFETY":
                    case "PROHIBITED_CONTENT":
                        userMessage = "O conteúdo foi bloqueado por políticas de segurança do Google. Tente reformular o prompt."
                        break
                    case "BLOCKLIST":
                        userMessage = "O prompt contém termos bloqueados. Tente reformular."
                        break
                    case "RECITATION":
                        userMessage = "A resposta foi bloqueada por recitação de conteúdo protegido. Tente reformular o prompt."
                        break
                    case "SPII":
                        userMessage = "O conteúdo foi bloqueado por conter informações pessoais sensíveis."
                        break
                    case "LANGUAGE":
                        userMessage = "O idioma usado não é suportado pelo modelo. Tente em outro idioma."
                        break
                    case undefined:
                        console.error("[generate] No image and no reason. Full response:", JSON.stringify(data, null, 2))
                        userMessage = "Não foi possível gerar a imagem (resposta vazia do modelo)."
                        break
                    default:
                        console.warn(`[generate] Unknown block reason: ${reason}`)
                        userMessage = `Não foi possível gerar a imagem (${reason}).`
                }

                console.log(`[generate] Image blocked/skipped: ${reason ?? "unknown"}`)
                return { error: userMessage, blocked: true, reason: reason ?? "EMPTY_RESPONSE" }
            }

            return {
                imageData: `data:${mimeType};base64,${imageData}`,
                text,
            }
        } catch (err) {
            if ((err as Error)?.name === "AbortError") {
                console.warn("[generate] Request timed out after", FETCH_TIMEOUT_MS, "ms")
                return { error: "A geração demorou demais e foi cancelada. Tente novamente." }
            }
            console.error("[generate] Fetch error:", err)
            return { error: "Falha ao conectar ao Vertex AI" }
        } finally {
            clearTimeout(timeoutId)
        }
    })

    const results = await Promise.all(promises)
    return NextResponse.json({ results })
}
