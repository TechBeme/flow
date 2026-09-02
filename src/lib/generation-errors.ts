import type { TranslationKey } from "@/lib/i18n"

const KNOWN_GENERATION_ERRORS: Array<[RegExp, TranslationKey]> = [
    [/VIDEO_IDENTIFIER_MISSING/i, "error.videoIdentifier"],
    [/VIDEO_FILE_MISSING/i, "error.videoFile"],
    [/VIDEO_GENERATION_TIMEOUT/i, "error.videoTimeout"],
    [/IMAGE_SAFETY/i, "error.imageSafety"],
    [/IMAGE_OTHER/i, "error.imageOther"],
    [/BLOCKLIST/i, "error.blocklist"],
    [/RECITATION/i, "error.recitation"],
    [/\bSPII\b/i, "error.sensitiveInfo"],
    [/\bLANGUAGE\b/i, "error.language"],
    [/EMPTY_RESPONSE/i, "error.emptyResponse"],
    [/AbortError|timed out|demorou demais|tard[oó] demasiado/i, "error.timeout"],
    [/IMAGE_PROHIBITED_CONTENT|PROHIBITED_CONTENT|safety|seguran[cç]a|seguridad/i, "error.safety"],
    [/Resource has been exhausted|quota|cota|cuota/i, "error.quota"],
    [/Failed to fetch|connect|conectar|conexi[oó]n/i, "error.connection"],
]

export function getGenerationErrorKey(error: unknown): TranslationKey {
    if (!error) return "error.generationFailed"

    const message = error instanceof Error ? error.message : String(error)
    const knownError = KNOWN_GENERATION_ERRORS.find(([pattern]) => pattern.test(message))

    return knownError?.[1] ?? "error.generationFailed"
}
