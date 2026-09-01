"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import {
    ArrowLeft,
    MoreVertical,
    Search,
    SlidersHorizontal,
    Check,
    X,
    Pencil,
    Trash2,
    LayoutGrid,
    Square,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { AnimatePresence, motion } from "motion/react"
import { t } from "@/lib/i18n"
import { useFlowStore } from "@/lib/store"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface ProjectNavProps {
    projectId: string
    projectName: string
    gridSize: number
    onGridSizeChange: (size: number) => void
}

export function ProjectNav({
    projectId,
    projectName,
    gridSize,
    onGridSizeChange,
}: ProjectNavProps) {
    const router = useRouter()
    const [editingName, setEditingName] = useState(false)
    const [name, setName] = useState(projectName)
    const [searchQuery, setSearchQuery] = useState("")
    const [filtersOpen, setFiltersOpen] = useState(false)
    const [filterType, setFilterType] = useState<Set<string>>(new Set())
    const [filterProportion, setFilterProportion] = useState<Set<string>>(new Set())
    const [filterCreationDate, setFilterCreationDate] = useState<Set<string>>(new Set())
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
    const filtersRef = useRef<HTMLDivElement>(null)
    const filterBtnRef = useRef<HTMLButtonElement>(null)
    const renameProject = useFlowStore((s) => s.renameProject)
    const deleteProject = useFlowStore((s) => s.deleteProject)
    const mediaItems = useFlowStore((s) => s.mediaItems)
    const [menuOpen, setMenuOpen] = useState(false)
    const menuBtnRef = useRef<HTMLButtonElement>(null)
    const mediaCount = useMemo(() => {
        return Object.values(mediaItems).filter((m) => m.projectId === projectId).length
    }, [mediaItems, projectId])
    const handleNameChange = () => {
        if (name.trim() && name.trim() !== projectName) {
            renameProject(projectId, name.trim())
        }
        setEditingName(false)
    }

    const handleCancelName = () => {
        setName(projectName)
        setEditingName(false)
    }

    return (
        <>
            {/* Backdrop blur overlay - fixed at top */}
            <div
                className="fixed z-[2] inset-x-0 top-0 pointer-events-none h-20 backdrop-blur-sm"
                style={{
                    maskImage:
                        "linear-gradient(to bottom, black 0%, black 60%, rgba(0,0,0,0.8) 80%, rgba(0,0,0,0.4) 90%, transparent 100%)",
                }}
            />

            {/* Main nav - absolute positioned, full width */}
            <div className="fixed top-0 left-0 right-0 z-[3] pointer-events-none px-6 pr-8">
                {/* Single horizontal nav row */}
                <nav className="flex items-center h-[76px] pointer-events-none">
                    {/* LEFT group: back + name + more */}
                    <div className="flex items-center gap-1 pointer-events-auto shrink-0">
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => router.push("/")}
                                    className="flex items-center justify-center w-8 h-8 rounded-full text-white hover:bg-white/5 active:bg-white/25 transition-colors"
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{t("nav.goBack")}</TooltipContent>
                        </Tooltip>

                        <div className="flex items-center text-white min-w-20 px-2 py-1">
                            {editingName ? (
                                <div className="flex items-center gap-1">
                                    <input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") handleNameChange()
                                            if (e.key === "Escape") handleCancelName()
                                        }}
                                        className="bg-transparent border-0 outline-0 text-inherit font-inherit min-w-0 max-w-[500px]"
                                        autoFocus
                                    />
                                    <button
                                        onClick={handleNameChange}
                                        className="flex items-center justify-center w-8 h-8 rounded-full text-white hover:bg-white/5 active:bg-white/25 transition-colors"
                                    >
                                        <Check className="w-5 h-5" />
                                    </button>
                                    <button
                                        onClick={handleCancelName}
                                        className="flex items-center justify-center w-8 h-8 rounded-full text-white hover:bg-white/5 active:bg-white/25 transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            ) : (
                                <span
                                    className="cursor-pointer"
                                    onClick={() => {
                                        setName(projectName)
                                        setEditingName(true)
                                    }}
                                >
                                    {projectName}
                                </span>
                            )}
                        </div>

                        {/* Three-dot menu */}
                        {!editingName && (
                            <div className="relative">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <button
                                            onClick={() => setMenuOpen(!menuOpen)}
                                            ref={menuBtnRef}
                                            className="flex items-center justify-center w-8 h-8 rounded-full text-white/50 hover:bg-white/5 active:bg-white/25 transition-colors"
                                        >
                                            <MoreVertical className="w-5 h-5" />
                                        </button>
                                    </TooltipTrigger>
                                    <TooltipContent>{t("nav.moreOptions")}</TooltipContent>
                                </Tooltip>

                                <AnimatePresence>
                                    {menuOpen && (
                                        <NavMenu
                                            onRename={() => {
                                                setMenuOpen(false)
                                                setName(projectName)
                                                setEditingName(true)
                                            }}
                                            onDelete={() => {
                                                setMenuOpen(false)
                                                deleteProject(projectId)
                                                router.push("/")
                                            }}
                                            onClose={() => setMenuOpen(false)}
                                            triggerRef={menuBtnRef}
                                        />
                                    )}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>

                    {/* CENTER group: search bar + filter */}
                    <div className="flex items-center justify-center flex-1 max-w-[36rem] mx-auto pointer-events-auto relative">
                        <div
                            className="flex items-center w-full h-10 rounded-full px-3 gap-2"
                            style={{ background: "rgba(218,220,224,0.08)" }}
                        >
                            <Search className="w-5 h-5 text-white/50 shrink-0" />
                            <input
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder=""
                                className="flex-1 bg-transparent border-0 outline-0 text-white text-sm placeholder:text-white/30"
                            />
                            <button
                                ref={filterBtnRef}
                                onClick={() => setFiltersOpen(!filtersOpen)}
                                className={`flex items-center justify-center w-8 h-8 rounded-full shrink-0 transition-colors ${filtersOpen ? "bg-white/15 text-white" : "text-white/60 hover:text-white hover:bg-white/10"
                                    }`}
                            >
                                <SlidersHorizontal className="w-[1.125rem] h-[1.125rem]" />
                            </button>
                        </div>

                        {/* Filters dropdown */}
                        <AnimatePresence>
                            {filtersOpen && (
                                <FilterPanel
                                    ref={filtersRef}
                                    filterType={filterType}
                                    setFilterType={setFilterType}
                                    filterProportion={filterProportion}
                                    setFilterProportion={setFilterProportion}
                                    filterCreationDate={filterCreationDate}
                                    setFilterCreationDate={setFilterCreationDate}
                                    sortOrder={sortOrder}
                                    setSortOrder={setSortOrder}
                                    resultCount={mediaCount}
                                    onClose={() => setFiltersOpen(false)}
                                    triggerRef={filterBtnRef}
                                />
                            )}
                        </AnimatePresence>
                    </div>

                    {/* RIGHT group: grid size slider + avatar */}
                    <div className="flex items-center gap-3 pointer-events-auto shrink-0">
                        <div className="flex items-center gap-2">
                            <LayoutGrid className="w-3.5 h-3.5 text-white/40 shrink-0" />
                            <input
                                type="range"
                                min={100}
                                max={400}
                                step={10}
                                value={gridSize}
                                onChange={(e) => onGridSizeChange(Number(e.target.value))}
                                className="w-24 accent-white cursor-pointer"
                            />
                            <Square className="w-5 h-5 text-white/40 shrink-0" />
                        </div>

                        <button className="flex items-center p-1">
                            <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-medium uppercase text-flow-text-secondary">
                                U
                            </div>
                        </button>
                    </div>
                </nav>
            </div>

        </>
    )
}

/* ─── Filter Panel ─── */

import { forwardRef } from "react"

interface FilterPanelProps {
    filterType: Set<string>
    setFilterType: React.Dispatch<React.SetStateAction<Set<string>>>
    filterProportion: Set<string>
    setFilterProportion: React.Dispatch<React.SetStateAction<Set<string>>>
    filterCreationDate: Set<string>
    setFilterCreationDate: React.Dispatch<React.SetStateAction<Set<string>>>
    sortOrder: "newest" | "oldest"
    setSortOrder: (order: "newest" | "oldest") => void
    resultCount: number
    onClose: () => void
    triggerRef: React.RefObject<HTMLButtonElement | null>
}

const FilterPanel = forwardRef<HTMLDivElement, FilterPanelProps>(
    function FilterPanel(
        {
            filterType,
            setFilterType,
            filterProportion,
            setFilterProportion,
            filterCreationDate,
            setFilterCreationDate,
            sortOrder,
            setSortOrder,
            resultCount,
            onClose,
            triggerRef,
        },
        ref
    ) {
        // Close on click outside
        useEffect(() => {
            const handleClick = (e: MouseEvent) => {
                const panel = (ref as React.RefObject<HTMLDivElement>)?.current
                if (
                    panel &&
                    !panel.contains(e.target as Node) &&
                    triggerRef.current &&
                    !triggerRef.current.contains(e.target as Node)
                ) {
                    onClose()
                }
            }
            document.addEventListener("mousedown", handleClick)
            return () => document.removeEventListener("mousedown", handleClick)
        }, [onClose, ref, triggerRef])

        const toggleSet = (
            set: Set<string>,
            setter: React.Dispatch<React.SetStateAction<Set<string>>>,
            value: string
        ) => {
            setter((prev) => {
                const next = new Set(prev)
                if (next.has(value)) next.delete(value)
                else next.add(value)
                return next
            })
        }

        return (
            <motion.div
                ref={ref}
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
                className="absolute top-full right-0 mt-2 z-50 w-[360px]"
            >
                <div
                    className="rounded-2xl p-5 text-sm text-white"
                    style={{
                        background: "rgba(22, 23, 24, 0.95)",
                        backdropFilter: "blur(40px)",
                        boxShadow: "rgba(0, 0, 0, 0.4) 0px 16px 32px -8px",
                    }}
                >
                    {/* Header */}
                    <div className="flex items-center gap-2.5 mb-5">
                        <SlidersHorizontal className="w-5 h-5 text-white/60" />
                        <span className="text-base font-medium">{t("project.filters")}</span>
                    </div>

                    {/* Tipo + Proporção (side by side) */}
                    <div className="flex gap-6 mb-4">
                        <div className="flex-1">
                            <div className="text-xs text-white/40 mb-3">{t("project.filterType")}</div>
                            <div className="flex flex-col gap-2.5">
                                <FilterCheckbox
                                    label={t("project.filterImages")}
                                    checked={filterType.has("images")}
                                    onChange={() => toggleSet(filterType, setFilterType, "images")}
                                />
                                <FilterCheckbox
                                    label={t("project.filterVideos")}
                                    checked={filterType.has("videos")}
                                    onChange={() => toggleSet(filterType, setFilterType, "videos")}
                                />
                                <FilterCheckbox
                                    label={t("project.filterCollections")}
                                    checked={filterType.has("collections")}
                                    onChange={() => toggleSet(filterType, setFilterType, "collections")}
                                />
                            </div>
                        </div>
                        <div className="flex-1">
                            <div className="text-xs text-white/40 mb-3">{t("project.filterProportion")}</div>
                            <div className="flex flex-col gap-2.5">
                                <FilterCheckbox
                                    label={t("project.filterLandscape")}
                                    checked={filterProportion.has("landscape")}
                                    onChange={() =>
                                        toggleSet(filterProportion, setFilterProportion, "landscape")
                                    }
                                />
                                <FilterCheckbox
                                    label={t("project.filterPortrait")}
                                    checked={filterProportion.has("portrait")}
                                    onChange={() =>
                                        toggleSet(filterProportion, setFilterProportion, "portrait")
                                    }
                                />
                                <FilterCheckbox
                                    label={t("project.filterFreeform")}
                                    checked={filterProportion.has("freeform")}
                                    onChange={() =>
                                        toggleSet(filterProportion, setFilterProportion, "freeform")
                                    }
                                />
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-white/10 my-4" />

                    {/* Data de criação */}
                    <div className="mb-4">
                        <div className="text-xs text-white/40 mb-3">{t("project.filterCreationDate")}</div>
                        <div className="flex flex-col gap-2.5">
                            <FilterCheckbox
                                label={t("project.filterGenerated")}
                                checked={filterCreationDate.has("generated")}
                                onChange={() =>
                                    toggleSet(filterCreationDate, setFilterCreationDate, "generated")
                                }
                            />
                            <FilterCheckbox
                                label={t("project.filterUploaded")}
                                checked={filterCreationDate.has("uploaded")}
                                onChange={() =>
                                    toggleSet(filterCreationDate, setFilterCreationDate, "uploaded")
                                }
                            />
                            <FilterCheckbox
                                label={t("project.filterFavorites")}
                                checked={filterCreationDate.has("favorites")}
                                onChange={() =>
                                    toggleSet(filterCreationDate, setFilterCreationDate, "favorites")
                                }
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/10 my-4" />

                    {/* Ordenar por */}
                    <div className="mb-4">
                        <div className="text-xs text-white/40 mb-3">{t("project.filterSortBy")}</div>
                        <div className="flex flex-col gap-2.5">
                            <FilterRadio
                                label={t("project.filterNewest")}
                                checked={sortOrder === "newest"}
                                onChange={() => setSortOrder("newest")}
                            />
                            <FilterRadio
                                label={t("project.filterOldest")}
                                checked={sortOrder === "oldest"}
                                onChange={() => setSortOrder("oldest")}
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/10 my-4" />

                    {/* Resultados */}
                    <div className="text-sm text-white/70">
                        {t("project.filterResults")}: {resultCount}
                    </div>
                </div>
            </motion.div>
        )
    }
)

/* ─── Checkbox & Radio primitives ─── */

function FilterCheckbox({
    label,
    checked,
    onChange,
}: {
    label: string
    checked: boolean
    onChange: () => void
}) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group" onClick={onChange}>
            <div
                className={`w-[1.125rem] h-[1.125rem] rounded-[3px] border-2 flex items-center justify-center transition-colors ${checked
                    ? "bg-white border-white"
                    : "border-white/40 group-hover:border-white/60"
                    }`}
            >
                {checked && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path
                            d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"
                            fill="black"
                        />
                    </svg>
                )}
            </div>
            <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                {label}
            </span>
        </label>
    )
}

function FilterRadio({
    label,
    checked,
    onChange,
}: {
    label: string
    checked: boolean
    onChange: () => void
}) {
    return (
        <label className="flex items-center gap-3 cursor-pointer group" onClick={onChange}>
            <div
                className={`w-[1.125rem] h-[1.125rem] rounded-full border-2 flex items-center justify-center transition-colors ${checked
                    ? "border-white"
                    : "border-white/40 group-hover:border-white/60"
                    }`}
            >
                {checked && <div className="w-2.5 h-2.5 rounded-full bg-white" />}
            </div>
            <span className="text-sm text-white/80 group-hover:text-white transition-colors">
                {label}
            </span>
        </label>
    )
}

/* ─── Nav three-dot menu ─── */

function NavMenu({
    onRename,
    onDelete,
    onClose,
    triggerRef,
}: {
    onRename: () => void
    onDelete: () => void
    onClose: () => void
    triggerRef: React.RefObject<HTMLButtonElement | null>
}) {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleClick = (e: MouseEvent) => {
            if (
                ref.current &&
                !ref.current.contains(e.target as Node) &&
                triggerRef.current &&
                !triggerRef.current.contains(e.target as Node)
            ) {
                onClose()
            }
        }
        document.addEventListener("mousedown", handleClick)
        return () => document.removeEventListener("mousedown", handleClick)
    }, [onClose, triggerRef])

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: -4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute top-full left-0 mt-1 z-50"
        >
            <div
                className="flex flex-col rounded-2xl py-2 min-w-[180px]"
                style={{
                    background: "rgba(30, 31, 32, 0.95)",
                    backdropFilter: "blur(40px)",
                    boxShadow: "rgba(0, 0, 0, 0.4) 0px 16px 32px -8px",
                }}
            >
                <button
                    onClick={onRename}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                >
                    <Pencil className="w-[1.125rem] h-[1.125rem]" />
                    Renomear
                </button>
                <button
                    onClick={onDelete}
                    className="flex items-center gap-3 px-4 py-2.5 text-sm text-white hover:bg-white/10 transition-colors"
                >
                    <Trash2 className="w-[1.125rem] h-[1.125rem]" />
                    Excluir
                </button>
            </div>
        </motion.div>
    )
}
