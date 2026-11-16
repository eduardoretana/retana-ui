import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { filterCatalog, projectRegistry, type CatalogItem, type RegistryRecord } from "../lib/catalog-core.ts"
import { validateRegistryTree } from "./validate-registry.ts"

const SCHEMA = "retana.catalog/v1"
const HOST_PRIMITIVES = new Set([
  "accordion",
  "alert",
  "alert-dialog",
  "avatar",
  "badge",
  "button",
  "card",
  "checkbox",
  "command",
  "dialog",
  "dropdown-menu",
  "input",
  "popover",
  "scroll-area",
  "select",
  "separator",
  "sheet",
  "sidebar",
  "tabs",
  "tooltip",
])

type CheckStatus = "pass" | "warn" | "fail" | "info"

type Check = {
  id: string
  status: CheckStatus
  message: string
}

type Envelope = {
  schema: typeof SCHEMA
  ok: boolean
  code: string
  sha: string | null
  command: string | null
  message?: string
  suggestions?: string[]
  data: unknown
}

type RegistryFile = {
  name?: string
  items?: RegistryRecord[]
}

function readSha(dir: string) {
  const fromEnv = process.env.RETANA_UI_SHA?.trim()
  if (fromEnv && /^[0-9a-f]{40}$/.test(fromEnv)) return fromEnv
  try {
    const pointer = path.join(dir, ".git")
    if (!fs.existsSync(pointer)) return null
    let gitDir = pointer
    const stat = fs.statSync(pointer)
    if (stat.isFile()) {
      const text = fs.readFileSync(pointer, "utf8").trim()
      const match = /^gitdir:\s*(.+)$/.exec(text)
      if (!match?.[1] || match[1].includes("..")) return null
      gitDir = path.resolve(dir, match[1])
    } else if (!stat.isDirectory()) {
      return null
    }
    const head = fs.readFileSync(path.join(gitDir, "HEAD"), "utf8").trim()
    if (/^[0-9a-f]{40}$/.test(head)) return head
    const ref = head.startsWith("ref: ") ? head.slice(5).trim() : ""
    if (!ref || ref.includes("..") || path.isAbsolute(ref)) return null
    const refFile = path.join(gitDir, ref)
    if (fs.existsSync(refFile) && fs.statSync(refFile).isFile()) {
      const sha = fs.readFileSync(refFile, "utf8").trim()
      return /^[0-9a-f]{40}$/.test(sha) ? sha : null
    }
    const packed = path.join(gitDir, "packed-refs")
    if (!fs.existsSync(packed)) return null
    for (const line of fs.readFileSync(packed, "utf8").split("\n")) {
      if (!line || line.startsWith("#") || line.startsWith("^")) continue
      const [sha, name] = line.split(" ")
      if (name === ref && sha && /^[0-9a-f]{40}$/.test(sha)) return sha
    }
  } catch {
    return null
  }
  return null
}

function readRegistry(dir: string) {
  const file = path.join(dir, "registry.json")
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8")) as RegistryFile
    if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.items)) {
      return { registry: null, unreadable: true }
    }
    return { registry: parsed, unreadable: false }
  } catch {
    return { registry: null, unreadable: true }
  }
}

function brief(item: CatalogItem) {
  return {
    name: item.name,
    kind: item.kind,
    titleEs: item.titleEs,
    categories: item.categories,
  }
}

function suggest(name: string, items: readonly CatalogItem[]) {
  const needle = name.toLowerCase()
  return items
    .filter((item) => {
      const current = item.name.toLowerCase()
      return current.includes(needle) || needle.includes(current)
    })
    .slice(0, 5)
    .map((item) => item.name)
}

function unknownMessage(name: string) {
  const base = `No hay una pieza llamada "${name}".`
  if (!HOST_PRIMITIVES.has(name)) return base
  return `${base} Los primitivos del host se declaran en registryDependencies y no se copian al registry.`
}

function summaryOf(checks: readonly Check[]) {
  return {
    pass: checks.filter((check) => check.status === "pass").length,
    warn: checks.filter((check) => check.status === "warn").length,
    fail: checks.filter((check) => check.status === "fail").length,
    info: checks.filter((check) => check.status === "info").length,
  }
}

function doctor(dir: string, items: readonly CatalogItem[], registryName: string | undefined) {
  const errors = (() => {
    try {
      return validateRegistryTree(dir)
    } catch (error) {
      return [error instanceof Error ? error.message : "validateRegistryTree no pudo leer el árbol."]
    }
  })()
  const shown = errors.slice(0, 20)
  const extra = errors.length > shown.length ? ` (+${errors.length - shown.length} más)` : ""
  const missingPayloads = items.filter(
    (item) => !fs.existsSync(path.join(dir, "public", "r", `${item.name}.json`)),
  )
  const previewMapPath = path.join(dir, "lib", "generated", "preview-map.tsx")
  const previewMap = fs.existsSync(previewMapPath) ? fs.readFileSync(previewMapPath, "utf8") : null
  const missingPreviews = previewMap
    ? items.filter((item) => !previewMap.includes(`"${item.name}"`))
    : items
  const withScenes = items.filter((item) => item.scenes.length > 0).length
  const nameOk = registryName === "retana"
  const checks: Check[] = [
    {
      id: "registry-readable",
      status: nameOk ? "pass" : "fail",
      message: nameOk
        ? `registry.json tiene ${items.length} piezas.`
        : `registry.json name es "${registryName ?? ""}"; se esperaba "retana".`,
    },
    {
      id: "registry-valid",
      status: errors.length ? "fail" : "pass",
      message: errors.length
        ? `${shown.join("\n")}${extra}`
        : "validateRegistryTree devolvió 0 errores.",
    },
    {
      id: "payloads-present",
      status: missingPayloads.length ? "fail" : "pass",
      message: missingPayloads.length
        ? `Faltan ${missingPayloads.length} payloads en public/r. Corre pnpm registry:build; este comando no lo hace.`
        : "Cada pieza tiene public/r/<name>.json.",
    },
    {
      id: "preview-map",
      status: missingPreviews.length ? "fail" : "pass",
      message: missingPreviews.length
        ? "lib/generated/preview-map.tsx no cubre todas las piezas. Este comando no lo regenera."
        : "lib/generated/preview-map.tsx nombra cada pieza.",
    },
    {
      id: "plp-opt-in",
      status: "info",
      message: `${withScenes} piezas declaran meta.scenes. PLP es opt-in.`,
    },
  ]
  return { checks, summary: summaryOf(checks) }
}

function envelope(
  command: string | null,
  code: string,
  ok: boolean,
  data: unknown,
  dir: string,
  extra: Partial<Pick<Envelope, "message" | "suggestions">> = {},
): Envelope {
  return {
    schema: SCHEMA,
    ok,
    code,
    sha: readSha(dir),
    command,
    ...extra,
    data,
  }
}

function emit(body: Envelope, status: number, json: boolean): never {
  if (json) {
    process.stdout.write(`${JSON.stringify(body, null, 2)}\n`)
  } else if (!body.ok) {
    process.stderr.write(`${body.message ?? body.code}\n`)
  } else {
    process.stdout.write(`${human(body)}\n`)
  }
  process.exit(status)
}

function human(body: Envelope) {
  if (body.command === "doctor" && body.data && typeof body.data === "object") {
    const data = body.data as { checks?: Check[]; summary?: { pass: number; warn: number; fail: number; info: number } }
    const lines = (data.checks ?? []).flatMap((check) => [
      `id: ${check.id}`,
      `status: ${check.status}`,
      `message: ${check.message}`,
      "",
    ])
    if (data.summary) {
      lines.push(
        `pass: ${data.summary.pass}`,
        `warn: ${data.summary.warn}`,
        `fail: ${data.summary.fail}`,
        `info: ${data.summary.info}`,
      )
    }
    return lines.join("\n").trimEnd()
  }
  if (body.command === "get" && body.data && typeof body.data === "object") {
    const item = body.data as CatalogItem
    return `${item.name}\n${item.usage}`
  }
  if (body.data && typeof body.data === "object" && "results" in body.data) {
    const results = (body.data as { results: { name: string }[] }).results
    return results.map((item) => item.name).join("\n")
  }
  if (body.data && typeof body.data === "object" && "items" in body.data) {
    const items = (body.data as { items: { name: string }[] }).items
    return items.map((item) => item.name).join("\n")
  }
  return JSON.stringify(body.data, null, 2)
}

function helpText() {
  return [
    "Consulta local del catálogo de retana-ui. Lee registry.json. No escribe ni usa la red.",
    "",
    "node --experimental-strip-types scripts/catalog.ts <comando> [--json]",
    "",
    "  list                 nombres, kind, título y categorías",
    "  get <nombre>         una pieza, con usage y api",
    "  search <texto>       el mismo filtro que el sitio",
    "  manifest             conteos del registry",
    "  doctor               validateRegistryTree y payloads ya generados",
    "",
    "Exit 0: éxito, también una búsqueda vacía y un doctor sin fallos.",
    "Exit 1: registry ilegible o doctor con fallos.",
    "Exit 2: comando, argumento o pieza desconocidos.",
  ].join("\n")
}

function main() {
  const dir = process.cwd()
  const positional: string[] = []
  let json = false
  for (const arg of process.argv.slice(2)) {
    if (arg === "--json") {
      json = true
      continue
    }
    if (arg === "--help" || arg === "-h") {
      process.stdout.write(`${helpText()}\n`)
      process.exit(0)
    }
    if (arg.startsWith("-")) {
      emit(
        envelope(null, "ERR_USAGE", false, null, dir, { message: `Opción desconocida: ${arg}` }),
        2,
        json,
      )
    }
    positional.push(arg)
  }

  const command = positional[0] ?? ""
  const rest = positional.slice(1)
  const known = new Set(["list", "get", "search", "manifest", "doctor"])
  if (!command || !known.has(command)) {
    emit(
      envelope(command || null, "ERR_UNKNOWN_COMMAND", false, null, dir, {
        message: command ? `Comando desconocido: ${command}` : "Falta el comando. Usa --help.",
      }),
      2,
      json,
    )
  }
  if ((command === "get" || command === "search") && rest.length !== 1) {
    emit(
      envelope(command, "ERR_USAGE", false, null, dir, {
        message: command === "get" ? "Uso: get <nombre>" : "Uso: search <texto>",
      }),
      2,
      json,
    )
  }
  if ((command === "list" || command === "manifest" || command === "doctor") && rest.length) {
    emit(
      envelope(command, "ERR_USAGE", false, null, dir, { message: `${command} no acepta argumentos.` }),
      2,
      json,
    )
  }

  const { registry, unreadable } = readRegistry(dir)
  if (unreadable || !registry?.items) {
    emit(
      envelope(command, "ERR_REGISTRY_UNREADABLE", false, null, dir, {
        message: "registry.json no se pudo leer o no tiene un array items.",
      }),
      1,
      json,
    )
  }
  const records = registry.items
  const items = projectRegistry(records)

  if (command === "list") {
    emit(envelope(command, "OK", true, { items: items.map(brief) }, dir), 0, json)
  }
  if (command === "manifest") {
    const kinds: Record<string, number> = {}
    for (const item of records) kinds[item.type] = (kinds[item.type] ?? 0) + 1
    emit(
      envelope(
        command,
        "OK",
        true,
        {
          name: registry.name ?? null,
          itemCount: items.length,
          kinds,
          withScenes: items.filter((item) => item.scenes.length > 0).length,
        },
        dir,
      ),
      0,
      json,
    )
  }
  if (command === "search") {
    const query = rest[0] ?? ""
    const results = filterCatalog(items, { query, kind: "all", category: "all" }).map(brief)
    emit(envelope(command, "OK", true, { query, results }, dir), 0, json)
  }
  if (command === "get") {
    const name = rest[0] ?? ""
    const item = items.find((entry) => entry.name === name)
    if (!item) {
      emit(
        envelope(command, "ERR_UNKNOWN_ITEM", false, null, dir, {
          message: unknownMessage(name),
          suggestions: suggest(name, items),
        }),
        2,
        json,
      )
    }
    emit(envelope(command, "OK", true, item, dir), 0, json)
  }

  const report = doctor(dir, items, registry.name)
  const failed = report.summary.fail > 0
  emit(
    envelope(command, failed ? "ERR_DOCTOR_FAIL" : "OK", !failed, report, dir, failed ? { message: "El doctor encontró fallos." } : {}),
    failed ? 1 : 0,
    json,
  )
}

const isDirect = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isDirect) main()
