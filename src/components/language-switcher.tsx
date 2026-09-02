"use client"

import { Globe2 } from "lucide-react"
import { useI18n, supportedLocales, type Locale } from "@/lib/i18n"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip"

const localeKeys = {
    en: "language.en",
    "pt-BR": "language.pt-BR",
    es: "language.es",
} as const

export function LanguageSwitcher() {
    const { locale, setLocale, t } = useI18n()

    return (
        <DropdownMenu>
            <Tooltip>
                <TooltipTrigger asChild>
                    <DropdownMenuTrigger asChild>
                        <button
                            type="button"
                            aria-label={t("language.change")}
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white/55 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
                        >
                            <Globe2 className="h-[1.125rem] w-[1.125rem]" />
                        </button>
                    </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{t("language.change")}</TooltipContent>
            </Tooltip>
            <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="min-w-44 border-white/10 bg-[rgba(22,23,24,0.96)] p-1.5 text-white shadow-2xl backdrop-blur-2xl ring-1 ring-white/10"
            >
                <DropdownMenuLabel className="px-2 py-1.5 text-[0.6875rem] uppercase tracking-[0.14em] text-white/40">
                    {t("language.label")}
                </DropdownMenuLabel>
                <DropdownMenuRadioGroup
                    value={locale}
                    onValueChange={(value) => setLocale(value as Locale)}
                >
                    {supportedLocales.map((option) => (
                        <DropdownMenuRadioItem
                            key={option}
                            value={option}
                            className="cursor-pointer rounded-lg px-2.5 py-2 text-sm text-white/75 outline-none focus:bg-white/10 focus:text-white"
                        >
                            {t(localeKeys[option])}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
