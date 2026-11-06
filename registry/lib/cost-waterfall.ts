/**
 * Pure cost model for one agent run.
 *
 * Clean-room. Affect UI's Cost Waterfall is Pro and is not in the MIT repo
 * (https://github.com/flohoeller/affectui/blob/main/LICENSE). No Affect source,
 * sample data, icons, or assets are included.
 *
 * Money is an integer number of micro-units: BigInt(1_000_000) is 1.00 of the
 * pricing currency. Prices are micro-units per 1_000_000 tokens. Division
 * rounds half away from zero. Nothing here uses binary float for money.
 */

import { toCsv, type CsvColumn } from "@/registry/retana/lib/csv"

export const MICRO_SCALE = BigInt(1_000_000)
export const TOKENS_PER_PRICE = BigInt(1_000_000)

/** BigInt(1_000_000) = 1.00 of the pricing currency. */
export type Micro = bigint

export const STEP_STATUSES = ["queued", "running", "success", "error", "skipped"] as const
export type StepStatus = (typeof STEP_STATUSES)[number]

export const RUN_STATUSES = ["queued", "live", "done", "error"] as const
export type RunStatus = (typeof RUN_STATUSES)[number]

export const COST_MEASURES = ["cost", "tokens"] as const
export type CostMeasure = (typeof COST_MEASURES)[number]

export type ModelPrice = {
  /** Micro-units per 1_000_000 tokens. */
  input: Micro
  output: Micro
  cacheRead: Micro
  cacheWrite: Micro
}

export type PricingTable = {
  /** Currency the prices are denominated in, usually "USD". */
  currency: string
  models: Readonly<Record<string, ModelPrice>>
  fallback?: ModelPrice
}

export type RunStep = {
  id: string
  parentId?: string
  name: string
  /** Open string. Known kinds are llm, tool, save, and agent; others are valid. */
  kind: string
  model?: string
  destination?: string
  tokensIn: number
  tokensOut: number
  cacheRead: number
  cacheWrite: number
  /** When set, replaces the price computed from this step's own tokens. */
  costMicro?: Micro
  latencyMs?: number
  startedAt?: number
  endedAt?: number
  /** Latest accepted event time. Later events with an older stamp are ignored. */
  updatedAt?: number
  status: StepStatus
  input?: string
  output?: string
  error?: string
  payload?: unknown
}

export type Run = {
  id: string
  title: string
  status: RunStatus
  startedAt?: number
  endedAt?: number
  /** Set by run.completed. Cleared when a newer step reopens the run. */
  closedAt?: number
  steps: readonly RunStep[]
  seenEventIds?: readonly string[]
}

export type FxRate = {
  numerator: Micro
  denominator: Micro
}

export type MoneyFormat = {
  locale: string
  currency: string
  /** displayMicro = baseMicro * numerator / denominator. */
  fx?: FxRate
}

export type StepRollup = {
  id: string
  ownCost: Micro
  rolledCost: Micro
  ownTokens: number
  rolledTokens: number
  cacheSavings: Micro
  rolledCacheSavings: Micro
}

export type ModelRollup = {
  key: string
  steps: number
  tokensIn: number
  tokensOut: number
  cacheRead: number
  cacheWrite: number
  costMicro: Micro
  cacheSavings: Micro
}

export type RunRollup = {
  steps: readonly StepRollup[]
  byModel: readonly ModelRollup[]
  totalCost: Micro
  totalTokens: number
  tokensIn: number
  tokensOut: number
  cacheRead: number
  cacheWrite: number
  cacheSavings: Micro
  /** Greatest own cost above zero. Parents do not win by summing children. */
  mostExpensiveId: string | null
}

export type WaterfallRow = {
  id: string
  depth: number
  ownStart: Micro
  ownEnd: Micro
  spanStart: Micro
  spanEnd: Micro
  collapsed: boolean
  hiddenCount: number
}

export type WaterfallLayout = {
  origin: Micro
  domain: Micro
  rows: readonly WaterfallRow[]
}

type StepEventBase = { eventId?: string; at: number; stepId: string }

export type RunEvent =
  | (StepEventBase & {
      type: "step.started"
      parentId?: string
      name: string
      kind: string
      model?: string
      destination?: string
      input?: string
    })
  | (StepEventBase & {
      type: "step.progress"
      tokensIn?: number
      tokensOut?: number
      cacheRead?: number
      cacheWrite?: number
      costMicro?: Micro
      latencyMs?: number
    })
  | (StepEventBase & {
      type: "step.completed"
      tokensIn?: number
      tokensOut?: number
      cacheRead?: number
      cacheWrite?: number
      costMicro?: Micro
      latencyMs?: number
      input?: string
      output?: string
    })
  | (StepEventBase & { type: "step.failed"; error: string; output?: string })
  | { type: "run.completed"; eventId?: string; at: number }

export function mulDiv(left: Micro, right: Micro, divisor: Micro): Micro {
  if (divisor === BigInt(0)) throw new Error("divisor is 0")
  const negative = (left < BigInt(0)) !== (right < BigInt(0)) !== (divisor < BigInt(0))
  const a = left < BigInt(0) ? -left : left
  const b = right < BigInt(0) ? -right : right
  const scale = divisor < BigInt(0) ? -divisor : divisor
  const rounded = (a * b + scale / BigInt(2)) / scale
  return negative ? -rounded : rounded
}

function count(value: number, label: string): Micro {
  if (!Number.isSafeInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative safe integer`)
  }
  return BigInt(value)
}

function countOrZero(value: number): Micro {
  if (!Number.isSafeInteger(value) || value <= 0) return BigInt(0)
  return BigInt(value)
}

export function modelPrice(table: PricingTable | undefined, model: string | undefined): ModelPrice | undefined {
  if (!table) return undefined
  if (model && Object.prototype.hasOwnProperty.call(table.models, model)) return table.models[model]
  return table.fallback
}

export function pricedCost(
  step: Pick<RunStep, "model" | "tokensIn" | "tokensOut" | "cacheRead" | "cacheWrite">,
  table: PricingTable | undefined,
): Micro {
  const price = modelPrice(table, step.model)
  if (!price) return BigInt(0)
  return (
    mulDiv(count(step.tokensIn, "tokensIn"), price.input, TOKENS_PER_PRICE) +
    mulDiv(count(step.tokensOut, "tokensOut"), price.output, TOKENS_PER_PRICE) +
    mulDiv(count(step.cacheRead, "cacheRead"), price.cacheRead, TOKENS_PER_PRICE) +
    mulDiv(count(step.cacheWrite, "cacheWrite"), price.cacheWrite, TOKENS_PER_PRICE)
  )
}

/** Own cost only. An explicit costMicro replaces the priced amount. */
export function ownCost(step: RunStep, table: PricingTable | undefined): Micro {
  if (step.costMicro !== undefined) return step.costMicro
  return pricedCost(step, table)
}

/** What cache reads saved versus paying the input price. */
export function cacheSavings(step: RunStep, table: PricingTable | undefined): Micro {
  const price = modelPrice(table, step.model)
  if (!price) return BigInt(0)
  const delta = price.input - price.cacheRead
  if (delta <= BigInt(0) || step.cacheRead <= 0) return BigInt(0)
  return mulDiv(count(step.cacheRead, "cacheRead"), delta, TOKENS_PER_PRICE)
}

export function tokenCount(step: Pick<RunStep, "tokensIn" | "tokensOut" | "cacheRead" | "cacheWrite">): number {
  return step.tokensIn + step.tokensOut + step.cacheRead + step.cacheWrite
}

function idsOf(steps: readonly RunStep[]) {
  return new Set(steps.map((step) => step.id))
}

export function rootSteps(steps: readonly RunStep[]): RunStep[] {
  const ids = idsOf(steps)
  return steps.filter((step) => !step.parentId || !ids.has(step.parentId))
}

export function childSteps(steps: readonly RunStep[], id: string): RunStep[] {
  return steps.filter((step) => step.parentId === id)
}

function addCount(left: number, right: number): number {
  const sum = left + right
  if (!Number.isSafeInteger(sum)) throw new Error("token total is outside the safe integer range")
  return sum
}

function rollupOf(map: Map<string, StepRollup>, id: string): StepRollup | undefined {
  return map.get(id)
}

export function rollupRun(run: Pick<Run, "steps">, table: PricingTable | undefined): RunRollup {
  const byId = new Map<string, StepRollup>()
  const visiting = new Set<string>()

  function visit(step: RunStep): StepRollup {
    const cached = byId.get(step.id)
    if (cached) return cached
    if (visiting.has(step.id)) {
      const broken: StepRollup = {
        id: step.id,
        ownCost: BigInt(0),
        rolledCost: BigInt(0),
        ownTokens: 0,
        rolledTokens: 0,
        cacheSavings: BigInt(0),
        rolledCacheSavings: BigInt(0),
      }
      byId.set(step.id, broken)
      return broken
    }
    visiting.add(step.id)
    const own = ownCost(step, table)
    const saved = cacheSavings(step, table)
    let rolledCost = own
    let rolledTokens = tokenCount(step)
    let rolledCacheSavings = saved
    for (const child of childSteps(run.steps, step.id)) {
      const next = visit(child)
      rolledCost += next.rolledCost
      rolledTokens = addCount(rolledTokens, next.rolledTokens)
      rolledCacheSavings += next.rolledCacheSavings
    }
    visiting.delete(step.id)
    const row: StepRollup = {
      id: step.id,
      ownCost: own,
      rolledCost,
      ownTokens: tokenCount(step),
      rolledTokens,
      cacheSavings: saved,
      rolledCacheSavings,
    }
    byId.set(step.id, row)
    return row
  }

  for (const step of run.steps) visit(step)

  const steps: StepRollup[] = []
  let totalCost = BigInt(0)
  let totalTokens = 0
  let tokensIn = 0
  let tokensOut = 0
  let cacheRead = 0
  let cacheWrite = 0
  let savings = BigInt(0)
  let mostExpensiveId: string | null = null
  let most = BigInt(0)
  for (const step of run.steps) {
    const row = rollupOf(byId, step.id)
    if (!row) continue
    steps.push(row)
    tokensIn = addCount(tokensIn, step.tokensIn)
    tokensOut = addCount(tokensOut, step.tokensOut)
    cacheRead = addCount(cacheRead, step.cacheRead)
    cacheWrite = addCount(cacheWrite, step.cacheWrite)
    savings += row.cacheSavings
    if (row.ownCost > most) {
      most = row.ownCost
      mostExpensiveId = step.id
    }
  }
  for (const root of rootSteps(run.steps)) {
    const row = rollupOf(byId, root.id)
    if (!row) continue
    totalCost += row.rolledCost
    totalTokens = addCount(totalTokens, row.rolledTokens)
  }

  const models = new Map<string, ModelRollup>()
  for (const step of run.steps) {
    const row = rollupOf(byId, step.id)
    if (!row) continue
    const key = step.model ?? step.destination ?? ""
    const current = models.get(key) ?? {
      key,
      steps: 0,
      tokensIn: 0,
      tokensOut: 0,
      cacheRead: 0,
      cacheWrite: 0,
      costMicro: BigInt(0),
      cacheSavings: BigInt(0),
    }
    current.steps += 1
    current.tokensIn = addCount(current.tokensIn, step.tokensIn)
    current.tokensOut = addCount(current.tokensOut, step.tokensOut)
    current.cacheRead = addCount(current.cacheRead, step.cacheRead)
    current.cacheWrite = addCount(current.cacheWrite, step.cacheWrite)
    current.costMicro += row.ownCost
    current.cacheSavings += row.cacheSavings
    models.set(key, current)
  }

  return {
    steps,
    byModel: [...models.values()],
    totalCost,
    totalTokens,
    tokensIn,
    tokensOut,
    cacheRead,
    cacheWrite,
    cacheSavings: savings,
    mostExpensiveId,
  }
}

function measureOf(step: RunStep, measure: CostMeasure, table: PricingTable | undefined): Micro {
  if (measure === "tokens") {
    return countOrZero(step.tokensIn) + countOrZero(step.tokensOut) + countOrZero(step.cacheRead) + countOrZero(step.cacheWrite)
  }
  return ownCost(step, table)
}

function descendantCount(steps: readonly RunStep[], id: string, guard: Set<string>): number {
  let total = 0
  for (const child of childSteps(steps, id)) {
    if (guard.has(child.id)) continue
    guard.add(child.id)
    total += 1 + descendantCount(steps, child.id, guard)
    guard.delete(child.id)
  }
  return total
}

export function layoutWaterfall(
  run: Pick<Run, "steps">,
  table: PricingTable | undefined,
  measure: CostMeasure,
  collapsed: readonly string[],
): WaterfallLayout {
  const folded = new Set(collapsed)
  const rows: WaterfallRow[] = []
  let cursor = BigInt(0)
  let min = BigInt(0)
  let max = BigInt(0)
  const visiting = new Set<string>()

  function bump(next: Micro) {
    cursor = next
    if (cursor < min) min = cursor
    if (cursor > max) max = cursor
  }

  function rolled(step: RunStep, guard: Set<string>): Micro {
    if (guard.has(step.id)) return BigInt(0)
    guard.add(step.id)
    let total = measureOf(step, measure, table)
    for (const child of childSteps(run.steps, step.id)) total += rolled(child, guard)
    guard.delete(step.id)
    return total
  }

  function walk(step: RunStep, depth: number) {
    if (visiting.has(step.id)) return
    visiting.add(step.id)
    const kids = childSteps(run.steps, step.id)
    const own = measureOf(step, measure, table)
    const isCollapsed = kids.length > 0 && folded.has(step.id)
    if (isCollapsed || kids.length === 0) {
      const ownStart = cursor
      const guard = new Set(visiting)
      guard.delete(step.id)
      bump(cursor + rolled(step, guard))
      rows.push({
        id: step.id,
        depth,
        ownStart,
        ownEnd: cursor,
        spanStart: ownStart,
        spanEnd: cursor,
        collapsed: isCollapsed,
        hiddenCount: isCollapsed ? descendantCount(run.steps, step.id, new Set(visiting)) : 0,
      })
    } else {
      const spanStart = cursor
      const ownStart = cursor
      bump(cursor + own)
      const ownEnd = cursor
      for (const child of kids) walk(child, depth + 1)
      rows.push({
        id: step.id,
        depth,
        ownStart,
        ownEnd,
        spanStart,
        spanEnd: cursor,
        collapsed: false,
        hiddenCount: 0,
      })
    }
    visiting.delete(step.id)
  }

  for (const step of rootSteps(run.steps)) walk(step, 1)
  return { origin: min, domain: max - min, rows }
}

/** Share of `part` over `whole`, from 0 to 1, using integer math. */
export function microRatio(part: Micro, whole: Micro): number {
  if (whole <= BigInt(0) || part <= BigInt(0)) return 0
  const scaled = (part * BigInt(1_000_000)) / whole
  const ratio = Number(scaled) / 1_000_000
  if (ratio <= 0) return 0
  if (ratio >= 1) return 1
  return ratio
}

export function convertMicro(value: Micro, fx?: FxRate): Micro {
  if (!fx) return value
  if (fx.denominator === BigInt(0)) throw new Error("fx denominator is 0")
  return mulDiv(value, fx.numerator, fx.denominator)
}

function fractionDigits(absMicro: Micro): number {
  if (absMicro === BigInt(0) || absMicro >= MICRO_SCALE) return 2
  if (absMicro >= BigInt(10_000)) return 4
  return 6
}

function sampleParts(locale: string, currency: string) {
  const parts = new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).formatToParts(-1234.5)
  const group = parts.find((part) => part.type === "group")?.value ?? ","
  const decimal = parts.find((part) => part.type === "decimal")?.value ?? "."
  return { parts, group, decimal }
}

function groupInteger(digits: string, group: string) {
  const pieces: string[] = []
  for (let index = digits.length; index > 0; index -= 3) {
    pieces.unshift(digits.slice(Math.max(0, index - 3), index))
  }
  return pieces.join(group)
}

/** Formats micro-units with Intl currency placement. The amount itself is not a float. */
export function formatMicro(value: Micro, format: MoneyFormat): string {
  const converted = convertMicro(value, format.fx)
  const negative = converted < BigInt(0)
  const abs = negative ? -converted : converted
  const digits = fractionDigits(abs)
  const scale = BigInt(10) ** BigInt(digits)
  const rounded = mulDiv(abs, scale, MICRO_SCALE)
  const whole = rounded / scale
  const frac = (rounded % scale).toString().padStart(digits, "0").replace(/0+$/, "").padEnd(2, "0")
  const { parts, group, decimal } = sampleParts(format.locale, format.currency)
  const grouped = groupInteger(whole.toString(), group)
  let body = ""
  let signed = false
  let wroteNumber = false
  for (const part of parts) {
    if (part.type === "minusSign" || part.type === "plusSign") {
      if (negative) body += part.value
      signed = true
      continue
    }
    if (part.type === "integer" || part.type === "group") {
      if (!wroteNumber) body += grouped
      wroteNumber = true
      continue
    }
    if (part.type === "decimal") {
      body += decimal
      continue
    }
    if (part.type === "fraction") {
      body += frac
      continue
    }
    body += part.value
  }
  if (negative && !signed) body = `-${body}`
  return body
}

export function formatTokenCount(value: number, locale: string): string {
  if (!Number.isFinite(value)) return "0"
  const abs = Math.abs(value)
  if (abs < 1000) return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value)
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

export function formatLatency(ms: number | undefined, locale: string): string {
  if (ms == null || !Number.isFinite(ms) || ms < 0) return "—"
  if (ms < 1000) {
    return `${new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(Math.round(ms))} ms`
  }
  const seconds = ms / 1000
  return `${new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(seconds)} s`
}

function deriveStatus(run: Pick<Run, "steps" | "closedAt" | "startedAt">): RunStatus {
  if (run.steps.some((step) => step.status === "running")) return "live"
  if (run.closedAt != null) return run.steps.some((step) => step.status === "error") ? "error" : "done"
  if (run.steps.length === 0 && run.startedAt == null) return "queued"
  return "live"
}

function withStatus(run: Run): Run {
  const status = deriveStatus(run)
  return run.status === status ? run : { ...run, status }
}

export function createRun(input: { id: string; title: string; steps?: readonly RunStep[]; startedAt?: number; endedAt?: number }): Run {
  const steps = input.steps ?? []
  const run: Run = { id: input.id, title: input.title, status: "queued", steps }
  if (input.startedAt !== undefined) run.startedAt = input.startedAt
  const settled =
    steps.length > 0 && steps.every((step) => step.status === "success" || step.status === "error" || step.status === "skipped")
  if (settled) {
    const last = steps.reduce((max, step) => Math.max(max, step.endedAt ?? 0), 0)
    run.closedAt = input.endedAt ?? last
    run.endedAt = input.endedAt ?? last
  } else if (input.endedAt !== undefined) {
    run.endedAt = input.endedAt
  }
  return withStatus(run)
}

function blankStep(id: string, at: number, status: StepStatus): RunStep {
  const step: RunStep = {
    id,
    name: id,
    kind: "unknown",
    tokensIn: 0,
    tokensOut: 0,
    cacheRead: 0,
    cacheWrite: 0,
    status,
    updatedAt: at,
  }
  if (status === "running" || status === "queued") step.startedAt = at
  else step.endedAt = at
  return step
}

function assignText<K extends "name" | "kind" | "model" | "destination" | "input" | "output" | "error" | "parentId">(
  step: RunStep,
  key: K,
  value: RunStep[K] | undefined,
) {
  if (value !== undefined) step[key] = value
}

function assignCount(step: RunStep, key: "tokensIn" | "tokensOut" | "cacheRead" | "cacheWrite", value: number | undefined) {
  if (value !== undefined) step[key] = Number(count(value, key))
}

function fillIdentity(step: RunStep, event: Extract<RunEvent, { type: "step.started" }>): RunStep {
  const next: RunStep = { ...step }
  let changed = false
  if ((next.name === next.id || next.name === "") && event.name) {
    next.name = event.name
    changed = true
  }
  if (next.kind === "unknown" && event.kind) {
    next.kind = event.kind
    changed = true
  }
  if (next.parentId === undefined && event.parentId !== undefined) {
    next.parentId = event.parentId
    changed = true
  }
  if (next.model === undefined && event.model !== undefined) {
    next.model = event.model
    changed = true
  }
  if (next.destination === undefined && event.destination !== undefined) {
    next.destination = event.destination
    changed = true
  }
  if (next.input === undefined && event.input !== undefined) {
    next.input = event.input
    changed = true
  }
  return changed ? next : step
}

function stamp(step: RunStep | undefined, at: number) {
  if (!step || step.updatedAt === undefined) return false
  return at < step.updatedAt
}

function remember(run: Run, eventId: string | undefined): Run | null {
  if (!eventId) return null
  if (run.seenEventIds?.includes(eventId)) return run
  return null
}

function markSeen(run: Run, eventId: string | undefined): Run {
  if (!eventId) return run
  return { ...run, seenEventIds: [...(run.seenEventIds ?? []), eventId] }
}

function touchRun(run: Run, at: number): Run {
  if (run.startedAt === undefined || at < run.startedAt) return { ...run, startedAt: at }
  return run
}

function putStep(run: Run, step: RunStep): Run {
  const index = run.steps.findIndex((item) => item.id === step.id)
  const steps = index === -1 ? [...run.steps, step] : run.steps.map((item, itemIndex) => (itemIndex === index ? step : item))
  return { ...run, steps }
}

function reopen(run: Run): Run {
  const next: Run = { id: run.id, title: run.title, status: run.status, steps: run.steps }
  if (run.startedAt !== undefined) next.startedAt = run.startedAt
  if (run.seenEventIds !== undefined) next.seenEventIds = run.seenEventIds
  return next
}

export function applyRunEvent(run: Run, event: RunEvent): Run {
  const seen = remember(run, event.eventId)
  if (seen) return seen
  const next = markSeen(run, event.eventId)

  if (event.type === "run.completed") {
    if (next.closedAt !== undefined && event.at < next.closedAt) return next
    return withStatus({ ...next, closedAt: event.at, endedAt: event.at })
  }

  const current = next.steps.find((step) => step.id === event.stepId)
  if (stamp(current, event.at)) {
    if (event.type === "step.started" && current) {
      const filled = fillIdentity(current, event)
      if (filled !== current) return withStatus(putStep(next, filled))
    }
    return next
  }

  if (event.type === "step.started") {
    const step = current ? { ...current } : blankStep(event.stepId, event.at, "running")
    assignText(step, "name", event.name)
    assignText(step, "kind", event.kind)
    assignText(step, "parentId", event.parentId)
    assignText(step, "model", event.model)
    assignText(step, "destination", event.destination)
    assignText(step, "input", event.input)
    const terminal = step.status === "success" || step.status === "error" || step.status === "skipped"
    if (!terminal || (step.updatedAt !== undefined && event.at > step.updatedAt)) step.status = "running"
    if (step.startedAt === undefined) step.startedAt = event.at
    step.updatedAt = event.at
    let opened = touchRun(putStep(next, step), event.at)
    if (opened.closedAt !== undefined && event.at >= opened.closedAt) opened = reopen(opened)
    return withStatus(opened)
  }

  if (event.type === "step.progress") {
    if (current && (current.status === "success" || current.status === "error" || current.status === "skipped")) return next
    const step = current ? { ...current } : blankStep(event.stepId, event.at, "running")
    assignCount(step, "tokensIn", event.tokensIn)
    assignCount(step, "tokensOut", event.tokensOut)
    assignCount(step, "cacheRead", event.cacheRead)
    assignCount(step, "cacheWrite", event.cacheWrite)
    if (event.costMicro !== undefined) step.costMicro = event.costMicro
    if (event.latencyMs !== undefined) step.latencyMs = event.latencyMs
    step.status = "running"
    step.updatedAt = event.at
    return withStatus(touchRun(putStep(next, step), event.at))
  }

  if (event.type === "step.completed" || event.type === "step.failed") {
    const step = current ? { ...current } : blankStep(event.stepId, event.at, event.type === "step.completed" ? "success" : "error")
    if (event.type === "step.completed") {
      assignCount(step, "tokensIn", event.tokensIn)
      assignCount(step, "tokensOut", event.tokensOut)
      assignCount(step, "cacheRead", event.cacheRead)
      assignCount(step, "cacheWrite", event.cacheWrite)
      if (event.costMicro !== undefined) step.costMicro = event.costMicro
      if (event.latencyMs !== undefined) step.latencyMs = event.latencyMs
      assignText(step, "input", event.input)
      assignText(step, "output", event.output)
      step.status = "success"
    } else {
      assignText(step, "output", event.output)
      assignText(step, "error", event.error)
      step.status = "error"
    }
    step.endedAt = event.at
    step.updatedAt = event.at
    return withStatus(touchRun(putStep(next, step), event.at))
  }

  return next
}

export function reduceRunEvents(run: Run, events: readonly RunEvent[]): Run {
  return events.reduce(applyRunEvent, run)
}

export async function consumeRunEvents(run: Run, events: AsyncIterable<RunEvent>, onRun?: (run: Run) => void): Promise<Run> {
  let current = run
  for await (const event of events) {
    current = applyRunEvent(current, event)
    onRun?.(current)
  }
  return current
}

export type RunExportStep = {
  id: string
  parentId?: string
  name: string
  kind: string
  model?: string
  destination?: string
  status: StepStatus
  tokensIn: number
  tokensOut: number
  cacheRead: number
  cacheWrite: number
  costMicro: string
  rolledCostMicro: string
  cacheSavingsMicro: string
  latencyMs?: number
  startedAt?: number
  endedAt?: number
  input?: string
  output?: string
  error?: string
}

export type RunExport = {
  id: string
  title: string
  status: RunStatus
  currency: string
  totalCostMicro: string
  totalTokens: number
  tokensIn: number
  tokensOut: number
  cacheRead: number
  cacheWrite: number
  cacheSavingsMicro: string
  mostExpensiveId: string | null
  steps: RunExportStep[]
}

export function exportRun(run: Run, table?: PricingTable): RunExport {
  const rollup = rollupRun(run, table)
  const byId = new Map(rollup.steps.map((step) => [step.id, step]))
  return {
    id: run.id,
    title: run.title,
    status: run.status,
    currency: table?.currency ?? "USD",
    totalCostMicro: rollup.totalCost.toString(),
    totalTokens: rollup.totalTokens,
    tokensIn: rollup.tokensIn,
    tokensOut: rollup.tokensOut,
    cacheRead: rollup.cacheRead,
    cacheWrite: rollup.cacheWrite,
    cacheSavingsMicro: rollup.cacheSavings.toString(),
    mostExpensiveId: rollup.mostExpensiveId,
    steps: run.steps.flatMap((step) => {
      const row = byId.get(step.id)
      if (!row) return []
      const exported: RunExportStep = {
        id: step.id,
        name: step.name,
        kind: step.kind,
        status: step.status,
        tokensIn: step.tokensIn,
        tokensOut: step.tokensOut,
        cacheRead: step.cacheRead,
        cacheWrite: step.cacheWrite,
        costMicro: row.ownCost.toString(),
        rolledCostMicro: row.rolledCost.toString(),
        cacheSavingsMicro: row.cacheSavings.toString(),
      }
      if (step.parentId !== undefined) exported.parentId = step.parentId
      if (step.model !== undefined) exported.model = step.model
      if (step.destination !== undefined) exported.destination = step.destination
      if (step.latencyMs !== undefined) exported.latencyMs = step.latencyMs
      if (step.startedAt !== undefined) exported.startedAt = step.startedAt
      if (step.endedAt !== undefined) exported.endedAt = step.endedAt
      if (step.input !== undefined) exported.input = step.input
      if (step.output !== undefined) exported.output = step.output
      if (step.error !== undefined) exported.error = step.error
      return [exported]
    }),
  }
}

export function runToJson(run: Run, table?: PricingTable): string {
  return JSON.stringify(exportRun(run, table), null, 2)
}

const CSV_COLUMNS: readonly CsvColumn[] = [
  { key: "id", header: "id" },
  { key: "parentId", header: "parentId" },
  { key: "name", header: "name" },
  { key: "kind", header: "kind" },
  { key: "model", header: "model" },
  { key: "destination", header: "destination" },
  { key: "status", header: "status" },
  { key: "tokensIn", header: "tokensIn" },
  { key: "tokensOut", header: "tokensOut" },
  { key: "cacheRead", header: "cacheRead" },
  { key: "cacheWrite", header: "cacheWrite" },
  { key: "costMicro", header: "costMicro" },
  { key: "rolledCostMicro", header: "rolledCostMicro" },
  { key: "cacheSavingsMicro", header: "cacheSavingsMicro" },
  { key: "latencyMs", header: "latencyMs" },
  { key: "startedAt", header: "startedAt" },
  { key: "endedAt", header: "endedAt" },
  { key: "error", header: "error" },
]

export function runToCsv(run: Run, table?: PricingTable): string {
  return toCsv(exportRun(run, table).steps, CSV_COLUMNS)
}

export type WorkflowNodeCost = {
  nodeId: string
  parentNodeId?: string
  label: string
  kind: string
  model?: string
  destination?: string
  tokensIn?: number
  tokensOut?: number
  cacheRead?: number
  cacheWrite?: number
  costMicro?: Micro
  latencyMs?: number
  startedAt?: number
  endedAt?: number
  status?: StepStatus
  input?: string
  output?: string
  error?: string
  /** Host replay flag. Stored on payload and ignored by pricing. */
  replay?: boolean
}

/** Adapter for a workflow-builder node list. Does not import that piece. */
export function runFromWorkflowNodes(input: { id: string; title: string; nodes: readonly WorkflowNodeCost[] }): Run {
  const steps = input.nodes.map((node) => {
    const step: RunStep = {
      id: node.nodeId,
      name: node.label,
      kind: node.kind,
      tokensIn: node.tokensIn ?? 0,
      tokensOut: node.tokensOut ?? 0,
      cacheRead: node.cacheRead ?? 0,
      cacheWrite: node.cacheWrite ?? 0,
      status: node.status ?? "success",
    }
    if (node.parentNodeId !== undefined) step.parentId = node.parentNodeId
    if (node.model !== undefined) step.model = node.model
    if (node.destination !== undefined) step.destination = node.destination
    if (node.costMicro !== undefined) step.costMicro = node.costMicro
    if (node.latencyMs !== undefined) step.latencyMs = node.latencyMs
    if (node.startedAt !== undefined) step.startedAt = node.startedAt
    if (node.endedAt !== undefined) step.endedAt = node.endedAt
    if (node.input !== undefined) step.input = node.input
    if (node.output !== undefined) step.output = node.output
    if (node.error !== undefined) step.error = node.error
    if (node.replay) step.payload = { replay: true }
    return step
  })
  return createRun({ id: input.id, title: input.title, steps })
}

export type TokenMix = {
  input: number
  output: number
  cacheRead: number
  cacheWrite: number
}

/**
 * Adapter for a model-router blend: micro-units per 1_000 tokens of `mix`.
 * Weights do not need to sum to 1_000; the result is scaled to that size.
 */
export function blendedCostPer1k(pricing: PricingTable, model: string, mix: TokenMix): Micro {
  const sample: RunStep = {
    id: "blend",
    name: "blend",
    kind: "llm",
    model,
    tokensIn: mix.input,
    tokensOut: mix.output,
    cacheRead: mix.cacheRead,
    cacheWrite: mix.cacheWrite,
    status: "success",
  }
  const total = count(mix.input, "input") + count(mix.output, "output") + count(mix.cacheRead, "cacheRead") + count(mix.cacheWrite, "cacheWrite")
  if (total === BigInt(0)) return BigInt(0)
  return mulDiv(pricedCost(sample, pricing), BigInt(1000), total)
}
