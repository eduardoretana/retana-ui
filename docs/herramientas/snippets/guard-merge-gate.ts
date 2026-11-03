/**
 * Connects CI Checks Live to the guard-rules port from PR #65.
 * Their ApprovalGate (create/get/decide/consume) is not our review() gate.
 * alwaysAskApproval stays the default. Install @retana/guard-rules before importing this file.
 * Verified against cursor/herramientas-guard-rules-ea36 (kind "git.merge").
 */
import type { ApprovalGate as CiMergeGate, MergeApprovalRequest } from "../../../registry/lib/ci-checks/approval"
import {
  MemoryAuditLog,
  createIdSequence,
  gitMergeApprovalRuleset,
  guardAction,
  type Actor,
  type ApprovalGate as GuardApprovalGate,
  type AuditLog,
  type GuardAction,
  type Ruleset,
} from "@/registry/retana/lib/guard-rules"

export type GuardMergeOptions = {
  accountId: string
  gate: GuardApprovalGate
  /** Same account, role "approver". Used only after the person confirms. */
  approver: Actor
  ruleset?: Ruleset
  audit?: AuditLog
  clock?: () => number
  /** The stock ruleset asks for a person only when this is true. */
  checksGreen?: () => boolean
}

export function guardRulesMergeGate(options: GuardMergeOptions): CiMergeGate {
  const clock = options.clock ?? (() => Date.now())
  const audit = options.audit ?? new MemoryAuditLog()
  const nextAuditId = createIdSequence("aud")
  const ruleset = options.ruleset ?? { ...gitMergeApprovalRuleset(options.accountId), version: 1 }

  return {
    review(request: MergeApprovalRequest) {
      const action: GuardAction = {
        accountId: options.accountId,
        kind: "git.merge",
        data: {
          repository: `${request.owner}/${request.repo}`,
          pullRequest: request.pullNumber,
          sha: request.sha,
          checksGreen: options.checksGreen?.() ?? true,
        },
      }
      const deps = { ruleset, gate: options.gate, audit, clock, nextAuditId }
      let outcome = guardAction(deps, action)
      if (outcome.decision === "block" || outcome.decision === "handoff_to_human") {
        const reason = outcome.evaluation?.fired[0]?.reasonKey ?? outcome.decision
        return { decision: "denied" as const, reason }
      }
      if (outcome.decision === "allow") {
        return { decision: "granted" as const, grantedBy: outcome.approval?.decidedBy ?? request.grantedBy ?? "guard" }
      }
      if (!request.confirmed || !request.grantedBy || !outcome.approval) {
        return { decision: "required" as const }
      }
      options.gate.decide({
        accountId: options.accountId,
        actor: options.approver,
        id: outcome.approval.id,
        outcome: "approved",
        now: clock(),
      })
      outcome = guardAction(deps, action)
      if (outcome.decision !== "allow") return { decision: "required" as const }
      return { decision: "granted" as const, grantedBy: request.grantedBy }
    },
  }
}
