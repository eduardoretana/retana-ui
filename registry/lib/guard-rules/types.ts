/**
 * Public types for the guard-rules tool core (API v1).
 * Action kinds are open strings. "git.merge" is as valid as a WhatsApp kind.
 */

export const DECISION_KINDS = ["allow", "require_approval", "block", "handoff_to_human", "log"] as const
export type DecisionKind = (typeof DECISION_KINDS)[number]
export type TerminalDecision = Exclude<DecisionKind, "log">

/** block beats handoff, which beats require_approval, which beats allow. log never wins. */
export const DECISION_PRECEDENCE = ["block", "handoff_to_human", "require_approval", "allow"] as const

export const APPROVAL_STATUSES = ["pending", "approved", "rejected", "expired"] as const
export type ApprovalStatus = (typeof APPROVAL_STATUSES)[number]

export const GUARD_ROLES = ["viewer", "editor", "approver"] as const
export type GuardRole = (typeof GUARD_ROLES)[number]

export type GuardLocale = "es" | "en"

export type GuardErrorCode =
  | "isolation"
  | "permission"
  | "expired"
  | "terminal"
  | "replay"
  | "not_found"
  | "invalid"

export class GuardError extends Error {
  readonly code: GuardErrorCode

  constructor(code: GuardErrorCode, message: string) {
    super(message)
    this.name = "GuardError"
    this.code = code
  }
}

export type Actor = {
  id: string
  accountId: string
  role: GuardRole
}

/** One proposed action. `kind` is the "when" of a rule, for example "git.merge". */
export type GuardAction = {
  accountId: string
  kind: string
  data: Record<string, unknown>
  text?: string
}

export type Scalar = string | number | boolean | null

export type Condition =
  | { op: "and" | "or"; conditions: Condition[] }
  | { op: "not"; condition: Condition }
  | { op: "eq" | "neq"; path: string; value: Scalar }
  | { op: "gt" | "gte" | "lt" | "lte"; path: string; value: number }
  | { op: "in"; path: string; values: Scalar[] }
  | { op: "exists" | "missing"; path: string }
  | { op: "includes"; path: string; value: string }
  | { op: "text_includes"; path: string; value: string }

export type GuardRule = {
  id: string
  name: string
  enabled: boolean
  /** Action kinds. "*" matches every kind. */
  kinds: string[]
  conditions: Condition
  decision: DecisionKind
  reasonKey: string
  approvalTtlMs?: number
}

export type Ruleset = {
  id: string
  accountId: string
  version: number
  name: string
  rules: GuardRule[]
}

export type RulesetDraft = {
  id: string
  accountId: string
  name: string
  rules: GuardRule[]
}

export type RulesetSummary = {
  id: string
  name: string
  version: number
  active: boolean
}

export type ConditionTrace = {
  op: string
  path?: string
  result: "true" | "false" | "missing"
  missingPaths: readonly string[]
  children?: readonly ConditionTrace[]
}

export type RuleTrace = {
  ruleId: string
  ruleName: string
  kindMatched: boolean
  status: "skipped" | "fired" | "matched_false" | "missing"
  decision?: DecisionKind
  reasonKey?: string
  missingPaths: readonly string[]
  condition?: ConditionTrace
}

export type FiredRule = {
  ruleId: string
  decision: DecisionKind
  reasonKey: string
}

export type Evaluation = {
  accountId: string
  kind: string
  rulesetId: string
  rulesetVersion: number
  decision: TerminalDecision
  failClosed: boolean
  fired: readonly FiredRule[]
  logs: readonly { ruleId: string; reasonKey: string }[]
  missingPaths: readonly string[]
  traces: readonly RuleTrace[]
  evaluatedAt: number
}

export type MessageCatalog = Readonly<Record<string, { readonly es: string; readonly en: string }>>

export const DEFAULT_APPROVAL_TTL_MS = 15 * 60 * 1000

export const REASON = {
  unvalidatedOffer: "block_unvalidated_offer",
  secrets: "block_sensitive_secret",
  offTopic: "block_off_topic",
  stage: "approval_key_stage",
  document: "approval_document",
  discount: "approval_discount",
  unsolicited: "approval_unsolicited_outbound",
  complaint: "handoff_complaint",
  legal: "handoff_legal",
  human: "handoff_human",
  stuck: "handoff_stuck",
  log: "log_all",
  missing: "fail_closed_missing_data",
  none: "no_rule_matched",
  noRuleset: "fail_closed_no_ruleset",
  gitMerge: "approval_git_merge",
} as const
