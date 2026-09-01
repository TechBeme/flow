"use client"

import { useState, useRef, useCallback } from "react"
import type { MediaItem } from "@/lib/types"
import { MediaTile } from "./media-tile"
import { Lightbox } from "./lightbox"

interface MediaGridProps {
    items: MediaItem[]
    onReusePrompt?: (prompt: string, referenceImage?: string | null) => void
    onDelete?: (id: string) => void
    gridSize?: number
    onDropImage?: (dataUrl: string) => void
}

async function dataUrlFromDrop(e: React.DragEvent): Promise<string | null> {
    // Ignore gallery-to-gallery drags (already in gallery)
    if (e.dataTransfer.getData("text/x-media-id")) return null

    // Files from OS
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"))
    if (files.length > 0) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onload = () => resolve(reader.result as string)
            reader.onerror = reject
            reader.readAsDataURL(files[0])
        })
    }

    // text/html img src
    const html = e.dataTransfer.getData("text/html")
    if (html) {
        const match = html.match(/src=["']([^"']+)["']/)
        if (match?.[1]) {
            const src = match[1]
            if (src.startsWith("data:image")) return src
            try {
                const res = await fetch(src)
                if (!res.ok) return null
                const blob = await res.blob()
                if (!blob.type.startsWith("image/")) return null
                return new Promise((resolve, reject) => {
                    const reader = new FileReader()
                    reader.onload = () => resolve(reader.result as string)
                    reader.onerror = reject
                    reader.readAsDataURL(blob)
                })
            } catch { return null }
        }
    }

    // URI
    const uri = e.dataTransfer.getData("text/uri-list") || e.dataTransfer.getData("text/plain")
    if (uri?.startsWith("data:image")) return uri
    if (uri?.startsWith("http")) {
        try {
            const res = await fetch(uri)
            if (!res.ok) return null
            const blob = await res.blob()
            if (!blob.type.startsWith("image/")) return null
            return new Promise((resolve, reject) => {
                const reader = new FileReader()
                reader.onload = () => resolve(reader.result as string)
                reader.onerror = reject
                reader.readAsDataURL(blob)
            })
        } catch { return null }
    }

    return null
}

export function MediaGrid({ items, onReusePrompt, onDelete, gridSize = 140, onDropImage }: MediaGridProps) {
    const [isDragOver, setIsDragOver] = useState(false)
    const dragCounterRef = useRef(0)

    // Lightbox state — only "done" items are viewable
    const doneItems = items.filter(it => it.status === "done")
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

    const openLightbox = useCallback((item: MediaItem) => {
        const idx = doneItems.findIndex(it => it.id === item.id)
        if (idx !== -1) setLightboxIndex(idx)
    }, [doneItems])

    const handleDragEnter = useCallback((e: React.DragEvent) => {
        if (!onDropImage) return
        // Ignore gallery tile drags (they go to the prompt bar)
        if (e.dataTransfer.types.includes("text/x-media-id")) return
        e.preventDefault()
        dragCounterRef.current++
        setIsDragOver(true)
    }, [onDropImage])

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        if (!onDropImage || dragCounterRef.current === 0) return
        e.preventDefault()
        dragCounterRef.current--
        if (dragCounterRef.current === 0) setIsDragOver(false)
    }, [onDropImage])

    const handleDragOver = useCallback((e: React.DragEvent) => {
        if (!onDropImage) return
        if (e.dataTransfer.types.includes("text/x-media-id")) return
        const { types } = e.dataTransfer
        if (types.includes("Files") || types.includes("text/uri-list") || types.includes("text/plain")) {
            e.preventDefault()
            e.dataTransfer.dropEffect = "copy"
        }
    }, [onDropImage])

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        if (!onDropImage) return
        e.preventDefault()
        dragCounterRef.current = 0
        setIsDragOver(false)
        const dataUrl = await dataUrlFromDrop(e)
        if (dataUrl) onDropImage(dataUrl)
    }, [onDropImage])

    const dropProps = {
        onDragEnter: handleDragEnter,
        onDragLeave: handleDragLeave,
        onDragOver: handleDragOver,
        onDrop: handleDrop,
    }

    if (items.length === 0) {
        return (
            <div
                className="flex-1 flex items-center justify-center min-h-[300px] rounded-xl transition-colors"
                style={{ background: isDragOver ? "rgba(255,255,255,0.04)" : "transparent" }}
                {...dropProps}
            >
                <p className="text-white/30 text-sm pointer-events-none">
                    {isDragOver ? "Solte a imagem aqui" : "Nenhuma mídia ainda. Clique em + para criar."}
                </p>
            </div>
        )
    }

    return (
        <>
            <div
                className="flex flex-wrap gap-2 p-3 rounded-xl transition-colors"
                style={{
                    background: isDragOver ? "rgba(255,255,255,0.04)" : "transparent",
                }}
                {...dropProps}
            >
                {items.map((item) => (
                    <MediaTile
                        key={item.id}
                        item={item}
                        tileHeight={gridSize}
                        onReusePrompt={onReusePrompt}
                        onDelete={onDelete}
                        onClick={() => item.status === "done" && openLightbox(item)}
                    />
                ))}
            </div>

            {lightboxIndex !== null && (
                <Lightbox
                    items={doneItems}
                    index={lightboxIndex}
                    onClose={() => setLightboxIndex(null)}
                    onNavigate={setLightboxIndex}
                    onReusePrompt={onReusePrompt}
                />
            )}
        </>
    )
}
