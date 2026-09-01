const ptBR = {
    // App
    "app.name": "Flow",
    "app.description": "Ferramenta de filmmaking com IA que permite criar clipes e cenas cinematográficas",
    "app.disclaimer": "Flow pode cometer erros, então confira novamente",

    // Navigation
    "nav.goBack": "Voltar",
    "nav.moreOptions": "Mais opções",
    "nav.helpCenter": "Central de Ajuda",

    // Projects page
    "projects.newProject": "Novo projeto",
    "projects.editProject": "Editar projeto",
    "projects.deleteProject": "Excluir projeto",
    "projects.noProjects": "Nenhum projeto ainda",
    "projects.createFirst": "Crie seu primeiro projeto",

    // Project detail
    "project.search": "Buscar",
    "project.sortFilter": "Ordenar & Filtrar",
    "project.filters": "Filtros",
    "project.filterType": "Tipo",
    "project.filterProportion": "Proporção",
    "project.filterCreationDate": "Data de criação",
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
    "project.filterResults": "Resultados",
    "project.addMedia": "Adicionar Mídia",
    "project.scenebuilder": "Scenebuilder",
    "project.gridSettings": "Config. de Grid",
    "project.more": "Mais",
    "project.viewDashboard": "Ver dashboard completo",
    "project.viewImages": "Ver imagens",
    "project.reusePrompt": "Reutilizar prompt",

    // Generation
    "generation.create": "Criar",
    "generation.clearPrompt": "Limpar prompt",
    "generation.promptPlaceholder": "Descreva o que você quer criar...",
    "generation.generating": "Gerando...",
    "generation.model": "Modelo",

    // Media
    "media.upload": "Upload de imagem",
    "media.recent": "Recente",
    "media.delete": "Excluir",
    "media.download": "Baixar",

    // Dialog
    "dialog.cancel": "Cancelar",
    "dialog.confirm": "Confirmar",
    "dialog.delete.title": "Excluir projeto",
    "dialog.delete.description": "Tem certeza que deseja excluir este projeto? Esta ação não pode ser desfeita.",
    "dialog.rename.title": "Renomear projeto",
    "dialog.rename.placeholder": "Nome do projeto",
    "dialog.newProject.title": "Novo projeto",
    "dialog.newProject.placeholder": "Nome do projeto",
} as const

export type TranslationKey = keyof typeof ptBR

const translations: Record<string, Record<string, string>> = {
    "pt-BR": ptBR,
}

const currentLocale = "pt-BR"

export function t(key: TranslationKey): string {
    return translations[currentLocale]?.[key] ?? key
}

export default translations
