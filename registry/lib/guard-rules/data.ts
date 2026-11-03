const BLOCKED = new Set(["__proto__", "prototype", "constructor"])

export type DataRow = { path: string; value: string }

export function encodeDataValue(value: unknown): string {
  if (typeof value === "string") return value
  if (typeof value === "number" || typeof value === "boolean" || value === null) return JSON.stringify(value)
  return JSON.stringify(value)
}

export function parseDataValue(raw: string): unknown {
  if (raw === "true") return true
  if (raw === "false") return false
  if (raw === "null") return null
  if (/^-?\d+(\.\d+)?$/.test(raw)) return Number(raw)
  if (raw.startsWith("[") || raw.startsWith("{")) {
    try {
      return JSON.parse(raw) as unknown
    } catch {
      return raw
    }
  }
  return raw
}

export function flattenData(data: Record<string, unknown>): DataRow[] {
  const rows: DataRow[] = []
  const visit = (value: unknown, path: string) => {
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      const keys = Object.keys(value as Record<string, unknown>).sort()
      if (keys.length === 0 && path) rows.push({ path, value: "{}" })
      for (const key of keys) visit((value as Record<string, unknown>)[key], path ? `${path}.${key}` : key)
      return
    }
    if (path) rows.push({ path, value: encodeDataValue(value) })
  }
  visit(data, "")
  return rows
}

export function unflattenData(rows: readonly DataRow[]): Record<string, unknown> {
  const root: Record<string, unknown> = {}
  for (const row of rows) {
    if (!row.path.trim()) continue
    const parts = row.path.split(".")
    if (parts.some((part) => BLOCKED.has(part) || part.trim() === "")) continue
    let cursor: Record<string, unknown> = root
    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index]!
      const next = cursor[part]
      if (next === null || typeof next !== "object" || Array.isArray(next)) {
        const created: Record<string, unknown> = {}
        cursor[part] = created
        cursor = created
      } else {
        cursor = next as Record<string, unknown>
      }
    }
    const leaf = parts[parts.length - 1]!
    cursor[leaf] = parseDataValue(row.value)
  }
  return root
}
