import type { SceneLocale } from "@/app/catalog/scene-types"
import { formatMicro, rollupRun } from "@/registry/lib/cost-waterfall"

import { cacheHeavyRun, emptyRun, exampleMxn, examplePricing, filledRun } from "../cost-waterfall/example-data"

export const filled = { id: "filled" as const }
export const empty = { id: "empty" as const }
export const loading = { id: "loading" as const }
export const error = { id: "error" as const }
export const cache = { id: "cache" as const }
export const mxn = { id: "mxn" as const }

export function coreSnapshot(id: string, locale: SceneLocale) {
  const run = id === "empty" || id === "loading" || id === "error" ? emptyRun() : id === "cache" ? cacheHeavyRun(locale) : filledRun(locale)
  const rollup = rollupRun(run, id === "error" ? undefined : examplePricing)
  const money = id === "mxn" ? exampleMxn : { locale: locale === "en" ? "en-US" : "es-MX", currency: "USD" }
  return {
    run,
    total: formatMicro(rollup.totalCost, money),
    savings: formatMicro(rollup.cacheSavings, money),
    tokens: rollup.totalTokens,
    winner: run.steps.find((step) => step.id === rollup.mostExpensiveId)?.name ?? "—",
  }
}
