export interface Project {
    id: string
    name: string
    thumbnail: string | null
    gridSize?: number
    createdAt: string
    updatedAt: string
}

export interface MediaItem {
    id: string
    projectId: string
    type: "image" | "video"
    url: string
    thumbnail: string
    prompt: string | null
    model: string | null
    aspectRatio: string
    createdAt: string
    status: "idle" | "generating" | "done" | "error"
    referenceImage?: string | null
    generationError?: string | null
}

export type AspectRatio =
    | "auto"
    | "1:1" | "1:4" | "1:8"
    | "2:3" | "3:2"
    | "3:4" | "4:3"
    | "4:1" | "4:5" | "5:4"
    | "8:1" | "9:16" | "16:9" | "21:9"

export type ImageSize = "512" | "1K" | "2K" | "4K"
export type MediaType = "image" | "video"
export type VideoDuration = 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
export type VideoResolution = "360p" | "720p" | "1080p" | "4k"

export interface GenerationRequest {
    prompt: string
    mediaType: MediaType
    model: string
    aspectRatio: AspectRatio
    count: number
    imageSize: ImageSize | null
    thinkingLevel?: "minimal" | "high"
    videoDuration?: VideoDuration
    videoResolution?: VideoResolution
}
