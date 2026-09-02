"use client"

import { useEffect, useRef, useCallback, useState } from "react"
import { motion, AnimatePresence } from "motion/react"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, RotateCcw } from "lucide-react"
import type { MediaItem } from "@/lib/types"
import { useI18n } from "@/lib/i18n"

interface LightboxProps {
    items: MediaItem[]       // only "done" items
    index: number            // current index in items
    onClose: () => void
    onNavigate: (index: number) => void
    onReusePrompt?: (prompt: string, referenceImage?: string | null) => void
}

const MIN_SCALE = 0.5
const MAX_SCALE = 8
const ZOOM_STEP = 0.4

export function Lightbox({ items, index, onClose, onNavigate, onReusePrompt }: LightboxProps) {
    const { t } = useI18n()
    const item = items[index]
    const [scale, setScale] = useState(1)
    const [offset, setOffset] = useState({ x: 0, y: 0 })
    const [isDragging, setIsDragging] = useState(false)
    const dragging = useRef(false)
    const dragStart = useRef({ x: 0, y: 0, ox: 0, oy: 0 })
    const containerRef = useRef<HTMLDivElement>(null)

    const hasPrev = index > 0
    const hasNext = index < items.length - 1

    const navigateTo = useCallback((next: number) => {
        setScale(1)
        setOffset({ x: 0, y: 0 })
        setIsDragging(false)
        dragging.current = false
        onNavigate(next)
    }, [onNavigate])

    const navigate = useCallback((dir: 1 | -1) => {
        const next = index + dir
        if (next >= 0 && next < items.length) navigateTo(next)
    }, [index, items.length, navigateTo])

    // Keyboard
    useEffect(() => {
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose()
            if (e.key === "ArrowLeft") navigate(-1)
            if (e.key === "ArrowRight") navigate(1)
            if (e.key === "+" || e.key === "=") setScale(s => Math.min(MAX_SCALE, s + ZOOM_STEP))
            if (e.key === "-") setScale(s => Math.max(MIN_SCALE, s - ZOOM_STEP))
        }
        window.addEventListener("keydown", onKey)
        return () => window.removeEventListener("keydown", onKey)
    }, [navigate, onClose])

    // Wheel zoom
    const handleWheel = useCallback((e: React.WheelEvent) => {
        if (item?.type === "video") return
        e.preventDefault()
        const delta = -e.deltaY * 0.001 * 3
        setScale(s => Math.min(MAX_SCALE, Math.max(MIN_SCALE, s + delta)))
    }, [item?.type])

    // Mouse drag to pan
    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        if (scale <= 1) return
        e.preventDefault()
        dragging.current = true
        setIsDragging(true)
        dragStart.current = { x: e.clientX, y: e.clientY, ox: offset.x, oy: offset.y }
    }, [scale, offset])

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!dragging.current) return
        setOffset({
            x: dragStart.current.ox + e.clientX - dragStart.current.x,
            y: dragStart.current.oy + e.clientY - dragStart.current.y,
        })
    }, [])

    const handleMouseUp = useCallback(() => {
        dragging.current = false
        setIsDragging(false)
    }, [])

    if (!item) return null
    const url = item.url || item.thumbnail

    return (
        <AnimatePresence>
            <motion.div
                key="lightbox"
                className="fixed inset-0 z-50 flex flex-col"
                style={{ background: "rgba(0,0,0,0.92)", backdropFilter: "blur(24px)" }}
                onClick={onClose}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
            >
                {/* Top bar */}
                <div className="flex items-center justify-between px-4 py-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-2">
                        {item.type === "image" ? (
                            <>
                                <button
                                    onClick={() => setScale(s => Math.max(MIN_SCALE, s - ZOOM_STEP))}
                                    aria-label={t("lightbox.zoomOut")}
                                    className="flex items-center justify-center w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <ZoomOut className="w-4 h-4" />
                                </button>
                                <span className="text-xs text-white/40 w-10 text-center tabular-nums">{Math.round(scale * 100)}%</span>
                                <button
                                    onClick={() => setScale(s => Math.min(MAX_SCALE, s + ZOOM_STEP))}
                                    aria-label={t("lightbox.zoomIn")}
                                    className="flex items-center justify-center w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                                >
                                    <ZoomIn className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => { setScale(1); setOffset({ x: 0, y: 0 }) }}
                                    aria-label={t("lightbox.resetZoom")}
                                    className="text-xs text-white/40 hover:text-white/70 px-2 h-8 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    {t("lightbox.resetZoom")}
                                </button>
                            </>
                        ) : (
                            <span className="text-xs text-white/40">{t("lightbox.video")}</span>
                        )}
                    </div>

                    <span className="text-xs text-white/30 tabular-nums">{index + 1} / {items.length}</span>

                    <div className="flex items-center gap-1">
                        {item.prompt && onReusePrompt && (
                            <button
                                onClick={() => { onReusePrompt(item.prompt!, item.referenceImage); onClose() }}
                                aria-label={t("project.reusePrompt")}
                                className="flex items-center gap-1.5 h-8 px-3 rounded-full text-xs text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                            >
                                <RotateCcw className="w-3.5 h-3.5" />
                                {t("project.reusePrompt")}
                            </button>
                        )}
                        <a
                            href={url}
                            download={item.type === "video" ? `video-${item.id}.mp4` : `image-${item.id}.png`}
                            aria-label={t("media.download")}
                            className="flex items-center justify-center w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                        </a>
                        <button
                            onClick={onClose}
                            aria-label={t("lightbox.close")}
                            className="flex items-center justify-center w-8 h-8 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Image area */}
                <div
                    ref={containerRef}
                    className="flex-1 relative flex items-center justify-center overflow-hidden select-none"
                    onWheel={handleWheel}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ cursor: scale > 1 ? (isDragging ? "grabbing" : "grab") : "default" }}
                >
                    {item.type === "video" ? (
                        <motion.video
                            key={item.id}
                            src={url}
                            className="max-w-full max-h-full rounded-lg shadow-2xl"
                            controls
                            autoPlay
                            playsInline
                            onClick={(e) => e.stopPropagation()}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.15 }}
                        />
                    ) : (
                        <motion.img
                            key={item.id}
                            src={url}
                            alt={item.prompt || ""}
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                transform: `scale(${scale}) translate(${offset.x / scale}px, ${offset.y / scale}px)`,
                                transformOrigin: "center center",
                                transition: isDragging ? "none" : "transform 0.1s ease",
                                userSelect: "none",
                                pointerEvents: "none",
                            }}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.15 }}
                            draggable={false}
                        />
                    )}

                    {/* Prev / Next arrows */}
                    {hasPrev && (
                        <button
                            onClick={() => navigate(-1)}
                            aria-label={t("lightbox.previous")}
                            className="absolute left-3 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                    )}
                    {hasNext && (
                        <button
                            onClick={() => navigate(1)}
                            aria-label={t("lightbox.next")}
                            className="absolute right-3 flex items-center justify-center w-10 h-10 rounded-full bg-black/50 hover:bg-black/80 text-white/70 hover:text-white transition-colors backdrop-blur-sm"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Prompt bar at bottom */}
                {item.prompt && (
                    <div className="shrink-0 px-6 py-3 text-center">
                        <p className="text-sm text-white/40 line-clamp-2">{item.prompt}</p>
                    </div>
                )}

                {/* Thumbnail strip */}
                {items.length > 1 && (
                    <div className="shrink-0 flex items-center justify-center gap-1.5 pb-4 px-4 overflow-x-auto" onClick={(e) => e.stopPropagation()}>
                        {items.map((it, i) => (
                            <button
                                key={it.id}
                                onClick={() => navigateTo(i)}
                                aria-label={t("lightbox.item", { current: i + 1, total: items.length })}
                                className="shrink-0 rounded-md overflow-hidden transition-all duration-150"
                                style={{
                                    width: 48,
                                    height: 48,
                                    opacity: i === index ? 1 : 0.45,
                                    outline: i === index ? "2px solid rgba(255,255,255,0.7)" : "none",
                                    outlineOffset: 2,
                                }}
                            >
                                {it.type === "video" ? (
                                    <video src={it.url} className="w-full h-full object-cover" muted preload="metadata" />
                                ) : (
                                    <>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={it.url || it.thumbnail} alt="" className="w-full h-full object-cover" draggable={false} />
                                    </>
                                )}
                            </button>
                        ))}
                    </div>
                )}
            </motion.div>
        </AnimatePresence>
    )
}
