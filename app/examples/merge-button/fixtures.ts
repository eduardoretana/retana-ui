import type { MergePhase } from "@/registry/ui/merge-button"

export const filled = { phase: "ready" as MergePhase }
export const empty = { phase: "disabled" as MergePhase }
export const loading = { phase: "merging" as MergePhase }
export const error = { phase: "rejected" as MergePhase, reason: "Se requieren revisiones en main." }
export const merged = { phase: "merged" as MergePhase }
