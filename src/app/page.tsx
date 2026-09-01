"use client"

import { useEffect } from "react"
import { useFlowStore } from "@/lib/store"
import { Header } from "@/components/header"
import { ProjectCard } from "@/components/project-card"
import { NewProjectButton } from "@/components/new-project-button"
import { ClientOnly } from "@/components/client-only"

export default function HomePage() {
  return (
    <ClientOnly>
      <HomeContent />
    </ClientOnly>
  )
}

function HomeContent() {
  const projects = useFlowStore((s) => s.projects)
  const loadProjects = useFlowStore((s) => s.loadProjects)

  useEffect(() => {
    loadProjects()
  }, [loadProjects])

  return (
    <div className="flex flex-col h-full">
      <Header />

      {/* Gradient overlay at top */}
      <div className="fixed inset-x-0 top-0 h-40 pointer-events-none z-[1] bg-gradient-to-b from-[#0d0d0d] to-transparent" />

      {/* Main content */}
      <main className="flex-1 pt-20">
        <div className="px-4 md:px-6">
          {/* Project grid */}
          <div className="flex flex-col gap-4 w-full">
            {chunkArray(projects, 3).map((row, rowIndex) => (
              <div
                key={rowIndex}
                className="flex flex-row justify-center gap-4 px-4 md:px-6 pb-4"
              >
                {row.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
                {row.length < 3 &&
                  Array.from({ length: 3 - row.length }).map((_, i) => (
                    <div key={`empty-${i}`} className="flex-1 max-w-[40rem]" />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </main>

      <NewProjectButton />
    </div>
  )
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    chunks.push(arr.slice(i, i + size))
  }
  return chunks
}
