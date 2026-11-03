import {
  MemoryApprovalGate,
  MemoryAuditLog,
  createIdSequence,
  evaluateRules,
  guardAction,
  gitMergeApprovalRuleset,
  syntheticGitMerge,
} from "@/registry/retana/lib/guard-rules"

/** Stable example for another tool. kind is "git.merge". No network. */
export function simularMerge(now: number) {
  const ruleset = { ...gitMergeApprovalRuleset("marca-sintetica"), version: 1 }
  const action = syntheticGitMerge("marca-sintetica")
  const evaluation = evaluateRules(ruleset, action, () => now)
  const gate = new MemoryApprovalGate(createIdSequence("apr"))
  const audit = new MemoryAuditLog()
  const outcome = guardAction(
    { ruleset, gate, audit, clock: () => now, nextAuditId: createIdSequence("aud") },
    action,
  )
  const stored = outcome.approval ? gate.get(action.accountId, outcome.approval.id, now) : null
  return { evaluation, outcome, stored }
}
