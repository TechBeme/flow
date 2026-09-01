import { create } from "zustand"
import { v4 as uuidv4 } from "uuid"
import type { Project, MediaItem } from "./types"

interface FlowStore {
    // Projects
    projects: Project[]
    projectsLoaded: boolean
    loadProjects: () => Promise<void>
    createProject: (name: string) => Promise<Project>
    deleteProject: (id: string) => Promise<void>
    renameProject: (id: string, name: string) => Promise<void>
    updateProjectThumbnail: (id: string, thumbnail: string) => Promise<void>
    updateProjectGridSize: (id: string, gridSize: number) => Promise<void>

    // Media items
    mediaItems: MediaItem[]
    loadProjectMedia: (projectId: string) => Promise<void>
    addMediaItem: (item: Omit<MediaItem, "id" | "createdAt">) => MediaItem
    persistMediaItem: (id: string) => Promise<void>
    deleteMediaItem: (id: string) => Promise<void>
    getProjectMedia: (projectId: string) => MediaItem[]
    updateMediaItem: (id: string, updates: Partial<MediaItem>) => void

    // Drag state
    draggingUrl: string | null
    setDraggingUrl: (url: string | null) => void
}

export const useFlowStore = create<FlowStore>()((set, get) => ({
    projects: [],
    projectsLoaded: false,
    mediaItems: [],

    loadProjects: async () => {
        const res = await fetch("/api/projects")
        if (!res.ok) return
        const projects: Project[] = await res.json()
        set({ projects, projectsLoaded: true })
    },

    createProject: async (name: string) => {
        const tempId = uuidv4()
        const now = new Date().toISOString()
        const optimistic: Project = { id: tempId, name, thumbnail: null, createdAt: now, updatedAt: now }
        set((s) => ({ projects: [optimistic, ...s.projects] }))
        try {
            const res = await fetch("/api/projects", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name }),
            })
            if (!res.ok) throw new Error()
            const project: Project = await res.json()
            set((s) => ({ projects: s.projects.map((p) => (p.id === tempId ? project : p)) }))
            return project
        } catch {
            set((s) => ({ projects: s.projects.filter((p) => p.id !== tempId) }))
            throw new Error("Failed to create project")
        }
    },

    deleteProject: async (id: string) => {
        set((s) => ({
            projects: s.projects.filter((p) => p.id !== id),
            mediaItems: s.mediaItems.filter((m) => m.projectId !== id),
        }))
        await fetch(`/api/projects/${id}`, { method: "DELETE" })
    },

    renameProject: async (id: string, name: string) => {
        set((s) => ({
            projects: s.projects.map((p) =>
                p.id === id ? { ...p, name, updatedAt: new Date().toISOString() } : p
            ),
        }))
        await fetch(`/api/projects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name }),
        })
    },

    updateProjectThumbnail: async (id: string, thumbnail: string) => {
        set((s) => ({
            projects: s.projects.map((p) =>
                p.id === id ? { ...p, thumbnail, updatedAt: new Date().toISOString() } : p
            ),
        }))
        await fetch(`/api/projects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ thumbnail }),
        })
    },

    updateProjectGridSize: async (id: string, gridSize: number) => {
        set((s) => ({
            projects: s.projects.map((p) =>
                p.id === id ? { ...p, gridSize, updatedAt: new Date().toISOString() } : p
            ),
        }))
        await fetch(`/api/projects/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ gridSize }),
        })
    },

    loadProjectMedia: async (projectId: string) => {
        const res = await fetch(`/api/projects/${projectId}/media`)
        if (!res.ok) return
        const items: MediaItem[] = await res.json()
        set((s) => {
            const generating = s.mediaItems.filter(
                (m) => m.projectId === projectId && m.status === "generating"
            )
            const others = s.mediaItems.filter((m) => m.projectId !== projectId)
            return { mediaItems: [...generating, ...items, ...others] }
        })
    },

    addMediaItem: (item) => {
        const mediaItem: MediaItem = {
            ...item,
            id: uuidv4(),
            createdAt: new Date().toISOString(),
        }
        set((s) => ({ mediaItems: [mediaItem, ...s.mediaItems] }))
        return mediaItem
    },

    persistMediaItem: async (id: string) => {
        const item = get().mediaItems.find((m) => m.id === id)
        if (!item || item.status === "generating") return
        await fetch("/api/media", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                projectId: item.projectId,
                type: item.type,
                url: item.url,
                thumbnail: item.thumbnail,
                prompt: item.prompt,
                model: item.model,
                aspectRatio: item.aspectRatio,
                status: item.status,
                referenceImage: item.referenceImage ?? null,
            }),
        })
    },

    deleteMediaItem: async (id: string) => {
        set((s) => ({ mediaItems: s.mediaItems.filter((m) => m.id !== id) }))
        await fetch(`/api/media/${id}`, { method: "DELETE" }).catch(() => { })
    },

    getProjectMedia: (projectId: string) => {
        return get().mediaItems.filter((m) => m.projectId === projectId)
    },

    updateMediaItem: (id, updates) => {
        set((s) => ({
            mediaItems: s.mediaItems.map((m) => (m.id === id ? { ...m, ...updates } : m)),
        }))
    },

    draggingUrl: null,
    setDraggingUrl: (url) => set({ draggingUrl: url }),
}))
