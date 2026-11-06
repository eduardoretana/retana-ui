import type { SceneLocale } from "@/app/catalog/scene-types"

import { banner, cacheHeavyRun, deepRun, emptyRun, exampleMxn, examplePricing, filledRun, labelsFor, liveRun, liveTail, stepErrorRun } from "./example-data"

export const filled = { id: "filled" as const }
export const empty = { id: "empty" as const }
export const loading = { id: "loading" as const, loading: true }
export const error = { id: "error" as const, banner }
export const liveStreaming = { id: "live-streaming" as const }
export const stepError = { id: "step-error" as const }
export const cacheHeavy = { id: "cache-heavy" as const }
export const deepTree = { id: "deep-tree" as const }
export const mxn = { id: "mxn" as const }
export const tokens = { id: "tokens" as const }

export function sceneRun(id: string, locale: SceneLocale) {
  if (id === "empty" || id === "loading") return emptyRun()
  if (id === "cache-heavy") return cacheHeavyRun(locale)
  if (id === "step-error") return stepErrorRun(locale)
  if (id === "deep-tree") return deepRun(locale)
  if (id === "live-streaming") return liveRun(locale)
  return filledRun(locale)
}

export { exampleMxn, examplePricing, labelsFor, liveTail }
