import fs from "node:fs"
import path from "node:path"

import { exportedBindings, PLP_REQUIRED_SCENES, plpSceneId, type PlpSceneInput } from "../lib/plp.ts"

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
    scenes?: PlpSceneInput[]
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
  /** Reads a repo-relative file. Required to check PLP fixtures when `meta.scenes` is set. */
  readFile?: (repoPath: string) => string | null
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
  const clean = href.split(/[?#]/)[0]!.replace(/\/$/, "")
  return `app${clean}/page.tsx`
}

function callArgs(source: string, openParen: number) {
  let depth = 0
  for (let index = openParen; index < source.length; index++) {
    const char = source[index]
    if (char === "(") depth++
    else if (char === ")") {
      depth--
      if (depth === 0) return source.slice(openParen + 1, index)
    }
  }
  return source.slice(openParen + 1)
}

/** color-mix of host tokens only. `in oklch` names a space; it is not an oklch() color. */
function isHostTokenMix(args: string) {
  if (/#[0-9a-fA-F]{3,8}\b/.test(args)) return false
  if (/\b(?:rgb|rgba|hsl|hsla|oklch|oklab|hwb|color-mix)\s*\(/i.test(args)) return false
  if (/\b(?:red|blue|green|white|black|gray|grey|orange|purple|pink|yellow|transparent)\b/i.test(args)) return false
  return /\bvar\s*\(/.test(args)
}

/**
 * Colour exception EX-01: OrganUI anatomy, imaging and
 * molecular scenes keep their original realistic colours and lighting.
 * Scoped to these files only; see docs/color-exceptions.md.
 */
const ORGAN_MODELS =
  "adrenals|appendix|bladder|brain|breast|cell|diaphragm|ear|esophagus|eye|gallbladder|hair|heart|intestines|joints|kidneys|larynx|liver|lungs|lymph|muscles|nails|nerves|nose|pancreas|parathyroid|pharynx|pineal|pituitary|prostate|salivary-glands|skeleton|skin|spinal-cord|spleen|stomach|teeth|thymus|thyroid|tongue|uterus|vessels|vestibular"
const SCIENTIFIC_COLOR_EXCEPTIONS = new RegExp(
  `^registry/ui/(?:organ-(?:${ORGAN_MODELS}|viewer)|dna-helix|molecule-viewer|dermatome-map|image-viewer)\\.tsx$`,
)

export function isScientificColorException(filePath: string) {
  return SCIENTIFIC_COLOR_EXCEPTIONS.test(filePath)
}

function scanSource(filePath: string, source: string) {
  if (isScientificColorException(filePath)) return []
  const errors: string[] = []
  const rules: { label: string; pattern: RegExp }[] = [
    { label: "Tailwind palette color", pattern: palettePattern },
    { label: "hard-coded black/white color", pattern: namedColorPattern },
    { label: "hex color", pattern: hexPattern },
  ]
  for (const rule of rules) {
    rule.pattern.lastIndex = 0
    const match = rule.pattern.exec(source)
    if (match) {
      errors.push(`${filePath} ships a ${rule.label} ("${match[0]}"). Registry items inherit the host theme.`)
    }
  }

  for (const match of source.matchAll(colorFnPattern)) {
    const token = match[0]
    if (token.startsWith("color-mix")) {
      const args = callArgs(source, (match.index ?? 0) + token.length - 1)
      if (isHostTokenMix(args)) continue
    }
    errors.push(`${filePath} ships a color function ("${token.trim()}"). Registry items inherit the host theme.`)
    break
  }
  return errors
}

function validatePlp(item: RegistryItemInput, existing: Set<string>, readFile: ValidateRegistryOptions["readFile"], errors: string[]) {
  const scenes = item.meta?.scenes
  if (scenes == null) return
  const label = item.name || "(unnamed item)"
  if (!Array.isArray(scenes) || scenes.length === 0) {
    errors.push(`${label} meta.scenes must list the PLP scene ids.`)
    return
  }
  const ids = scenes.map((scene) => plpSceneId(scene)).filter(Boolean)
  for (const required of PLP_REQUIRED_SCENES) {
    if (!ids.includes(required)) errors.push(`${label} meta.scenes is missing "${required}".`)
  }
  const preview = item.meta?.preview
  if (!preview) return
  const dir = preview.split("/").slice(0, -1).join("/")
  const fixturesPath = `${dir}/fixtures.ts`
  const scenesPath = `${dir}/scenes.tsx`
  const demoPath = `${dir}/demo.tsx`
  const read = (filePath: string) => {
    if (!existing.has(filePath)) return null
    return readFile?.(filePath) ?? null
  }
  const fixturesSource = read(fixturesPath)
  const scenesSource = read(scenesPath)
  const previewSource = read(preview)
  const demoSource = read(demoPath)

  if (fixturesSource == null) {
    errors.push(`${label} PLP fixture file does not exist: ${fixturesPath}`)
  } else {
    const names = exportedBindings(fixturesSource)
    for (const required of PLP_REQUIRED_SCENES) {
      if (!names.has(required)) errors.push(`${label} ${fixturesPath} must export ${required}.`)
    }
  }
  if (scenesSource == null) {
    errors.push(`${label} PLP scenes file does not exist: ${scenesPath}`)
  } else if (!/export\s+const\s+scenes\b/.test(scenesSource)) {
    errors.push(`${label} ${scenesPath} must export const scenes.`)
  }
  if (previewSource == null) {
    errors.push(`${label} PLP preview could not be read: ${preview}`)
  } else if (!previewSource.includes("ScenePreview")) {
    errors.push(`${label} ${preview} must render ScenePreview.`)
  }
  if (demoSource == null) {
    errors.push(`${label} PLP demo file does not exist: ${demoPath}`)
  } else {
    if (previewSource != null && demoSource === previewSource) {
      errors.push(`${label} demo.tsx is identical to preview.tsx. The deck and the thumbnail are different files.`)
    }
    if (!demoSource.includes("SceneDeck")) {
      errors.push(`${label} ${demoPath} must render SceneDeck.`)
    }
  }
}

export function validateRegistry({
  registry,
  files,
  existingPaths,
  readFile,
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
    validatePlp(item, existing, readFile, errors)

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
  return validateRegistry({
    registry,
    files,
    existingPaths: existing,
    readFile: (repoPath) => {
      const abs = path.join(root, repoPath)
      if (!fs.existsSync(abs) || !fs.statSync(abs).isFile()) return null
      return fs.readFileSync(abs, "utf8")
    },
  })
}
