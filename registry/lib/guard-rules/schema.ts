import { isBlockedPath } from "./condition"
import type { Condition, DecisionKind, GuardRule, Ruleset, RulesetDraft, Scalar } from "./types"
import { DECISION_KINDS, GuardError } from "./types"

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
}

function isScalar(value: unknown): value is Scalar {
  return value === null || ["string", "number", "boolean"].includes(typeof value)
}

const OPS = ["and", "or", "not", "eq", "neq", "gt", "gte", "lt", "lte", "in", "exists", "missing", "includes", "text_includes"] as const

function isOp(value: string): value is Condition["op"] {
  return (OPS as readonly string[]).includes(value)
}

export function parseCondition(value: unknown, errors: string[], where: string): Condition | null {
  if (!isRecord(value) || typeof value.op !== "string" || !isOp(value.op)) {
    errors.push(`${where} needs a known op`)
    return null
  }
  if (value.op === "and" || value.op === "or") {
    if (!Array.isArray(value.conditions)) {
      errors.push(`${where}.conditions must be a list`)
      return null
    }
    const conditions: Condition[] = []
    value.conditions.forEach((child, index) => {
      const parsed = parseCondition(child, errors, `${where}.conditions[${index}]`)
      if (parsed) conditions.push(parsed)
    })
    return { op: value.op, conditions }
  }
  if (value.op === "not") {
    const condition = parseCondition(value.condition, errors, `${where}.condition`)
    return condition ? { op: "not", condition } : null
  }
  if (typeof value.path !== "string" || isBlockedPath(value.path)) {
    errors.push(`${where}.path is empty or unsafe`)
    return null
  }
  if (value.op === "exists" || value.op === "missing") return { op: value.op, path: value.path }
  if (value.op === "in") {
    if (!Array.isArray(value.values) || value.values.some((item) => !isScalar(item))) {
      errors.push(`${where}.values must be scalars`)
      return null
    }
    return { op: "in", path: value.path, values: value.values }
  }
  if (value.op === "gt" || value.op === "gte" || value.op === "lt" || value.op === "lte") {
    if (typeof value.value !== "number" || Number.isNaN(value.value)) {
      errors.push(`${where}.value must be a number`)
      return null
    }
    return { op: value.op, path: value.path, value: value.value }
  }
  if (value.op === "includes" || value.op === "text_includes") {
    if (typeof value.value !== "string") {
      errors.push(`${where}.value must be a string`)
      return null
    }
    return { op: value.op, path: value.path, value: value.value }
  }
  if (value.op !== "eq" && value.op !== "neq") {
    errors.push(`${where} could not be parsed`)
    return null
  }
  if (!isScalar(value.value)) {
    errors.push(`${where}.value must be a scalar`)
    return null
  }
  return { op: value.op, path: value.path, value: value.value }
}

export function parseRule(value: unknown, errors: string[], where: string): GuardRule | null {
  if (!isRecord(value)) {
    errors.push(`${where} must be an object`)
    return null
  }
  if (typeof value.id !== "string" || typeof value.name !== "string" || typeof value.reasonKey !== "string") {
    errors.push(`${where} needs id, name, and reasonKey`)
    return null
  }
  if (!Array.isArray(value.kinds) || value.kinds.some((kind) => typeof kind !== "string" || kind.length === 0)) {
    errors.push(`${where}.kinds must be non-empty strings`)
    return null
  }
  if (typeof value.enabled !== "boolean") {
    errors.push(`${where}.enabled must be boolean`)
    return null
  }
  if (typeof value.decision !== "string" || !DECISION_KINDS.includes(value.decision as DecisionKind)) {
    errors.push(`${where}.decision is unknown`)
    return null
  }
  const conditions = parseCondition(value.conditions, errors, `${where}.conditions`)
  if (!conditions) return null
  if (value.decision === "allow" && conditions.op === "and" && conditions.conditions.length === 0) {
    errors.push(`${where} allow cannot be unconditional`)
    return null
  }
  const rule: GuardRule = {
    id: value.id,
    name: value.name,
    enabled: value.enabled,
    kinds: [...value.kinds],
    conditions,
    decision: value.decision as DecisionKind,
    reasonKey: value.reasonKey,
  }
  if (value.approvalTtlMs !== undefined) {
    if (typeof value.approvalTtlMs !== "number" || value.approvalTtlMs <= 0) {
      errors.push(`${where}.approvalTtlMs must be a positive number`)
      return null
    }
    rule.approvalTtlMs = value.approvalTtlMs
  }
  return rule
}

export function parseRuleset(value: unknown): { ok: true; ruleset: Ruleset } | { ok: false; errors: string[] } {
  const errors: string[] = []
  if (!isRecord(value)) return { ok: false, errors: ["ruleset must be an object"] }
  if (typeof value.id !== "string" || typeof value.accountId !== "string" || typeof value.name !== "string") {
    errors.push("ruleset needs id, accountId, and name")
  }
  if (typeof value.version !== "number" || !Number.isInteger(value.version) || value.version < 1) {
    errors.push("version must be an integer >= 1")
  }
  if (!Array.isArray(value.rules)) errors.push("rules must be a list")
  const rules: GuardRule[] = []
  if (Array.isArray(value.rules)) {
    value.rules.forEach((rule, index) => {
      const parsed = parseRule(rule, errors, `rules[${index}]`)
      if (parsed) rules.push(parsed)
    })
  }
  if (errors.length || typeof value.id !== "string" || typeof value.accountId !== "string" || typeof value.name !== "string" || typeof value.version !== "number") {
    return { ok: false, errors }
  }
  return { ok: true, ruleset: { id: value.id, accountId: value.accountId, version: value.version, name: value.name, rules } }
}

export function parseDraft(value: unknown): RulesetDraft {
  const parsed = parseRuleset({ ...(isRecord(value) ? value : {}), version: 1 })
  if (!parsed.ok) throw new GuardError("invalid", parsed.errors.join("; "))
  return { id: parsed.ruleset.id, accountId: parsed.ruleset.accountId, name: parsed.ruleset.name, rules: parsed.ruleset.rules }
}
