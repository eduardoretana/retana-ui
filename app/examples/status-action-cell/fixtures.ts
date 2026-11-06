import type { SceneLocale } from "@/app/catalog/scene-types"
import type { StatusTone } from "@/registry/ui/status-pill"

export type CellAction = {
  id: string
  es: string
  en: string
  variant?: "default" | "outline" | "ghost" | "destructive"
}

export type CellFixture = {
  tone: StatusTone
  label: { es: string; en: string }
  actions: CellAction[]
  pendingId?: string
  error?: { es: string; en: string }
  collapse?: boolean
  density?: "regular" | "compact"
}

const pausedActions: CellAction[] = [
  { id: "resume", es: "Reanudar", en: "Resume" },
  { id: "retry", es: "Reintentar", en: "Retry" },
  { id: "approve", es: "Aprobar", en: "Approve" },
  { id: "note", es: "Anotar", en: "Note" },
]

/** Status with three inline actions and one more in the menu. */
export const filled: CellFixture = {
  tone: "warning",
  label: { es: "En pausa", en: "Paused" },
  actions: pausedActions,
}

/** A settled status and no actions. */
export const empty: CellFixture = {
  tone: "positive",
  label: { es: "Listo", en: "Done" },
  actions: [],
}

/** Resume is in flight. The button stays focusable and exposes aria-busy. */
export const loading: CellFixture = {
  tone: "warning",
  label: { es: "En pausa", en: "Paused" },
  actions: pausedActions.slice(0, 3),
  pendingId: "resume",
}

/** The last action failed. The message is text, not a color. */
export const error: CellFixture = {
  tone: "critical",
  label: { es: "Falló", en: "Failed" },
  actions: pausedActions.slice(0, 3),
  error: {
    es: "No se pudo reanudar esta serie.",
    en: "This series could not be resumed.",
  },
}

export const narrow: CellFixture = { ...filled, collapse: true }
export const compact: CellFixture = { ...filled, density: "compact" }

export function cellText(locale: SceneLocale, copy: { es: string; en: string }) {
  return locale === "en" ? copy.en : copy.es
}

export function menuLabels(locale: SceneLocale) {
  if (locale === "en") return { menu: "Actions", more: "More actions" }
  return { menu: "Acciones", more: "Más acciones" }
}
