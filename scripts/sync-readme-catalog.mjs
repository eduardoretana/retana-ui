/**
 * Refresh the catalog block in README.md from registry.json.
 *
 * Items that are not in registry.json yet can be listed from
 * .github/catalog-pending.json. Those names are not linked, so the README
 * does not point at files this branch does not have. Once a name exists in
 * registry.json, the pending copy is skipped.
 *
 *   pnpm readme:catalog
 */
import fs from "node:fs"
import path from "node:path"

const root = path.resolve(import.meta.dirname, "..")
const readmePath = path.join(root, "README.md")
const registryPath = path.join(root, "registry.json")
const pendingPath = path.join(root, ".github", "catalog-pending.json")
const start = "<!-- CATALOG:START -->"
const end = "<!-- CATALOG:END -->"

const KIND = {
  "registry:ui": "ui",
  "registry:block": "block",
  "registry:lib": "lib",
  "registry:hook": "hook",
  "registry:component": "ui",
}

const GROUP_ORDER = [
  "Detail",
  "Chat and agents",
  "Forms",
  "Media and content",
  "Tables",
  "Admin",
  "Other",
]

const GROUP_OVERRIDE = {
  "attachment-chip": "Media and content",
}

/**
 * Catalog group for one item. Pending entries and `admin` categories go in Admin.
 * @param {{ name: string, categories?: string[], pending?: boolean }} item
 * @returns {string}
 */
function groupOf(item) {
  if (GROUP_OVERRIDE[item.name]) return GROUP_OVERRIDE[item.name]
  const cats = new Set(item.categories ?? [])
  if (item.pending || cats.has("admin")) return "Admin"
  if (cats.has("panel")) return "Detail"
  if (cats.has("chat") || cats.has("ai")) return "Chat and agents"
  if (cats.has("table")) return "Tables"
  if (cats.has("form") || cats.has("input")) return "Forms"
  if (cats.has("media") || cats.has("content") || cats.has("hook")) return "Media and content"
  if (cats.has("dashboard")) return "Tables"
  return "Other"
}

/**
 * Flatten text and escape characters that would break a Markdown line.
 * @param {unknown} text
 * @returns {string}
 */
function escapeCell(text) {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .trim()
}

/**
 * One catalog bullet. The name is a link only when its source file exists.
 * @param {{ name: string, type?: string, description?: string, files?: { path: string }[] }} item
 * @returns {string}
 */
function itemLine(item) {
  const kind = KIND[item.type] ?? item.type ?? "item"
  const description = escapeCell(item.description)
  const file = item.files?.[0]?.path
  const linked = file && fs.existsSync(path.join(root, file))
  const name = linked ? `[\`${item.name}\`](${file})` : `\`${item.name}\``
  return `- ${name} · ${kind} — ${description}`
}

/**
 * Items declared in registry.json.
 * @returns {Array<{ name: string }>}
 */
function loadRegistry() {
  const data = JSON.parse(fs.readFileSync(registryPath, "utf8"))
  return data.items ?? []
}

/**
 * Pending entries whose names are not already in registry.json.
 * @param {Set<string>} known Names already registered.
 * @returns {Array<{ name: string, pending: true }>}
 */
function loadPending(known) {
  if (!fs.existsSync(pendingPath)) return []
  const data = JSON.parse(fs.readFileSync(pendingPath, "utf8"))
  return (data.items ?? [])
    .filter((item) => item?.name && !known.has(item.name))
    .map((item) => ({ ...item, pending: true }))
}

/**
 * Catalog Markdown. The install command covers registered items only.
 * @param {Array<object>} registryItems Items from registry.json.
 * @param {Array<object>} pendingItems Unregistered names listed for context.
 * @returns {string}
 */
function render(registryItems, pendingItems) {
  const groups = new Map(GROUP_ORDER.map((name) => [name, []]))
  for (const item of [...registryItems, ...pendingItems]) {
    const name = groupOf(item)
    if (!groups.has(name)) groups.set(name, [])
    groups.get(name).push(item)
  }

  const lines = []
  const onBranch = registryItems.length
  lines.push(
    `\`${onBranch}\` items are in \`registry.json\` on this branch. A name links to its source file.`,
  )
  if (pendingItems.length) {
    lines.push(
      `${pendingItems.length} more are listed from [pull request #4](https://github.com/eduardoretana/retana-ui/pull/4) and are not linked, because those files are not on this branch yet. After that pull request merges, run \`pnpm readme:catalog\` and this sentence drops away.`,
    )
  } else {
    lines.push("Run `pnpm readme:catalog` to refresh this list.")
  }
  lines.push("")
  lines.push(
    "Install any registered item with `npx shadcn@latest add @retana/<name>`.",
  )
  if (pendingItems.length) {
    lines.push(
      "That command does not cover the unregistered names below.",
    )
  }

  for (const [name, items] of groups) {
    if (!items.length) continue
    lines.push("")
    lines.push(`### ${name}`)
    lines.push("")
    if (items.some((item) => item.pending)) {
      lines.push(
        "Unlinked names in this group are not in `registry.json` yet.",
      )
      lines.push("")
    }
    for (const item of items) lines.push(itemLine(item))
  }

  return lines.join("\n")
}

const readme = fs.readFileSync(readmePath, "utf8")
const pattern = new RegExp(`${start}[\\s\\S]*?${end}`)
if (!pattern.test(readme)) {
  console.error("README is missing CATALOG markers")
  process.exit(1)
}

const registryItems = loadRegistry()
const known = new Set(registryItems.map((item) => item.name))
const pendingItems = loadPending(known)
const body = render(registryItems, pendingItems)
const next = readme.replace(pattern, `${start}\n\n${body}\n\n${end}`)
fs.writeFileSync(readmePath, next)
console.log(
  `catalog: ${registryItems.length} from registry.json, ${pendingItems.length} pending`,
)
