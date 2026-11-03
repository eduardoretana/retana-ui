import fs from "node:fs"
import path from "node:path"

const IMPORT_FROM = /(?:\bfrom\s+|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g
const BARE_IMPORT = /^\s*import\s+["']([^"']+)["']/gm

const FORBIDDEN = [
  { label: "react", test: (spec: string) => spec === "react" || spec.startsWith("react/") },
  { label: "react-dom", test: (spec: string) => spec === "react-dom" || spec.startsWith("react-dom/") },
  { label: "next", test: (spec: string) => spec === "next" || spec.startsWith("next/") },
  { label: "css", test: (spec: string) => /\.(css|scss|sass|less)$/.test(spec) },
  {
    label: "components",
    test: (spec: string) =>
      spec.startsWith("@/components/") ||
      spec.startsWith("@/registry/retana/ui") ||
      spec.startsWith("@/registry/retana/blocks") ||
      spec.startsWith("components/") ||
      spec.includes("/components/"),
  },
]

const NETWORK = /\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/

/**
 * Generic purity lint for any Herramientas core (RUI-TOOLS-001, pending in the hub).
 * A core is plain TypeScript: no React, DOM framework, CSS, component imports, or network I/O.
 */
export function lintToolCoreSource(source: string, filePath: string): string[] {
  const errors: string[] = []
  const specs = new Set<string>()
  for (const match of source.matchAll(IMPORT_FROM)) if (match[1]) specs.add(match[1])
  for (const match of source.matchAll(BARE_IMPORT)) if (match[1]) specs.add(match[1])
  for (const spec of specs) {
    for (const rule of FORBIDDEN) {
      if (rule.test(spec)) errors.push(`${filePath} imports ${rule.label} ("${spec}"). Tool cores stay free of UI and app runtimes.`)
    }
  }
  if (NETWORK.test(source)) errors.push(`${filePath} uses network I/O. Tool cores are deterministic and offline.`)
  return errors
}

export function lintToolCoreTree(root: string, relativeDir: string): string[] {
  const abs = path.join(root, relativeDir)
  if (!fs.existsSync(abs)) return [`${relativeDir} does not exist.`]
  const errors: string[] = []
  const walk = (dir: string) => {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const next = path.join(dir, entry.name)
      if (entry.isDirectory()) walk(next)
      else if (/\.(ts|tsx|js|jsx|css)$/.test(entry.name)) {
        const rel = path.relative(root, next).split(path.sep).join("/")
        errors.push(...lintToolCoreSource(fs.readFileSync(next, "utf8"), rel))
      }
    }
  }
  walk(abs)
  return errors
}

export type ToolCatalogEntry = {
  slug?: string
  kind?: string
  core?: string
  ui?: string[]
  docs?: string
}

export function readToolCatalog(root: string): ToolCatalogEntry[] {
  const file = path.join(root, "retana-ui.json")
  if (!fs.existsSync(file)) return []
  const json = JSON.parse(fs.readFileSync(file, "utf8")) as { tools?: ToolCatalogEntry[] }
  return Array.isArray(json.tools) ? json.tools : []
}

export function lintDeclaredToolCores(root: string): string[] {
  const registryPath = path.join(root, "registry.json")
  if (!fs.existsSync(registryPath)) return ["registry.json is missing."]
  const registry = JSON.parse(fs.readFileSync(registryPath, "utf8")) as {
    items?: { name?: string; type?: string; files?: { path?: string }[] }[]
  }
  const items = new Map((registry.items ?? []).map((item) => [item.name, item]))
  const errors: string[] = []
  for (const tool of readToolCatalog(root)) {
    if (tool.kind !== "tool" || !tool.core) {
      errors.push(`tools[] entry "${tool.slug ?? "?"}" needs kind "tool" and a core slug.`)
      continue
    }
    const item = items.get(tool.core)
    if (!item) {
      errors.push(`Tool core "${tool.core}" is not a registry item.`)
      continue
    }
    if (item.type !== "registry:lib") errors.push(`Tool core "${tool.core}" must be registry:lib.`)
    for (const file of item.files ?? []) {
      if (!file.path) continue
      const abs = path.join(root, file.path)
      if (!fs.existsSync(abs)) {
        errors.push(`${file.path} is listed on ${tool.core} but does not exist.`)
        continue
      }
      if (/\.(ts|tsx|js|jsx|css)$/.test(file.path)) {
        errors.push(...lintToolCoreSource(fs.readFileSync(abs, "utf8"), file.path))
      }
    }
  }
  return errors
}
