import type { SceneLocale } from "@/app/catalog/scene-types"
import type { TimeOffStatsLabels, TimeOffYear } from "@/registry/ui/time-off-stats"

import data from "../../../fixtures/time-off-stats.json"

type TimeScene = {
  available: number | null
  pending: number
  years: TimeOffYear[]
  loading?: boolean
  error?: { es: string; en: string }
}

const scenes = data.scenes as Record<string, TimeScene>

export const years: TimeOffYear[] = scenes.filled.years
export const filled = { available: scenes.filled.available, pending: scenes.filled.pending, years }
export const empty = { available: null as number | null, pending: 0, years: [] as TimeOffYear[] }
export const loading = { ...filled, loading: true }
export const error = { ...filled, error: true }
export const zero = scenes.zero
export const pending = { available: scenes.pending.available, pending: scenes.pending.pending, years }

export function statsLabels(locale: SceneLocale): Partial<TimeOffStatsLabels> {
  const pack = data.labels[locale]
  const labels: Partial<TimeOffStatsLabels> = {}
  for (const [key, value] of Object.entries(pack)) {
    if (key === "amount") labels.amount = (amount) => value.replaceAll("{value}", String(amount))
    else Object.assign(labels, { [key]: value })
  }
  return labels
}

export const errorCopy = scenes.error.error ?? {
  es: "No se pudo leer el saldo.",
  en: "The balance could not be read.",
}
