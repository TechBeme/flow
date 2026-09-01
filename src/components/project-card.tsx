"use client"

import Link from "next/link"
import { useState } from "react"
import { Pencil, Trash2 } from "lucide-react"
import { motion } from "motion/react"
import type { Project } from "@/lib/types"
import { useFlowStore } from "@/lib/store"
import { t } from "@/lib/i18n"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ProjectCardProps {
    project: Project
}

export function ProjectCard({ project }: ProjectCardProps) {
    const [isHovered, setIsHovered] = useState(false)
    const [showDeleteDialog, setShowDeleteDialog] = useState(false)
    const [showRenameDialog, setShowRenameDialog] = useState(false)
    const [newName, setNewName] = useState(project.name)
    const deleteProject = useFlowStore((s) => s.deleteProject)
    const renameProject = useFlowStore((s) => s.renameProject)

    const handleDelete = () => {
        deleteProject(project.id)
        setShowDeleteDialog(false)
    }

    const handleRename = () => {
        if (newName.trim()) {
            renameProject(project.id, newName.trim())
            setShowRenameDialog(false)
        }
    }

    return (
        <>
            <motion.div
                className="flex flex-col rounded-2xl flex-1 h-full w-full max-w-[40rem] transition-colors text-flow-text hover:bg-white/5"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
            >
                {/* Thumbnail */}
                <Link href={`/project/${project.id}`} className="block">
                    {project.thumbnail ? (
                        // Project thumbnails can be local data URLs, so Next image optimization is not applicable.
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                            src={project.thumbnail}
                            alt={project.name}
                            className="rounded-2xl outline outline-1 outline-white/5 bg-white/15 w-full aspect-video object-cover"
                        />
                    ) : (
                        <div className="rounded-2xl outline outline-1 outline-white/5 bg-white/15 w-full aspect-video" />
                    )}
                </Link>

                {/* Info row */}
                <div className="flex items-center justify-between px-1 py-1 pl-4">
                    <span className="flex items-center gap-2 text-base font-normal break-words hyphens-auto">
                        {project.name}
                        {/* Edit button (visible on hover) */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={() => {
                                        setNewName(project.name)
                                        setShowRenameDialog(true)
                                    }}
                                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-opacity ${isHovered ? "opacity-100" : "opacity-0"
                                        } hover:bg-white/15 active:bg-white/25`}
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent>{t("projects.editProject")}</TooltipContent>
                        </Tooltip>
                    </span>

                    {/* Delete button */}
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <button
                                onClick={() => setShowDeleteDialog(true)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center p-2 transition-opacity ${isHovered ? "opacity-100" : "opacity-0"
                                    } hover:bg-white/15 active:bg-white/25`}
                            >
                                <Trash2 className="w-4 h-4" />
                            </button>
                        </TooltipTrigger>
                        <TooltipContent>{t("projects.deleteProject")}</TooltipContent>
                    </Tooltip>
                </div>
            </motion.div>

            {/* Delete Dialog */}
            <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <DialogContent className="bg-[#1b1b1b] border-white/10 text-flow-text">
                    <DialogHeader>
                        <DialogTitle>{t("dialog.delete.title")}</DialogTitle>
                        <DialogDescription className="text-flow-text-muted">
                            {t("dialog.delete.description")}
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowDeleteDialog(false)}
                            className="text-flow-text hover:bg-white/10"
                        >
                            {t("dialog.cancel")}
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleDelete}
                        >
                            {t("dialog.confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rename Dialog */}
            <Dialog open={showRenameDialog} onOpenChange={setShowRenameDialog}>
                <DialogContent className="bg-[#1b1b1b] border-white/10 text-flow-text">
                    <DialogHeader>
                        <DialogTitle>{t("dialog.rename.title")}</DialogTitle>
                    </DialogHeader>
                    <Input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder={t("dialog.rename.placeholder")}
                        className="bg-white/5 border-white/10 text-flow-text"
                        onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        autoFocus
                    />
                    <DialogFooter>
                        <Button
                            variant="ghost"
                            onClick={() => setShowRenameDialog(false)}
                            className="text-flow-text hover:bg-white/10"
                        >
                            {t("dialog.cancel")}
                        </Button>
                        <Button onClick={handleRename}>
                            {t("dialog.confirm")}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}
