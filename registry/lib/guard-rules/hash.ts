import type { GuardAction } from "./types"

function stableStringify(value: unknown): string {
  if (value === undefined) return "null"
  if (value === null || typeof value !== "object") return JSON.stringify(value)
  if (Array.isArray(value)) return `[${value.map((item) => stableStringify(item)).join(",")}]`
  const record = value as Record<string, unknown>
  const keys = Object.keys(record).sort()
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`).join(",")}}`
}

/** Deterministic hash of an action. Same payload, same hash. Not a secret. */
export function actionHash(action: GuardAction): string {
  const body: Record<string, unknown> = {
    accountId: action.accountId,
    kind: action.kind,
    data: action.data,
  }
  if (action.text !== undefined) body.text = action.text
  const json = stableStringify(body)
  let hash = 2166136261
  for (let index = 0; index < json.length; index += 1) {
    hash ^= json.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16).padStart(8, "0")
}

export function stableStringifyValue(value: unknown): string {
  return stableStringify(value)
}
