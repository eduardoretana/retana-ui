/**
 * RAG source list for a host CRM. Pure data: no fetch and no Supabase.
 * The host connects, syncs, disconnects, and resets through ports.
 * Clean-room. No source, sample payload, or asset was copied.
 */

export const SOURCE_STATUSES = [
  "disconnected",
  "connecting",
  "syncing",
  "connected",
  "error",
  "stale",
] as const

export type SourceStatus = (typeof SOURCE_STATUSES)[number]

export type KnowledgeGlyph = "docs" | "repo" | "help" | "notes" | "generic"

export type KnowledgeSourceType = {
  id: string
  label: string
  /** Shown under a new source of this type. */
  hint?: string
  glyph?: KnowledgeGlyph
}

export type KnowledgeSource = {
  id: string
  typeId: string
  name: string
  detail: string
  status: SourceStatus
  chunks: number
  /** 0–100 while syncing. */
  progress?: number
  error?: string
}

export type PortReport = {
  progress?: number
  chunks?: number
}

export type KnowledgePort = (
  sourceId: string,
  ctx: { signal: AbortSignal; report: (update: PortReport) => void },
) => Promise<void>

export function totalChunks(sources: readonly KnowledgeSource[]) {
  return sources.reduce((sum, source) => sum + (Number.isFinite(source.chunks) ? source.chunks : 0), 0)
}

export function connectedCount(sources: readonly KnowledgeSource[]) {
  return sources.filter((source) => source.status === "connected" || source.status === "stale").length
}

export function indexingCount(sources: readonly KnowledgeSource[]) {
  return sources.filter((source) => source.status === "connecting" || source.status === "syncing").length
}

/** A failed, stale, or disconnected source can be asked again. A live sync cannot. */
export function canRetry(status: SourceStatus) {
  return status === "error" || status === "stale" || status === "disconnected"
}
