import type { SceneLocale } from "@/app/catalog/scene-types"
import type { TimeOffStatsLabels, TimeOffYear } from "@/registry/ui/time-off-stats"

export const years: TimeOffYear[] = [
  { year: 2025, granted: 12, used: 9 },
  { year: 2026, granted: 12, used: 4 },
]

export const filled = { available: 12, pending: 2, years }
export const empty = { available: null as number | null, pending: 0, years: [] as TimeOffYear[] }
export const loading = { ...filled, loading: true }
export const error = { ...filled, error: true }
export const zero = { available: 0, pending: 0, years: [{ year: 2026, granted: 12, used: 12 }] }
export const pending = { available: 12, pending: 6, years }

export function statsLabels(locale: SceneLocale): Partial<TimeOffStatsLabels> {
  if (locale === "en") return { amount: (value) => `${value} days` }
  return {
    title: "Saldo",
    available: "Disponible",
    pending: "Pendiente",
    left: "Queda este año",
    year: "Año",
    granted: "Otorgados",
    used: "Usados",
    empty: "No hay saldo que mostrar.",
    loading: "Cargando el saldo",
    amount: (value) => `${value} días`,
  }
}

export const errorCopy = {
  es: "No se pudo leer el saldo.",
  en: "The balance could not be read.",
}
