import type { Condition, ConditionTrace, GuardLocale, Scalar } from "./types"

const BLOCKED_PATH = new Set(["__proto__", "prototype", "constructor"])

export type CondEval = {
  result: "true" | "false" | "missing"
  missingPaths: string[]
  trace: ConditionTrace
}

function unique(paths: string[]) {
  return [...new Set(paths)].sort()
}

export function isBlockedPath(path: string) {
  return path.split(".").some((part) => BLOCKED_PATH.has(part) || part.trim() === "")
}

export function readPath(data: Record<string, unknown>, path: string): { ok: true; value: unknown } | { ok: false } {
  if (!path || isBlockedPath(path)) return { ok: false }
  let current: unknown = data
  for (const part of path.split(".")) {
    if (current === null || typeof current !== "object" || Array.isArray(current)) return { ok: false }
    if (!Object.prototype.hasOwnProperty.call(current, part)) return { ok: false }
    current = (current as Record<string, unknown>)[part]
    if (current === undefined) return { ok: false }
  }
  return { ok: true, value: current }
}

function leaf(op: string, path: string, result: CondEval["result"]): CondEval {
  const missingPaths = result === "missing" ? [path] : []
  return { result, missingPaths, trace: { op, path, result, missingPaths } }
}

function foldText(value: string) {
  return value.normalize("NFKC").replace(/[\u200B-\u200D\uFEFF]/g, "").toLocaleLowerCase("es-MX")
}

function asNumber(value: unknown): number | null {
  if (typeof value !== "number" || Number.isNaN(value)) return null
  return value
}

export function evalCondition(condition: Condition, data: Record<string, unknown>): CondEval {
  if (condition.op === "and" || condition.op === "or") {
    const children = condition.conditions.map((child) => evalCondition(child, data))
    const results = children.map((child) => child.result)
    let result: CondEval["result"]
    if (condition.op === "and") {
      if (results.length === 0) result = "true"
      else if (results.some((item) => item === "false")) result = "false"
      else if (results.some((item) => item === "missing")) result = "missing"
      else result = "true"
    } else if (results.length === 0) result = "false"
    else if (results.some((item) => item === "true")) result = "true"
    else if (results.some((item) => item === "missing")) result = "missing"
    else result = "false"
    const missingPaths = result === "missing" ? unique(children.flatMap((child) => child.missingPaths)) : []
    return {
      result,
      missingPaths,
      trace: { op: condition.op, result, missingPaths, children: children.map((child) => child.trace) },
    }
  }

  if (condition.op === "not") {
    const child = evalCondition(condition.condition, data)
    const result: CondEval["result"] = child.result === "missing" ? "missing" : child.result === "true" ? "false" : "true"
    const missingPaths = result === "missing" ? child.missingPaths : []
    return { result, missingPaths, trace: { op: "not", result, missingPaths, children: [child.trace] } }
  }

  if (!("path" in condition)) {
    return { result: "missing", missingPaths: [], trace: { op: condition.op, result: "missing", missingPaths: [] } }
  }

  if (condition.op === "exists" || condition.op === "missing") {
    const present = readPath(data, condition.path).ok
    const ok = condition.op === "exists" ? present : !present
    return leaf(condition.op, condition.path, ok ? "true" : "false")
  }

  const found = readPath(data, condition.path)
  if (!found.ok) return leaf(condition.op, condition.path, "missing")
  const value = found.value

  if (condition.op === "eq") return leaf(condition.op, condition.path, Object.is(value, condition.value) ? "true" : "false")
  if (condition.op === "neq") return leaf(condition.op, condition.path, Object.is(value, condition.value) ? "false" : "true")

  if (condition.op === "gt" || condition.op === "gte" || condition.op === "lt" || condition.op === "lte") {
    const number = asNumber(value)
    if (number === null) return leaf(condition.op, condition.path, "missing")
    const ok =
      condition.op === "gt"
        ? number > condition.value
        : condition.op === "gte"
          ? number >= condition.value
          : condition.op === "lt"
            ? number < condition.value
            : number <= condition.value
    return leaf(condition.op, condition.path, ok ? "true" : "false")
  }

  if (condition.op === "in") {
    const hit = condition.values.some((item) => Object.is(item, value as Scalar))
    return leaf(condition.op, condition.path, hit ? "true" : "false")
  }

  if (condition.op === "includes" || condition.op === "text_includes") {
    if (condition.op === "includes") {
      if (!Array.isArray(value) || value.some((item) => typeof item !== "string")) return leaf(condition.op, condition.path, "missing")
      return leaf(condition.op, condition.path, value.includes(condition.value) ? "true" : "false")
    }
    if (typeof value !== "string" || !condition.value) return leaf(condition.op, condition.path, typeof value === "string" ? "false" : "missing")
    const hit = foldText(value).includes(foldText(condition.value))
    return leaf(condition.op, condition.path, hit ? "true" : "false")
  }

  return leaf(condition.op, condition.path, "missing")
}

export function actionData(data: Record<string, unknown>, text: string | undefined): Record<string, unknown> {
  if (Object.prototype.hasOwnProperty.call(data, "text") || text === undefined) return data
  return { ...data, text }
}

const OP_ES: Record<string, string> = {
  and: "y",
  or: "o",
  not: "no",
  eq: "es",
  neq: "no es",
  gt: "es mayor que",
  gte: "es al menos",
  lt: "es menor que",
  lte: "es como máximo",
  in: "está en",
  exists: "existe",
  missing: "falta",
  includes: "incluye",
  text_includes: "el texto incluye",
}

const OP_EN: Record<string, string> = {
  and: "and",
  or: "or",
  not: "not",
  eq: "is",
  neq: "is not",
  gt: "is greater than",
  gte: "is at least",
  lt: "is less than",
  lte: "is at most",
  in: "is in",
  exists: "exists",
  missing: "is missing",
  includes: "includes",
  text_includes: "the text includes",
}

function literal(value: unknown) {
  return typeof value === "string" ? value : JSON.stringify(value)
}

export function describeCondition(condition: Condition, locale: GuardLocale): string {
  const word = (locale === "es" ? OP_ES : OP_EN)[condition.op] ?? condition.op
  if (condition.op === "and" || condition.op === "or") {
    if (condition.conditions.length === 0) return locale === "es" ? "siempre" : "always"
    return condition.conditions.map((child) => describeCondition(child, locale)).join(` ${word} `)
  }
  if (condition.op === "not") return `${word} (${describeCondition(condition.condition, locale)})`
  if (condition.op === "exists" || condition.op === "missing") return `${condition.path} ${word}`
  if (condition.op === "in") return `${condition.path} ${word} ${condition.values.map(literal).join(", ")}`
  if (condition.op === "eq" || condition.op === "neq" || condition.op === "includes" || condition.op === "text_includes") {
    return `${condition.path} ${word} ${literal(condition.value)}`
  }
  if (condition.op === "gt" || condition.op === "gte" || condition.op === "lt" || condition.op === "lte") {
    return `${condition.path} ${word} ${condition.value}`
  }
  return word
}

export function blankCondition(op: Condition["op"]): Condition {
  if (op === "and" || op === "or") return { op, conditions: [] }
  if (op === "not") return { op, condition: { op: "exists", path: "topic" } }
  if (op === "eq" || op === "neq") return { op, path: "topic", value: "" }
  if (op === "gt" || op === "gte" || op === "lt" || op === "lte") return { op, path: "stuckCount", value: 0 }
  if (op === "in") return { op, path: "stage", values: [] }
  if (op === "exists" || op === "missing") return { op, path: "topic" }
  return { op, path: "text", value: "" }
}

export function replaceCondition(root: Condition, path: number[], next: Condition): Condition {
  if (path.length === 0) return next
  const [head, ...rest] = path
  if (head === undefined) return root
  if (root.op === "and" || root.op === "or") {
    return {
      ...root,
      conditions: root.conditions.map((child, index) => (index === head ? replaceCondition(child, rest, next) : child)),
    }
  }
  if (root.op === "not" && head === 0) return { ...root, condition: replaceCondition(root.condition, rest, next) }
  return root
}

export function addChildCondition(root: Condition, path: number[], child: Condition = blankCondition("eq")): Condition {
  const target = conditionAt(root, path)
  if (!target) return root
  if (target.op === "and" || target.op === "or") {
    return replaceCondition(root, path, { ...target, conditions: [...target.conditions, child] })
  }
  if (target.op === "not") return root
  const group: Condition = { op: "and", conditions: [target, child] }
  return replaceCondition(root, path, group)
}

export function removeChildCondition(root: Condition, path: number[]): Condition {
  if (path.length === 0) return root
  const parentPath = path.slice(0, -1)
  const index = path[path.length - 1]
  const parent = conditionAt(root, parentPath)
  if (!parent || index === undefined) return root
  if (parent.op === "and" || parent.op === "or") {
    return replaceCondition(root, parentPath, {
      ...parent,
      conditions: parent.conditions.filter((_, childIndex) => childIndex !== index),
    })
  }
  return root
}

export function conditionAt(root: Condition, path: number[]): Condition | null {
  let current: Condition = root
  for (const index of path) {
    if (current.op === "and" || current.op === "or") {
      const next = current.conditions[index]
      if (!next) return null
      current = next
      continue
    }
    if (current.op === "not" && index === 0) {
      current = current.condition
      continue
    }
    return null
  }
  return current
}
