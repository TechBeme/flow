import type { VertexConfig } from "./vertex-auth"

export const OMNI_MODEL = "gemini-omni-1.1-flash-preview"

export const VIDEO_MODEL_MAP: Record<string, string> = {
    "veo-3.1": "veo-3.1-generate-001",
    "veo-3.1-fast": "veo-3.1-fast-generate-001",
    "veo-3.1-lite": "veo-3.1-lite-generate-001",
}

export interface VideoOutput {
    mimeType: string
    data?: string
    uri?: string
}

export function findOmniVideo(data: Record<string, unknown>): VideoOutput | null {
    const steps = Array.isArray(data.steps) ? data.steps : []
    for (const step of steps) {
        if (!step || typeof step !== "object") continue
        const content = Array.isArray((step as { content?: unknown[] }).content)
            ? (step as { content: unknown[] }).content
            : []
        for (const item of content) {
            if (!item || typeof item !== "object") continue
            const video = item as {
                type?: string
                mime_type?: string
                data?: string
                uri?: string
            }
            if (video.type === "video") {
                return {
                    mimeType: video.mime_type || "video/mp4",
                    data: video.data,
                    uri: video.uri,
                }
            }
        }
    }
    return null
}

export function findVeoVideo(data: Record<string, unknown>): VideoOutput | null {
    const response = data.response as Record<string, unknown> | undefined
    if (!response) return null

    const generateVideoResponse = response.generateVideoResponse &&
        typeof response.generateVideoResponse === "object"
        ? response.generateVideoResponse as Record<string, unknown>
        : undefined
    const rawVideos = Array.isArray(response.videos)
        ? response.videos
        : Array.isArray(response.generatedVideos)
            ? response.generatedVideos
            : Array.isArray(generateVideoResponse?.generatedSamples)
                ? generateVideoResponse.generatedSamples
                : []

    const first = rawVideos[0]
    if (!first || typeof first !== "object") return null

    const wrapper = first as Record<string, unknown>
    const video = wrapper.video && typeof wrapper.video === "object"
        ? wrapper.video as Record<string, unknown>
        : wrapper
    const dataValue = video.bytesBase64Encoded ?? video.videoBytes ?? video.data
    const uriValue = video.gcsUri ?? video.uri

    return {
        mimeType: typeof video.mimeType === "string" ? video.mimeType : "video/mp4",
        data: typeof dataValue === "string" ? dataValue : undefined,
        uri: typeof uriValue === "string" ? uriValue : undefined,
    }
}

export function getVeoModelFromOperation(
    operationName: string,
    config: VertexConfig
): string | null {
    for (const model of Object.values(VIDEO_MODEL_MAP)) {
        const prefix = `projects/${config.projectId}/locations/${config.videoLocation}/publishers/google/models/${model}/operations/`
        if (!operationName.startsWith(prefix)) continue

        const operationId = operationName.slice(prefix.length)
        if (/^[A-Za-z0-9._-]+$/.test(operationId)) return model
    }
    return null
}
