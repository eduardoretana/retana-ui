import type { SceneLocale } from "@/app/catalog/scene-types"
import type { StatusTone } from "@/registry/ui/status-pill"

export type LotStatus = "running" | "paused" | "failed" | "done"

export type Lot = {
  id: string
  name: string
  status: LotStatus
  trend: number[]
}

export type SummarySeed = {
  id: string
  es: string
  en: string
  value: number
  sparkline?: number[]
}

export type TableKind = "data" | "expandable" | "work" | "adaptive"

export type TableMode = "filled" | "empty" | "loading" | "error" | "zeros"

export type TableSceneSpec = {
  mode: TableMode
  kind: TableKind
  narrow?: boolean
}

const statusText: Record<LotStatus, { tone: StatusTone; es: string; en: string }> = {
  running: { tone: "info", es: "En curso", en: "Running" },
  paused: { tone: "warning", es: "En pausa", en: "Paused" },
  failed: { tone: "critical", es: "Falló", en: "Failed" },
  done: { tone: "positive", es: "Listo", en: "Done" },
}

const actionText = [
  { id: "resume", es: "Reanudar", en: "Resume" },
  { id: "retry", es: "Reintentar", en: "Retry" },
  { id: "approve", es: "Aprobar", en: "Approve" },
  { id: "note", es: "Anotar", en: "Note" },
] as const

const actionIds: Record<LotStatus, readonly string[]> = {
  paused: ["resume", "retry", "approve", "note"],
  failed: ["retry", "approve"],
  running: ["approve"],
  done: [],
}

export const lots: Lot[] = [
  { id: "serie-a", name: "Serie A", status: "paused", trend: [3, 4, 4, 5, 4] },
  { id: "serie-b", name: "Serie B", status: "failed", trend: [6, 5, 3, 2, 1] },
  { id: "serie-c", name: "Serie C", status: "running", trend: [1, 2, 2, 3, 4] },
  { id: "serie-d", name: "Serie D", status: "done", trend: [2, 2, 2, 2, 2] },
]

const figures: SummarySeed[] = [
  { id: "series", es: "Series", en: "Series", value: 4, sparkline: [1, 2, 2, 3, 4] },
  { id: "running", es: "En curso", en: "Running", value: 1, sparkline: [0, 1, 1, 1, 1] },
  { id: "paused", es: "En pausa", en: "Paused", value: 1 },
  { id: "failed", es: "Fallidas", en: "Failed", value: 1 },
]

export function summarySeeds(mode: TableMode): SummarySeed[] {
  if (mode === "empty") return []
  if (mode === "zeros") return figures.map((item) => ({ ...item, value: 0, sparkline: item.sparkline?.map(() => 0) }))
  return figures
}

export function statusOf(locale: SceneLocale, status: LotStatus) {
  const copy = statusText[status]
  return { tone: copy.tone, label: locale === "en" ? copy.en : copy.es }
}

export function actionsOf(locale: SceneLocale, status: LotStatus) {
  const allowed = new Set(actionIds[status])
  return actionText.filter((action) => allowed.has(action.id)).map((action) => ({
    id: action.id,
    label: locale === "en" ? action.en : action.es,
  }))
}

export function chrome(locale: SceneLocale) {
  const en = locale === "en"
  return {
    menu: en ? "Actions" : "Acciones",
    more: en ? "More actions" : "Más acciones",
    loading: en ? "Loading figures" : "Cargando cifras",
    retry: en ? "Retry" : "Reintentar",
    error: en ? "The figures could not be read." : "No se pudieron leer las cifras.",
    emptyNote: en ? "With no series, the strip stays hidden." : "Sin series, la franja no se muestra.",
    emptyTable: en ? "No rows" : "No hay filas",
    name: en ? "Series" : "Serie",
    status: en ? "Status" : "Estado",
    trend: en ? "Trend" : "Tendencia",
    search: en ? "Search" : "Buscar",
    columns: en ? "Columns" : "Columnas",
    previous: en ? "Previous" : "Anterior",
    next: en ? "Next" : "Siguiente",
    group: en ? "Open series" : "Series abiertas",
    tableError: en ? "The series could not be loaded." : "No se pudieron cargar las series.",
    loadingTable: en ? "Loading the series" : "Cargando las series",
    spark: (name: string) => (en ? `Trend for ${name}` : `Tendencia de ${name}`),
    slot: en ? "Plain total" : "Total en texto",
  }
}

/** Strip, status actions, and a sparkline on the admin table. */
export const filled: TableSceneSpec = { mode: "filled", kind: "data" }
/** The strip hides when there is nothing to count. */
export const empty: TableSceneSpec = { mode: "empty", kind: "data" }
/** Skeletons on the strip and the loading status on the adaptive table. */
export const loading: TableSceneSpec = { mode: "loading", kind: "adaptive" }
/** Retry lives on the strip and on the work table. */
export const error: TableSceneSpec = { mode: "error", kind: "work" }
export const zeros: TableSceneSpec = { mode: "zeros", kind: "data" }
export const narrow: TableSceneSpec = { mode: "filled", kind: "adaptive", narrow: true }
export const expandable: TableSceneSpec = { mode: "filled", kind: "expandable" }
export const work: TableSceneSpec = { mode: "filled", kind: "work" }
export const adaptive: TableSceneSpec = { mode: "filled", kind: "adaptive" }
