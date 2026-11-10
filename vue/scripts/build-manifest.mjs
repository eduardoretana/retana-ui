import { createHash } from "node:crypto"
import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const registry = JSON.parse(readFileSync(path.join(repo, "registry.json"), "utf8"))
const sha = "6671cfac72f736739d2d3dd2740cc5f13416acb3"
const pilot = new Set(["time-off-stats", "decision-inbox", "lightbox"])

const items = registry.items.map((item) => {
  const vue = pilot.has(item.name) ? "pilot" : "none"
  const entry = {
    name: item.name,
    frameworks: {
      react: "stable",
      vue,
      css: item.name === "time-off-stats" ? "pilot" : "none",
      razor: item.name === "time-off-stats" ? "html" : "none",
    },
  }
  if (!pilot.has(item.name)) return entry
  const fixtures = readFileSync(path.join(repo, "fixtures", `${item.name}.json`))
  return {
    ...entry,
    contract: {
      fixtures: `fixtures/${item.name}.json`,
      fixturesSha256: createHash("sha256").update(fixtures).digest("hex"),
      apiSha256: createHash("sha256").update(JSON.stringify(item.meta?.api)).digest("hex"),
    },
  }
})

const manifest = {
  schema: "retana.catalog/v1",
  retana_ui: { sha },
  items,
}
mkdirSync(path.join(repo, "catalog"), { recursive: true })
writeFileSync(path.join(repo, "catalog/retana.catalog.json"), `${JSON.stringify(manifest, null, 2)}\n`)
console.log(`manifiesto ${items.length} ítems`)
