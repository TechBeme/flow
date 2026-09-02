"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "motion/react"
import { Plus, ArrowRight, X, ChevronDown, ImagePlus, Minus } from "lucide-react"
import { t } from "@/lib/i18n"
import { useFlowStore } from "@/lib/store"
import type {
    AspectRatio,
    GenerationRequest,
    ImageSize,
    MediaType,
    VideoDuration,
    VideoResolution,
} from "@/lib/types"

interface ModelOption {
    id: string
    name: string
    emoji: string
}

const IMAGE_MODELS: ModelOption[] = [
    { id: "nano-banana-pro", name: "Nano Banana Pro", emoji: "🍌" },
    { id: "nano-banana-2", name: "Nano Banana 2", emoji: "🍌" },
    { id: "nano-banana-2-lite", name: "Nano Banana 2 Lite", emoji: "🍌" },
]

const VIDEO_MODELS: ModelOption[] = [
    { id: "omni", name: "Omni 1.1 Flash", emoji: "🎬" },
    { id: "veo-3.1-lite", name: "Veo 3.1 - Lite", emoji: "🎬" },
    { id: "veo-3.1-fast", name: "Veo 3.1 - Fast", emoji: "🎬" },
    { id: "veo-3.1", name: "Veo 3.1 - Quality", emoji: "🎬" },
]

// Aspect ratios available per model
const MODEL_ASPECT_RATIOS: Record<string, { value: AspectRatio; label: string }[]> = {
    "nano-banana-2-lite": [
        { value: "auto", label: "Auto" },
        { value: "1:1", label: "1:1" },
        { value: "2:3", label: "2:3" },
        { value: "3:2", label: "3:2" },
        { value: "3:4", label: "3:4" },
        { value: "4:3", label: "4:3" },
        { value: "4:5", label: "4:5" },
        { value: "5:4", label: "5:4" },
        { value: "9:16", label: "9:16" },
        { value: "16:9", label: "16:9" },
        { value: "21:9", label: "21:9" },
    ],
    "nano-banana-2": [
        { value: "auto", label: "Auto" },
        { value: "1:1", label: "1:1" },
        { value: "1:4", label: "1:4" },
        { value: "1:8", label: "1:8" },
        { value: "2:3", label: "2:3" },
        { value: "3:2", label: "3:2" },
        { value: "3:4", label: "3:4" },
        { value: "4:1", label: "4:1" },
        { value: "4:3", label: "4:3" },
        { value: "4:5", label: "4:5" },
        { value: "5:4", label: "5:4" },
        { value: "8:1", label: "8:1" },
        { value: "9:16", label: "9:16" },
        { value: "16:9", label: "16:9" },
        { value: "21:9", label: "21:9" },
    ],
    "nano-banana-pro": [
        { value: "auto", label: "Auto" },
        { value: "1:1", label: "1:1" },
        { value: "2:3", label: "2:3" },
        { value: "3:2", label: "3:2" },
        { value: "3:4", label: "3:4" },
        { value: "4:3", label: "4:3" },
        { value: "4:5", label: "4:5" },
        { value: "5:4", label: "5:4" },
        { value: "9:16", label: "9:16" },
        { value: "16:9", label: "16:9" },
        { value: "21:9", label: "21:9" },
    ],
    "veo-3.1-lite": [
        { value: "16:9", label: "16:9" },
        { value: "9:16", label: "9:16" },
    ],
    "veo-3.1-fast": [
        { value: "16:9", label: "16:9" },
        { value: "9:16", label: "9:16" },
    ],
    "veo-3.1": [
        { value: "16:9", label: "16:9" },
        { value: "9:16", label: "9:16" },
    ],
    "omni": [
        { value: "16:9", label: "16:9" },
        { value: "9:16", label: "9:16" },
    ],
}

// Output image sizes per model
const MODEL_IMAGE_SIZES: Record<string, ImageSize[]> = {
    "nano-banana-2-lite": ["1K"],
    "nano-banana-2": ["512", "1K", "2K", "4K"],
    "nano-banana-pro": ["1K", "2K", "4K"],
}

const MODEL_VIDEO_DURATIONS: Record<string, VideoDuration[]> = {
    "omni": [3, 4, 5, 6, 7, 8, 9, 10],
    "veo-3.1-lite": [4, 6, 8],
    "veo-3.1-fast": [4, 6, 8],
    "veo-3.1": [4, 6, 8],
}

const MODEL_VIDEO_RESOLUTIONS: Record<string, VideoResolution[]> = {
    "omni": ["360p", "720p", "1080p", "4k"],
    "veo-3.1-lite": ["720p", "1080p"],
    "veo-3.1-fast": ["720p", "1080p"],
    "veo-3.1": ["720p", "1080p", "4k"],
}

type ThinkingLevel = "minimal" | "high"
type GeneratePayload = GenerationRequest & { referenceImages?: string[] }

interface GenerationPanelProps {
    onGenerate: (request: GeneratePayload) => void
    reuseData?: { id: string; prompt: string; referenceImages?: string[] | null }
    onAttachReference?: (dataUrl: string) => void
}

export function GenerationPanel({
    onGenerate,
    reuseData,
    onAttachReference,
}: GenerationPanelProps) {
    const [prompt, setPrompt] = useState("")
    const [imageModel, setImageModel] = useState(IMAGE_MODELS[0])
    const [videoModel, setVideoModel] = useState(VIDEO_MODELS[0])
    const [aspectRatio, setAspectRatio] = useState<AspectRatio>("9:16")
    const [count, setCount] = useState(1)
    const [imageSize, setImageSize] = useState<ImageSize>("1K")
    const [thinkingLevel, setThinkingLevel] = useState<ThinkingLevel>("minimal")
    const [videoDuration, setVideoDuration] = useState<VideoDuration>(6)
    const [videoResolution, setVideoResolution] = useState<VideoResolution>("720p")
    const [mediaType, setMediaType] = useState<MediaType>("image")
    const [settingsOpen, setSettingsOpen] = useState(false)
    const [modelDropdownOpen, setModelDropdownOpen] = useState(false)
    const [referenceImages, setReferenceImages] = useState<string[]>([])
    const [isDragOver, setIsDragOver] = useState(false)
    const dragCounterRef = useRef(0)
    const draggingUrl = useFlowStore((s) => s.draggingUrl)
    const model = mediaType === "image" ? imageModel : videoModel
    const availableModels = mediaType === "image" ? IMAGE_MODELS : VIDEO_MODELS
    const textareaRef = useRef<HTMLTextAreaElement>(null)
    const settingsRef = useRef<HTMLDivElement>(null)
    const settingsTriggerRef = useRef<HTMLButtonElement>(null)

    // Read a File/Blob → base64 data URL
    const readFileAsDataURL = useCallback((file: File | Blob): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(file)
        })
    }, [])

    // Fetch an external image URL → base64 via canvas (CORS-safe fallback)
    const fetchImageAsDataURL = useCallback(async (url: string): Promise<string | null> => {
        try {
            const res = await fetch(url)
            if (!res.ok) return null
            const blob = await res.blob()
            if (!blob.type.startsWith("image/")) return null
            return readFileAsDataURL(blob)
        } catch {
            return null
        }
    }, [readFileAsDataURL])

    const attachImage = useCallback(async (source: File | Blob | string, fromGallery = false) => {
        try {
            let dataUrl: string | null = null
            if (typeof source === "string") {
                if (source.startsWith("data:")) {
                    dataUrl = source
                } else {
                    dataUrl = await fetchImageAsDataURL(source)
                }
            } else {
                dataUrl = await readFileAsDataURL(source)
            }
            if (dataUrl) {
                setReferenceImages(prev => [...prev, dataUrl])
                if (!fromGallery) onAttachReference?.(dataUrl)
            }
        } catch {
            // silently ignore
        }
    }, [readFileAsDataURL, fetchImageAsDataURL, onAttachReference])

    // ─── Paste handler ───
    useEffect(() => {
        const handlePaste = async (e: ClipboardEvent) => {
            const items = e.clipboardData?.items
            if (!items) return
            for (const item of Array.from(items)) {
                if (item.type.startsWith("image/")) {
                    const file = item.getAsFile()
                    if (file) { await attachImage(file); break }
                }
            }
        }
        window.addEventListener("paste", handlePaste)
        return () => window.removeEventListener("paste", handlePaste)
    }, [attachImage])

    // ─── Drag handlers ───
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        dragCounterRef.current++
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        dragCounterRef.current--
        if (dragCounterRef.current === 0) setIsDragOver(false)
    }, [])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault()
        e.dataTransfer.dropEffect = "copy"
    }, [])

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault()
        dragCounterRef.current = 0
        setIsDragOver(false)

        const isFromGallery = !!e.dataTransfer.getData("text/x-media-id")

        // 1. Files from OS / PC (always external)
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
        if (files.length > 0) { await attachImage(files[0], false); return }

        // 2. "text/html": dragged from browser (img src inside)
        const html = e.dataTransfer.getData("text/html")
        if (html) {
            const match = html.match(/src=["']([^"']+)["']/)
            if (match?.[1]) { await attachImage(match[1], isFromGallery); return }
        }

        // 3. "text/uri-list" or "text/plain": dragged image URL or data URI
        const uri = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain")
        if (uri && (uri.startsWith("http") || uri.startsWith("data:image"))) {
            await attachImage(uri, isFromGallery)
        }
    }, [attachImage])

    // Reuse is an explicit command from the gallery, so it intentionally hydrates local form state.
    useEffect(() => {
        if (!reuseData) return
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setPrompt(reuseData.prompt)
        setReferenceImages(reuseData.referenceImages?.filter((x): x is string => !!x) ?? [])
    }, [reuseData])

    const handleCreate = useCallback(() => {
        if (!prompt.trim()) return
        const sizes = mediaType === "image" ? MODEL_IMAGE_SIZES[model.id] : undefined
        const effectiveImageSize = sizes?.length ? imageSize : null
        const effectiveThinking: ThinkingLevel | undefined =
            mediaType === "image" && model.id === "nano-banana-2" ? thinkingLevel : undefined
        onGenerate({
            prompt: prompt.trim(),
            mediaType,
            model: model.id,
            aspectRatio,
            count: mediaType === "video" ? 1 : count,
            imageSize: effectiveImageSize,
            thinkingLevel: effectiveThinking,
            videoDuration: mediaType === "video" ? videoDuration : undefined,
            videoResolution: mediaType === "video" ? videoResolution : undefined,
            referenceImages: referenceImages.length > 0 ? referenceImages : undefined,
        })
    }, [prompt, mediaType, model, aspectRatio, count, imageSize, thinkingLevel, videoDuration, videoResolution, referenceImages, onGenerate])

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault()
                handleCreate()
            }
        },
        [handleCreate]
    )

    const applyModelOptions = useCallback((nextMediaType: MediaType, nextModel: ModelOption) => {
        const validRatios = MODEL_ASPECT_RATIOS[nextModel.id] ?? MODEL_ASPECT_RATIOS["nano-banana-2"]
        setAspectRatio((prev) =>
            validRatios.find((r) => r.value === prev) ? prev : validRatios[0].value
        )
        const validSizes = MODEL_IMAGE_SIZES[nextModel.id]
        if (validSizes) {
            setImageSize((prev) => (validSizes.includes(prev) ? prev : validSizes[0]))
        } else {
            setImageSize("1K")
        }
        if (nextMediaType === "video") {
            setCount(1)
            const durations = MODEL_VIDEO_DURATIONS[nextModel.id]
            const resolutions = MODEL_VIDEO_RESOLUTIONS[nextModel.id]
            setVideoDuration((current) => durations.includes(current) ? current : durations[0])
            setVideoResolution((current) => resolutions.includes(current) ? current : resolutions[0])
        }
    }, [])

    const selectMediaType = useCallback((nextMediaType: MediaType) => {
        setMediaType(nextMediaType)
        applyModelOptions(nextMediaType, nextMediaType === "image" ? imageModel : videoModel)
    }, [applyModelOptions, imageModel, videoModel])

    const selectModel = useCallback((nextModel: ModelOption) => {
        if (mediaType === "image") setImageModel(nextModel)
        else setVideoModel(nextModel)
        applyModelOptions(mediaType, nextModel)
        setModelDropdownOpen(false)
    }, [applyModelOptions, mediaType])

    const selectVideoResolution = useCallback((resolution: VideoResolution) => {
        setVideoResolution(resolution)
        if (model.id !== "omni" && resolution !== "720p") setVideoDuration(8)
    }, [model.id])

    // Close settings when clicking outside
    useEffect(() => {
        if (!settingsOpen) return
        const handleClick = (e: MouseEvent) => {
            if (
                settingsRef.current &&
                !settingsRef.current.contains(e.target as Node) &&
                settingsTriggerRef.current &&
                !settingsTriggerRef.current.contains(e.target as Node)
            ) {
                setSettingsOpen(false)
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [settingsOpen])

    // Auto-resize textarea
    const adjustHeight = useCallback(() => {
        const el = textareaRef.current
        if (el) {
            el.style.height = "0"
            el.style.height = Math.min(el.scrollHeight, window.innerHeight * 0.45) + "px"
        }
    }, [])

    useEffect(() => {
        adjustHeight()
    }, [prompt, adjustHeight])

    return (
        <>
            {/* Prompt bar - fixed bottom center */}
            <div className="fixed bottom-6 left-0 right-0 z-30 flex justify-center px-4 pointer-events-none">
                <div className="relative w-full max-w-[600px] pointer-events-auto">
                    {/* Settings popover - appears above the pill button */}
                    <AnimatePresence>
                        {settingsOpen && (
                            <motion.div
                                ref={settingsRef}
                                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                                transition={{ duration: 0.15 }}
                                className="absolute bottom-full right-8 mb-2 z-50"
                            >
                                <div
                                    className="flex flex-col gap-1 p-2 rounded-[18px] text-[0.75rem] font-medium text-white w-[17.5rem]"
                                    style={{
                                        background: "rgba(22, 23, 24, 0.9)",
                                        backdropFilter: "blur(40px)",
                                        boxShadow: "rgba(0, 0, 0, 0.4) 0px 16px 32px -8px",
                                    }}
                                >
                                    {/* Image / Video toggle */}
                                    <TabGroup>
                                        <TabButton
                                            active={mediaType === "image"}
                                            onClick={() => selectMediaType("image")}
                                        >
                                            <TabIcon name="image" />
                                            Imagem
                                        </TabButton>
                                        <TabButton
                                            active={mediaType === "video"}
                                            onClick={() => selectMediaType("video")}
                                        >
                                            <TabIcon name="video" />
                                            Vídeo
                                        </TabButton>
                                    </TabGroup>

                                    {/* Aspect ratio */}
                                    <div
                                        className="rounded-xl p-2"
                                        style={{ background: "rgba(218, 220, 224, 0.05)" }}
                                    >
                                        {/* Auto is available for image generation only. */}
                                        {mediaType === "image" && (
                                            <button
                                                onClick={() => setAspectRatio("auto")}
                                                className={`w-full flex items-center justify-center gap-1.5 h-[2rem] mb-1.5 rounded-lg text-[0.7rem] font-medium transition-all duration-200 ${aspectRatio === "auto"
                                                    ? "bg-white/[0.12] text-white"
                                                    : "bg-transparent text-white/50 hover:text-white/80"
                                                    }`}
                                            >
                                                <AspectRatioIcon ratio="auto" />
                                                Auto
                                            </button>
                                        )}
                                        <div className={`grid gap-1 ${mediaType === "video" ? "grid-cols-2" : "grid-cols-7"}`}>
                                            {(MODEL_ASPECT_RATIOS[model.id] ?? MODEL_ASPECT_RATIOS["nano-banana-2"]).filter(ar => ar.value !== "auto").map((ar) => (
                                                <button
                                                    key={ar.value}
                                                    onClick={() => setAspectRatio(ar.value)}
                                                    title={ar.label}
                                                    className={`flex flex-col items-center justify-end gap-[3px] py-1.5 rounded-lg transition-all duration-200 ${aspectRatio === ar.value
                                                        ? "bg-white/[0.12] text-white"
                                                        : "bg-transparent text-white/50 hover:text-white/80"
                                                        }`}
                                                >
                                                    <AspectRatioIcon ratio={ar.value} />
                                                    <span className="text-[0.6rem] leading-none">{ar.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Image size */}
                                    {mediaType === "image" && MODEL_IMAGE_SIZES[model.id]?.length && (
                                        <TabGroup>
                                            {MODEL_IMAGE_SIZES[model.id].map((size) => (
                                                <TabButton
                                                    key={size}
                                                    active={imageSize === size}
                                                    onClick={() => setImageSize(size)}
                                                >
                                                    {size}
                                                </TabButton>
                                            ))}
                                        </TabGroup>
                                    )}

                                    {/* Count with manual input */}
                                    {mediaType === "image" && (
                                        <div className="flex items-center gap-0 p-1 rounded-xl" style={{ background: "rgba(218, 220, 224, 0.08)" }}>
                                        <button
                                            onClick={() => setCount(Math.max(1, count - 1))}
                                            disabled={count <= 1}
                                            className="flex items-center justify-center h-[2rem] w-[2rem] rounded-lg text-white text-[0.75rem] font-semibold transition-all duration-200 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed hover:disabled:bg-transparent"
                                        >
                                            <Minus className="w-3.5 h-3.5" />
                                        </button>
                                        <div className="flex-1 flex items-center justify-center px-3">
                                            <input
                                                type="number"
                                                value={count}
                                                onChange={(e) => {
                                                    const val = Math.min(100, Math.max(1, parseInt(e.target.value, 10) || 1))
                                                    setCount(val)
                                                }}
                                                onFocus={(e) => e.target.select()}
                                                min="1"
                                                max="100"
                                                className="w-12 bg-transparent text-center text-white text-[1rem] font-bold outline-none border-none [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                                style={{
                                                    color: "rgba(255, 255, 255, 0.9)",
                                                    textShadow: "0 0 0 rgba(0,0,0,0)",
                                                    MozAppearance: "textfield"
                                                }}
                                            />
                                            <span className="text-white/50 text-[0.75rem] font-medium ml-1">/ 100</span>
                                        </div>
                                        <button
                                            onClick={() => setCount(Math.min(100, count + 1))}
                                            disabled={count >= 100}
                                            className="flex items-center justify-center h-[2rem] w-[2rem] rounded-lg text-white text-[0.75rem] font-semibold transition-all duration-200 hover:bg-white/15 disabled:opacity-40 disabled:cursor-not-allowed hover:disabled:bg-transparent"
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </button>
                                        </div>
                                    )}

                                    {mediaType === "video" && (
                                        <>
                                            <div
                                                className={`grid gap-1 rounded-xl p-1 ${MODEL_VIDEO_DURATIONS[model.id].length > 4 ? "grid-cols-4" : "grid-cols-3"}`}
                                                style={{ background: "rgba(218, 220, 224, 0.05)" }}
                                            >
                                                {MODEL_VIDEO_DURATIONS[model.id].map((duration) => {
                                                    const disabled = model.id !== "omni" && duration !== 8 && videoResolution !== "720p"
                                                    return (
                                                        <TabButton
                                                            key={duration}
                                                            active={videoDuration === duration}
                                                            disabled={disabled}
                                                            onClick={() => setVideoDuration(duration)}
                                                        >
                                                            {duration}s
                                                        </TabButton>
                                                    )
                                                })}
                                            </div>
                                            <TabGroup>
                                                {MODEL_VIDEO_RESOLUTIONS[model.id].map((resolution) => (
                                                    <TabButton
                                                        key={resolution}
                                                        active={videoResolution === resolution}
                                                        onClick={() => selectVideoResolution(resolution)}
                                                    >
                                                        {resolution}
                                                    </TabButton>
                                                ))}
                                            </TabGroup>
                                        </>
                                    )}

                                    {/* Thinking level (Nano Banana 2 only) */}
                                    {mediaType === "image" && model.id === "nano-banana-2" && (
                                        <TabGroup>
                                            <TabButton
                                                active={thinkingLevel === "minimal"}
                                                onClick={() => setThinkingLevel("minimal")}
                                            >
                                                Rápido
                                            </TabButton>
                                            <TabButton
                                                active={thinkingLevel === "high"}
                                                onClick={() => setThinkingLevel("high")}
                                            >
                                                Preciso
                                            </TabButton>
                                        </TabGroup>
                                    )}

                                    {/* Model selector */}
                                    <div className="relative">
                                        <button
                                            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
                                            className="w-full flex items-center justify-between h-[2.125rem] px-4 rounded-xl text-white text-[0.75rem] font-medium transition-colors"
                                            style={{ background: "rgba(218, 220, 224, 0.05)" }}
                                        >
                                            <span>{model.emoji} {model.name}</span>
                                            <ChevronDown className="w-4 h-4 text-white/50" />
                                        </button>
                                        <AnimatePresence>
                                            {modelDropdownOpen && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 4 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 4 }}
                                                    className="absolute bottom-full left-0 right-0 mb-1 max-h-60 overflow-y-auto rounded-xl z-20"
                                                    style={{ background: "rgba(30, 31, 32, 0.95)" }}
                                                >
                                                    {availableModels.map((m) => (
                                                        <button
                                                            key={m.id}
                                                            onClick={() => selectModel(m)}
                                                            className={`w-full flex items-center gap-2 px-4 py-2 text-[0.75rem] transition-colors hover:bg-white/10 ${model.id === m.id ? "bg-white/10 text-white" : "text-white/70"}`}
                                                        >
                                                            <span>{m.emoji}</span>
                                                            <span>{m.name}</span>
                                                        </button>
                                                    ))}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Main prompt bar */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                        <div
                            className="relative flex flex-col gap-1 min-h-[4rem] rounded-3xl border backdrop-blur-[80px] overflow-visible transition-all duration-200"
                            style={{
                                background: "rgba(22, 23, 24, 0.9)",
                                borderColor: isDragOver
                                    ? "rgba(255,255,255,0.5)"
                                    : draggingUrl
                                        ? "rgba(255,255,255,0.2)"
                                        : "rgba(218,220,224,0.05)",
                                boxShadow: isDragOver ? "0 0 0 2px rgba(255,255,255,0.12)" : undefined,
                            }}
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                        >
                            {/* Drag-over overlay: show image thumbnail + label */}
                            <AnimatePresence>
                                {isDragOver && draggingUrl && (
                                    <motion.div
                                        key="drag-over-gallery"
                                        className="absolute inset-0 z-10 rounded-3xl flex items-center justify-center pointer-events-none overflow-hidden gap-3"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.12 }}
                                        style={{ background: "rgba(22,23,24,0.85)" }}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={draggingUrl}
                                            alt=""
                                            className="rounded-xl object-cover shadow-lg"
                                            style={{ width: 52, height: 52 }}
                                        />
                                        <span className="text-sm font-medium text-white/80">Solte para usar como referência</span>
                                    </motion.div>
                                )}
                                {isDragOver && !draggingUrl && (
                                    <motion.div
                                        key="drag-over-external"
                                        className="absolute inset-0 z-10 rounded-3xl flex items-center justify-center pointer-events-none"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        transition={{ duration: 0.12 }}
                                        style={{ background: "rgba(22,23,24,0.85)" }}
                                    >
                                        <ImagePlus className="w-5 h-5 text-white/60 mr-2" />
                                        <span className="text-sm font-medium text-white/80">Solte a imagem aqui</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Reference images strip */}
                            {referenceImages.length > 0 && (
                                <div className="flex items-center gap-2 px-3 pt-3 flex-wrap">
                                    {referenceImages.map((img, i) => (
                                        <div
                                            key={i}
                                            className="relative shrink-0 rounded-lg overflow-hidden border border-white/20 group"
                                            style={{ width: 50, height: 50 }}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button
                                                onClick={() => setReferenceImages(prev => prev.filter((_, j) => j !== i))}
                                                className="absolute inset-0 flex items-center justify-center bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X className="w-4 h-4 text-white" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                            {/* Prompt textarea */}
                            <div className="flex-1 min-h-[1.6875rem] overflow-y-auto px-3 pt-4 pr-10">
                                <textarea
                                    ref={textareaRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={t("generation.promptPlaceholder")}
                                    rows={1}
                                    className="w-full bg-transparent border-none outline-none resize-none text-base leading-5 text-white placeholder:text-white/30 px-2"
                                    spellCheck={false}
                                />
                            </div>

                            {/* Close/clear button - top right */}
                            {prompt.length > 0 && (
                                <button
                                    onClick={() => setPrompt("")}
                                    className="absolute top-3 right-3 flex items-center justify-center w-7 h-7 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                            {/* Bottom controls row */}
                            <div className="flex items-center justify-between w-full px-2 pb-2">
                                {/* Left: attach image button + create button */}
                                <div className="flex items-center gap-1">
                                    <label className="flex items-center justify-center w-8 h-8 rounded-full text-white/40 hover:text-white/70 hover:bg-white/10 transition-colors cursor-pointer" title="Anexar imagem">
                                        <Plus className="w-[1.35rem] h-[1.35rem]" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            multiple
                                            className="hidden"
                                            onChange={async (e) => {
                                                const files = Array.from(e.target.files ?? [])
                                                for (const file of files) await attachImage(file)
                                                e.target.value = ""
                                            }}
                                        />
                                    </label>
                                </div>

                                {/* Right: settings pill + submit button */}
                                <div className="flex items-center gap-[0.3125rem]">
                                    {/* Settings pill trigger */}
                                    <button
                                        ref={settingsTriggerRef}
                                        onClick={() => {
                                            setSettingsOpen(!settingsOpen)
                                            setModelDropdownOpen(false)
                                        }}
                                        className="flex items-center gap-1 text-[0.75rem] font-medium text-[rgba(218,220,224,0.75)] px-3 h-[1.875rem] rounded-[15px] hover:bg-white/5 transition-colors"
                                        style={{ border: "1px solid rgba(255,255,255,0.15)" }}
                                    >
                                        <span>{model.emoji} {model.name}</span>
                                        {aspectRatio === "auto"
                                            ? <span>Auto</span>
                                            : <><AspectRatioIcon ratio={aspectRatio} /><span>{aspectRatio}</span></>
                                        }
                                        {mediaType === "image" ? (
                                            <>
                                                {MODEL_IMAGE_SIZES[model.id] && <span>{imageSize}</span>}
                                                <span>x{count}</span>
                                            </>
                                        ) : (
                                            <>
                                                <span>{videoDuration}s</span>
                                                <span>{videoResolution}</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Submit button */}
                                    <button
                                        onClick={handleCreate}
                                        disabled={!prompt.trim()}
                                        className="flex items-center justify-center h-8 w-8 rounded-full text-sm font-medium transition-colors disabled:opacity-30"
                                        style={{
                                            background: prompt.trim() ? "rgba(255,255,255,0.75)" : "rgba(255,255,255,0.15)",
                                            color: prompt.trim() ? "rgb(48, 48, 48)" : "rgba(255,255,255,0.4)",
                                        }}
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Disclaimer - fixed bottom left */}
            <div className="fixed bottom-2 left-2 z-20 pointer-events-none">
                <p className="text-[0.6875rem] font-medium leading-4 text-[rgb(154,160,166)]">
                    {t("app.disclaimer")}
                </p>
            </div>
        </>
    )
}

/* ─── Shared sub-components ─── */

function TabGroup({ children }: { children: React.ReactNode }) {
    return (
        <div className="rounded-xl" style={{ background: "rgba(218, 220, 224, 0.05)" }}>
            <div className="flex justify-around h-[2.125rem]">
                {children}
            </div>
        </div>
    )
}

function TabButton({
    active,
    onClick,
    disabled = false,
    children,
}: {
    active: boolean
    onClick: () => void
    disabled?: boolean
    children: React.ReactNode
}) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className={`flex-1 relative flex h-[2.125rem] items-center justify-center gap-1 px-2 rounded-xl text-[0.75rem] font-medium whitespace-nowrap transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-30 ${active
                ? "bg-white/[0.12] text-white"
                : "bg-transparent text-white/60 hover:text-white/80"
                }`}
        >
            {children}
        </button>
    )
}

function TabIcon({ name }: { name: "image" | "video" }) {
    if (name === "image") {
        return (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
                <path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z" />
            </svg>
        )
    }
    return (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z" />
        </svg>
    )
}

function AspectRatioIcon({ ratio }: { ratio: AspectRatio }) {
    if (ratio === "auto") {
        return (
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x={2.5} y={2.5} width={11} height={11} rx={1.5}
                    stroke="currentColor" strokeWidth={1.2} strokeDasharray="2.5 1.5" />
            </svg>
        )
    }
    // Normalized to max dimension of 14 within a 16×16 viewBox
    const sizes: Partial<Record<AspectRatio, { w: number; h: number }>> = {
        "1:1": { w: 11, h: 11 },
        "1:4": { w: 4, h: 14 },
        "1:8": { w: 2, h: 14 },
        "2:3": { w: 9, h: 14 },
        "3:2": { w: 14, h: 9 },
        "3:4": { w: 11, h: 14 },
        "4:1": { w: 14, h: 4 },
        "4:3": { w: 14, h: 11 },
        "4:5": { w: 11, h: 14 },
        "5:4": { w: 14, h: 11 },
        "8:1": { w: 14, h: 2 },
        "9:16": { w: 8, h: 14 },
        "16:9": { w: 14, h: 8 },
        "21:9": { w: 14, h: 6 },
    }
    const s = sizes[ratio] ?? { w: 11, h: 11 }
    return (
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect
                x={(16 - s.w) / 2}
                y={(16 - s.h) / 2}
                width={s.w}
                height={s.h}
                rx={1.5}
                stroke="currentColor"
                strokeWidth={1.2}
            />
        </svg>
    )
}
