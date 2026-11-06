/**
 * Model, events, thresholds, and a small cost estimate for the context window.
 *
 * Clean-room. The Bencho find publishes no source and no license that allows
 * copying into a component library. See docs/learnings/L-BENCHO-context-window.md.
 *
 * model-router (another branch) should feed `resolveModelLimit`. This file
 * does not import it. cost-waterfall (another branch) owns the pricing core.
 * `estimateContextCost` is a stand-in with the same rate fields, meant to be
 * replaced when that branch merges.
 */

export const CONTEXT_KINDS = [
  "system",
  "tools",
  "memory-short",
  "memory-mid",
  "memory-long",
  "rag",
  "chat",
  "file",
] as const

export type ContextKind = (typeof CONTEXT_KINDS)[number] | (string & {})

export const CONTEXT_STATUSES = ["loading", "loaded", "evicted", "compacted"] as const

export type ContextStatus = (typeof CONTEXT_STATUSES)[number]

export type ContextSource = {
  id: string
  kind: ContextKind
  tokens: number
  status: ContextStatus
  /** True when some of `tokens` are already in the provider cache. */
  cached: boolean
  /** How many of `tokens` are cache reads. Never above `tokens`. */
  cacheTokens: number
  pinned: boolean
  label: string
  /** Id of the source this row summarizes, when `status` is `compacted`. */
  summaryOf?: string
}

export type ContextCompactRecord = {
  fromId: string
  toId: string
  fromLabel: string
  tokensBefore: number
  tokensAfter: number
  note: string
  freed: number
}

export type ContextWindowModel = {
  sources: ContextSource[]
  lastCompact: ContextCompactRecord | null
}

export type ContextUpdate = {
  tokens?: number
  label?: string
  status?: ContextStatus
  cached?: boolean
  cacheTokens?: number
  kind?: string
}

export type ContextEvent =
  | { type: "load"; source: ContextSource }
  | ({ type: "update"; id: string } & ContextUpdate)
  | { type: "evict"; id: string }
  | {
      type: "compact"
      from: string
      to: ContextSource
      tokensBefore: number
      tokensAfter: number
      note: string
    }
  | { type: "pin"; id: string }
  | { type: "unpin"; id: string }

export type ContextEventReason = "applied" | "duplicate" | "missing" | "pinned" | "conflict"

export function emptyContextModel(): ContextWindowModel {
  return { sources: [], lastCompact: null }
}

function clampCount(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return Math.min(Math.floor(value), Number.MAX_SAFE_INTEGER)
}

export function normalizeSource(source: ContextSource): ContextSource | null {
  const id = source.id.trim()
  if (!id) return null
  const tokens = clampCount(source.tokens)
  const cacheTokens = source.cached ? Math.min(clampCount(source.cacheTokens), tokens) : 0
  const next: ContextSource = {
    id,
    kind: source.kind.trim() || "file",
    tokens,
    status: source.status,
    cached: cacheTokens > 0,
    cacheTokens,
    pinned: source.pinned,
    label: source.label,
  }
  const summaryOf = source.summaryOf?.trim()
  if (summaryOf) next.summaryOf = summaryOf
  return next
}

function sameSource(a: ContextSource, b: ContextSource): boolean {
  return (
    a.id === b.id &&
    a.kind === b.kind &&
    a.tokens === b.tokens &&
    a.status === b.status &&
    a.cached === b.cached &&
    a.cacheTokens === b.cacheTokens &&
    a.pinned === b.pinned &&
    a.label === b.label &&
    a.summaryOf === b.summaryOf
  )
}

function replaceAt(sources: readonly ContextSource[], index: number, next: ContextSource): ContextSource[] {
  return sources.map((source, cursor) => (cursor === index ? next : source))
}

type Reduced = { state: ContextWindowModel; reason: ContextEventReason }

function reduceEvent(state: ContextWindowModel, event: ContextEvent): Reduced {
  if (event.type === "load") {
    const next = normalizeSource(event.source)
    if (!next) return { state, reason: "missing" }
    const index = state.sources.findIndex((source) => source.id === next.id)
    if (index === -1) return { state: { ...state, sources: [...state.sources, next] }, reason: "applied" }
    const current = state.sources[index]
    if (!current || sameSource(current, next)) return { state, reason: "duplicate" }
    return { state: { ...state, sources: replaceAt(state.sources, index, next) }, reason: "applied" }
  }

  if (event.type === "update") {
    const index = state.sources.findIndex((source) => source.id === event.id)
    const current = index === -1 ? undefined : state.sources[index]
    if (!current) return { state, reason: "missing" }
    const draft: ContextSource = {
      id: current.id,
      kind: event.kind ?? current.kind,
      tokens: event.tokens === undefined ? current.tokens : event.tokens,
      status: event.status ?? current.status,
      cached: event.cached === undefined ? current.cached : event.cached,
      cacheTokens: event.cacheTokens === undefined ? current.cacheTokens : event.cacheTokens,
      pinned: current.pinned,
      label: event.label ?? current.label,
    }
    if (current.summaryOf) draft.summaryOf = current.summaryOf
    const next = normalizeSource(draft)
    if (!next || sameSource(current, next)) return { state, reason: "duplicate" }
    return { state: { ...state, sources: replaceAt(state.sources, index, next) }, reason: "applied" }
  }

  if (event.type === "evict") {
    const index = state.sources.findIndex((source) => source.id === event.id)
    const current = index === -1 ? undefined : state.sources[index]
    if (!current) return { state, reason: "missing" }
    if (current.status === "evicted") return { state, reason: "duplicate" }
    return {
      state: { ...state, sources: replaceAt(state.sources, index, { ...current, status: "evicted" }) },
      reason: "applied",
    }
  }

  if (event.type === "pin" || event.type === "unpin") {
    const index = state.sources.findIndex((source) => source.id === event.id)
    const current = index === -1 ? undefined : state.sources[index]
    if (!current) return { state, reason: "missing" }
    const pinned = event.type === "pin"
    if (current.pinned === pinned) return { state, reason: "duplicate" }
    return {
      state: { ...state, sources: replaceAt(state.sources, index, { ...current, pinned }) },
      reason: "applied",
    }
  }

  const index = state.sources.findIndex((source) => source.id === event.from)
  const current = index === -1 ? undefined : state.sources[index]
  if (!current) return { state, reason: "missing" }
  if (current.pinned) return { state, reason: "pinned" }
  const summary = normalizeSource({
    ...event.to,
    tokens: event.tokensAfter,
    status: "compacted",
    summaryOf: event.to.summaryOf?.trim() || event.from,
  })
  if (!summary) return { state, reason: "missing" }
  if (summary.id !== current.id && state.sources.some((source) => source.id === summary.id)) {
    return { state, reason: "conflict" }
  }
  const tokensBefore = clampCount(event.tokensBefore)
  const record: ContextCompactRecord = {
    fromId: current.id,
    toId: summary.id,
    fromLabel: current.label,
    tokensBefore,
    tokensAfter: summary.tokens,
    note: event.note,
    freed: Math.max(0, tokensBefore - summary.tokens),
  }
  const sameRecord =
    state.lastCompact !== null &&
    state.lastCompact.fromId === record.fromId &&
    state.lastCompact.toId === record.toId &&
    state.lastCompact.tokensBefore === record.tokensBefore &&
    state.lastCompact.tokensAfter === record.tokensAfter &&
    state.lastCompact.note === record.note
  if (sameRecord && sameSource(current, summary)) return { state, reason: "duplicate" }
  const sources = state.sources.map((source) => (source.id === current.id ? summary : source))
  return { state: { sources, lastCompact: record }, reason: "applied" }
}

/** Pure reducer. Out-of-order and duplicate events leave the previous state. Pinned sources are not compacted. */
export function applyContextEvent(state: ContextWindowModel, event: ContextEvent): ContextWindowModel {
  return reduceEvent(state, event).state
}

export function explainContextEvent(state: ContextWindowModel, event: ContextEvent): ContextEventReason {
  return reduceEvent(state, event).reason
}

export function applyContextEvents(state: ContextWindowModel, events: readonly ContextEvent[]): ContextWindowModel {
  return events.reduce(applyContextEvent, state)
}

export async function reduceContextStream(
  state: ContextWindowModel,
  events: AsyncIterable<ContextEvent>,
): Promise<ContextWindowModel> {
  let current = state
  for await (const event of events) current = applyContextEvent(current, event)
  return current
}

export function contextTokenTotal(sources: readonly ContextSource[]): number {
  return sources.reduce((sum, source) => (source.status === "evicted" ? sum : sum + source.tokens), 0)
}

export type ContextThreshold = { unit: "percent"; value: number } | { unit: "tokens"; value: number }

export function thresholdInTokens(threshold: ContextThreshold, limit: number): number {
  if (threshold.unit === "tokens") return Math.max(0, threshold.value)
  const percent = Math.min(100, Math.max(0, threshold.value))
  if (limit <= 0) return 0
  return (percent / 100) * limit
}

/** True only when `after` crosses the line upward. Repeating a value does not cross again. */
export function thresholdCrossed(before: number, after: number, limit: number, threshold: ContextThreshold): boolean {
  const line = thresholdInTokens(threshold, limit)
  return before < line && after >= line
}

export type ModelLimitResolver = (modelId: string) => number | null | undefined

/**
 * Limit for one model.
 *
 * Pass `modelLimit` or `resolveLimit`. model-router lives on another branch
 * and is not imported here. When it merges, the host should pass that
 * router's limit function as `resolveLimit`, for example
 * `(modelId) => router.limitFor(modelId)`. A positive resolved value wins
 * over `modelLimit`. Anything else falls back to `modelLimit`, then to 0.
 */
export function resolveModelLimit(options: {
  modelLimit?: number
  modelId?: string
  resolveLimit?: ModelLimitResolver
}): number {
  if (options.modelId && options.resolveLimit) {
    const resolved = options.resolveLimit(options.modelId)
    if (typeof resolved === "number" && Number.isFinite(resolved) && resolved > 0) return resolved
  }
  if (typeof options.modelLimit === "number" && Number.isFinite(options.modelLimit) && options.modelLimit > 0) {
    return options.modelLimit
  }
  return 0
}

export type PricingCurrency = "USD" | "MXN"

/**
 * Per-model rates per 1M tokens.
 *
 * Field names match the pricing core expected from cost-waterfall: input,
 * output, cache read, and cache write. That branch is not imported. Replace
 * `estimateContextCost` with that core when it merges. Currency is not part
 * of the rate table; format it at the edge with `Intl`.
 */
export type PricingLike = {
  inputPerMillion: number
  outputPerMillion: number
  cacheReadPerMillion: number
  cacheWritePerMillion: number
}

export type ContextCost = {
  amount: number
  formatted: string
  currency: PricingCurrency
  inputTokens: number
  outputTokens: number
  cacheReadTokens: number
  cacheWriteTokens: number
}

function rate(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 0
  return value
}

/**
 * Estimated cost of the tokens currently in the window.
 *
 * Uncached tokens use the input rate. `cacheTokens` use the cache-read rate.
 * Evicted sources are skipped. Output and cache-write tokens are not on a
 * source; the host may pass them. Formatting uses `Intl` (`USD` or `MXN`).
 *
 * Candidate to delete in favor of the cost-waterfall pricing core.
 */
export function estimateContextCost(input: {
  sources: readonly ContextSource[]
  pricing: PricingLike
  currency?: PricingCurrency
  locale?: string
  cacheWriteTokens?: number
  outputTokens?: number
}): ContextCost {
  let inputTokens = 0
  let cacheReadTokens = 0
  for (const source of input.sources) {
    if (source.status === "evicted") continue
    const cached = source.cached ? Math.min(Math.max(0, source.cacheTokens), Math.max(0, source.tokens)) : 0
    cacheReadTokens += cached
    inputTokens += Math.max(0, source.tokens - cached)
  }
  const outputTokens = clampCount(input.outputTokens ?? 0)
  const cacheWriteTokens = clampCount(input.cacheWriteTokens ?? 0)
  const pricing = input.pricing
  const amount =
    (inputTokens * rate(pricing.inputPerMillion) +
      outputTokens * rate(pricing.outputPerMillion) +
      cacheReadTokens * rate(pricing.cacheReadPerMillion) +
      cacheWriteTokens * rate(pricing.cacheWritePerMillion)) /
    1_000_000
  const currency = input.currency ?? "USD"
  const locale = input.locale ?? (currency === "MXN" ? "es-MX" : "en-US")
  const abs = Math.abs(amount)
  const digits = abs !== 0 && abs < 0.01 ? 4 : 2
  const formatted = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    currencyDisplay: "code",
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(amount)
  return { amount, formatted, currency, inputTokens, outputTokens, cacheReadTokens, cacheWriteTokens }
}

export function formatTokenCount(value: number, locale: string): string {
  const safe = Number.isFinite(value) ? Math.max(0, value) : 0
  const compact = safe >= 1000
  return new Intl.NumberFormat(locale, {
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 0,
  }).format(safe)
}

export type TickAllocation = {
  segments: { id: string; count: number }[]
  empty: number
}

/** Largest-remainder split of a fixed tick budget. The empty bucket is the room left under `limit`. */
export function allocateTicks(sources: readonly ContextSource[], limit: number, ticks: number): TickAllocation {
  const safeTicks = Math.max(1, Math.min(96, Math.floor(Number.isFinite(ticks) ? ticks : 1)))
  const active = sources.filter((source) => source.status !== "evicted" && source.tokens > 0)
  const used = active.reduce((sum, source) => sum + source.tokens, 0)
  const emptyWeight = used === 0 && limit <= 0 ? 1 : Math.max(0, limit - used)
  const buckets = [...active.map((source) => ({ id: source.id, weight: source.tokens })), { id: "__empty__", weight: emptyWeight }]
  const totalWeight = buckets.reduce((sum, bucket) => sum + bucket.weight, 0) || 1
  const exact = buckets.map((bucket) => (bucket.weight / totalWeight) * safeTicks)
  const counts = exact.map((value) => Math.floor(value))
  let remain = safeTicks - counts.reduce((sum, count) => sum + count, 0)
  const order = exact
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction || left.index - right.index)
  for (const item of order) {
    if (remain <= 0) break
    const current = counts[item.index]
    if (current === undefined) continue
    counts[item.index] = current + 1
    remain -= 1
  }
  const segments: { id: string; count: number }[] = []
  let empty = 0
  buckets.forEach((bucket, index) => {
    const count = counts[index] ?? 0
    if (bucket.id === "__empty__") empty = count
    else if (count > 0) segments.push({ id: bucket.id, count })
  })
  return { segments, empty }
}
