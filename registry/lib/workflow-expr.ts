/**
 * Expression mapper for workflow config fields.
 * Own interpreter: paths, indexes, and a small whitelist of pure helpers.
 * It does not interpret the text as a program. No host globals are read.
 *
 * Idea only (not source): n8n and Make map fields with braces. Those products
 * are not copied. See docs/learnings/L-KULESZO-workflow-builder.md.
 */

export type ExpressionContext = {
  json?: unknown
  input?: unknown
  payload?: unknown
  nodes?: Record<string, { json?: unknown }>
}

export type ExpressionFn = (args: readonly unknown[]) => unknown

export type ExpressionResult = {
  value: unknown
  error?: string
}

export type ExpressionCompletion = {
  label: string
  detail: string
  insert: string
}

const BLOCKED = new Set([
  "__proto__",
  "constructor",
  "prototype",
  "__defineGetter__",
  "__defineSetter__",
  "__lookupGetter__",
  "__lookupSetter__",
])

const BLOCKED_FNS = new Set([...BLOCKED, "eval", "Function", "globalThis", "window", "process", "require"])

export const workflowExpressionFns: Record<string, ExpressionFn> = {
  upper: (args) => String(args[0] ?? "").toLocaleUpperCase("es-MX"),
  lower: (args) => String(args[0] ?? "").toLocaleLowerCase("es-MX"),
  len: (args) => {
    const value = args[0]
    if (typeof value === "string" || Array.isArray(value)) return value.length
    return 0
  },
  coalesce: (args) => args.find((value) => value != null && value !== "") ?? null,
}

type Token =
  | { kind: "num"; value: number }
  | { kind: "str"; value: string }
  | { kind: "id"; value: string }
  | { kind: "sym"; value: string }

function tokenize(source: string): Token[] | { error: string } {
  const tokens: Token[] = []
  let index = 0
  while (index < source.length) {
    const char = source[index] ?? ""
    if (/\s/.test(char)) {
      index += 1
      continue
    }
    if (char === '"' || char === "'") {
      const quote = char
      let value = ""
      index += 1
      while (index < source.length && source[index] !== quote) {
        const current = source[index] ?? ""
        if (current === "\\") {
          value += source[index + 1] ?? ""
          index += 2
          continue
        }
        value += current
        index += 1
      }
      if (source[index] !== quote) return { error: "Falta la comilla de cierre." }
      index += 1
      tokens.push({ kind: "str", value })
      continue
    }
    if (/[0-9]/.test(char) || (char === "-" && /[0-9]/.test(source[index + 1] ?? ""))) {
      const start = index
      index += 1
      while (index < source.length && /[0-9.]/.test(source[index] ?? "")) index += 1
      const value = Number(source.slice(start, index))
      if (!Number.isFinite(value)) return { error: "Número inválido." }
      tokens.push({ kind: "num", value })
      continue
    }
    if (/[A-Za-z_$]/.test(char)) {
      const start = index
      index += 1
      while (index < source.length && /[A-Za-z0-9_$]/.test(source[index] ?? "")) index += 1
      tokens.push({ kind: "id", value: source.slice(start, index) })
      continue
    }
    if ("[]().,".includes(char)) {
      tokens.push({ kind: "sym", value: char })
      index += 1
      continue
    }
    return { error: `Carácter no permitido (${char}).` }
  }
  return tokens
}

function isFailure(value: unknown): value is { error: string } {
  return Boolean(value && typeof value === "object" && "error" in value && typeof (value as { error?: unknown }).error === "string" && Object.keys(value).length === 1)
}

function isNodeRoot(value: unknown): value is { __nodeRoot: true } {
  return Boolean(value && typeof value === "object" && (value as { __nodeRoot?: unknown }).__nodeRoot === true)
}

function readKey(current: unknown, key: string): unknown {
  if (BLOCKED.has(key)) return { error: "Esa propiedad no está permitida." }
  if (isNodeRoot(current)) return { error: "Usa corchetes para nombrar el nodo." }
  if (current == null || typeof current !== "object") return { error: `No hay propiedad ${key}.` }
  if (!Object.prototype.hasOwnProperty.call(current, key)) return { error: `No existe la ruta ${key}.` }
  return (current as Record<string, unknown>)[key]
}

function readIndex(current: unknown, index: number): unknown {
  if (!Array.isArray(current)) return { error: "Ese valor no es una lista." }
  if (!Number.isInteger(index) || index < 0 || index >= current.length) return { error: "El índice está fuera de la lista." }
  if (!Object.prototype.hasOwnProperty.call(current, index)) return { error: "El índice está fuera de la lista." }
  return current[index]
}

class Parser {
  private index = 0

  constructor(
    private readonly tokens: Token[],
    private readonly ctx: ExpressionContext,
    private readonly fns: Record<string, ExpressionFn>,
  ) {}

  parse(): ExpressionResult {
    const value = this.expression()
    if (isFailure(value)) return value
    if (this.peek()) return { value: undefined, error: "La expresión no se leyó por completo." }
    return { value }
  }

  private peek() {
    return this.tokens[this.index]
  }

  private take() {
    const token = this.tokens[this.index]
    this.index += 1
    return token
  }

  private expression(): unknown {
    return this.postfix(this.primary())
  }

  private primary(): unknown {
    const token = this.take()
    if (!token) return { error: "La expresión está vacía." }
    if (token.kind === "num" || token.kind === "str") return token.value
    if (token.kind === "sym" && token.value === "(") {
      const inner = this.expression()
      if (isFailure(inner)) return inner
      const close = this.take()
      if (!close || close.kind !== "sym" || close.value !== ")") return { error: "Falta el paréntesis de cierre." }
      return inner
    }
    if (token.kind !== "id") return { error: "La expresión debe empezar con un nombre o un valor." }
    if (BLOCKED.has(token.value) || BLOCKED_FNS.has(token.value)) return { error: "Ese nombre no está permitido." }
    if (token.value === "$json") return this.ctx.json
    if (token.value === "$input") return this.ctx.input
    if (token.value === "$payload") return this.ctx.payload
    if (token.value === "$node") return { __nodeRoot: true as const }
    const fn = this.fns[token.value]
    const next = this.peek()
    if (next?.kind === "sym" && next.value === "(") {
      if (!fn) return { error: `La función ${token.value} no está permitida.` }
      this.take()
      const args: unknown[] = []
      if (!(this.peek()?.kind === "sym" && this.peek()?.value === ")")) {
        while (this.index < this.tokens.length) {
          const arg = this.expression()
          if (isFailure(arg)) return arg
          args.push(arg)
          const sep = this.peek()
          if (sep?.kind === "sym" && sep.value === ",") {
            this.take()
            continue
          }
          break
        }
      }
      const close = this.take()
      if (!close || close.kind !== "sym" || close.value !== ")") return { error: "Falta el paréntesis de la función." }
      return fn(args)
    }
    return { error: `Nombre desconocido (${token.value}).` }
  }

  private postfix(current: unknown): unknown {
    if (isFailure(current)) return current
    while (this.peek()) {
      const token = this.peek()
      if (token?.kind === "sym" && token.value === ".") {
        this.take()
        const prop = this.take()
        if (!prop || prop.kind !== "id") return { error: "Falta el nombre de la propiedad." }
        current = readKey(current, prop.value)
        if (isFailure(current)) return current
        continue
      }
      if (token?.kind === "sym" && token.value === "[") {
        this.take()
        const key = this.expression()
        if (isFailure(key)) return key
        const close = this.take()
        if (!close || close.kind !== "sym" || close.value !== "]") return { error: "Falta el corchete de cierre." }
        if (isNodeRoot(current)) {
          if (typeof key !== "string") return { error: "El nodo se nombra con texto." }
          if (BLOCKED.has(key)) return { error: "Ese nombre no está permitido." }
          const nodes = this.ctx.nodes ?? {}
          if (!Object.prototype.hasOwnProperty.call(nodes, key)) return { error: `No existe el nodo ${key}.` }
          current = { json: nodes[key]?.json }
          continue
        }
        if (typeof key === "number") current = readIndex(current, key)
        else if (typeof key === "string") current = readKey(current, key)
        else return { error: "El índice tiene que ser texto o número." }
        if (isFailure(current)) return current
        continue
      }
      break
    }
    return current
  }
}

function splitMustache(source: string): { kind: "text" | "expr"; text: string }[] | { error: string } {
  const parts: { kind: "text" | "expr"; text: string }[] = []
  let cursor = 0
  while (cursor < source.length) {
    const open = source.indexOf("{{", cursor)
    if (open < 0) {
      parts.push({ kind: "text", text: source.slice(cursor) })
      break
    }
    if (open > cursor) parts.push({ kind: "text", text: source.slice(cursor, open) })
    const close = source.indexOf("}}", open + 2)
    if (close < 0) return { error: "Falta cerrar la expresión." }
    parts.push({ kind: "expr", text: source.slice(open + 2, close).trim() })
    cursor = close + 2
  }
  return parts
}

export function resolveExpression(
  source: string,
  ctx: ExpressionContext = {},
  fns: Record<string, ExpressionFn> = workflowExpressionFns,
): ExpressionResult {
  const safeFns: Record<string, ExpressionFn> = {}
  for (const [name, fn] of Object.entries(fns)) {
    if (BLOCKED_FNS.has(name) || BLOCKED.has(name)) continue
    safeFns[name] = fn
  }
  const parts = splitMustache(source)
  if ("error" in parts) return { value: undefined, error: parts.error }
  const expressions = parts.filter((part) => part.kind === "expr")
  if (expressions.length === 0) return { value: source }
  const run = (text: string): ExpressionResult => {
    if (!text) return { value: undefined, error: "La expresión está vacía." }
    const tokens = tokenize(text)
    if ("error" in tokens) return { value: undefined, error: tokens.error }
    return new Parser(tokens, ctx, safeFns).parse()
  }
  if (parts.length === 1 && parts[0]?.kind === "expr") return run(parts[0].text)
  let text = ""
  for (const part of parts) {
    if (part.kind === "text") {
      text += part.text
      continue
    }
    const resolved = run(part.text)
    if (resolved.error) return resolved
    text += resolved.value == null ? "" : String(resolved.value)
  }
  return { value: text }
}

export function schemaKeys(schema: unknown): string[] {
  if (!schema || typeof schema !== "object" || Array.isArray(schema)) return []
  const record = schema as Record<string, unknown>
  const properties = record.properties
  if (properties && typeof properties === "object" && !Array.isArray(properties)) {
    return Object.keys(properties).filter((key) => !BLOCKED.has(key))
  }
  return Object.keys(record).filter((key) => !BLOCKED.has(key) && key !== "type")
}

export function ownKeys(value: unknown): string[] {
  if (!value || typeof value !== "object" || Array.isArray(value)) return []
  return Object.keys(value).filter((key) => !BLOCKED.has(key) && Object.prototype.hasOwnProperty.call(value, key))
}

export function expressionCompletions(source: string, caret: number, ctx: ExpressionContext, extraKeys: Record<string, readonly string[]> = {}): ExpressionCompletion[] {
  const until = source.slice(0, Math.max(0, caret))
  const open = until.lastIndexOf("{{")
  if (open < 0) return []
  const close = until.indexOf("}}", open)
  if (close >= 0) return []
  const fragment = until.slice(open + 2).trim()
  const nodeMatch = /\$node\[\s*["']([^"']+)["']\s*\]\.json\.$/.exec(fragment)
  if (nodeMatch) {
    const id = nodeMatch[1] ?? ""
    const keys = extraKeys[id] ?? ownKeys(ctx.nodes?.[id]?.json)
    return keys.map((key) => ({ label: key, detail: id, insert: key }))
  }
  if (/\$json\.$/.test(fragment)) {
    return ownKeys(ctx.json).map((key) => ({ label: key, detail: "$json", insert: key }))
  }
  if (fragment === "" || fragment === "$") {
    return [
      { label: "$json", detail: "salida de este nodo", insert: "$json" },
      { label: "$input", detail: "entrada", insert: "$input" },
      { label: "$node", detail: "salida de otro nodo", insert: '$node["' },
    ]
  }
  if (/^\$node\[$/.test(fragment) || fragment === "$node") {
    return Object.keys(ctx.nodes ?? {})
      .filter((id) => !BLOCKED.has(id))
      .map((id) => ({ label: id, detail: "nodo", insert: `["${id}"].json.` }))
  }
  return []
}

export function expressionErrors(value: unknown, ctx: ExpressionContext, fns?: Record<string, ExpressionFn>): string[] {
  const errors: string[] = []
  const visit = (current: unknown) => {
    if (typeof current === "string" && current.includes("{{")) {
      const resolved = resolveExpression(current, ctx, fns)
      if (resolved.error) errors.push(resolved.error)
      return
    }
    if (Array.isArray(current)) {
      for (const entry of current) visit(entry)
      return
    }
    if (current && typeof current === "object") {
      for (const key of Object.keys(current)) {
        if (BLOCKED.has(key)) {
          errors.push("Esa propiedad no está permitida.")
          continue
        }
        visit((current as Record<string, unknown>)[key])
      }
    }
  }
  visit(value)
  return errors
}
