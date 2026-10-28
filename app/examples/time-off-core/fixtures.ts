import type { SceneLocale } from "@/app/catalog/scene-types"

export const filled = { start: "2026-09-14", end: "2026-09-18", year: 2026 }
export const empty = { start: "", end: "", year: 2026 }
export const loading = { start: "2026-09-14", end: "2026-09-18", year: 2026, loading: true }
export const error = { start: "2026-13-40", end: "2026-09-18", year: 2026 }
export const holiday = filled
export const zero = { start: "2026-09-14", end: "2026-09-15", year: 2026, available: 0, pending: 0 }

export function coreCopy(locale: SceneLocale) {
  if (locale === "en") {
    return {
      days: "Business days",
      skipped: "Skipped",
      left: "Would remain",
      empty: "No range to count.",
      loading: "Counting business days",
      invalid: "That date is not a day.",
      weekend: "Weekend",
    }
  }
  return {
    days: "Días hábiles",
    skipped: "No cuentan",
    left: "Quedarían",
    empty: "No hay un rango que contar.",
    loading: "Contando días hábiles",
    invalid: "Esa fecha no es un día.",
    weekend: "Fin de semana",
  }
}
