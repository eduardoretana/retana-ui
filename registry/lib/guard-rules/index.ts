/**
 * Public API v1.
 *
 * Stable for other tools, including a CI merge gate:
 * - GuardAction.kind (open string, for example "git.merge")
 * - evaluateRules
 * - ApprovalGate, ApprovalTicket, MemoryApprovalGate
 * - guardAction
 *
 * Do not rename these without a major bump. WhatsApp is only the preset.
 */

export {
  APPROVAL_STATUSES,
  DECISION_KINDS,
  DECISION_PRECEDENCE,
  DEFAULT_APPROVAL_TTL_MS,
  GUARD_ROLES,
  GuardError,
  REASON,
} from "./types"
export type {
  Actor,
  ApprovalStatus,
  Condition,
  ConditionTrace,
  DecisionKind,
  Evaluation,
  FiredRule,
  GuardAction,
  GuardErrorCode,
  GuardLocale,
  GuardRole,
  GuardRule,
  MessageCatalog,
  RuleTrace,
  Ruleset,
  RulesetDraft,
  RulesetSummary,
  Scalar,
  TerminalDecision,
} from "./types"

export { GUARD_MESSAGES, decisionLabel, explain, formatGuardTime, guardMessage } from "./messages"
export { actionHash } from "./hash"
export { addChildCondition, blankCondition, conditionAt, describeCondition, removeChildCondition, replaceCondition } from "./condition"
export { describeRule, evaluateRules } from "./evaluate"
export { parseCondition, parseDraft, parseRule, parseRuleset } from "./schema"
export { MemoryApprovalGate } from "./approval-gate"
export type {
  ApprovalConsumeCommand,
  ApprovalDecisionCommand,
  ApprovalGate,
  ApprovalListQuery,
  ApprovalRequest,
  ApprovalTicket,
} from "./approval-gate"
export { MemoryAuditLog } from "./audit-log"
export type { AuditDraft, AuditLog, AuditRecord } from "./audit-log"
export { MemoryRulesetStore } from "./rulesets"
export type { RulesetPort } from "./rulesets"
export { guardAction } from "./guard-action"
export type { GuardDeps, GuardOutcome } from "./guard-action"
export {
  SYNTHETIC_ACCOUNT,
  SYNTHETIC_PHONE,
  SYNTHETIC_PHONE_LABEL,
  WHATSAPP_KINDS,
  mejoravitRequiredPaths,
  mejoravitWhatsappRuleset,
  syntheticSafeSend,
  syntheticUnvalidatedOffer,
  syntheticValidatedOffer,
} from "./preset"
export { gitMergeApprovalRuleset, mapExampleCrmWebhook, syntheticGitMerge } from "./webhook"
export type { ExampleCrmWebhook } from "./webhook"
export { encodeDataValue, flattenData, parseDataValue, unflattenData } from "./data"
export type { DataRow } from "./data"

export function createIdSequence(prefix: string) {
  let value = 0
  return () => {
    value += 1
    return `${prefix}_${value}`
  }
}
