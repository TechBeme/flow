const KNOWN_GENERATION_ERRORS: Array<[RegExp, string]> = [
    [
        /IMAGE_PROHIBITED_CONTENT/i,
        "Conteudo bloqueado pela politica de seguranca.",
    ],
    [
        /Resource has been exhausted|quota/i,
        "Cota esgotada. Verifique os creditos ou tente novamente mais tarde.",
    ],
]

export function getGenerationErrorMessage(error: unknown): string | null {
    if (!error) return null

    const message = error instanceof Error ? error.message : String(error)
    const knownError = KNOWN_GENERATION_ERRORS.find(([pattern]) => pattern.test(message))

    return knownError?.[1] ?? null
}
