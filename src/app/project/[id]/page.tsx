"use client"

import { useParams, notFound } from "next/navigation"
import { useState, useCallback, useMemo, useEffect, useRef } from "react"
import { toast } from "sonner"
import { useFlowStore } from "@/lib/store"
import { ClientOnly } from "@/components/client-only"
import { ProjectNav } from "@/components/project-nav"
import { MediaGrid } from "@/components/media-grid"
import { GenerationPanel } from "@/components/generation-panel"
import type { AspectRatio, GenerationRequest } from "@/lib/types"
import { getGenerationErrorMessage } from "@/lib/generation-errors"

function getImageDimensions(dataUrl: string): Promise<{ width: number; height: number }> {
    return new Promise((resolve) => {
        const img = new Image()
        img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight })
        img.onerror = () => resolve({ width: 1, height: 1 })
        img.src = dataUrl
    })
}

function estimateAspectRatio(width: number, height: number): AspectRatio {
    const ratio = width / height
    const options: [number, AspectRatio][] = [
        [1 / 8, "1:8"], [1 / 4, "1:4"],
        [2 / 3, "2:3"], [9 / 16, "9:16"],
        [3 / 4, "3:4"], [4 / 5, "4:5"],
        [1, "1:1"],
        [5 / 4, "5:4"], [4 / 3, "4:3"],
        [3 / 2, "3:2"], [16 / 9, "16:9"],
        [21 / 9, "21:9"], [4, "4:1"], [8, "8:1"],
    ]
    let closest: AspectRatio = "1:1"
    let minDiff = Infinity
    for (const [val, label] of options) {
        const diff = Math.abs(ratio - val)
        if (diff < minDiff) { minDiff = diff; closest = label }
    }
    return closest
}

function wait(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

function ProjectDetailContent() {
    const params = useParams()
    const projectId = params.id as string

    const project = useFlowStore((s) => s.projects.find((p) => p.id === projectId))
    const loadProject = useFlowStore((s) => s.loadProject)
    const allMediaItems = useFlowStore((s) => s.mediaItems)
    const mediaItems = useMemo(
        () => allMediaItems.filter((m) => m.projectId === projectId),
        [allMediaItems, projectId]
    )
    const addMediaItem = useFlowStore((s) => s.addMediaItem)
    const updateMediaItem = useFlowStore((s) => s.updateMediaItem)
    const deleteMediaItem = useFlowStore((s) => s.deleteMediaItem)
    const loadProjectMedia = useFlowStore((s) => s.loadProjectMedia)
    const persistMediaItem = useFlowStore((s) => s.persistMediaItem)
    const updateProjectThumbnail = useFlowStore((s) => s.updateProjectThumbnail)
    const updateProjectGridSize = useFlowStore((s) => s.updateProjectGridSize)

    const [projectLookup, setProjectLookup] = useState<"loading" | "found" | "missing" | "error">("loading")
    const [reuseData, setReuseData] = useState<{ id: string; prompt: string; referenceImages?: string[] | null } | undefined>(undefined)
    const [gridSize, setGridSize] = useState(() => {
        const saved = localStorage.getItem(`gridSize_${projectId}`)
        return saved ? parseInt(saved, 10) : 140
    })
    const gridSizeDbSyncedRef = useRef(false)
    const gridSizeSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

    useEffect(() => {
        let active = true
        setProjectLookup("loading")

        void loadProject(projectId)
            .then((loadedProject) => {
                if (active) setProjectLookup(loadedProject ? "found" : "missing")
            })
            .catch(() => {
                if (active) setProjectLookup("error")
            })

        void loadProjectMedia(projectId)
        return () => {
            active = false
        }
    }, [projectId, loadProject, loadProjectMedia])

    // Sync gridSize from DB on first project load only if localStorage has no saved value
    useEffect(() => {
        if (project && !gridSizeDbSyncedRef.current) {
            gridSizeDbSyncedRef.current = true
            if (!localStorage.getItem(`gridSize_${projectId}`) && project.gridSize) {
                setGridSize(project.gridSize)
            }
        }
    }, [project, projectId])

    const handleGridSizeChange = useCallback((size: number) => {
        setGridSize(size)
        localStorage.setItem(`gridSize_${projectId}`, String(size))
        if (gridSizeSaveTimerRef.current) clearTimeout(gridSizeSaveTimerRef.current)
        gridSizeSaveTimerRef.current = setTimeout(() => {
            void updateProjectGridSize(projectId, size)
        }, 800)
    }, [projectId, updateProjectGridSize])

    const handleReuseItem = useCallback((prompt: string, referenceImage?: string | null) => {
        setReuseData({ id: crypto.randomUUID(), prompt, referenceImages: referenceImage ? [referenceImage] : null })
    }, [])

    const handleAddGalleryImage = useCallback(async (dataUrl: string) => {
        const { width, height } = await getImageDimensions(dataUrl)
        const aspectRatio = estimateAspectRatio(width, height)
        const item = addMediaItem({
            projectId,
            type: "image",
            url: dataUrl,
            thumbnail: dataUrl,
            prompt: null,
            model: "upload",
            aspectRatio,
            status: "done",
            referenceImage: null,
        })
        await persistMediaItem(item.id)
        if (project && !project.thumbnail) {
            void updateProjectThumbnail(projectId, dataUrl)
        }
    }, [projectId, addMediaItem, persistMediaItem, project, updateProjectThumbnail])

    const handleDeleteMedia = useCallback(
        (id: string) => {
            void deleteMediaItem(id)
        },
        [deleteMediaItem]
    )

    const handleGenerate = useCallback(
        async (request: GenerationRequest & { referenceImages?: string[] }) => {
            const {
                prompt,
                mediaType,
                model,
                aspectRatio,
                count,
                imageSize,
                thinkingLevel,
                videoDuration,
                videoResolution,
                referenceImages,
            } = request
            // Resolve placeholder aspect ratio: when "auto", derive from first reference image or fall back to 9:16
            const firstRef = referenceImages?.[0]
            let placeholderAspectRatio: AspectRatio = aspectRatio === "auto" ? "9:16" : aspectRatio
            if (aspectRatio === "auto" && firstRef) {
                const { width, height } = await getImageDimensions(firstRef)
                placeholderAspectRatio = estimateAspectRatio(width, height)
            }

            // Create placeholder items in "generating" state
            const newItems = Array.from({ length: count }, () =>
                addMediaItem({
                    projectId,
                    type: mediaType,
                    url: "",
                    thumbnail: "",
                    prompt,
                    model,
                    aspectRatio: placeholderAspectRatio,
                    status: "generating",
                    referenceImage: firstRef ?? null,
                })
            )

            try {
                if (mediaType === "video") {
                    const startRes = await fetch("/api/generate/video", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            prompt,
                            model,
                            aspectRatio,
                            durationSeconds: videoDuration,
                            resolution: videoResolution,
                            referenceImages,
                        }),
                    })
                    const startData = await startRes.json().catch(() => ({}))
                    if (!startRes.ok) throw new Error(startData.error || `Erro ${startRes.status}`)

                    const operationName = startData.operationName as string | undefined
                    const interactionId = startData.interactionId as string | undefined
                    if (!operationName && !interactionId) {
                        throw new Error("A API nao retornou o identificador da geracao de video")
                    }

                    const item = newItems[0]
                    for (let attempt = 0; attempt < 90; attempt++) {
                        await wait(10_000)
                        const statusQuery = interactionId
                            ? `interaction=${encodeURIComponent(interactionId)}`
                            : `operation=${encodeURIComponent(operationName!)}`
                        const statusRes = await fetch(`/api/generate/video?${statusQuery}`, { cache: "no-store" })
                        const statusData = await statusRes.json().catch(() => ({}))
                        if (!statusRes.ok) throw new Error(statusData.error || `Erro ${statusRes.status}`)
                        if (!statusData.done) continue

                        const videoUrl = statusData.videoUrl as string | undefined
                        if (!videoUrl) throw new Error("A API concluiu sem retornar o arquivo de video")

                        updateMediaItem(item.id, {
                            url: videoUrl,
                            thumbnail: "",
                            status: "done",
                            generationError: null,
                        })
                        await persistMediaItem(item.id)
                        return
                    }

                    throw new Error("A geracao de video demorou mais de 15 minutos")
                }

                const res = await fetch("/api/generate", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ prompt, model, aspectRatio, count, imageSize, thinkingLevel, referenceImages }),
                })

                if (!res.ok) {
                    const errData = await res.json().catch(() => ({}))
                    throw new Error(errData.error || `Erro ${res.status}`)
                }

                const data = await res.json()
                const results = data.results as Array<{ imageData?: string; text?: string; error?: string; finishReason?: string }>

                const saves: Promise<void>[] = []

                results.forEach((result, i) => {
                    const item = newItems[i]
                    if (!item) return

                    if (result.error) {
                        console.error("[ProjectDetail] Generation failed for item:", item.id, result.error)
                        updateMediaItem(item.id, {
                            status: "error",
                            generationError: getGenerationErrorMessage(result.error),
                        })
                        toast.error(result.error, { duration: 6000 })
                    } else if (result.imageData) {
                        updateMediaItem(item.id, {
                            url: result.imageData,
                            thumbnail: result.imageData,
                            status: "done",
                            generationError: null,
                        })
                        saves.push(persistMediaItem(item.id))
                    }
                })

                await Promise.all(saves)

                // Update project thumbnail with first successful image.
                const firstImage = results.find((r) => r.imageData)
                if (firstImage?.imageData) {
                    void updateProjectThumbnail(projectId, firstImage.imageData)
                }
            } catch (err) {
                console.error("[ProjectDetail] Generation error:", err)
                const generationError = getGenerationErrorMessage(err)
                newItems.forEach((item) => {
                    updateMediaItem(item.id, { status: "error", generationError })
                })
            }
        },
        [projectId, addMediaItem, updateMediaItem, persistMediaItem, updateProjectThumbnail]
    )

    if (!project) {
        if (projectLookup === "missing") notFound()
        if (projectLookup === "error") {
            return (
                <div className="flex min-h-screen items-center justify-center bg-black px-6 text-center text-white/70">
                    Não foi possível carregar o projeto. Tente atualizar a página.
                </div>
            )
        }
        return null
    }

    return (
        <div className="min-h-screen bg-black">
            <ProjectNav
                projectId={project.id}
                projectName={project.name}
                gridSize={gridSize}
                onGridSizeChange={handleGridSizeChange} />

            <div className="pt-28 pb-32 px-6">
                <MediaGrid
                    items={mediaItems}
                    onReusePrompt={handleReuseItem}
                    onDelete={handleDeleteMedia}
                    gridSize={gridSize}
                    onDropImage={handleAddGalleryImage}
                />
            </div>

            <GenerationPanel
                onGenerate={handleGenerate}
                reuseData={reuseData}
                onAttachReference={handleAddGalleryImage}
            />
        </div>
    )
}

export default function ProjectPage() {
    return (
        <ClientOnly>
            <ProjectDetailContent />
        </ClientOnly>
    )
}
