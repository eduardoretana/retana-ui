import { actionData, describeCondition, evalCondition } from "./condition"
import type { DecisionKind, Evaluation, GuardAction, GuardLocale, GuardRule, RuleTrace, Ruleset, TerminalDecision } from "./types"
import { GuardError } from "./types"

function kindMatches(kinds: readonly string[], kind: string) {
  return kinds.includes("*") || kinds.includes(kind)
}

function pickDecision(fired: readonly DecisionKind[], missing: boolean): { decision: TerminalDecision; failClosed: boolean } {
  if (fired.includes("block")) return { decision: "block", failClosed: false }
  if (fired.includes("handoff_to_human")) return { decision: "handoff_to_human", failClosed: false }
  if (fired.includes("require_approval")) return { decision: "require_approval", failClosed: missing }
  if (missing) return { decision: "require_approval", failClosed: true }
  return { decision: "allow", failClosed: false }
}

/**
 * Pure, deterministic evaluation.
 * Missing data never resolves to allow: it becomes require_approval (fail-closed)
 * unless a fired block or handoff_to_human already outranks it.
 * A proven false condition does not become missing.
 * log always accumulates and never chooses the decision.
 */
export function evaluateRules(ruleset: Ruleset, action: GuardAction, clock: () => number): Evaluation {
  if (ruleset.accountId !== action.accountId) {
    throw new GuardError("isolation", "The ruleset account does not match the action account.")
  }
  const data = actionData(action.data, action.text)
  const traces: RuleTrace[] = []
  const firedDecisions: DecisionKind[] = []
  const fired: Evaluation["fired"][number][] = []
  const logs: Evaluation["logs"][number][] = []
  const missing = new Set<string>()

  for (const rule of ruleset.rules) {
    if (!rule.enabled || !kindMatches(rule.kinds, action.kind)) {
      traces.push({
        ruleId: rule.id,
        ruleName: rule.name,
        kindMatched: rule.enabled && kindMatches(rule.kinds, action.kind),
        status: "skipped",
        missingPaths: [],
      })
      continue
    }
    const condition = evalCondition(rule.conditions, data)
    if (condition.result === "missing") {
      for (const path of condition.missingPaths) missing.add(path)
      traces.push({
        ruleId: rule.id,
        ruleName: rule.name,
        kindMatched: true,
        status: "missing",
        decision: rule.decision,
        reasonKey: rule.reasonKey,
        missingPaths: condition.missingPaths,
        condition: condition.trace,
      })
      continue
    }
    if (condition.result === "true") {
      firedDecisions.push(rule.decision)
      fired.push({ ruleId: rule.id, decision: rule.decision, reasonKey: rule.reasonKey })
      if (rule.decision === "log") logs.push({ ruleId: rule.id, reasonKey: rule.reasonKey })
      traces.push({
        ruleId: rule.id,
        ruleName: rule.name,
        kindMatched: true,
        status: "fired",
        decision: rule.decision,
        reasonKey: rule.reasonKey,
        missingPaths: [],
        condition: condition.trace,
      })
      continue
    }
    traces.push({
      ruleId: rule.id,
      ruleName: rule.name,
      kindMatched: true,
      status: "matched_false",
      decision: rule.decision,
      reasonKey: rule.reasonKey,
      missingPaths: [],
      condition: condition.trace,
    })
  }

  const picked = pickDecision(firedDecisions, missing.size > 0)
  return {
    accountId: action.accountId,
    kind: action.kind,
    rulesetId: ruleset.id,
    rulesetVersion: ruleset.version,
    decision: picked.decision,
    failClosed: picked.failClosed,
    fired,
    logs,
    missingPaths: [...missing].sort(),
    traces,
    evaluatedAt: clock(),
  }
}

export function describeRule(rule: GuardRule, locale: GuardLocale): string {
  const kinds = rule.kinds.join(", ")
  const conditions = describeCondition(rule.conditions, locale)
  if (locale === "es") return `Cuando ${kinds}. Si ${conditions}. Entonces ${rule.decision}.`
  return `When ${kinds}. If ${conditions}. Then ${rule.decision}.`
}
