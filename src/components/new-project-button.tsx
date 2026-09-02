"use client"

import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { useFlowStore } from "@/lib/store"
import { localeForIntl, useI18n, type Locale } from "@/lib/i18n"

function generateProjectName(locale: Locale, t: ReturnType<typeof useI18n>["t"]): string {
    const now = new Date()
    const monthName = now.toLocaleString(localeForIntl(locale), { month: "short" }).replace(".", "")
    const month = monthName.charAt(0).toUpperCase() + monthName.slice(1)
    const day = now.getDate().toString().padStart(2, "0")
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    return t("projects.defaultName", { month, day, time: `${hours}:${minutes}` })
}

export function NewProjectButton() {
    const { locale, t } = useI18n()
    const createProject = useFlowStore((s) => s.createProject)
    const router = useRouter()

    const handleCreate = async () => {
        const name = generateProjectName(locale, t)
        const project = await createProject(name)
        router.push(`/project/${project.id}`)
    }

    return (
        <button
            onClick={handleCreate}
            className="fixed bottom-14 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 rounded-[32px] w-48 h-32 bg-white/25 text-white/75 border border-white/15 backdrop-blur-[80px] font-normal text-base transition-transform hover:-translate-y-2 cursor-pointer"
        >
            <Plus className="w-[1.125rem] h-[1.125rem]" fill="currentColor" />
            {t("projects.newProject")}
        </button>
    )
}
