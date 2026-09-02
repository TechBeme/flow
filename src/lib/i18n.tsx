"use client"

import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
    type ReactNode,
} from "react"

export const supportedLocales = ["en", "pt-BR", "es"] as const
export type Locale = (typeof supportedLocales)[number]

const en = {
    "meta.title": "Flow - Open-source AI image and video studio",
    "meta.description": "Create AI images and cinematic videos through APIs in one open-source workspace, with support for Nano Banana, Omni, and Veo.",

    "app.name": "Flow",
    "app.description": "AI filmmaking workspace for creating cinematic images, clips, and scenes",
    "app.disclaimer": "Flow can make mistakes, so double-check the results",

    "language.label": "Language",
    "language.change": "Change language",
    "language.en": "English",
    "language.pt-BR": "Português",
    "language.es": "Español",

    "nav.goBack": "Go back",
    "nav.moreOptions": "More options",
    "nav.helpCenter": "Help Center",
    "nav.userMenu": "User menu",
    "nav.gridSize": "Grid size",

    "projects.newProject": "New project",
    "projects.editProject": "Edit project",
    "projects.deleteProject": "Delete project",
    "projects.noProjects": "No projects yet",
    "projects.createFirst": "Create your first project",
    "projects.defaultName": "{month} {day} - {time}",

    "project.search": "Search",
    "project.sortFilter": "Sort & filter",
    "project.filters": "Filters",
    "project.filterType": "Type",
    "project.filterProportion": "Aspect ratio",
    "project.filterCreationDate": "Source",
    "project.filterSortBy": "Sort by",
    "project.filterImages": "Images",
    "project.filterVideos": "Videos",
    "project.filterCollections": "Collections",
    "project.filterLandscape": "Landscape",
    "project.filterPortrait": "Portrait",
    "project.filterFreeform": "Freeform",
    "project.filterGenerated": "Generated",
    "project.filterUploaded": "Uploaded",
    "project.filterFavorites": "Favorites",
    "project.filterNewest": "Newest",
    "project.filterOldest": "Oldest",
    "project.filterResults": "{count} results",
    "project.addMedia": "Add media",
    "project.scenebuilder": "Scenebuilder",
    "project.gridSettings": "Grid settings",
    "project.more": "More",
    "project.viewDashboard": "View full dashboard",
    "project.viewImages": "View images",
    "project.reusePrompt": "Reuse prompt",
    "project.rename": "Rename",
    "project.delete": "Delete",
    "project.saveName": "Save project name",
    "project.cancelRename": "Cancel renaming",
    "project.loadError": "Could not load the project. Try refreshing the page.",

    "generation.create": "Create",
    "generation.clearPrompt": "Clear prompt",
    "generation.promptPlaceholder": "Describe what you want to create...",
    "generation.generating": "Generating...",
    "generation.model": "Model",
    "generation.image": "Image",
    "generation.video": "Video",
    "generation.auto": "Auto",
    "generation.fast": "Fast",
    "generation.precise": "Precise",
    "generation.dropReference": "Drop to use as a reference",
    "generation.dropImage": "Drop the image here",
    "generation.attachImage": "Attach image",
    "generation.removeReference": "Remove reference image",
    "generation.settings": "Generation settings",
    "generation.submit": "Start generation",
    "generation.decreaseCount": "Decrease image count",
    "generation.increaseCount": "Increase image count",

    "media.upload": "Upload image",
    "media.recent": "Recent",
    "media.delete": "Delete",
    "media.download": "Download",
    "media.empty": "No media yet. Click + to create.",
    "media.open": "Open media",
    "media.generationError": "Generation failed",

    "lightbox.resetZoom": "Reset",
    "lightbox.image": "Image",
    "lightbox.video": "Video",
    "lightbox.zoomIn": "Zoom in",
    "lightbox.zoomOut": "Zoom out",
    "lightbox.previous": "Previous media",
    "lightbox.next": "Next media",
    "lightbox.close": "Close viewer",
    "lightbox.item": "Open item {current} of {total}",

    "dialog.close": "Close",
    "dialog.cancel": "Cancel",
    "dialog.confirm": "Confirm",
    "dialog.delete.title": "Delete project",
    "dialog.delete.description": "Are you sure you want to delete this project? This action cannot be undone.",
    "dialog.rename.title": "Rename project",
    "dialog.rename.placeholder": "Project name",
    "dialog.newProject.title": "New project",
    "dialog.newProject.placeholder": "Project name",

    "error.http": "Request failed with status {status}.",
    "error.generationFailed": "Generation failed. Try again.",
    "error.apiNotConfigured": "The generation API is not configured. Configure the required credentials to generate images and videos.",
    "error.apiAuthentication": "The generation API could not authenticate. Check the configured API credentials.",
    "error.safety": "Content blocked by the safety policy.",
    "error.quota": "Quota exhausted. Check your API limits and try again later.",
    "error.imageSafety": "The image was blocked by Google's usage policies. Rephrase the prompt or use another reference image.",
    "error.imageOther": "The model could not generate an image from this prompt. Rephrase it or use a compatible reference image.",
    "error.blocklist": "The prompt contains blocked terms. Try rephrasing it.",
    "error.recitation": "The response was blocked for reproducing protected content. Try rephrasing the prompt.",
    "error.sensitiveInfo": "The content was blocked because it contains sensitive personal information.",
    "error.language": "The model does not support the language used. Try another language.",
    "error.emptyResponse": "The model returned an empty response. Try again.",
    "error.timeout": "Generation took too long and was canceled. Try again.",
    "error.connection": "Could not connect to the generation API. Try again.",
    "error.videoIdentifier": "The API did not return a video generation identifier.",
    "error.videoFile": "The API completed the generation without returning a video file.",
    "error.videoTimeout": "Video generation took longer than 15 minutes.",
} as const

export type TranslationKey = keyof typeof en
type Dictionary = Record<TranslationKey, string>
type TranslationParams = Record<string, string | number>

const ptBR: Dictionary = {
    "meta.title": "Flow - Estúdio open source de imagens e vídeos com IA",
    "meta.description": "Crie imagens com IA e vídeos cinematográficos via APIs em um workspace open source, com suporte a Nano Banana, Omni e Veo.",

    "app.name": "Flow",
    "app.description": "Workspace de filmmaking com IA para criar imagens, clipes e cenas cinematográficas",
    "app.disclaimer": "O Flow pode cometer erros, então confira os resultados",

    "language.label": "Idioma",
    "language.change": "Alterar idioma",
    "language.en": "English",
    "language.pt-BR": "Português",
    "language.es": "Español",

    "nav.goBack": "Voltar",
    "nav.moreOptions": "Mais opções",
    "nav.helpCenter": "Central de Ajuda",
    "nav.userMenu": "Menu do usuário",
    "nav.gridSize": "Tamanho do grid",

    "projects.newProject": "Novo projeto",
    "projects.editProject": "Editar projeto",
    "projects.deleteProject": "Excluir projeto",
    "projects.noProjects": "Nenhum projeto ainda",
    "projects.createFirst": "Crie seu primeiro projeto",
    "projects.defaultName": "{day} de {month} - {time}",

    "project.search": "Buscar",
    "project.sortFilter": "Ordenar e filtrar",
    "project.filters": "Filtros",
    "project.filterType": "Tipo",
    "project.filterProportion": "Proporção",
    "project.filterCreationDate": "Origem",
    "project.filterSortBy": "Ordenar por",
    "project.filterImages": "Imagens",
    "project.filterVideos": "Vídeos",
    "project.filterCollections": "Coleções",
    "project.filterLandscape": "Paisagem",
    "project.filterPortrait": "Retrato",
    "project.filterFreeform": "Formato livre",
    "project.filterGenerated": "Gerada",
    "project.filterUploaded": "Enviada",
    "project.filterFavorites": "Favoritos",
    "project.filterNewest": "Mais recentes",
    "project.filterOldest": "Mais antigos",
    "project.filterResults": "{count} resultados",
    "project.addMedia": "Adicionar mídia",
    "project.scenebuilder": "Scenebuilder",
    "project.gridSettings": "Configurações do grid",
    "project.more": "Mais",
    "project.viewDashboard": "Ver dashboard completo",
    "project.viewImages": "Ver imagens",
    "project.reusePrompt": "Reutilizar prompt",
    "project.rename": "Renomear",
    "project.delete": "Excluir",
    "project.saveName": "Salvar nome do projeto",
    "project.cancelRename": "Cancelar renomeação",
    "project.loadError": "Não foi possível carregar o projeto. Tente atualizar a página.",

    "generation.create": "Criar",
    "generation.clearPrompt": "Limpar prompt",
    "generation.promptPlaceholder": "Descreva o que você quer criar...",
    "generation.generating": "Gerando...",
    "generation.model": "Modelo",
    "generation.image": "Imagem",
    "generation.video": "Vídeo",
    "generation.auto": "Auto",
    "generation.fast": "Rápido",
    "generation.precise": "Preciso",
    "generation.dropReference": "Solte para usar como referência",
    "generation.dropImage": "Solte a imagem aqui",
    "generation.attachImage": "Anexar imagem",
    "generation.removeReference": "Remover imagem de referência",
    "generation.settings": "Configurações de geração",
    "generation.submit": "Iniciar geração",
    "generation.decreaseCount": "Diminuir quantidade de imagens",
    "generation.increaseCount": "Aumentar quantidade de imagens",

    "media.upload": "Upload de imagem",
    "media.recent": "Recente",
    "media.delete": "Excluir",
    "media.download": "Baixar",
    "media.empty": "Nenhuma mídia ainda. Clique em + para criar.",
    "media.open": "Abrir mídia",
    "media.generationError": "Erro ao gerar",

    "lightbox.resetZoom": "Redefinir",
    "lightbox.image": "Imagem",
    "lightbox.video": "Vídeo",
    "lightbox.zoomIn": "Ampliar",
    "lightbox.zoomOut": "Reduzir",
    "lightbox.previous": "Mídia anterior",
    "lightbox.next": "Próxima mídia",
    "lightbox.close": "Fechar visualização",
    "lightbox.item": "Abrir item {current} de {total}",

    "dialog.close": "Fechar",
    "dialog.cancel": "Cancelar",
    "dialog.confirm": "Confirmar",
    "dialog.delete.title": "Excluir projeto",
    "dialog.delete.description": "Tem certeza de que deseja excluir este projeto? Esta ação não pode ser desfeita.",
    "dialog.rename.title": "Renomear projeto",
    "dialog.rename.placeholder": "Nome do projeto",
    "dialog.newProject.title": "Novo projeto",
    "dialog.newProject.placeholder": "Nome do projeto",

    "error.http": "A solicitação falhou com o status {status}.",
    "error.generationFailed": "Não foi possível gerar. Tente novamente.",
    "error.apiNotConfigured": "A API de geração não está configurada. Configure as credenciais necessárias para gerar imagens e vídeos.",
    "error.apiAuthentication": "A API de geração não conseguiu autenticar. Confira as credenciais configuradas.",
    "error.safety": "Conteúdo bloqueado pela política de segurança.",
    "error.quota": "Cota esgotada. Confira os limites da API e tente novamente mais tarde.",
    "error.imageSafety": "A imagem foi bloqueada pelas políticas de uso do Google. Reformule o prompt ou use outra imagem de referência.",
    "error.imageOther": "O modelo não conseguiu gerar uma imagem com esse prompt. Reformule-o ou use uma imagem de referência compatível.",
    "error.blocklist": "O prompt contém termos bloqueados. Tente reformulá-lo.",
    "error.recitation": "A resposta foi bloqueada por reproduzir conteúdo protegido. Tente reformular o prompt.",
    "error.sensitiveInfo": "O conteúdo foi bloqueado por conter informações pessoais sensíveis.",
    "error.language": "O idioma usado não é suportado pelo modelo. Tente outro idioma.",
    "error.emptyResponse": "O modelo retornou uma resposta vazia. Tente novamente.",
    "error.timeout": "A geração demorou demais e foi cancelada. Tente novamente.",
    "error.connection": "Não foi possível conectar à API de geração. Tente novamente.",
    "error.videoIdentifier": "A API não retornou um identificador para a geração do vídeo.",
    "error.videoFile": "A API concluiu a geração sem retornar o arquivo de vídeo.",
    "error.videoTimeout": "A geração do vídeo demorou mais de 15 minutos.",
}

const es: Dictionary = {
    "meta.title": "Flow - Estudio open source de imágenes y videos con IA",
    "meta.description": "Crea imágenes con IA y videos cinematográficos mediante APIs en un espacio de trabajo open source compatible con Nano Banana, Omni y Veo.",

    "app.name": "Flow",
    "app.description": "Espacio de filmmaking con IA para crear imágenes, clips y escenas cinematográficas",
    "app.disclaimer": "Flow puede cometer errores, así que revisa los resultados",

    "language.label": "Idioma",
    "language.change": "Cambiar idioma",
    "language.en": "English",
    "language.pt-BR": "Português",
    "language.es": "Español",

    "nav.goBack": "Volver",
    "nav.moreOptions": "Más opciones",
    "nav.helpCenter": "Centro de ayuda",
    "nav.userMenu": "Menú de usuario",
    "nav.gridSize": "Tamaño de la cuadrícula",

    "projects.newProject": "Nuevo proyecto",
    "projects.editProject": "Editar proyecto",
    "projects.deleteProject": "Eliminar proyecto",
    "projects.noProjects": "Aún no hay proyectos",
    "projects.createFirst": "Crea tu primer proyecto",
    "projects.defaultName": "{day} de {month} - {time}",

    "project.search": "Buscar",
    "project.sortFilter": "Ordenar y filtrar",
    "project.filters": "Filtros",
    "project.filterType": "Tipo",
    "project.filterProportion": "Proporción",
    "project.filterCreationDate": "Origen",
    "project.filterSortBy": "Ordenar por",
    "project.filterImages": "Imágenes",
    "project.filterVideos": "Videos",
    "project.filterCollections": "Colecciones",
    "project.filterLandscape": "Horizontal",
    "project.filterPortrait": "Vertical",
    "project.filterFreeform": "Formato libre",
    "project.filterGenerated": "Generada",
    "project.filterUploaded": "Subida",
    "project.filterFavorites": "Favoritos",
    "project.filterNewest": "Más recientes",
    "project.filterOldest": "Más antiguos",
    "project.filterResults": "{count} resultados",
    "project.addMedia": "Agregar contenido",
    "project.scenebuilder": "Scenebuilder",
    "project.gridSettings": "Configuración de cuadrícula",
    "project.more": "Más",
    "project.viewDashboard": "Ver panel completo",
    "project.viewImages": "Ver imágenes",
    "project.reusePrompt": "Reutilizar prompt",
    "project.rename": "Renombrar",
    "project.delete": "Eliminar",
    "project.saveName": "Guardar nombre del proyecto",
    "project.cancelRename": "Cancelar cambio de nombre",
    "project.loadError": "No se pudo cargar el proyecto. Intenta actualizar la página.",

    "generation.create": "Crear",
    "generation.clearPrompt": "Borrar prompt",
    "generation.promptPlaceholder": "Describe lo que quieres crear...",
    "generation.generating": "Generando...",
    "generation.model": "Modelo",
    "generation.image": "Imagen",
    "generation.video": "Video",
    "generation.auto": "Auto",
    "generation.fast": "Rápido",
    "generation.precise": "Preciso",
    "generation.dropReference": "Suelta para usar como referencia",
    "generation.dropImage": "Suelta la imagen aquí",
    "generation.attachImage": "Adjuntar imagen",
    "generation.removeReference": "Eliminar imagen de referencia",
    "generation.settings": "Configuración de generación",
    "generation.submit": "Iniciar generación",
    "generation.decreaseCount": "Reducir cantidad de imágenes",
    "generation.increaseCount": "Aumentar cantidad de imágenes",

    "media.upload": "Subir imagen",
    "media.recent": "Reciente",
    "media.delete": "Eliminar",
    "media.download": "Descargar",
    "media.empty": "Aún no hay contenido. Haz clic en + para crear.",
    "media.open": "Abrir contenido",
    "media.generationError": "Error al generar",

    "lightbox.resetZoom": "Restablecer",
    "lightbox.image": "Imagen",
    "lightbox.video": "Video",
    "lightbox.zoomIn": "Acercar",
    "lightbox.zoomOut": "Alejar",
    "lightbox.previous": "Contenido anterior",
    "lightbox.next": "Contenido siguiente",
    "lightbox.close": "Cerrar visor",
    "lightbox.item": "Abrir elemento {current} de {total}",

    "dialog.close": "Cerrar",
    "dialog.cancel": "Cancelar",
    "dialog.confirm": "Confirmar",
    "dialog.delete.title": "Eliminar proyecto",
    "dialog.delete.description": "¿Seguro que quieres eliminar este proyecto? Esta acción no se puede deshacer.",
    "dialog.rename.title": "Renombrar proyecto",
    "dialog.rename.placeholder": "Nombre del proyecto",
    "dialog.newProject.title": "Nuevo proyecto",
    "dialog.newProject.placeholder": "Nombre del proyecto",

    "error.http": "La solicitud falló con el estado {status}.",
    "error.generationFailed": "No se pudo generar. Inténtalo de nuevo.",
    "error.apiNotConfigured": "La API de generación no está configurada. Configura las credenciales necesarias para generar imágenes y videos.",
    "error.apiAuthentication": "La API de generación no pudo autenticarse. Revisa las credenciales configuradas.",
    "error.safety": "Contenido bloqueado por la política de seguridad.",
    "error.quota": "Cuota agotada. Revisa los límites de la API e inténtalo más tarde.",
    "error.imageSafety": "La imagen fue bloqueada por las políticas de uso de Google. Reformula el prompt o usa otra imagen de referencia.",
    "error.imageOther": "El modelo no pudo generar una imagen con este prompt. Reformúlalo o usa una imagen de referencia compatible.",
    "error.blocklist": "El prompt contiene términos bloqueados. Intenta reformularlo.",
    "error.recitation": "La respuesta fue bloqueada por reproducir contenido protegido. Intenta reformular el prompt.",
    "error.sensitiveInfo": "El contenido fue bloqueado porque contiene información personal sensible.",
    "error.language": "El modelo no admite el idioma utilizado. Prueba con otro idioma.",
    "error.emptyResponse": "El modelo devolvió una respuesta vacía. Inténtalo de nuevo.",
    "error.timeout": "La generación tardó demasiado y se canceló. Inténtalo de nuevo.",
    "error.connection": "No se pudo conectar con la API de generación. Inténtalo de nuevo.",
    "error.videoIdentifier": "La API no devolvió un identificador para la generación del video.",
    "error.videoFile": "La API completó la generación sin devolver el archivo de video.",
    "error.videoTimeout": "La generación del video tardó más de 15 minutos.",
}

export const translations: Record<Locale, Dictionary> = { en, "pt-BR": ptBR, es }

const STORAGE_KEY = "flow.locale"

function normalizeLocale(value: string | null | undefined): Locale | null {
    if (!value) return null
    const normalized = value.toLowerCase()
    if (normalized.startsWith("pt")) return "pt-BR"
    if (normalized.startsWith("es")) return "es"
    if (normalized.startsWith("en")) return "en"
    return null
}

export function detectLocale(): Locale {
    if (typeof window === "undefined") return "en"

    let persisted: Locale | null = null
    try {
        persisted = normalizeLocale(window.localStorage.getItem(STORAGE_KEY))
    } catch {
        // Some privacy modes disable local storage; browser detection still works.
    }
    if (persisted) return persisted

    for (const language of navigator.languages ?? [navigator.language]) {
        const locale = normalizeLocale(language)
        if (locale) return locale
    }

    return "en"
}

function translate(locale: Locale, key: TranslationKey, params?: TranslationParams): string {
    const template = translations[locale][key] ?? translations.en[key] ?? key
    if (!params) return template

    return template.replace(/\{(\w+)\}/g, (match, name: string) =>
        params[name] === undefined ? match : String(params[name])
    )
}

interface I18nContextValue {
    locale: Locale
    setLocale: (locale: Locale) => void
    t: (key: TranslationKey, params?: TranslationParams) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
    const [locale, setLocaleState] = useState<Locale>(detectLocale)

    const setLocale = useCallback((nextLocale: Locale) => {
        setLocaleState(nextLocale)
        try {
            window.localStorage.setItem(STORAGE_KEY, nextLocale)
        } catch {
            // Keep the current session reactive even when persistence is unavailable.
        }
    }, [])

    useEffect(() => {
        document.documentElement.lang = locale
        document.title = translate(locale, "meta.title")
        document.querySelector<HTMLMetaElement>('meta[name="description"]')?.setAttribute(
            "content",
            translate(locale, "meta.description")
        )
    }, [locale])

    const value = useMemo<I18nContextValue>(() => ({
        locale,
        setLocale,
        t: (key, params) => translate(locale, key, params),
    }), [locale, setLocale])

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
    const context = useContext(I18nContext)
    if (!context) throw new Error("useI18n must be used inside I18nProvider")
    return context
}

export function localeForIntl(locale: Locale): string {
    return locale === "en" ? "en-US" : locale
}

export default translations
