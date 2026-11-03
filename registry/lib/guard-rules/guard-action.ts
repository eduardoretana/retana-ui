import type { ApprovalGate, ApprovalTicket } from "./approval-gate"
import type { AuditLog } from "./audit-log"
import { evaluateRules } from "./evaluate"
import { actionHash } from "./hash"
import type { Evaluation, GuardAction, Ruleset, TerminalDecision } from "./types"
import { DEFAULT_APPROVAL_TTL_MS, GuardError, REASON } from "./types"

export type GuardDeps = {
  ruleset: Ruleset | null
  gate: ApprovalGate
  audit: AuditLog
  clock: () => number
  nextAuditId: () => string
  agentResponse?: string
}

export type GuardOutcome = {
  decision: TerminalDecision
  evaluation: Evaluation | null
  approval: ApprovalTicket | null
  failClosed: boolean
}

function ttlFor(evaluation: Evaluation, ruleset: Ruleset) {
  const ids = new Set(evaluation.fired.filter((rule) => rule.decision === "require_approval").map((rule) => rule.ruleId))
  const ttls = ruleset.rules.filter((rule) => ids.has(rule.id) && rule.approvalTtlMs !== undefined).map((rule) => rule.approvalTtlMs!)
  if (ttls.length === 0) return DEFAULT_APPROVAL_TTL_MS
  return Math.min(...ttls)
}

function reasonFor(evaluation: Evaluation) {
  const approval = evaluation.fired.find((rule) => rule.decision === "require_approval")
  if (approval) return approval.reasonKey
  if (evaluation.failClosed) return REASON.missing
  return REASON.none
}

/**
 * Hook for an agent loop, before the action runs.
 * A block or a handoff is final. require_approval opens an ApprovalGate ticket.
 * An approved, unconsumed, unexpired ticket for the same action hash and the
 * same ruleset version is consumed once and the outcome becomes allow.
 */
export function guardAction(deps: GuardDeps, action: GuardAction): GuardOutcome {
  const now = deps.clock()
  if (deps.ruleset && deps.ruleset.accountId !== action.accountId) {
    throw new GuardError("isolation", "Refusing to evaluate an action with another account's ruleset.")
  }
  if (!deps.ruleset) {
    const approval = deps.gate.create({
      accountId: action.accountId,
      action,
      rulesetId: "none",
      rulesetVersion: 0,
      reasonKey: REASON.noRuleset,
      ttlMs: DEFAULT_APPROVAL_TTL_MS,
      now,
    })
    deps.audit.append({
      id: deps.nextAuditId(),
      accountId: action.accountId,
      rulesetId: "none",
      rulesetVersion: 0,
      ruleIds: [],
      input: action,
      decision: "require_approval",
      failClosed: true,
      createdAt: now,
      ...(deps.agentResponse !== undefined ? { agentResponse: deps.agentResponse } : {}),
    })
    return { decision: "require_approval", evaluation: null, approval, failClosed: true }
  }

  const evaluation = evaluateRules(deps.ruleset, action, () => now)
  if (evaluation.decision === "block" || evaluation.decision === "handoff_to_human") {
    deps.audit.append(auditFrom(deps, evaluation, action, now))
    return { decision: evaluation.decision, evaluation, approval: null, failClosed: false }
  }

  if (evaluation.decision === "require_approval") {
    const hash = actionHash(action)
    const releasable = deps.gate.list(action.accountId, { now, status: "approved", kind: action.kind }).find((ticket) => {
      return (
        ticket.consumedAt === undefined &&
        ticket.actionHash === hash &&
        ticket.rulesetId === deps.ruleset!.id &&
        ticket.rulesetVersion === deps.ruleset!.version
      )
    })
    if (releasable?.decidedBy) {
      const spent = deps.gate.consume({ accountId: action.accountId, id: releasable.id, action, now })
      deps.audit.append({
        ...auditFrom(deps, evaluation, action, now),
        decision: "allow",
        approver: releasable.decidedBy,
      })
      return { decision: "allow", evaluation, approval: spent, failClosed: false }
    }
    const approval = deps.gate.create({
      accountId: action.accountId,
      action,
      rulesetId: deps.ruleset.id,
      rulesetVersion: deps.ruleset.version,
      reasonKey: reasonFor(evaluation),
      ttlMs: ttlFor(evaluation, deps.ruleset),
      now,
    })
    deps.audit.append(auditFrom(deps, evaluation, action, now))
    return { decision: "require_approval", evaluation, approval, failClosed: evaluation.failClosed }
  }

  deps.audit.append(auditFrom(deps, evaluation, action, now))
  return { decision: "allow", evaluation, approval: null, failClosed: false }
}

function auditFrom(deps: GuardDeps, evaluation: Evaluation, action: GuardAction, now: number) {
  return {
    id: deps.nextAuditId(),
    accountId: action.accountId,
    rulesetId: evaluation.rulesetId,
    rulesetVersion: evaluation.rulesetVersion,
    ruleIds: evaluation.fired.map((rule) => rule.ruleId),
    input: action,
    decision: evaluation.decision,
    failClosed: evaluation.failClosed,
    createdAt: now,
    ...(deps.agentResponse !== undefined ? { agentResponse: deps.agentResponse } : {}),
  }
}
