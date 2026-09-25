import fs from "node:fs"
import path from "node:path"

const SOURCE_ROOTS = ["registry/ui", "registry/blocks", "registry/hooks", "registry/lib"]

const PALETTE =
  "slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose"
const UTILITY =
  "bg|text|border|ring|fill|stroke|from|to|via|outline|decoration|caret|divide|placeholder"

const palettePattern = new RegExp(
  `\\b(?:${UTILITY})-(?:${PALETTE})-\\d{2,3}\\b`,
  "g",
)
const namedColorPattern =
  /\b(?:bg|text|border|ring|fill|stroke|from|to)-(?:black|white)\b/g
const hexPattern = /#(?:[0-9a-fA-F]{3,8})\b/g
const colorFnPattern =
  /\b(?:rgb|rgba|hsl|hsla|oklch|oklab|hwb|color-mix)\s*\(/g

export type RegistryFile = {
  path?: string
  type?: string
  target?: string
}

export type RegistryItemInput = {
  name?: string
  type?: string
  title?: string
  description?: string
  categories?: string[]
  dependencies?: string[]
  registryDependencies?: string[]
  files?: RegistryFile[]
  meta?: {
    titleEs?: string
    descriptionEs?: string
    preview?: string
    previewHref?: string
    examples?: { title?: string; href?: string; description?: string }[]
    api?: { name?: string; type?: string; description?: string }[]
    usage?: string
  }
  cssVars?: unknown
  [key: string]: unknown
}

export type RegistryInput = {
  name?: string
  items?: RegistryItemInput[]
}

export type ValidateRegistryOptions = {
  registry: RegistryInput
  /** Source text keyed by repo-relative path. Only registry/ files are scanned. */
  files: Record<string, string>
  /** Repo-relative paths that exist (previews, example pages, item sources). */
  existingPaths: Iterable<string>
}

const ITEM_TYPES = new Set([
  "registry:block",
  "registry:component",
  "registry:ui",
  "registry:hook",
  "registry:lib",
  "registry:file",
  "registry:page",
])

function hasCssVars(value: unknown): boolean {
  if (!value || typeof value !== "object") return false
  if (Array.isArray(value)) return value.some(hasCssVars)
  for (const [key, child] of Object.entries(value as Record<string, unknown>)) {
    if (key === "cssVars") return true
    if (hasCssVars(child)) return true
  }
  return false
}

function examplePagePath(href: string) {
  const clean = href.replace(/\/$/, "")
  return `app${clean}/page.tsx`
}

function scanSource(filePath: string, source: string) {
  const errors: string[] = []
  const rules: { label: string; pattern: RegExp }[] = [
    { label: "Tailwind palette color", pattern: palettePattern },
    { label: "hard-coded black/white color", pattern: namedColorPattern },
    { label: "hex color", pattern: hexPattern },
    { label: "color function", pattern: colorFnPattern },
  ]
  for (const rule of rules) {
    rule.pattern.lastIndex = 0
    const match = rule.pattern.exec(source)
    if (match) {
      errors.push(`${filePath} ships a ${rule.label} ("${match[0]}"). Registry items inherit the host theme.`)
    }
  }
  return errors
}

export function validateRegistry({
  registry,
  files,
  existingPaths,
}: ValidateRegistryOptions) {
  const errors: string[] = []
  const existing = new Set(existingPaths)
  const items = registry.items ?? []

  if (!Array.isArray(registry.items)) {
    errors.push("registry.json is missing an items array.")
    return errors
  }

  const names = new Set<string>()
  for (const item of items) {
    const label = item.name || "(unnamed item)"
    if (!item.name || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(item.name)) {
      errors.push(`${label} needs a kebab-case name.`)
    } else if (names.has(item.name)) {
      errors.push(`${item.name} is listed more than once.`)
    } else {
      names.add(item.name)
    }

    if (!item.type || !ITEM_TYPES.has(item.type)) {
      errors.push(`${label} has an unsupported type "${item.type ?? ""}".`)
    }
    if (!item.description?.trim()) {
      errors.push(`${label} is missing a description.`)
    }
    if (!item.meta?.descriptionEs?.trim()) {
      errors.push(`${label} is missing meta.descriptionEs (Spanish description).`)
    }
    if (!item.meta?.titleEs?.trim()) {
      errors.push(`${label} is missing meta.titleEs.`)
    }
    if (!item.categories?.length) {
      errors.push(`${label} needs at least one category.`)
    }
    if (!item.meta?.usage?.trim()) {
      errors.push(`${label} is missing meta.usage.`)
    }
    if (!item.meta?.api?.length) {
      errors.push(`${label} is missing meta.api rows for the item page.`)
    }
    if (hasCssVars(item)) {
      errors.push(`${label} ships cssVars. Remove them so the host theme applies.`)
    }

    const preview = item.meta?.preview
    if (!preview) {
      errors.push(`${label} is missing meta.preview.`)
    } else if (preview.split("/").includes("..") || !preview.startsWith("app/") || !preview.endsWith(".tsx")) {
      errors.push(`${label} meta.preview must be an app/**/*.tsx file.`)
    } else if (!existing.has(preview)) {
      errors.push(`${label} preview file does not exist: ${preview}`)
    }

    const previewHref = item.meta?.previewHref
    if (!previewHref || !previewHref.startsWith("/examples/")) {
      errors.push(`${label} is missing meta.previewHref (an /examples/... route).`)
    } else {
      const page = examplePagePath(previewHref)
      if (!existing.has(page)) {
        errors.push(`${label} live preview route has no page: ${page}`)
      }
    }

    for (const example of item.meta?.examples ?? []) {
      if (!example.href?.startsWith("/examples/")) {
        errors.push(`${label} example "${example.title ?? example.href}" must point at /examples/...`)
        continue
      }
      const page = examplePagePath(example.href)
      if (!existing.has(page)) {
        errors.push(`${label} example page does not exist: ${page}`)
      }
    }

    if (!item.files?.length) {
      errors.push(`${label} needs at least one file under registry/.`)
    }
    for (const file of item.files ?? []) {
      const filePath = file.path ?? ""
      const allowed = SOURCE_ROOTS.some((root) => filePath.startsWith(`${root}/`))
      if (!allowed || filePath.split("/").includes("..")) {
        errors.push(`${label} file "${filePath}" must live in registry/ui, registry/blocks, registry/hooks, or registry/lib.`)
        continue
      }
      if (!existing.has(filePath)) {
        errors.push(`${label} file does not exist: ${filePath}`)
      }
    }
  }

  for (const [filePath, source] of Object.entries(files)) {
    if (!SOURCE_ROOTS.some((root) => filePath.startsWith(`${root}/`))) continue
    errors.push(...scanSource(filePath, source))
  }

  return errors
}

function walk(dir: string, root: string, into: string[]) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, root, into)
    else if (entry.isFile()) into.push(path.relative(root, abs).split(path.sep).join("/"))
  }
}

export function validateRegistryTree(root: string) {
  const registry = JSON.parse(
    fs.readFileSync(path.join(root, "registry.json"), "utf8"),
  ) as RegistryInput
  const files: Record<string, string> = {}
  const existing: string[] = []
  for (const folder of SOURCE_ROOTS) {
    const abs = path.join(root, folder)
    const found: string[] = []
    walk(abs, root, found)
    for (const filePath of found) {
      existing.push(filePath)
      if (/\.(tsx|ts|jsx|js|css)$/.test(filePath)) {
        files[filePath] = fs.readFileSync(path.join(root, filePath), "utf8")
      }
    }
  }
  const appFiles: string[] = []
  walk(path.join(root, "app"), root, appFiles)
  existing.push(...appFiles)
  return validateRegistry({ registry, files, existingPaths: existing })
}
