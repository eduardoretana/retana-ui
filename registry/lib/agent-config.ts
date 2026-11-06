/**
 * Pure model for the agent configuration console.
 * Clean-room. No reference source, sample rows, or assets.
 *
 * Shared shapes, not imports:
 * - model-router (PR #70, not on CPL) stores `amountPer1k`, `p95Ms`, and a
 *   `FallbackChain` of ids. This file keeps example rates per 1M tokens
 *   (the cost-waterfall candidate) and converts them with `exampleAmountPer1k`.
 * - guard-rules (PR #65, not on CPL) uses DecisionKind and Condition.
 *   Actions here add `redact` and `require_citation`. `eq` / `gt` / `missing`
 *   map onto that condition vocabulary. This evaluator does not open tickets.
 */

export const VERSION_STATES = ["draft", "published"] as const
export type VersionState = (typeof VERSION_STATES)[number]

export const BAND_IDS = ["reject", "review", "auto"] as const
export type BandId = (typeof BAND_IDS)[number]

export const GUARDRAIL_ACTIONS = ["redact", "block", "require_approval", "require_citation", "allow"] as const
export type GuardrailAction = (typeof GUARDRAIL_ACTIONS)[number]

export const RUN_EVENT_KINDS = ["decision", "guardrail", "fallback", "test"] as const
export type RunEventKind = (typeof RUN_EVENT_KINDS)[number]

export const MIN_BAND_WIDTH = 5
export const TOUCH_HOLD_MS = 360
export const TOUCH_SLOP_PX = 8

export type BandSpan = { min: number; max: number }

/** Three spans over 0–100. A valid set is a partition: reject, then review, then auto. */
export type ConfidenceBands = {
  reject: BandSpan
  review: BandSpan
  auto: BandSpan
}

export type BandIssueCode = "range" | "order" | "gap" | "overlap" | "narrow"

export type BandIssue = {
  code: BandIssueCode
  band?: BandId
}

export type AccuracyLevel = "low" | "mid" | "high"

export type AgentIconName = "leads" | "documents" | "followup" | "notes" | "route" | "duplicates"

/** Example rates per 1M tokens. cost-waterfall owns the live pricer; this is not a bill. */
export type ExampleRatePerMillion = {
  modelId: string
  currency: string
  inputPerMillion: number
  outputPerMillion: number
  example: true
}

export type ExampleModel = {
  id: string
  name: string
  /** Same role as model-router `ModelRoute.vendor`. "Ejemplo" marks a fake provider. */
  vendor: string
  currency: string
  inputPerMillion: number
  outputPerMillion: number
  /** Example p95 latency in milliseconds. Same unit as model-router `ModelMetrics.p95Ms`. */
  p95Ms: number
  example: true
}

export type FallbackKind = "timeout" | "error" | "unavailable"

export type FallbackCondition =
  | { kind: "timeout"; afterMs: number }
  | { kind: "error" }
  | { kind: "unavailable" }

/**
 * One primary and one fallback for a single agent.
 * model-router's `FallbackChain.modelIds` is the ordered list this can join later.
 * The timeout condition is local until that chain grows a reason.
 */
export type ModelBinding = {
  primaryId: string
  fallbackId: string
  fallback: FallbackCondition
}

export type GuardrailCondition =
  | { op: "always" }
  | { op: "eq"; path: string; value: boolean }
  | { op: "gt"; path: string; param: string }
  | { op: "missing"; path: string }

export type GuardrailParamKind = "number" | "string" | "boolean"

export type GuardrailParamSpec = {
  key: string
  kind: GuardrailParamKind
}

/** Registered by the host. The evaluator refuses a rule that does not match one. */
export type GuardrailType = {
  type: string
  action: GuardrailAction
  condition: GuardrailCondition
  params: readonly GuardrailParamSpec[]
}

export type GuardrailParams = Readonly<Record<string, string | number | boolean>>

export type Guardrail = {
  id: string
  type: string
  enabled: boolean
  action: GuardrailAction
  condition: GuardrailCondition
  params: GuardrailParams
  /** Stable key a future approval ticket can store. Not a sentence. */
  reasonKey: string
  label: string
  detail: string
}

export type GuardrailContext = {
  flags: Readonly<Record<string, boolean>>
  numbers: Readonly<Record<string, number>>
  missing: readonly string[]
}

export type GuardrailProblemCode = "unregistered" | "mismatch" | "param"

export type GuardrailProblem = {
  id: string
  code: GuardrailProblemCode
}

export type GuardrailHit = {
  id: string
  type: string
  action: GuardrailAction
  reasonKey: string
  /** True when an allow-rule is off and the case still asked for that capability. */
  denied: boolean
}

export type EvaluationSummary = {
  periodDays: number
  /** Counts for confidence 0 through 100. Empty means no decisions in the period. */
  distribution: readonly number[]
  accuracy: number
}

export type AgentVersion = {
  id: string
  agentId: string
  number: number
  state: VersionState
  author: string
  /** ISO-8601 timestamp. */
  at: string
  instructions: string
  binding: ModelBinding
  bands: ConfidenceBands
  guardrails: readonly Guardrail[]
  evaluation: EvaluationSummary
}

export type ConfiguredAgent = {
  id: string
  name: string
  summary: string
  icon: AgentIconName
  workflowCount: number
  accuracy: number
  accuracyLevel: AccuracyLevel
}

export type AgentKpi = {
  id: string
  label: string
  value: string
  delta: string
  caption: string
  series: readonly number[]
  tone: "accent" | "success" | "warning" | "danger"
}

export type UsageCostSlot = {
  periodDays: number
  currency: string
  exampleSpend: number
  exampleBudget: number
}

export type AgentWorkspace = {
  title: string
  summary: string
  kpis: readonly AgentKpi[]
  usage: UsageCostSlot
}

/** Proposed run-event shape. This console does not store a log. */
export type AgentRunEvent = {
  id: string
  agentId: string
  versionNumber: number
  at: string
  kind: RunEventKind
  confidence?: number
  band?: BandId
  guardrailId?: string
}

/**
 * What a require_approval hit can hand to guard-rules later.
 * It is not an ApprovalTicket and this console does not open one.
 */
export type ApprovalHandoff = {
  guardrailId: string
  reasonKey: string
  rulesetVersion: number
  threshold?: number
}

export type TestDecision = "auto" | "review" | "reject" | "blocked" | "needs_approval" | "needs_citation" | "none"

export type TestPromptInput = {
  agentId: string
  version: AgentVersion
  prompt: string
  context: GuardrailContext
}

export type TestPromptResult = {
  decision: TestDecision
  confidence: number
  band: BandId | "none"
  hits: readonly GuardrailHit[]
}

export type RunTest = (input: TestPromptInput) => Promise<TestPromptResult>

export type TestCase = {
  id: string
  label: string
  prompt: string
  context: GuardrailContext
}

export type VersionChange =
  | { kind: "instructions"; before: string; after: string }
  | { kind: "primary"; beforeId: string; afterId: string }
  | { kind: "fallback"; beforeId: string; afterId: string }
  | { kind: "fallbackCondition"; before: string; after: string }
  | { kind: "bands"; before: string; after: string }
  | { kind: "guardrail"; id: string; label: string; before: string; after: string }

export type BandImpact = {
  reject: number
  review: number
  auto: number
  unassigned: number
  total: number
}

export function exampleRate(model: ExampleModel): ExampleRatePerMillion {
  return {
    modelId: model.id,
    currency: model.currency,
    inputPerMillion: model.inputPerMillion,
    outputPerMillion: model.outputPerMillion,
    example: true,
  }
}

/**
 * Share-weighted per-1K amount in the model's currency.
 * model-router stores this on `ModelMetrics.amountPer1k`.
 * Default mix is 3/4 input and 1/4 output. Cache rates stay with cost-waterfall.
 */
export function exampleAmountPer1k(
  model: ExampleModel,
  mix: { input: number; output: number } = { input: 0.75, output: 0.25 },
) {
  const perMillion = model.inputPerMillion * mix.input + model.outputPerMillion * mix.output
  return perMillion / 1000
}

export function accuracyLevelFor(accuracy: number): AccuracyLevel {
  if (accuracy >= 95) return "high"
  if (accuracy >= 85) return "mid"
  return "low"
}

export function partitionBands(rejectBelow: number, autoAbove: number): ConfidenceBands {
  return {
    reject: { min: 0, max: rejectBelow },
    review: { min: rejectBelow, max: autoAbove },
    auto: { min: autoAbove, max: 100 },
  }
}

export function clampThresholds(
  rejectBelow: number,
  autoAbove: number,
  minWidth = MIN_BAND_WIDTH,
): { rejectBelow: number; autoAbove: number } {
  const reject = Math.min(100 - 2 * minWidth, Math.max(minWidth, Math.round(rejectBelow)))
  const auto = Math.min(100 - minWidth, Math.max(reject + minWidth, Math.round(autoAbove)))
  return { rejectBelow: reject, autoAbove: auto }
}

export function validateBands(bands: ConfidenceBands, minWidth = MIN_BAND_WIDTH): BandIssue[] {
  const issues: BandIssue[] = []
  for (const band of BAND_IDS) {
    const span = bands[band]
    const finite = Number.isFinite(span.min) && Number.isFinite(span.max)
    const inside = span.min >= 0 && span.max <= 100
    const integers = Number.isInteger(span.min) && Number.isInteger(span.max)
    if (!finite || !inside || !integers) issues.push({ code: "range", band })
    if (finite && span.max - span.min < minWidth) issues.push({ code: "narrow", band })
  }

  const ordered =
    bands.reject.min <= bands.review.min &&
    bands.review.min <= bands.auto.min &&
    bands.reject.max <= bands.review.max &&
    bands.review.max <= bands.auto.max
  if (!ordered) issues.push({ code: "order" })

  if (bands.reject.min > 0) issues.push({ code: "gap", band: "reject" })
  if (bands.review.min > bands.reject.max) issues.push({ code: "gap", band: "review" })
  if (bands.auto.min > bands.review.max) issues.push({ code: "gap", band: "auto" })
  if (bands.auto.max < 100) issues.push({ code: "gap", band: "auto" })

  if (bands.review.min < bands.reject.max) issues.push({ code: "overlap", band: "review" })
  if (bands.auto.min < bands.review.max) issues.push({ code: "overlap", band: "auto" })

  return issues
}

export function bandsAreValid(bands: ConfidenceBands, minWidth = MIN_BAND_WIDTH) {
  return validateBands(bands, minWidth).length === 0
}

/** Reject is [min, max). Review is [min, max]. Auto is (min, max]. */
export function bandForScore(score: number, bands: ConfidenceBands): BandId | "none" {
  if (!Number.isFinite(score)) return "none"
  if (score >= bands.reject.min && score < bands.reject.max) return "reject"
  if (score >= bands.review.min && score <= bands.review.max) return "review"
  if (score > bands.auto.min && score <= bands.auto.max) return "auto"
  return "none"
}

export function bandImpact(distribution: readonly number[], bands: ConfidenceBands): BandImpact {
  const impact: BandImpact = { reject: 0, review: 0, auto: 0, unassigned: 0, total: 0 }
  const limit = Math.min(distribution.length, 101)
  for (let score = 0; score < limit; score += 1) {
    const count = distribution[score] ?? 0
    if (!Number.isFinite(count) || count <= 0) continue
    impact.total += count
    const band = bandForScore(score, bands)
    if (band === "none") impact.unassigned += count
    else impact[band] += count
  }
  return impact
}

export function peakedDistribution(center: number, spread: number): number[] {
  return Array.from({ length: 101 }, (_, score) => Math.max(0, spread - Math.abs(score - center)))
}

export function binSeries(distribution: readonly number[], buckets: number): number[] {
  const size = Math.max(1, buckets)
  const out = Array.from({ length: size }, () => 0)
  for (let score = 0; score <= 100; score += 1) {
    const index = Math.min(size - 1, Math.floor((score / 101) * size))
    out[index] = (out[index] ?? 0) + (distribution[score] ?? 0)
  }
  return out
}

function sameCondition(left: GuardrailCondition, right: GuardrailCondition) {
  if (left.op !== right.op) return false
  if (left.op === "always" && right.op === "always") return true
  if (left.op === "eq" && right.op === "eq") return left.path === right.path && left.value === right.value
  if (left.op === "gt" && right.op === "gt") return left.path === right.path && left.param === right.param
  if (left.op === "missing" && right.op === "missing") return left.path === right.path
  return false
}

function paramProblems(rule: Guardrail, type: GuardrailType) {
  const specs = new Map(type.params.map((spec) => [spec.key, spec.kind]))
  for (const key of Object.keys(rule.params)) {
    if (!specs.has(key)) return true
  }
  for (const spec of type.params) {
    const value = rule.params[spec.key]
    if (typeof value !== spec.kind) return true
  }
  return false
}

export function guardrailProblems(rules: readonly Guardrail[], types: readonly GuardrailType[]): GuardrailProblem[] {
  const problems: GuardrailProblem[] = []
  for (const rule of rules) {
    const type = types.find((item) => item.type === rule.type)
    if (!type) {
      problems.push({ id: rule.id, code: "unregistered" })
      continue
    }
    if (type.action !== rule.action || !sameCondition(type.condition, rule.condition)) {
      problems.push({ id: rule.id, code: "mismatch" })
      continue
    }
    if (paramProblems(rule, type)) problems.push({ id: rule.id, code: "param" })
  }
  return problems
}

export function conditionMatches(condition: GuardrailCondition, params: GuardrailParams, context: GuardrailContext) {
  if (condition.op === "always") return true
  if (condition.op === "eq") return context.flags[condition.path] === condition.value
  if (condition.op === "missing") return context.missing.includes(condition.path)
  const left = context.numbers[condition.path]
  const right = params[condition.param]
  return typeof left === "number" && typeof right === "number" && left > right
}

function readyRules(rules: readonly Guardrail[], types: readonly GuardrailType[]) {
  const problems = new Set(guardrailProblems(rules, types).map((problem) => problem.id))
  return rules.filter((rule) => !problems.has(rule.id))
}

export function evaluateGuardrails(
  rules: readonly Guardrail[],
  context: GuardrailContext,
  types: readonly GuardrailType[],
): GuardrailHit[] {
  const hits: GuardrailHit[] = []
  for (const rule of readyRules(rules, types)) {
    if (!rule.enabled) continue
    if (!conditionMatches(rule.condition, rule.params, context)) continue
    hits.push({ id: rule.id, type: rule.type, action: rule.action, reasonKey: rule.reasonKey, denied: false })
  }
  return hits
}

/** An allow-rule that is off still reports when the case asked for that capability. */
export function deniedCapabilities(
  rules: readonly Guardrail[],
  context: GuardrailContext,
  types: readonly GuardrailType[],
): GuardrailHit[] {
  const hits: GuardrailHit[] = []
  for (const rule of readyRules(rules, types)) {
    if (rule.action !== "allow" || rule.enabled) continue
    if (!conditionMatches(rule.condition, rule.params, context)) continue
    hits.push({ id: rule.id, type: rule.type, action: "block", reasonKey: rule.reasonKey, denied: true })
  }
  return hits
}

export function approvalHandoff(hit: GuardrailHit, version: AgentVersion, rules: readonly Guardrail[]): ApprovalHandoff | null {
  if (hit.action !== "require_approval" || hit.denied) return null
  const rule = rules.find((item) => item.id === hit.id)
  const threshold = rule?.params.threshold
  const handoff: ApprovalHandoff = {
    guardrailId: hit.id,
    reasonKey: hit.reasonKey,
    rulesetVersion: version.number,
  }
  if (typeof threshold === "number") handoff.threshold = threshold
  return handoff
}

export function confidenceFromPrompt(prompt: string) {
  let hash = 0
  for (const char of prompt) hash = (Math.imul(hash, 33) + (char.codePointAt(0) ?? 0)) >>> 0
  return hash % 101
}

export function decideTest(band: BandId | "none", hits: readonly GuardrailHit[]): TestDecision {
  if (hits.some((hit) => hit.denied || hit.action === "block")) return "blocked"
  if (hits.some((hit) => hit.action === "require_approval")) return "needs_approval"
  if (hits.some((hit) => hit.action === "require_citation")) return "needs_citation"
  if (band === "none") return "none"
  return band
}

export function simulateTest(input: TestPromptInput, types: readonly GuardrailType[]): TestPromptResult {
  const confidence = confidenceFromPrompt(input.prompt)
  const band = bandForScore(confidence, input.version.bands)
  const hits = [
    ...evaluateGuardrails(input.version.guardrails, input.context, types),
    ...deniedCapabilities(input.version.guardrails, input.context, types),
  ]
  return { decision: decideTest(band, hits), confidence, band, hits }
}

export function defaultRunTest(types: readonly GuardrailType[]): RunTest {
  return (input) => Promise.resolve(simulateTest(input, types))
}

function fallbackText(condition: FallbackCondition) {
  if (condition.kind === "timeout") return `timeout:${condition.afterMs}`
  return condition.kind
}

function bandText(bands: ConfidenceBands) {
  return `${bands.reject.max}/${bands.review.max}/${bands.auto.max}`
}

function guardrailText(rule: Guardrail) {
  const params = Object.keys(rule.params)
    .sort()
    .map((key) => `${key}=${String(rule.params[key])}`)
    .join(",")
  return `${rule.enabled ? "on" : "off"}:${params}`
}

export function diffVersions(published: AgentVersion, draft: AgentVersion): VersionChange[] {
  const changes: VersionChange[] = []
  if (published.instructions !== draft.instructions) {
    changes.push({ kind: "instructions", before: published.instructions, after: draft.instructions })
  }
  if (published.binding.primaryId !== draft.binding.primaryId) {
    changes.push({ kind: "primary", beforeId: published.binding.primaryId, afterId: draft.binding.primaryId })
  }
  if (published.binding.fallbackId !== draft.binding.fallbackId) {
    changes.push({ kind: "fallback", beforeId: published.binding.fallbackId, afterId: draft.binding.fallbackId })
  }
  const beforeFallback = fallbackText(published.binding.fallback)
  const afterFallback = fallbackText(draft.binding.fallback)
  if (beforeFallback !== afterFallback) {
    changes.push({ kind: "fallbackCondition", before: beforeFallback, after: afterFallback })
  }
  if (bandText(published.bands) !== bandText(draft.bands)) {
    changes.push({ kind: "bands", before: bandText(published.bands), after: bandText(draft.bands) })
  }
  const beforeRules = new Map(published.guardrails.map((rule) => [rule.id, rule]))
  for (const rule of draft.guardrails) {
    const previous = beforeRules.get(rule.id)
    const after = guardrailText(rule)
    const before = previous ? guardrailText(previous) : "absent"
    if (before !== after) changes.push({ kind: "guardrail", id: rule.id, label: rule.label, before, after })
  }
  return changes
}

export function latestPublished(versions: readonly AgentVersion[], agentId: string) {
  return versions
    .filter((version) => version.agentId === agentId && version.state === "published")
    .reduce<AgentVersion | null>((best, version) => (best == null || version.number > best.number ? version : best), null)
}

export function listedDraft(versions: readonly AgentVersion[], agentId: string) {
  return versions.find((version) => version.agentId === agentId && version.state === "draft") ?? null
}

export function toDraft(version: AgentVersion): AgentVersion {
  return {
    ...version,
    id: version.state === "draft" ? version.id : `${version.id}:draft`,
    state: "draft",
    bands: {
      reject: { ...version.bands.reject },
      review: { ...version.bands.review },
      auto: { ...version.bands.auto },
    },
    binding: {
      ...version.binding,
      fallback: version.binding.fallback.kind === "timeout"
        ? { kind: "timeout", afterMs: version.binding.fallback.afterMs }
        : version.binding.fallback.kind === "error"
          ? { kind: "error" }
          : { kind: "unavailable" },
    },
    guardrails: version.guardrails.map((rule) => ({ ...rule, params: { ...rule.params } })),
    evaluation: { ...version.evaluation, distribution: [...version.evaluation.distribution] },
  }
}

export function formatCount(value: number, locale: "es" | "en") {
  return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US").format(value)
}

export function formatExampleMoney(amount: number, locale: "es" | "en", currency: string) {
  return new Intl.NumberFormat(locale === "es" ? "es-MX" : "en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatStamp(iso: string, locale: "es" | "en") {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return iso
  return new Intl.DateTimeFormat(locale === "es" ? "es-MX" : "en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "UTC",
  }).format(date)
}

export type AgentConfigLabels = {
  usageCost: string
  newAgent: string
  agents: string
  model: string
  instructions: string
  guardrails: string
  evaluation: string
  history: string
  hideHistory: string
  testPrompt: string
  hideTest: string
  runTest: string
  runningTest: string
  saveDraft: string
  saving: string
  publish: string
  publishing: string
  rollback: string
  rollingBack: string
  backToList: string
  openMenu: string
  closeMenu: string
  live: string
  draft: string
  published: string
  dirty: string
  readOnly: string
  emptyTitle: string
  emptyBody: string
  loading: string
  primaryModel: string
  fallbackModel: string
  fallbackWhen: string
  timeout: string
  errorCondition: string
  unavailable: string
  afterMs: string
  examplePrice: string
  exampleLatency: string
  reject: string
  review: string
  auto: string
  rejectBelow: string
  autoAbove: string
  bandHint: string
  invalidBands: string
  noDistribution: string
  unassigned: string
  range: string
  order: string
  gap: string
  overlap: string
  narrow: string
  diffTitle: string
  noDiff: string
  historyEmpty: string
  restore: string
  testDecision: string
  testConfidence: string
  testBand: string
  testGuardrails: string
  testNone: string
  workflows: string
  accuracyHigh: string
  accuracyMid: string
  accuracyLow: string
  publishFailed: string
  saveFailed: string
  rollbackFailed: string
  testFailed: string
  threshold: string
  menuTitle: string
  version: string
  caseLabel: string
  decisionReject: string
  decisionReview: string
  decisionAuto: string
  decisionBlocked: string
  decisionApproval: string
  decisionCitation: string
  decisionNone: string
  allowDenied: string
  rejectHandle: string
  autoHandle: string
  listHelp: string
  impactLabel: string
  instructionsHint: string
  accuracyCaption: string
  period: string
  guardrailProblem: string
  closeNav: string
}

const enLabels: AgentConfigLabels = {
  usageCost: "Usage and cost",
  newAgent: "New agent",
  agents: "Agents",
  model: "Model",
  instructions: "Instructions",
  guardrails: "Guardrails",
  evaluation: "Evaluation",
  history: "History",
  hideHistory: "Hide history",
  testPrompt: "Test prompt",
  hideTest: "Hide test",
  runTest: "Run test",
  runningTest: "Running test",
  saveDraft: "Save draft",
  saving: "Saving draft",
  publish: "Publish version",
  publishing: "Publishing",
  rollback: "Restore this version",
  rollingBack: "Restoring",
  backToList: "Back to agents",
  openMenu: "Open navigation",
  closeMenu: "Close navigation",
  live: "Live",
  draft: "Draft",
  published: "Published",
  dirty: "Unsaved draft",
  readOnly: "Read only",
  emptyTitle: "No agents yet",
  emptyBody: "Create the first agent for this workspace.",
  loading: "Loading agents",
  primaryModel: "Primary model",
  fallbackModel: "Fallback model",
  fallbackWhen: "Fallback when",
  timeout: "The primary times out",
  errorCondition: "The primary returns an error",
  unavailable: "The primary is unavailable",
  afterMs: "Timeout in milliseconds",
  examplePrice: "Example price per 1M input tokens",
  exampleLatency: "Example p95",
  reject: "Reject",
  review: "Review",
  auto: "Auto",
  rejectBelow: "Reject below",
  autoAbove: "Auto above",
  bandHint: "Drag a handle, or type a number. Arrow keys move the focused handle.",
  invalidBands: "These bands do not cover 0 to 100 in order. Fix them before publishing.",
  noDistribution: "No decisions in this period.",
  unassigned: "Outside the bands",
  range: "A bound is outside 0 to 100.",
  order: "Reject, review, and auto are out of order.",
  gap: "There is a gap between bands.",
  overlap: "Two bands overlap.",
  narrow: "A band is narrower than the minimum.",
  diffTitle: "Draft compared with live",
  noDiff: "The draft matches the live version.",
  historyEmpty: "No earlier version.",
  restore: "Restore",
  testDecision: "Decision",
  testConfidence: "Confidence",
  testBand: "Band",
  testGuardrails: "Guardrails that fired",
  testNone: "No guardrail fired.",
  workflows: "workflows",
  accuracyHigh: "High",
  accuracyMid: "Medium",
  accuracyLow: "Low",
  publishFailed: "Publish did not go through. The live version is unchanged.",
  saveFailed: "The draft was not saved. Your last saved copy is back.",
  rollbackFailed: "That version was not restored. Live stays as it was.",
  testFailed: "The test did not finish. Nothing was published.",
  threshold: "Amount threshold",
  menuTitle: "Workspace navigation",
  version: "Version",
  caseLabel: "Sample case",
  decisionReject: "Reject this decision.",
  decisionReview: "Send this decision to review.",
  decisionAuto: "Approve this decision.",
  decisionBlocked: "A guardrail blocked the decision.",
  decisionApproval: "A person has to approve this first.",
  decisionCitation: "A source citation is still missing.",
  decisionNone: "This score sits outside the bands.",
  allowDenied: "Turned off, so the lookup is refused.",
  rejectHandle: "Reject threshold",
  autoHandle: "Auto threshold",
  listHelp: "Use the arrow keys to move between agents.",
  impactLabel: "Decisions in each band",
  instructionsHint: "What this agent should do. The draft stores this text.",
  accuracyCaption: "Accuracy",
  period: "Last 30 days",
  guardrailProblem: "This guardrail does not match a type the host registered.",
  closeNav: "Close",
}

const esLabels: AgentConfigLabels = {
  usageCost: "Uso y costo",
  newAgent: "Nuevo agente",
  agents: "Agentes",
  model: "Modelo",
  instructions: "Instrucciones",
  guardrails: "Guardas",
  evaluation: "Evaluación",
  history: "Historial",
  hideHistory: "Ocultar historial",
  testPrompt: "Probar indicación",
  hideTest: "Ocultar prueba",
  runTest: "Correr prueba",
  runningTest: "Corriendo prueba",
  saveDraft: "Guardar borrador",
  saving: "Guardando borrador",
  publish: "Publicar versión",
  publishing: "Publicando",
  rollback: "Restaurar esta versión",
  rollingBack: "Restaurando",
  backToList: "Volver a los agentes",
  openMenu: "Abrir navegación",
  closeMenu: "Cerrar navegación",
  live: "En vivo",
  draft: "Borrador",
  published: "Publicada",
  dirty: "Borrador sin guardar",
  readOnly: "Solo lectura",
  emptyTitle: "Aún no hay agentes",
  emptyBody: "Crea el primer agente de este espacio.",
  loading: "Cargando agentes",
  primaryModel: "Modelo primario",
  fallbackModel: "Modelo de respaldo",
  fallbackWhen: "Usar respaldo cuando",
  timeout: "El primario agota el tiempo",
  errorCondition: "El primario responde con error",
  unavailable: "El primario no está disponible",
  afterMs: "Tiempo límite en milisegundos",
  examplePrice: "Precio de ejemplo por millón de tokens de entrada",
  exampleLatency: "p95 de ejemplo",
  reject: "Rechazar",
  review: "Revisión",
  auto: "Automático",
  rejectBelow: "Rechazar por debajo de",
  autoAbove: "Automático por encima de",
  bandHint: "Arrastra un control o escribe el número. Las flechas mueven el control enfocado.",
  invalidBands: "Estas bandas no cubren de 0 a 100 en orden. Corrígelas antes de publicar.",
  noDistribution: "No hay decisiones en este periodo.",
  unassigned: "Fuera de las bandas",
  range: "Un límite está fuera de 0 a 100.",
  order: "Rechazar, revisión y automático están fuera de orden.",
  gap: "Hay un hueco entre bandas.",
  overlap: "Dos bandas se solapan.",
  narrow: "Una banda es más angosta que el mínimo.",
  diffTitle: "Borrador contra la versión en vivo",
  noDiff: "El borrador coincide con la versión en vivo.",
  historyEmpty: "No hay una versión anterior.",
  restore: "Restaurar",
  testDecision: "Decisión",
  testConfidence: "Confianza",
  testBand: "Banda",
  testGuardrails: "Guardas que se activaron",
  testNone: "Ninguna guarda se activó.",
  workflows: "flujos",
  accuracyHigh: "Alta",
  accuracyMid: "Media",
  accuracyLow: "Baja",
  publishFailed: "No se publicó. La versión en vivo sigue igual.",
  saveFailed: "No se guardó el borrador. Volvió la última copia guardada.",
  rollbackFailed: "No se restauró esa versión. La versión en vivo sigue igual.",
  testFailed: "La prueba no terminó. No se publicó nada.",
  threshold: "Umbral del monto",
  menuTitle: "Navegación del espacio",
  version: "Versión",
  caseLabel: "Caso de ejemplo",
  decisionReject: "Rechazar esta decisión.",
  decisionReview: "Mandar esta decisión a revisión.",
  decisionAuto: "Aprobar esta decisión.",
  decisionBlocked: "Una guarda bloqueó la decisión.",
  decisionApproval: "Una persona tiene que aprobar esto primero.",
  decisionCitation: "Falta la cita de una fuente.",
  decisionNone: "Esta puntuación queda fuera de las bandas.",
  allowDenied: "Está apagada, así que la consulta se niega.",
  rejectHandle: "Umbral de rechazo",
  autoHandle: "Umbral automático",
  listHelp: "Usa las flechas para moverte entre agentes.",
  impactLabel: "Decisiones en cada banda",
  instructionsHint: "Qué debe hacer este agente. El borrador guarda este texto.",
  accuracyCaption: "Precisión",
  period: "Últimos 30 días",
  guardrailProblem: "Esta guarda no coincide con un tipo que el anfitrión registró.",
  closeNav: "Cerrar",
}

export function agentConfigLabels(locale: "es" | "en", partial?: Partial<AgentConfigLabels>): AgentConfigLabels {
  const base = locale === "es" ? esLabels : enLabels
  if (!partial) return base
  const next = { ...base }
  for (const key of Object.keys(partial) as (keyof AgentConfigLabels)[]) {
    const value = partial[key]
    if (value !== undefined) next[key] = value
  }
  return next
}

export function issueCopy(code: BandIssueCode, labels: AgentConfigLabels) {
  if (code === "range") return labels.range
  if (code === "order") return labels.order
  if (code === "gap") return labels.gap
  if (code === "overlap") return labels.overlap
  return labels.narrow
}

export function decisionCopy(decision: TestDecision, labels: AgentConfigLabels) {
  if (decision === "blocked") return labels.decisionBlocked
  if (decision === "needs_approval") return labels.decisionApproval
  if (decision === "needs_citation") return labels.decisionCitation
  if (decision === "reject") return labels.decisionReject
  if (decision === "review") return labels.decisionReview
  if (decision === "auto") return labels.decisionAuto
  return labels.decisionNone
}

export function bandCopy(band: BandId | "none", labels: AgentConfigLabels) {
  if (band === "reject") return labels.reject
  if (band === "review") return labels.review
  if (band === "auto") return labels.auto
  return labels.unassigned
}

export function levelCopy(level: AccuracyLevel, labels: AgentConfigLabels) {
  if (level === "high") return labels.accuracyHigh
  if (level === "mid") return labels.accuracyMid
  return labels.accuracyLow
}
