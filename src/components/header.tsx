"use client"

import Link from "next/link"
import { useI18n } from "@/lib/i18n"
import { LanguageSwitcher } from "@/components/language-switcher"

export function Header() {
    const { t } = useI18n()

    return (
        <header className="fixed top-0 left-0 right-0 z-10 flex items-center justify-between gap-4 px-6 h-20 min-h-20 text-flow-text">
            {/* Left side - breadcrumb */}
            <nav className="flex items-center gap-2 flex-1 min-w-0">
                <ol className="flex items-center gap-2 font-medium text-base min-w-0">
                    <li className="flex items-center gap-1">
                        <Link
                            href="/"
                            className="flex items-center gap-1 text-flow-text hover:text-white transition-colors whitespace-nowrap"
                        >
                            {t("app.name")}
                        </Link>
                    </li>
                </ol>
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-2">
                <LanguageSwitcher />
                <button aria-label={t("nav.userMenu")} className="flex items-center gap-2 p-2">
                    <div className="w-8 h-8 rounded-full bg-white/15 flex items-center justify-center text-xs font-medium uppercase text-flow-text-secondary">
                        U
                    </div>
                </button>
            </div>
        </header>
    )
}
