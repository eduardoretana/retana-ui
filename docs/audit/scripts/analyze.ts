/**
 * Read-only audit of retana-ui against ui-system v3.2.2.
 *
 * Run from the repo root:
 *   node --experimental-strip-types docs/audit/scripts/run.ts
 *
 * Does not edit registry pieces. A registry rebuild, when enabled, is reverted
 * before the process exits.
 */
import { execFileSync } from "node:child_process"
import fs from "node:fs"
import path from "node:path"

import { scanPayloadDocument } from "../../../scripts/installed-imports.ts"
import { validateRegistryTree } from "../../../scripts/validate-registry.ts"

export const ROOT = path.resolve(import.meta.dirname, "../../..")

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

const ES_WORDS =
  /\b(de|del|que|con|para|por|una|los|las|como|cuando|desde|hasta|sobre|sin|también|muestra|está|esta|este|son|hay|puede|cada|lista|botón|panel|vista|campo|estado|texto|archivo|usuario|cuando|entre|donde|sólo|solo|más|menos|otro|otra|otros|otras|sus|ese|esa)\b/gi

export type Severity = "blocker" | "major" | "minor"

export type Evidence = {
  file: string
  line: number
  excerpt: string
}

export type Finding = {
  id: string
  piece: string
  affectedPieces: string[]
  ruleId: string
  rule: string
  severity: Severity
  evidence: Evidence[]
  destination:
    | "fix en pieza"
    | "extension"
    | "consolidar"
    | "regla nueva en CONTRIBUTING"
    | "test"
    | "docs"
  summary: string
  count: number
}

export type PieceRow = {
  name: string
  type: string
  kind: string
  failedA: string[]
  failedB: string[]
  maxSeverity: Severity | "ok"
  directFindings: number
  inheritedRules: string[]
}

export type AuditData = {
  generatedAt: string
  uiSystem: "3.2.2"
  cplSha: string
  registryBlob: string
  counts: Record<string, number>
  readme: {
    items: number | null
    components: number | null
    blocks: number | null
    hooks: number | null
    libraries: number | null
    bullets: number
    matchesRegistry: boolean
  }
  docs: {
    placeholderMentions: Evidence[]
    shaPinMentions: Evidence[]
    dynamicCatalogCount: boolean
  }
  payload: {
    missing: string[]
    extra: string[]
    cssVars: string[]
    rebuild: {
      ran: boolean
      exitCode: number | null
      dirtyBefore: string[]
      diffAfterBuild: string[]
      diffAfterReadme: string[]
      restored: boolean
      logTail: string
    }
  }
  validatorErrors: string[]
  findings: Finding[]
  pieces: PieceRow[]
  similarity: { a: string; b: string; jaccard: number }[]
  nearNames: { a: string; b: string; jaccard: number }[]
  renew: { name: string; born: string; directMajors: number; directMinors: number }[]
  openPrs: { number: number; title: string; url: string; head: string }[]
  coverage: {
    items: number
    withTest: number
    withoutTest: string[]
    withStress: number
    withoutStress: string[]
    withPreview: number
    withExamplePage: number
  }
}

type Item = {
  name: string
  type: string
  title?: string
  description?: string
  dependencies?: string[]
  registryDependencies?: string[]
  files?: { path?: string; type?: string; target?: string }[]
  meta?: {
    titleEs?: string
    descriptionEs?: string
    preview?: string
    previewHref?: string
    examples?: { href?: string; title?: string }[]
    usage?: string
    api?: unknown[]
  }
  cssVars?: unknown
}

const KIND: Record<string, string> = {
  "registry:ui": "component",
  "registry:component": "component",
  "registry:block": "block",
  "registry:hook": "hook",
  "registry:lib": "lib",
}

const IMPLICIT_NPM = new Set(["react", "react-dom", "next"])

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8")
}

function exists(rel: string) {
  return fs.existsSync(path.join(ROOT, rel))
}

function codeOnly(source: string) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "")
}

function lineOf(source: string, index: number) {
  let line = 1
  for (let i = 0; i < index && i < source.length; i++) if (source[i] === "\n") line++
  return line
}

function excerptAt(source: string, index: number) {
  const start = source.lastIndexOf("\n", index) + 1
  let end = source.indexOf("\n", index)
  if (end < 0) end = source.length
  return source.slice(start, end).trim().slice(0, 180)
}

function git(args: string[]) {
  return execFileSync("git", args, { cwd: ROOT, encoding: "utf8" }).trim()
}

function loadRegistry(): { items: Item[] } {
  return JSON.parse(read("registry.json")) as { items: Item[] }
}

function walk(dir: string, into: string[] = []) {
  if (!fs.existsSync(dir)) return into
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) walk(abs, into)
    else into.push(abs)
  }
  return into
}

function rel(abs: string) {
  return path.relative(ROOT, abs).split(path.sep).join("/")
}

function pushFinding(list: Finding[], draft: Omit<Finding, "id" | "count"> & { count?: number }) {
  list.push({ ...draft, id: "", count: draft.count ?? draft.evidence.length })
}

function ownersOf(file: string, items: Item[]) {
  return items.filter((item) => item.files?.some((f) => f.path === file)).map((item) => item.name)
}

function primaryPiece(file: string, items: Item[]) {
  const owners = ownersOf(file, items)
  if (owners.length === 1) return owners[0]
  if (owners.length === 0) return path.basename(file)
  return `(compartido) ${path.basename(file)}`
}

export function analyze(options: { rebuild: boolean }): AuditData {
  const cplSha = git(["rev-parse", "origin/CPL"])
  const registryBlob = git(["hash-object", "registry.json"])
  const registry = loadRegistry()
  const items = registry.items
  const names = new Set(items.map((item) => item.name))
  const findings: Finding[] = []

  const byType: Record<string, number> = {}
  for (const item of items) byType[item.type] = (byType[item.type] ?? 0) + 1

  const readme = read("README.md")
  const catalogMatch = readme.match(/<!-- CATALOG:START -->([\s\S]*?)<!-- CATALOG:END -->/)
  const catalog = catalogMatch?.[1] ?? ""
  const summary = catalog.match(
    /`(\d+)` items are in `registry\.json` on this branch: `(\d+)` components, `(\d+)` blocks, `(\d+)` hooks, and `(\d+)` libraries/,
  )
  const bullets = catalog.split("\n").filter((line) => line.startsWith("- ")).length
  const expected = {
    items: items.length,
    components: items.filter((item) => KIND[item.type] === "component").length,
    blocks: items.filter((item) => KIND[item.type] === "block").length,
    hooks: items.filter((item) => KIND[item.type] === "hook").length,
    libraries: items.filter((item) => KIND[item.type] === "lib").length,
  }
  const readmeParsed = {
    items: summary ? Number(summary[1]) : null,
    components: summary ? Number(summary[2]) : null,
    blocks: summary ? Number(summary[3]) : null,
    hooks: summary ? Number(summary[4]) : null,
    libraries: summary ? Number(summary[5]) : null,
    bullets,
    matchesRegistry: false,
  }
  readmeParsed.matchesRegistry =
    readmeParsed.items === expected.items &&
    readmeParsed.components === expected.components &&
    readmeParsed.blocks === expected.blocks &&
    readmeParsed.hooks === expected.hooks &&
    readmeParsed.libraries === expected.libraries &&
    bullets === items.length

  if (!readmeParsed.matchesRegistry) {
    pushFinding(findings, {
      piece: "(catálogo)",
      affectedPieces: [],
      ruleId: "A1-COUNT",
      rule: "ui-system ARCHITECTURE §7 C10 (UIS-S18): el conteo se cita según registry.json@sha. CONTRIBUTING: pnpm readme:catalog regenera el bloque.",
      severity: "major",
      evidence: [
        {
          file: "README.md",
          line: lineOf(readme, readme.indexOf("<!-- CATALOG:START -->")),
          excerpt: summary?.[0] ?? "bloque de catálogo sin la línea de conteo esperada",
        },
      ],
      destination: "docs",
      summary: `README dice ${readmeParsed.items ?? "?"} items (${readmeParsed.components}/${readmeParsed.blocks}/${readmeParsed.hooks}/${readmeParsed.libraries}) y ${bullets} viñetas; registry.json@${cplSha.slice(0, 12)} tiene ${expected.items} (${expected.components}/${expected.blocks}/${expected.hooks}/${expected.libraries}).`,
    })
  }

  const shaNeedle = "raw.githubusercontent.com/eduardoretana/retana-ui/"
  const docsFiles = [
    "README.md",
    "app/docs/page.tsx",
    "app/items/[name]/page.tsx",
    "app/catalog/install-commands.tsx",
    "registry/lib/multi-view/README.md",
    "registry/lib/presence/README.md",
    "registry/lib/supabase/admin-kit.md",
    "CONTRIBUTING.md",
  ]
  const placeholderMentions: Evidence[] = []
  const shaPinMentions: Evidence[] = []
  for (const file of docsFiles) {
    if (!exists(file)) continue
    const source = read(file)
    let from = 0
    while (true) {
      const at = source.indexOf("your-deployment", from)
      if (at < 0) break
      placeholderMentions.push({ file, line: lineOf(source, at), excerpt: excerptAt(source, at) })
      from = at + 1
    }
    from = 0
    while (true) {
      const at = source.indexOf(shaNeedle, from)
      if (at < 0) break
      shaPinMentions.push({ file, line: lineOf(source, at), excerpt: excerptAt(source, at) })
      from = at + 1
    }
  }
  const docsPage = exists("app/docs/page.tsx") ? read("app/docs/page.tsx") : ""
  const dynamicCatalogCount = docsPage.includes("getCatalog().length")

  if (shaPinMentions.length === 0) {
    const readmeAt = readme.indexOf('"registries"')
    pushFinding(findings, {
      piece: "(catálogo)",
      affectedPieces: [],
      ruleId: "A6-SHA",
      rule: "ui-system ARCHITECTURE §8 C09 (UIS-S04): registries @retana debe fijar un SHA en https://raw.githubusercontent.com/eduardoretana/retana-ui/<sha>/public/r/{name}.json. El deployment https://<your-deployment> no fija SHA.",
      severity: "blocker",
      evidence: [
        {
          file: "README.md",
          line: readmeAt > 0 ? lineOf(readme, readmeAt) : 204,
          excerpt: '"@retana": { "url": "https://<your-deployment>/r/{name}.json" }',
        },
        {
          file: "app/docs/page.tsx",
          line: lineOf(docsPage, docsPage.indexOf("your-deployment")),
          excerpt: excerptAt(docsPage, docsPage.indexOf("your-deployment")),
        },
      ],
      destination: "docs",
      summary:
        "README y /docs documentan el namespace @retana solo con el placeholder https://<your-deployment>/r/{name}.json. En el árbol no aparece la URL raw.githubusercontent.com/eduardoretana/retana-ui/<sha>/public/r/{name}.json.",
    })
  }

  const publicDir = path.join(ROOT, "public", "r")
  const payloadNames = fs
    .readdirSync(publicDir)
    .filter((name) => name.endsWith(".json"))
    .map((name) => name.replace(/\.json$/, ""))
  const payloadSet = new Set(payloadNames)
  const missing = items.map((item) => item.name).filter((name) => !payloadSet.has(name))
  const extra = payloadNames.filter((name) => name !== "registry" && !names.has(name))
  const cssVarsFiles: string[] = []
  for (const name of payloadNames) {
    const jsonPath = `public/r/${name}.json`
    const text = read(jsonPath)
    if (text.includes('"cssVars"')) cssVarsFiles.push(jsonPath)
  }
  for (const name of missing) {
    pushFinding(findings, {
      piece: name,
      affectedPieces: [name],
      ruleId: "A3-MISSING",
      rule: "ui-system ARCHITECTURE §8 C09: public/r/<nombre>.json versionado es la ruta de instalación por SHA.",
      severity: "blocker",
      evidence: [{ file: "registry.json", line: 1, excerpt: `falta public/r/${name}.json` }],
      destination: "fix en pieza",
      summary: `${name} está en registry.json y no tiene public/r/${name}.json.`,
    })
  }
  for (const name of extra) {
    pushFinding(findings, {
      piece: name,
      affectedPieces: [name],
      ruleId: "A3-EXTRA",
      rule: "ui-system ARCHITECTURE §7 C10: el catálogo instalable es registry.json@sha. Un JSON huérfano no está en esa fuente.",
      severity: "major",
      evidence: [{ file: `public/r/${name}.json`, line: 1, excerpt: "payload sin item en registry.json" }],
      destination: "fix en pieza",
      summary: `public/r/${name}.json no tiene item en registry.json.`,
    })
  }
  for (const file of cssVarsFiles) {
    pushFinding(findings, {
      piece: path.basename(file, ".json"),
      affectedPieces: [path.basename(file, ".json")],
      ruleId: "B1-CSSVARS",
      rule: "CONTRIBUTING.md y ui-system ley 7: el payload no puede traer cssVars.",
      severity: "blocker",
      evidence: [{ file, line: 1, excerpt: "contiene la clave cssVars" }],
      destination: "fix en pieza",
      summary: `${file} contiene cssVars.`,
    })
  }

  const validatorErrors = validateRegistryTree(ROOT)

  for (const item of items) {
    const meta = item.meta ?? {}
    if (!meta.titleEs?.trim() || !meta.descriptionEs?.trim() || !meta.preview?.trim()) {
      pushFinding(findings, {
        piece: item.name,
        affectedPieces: [item.name],
        ruleId: "A2-META",
        rule: "CONTRIBUTING.md y ui-system ARCHITECTURE §7: meta.titleEs, meta.descriptionEs y meta.preview alimentan uis catalog search.",
        severity: "blocker",
        evidence: [{ file: "registry.json", line: 1, excerpt: item.name }],
        destination: "fix en pieza",
        summary: `${item.name} no tiene titleEs, descriptionEs o preview.`,
      })
    } else {
      const es = meta.descriptionEs.trim()
      const same = es === (item.description ?? "").trim()
      if (same) {
        pushFinding(findings, {
          piece: item.name,
          affectedPieces: [item.name],
          ruleId: "A2-SEARCH",
          rule: "ui-system ARCHITECTURE §7: uis catalog search consulta la descripción en español (meta.descriptionEs).",
          severity: "major",
          evidence: [{ file: "registry.json", line: 1, excerpt: es.slice(0, 160) }],
          destination: "fix en pieza",
          summary: `${item.name}: descriptionEs es idéntica a la descripción en inglés.`,
        })
      } else if (es.length < 24) {
        pushFinding(findings, {
          piece: item.name,
          affectedPieces: [item.name],
          ruleId: "A2-SHORT",
          rule: "ui-system ARCHITECTURE §7: la descripción ES es el texto de búsqueda del catálogo.",
          severity: "minor",
          evidence: [{ file: "registry.json", line: 1, excerpt: es }],
          destination: "fix en pieza",
          summary: `${item.name}: descriptionEs tiene ${es.length} caracteres.`,
        })
      }
    }

    for (const dep of item.registryDependencies ?? []) {
      if (dep.startsWith("@retana/")) {
        const target = dep.slice("@retana/".length)
        if (!names.has(target)) {
          pushFinding(findings, {
            piece: item.name,
            affectedPieces: [item.name],
            ruleId: "A4-UNKNOWN",
            rule: "ui-system ARCHITECTURE §7: uis catalog verify falla si @retana/* no existe en registry.json@sha.",
            severity: "blocker",
            evidence: [{ file: "registry.json", line: 1, excerpt: `${item.name} → ${dep}` }],
            destination: "fix en pieza",
            summary: `${item.name} depende de ${dep}, que no está en registry.json.`,
          })
        }
        continue
      }
      if (names.has(dep)) {
        pushFinding(findings, {
          piece: item.name,
          affectedPieces: [item.name],
          ruleId: "A4-BARE",
          rule: "ui-system ARCHITECTURE §7 C09: registryDependencies sin namespace @retana/ que apuntan a items de retana los resuelve el CLI contra el registry por defecto, no contra @retana.",
          severity: "blocker",
          evidence: [{ file: "registry.json", line: 1, excerpt: `${item.name}.registryDependencies incluye "${dep}"` }],
          destination: "fix en pieza",
          summary: `${item.name} declara "${dep}" sin @retana/. shadcn lo buscaría en el registry por defecto.`,
        })
      }
    }

    if (exists(`public/r/${item.name}.json`)) {
      const payload = JSON.parse(read(`public/r/${item.name}.json`)) as unknown
      const errors = scanPayloadDocument(payload)
      if (errors.length) {
        pushFinding(findings, {
          piece: item.name,
          affectedPieces: [item.name],
          ruleId: "A5-IMPORT",
          rule: "CONTRIBUTING.md: el payload no puede dejar imports @/registry/retana ni specifiers que el host no resuelva. scripts/installed-imports.ts.",
          severity: "blocker",
          evidence: errors.slice(0, 5).map((error) => ({
            file: `public/r/${item.name}.json`,
            line: 1,
            excerpt: error.slice(0, 180),
          })),
          destination: "fix en pieza",
          summary: errors[0],
          count: errors.length,
        })
      }
    }

    const npm = new Set<string>()
    const npmEvidence: Evidence[] = []
    for (const file of item.files ?? []) {
      const filePath = file.path
      if (!filePath || !exists(filePath)) continue
      if (!/\.(tsx|ts|jsx|js)$/.test(filePath)) continue
      const original = read(filePath)
      const source = original
        .replace(/\/\*[\s\S]*?\*\//g, "")
        .replace(/\/\/.*$/gm, "")
        .replace(/`(?:\\.|[^`\\])*`/g, "``")
      const spec = /(?:^|\n)\s*import\s[\s\S]*?from\s+["']([^"']+)["']|(?:^|\n)\s*import\s+["']([^"']+)["']|import\(\s*["']([^"']+)["']/g
      for (const match of source.matchAll(spec)) {
        const specifier = match[1] || match[2] || match[3]
        if (!specifier || specifier.startsWith(".") || specifier.startsWith("@/") || specifier.startsWith("node:")) continue
        const pkg = specifier.startsWith("@")
          ? specifier.split("/").slice(0, 2).join("/")
          : specifier.split("/")[0]
        if (IMPLICIT_NPM.has(pkg)) continue
        if ((item.dependencies ?? []).includes(pkg)) continue
        if (npm.has(pkg)) continue
        npm.add(pkg)
        const at = original.indexOf(specifier)
        npmEvidence.push({
          file: filePath,
          line: at >= 0 ? lineOf(original, at) : 1,
          excerpt: at >= 0 ? excerptAt(original, at) : specifier,
        })
      }
    }
    if (npm.size) {
      pushFinding(findings, {
        piece: item.name,
        affectedPieces: [item.name],
        ruleId: "A5-NPM",
        rule: "CONTRIBUTING.md: un paquete npm nuevo va en dependencies del item. Si falta, shadcn add no lo instala en el host.",
        severity: "blocker",
        evidence: npmEvidence.slice(0, 5),
        destination: "fix en pieza",
        summary: `${item.name} importa ${[...npm].join(", ")} y no los declara en dependencies.`,
        count: npm.size,
      })
    }
  }

  const fileCache = new Map<string, string>()
  function sourceOf(file: string) {
    const hit = fileCache.get(file)
    if (hit !== undefined) return hit
    const text = exists(file) ? read(file) : ""
    fileCache.set(file, text)
    return text
  }

  const colorHits = new Map<string, { ruleId: string; evidence: Evidence[] }>()
  function addColor(file: string, ruleId: string, index: number, source: string) {
    const key = `${ruleId}\0${file}`
    const bucket = colorHits.get(key) ?? { ruleId, evidence: [] }
    if (bucket.evidence.length < 5) {
      bucket.evidence.push({ file, line: lineOf(source, index), excerpt: excerptAt(source, index) })
    } else bucket.evidence.push({ file, line: lineOf(source, index), excerpt: "" })
    colorHits.set(key, bucket)
  }

  const registryFiles = walk(path.join(ROOT, "registry")).map(rel)
  for (const file of registryFiles) {
    if (!/\.(tsx|ts|jsx|js|css)$/.test(file)) continue
    const source = sourceOf(file)
    for (const match of source.matchAll(palettePattern)) addColor(file, "B1-PALETTE", match.index ?? 0, source)
    for (const match of source.matchAll(namedColorPattern)) addColor(file, "B1-NAMED", match.index ?? 0, source)
    for (const match of source.matchAll(hexPattern)) addColor(file, "B1-HEX", match.index ?? 0, source)
    for (const match of source.matchAll(colorFnPattern)) {
      const token = match[0]
      if (token.startsWith("color-mix")) {
        const args = callArgs(source, (match.index ?? 0) + token.length - 1)
        if (isHostTokenMix(args)) continue
      }
      addColor(file, "B1-FN", match.index ?? 0, source)
    }
    const fontRe = /font-family\s*:|@font-face|next\/font/g
    for (const match of source.matchAll(fontRe)) addColor(file, "B1-FONT", match.index ?? 0, source)
    const inlineRe = /style=\{\{[^}]*\b(?:color|background|backgroundColor|fill|stroke|borderColor)\s*:\s*["'`]([^"'`]+)["'`]/g
    for (const match of source.matchAll(inlineRe)) {
      const value = match[1]
      if (inlineUsesHostTokens(value)) continue
      addColor(file, "B1-INLINE", match.index ?? 0, source)
    }
  }

  const colorRuleText: Record<string, string> = {
    "B1-PALETTE": "CONTRIBUTING.md y ui-system §6.1: prohibidas las clases de paleta Tailwind (bg-blue-500). Solo tokens semánticos.",
    "B1-NAMED": "CONTRIBUTING.md: prohibidos bg-black, text-white y equivalentes. El contraste sale de los tokens del host.",
    "B1-HEX": "CONTRIBUTING.md y ui-system §6.1: prohibido el hex en registry/. El tema vive en el host.",
    "B1-FN": "CONTRIBUTING.md: prohibidos rgb/hsl/oklch literales. color-mix solo si mezcla var() del host.",
    "B1-FONT": "CONTRIBUTING.md y ui-system ley 7: la pieza no trae fuentes propias.",
    "B1-INLINE": "ui-system §6.1: un estilo inline con color literal no hereda el token del host ni el modo oscuro.",
  }
  for (const [key, bucket] of colorHits) {
    const file = key.split("\0")[1]
    const owners = ownersOf(file, items)
    pushFinding(findings, {
      piece: primaryPiece(file, items),
      affectedPieces: owners,
      ruleId: bucket.ruleId,
      rule: colorRuleText[bucket.ruleId],
      severity: "blocker",
      evidence: bucket.evidence.filter((item) => item.excerpt).slice(0, 5),
      destination: "fix en pieza",
      summary: `${file} tiene ${bucket.evidence.length} coincidencia(s) de color o fuente (${bucket.ruleId}).`,
      count: bucket.evidence.length,
    })
  }

  scanMotionAndA11y(items, findings, sourceOf)
  scanExtensions(items, findings, sourceOf)
  scanCoverage(items, findings)

  const { similarity, nearNames } = similarityReport(items, sourceOf)
  for (const pair of similarity.filter((pair) => pair.jaccard >= 0.72)) {
    pushFinding(findings, {
      piece: pair.a,
      affectedPieces: [pair.a, pair.b],
      ruleId: "B7-DUP",
      rule: "ui-system ley 5 y better-ui anti-slop (hub, 10 campos): no mantener dos piezas casi iguales. Jaccard de tokens del fuente principal.",
      severity: pair.jaccard >= 0.85 ? "major" : "minor",
      evidence: [
        { file: `registry (par ${pair.a} / ${pair.b})`, line: 1, excerpt: `jaccard ${pair.jaccard.toFixed(3)}` },
      ],
      destination: "consolidar",
      summary: `${pair.a} y ${pair.b} comparten Jaccard ${pair.jaccard.toFixed(3)} en el fuente principal.`,
    })
  }

  const rebuild = options.rebuild ? runRebuild() : emptyRebuild()

  if (rebuild.diffAfterBuild.length) {
    pushFinding(findings, {
      piece: "(catálogo)",
      affectedPieces: [],
      ruleId: "A3-DRIFT",
      rule: "CONTRIBUTING.md: pnpm registry:build debe dejar public/r/*.json y lib/generated/preview-map.tsx en sync. ui-system §8: lo que se instala por SHA es ese JSON.",
      severity: "blocker",
      evidence: rebuild.diffAfterBuild.slice(0, 8).map((file) => ({ file, line: 1, excerpt: "git diff tras pnpm registry:build" })),
      destination: "fix en pieza",
      summary: `Regenerar el registry cambia ${rebuild.diffAfterBuild.length} archivo(s): ${rebuild.diffAfterBuild.slice(0, 8).join(", ")}.`,
      count: rebuild.diffAfterBuild.length,
    })
  }
  if (rebuild.ran && rebuild.exitCode !== 0) {
    pushFinding(findings, {
      piece: "(catálogo)",
      affectedPieces: [],
      ruleId: "A3-BUILD",
      rule: "CONTRIBUTING.md: pnpm registry:build valida el item y genera public/r. Si falla, el catálogo @sha no se puede regenerar.",
      severity: "blocker",
      evidence: [{ file: "scripts/build-registry.ts", line: 1, excerpt: rebuild.logTail.slice(-300) }],
      destination: "fix en pieza",
      summary: `pnpm registry:build terminó con código ${rebuild.exitCode}.`,
    })
  }
  if (rebuild.diffAfterReadme.length) {
    pushFinding(findings, {
      piece: "(catálogo)",
      affectedPieces: [],
      ruleId: "A1-README-DRIFT",
      rule: "CONTRIBUTING.md: pnpm readme:catalog regenera el bloque entre CATALOG:START y CATALOG:END. C10 pide que el conteo coincida con registry.json@sha.",
      severity: "major",
      evidence: [{ file: "README.md", line: 300, excerpt: "git diff tras pnpm readme:catalog" }],
      destination: "docs",
      summary: "pnpm readme:catalog modifica README.md. El bloque versionado no está regenerado.",
    })
  }

  const registryText = read("registry.json")
  const itemLine = new Map<string, number>()
  for (const match of registryText.matchAll(/"name": "([a-z0-9-]+)"/g)) {
    const window = registryText.slice(match.index ?? 0, (match.index ?? 0) + 100)
    if (/"type": "registry:/.test(window) && !itemLine.has(match[1])) {
      itemLine.set(match[1], lineOf(registryText, match.index ?? 0))
    }
  }
  for (const finding of findings) {
    for (const evidence of finding.evidence) {
      if (evidence.file === "registry.json" && evidence.line === 1) {
        const line = itemLine.get(finding.piece)
        if (line) evidence.line = line
      }
    }
  }

  assignIds(findings)
  const pieces = pieceRows(items, findings)
  const renew = renewList(pieces, findings)
  const openPrs = listOpenPrs()
  const coverage = coverageSummary(items)

  return {
    generatedAt: new Date().toISOString(),
    uiSystem: "3.2.2",
    cplSha,
    registryBlob,
    counts: {
      items: items.length,
      ...expected,
      ...byType,
      findings: findings.length,
      blocker: findings.filter((f) => f.severity === "blocker").length,
      major: findings.filter((f) => f.severity === "major").length,
      minor: findings.filter((f) => f.severity === "minor").length,
    },
    readme: readmeParsed,
    docs: { placeholderMentions, shaPinMentions, dynamicCatalogCount },
    payload: { missing, extra, cssVars: cssVarsFiles, rebuild },
    validatorErrors,
    findings,
    pieces,
    similarity,
    nearNames,
    renew,
    openPrs,
    coverage,
  }
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

function inlineUsesHostTokens(value: string) {
  if (isHostTokenMix(value)) return true
  if (/#[0-9a-fA-F]{3,8}\b/.test(value)) return false
  if (/\b(?:rgb|rgba|hsl|hsla|oklch|hwb)\s*\(/i.test(value)) return false
  if (/\b(?:red|blue|green|white|black|gray|grey|orange|purple|pink|yellow)\b/i.test(value)) return false
  return /\bvar\s*\(/.test(value)
}

function isHostTokenMix(args: string) {
  if (/#[0-9a-fA-F]{3,8}\b/.test(args)) return false
  if (/\b(?:rgb|rgba|hsl|hsla|oklch|oklab|hwb|color-mix)\s*\(/i.test(args)) return false
  if (/\b(?:red|blue|green|white|black|gray|grey|orange|purple|pink|yellow|transparent)\b/i.test(args)) return false
  return /\bvar\s*\(/.test(args)
}

const REDUCED =
  /prefers-reduced-motion|useReducedMotion|usePrefersReducedMotion|useMotionPreference|MotionConfig|reducedMotion|motion-reduce:|motion-safe:/

const MOVEMENT =
  /transition-transform|transition-all|whileTap|whileHover|animate=\{\{|@keyframes|slide-in-|zoom-in-|layoutId|<motion\.|active:scale|hover:scale|motion-safe:animate/

function scanMotionAndA11y(
  items: Item[],
  findings: Finding[],
  sourceOf: (file: string) => string,
) {
  const seenMotion = new Set<string>()
  for (const item of items) {
    const files = (item.files ?? []).map((file) => file.path).filter((file): file is string => Boolean(file))
    const own = files.filter((file) => ownersCount(file, items) === 1 || fileIncludesName(file, item.name))
    const texts = files.map((file) => ({ file, source: sourceOf(file) }))
    const reduced = texts.some(({ source }) => REDUCED.test(codeOnly(source)))
    const movementFiles = texts.filter(({ source }) => MOVEMENT.test(codeOnly(source)))
    if (movementFiles.length && !reduced) {
      const evidence = movementFiles.slice(0, 3).map(({ file, source }) => {
        const match = source.match(MOVEMENT)
        const index = match?.index ?? 0
        return { file, line: lineOf(source, index), excerpt: excerptAt(source, index) }
      })
      pushFinding(findings, {
        piece: item.name,
        affectedPieces: [item.name],
        ruleId: "B3-REDUCED",
        rule: "emil-design-eng SKILL.md (prefers-reduced-motion) y ui-system ARCHITECTURE §6.4: better-ui es obligatoria; el subset LITE exige prefers-reduced-motion en movimiento. better-ui/animations.md: el movimiento no es el único canal, y se retira cuando el lector lo pide.",
        severity: "major",
        evidence,
        destination: "fix en pieza",
        summary: `${item.name} anima movimiento y ninguno de sus archivos menciona reduced motion.`,
      })
    }

    for (const { file, source } of texts) {
      if (seenMotion.has(file)) continue
      seenMotion.add(file)
      if (!file.endsWith(".ts") && !file.endsWith(".tsx")) continue
      const allHits = [...source.matchAll(/\btransition-all\b|transition\s*:\s*all\b|will-change\s*:\s*all\b/g)]
      if (allHits.length) {
        seenMotion.add(`all:${file}`)
        pushFinding(findings, {
          piece: primaryPiece(file, items),
          affectedPieces: ownersOf(file, items),
          ruleId: "B3-ALL",
          rule: "better-ui/performance.md: nunca transition: all ni transition-all. Nombrar la propiedad. emil-design-eng: transition: transform/opacity, no all.",
          severity: "major",
          evidence: allHits.slice(0, 4).map((match) => ({
            file,
            line: lineOf(source, match.index ?? 0),
            excerpt: excerptAt(source, match.index ?? 0),
          })),
          destination: "fix en pieza",
          summary: `${file} usa transition all (${allHits.length}).`,
          count: allHits.length,
        })
      }

      const easeHits = [...source.matchAll(/\bease-in\b/g)].filter((match) => {
        const slice = source.slice(match.index ?? 0, (match.index ?? 0) + 11)
        return !slice.startsWith("ease-in-out")
      })
      if (easeHits.length && !seenMotion.has(`ease:${file}`)) {
        seenMotion.add(`ease:${file}`)
        const menu = /label:\s*"Ease in"/.test(source)
        pushFinding(findings, {
          piece: primaryPiece(file, items),
          affectedPieces: ownersOf(file, items),
          ruleId: "B3-EASE-IN",
          rule: "emil-design-eng SKILL.md: nunca ease-in en UI (arranca lento). better-ui/enter-exit.md: ease-out en entrada y salida.",
          severity: menu ? "minor" : "major",
          evidence: easeHits.slice(0, 3).map((match) => ({
            file,
            line: lineOf(source, match.index ?? 0),
            excerpt: excerptAt(source, match.index ?? 0),
          })),
          destination: "fix en pieza",
          summary: menu
            ? `${file} ofrece ease-in como opción del editor.`
            : `${file} usa ease-in.`,
          count: easeHits.length,
        })
      }

      const bezier = [...source.matchAll(/\[\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\s*\]/g)]
      for (const match of bezier) {
        const x1 = Number(match[1])
        const y1 = Number(match[2])
        const y2 = Number(match[4])
        if (!(y1 <= 0.05 && x1 >= 0.4 && y2 <= 0.25)) continue
        const aroundWide = source.slice(Math.max(0, (match.index ?? 0) - 80), (match.index ?? 0) + match[0].length)
        if (!/ease|cubic|transition|exit/i.test(aroundWide)) continue
        const key = `bez:${file}:${match.index}`
        if (seenMotion.has(key)) continue
        seenMotion.add(key)
        const around = source.slice(Math.max(0, (match.index ?? 0) - 40), match.index ?? 0)
        const isExit = /exit\s*:/.test(around)
        pushFinding(findings, {
          piece: primaryPiece(file, items),
          affectedPieces: ownersOf(file, items),
          ruleId: "B3-EASE-IN",
          rule: "emil-design-eng SKILL.md: nunca ease-in en UI. Una cúbica con el primer control en y≈0 y x≥0.4 arranca lento. better-ui/enter-exit.md pide ease-out también en la salida.",
          severity: isExit ? "major" : "minor",
          evidence: [{ file, line: lineOf(source, match.index ?? 0), excerpt: excerptAt(source, match.index ?? 0) }],
          destination: "fix en pieza",
          summary: `${file}:${lineOf(source, match.index ?? 0)} curva ease-in (${match[0]}).`,
        })
      }

      const layoutHits = [...codeOnly(source).matchAll(/animate=\{\{[^}]*\b(?:width|height)\b|exit=\{\{[^}]*\b(?:width|height)\b/g)]
      if (layoutHits.length && !seenMotion.has(`layout:${file}`)) {
        seenMotion.add(`layout:${file}`)
        const at = source.search(/animate=\{\{[^}]*\b(?:width|height)\b|exit=\{\{[^}]*\b(?:width|height)\b/)
        pushFinding(findings, {
          piece: primaryPiece(file, items),
          affectedPieces: ownersOf(file, items),
          ruleId: "B3-LAYOUT",
          rule: "emil-design-eng SKILL.md (Performance): animar solo transform y opacity. width y height no se componen en la GPU. better-ui/performance.md pide nombrar propiedades que el compositor pueda mover.",
          severity: "minor",
          evidence: [{ file, line: at >= 0 ? lineOf(source, at) : 1, excerpt: at >= 0 ? excerptAt(source, at) : "animate width/height" }],
          destination: "fix en pieza",
          summary: `${file} anima width o height (${layoutHits.length}).`,
          count: layoutHits.length,
        })
      }

      const press = [...source.matchAll(/(?:active:scale-\[|group-active:scale-\[|whileTap=\{[^}]*scale:\s*(?:[A-Za-z.]+\s*\?\s*[A-Za-z0-9.]+\s*:\s*)?)(0\.\d+)/g)]
      const bad = press.filter((match) => match[1] !== "0.96")
      if (bad.length && !seenMotion.has(`press:${file}`)) {
        seenMotion.add(`press:${file}`)
        const severe = bad.some((match) => Number(match[1]) < 0.95)
        pushFinding(findings, {
          piece: primaryPiece(file, items),
          affectedPieces: ownersOf(file, items),
          ruleId: "B4-PRESS",
          rule: "better-ui/animations.md y better-ui/SKILL.md: el press es scale(0.96). Por debajo de 0.95 se siente exagerado. 0.96 no se aproxima.",
          severity: severe ? "major" : "minor",
          evidence: bad.slice(0, 3).map((match) => ({
            file,
            line: lineOf(source, match.index ?? 0),
            excerpt: excerptAt(source, match.index ?? 0),
          })),
          destination: "fix en pieza",
          summary: `${file} usa scale ${[...new Set(bad.map((match) => match[1]))].join(", ")} en vez de 0.96.`,
          count: bad.length,
        })
      }

      const iconScale = [...source.matchAll(/scale:\s*(0\.\d+)/g)].filter((match) => {
        const around = source.slice(Math.max(0, (match.index ?? 0) - 80), (match.index ?? 0) + 40)
        return /icon|Icon|blur\(/.test(around) && match[1] !== "0.25" && match[1] !== "1"
      })
      if (iconScale.length && !seenMotion.has(`icon:${file}`)) {
        seenMotion.add(`icon:${file}`)
        pushFinding(findings, {
          piece: primaryPiece(file, items),
          affectedPieces: ownersOf(file, items),
          ruleId: "B4-ICON",
          rule: "better-ui/SKILL.md y icon-transitions.md: el swap de icono es scale 0.25→1, opacity 0→1, blur 4px→0. Bounce 0 si hay spring.",
          severity: "minor",
          evidence: iconScale.slice(0, 2).map((match) => ({
            file,
            line: lineOf(source, match.index ?? 0),
            excerpt: excerptAt(source, match.index ?? 0),
          })),
          destination: "fix en pieza",
          summary: `${file} anima un icono con scale ${iconScale[0][1]}, no 0.25.`,
          count: iconScale.length,
        })
      }
    }

    scanA11yFile(item, own.length ? own : files, findings, sourceOf, items)
    scanStates(item, texts, findings)
  }
}

function ownersCount(file: string, items: Item[]) {
  return items.filter((item) => item.files?.some((entry) => entry.path === file)).length
}

function fileIncludesName(file: string, name: string) {
  return file.endsWith(`/${name}.tsx`) || file.endsWith(`/${name}.ts`) || file.includes(`/${name}/`)
}

function scanA11yFile(
  item: Item,
  files: string[],
  findings: Finding[],
  sourceOf: (file: string) => string,
  items: Item[],
) {
  const focus: Evidence[] = []
  const clicks: Evidence[] = []
  let clicksThatFocus = 0
  const images: Evidence[] = []
  const buttons: Evidence[] = []
  for (const file of files) {
    const source = sourceOf(file)
    if (!source) continue
    for (const tag of openingTags(source)) {
      const interactive = /^(button|Button|a|A|input|Input|textarea|select)$/.test(tag.name) || /\brole\s*=\s*["']button["']/.test(tag.attrs)
      if (interactive && /outline-none/.test(tag.attrs) && !/focus-visible|focus:|ring-/.test(tag.attrs)) {
        const before = source.slice(Math.max(0, tag.index - 700), tag.index)
        if (/has-\[:focus-visible\]|focus-within:/.test(before)) continue
        focus.push({ file, line: tag.line, excerpt: tag.attrs.slice(0, 180).replace(/\s+/g, " ") })
      }
      if (/^(div|span|li|tr|td)$/.test(tag.name) && /\bonClick\s*=/.test(tag.attrs) && !/\bonKey(Down|Up|Press)\s*=/.test(tag.attrs) && !/\brole\s*=/.test(tag.attrs) && !/\btabIndex\s*=/.test(tag.attrs)) {
        if (/\.focus\(/.test(tag.attrs)) clicksThatFocus++
        clicks.push({ file, line: tag.line, excerpt: tag.attrs.slice(0, 180).replace(/\s+/g, " ") })
      }
      if (tag.name === "img" && !/\balt\s*=/.test(tag.attrs)) {
        images.push({ file, line: tag.line, excerpt: tag.attrs.slice(0, 180).replace(/\s+/g, " ") })
      }
    }
    buttons.push(...unnamedButtons(source, file))
  }
  if (focus.length) {
    pushFinding(findings, {
      piece: item.name,
      affectedPieces: [item.name],
      ruleId: "B2-FOCUS",
      rule: "ui-system ARCHITECTURE §6.4: foco visible es regla craft crítica de better-ui en todos los perfiles. outline-none sin focus-visible ni ring quita el foco.",
      severity: "major",
      evidence: focus.slice(0, 4),
      destination: "fix en pieza",
      summary: `${item.name}: ${focus.length} control(es) con outline-none y sin anillo de foco en el mismo tag.`,
      count: focus.length,
    })
  }
  if (clicks.length) {
    pushFinding(findings, {
      piece: item.name,
      affectedPieces: [item.name],
      ruleId: "B2-KEYBOARD",
      rule: "ui-system §6.1 a11y: teclado junto al rol. Un click en div/span/li sin role, tabIndex ni onKeyDown no se opera con teclado. Si el click solo enfoca un campo, la severidad baja a minor.",
      severity: clicksThatFocus === clicks.length ? "minor" : "major",
      evidence: clicks.slice(0, 4),
      destination: "fix en pieza",
      summary: `${item.name}: ${clicks.length} elemento(s) con onClick y sin teclado.`,
      count: clicks.length,
    })
  }
  if (images.length) {
    pushFinding(findings, {
      piece: item.name,
      affectedPieces: [item.name],
      ruleId: "B2-ALT",
      rule: "ui-system §6.1: axe en cada story exige nombre accesible. img sin alt no tiene nombre.",
      severity: "major",
      evidence: images.slice(0, 3),
      destination: "fix en pieza",
      summary: `${item.name}: ${images.length} img sin alt.`,
      count: images.length,
    })
  }
  if (buttons.length) {
    pushFinding(findings, {
      piece: item.name,
      affectedPieces: [item.name],
      ruleId: "B2-NAME",
      rule: "better-ui/icons.md: un icono se recolorea, no sustituye el nombre. ui-system §6.1: el control de icono necesita nombre accesible (aria-label o texto).",
      severity: "major",
      evidence: buttons.slice(0, 4),
      destination: "fix en pieza",
      summary: `${item.name}: ${buttons.length} botón(es) sin texto ni aria-label.`,
      count: buttons.length,
    })
  }
  void items
}

function openingTags(source: string) {
  const tags: { name: string; attrs: string; line: number; index: number }[] = []
  let i = 0
  while (i < source.length) {
    const lt = source.indexOf("<", i)
    if (lt < 0) break
    const next = source[lt + 1]
    if (next === "/" || next === "!" || next === "?" || next === undefined) {
      i = lt + 1
      continue
    }
    const nameMatch = /^<([A-Za-z][\w.]*)/.exec(source.slice(lt))
    if (!nameMatch) {
      i = lt + 1
      continue
    }
    let j = lt + nameMatch[0].length
    let quote = ""
    for (; j < source.length; j++) {
      const char = source[j]
      if (quote) {
        if (char === quote && source[j - 1] !== "\\") quote = ""
        continue
      }
      if (char === '"' || char === "'" || char === "`") {
        quote = char
        continue
      }
      if (char === ">") break
    }
    tags.push({
      name: nameMatch[1],
      attrs: source.slice(lt, Math.min(j + 1, lt + 500)),
      line: lineOf(source, lt),
      index: lt,
    })
    i = j + 1
  }
  return tags
}

function unnamedButtons(source: string, file: string): Evidence[] {
  const found: Evidence[] = []
  const re = /<(button|Button)\b/g
  let match: RegExpExecArray | null
  while ((match = re.exec(source))) {
    const start = match.index
    let j = start
    let quote = ""
    for (; j < source.length; j++) {
      const char = source[j]
      if (quote) {
        if (char === quote && source[j - 1] !== "\\") quote = ""
        continue
      }
      if (char === '"' || char === "'" || char === "`") {
        quote = char
        continue
      }
      if (char === ">") break
    }
    const open = source.slice(start, j + 1)
    if (open.endsWith("/>")) continue
    if (/\baria-label(ledby)?\s*=|\btitle\s*=|\{\s*\.\.\./.test(open)) continue
    const close = `</${match[1]}>`
    const closeAt = source.indexOf(close, j)
    if (closeAt < 0 || closeAt - j > 800) continue
    const inner = source.slice(j + 1, closeAt)
    if (/\{/.test(inner)) continue
    if (!/<(?:svg|[A-Z][\w.]*)\b/.test(inner)) continue
    const text = inner
      .replace(/<[^>]+>/g, " ")
      .replace(/\{[^}]*\}/g, " ")
      .replace(/\s+/g, " ")
      .trim()
    if (text) continue
    found.push({ file, line: lineOf(source, start), excerpt: open.slice(0, 160).replace(/\s+/g, " ") })
    re.lastIndex = closeAt + close.length
  }
  return found
}

function scanStates(
  item: Item,
  texts: { file: string; source: string }[],
  findings: Finding[],
) {
  const joined = texts.map((entry) => entry.source).join("\n")
  const props = joined.slice(0, 2500)
  const dataSurface = /\b(records|items|rows|messages|notifications)\??\s*:/.test(props)
  if (!dataSurface) return
  if (/\b(empty|loading|isLoading|error|disabled|pending)\b/i.test(joined)) return
  const file = texts[0]?.file ?? "registry.json"
  pushFinding(findings, {
    piece: item.name,
    affectedPieces: [item.name],
    ruleId: "B4-STATES",
    rule: "ui-system §5: estados idle, pending, success, error, empty. better-ui SKILL.md (Before you finish): hover, focus, active, loading y empty. CONTRIBUTING.md escenarios de estrés: vacío y deshabilitado cuando la pieza tiene esos estados.",
    severity: "minor",
    evidence: [{ file, line: 1, excerpt: "props de colección sin empty/loading/error/disabled en el fuente" }],
    destination: "fix en pieza",
    summary: `${item.name} recibe una colección y no menciona empty, loading, error ni disabled.`,
  })
}

function propsBlock(source: string) {
  const start = source.search(/export (?:type|interface) \w*(?:Props|Options)\b/)
  if (start < 0) return ""
  const open = source.indexOf("{", start)
  if (open < 0) return ""
  let depth = 0
  for (let index = open; index < source.length; index++) {
    if (source[index] === "{") depth++
    else if (source[index] === "}") {
      depth--
      if (depth === 0) return source.slice(open, index + 1)
    }
  }
  return ""
}

function scanExtensions(items: Item[], findings: Finding[], sourceOf: (file: string) => string) {
  for (const item of items) {
    const files = (item.files ?? []).map((file) => file.path).filter((file): file is string => Boolean(file && fileIncludesName(file, item.name)))
    const main = files.find((file) => file.endsWith(`/${item.name}.tsx`) || file.endsWith(`/${item.name}.ts`)) ?? files[0]
    if (!main) continue
    const source = sourceOf(main)
    const dnd = source.includes("@dnd-kit/")
    const nativeDrag = /\bdraggable\b/.test(source) && /onDragStart|onDrop/.test(source)
    const pointerReorder = /onPointerDown/.test(source) && /onCommit|onMove/.test(source) && /edge:\s*"move"/.test(source)
    if (!dnd && !nativeDrag && !pointerReorder) continue
    const props = propsBlock(source)
    if (/\b(readOnly|draggable|dragDisabled|disableDrag|canDrag|reorderable)\??\s*:/.test(props)) continue
    const keyboard = /KeyboardSensor|onKeyDown/.test(source)
    pushFinding(findings, {
      piece: item.name,
      affectedPieces: [item.name],
      ruleId: "A7-DRAG",
      rule: "ui-system ARCHITECTURE §8 y §10 C32: extension = la pieza existe pero le falta una capacidad. El piloto cita @retana/view-kanban, que siempre arrastra y no ofrece readOnly ni draggable={false}.",
      severity: "major",
      evidence: [
        {
          file: main,
          line: lineOf(source, Math.max(source.indexOf("@dnd-kit/"), source.indexOf("draggable"), source.indexOf("onPointerDown"), 0)),
          excerpt: dnd ? "import @dnd-kit sin prop para apagar el arrastre" : "arrastre siempre activo, sin prop readOnly/draggable",
        },
      ],
      destination: "extension",
      summary: keyboard
        ? `${item.name} siempre permite arrastrar o mover. No hay readOnly ni draggable={false}.`
        : `${item.name} siempre permite arrastrar y el sensor de puntero no tiene pareja de teclado en el mismo archivo, ni un interruptor readOnly.`,
    })
    if (dnd && !source.includes("KeyboardSensor")) {
      pushFinding(findings, {
        piece: item.name,
        affectedPieces: [item.name],
        ruleId: "B2-DND-KEYBOARD",
        rule: "ui-system §6.1: el arrastre necesita teclado. @dnd-kit KeyboardSensor es el sensor que lo da. Sin él, el puntero es el único camino.",
        severity: "major",
        evidence: [{ file: main, line: lineOf(source, source.indexOf("@dnd-kit/")), excerpt: "DndContext sin KeyboardSensor" }],
        destination: "fix en pieza",
        summary: `${item.name} usa @dnd-kit sin KeyboardSensor.`,
      })
    }
  }
}

function scanCoverage(items: Item[], findings: Finding[]) {
  const tests = walk(path.join(ROOT, "__tests__")).map((file) => ({ file: rel(file), source: fs.readFileSync(file, "utf8") }))
  const testBlob = tests.map((test) => test.source).join("\n")
  for (const item of items) {
    const covered = tests.some((test) => testImports(test.source, item.name))
    if (!covered && !testBlob.includes(`registry/ui/${item.name}"`) && !testImports(testBlob, item.name)) {
      pushFinding(findings, {
        piece: item.name,
        affectedPieces: [item.name],
        ruleId: "B6-TEST",
        rule: "ui-system §6 y CONTRIBUTING.md: pnpm test cubre la pieza. Una pieza sin import en __tests__ no tiene red de regresión.",
        severity: item.type === "registry:lib" ? "minor" : "major",
        evidence: [{ file: "__tests__", line: 1, excerpt: `ningún test importa registry/.../${item.name}` }],
        destination: "test",
        summary: `${item.name} no aparece importado en __tests__.`,
      })
    }
    const preview = item.meta?.preview
    if (preview && !exists(preview)) {
      pushFinding(findings, {
        piece: item.name,
        affectedPieces: [item.name],
        ruleId: "B6-PREVIEW",
        rule: "CONTRIBUTING.md: meta.preview es un tsx en app/examples/<name>/preview.tsx.",
        severity: "blocker",
        evidence: [{ file: preview, line: 1, excerpt: "no existe" }],
        destination: "fix en pieza",
        summary: `${item.name} apunta a ${preview}, que no existe.`,
      })
    }
    const href = item.meta?.previewHref
    if (href) {
      const page = `app${href.replace(/\/$/, "")}/page.tsx`
      if (!exists(page)) {
        pushFinding(findings, {
          piece: item.name,
          affectedPieces: [item.name],
          ruleId: "B6-PAGE",
          rule: "CONTRIBUTING.md: meta.previewHref es la demo en vivo bajo app/examples.",
          severity: "major",
          evidence: [{ file: page, line: 1, excerpt: "no existe" }],
          destination: "fix en pieza",
          summary: `${item.name} no tiene página ${page}.`,
        })
      }
    }
    const stress = `app/examples/${item.name}/stress/page.tsx`
    if (!exists(stress)) {
      pushFinding(findings, {
        piece: item.name,
        affectedPieces: [item.name],
        ruleId: "B6-STRESS",
        rule: "CONTRIBUTING.md escenarios de estrés: cada pieza nueva incluye app/examples/<nombre>/stress/page.tsx.",
        severity: "minor",
        evidence: [{ file: stress, line: 1, excerpt: "no existe" }],
        destination: "test",
        summary: `${item.name} no tiene página de estrés.`,
      })
    }
    const catalogPage = exists("app/items/[name]/page.tsx")
    if (!catalogPage) {
      pushFinding(findings, {
        piece: item.name,
        affectedPieces: [item.name],
        ruleId: "B6-CATALOG",
        rule: "AGENTS.md: el sitio lista la pieza en /items/[name].",
        severity: "blocker",
        evidence: [{ file: "app/items/[name]/page.tsx", line: 1, excerpt: "no existe" }],
        destination: "fix en pieza",
        summary: "Falta la ruta dinámica del catálogo.",
      })
    }
  }
}

function testImports(source: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`registry/(?:retana/)?(?:ui|blocks|hooks|lib)/${escaped}(?:["'/]|\\.)`).test(source)
}

function similarityReport(items: Item[], sourceOf: (file: string) => string) {
  const sets = new Map<string, Set<string>>()
  for (const item of items) {
    const files = (item.files ?? [])
      .map((file) => file.path)
      .filter((file): file is string => Boolean(file && fileIncludesName(file, item.name) && ownersCount(file, items) <= 2))
    const tokens = new Set<string>()
    for (const file of files) {
      const source = sourceOf(file)
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .replace(/\/\/.*$/gm, " ")
        .replace(/["'`][^"'`]{0,80}["'`]/g, " ")
      for (const token of source.split(/[^A-Za-z0-9]+/)) {
        if (token.length > 4) tokens.add(token)
      }
    }
    sets.set(item.name, tokens)
  }
  const similarity: { a: string; b: string; jaccard: number }[] = []
  const list = items.map((item) => item.name)
  for (let i = 0; i < list.length; i++) {
    const a = sets.get(list[i])
    if (!a || a.size < 40) continue
    for (let j = i + 1; j < list.length; j++) {
      const b = sets.get(list[j])
      if (!b || b.size < 40) continue
      let inter = 0
      const [small, large] = a.size < b.size ? [a, b] : [b, a]
      for (const token of small) if (large.has(token)) inter++
      const score = inter / (a.size + b.size - inter)
      if (score >= 0.55) similarity.push({ a: list[i], b: list[j], jaccard: Number(score.toFixed(3)) })
    }
  }
  similarity.sort((a, b) => b.jaccard - a.jaccard)

  const nearNames: { a: string; b: string; jaccard: number }[] = []
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      const left = list[i]
      const right = list[j]
      const share = left.split("-").filter((part) => part.length > 4 && right.split("-").includes(part))
      if (!share.length) continue
      const a = sets.get(left)
      const b = sets.get(right)
      if (!a || !b || a.size < 20 || b.size < 20) continue
      let inter = 0
      for (const token of a) if (b.has(token)) inter++
      const score = inter / (a.size + b.size - inter)
      if (score >= 0.35 && score < 0.72) nearNames.push({ a: left, b: right, jaccard: Number(score.toFixed(3)) })
    }
  }
  nearNames.sort((a, b) => b.jaccard - a.jaccard)
  return { similarity: similarity.slice(0, 40), nearNames: nearNames.slice(0, 25) }
}

function pieceRows(items: Item[], findings: Finding[]): PieceRow[] {
  return items.map((item) => {
    const related = findings.filter(
      (finding) => finding.piece === item.name || finding.affectedPieces.includes(item.name),
    )
    const direct = related.filter((finding) => finding.piece === item.name)
    const failedA = [...new Set(related.filter((finding) => finding.ruleId.startsWith("A")).map((finding) => finding.ruleId))]
    const failedB = [...new Set(related.filter((finding) => finding.ruleId.startsWith("B")).map((finding) => finding.ruleId))]
    const rank: Record<string, number> = { blocker: 3, major: 2, minor: 1, ok: 0 }
    let max: PieceRow["maxSeverity"] = "ok"
    for (const finding of related) {
      if (rank[finding.severity] > rank[max]) max = finding.severity
    }
    const inheritedRules = [...new Set(related.filter((finding) => finding.piece !== item.name).map((finding) => finding.ruleId))]
    return {
      name: item.name,
      type: item.type,
      kind: KIND[item.type] ?? item.type,
      failedA,
      failedB,
      maxSeverity: max,
      directFindings: direct.length,
      inheritedRules,
    }
  })
}

function renewList(pieces: PieceRow[], findings: Finding[]) {
  const born = birthDates()
  const rows = pieces
    .map((piece) => {
      const direct = findings.filter((finding) => finding.piece === piece.name)
      return {
        name: piece.name,
        born: born.get(piece.name) ?? "",
        directMajors: direct.filter((finding) => finding.severity === "major" || finding.severity === "blocker").length,
        directMinors: direct.filter((finding) => finding.severity === "minor").length,
      }
    })
    .filter((row) => row.born && row.directMajors >= 2)
  rows.sort((a, b) => a.born.localeCompare(b.born) || b.directMajors - a.directMajors)
  return rows.slice(0, 20)
}

function birthDates() {
  const map = new Map<string, string>()
  const log = git(["log", "--diff-filter=A", "--pretty=format:%cI", "--name-only", "--", "registry"])
  let date = ""
  for (const line of log.split("\n")) {
    if (!line) continue
    if (/^\d{4}-\d{2}-\d{2}T/.test(line)) {
      date = line
      continue
    }
    const parts = line.split("/")
    const base = path.basename(line).replace(/\.(tsx|ts)$/, "")
    if (!map.has(base)) map.set(base, date.slice(0, 10))
    const folder = parts.at(-2)
    if (folder && folder !== "ui" && folder !== "blocks" && folder !== "hooks" && folder !== "lib" && !map.has(folder)) {
      map.set(folder, date.slice(0, 10))
    }
  }
  return map
}

function coverageSummary(items: Item[]) {
  const tests = walk(path.join(ROOT, "__tests__")).map((file) => fs.readFileSync(file, "utf8"))
  const blob = tests.join("\n")
  const withoutTest = items.filter((item) => !testImports(blob, item.name)).map((item) => item.name)
  const withoutStress = items.filter((item) => !exists(`app/examples/${item.name}/stress/page.tsx`)).map((item) => item.name)
  const withPreview = items.filter((item) => item.meta?.preview && exists(item.meta.preview)).length
  const withExamplePage = items.filter((item) => {
    const href = item.meta?.previewHref
    return Boolean(href && exists(`app${href.replace(/\/$/, "")}/page.tsx`))
  }).length
  return {
    items: items.length,
    withTest: items.length - withoutTest.length,
    withoutTest,
    withStress: items.length - withoutStress.length,
    withoutStress,
    withPreview,
    withExamplePage,
  }
}

function listOpenPrs() {
  try {
    const raw = execFileSync(
      "gh",
      ["pr", "list", "--repo", "eduardoretana/retana-ui", "--state", "open", "--limit", "20", "--json", "number,title,url,headRefName"],
      { cwd: ROOT, encoding: "utf8" },
    )
    const parsed = JSON.parse(raw) as { number: number; title: string; url: string; headRefName: string }[]
    return parsed.map((pr) => ({ number: pr.number, title: pr.title, url: pr.url, head: pr.headRefName }))
  } catch {
    return []
  }
}

type Rebuild = AuditData["payload"]["rebuild"]

function emptyRebuild(): Rebuild {
  return { ran: false, exitCode: null, dirtyBefore: [], diffAfterBuild: [], diffAfterReadme: [], restored: false, logTail: "" }
}

function runRebuild(): Rebuild {
  const dirtyBefore = git(["status", "--porcelain"]).split("\n").filter(Boolean)
  const unexpected = dirtyBefore.filter((line) => {
    const file = line.slice(3).trim()
    return file !== "docs" && file !== "docs/" && !file.startsWith("docs/")
  })
  if (unexpected.length) {
    return {
      ran: false,
      exitCode: null,
      dirtyBefore,
      diffAfterBuild: [],
      diffAfterReadme: [],
      restored: false,
      logTail: "rebuild omitido: el árbol tenía cambios fuera de docs/audit",
    }
  }
  let exitCode = 0
  let log = ""
  try {
    log = execFileSync("pnpm", ["registry:build"], { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })
  } catch (error) {
    const err = error as { status?: number; stdout?: string; stderr?: string }
    exitCode = err.status ?? 1
    log = `${err.stdout ?? ""}\n${err.stderr ?? ""}`
  }
  const diffAfterBuild = git(["diff", "--name-only", "--", "public/r", "lib/generated/preview-map.tsx"])
    .split("\n")
    .filter(Boolean)
  let readmeLog = ""
  try {
    readmeLog = execFileSync("pnpm", ["readme:catalog"], { cwd: ROOT, encoding: "utf8" })
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string }
    readmeLog = `${err.stdout ?? ""}\n${err.stderr ?? ""}`
  }
  const diffAfterReadme = git(["diff", "--name-only", "--", "README.md"]).split("\n").filter(Boolean)
  execFileSync("git", ["checkout", "--", "public/r", "lib/generated/preview-map.tsx", "README.md"], { cwd: ROOT })
  const still = git(["diff", "--name-only", "--", "public/r", "lib/generated/preview-map.tsx", "README.md"])
  return {
    ran: true,
    exitCode,
    dirtyBefore,
    diffAfterBuild,
    diffAfterReadme,
    restored: still.length === 0,
    logTail: `${log}\n${readmeLog}`.slice(-2000),
  }
}

function assignIds(findings: Finding[]) {
  const rank: Record<Severity, number> = { blocker: 0, major: 1, minor: 2 }
  findings.sort((a, b) => rank[a.severity] - rank[b.severity] || a.ruleId.localeCompare(b.ruleId) || a.piece.localeCompare(b.piece) || a.summary.localeCompare(b.summary))
  findings.forEach((finding, index) => {
    finding.id = `F${String(index + 1).padStart(3, "0")}`
  })
}

export function verdictOf(data: AuditData) {
  const blockers = data.findings.filter((finding) => finding.severity === "blocker")
  const installIntegrity = blockers.filter((finding) =>
    ["A3-DRIFT", "A3-MISSING", "A5-IMPORT", "B1-CSSVARS", "B1-HEX", "B1-FN", "B1-PALETTE", "B1-NAMED", "B1-INLINE", "B1-FONT"].includes(finding.ruleId),
  )
  const drifted = data.payload.rebuild.diffAfterBuild.length > 0 || data.payload.missing.length > 0
  const colorItems = new Set(installIntegrity.filter((finding) => finding.ruleId.startsWith("B1-")).flatMap((finding) => finding.affectedPieces.length ? finding.affectedPieces : [finding.piece]))
  if (drifted || data.payload.cssVars.length > 0 || colorItems.size > data.counts.items * 0.05) {
    return "NO APTO" as const
  }
  if (blockers.length || data.findings.some((finding) => finding.severity === "major")) return "APTO CON CAMBIOS" as const
  return "APTO" as const
}
