"use client"

import { useState, useCallback, useRef } from "react"
import { motion } from "motion/react"
import { RotateCcw, AlertCircle, Trash2, Download, Play } from "lucide-react"
import type { MediaItem } from "@/lib/types"
import { useI18n } from "@/lib/i18n"
import { useFlowStore } from "@/lib/store"
import { getGenerationErrorKey } from "@/lib/generation-errors"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface MediaTileProps {
    item: MediaItem
    onReusePrompt?: (prompt: string, referenceImage?: string | null) => void
    onDelete?: (id: string) => void
    onClick?: () => void
    tileHeight?: number
}

export function MediaTile({ item, onReusePrompt, onDelete, onClick, tileHeight = 140 }: MediaTileProps) {
    const { t } = useI18n()
    const [isDragging, setIsDragging] = useState(false)
    const setDraggingUrl = useFlowStore((s) => s.setDraggingUrl)
    const imgRef = useRef<HTMLImageElement>(null)

    // Convert "9:16" → "9/16" for CSS aspect-ratio (used only for generating placeholder)
    const cssAspectRatio = item.aspectRatio?.replace(":", "/") || "9/16"
    const generationError = item.generationError
        ? t(getGenerationErrorKey(item.generationError))
        : t("media.generationError")

    const isDraggable = item.type === "image" && item.status === "done" && !!(item.url || item.thumbnail)

    const handleDragStart = useCallback((e: React.DragEvent) => {
        const url = item.url || item.thumbnail
        if (!url) return
        e.dataTransfer.effectAllowed = "copy"
        e.dataTransfer.setData("text/x-media-id", item.id)
        e.dataTransfer.setData("text/uri-list", url)
        e.dataTransfer.setData("text/plain", url)

        // Draw a small 72×72 thumbnail onto an off-screen canvas for the drag ghost
        if (imgRef.current) {
            const SIZE = 72
            const canvas = document.createElement("canvas")
            canvas.width = SIZE
            canvas.height = SIZE
            const ctx = canvas.getContext("2d")
            if (ctx) {
                ctx.drawImage(imgRef.current, 0, 0, SIZE, SIZE)
                // Set the drag image positioned so the centre of the thumb is under the cursor
                e.dataTransfer.setDragImage(canvas, SIZE / 2, SIZE / 2)
            }
        }

        setIsDragging(true)
        setDraggingUrl(url)
    }, [item.id, item.url, item.thumbnail, setDraggingUrl])

    const handleDragEnd = useCallback(() => {
        setIsDragging(false)
        setDraggingUrl(null)
    }, [setDraggingUrl])

    return (
        <motion.div
            className={`group relative overflow-hidden rounded-lg${isDraggable ? " cursor-grab active:cursor-grabbing" : ""}`}
            style={{ height: tileHeight, aspectRatio: cssAspectRatio, flexShrink: 0, opacity: isDragging ? 0.5 : 1 }}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: isDragging ? 0.5 : 1, scale: 1 }}
            transition={{ duration: 0.2 }}
        >
            <div
                role="button"
                aria-label={t("media.open")}
                className="w-full h-full cursor-pointer"
                draggable={isDraggable}
                onDragStart={isDraggable ? handleDragStart : undefined}
                onDragEnd={isDraggable ? handleDragEnd : undefined}
                onClick={onClick}
                tabIndex={0}
            >
                {/* Media / state */}
                {item.status === "generating" ? (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-3">
                            <div className="w-8 h-8 border-2 border-white/20 border-t-white/80 rounded-full animate-spin" />
                            <span className="text-sm text-white/50">{t("generation.generating")}</span>
                        </div>
                    </div>
                ) : item.status === "error" ? (
                    <div className="w-full h-full bg-white/5 flex items-center justify-center">
                        <div className="flex flex-col items-center gap-2 px-3">
                            <AlertCircle className="w-8 h-8 text-red-400/60" />
                            <span
                                className="text-xs leading-tight text-center text-red-400/70 break-words"
                                title={generationError}
                            >
                                {generationError}
                            </span>
                        </div>
                    </div>
                ) : item.type === "video" ? (
                    <>
                        <video
                            src={item.url}
                            className="w-full h-full object-cover"
                            muted
                            playsInline
                            preload="metadata"
                            onMouseEnter={(event) => void event.currentTarget.play()}
                            onMouseLeave={(event) => event.currentTarget.pause()}
                        />
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center group-hover:opacity-0 transition-opacity">
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm">
                                <Play className="h-4 w-4 fill-current" />
                            </span>
                        </div>
                    </>
                ) : (
                    // Generated images can be data URLs and need to remain directly draggable.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                        ref={imgRef}
                        src={item.url || item.thumbnail}
                        alt={item.prompt || ""}
                        className="w-full h-full object-cover"
                        draggable={false}
                    />
                )}

                {/* Hover overlay */}
                <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
                    {/* Delete button */}
                    {onDelete && (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id) }}
                            aria-label={t("media.delete")}
                            className="pointer-events-auto absolute top-2 right-2 flex items-center justify-center w-7 h-7 rounded-full bg-black/50 hover:bg-red-500/70 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
                        >
                            <Trash2 className="w-3.5 h-3.5" />
                        </button>
                    )}

                    {/* Bottom-right: reuse prompt + download */}
                    {item.status === "done" && (
                        <div className="absolute bottom-2 right-2 flex items-center gap-1 pointer-events-none">
                            {item.prompt && (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation()
                                                onReusePrompt?.(item.prompt!, item.referenceImage)
                                            }}
                                            className="pointer-events-auto flex items-center justify-center w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                                        >
                                            <RotateCcw className="w-3.5 h-3.5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>{t("project.reusePrompt")}</TooltipContent>
                                </Tooltip>
                            )}
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <a
                                        href={item.url || item.thumbnail}
                                        download={item.type === "video" ? `video-${item.id}.mp4` : `image-${item.id}.png`}
                                        onClick={(e) => e.stopPropagation()}
                                        aria-label={t("media.download")}
                                        className="pointer-events-auto flex items-center justify-center w-7 h-7 rounded-full bg-black/50 backdrop-blur-sm text-white/70 hover:text-white hover:bg-black/70 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                    </a>
                                </TooltipTrigger>
                                <TooltipContent>{t("media.download")}</TooltipContent>
                            </Tooltip>
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
