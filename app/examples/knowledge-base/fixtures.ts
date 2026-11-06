import type { SceneLocale } from "@/app/catalog/scene-types"
import type { KnowledgeSource, KnowledgeSourceType } from "@/registry/lib/knowledge-base"
import type { KnowledgeBaseLabels, KnowledgeBaseStatus } from "@/registry/ui/knowledge-base"

export const types: KnowledgeSourceType[] = [
  { id: "docs", label: "Documentos", hint: "Carpeta interna · cada mañana", glyph: "docs" },
  { id: "repo", label: "Repositorio", hint: "Plantillas del taller", glyph: "repo" },
  { id: "help", label: "Centro de ayuda", hint: "Artículos publicados", glyph: "help" },
  { id: "notes", label: "Notas", hint: "Notas de junta", glyph: "notes" },
]

export const filled: KnowledgeSource[] = [
  { id: "manual", typeId: "docs", name: "Manual de ventas", detail: "Carpeta interna · cada mañana", status: "connected", chunks: 1224 },
  { id: "plantillas", typeId: "repo", name: "Plantillas del taller", detail: "Repositorio interno", status: "syncing", chunks: 640, progress: 42 },
  { id: "ayuda", typeId: "help", name: "Centro de ayuda", detail: "Artículos del taller", status: "error", chunks: 80, error: "La sincronización se cortó a la mitad." },
  { id: "notas", typeId: "notes", name: "Notas de junta", detail: "Notas semanales", status: "stale", chunks: 210 },
]

export const empty: KnowledgeSource[] = []
export const loading = filled
export const error = filled
export const syncing: KnowledgeSource[] = filled.map((source) =>
  source.id === "plantillas"
    ? source
    : {
        id: source.id,
        typeId: source.typeId,
        name: source.name,
        detail: source.detail,
        status: "connected",
        chunks: source.chunks,
      },
)

export type KnowledgeScene = {
  sources: readonly KnowledgeSource[]
  status: KnowledgeBaseStatus
  error?: { es: string; en: string }
}

export const scenesData = {
  filled: { sources: filled, status: "ready" },
  empty: { sources: empty, status: "ready" },
  loading: { sources: loading, status: "loading" },
  error: {
    sources: error,
    status: "error",
    error: { es: "No se pudo leer el catálogo de fuentes.", en: "The source catalog could not be read." },
  },
  syncing: { sources: syncing, status: "ready" },
} as const satisfies Record<string, KnowledgeScene>

export function knowledgeLabels(locale: SceneLocale): Partial<KnowledgeBaseLabels> {
  if (locale === "en") return {}
  return {
    title: "Base de conocimiento",
    chunks: "fragmentos",
    connect: "Conectar",
    disconnect: "Desconectar",
    retry: "Reintentar",
    sync: "Sincronizar",
    reset: "Restablecer",
    resetTitle: "¿Restablecer la base?",
    resetBody: "Las fuentes vuelven a desconectadas y el contador de fragmentos queda en cero.",
    resetConfirm: "Restablecer la base",
    cancel: "Cancelar",
    add: "Conectar fuente",
    name: "Nombre de la fuente",
    type: "Tipo de fuente",
    emptyTitle: "Sin fuentes",
    emptyDescription: "Conecta documentos, un repositorio o notas para empezar a indexar.",
    loading: "Cargando fuentes",
    errorTitle: "La base no cargó",
    indexing: (count) => (count === 1 ? "Indexando 1 fuente" : `Indexando ${count} fuentes`),
    ready: (sources, chunks) => `Lista. ${sources} fuentes, ${chunks} fragmentos.`,
    idle: "Todavía no hay nada conectado.",
    chunksLive: (chunks) => `${chunks} fragmentos`,
    connectedToast: (name, chunks) => `${name} conectada. ${chunks} fragmentos`,
    errorToast: (name) => `${name} no se pudo conectar`,
    resetToast: "La base quedó vacía",
    toasts: "Avisos",
    status: {
      disconnected: "Desconectada",
      connecting: "Conectando",
      syncing: "Sincronizando",
      connected: "Conectada",
      error: "Error",
      stale: "Desactualizada",
    },
  }
}

export function knowledgeLocale(locale: SceneLocale) {
  return locale === "en" ? "en-US" : "es-MX"
}
