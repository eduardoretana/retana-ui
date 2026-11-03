/**
 * Bar progress is an estimate unless both timestamps exist.
 * Running checks use the median of earlier durations for that name,
 * or 60 seconds when there is no history. The UI must say "estimated".
 */

import type { CheckStatus } from "./types"

export const FALLBACK_DURATION_MS = 60_000
export const RUNNING_PROGRESS_CAP = 0.95

export function median(values: readonly number[]): number | null {
  const sorted = values.filter((value) => Number.isFinite(value) && value > 0).slice().sort((a, b) => a - b)
  if (sorted.length === 0) return null
  const mid = Math.floor(sorted.length / 2)
  const left = sorted[mid - 1]
  const right = sorted[mid]
  if (sorted.length % 2 === 1) return right ?? null
  if (left == null || right == null) return null
  return (left + right) / 2
}

export type ProgressEstimate = {
  progress: number
  estimated: boolean
  durationMs: number | null
}

export function estimateProgress(input: {
  status: CheckStatus
  startedAt?: string | null
  completedAt?: string | null
  measuredDurationMs?: number | null
  now: number
  historyMs?: readonly number[]
  fallbackMs?: number
}): ProgressEstimate {
  const measured = input.measuredDurationMs
  if (input.status === "queued") return { progress: 0, estimated: false, durationMs: null }
  if (input.status === "skipped" || input.status === "cancelled") {
    return { progress: 0, estimated: measured == null, durationMs: measured ?? null }
  }
  if (input.status === "passed" || input.status === "failed") {
    return { progress: 1, estimated: measured == null, durationMs: measured ?? null }
  }
  const started = input.startedAt ? Date.parse(input.startedAt) : NaN
  const elapsed = Number.isFinite(started) ? Math.max(0, input.now - started) : 0
  const typical = median(input.historyMs ?? []) ?? input.fallbackMs ?? FALLBACK_DURATION_MS
  const ratio = typical <= 0 ? RUNNING_PROGRESS_CAP : elapsed / typical
  return {
    progress: Math.min(RUNNING_PROGRESS_CAP, Math.max(0, ratio)),
    estimated: true,
    durationMs: elapsed,
  }
}
