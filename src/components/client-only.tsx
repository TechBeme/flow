"use client"

import { useSyncExternalStore, type ReactNode } from "react"

const subscribe = () => () => undefined

export function ClientOnly({ children }: { children: ReactNode }) {
    const isClient = useSyncExternalStore(subscribe, () => true, () => false)
    if (!isClient) return null
    return <>{children}</>
}
