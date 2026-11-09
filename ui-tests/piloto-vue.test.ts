import { createHash } from "node:crypto"
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "..")

function abs(rel: string) {
  return path.join(root, rel)
}

function read(rel: string) {
  return readFileSync(abs(rel), "utf8")
}

function block(css: string, header: string) {
  const start = css.indexOf(header)
  expect(start, header).toBeGreaterThanOrEqual(0)
  const open = css.indexOf("{", start)
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++
    else if (css[i] === "}") {
      depth--
      if (depth === 0) return css.slice(open + 1, i)
    }
  }
  throw new Error(`sin cierre: ${header}`)
}

function decls(body: string) {
  return [...body.matchAll(/(^|\n)\s*(--[\w-]+)\s*:/g)].map((match) => match[2]!)
}

function walkFiles(dir: string, into: string[] = []) {
  if (!existsSync(dir)) return into
  for (const entry of readdirSync(dir)) {
    const full = path.join(dir, entry)
    if (statSync(full).isDirectory()) walkFiles(full, into)
    else into.push(full)
  }
  return into
}

type RetanaExt = { css?: string | string[]; tailwind?: string | string[]; vuetify?: string }

function collect(node: unknown, acc: { css: string[]; tailwind: string[] }) {
  if (!node || typeof node !== "object") return
  const record = node as { $extensions?: { "com.retana"?: RetanaExt }; $value?: unknown }
  const ext = record.$extensions?.["com.retana"]
  if (ext && record.$value !== undefined) {
    for (const value of [ext.css].flat()) if (value) acc.css.push(value)
    for (const value of [ext.tailwind].flat()) if (value) acc.tailwind.push(value)
  }
  for (const value of Object.values(node)) collect(value, acc)
}

const sha = "6671cfac72f736739d2d3dd2740cc5f13416acb3"

describe("piloto vue", () => {
  it("AC0 tokens DTCG y diff de nombres", () => {
    expect(existsSync(abs("tokens/retana.tokens.json")), "AC0-TOKENS-FILE").toBe(true)
    const tokens = JSON.parse(read("tokens/retana.tokens.json")) as {
      color: { light: Record<string, { $type?: string; $value?: string }>; dark: Record<string, { $type?: string; $value?: string }> }
    }
    const text = JSON.stringify(tokens)
    expect(text, "AC0-DTCG").toContain('"$type"')
    expect(text, "AC0-DTCG").toContain('"$value"')
    expect(text, "AC0-NO-MARCA").not.toContain("#244BD6")
    expect(text, "AC0-NO-MARCA").not.toContain("#F3EFE6")
    const css = read("app/globals.css")
    const theme = decls(block(css, "@theme inline"))
    const host = decls(block(css, ":root {"))
    const names = { css: [] as string[], tailwind: [] as string[] }
    collect(tokens, names)
    expect([...new Set(names.tailwind)].sort(), "AC0-THEME-DIFF").toEqual([...new Set(theme)].sort())
    const defined = new Set([...theme, ...host])
    expect(names.css.filter((name) => !defined.has(name)), "AC0-CSS-DEFINED").toEqual([])
    expect([...new Set(names.css.filter((name) => host.includes(name)))].sort(), "AC0-ROOT-DIFF").toEqual([...host].sort())
    const light = Object.keys(tokens.color.light).sort()
    const dark = Object.keys(tokens.color.dark).sort()
    expect(dark, "AC0-DARK-KEYS").toEqual(light)
    expect(light.map((key) => `--${key}`).sort(), "AC0-HOST-COLOR").toEqual(host.filter((name) => name !== "--radius").sort())
    for (const key of light) {
      expect(tokens.color.light[key]?.$type, `AC0-TYPE-${key}`).toBe("color")
      expect(tokens.color.light[key]?.$value, `AC0-LIGHT-${key}`).toMatch(/^oklch\(/)
      expect(tokens.color.dark[key]?.$value, `AC0-DARK-${key}`).toMatch(/^oklch\(/)
    }
  })

  it("AC0 demo opt-in", () => {
    expect(existsSync(abs("tokens/demo.css")), "AC0-DEMO").toBe(true)
    const demo = read("tokens/demo.css")
    const css = read("app/globals.css")
    for (const value of block(css, ":root {").matchAll(/oklch\([^)]+\)/g)) {
      expect(demo, "AC0-DEMO-LIGHT").toContain(value[0])
    }
    for (const value of block(css, "\n.dark {").matchAll(/oklch\([^)]+\)/g)) {
      expect(demo, "AC0-DEMO-DARK").toContain(value[0])
    }
    expect(demo, "AC0-DEMO-EMBER").not.toContain("oklch(0.55 0.18 40)")
    expect(demo, "AC0-DEMO-REVIEW").not.toContain("oklch(0.55 0.12 195)")
    for (const file of walkFiles(abs("registry"))) {
      if (!file.endsWith(".ts") && !file.endsWith(".tsx") && !file.endsWith(".css")) continue
      expect(readFileSync(file, "utf8"), "AC0-REGISTRY-IMPORT").not.toContain("tokens/demo.css")
    }
  })

  it("AC0 alias sin color", () => {
    expect(existsSync(abs("tokens/tailwind-alias.css")), "AC0-ALIAS").toBe(true)
    const alias = read("tokens/tailwind-alias.css")
    const theme = decls(block(read("app/globals.css"), "@theme inline"))
    for (const name of theme) expect(alias, `AC0-ALIAS-${name}`).toContain(`${name}:`)
    expect(alias, "AC0-ALIAS-LITERAL").not.toMatch(/oklch\(|#[0-9a-fA-F]{3,8}\b|\brgb\(|\brgba\(/)
  })

  it("AC0 contrato sin color", () => {
    expect(existsSync(abs("tokens/contract.css")), "AC0-CONTRACT").toBe(true)
    const contract = read("tokens/contract.css")
    for (const name of decls(block(read("app/globals.css"), ":root {"))) {
      expect(contract, `AC0-CONTRACT-${name}`).toContain(name)
    }
    expect(contract, "AC0-CONTRACT-LITERAL").not.toMatch(/oklch\(|#[0-9a-fA-F]{3,8}\b|\brgb\(|\brgba\(/)
  })

  it("AC0 puente Vuetify", () => {
    expect(existsSync(abs("tokens/bridge.css")), "AC0-BRIDGE").toBe(true)
    const bridge = read("tokens/bridge.css")
    const lines: [string, string][] = [
      ["--background", "rgb(var(--v-theme-background))"],
      ["--foreground", "rgb(var(--v-theme-on-background))"],
      ["--card", "rgb(var(--v-theme-surface))"],
      ["--card-foreground", "rgb(var(--v-theme-on-surface))"],
      ["--popover", "rgb(var(--v-theme-surface))"],
      ["--popover-foreground", "rgb(var(--v-theme-on-surface))"],
      ["--primary", "rgb(var(--v-theme-primary))"],
      ["--primary-foreground", "rgb(var(--v-theme-on-primary))"],
      ["--secondary", "rgb(var(--v-theme-retana-secondary))"],
      ["--secondary-foreground", "rgb(var(--v-theme-on-retana-secondary))"],
      ["--muted", "rgb(var(--v-theme-serie-pista))"],
      ["--muted-foreground", "rgb(var(--v-theme-secondary))"],
      ["--accent", "rgb(var(--v-theme-retana-accent))"],
      ["--accent-foreground", "rgb(var(--v-theme-on-retana-accent))"],
      ["--destructive", "rgb(var(--v-theme-error))"],
      ["--border", "rgba(var(--v-theme-on-surface), 0.12)"],
      ["--input", "rgba(var(--v-theme-on-surface), 0.5)"],
      ["--ring", "rgb(var(--v-theme-primary))"],
      ["--chart-1", "rgb(var(--v-theme-serie-agente))"],
      ["--chart-2", "rgb(var(--v-theme-serie-humana))"],
      ["--chart-3", "rgb(var(--v-theme-serie-neutra))"],
      ["--chart-4", "rgb(var(--v-theme-chart-4))"],
      ["--chart-5", "rgb(var(--v-theme-chart-5))"],
      ["--sidebar", "rgb(var(--v-theme-barra))"],
      ["--sidebar-foreground", "rgb(var(--v-theme-on-barra))"],
      ["--sidebar-primary", "rgb(var(--v-theme-senal))"],
      ["--sidebar-primary-foreground", "rgb(var(--v-theme-on-senal))"],
      ["--sidebar-accent", "rgba(var(--v-theme-on-barra), 0.16)"],
      ["--sidebar-accent-foreground", "rgb(var(--v-theme-on-barra))"],
      ["--sidebar-border", "rgb(var(--v-theme-sidebar-border))"],
      ["--sidebar-ring", "rgb(var(--v-theme-on-barra))"],
      ["--radius", "var(--retana-radius, 0.5rem)"],
    ]
    const host = decls(block(read("app/globals.css"), ":root {"))
    expect(lines.map(([name]) => name).sort(), "AC0-BRIDGE-COVERS").toEqual([...host].sort())
    for (const [name, value] of lines) {
      expect(bridge, `AC0-BRIDGE-${name}`).toContain(`${name}: ${value};`)
    }
    expect(bridge, "AC0-BRIDGE-SECONDARY").not.toContain("--secondary: rgb(var(--v-theme-secondary));")
    expect(bridge, "AC0-BRIDGE-HEX").not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(bridge, "AC0-BRIDGE-OKLCH").not.toContain("oklch(")
  })

  it("AC0 constantes C#", () => {
    expect(existsSync(abs("tokens/RetanaTokenNames.cs")), "AC0-CSHARP").toBe(true)
    const cs = read("tokens/RetanaTokenNames.cs")
    expect(cs, "AC0-CSHARP-NS").toContain("namespace Retana.Ui")
    for (const name of decls(block(read("app/globals.css"), ":root {"))) {
      expect(cs, `AC0-CSHARP-${name}`).toContain(`"${name}"`)
    }
    expect(cs, "AC0-CSHARP-VALUE").not.toMatch(/oklch\(|#[0-9a-fA-F]{3,8}\b/)
  })

  it("AC0 Style Dictionary", () => {
    expect(existsSync(abs("vue/scripts/build-tokens.mjs")), "AC0-SD").toBe(true)
    expect(read("vue/scripts/build-tokens.mjs"), "AC0-SD-IMPORT").toMatch(/style-dictionary/)
  })

  it("AC3 hoja compilada", () => {
    expect(existsSync(abs("vue/scripts/build-css.mjs")), "AC-CSS-TW").toBe(true)
    expect(read("vue/scripts/build-css.mjs"), "AC-CSS-TW").toMatch(/tailwind/)
    expect(existsSync(abs("vue/dist/pilot.css")), "AC-PILOT-CSS").toBe(true)
    const pilot = read("vue/dist/pilot.css")
    expect(pilot, "AC-PILOT-OKLCH").not.toMatch(/oklch\(|oklab/)
    expect(pilot, "AC-PILOT-HEX").not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(pilot, "AC-PILOT-RGB").not.toMatch(/\brgb\(|\brgba\(/)
    expect(pilot, "AC-PILOT-PREFIX").toContain(".rt\\:")
    expect(pilot, "AC-PILOT-VUETIFY").not.toMatch(/\.v-/)
    expect(pilot, "AC-PILOT-PREFLIGHT").not.toContain("box-sizing: border-box")
    expect(pilot, "AC3-CHAIN").toMatch(/var\(--(?:color-)?primary\)/)
    expect(existsSync(abs("tokens/fixture-primary.html")), "AC3-FIXTURE").toBe(true)
    const fixture = read("tokens/fixture-primary.html")
    expect(fixture, "AC3-FIXTURE-CLASS").toContain("rt:bg-primary")
    expect(fixture, "AC3-FIXTURE-SHEET").toContain("pilot.css")
  })

  it("AC1 props en los SFC", () => {
    const statsPath = "vue/src/time-off-stats/TimeOffStats.vue"
    const inboxPath = "vue/src/decision-inbox/DecisionInbox.vue"
    const lightPath = "vue/src/lightbox/Lightbox.vue"
    expect(existsSync(abs(statsPath)), "AC1-TIME-OFF-STATS-SFC").toBe(true)
    const stats = read(statsPath)
    for (const name of ["available", "pending", "years", "loading", "error", "labels", "className"]) {
      expect(stats, `AC1-STATS-${name}`).toMatch(new RegExp(`\\b${name}\\b`))
    }
    expect(stats, "AC1-STATS-BUSY").toContain("aria-busy")
    expect(stats, "AC1-STATS-ALERT").toContain('role="alert"')
    expect(stats, "AC1-STATS-SLOT").toContain('name="skeleton"')
    expect(stats, "AC1-STATS-PREFIX").toContain("rt:")
    expect(stats, "AC1-STATS-SCOPE").toContain("retana")
    expect(stats, "AC1-STATS-REDUCE").toContain("motion-reduce")
    const inbox = read(inboxPath)
    for (const name of ["items", "onAnswer", "onDismiss", "loading", "error", "labels", "className", "classNames", "answeredIcon"]) {
      expect(inbox, `AC1-INBOX-${name}`).toMatch(new RegExp(`\\b${name}\\b`))
    }
    expect(inbox, "AC1-INBOX-SLOT").toContain('name="answered-icon"')
    expect(inbox, "AC1-INBOX-LIVE").toContain('aria-live="polite"')
    expect(inbox, "AC1-INBOX-STATUS").toContain('role="status"')
    expect(inbox, "AC1-INBOX-ALERT").toContain('role="alert"')
    const light = read(lightPath)
    for (const name of ["items", "open", "onOpenChange", "index", "onIndexChange", "closeLabel", "previousLabel", "nextLabel", "zoomInLabel", "zoomOutLabel", "previousIcon", "nextIcon", "closeIcon", "zoomInIcon", "zoomOutIcon", "zoom"]) {
      expect(light, `AC1-LIGHT-${name}`).toMatch(new RegExp(`\\b${name}\\b`))
    }
    expect(light, "AC1-LIGHT-REKA").toContain("reka-ui")
    expect(light, "AC1-LIGHT-TRANSFORM").toContain("transition-transform")
    expect(existsSync(abs("vue/src/lightbox/LightboxGallery.vue")), "AC1-GALLERY").toBe(true)
    const sources = walkFiles(abs("vue/src")).filter((file) => file.endsWith(".vue") || file.endsWith(".css") || file.endsWith(".ts"))
    for (const file of sources) {
      const source = readFileSync(file, "utf8")
      const rel = path.relative(root, file)
      expect(source, `AC-TRANSITION-ALL ${rel}`).not.toMatch(/transition-all/)
      expect(source, `AC-TRANSITION-BARE ${rel}`).not.toMatch(/(?<![\w-])transition(?![\w-])/)
      expect(source, `AC-LUCIDE ${rel}`).not.toMatch(/lucide/)
      expect(source, `AC-GESTURE-CODE ${rel}`).not.toMatch(/motion-v|vaul-vue|@formkit\/drag-and-drop|@vueuse\/gesture/)
    }
  })

  it("AC2 JSON de time-off-stats", () => {
    const current = read("app/examples/time-off-stats/fixtures.ts")
    expect(current, "AC2-STATS-JSON").toContain("fixtures/time-off-stats.json")
    expect(existsSync(abs("fixtures/time-off-stats.json")), "AC2-STATS-FILE").toBe(true)
    const json = JSON.parse(read("fixtures/time-off-stats.json"))
    expect(json.labels.es.title, "AC2-STATS-ES").toBe("Saldo")
    expect(json.labels.es.empty, "AC2-STATS-EMPTY").toBe("No hay saldo que mostrar.")
    expect(json.labels.es.loading, "AC2-STATS-LOADING").toBe("Cargando el saldo")
    expect(json.labels.es.amount, "AC2-STATS-AMOUNT").toBe("{value} días")
    expect(json.labels.en.amount, "AC2-STATS-EN").toBe("{value} days")
    expect(json.scenes.filled.available, "AC2-STATS-FILLED").toBe(12)
    expect(json.scenes.error.error.es, "AC2-STATS-ERR").toBe("No se pudo leer el saldo.")
  })

  it("AC2 JSON de decision-inbox", () => {
    expect(read("app/examples/decision-inbox/fixtures.ts"), "AC2-INBOX-JSON").toContain("fixtures/decision-inbox.json")
    expect(existsSync(abs("fixtures/decision-inbox.json")), "AC2-INBOX-FILE").toBe(true)
    const json = JSON.parse(read("fixtures/decision-inbox.json"))
    expect(json.labels.es.title, "AC2-INBOX-ES").toBe("Llamadas abiertas")
    expect(json.labels.es.choose, "AC2-INBOX-CHOOSE").toBe("{choice} para “{title}”")
    expect(json.labels.en.choose, "AC2-INBOX-CHOOSE-EN").toBe("{choice} for “{title}”")
    expect(json.labels.es.answered, "AC2-INBOX-ANSWERED").toBe("Respuesta: {choice}")
    expect(json.items[0].id, "AC2-INBOX-ID").toBe("anticipo")
    expect(json.scenes.answered.items[0].answerId, "AC2-INBOX-ANSWER").toBe("viernes")
  })

  it("AC2 escenas de lightbox", () => {
    expect(existsSync(abs("fixtures/lightbox.json")), "AC2-LIGHT-FILE").toBe(true)
    expect(existsSync(abs("app/examples/lightbox/scenes.tsx")), "AC2-LIGHTBOX-SCENES").toBe(true)
    const scenes = read("app/examples/lightbox/scenes.tsx")
    expect(scenes, "AC2-LIGHTBOX-EXPORT").toContain("export const scenes")
    for (const id of ["filled", "empty", "loading", "error"]) {
      expect(scenes, `AC2-LIGHTBOX-${id}`).toContain(`"${id}"`)
    }
    const registry = JSON.parse(read("registry.json")) as { items: { name: string; meta?: { scenes?: unknown } }[] }
    const item = registry.items.find((entry) => entry.name === "lightbox")
    expect(item?.meta?.scenes, "AC2-LIGHTBOX-REGISTRY").toBeUndefined()
  })

  it("AC6 Razor estático", () => {
    expect(existsSync(abs("hosts/razor/TimeOffStats.cshtml")), "AC6-RAZOR").toBe(true)
    const view = read("hosts/razor/TimeOffStats.cshtml")
    expect(view, "AC6-SCRIPT").not.toMatch(/<script/i)
    expect(view, "AC6-ALERT").toContain('role="alert"')
    expect(view, "AC6-FILLED").toContain("Saldo")
    expect(view, "AC6-EMPTY").toContain("No hay saldo que mostrar.")
    expect(view, "AC6-ERROR").toContain("No se pudo leer el saldo.")
    expect(view, "AC6-LOADING").toContain("Cargando el saldo")
    expect(view, "AC6-PREFIX").toContain("rt:")
    expect(view, "AC6-SHEET").toContain("pilot.css")
    expect(existsSync(abs("hosts/razor/time-off-stats.html")), "AC6-HTML").toBe(true)
    expect(read("hosts/razor/time-off-stats.html"), "AC6-HTML-SCRIPT").not.toMatch(/<script/i)
  })

  it("AC7 registry intacto y dependencias del workspace", () => {
    expect(existsSync(abs("tokens/retana.tokens.json")), "AC7-TOKENS").toBe(true)
    const registryText = read("registry.json")
    expect(registryText, "AC7-REGISTRY-JSON").not.toContain("retana.catalog")
    expect(registryText, "AC7-REGISTRY-FW").not.toContain('"frameworks"')
    const pkg = JSON.parse(read("vue/package.json")) as { dependencies?: Record<string, string>; devDependencies?: Record<string, string> }
    expect(pkg.devDependencies?.vue, "AC-DEPS-VUE").toBeTruthy()
    expect(pkg.devDependencies?.["reka-ui"], "AC-DEPS-REKA").toBeTruthy()
    expect(pkg.devDependencies?.["style-dictionary"], "AC-DEPS-SD").toBeTruthy()
    expect(pkg.devDependencies?.vuetify, "AC-DEPS-VUETIFY").toBeTruthy()
    expect(pkg.devDependencies?.["@mdi/font"], "AC-DEPS-MDI").toBeTruthy()
    expect(pkg.dependencies?.vue, "AC-DEPS-RUNTIME").toBeUndefined()
    const rootPkg = JSON.parse(read("package.json")) as { dependencies: Record<string, string>; devDependencies: Record<string, string> }
    for (const name of ["vue", "reka-ui", "style-dictionary", "vuetify"]) {
      expect(rootPkg.dependencies[name], `AC-DEPS-ROOT-${name}`).toBeUndefined()
      expect(rootPkg.devDependencies[name], `AC-DEPS-ROOT-DEV-${name}`).toBeUndefined()
    }
  })

  it("AC manifiesto", () => {
    expect(existsSync(abs("catalog/retana.catalog.json")), "AC-MANIFEST").toBe(true)
    const manifest = JSON.parse(read("catalog/retana.catalog.json")) as {
      schema: string
      retana_ui: { sha: string }
      items: { name: string; frameworks: { react: string; vue: string; css: string; razor: string }; contract?: { fixturesSha256?: string; apiSha256?: string } }[]
    }
    expect(manifest.schema, "AC-MANIFEST-SCHEMA").toBe("retana.catalog/v1")
    expect(manifest.retana_ui.sha, "AC-MANIFEST-SHA").toBe(sha)
    const registry = JSON.parse(read("registry.json")) as { items: { name: string; meta?: { api?: unknown } }[] }
    expect(manifest.items.length, "AC-MANIFEST-COUNT").toBe(registry.items.length)
    const byName = Object.fromEntries(manifest.items.map((item) => [item.name, item]))
    expect(byName["time-off-stats"]?.frameworks, "AC-MANIFEST-STATS").toMatchObject({ react: "stable", vue: "pilot", css: "pilot", razor: "html" })
    expect(byName["decision-inbox"]?.frameworks.vue, "AC-MANIFEST-INBOX").toBe("pilot")
    expect(byName["decision-inbox"]?.frameworks.razor, "AC-MANIFEST-INBOX-RAZOR").not.toBe("html")
    expect(byName["lightbox"]?.frameworks.vue, "AC-MANIFEST-LIGHT").toBe("pilot")
    expect(byName["lightbox"]?.frameworks.css, "AC-MANIFEST-LIGHT-CSS").not.toBe("pilot")
    expect(manifest.items.filter((item) => item.frameworks.razor === "html").map((item) => item.name), "AC-MANIFEST-RAZOR").toEqual(["time-off-stats"])
    expect(manifest.items.filter((item) => item.frameworks.css === "pilot").map((item) => item.name), "AC-MANIFEST-CSS").toEqual(["time-off-stats"])
    for (const item of manifest.items) {
      expect(item.frameworks.react, `AC-MANIFEST-REACT-${item.name}`).toBe("stable")
      if (!["time-off-stats", "decision-inbox", "lightbox"].includes(item.name)) {
        expect(item.frameworks.vue, `AC-MANIFEST-VUE-${item.name}`).toBe("none")
      }
    }
    for (const name of ["time-off-stats", "decision-inbox", "lightbox"]) {
      const fixturesHash = createHash("sha256").update(readFileSync(abs(`fixtures/${name}.json`))).digest("hex")
      expect(byName[name]?.contract?.fixturesSha256, `AC-MANIFEST-FIX-${name}`).toBe(fixturesHash)
      const api = registry.items.find((item) => item.name === name)?.meta?.api
      const apiHash = createHash("sha256").update(JSON.stringify(api)).digest("hex")
      expect(byName[name]?.contract?.apiSha256, `AC-MANIFEST-API-${name}`).toBe(apiHash)
    }
  })

  it("AC9 nota de gestos", () => {
    expect(existsSync(abs("docs/vue/gestos.md")), "AC9-GESTOS").toBe(true)
    const doc = read("docs/vue/gestos.md")
    for (const phrase of ["motion-v", "2.11.1", "vaul-vue", "0.4.1", "@formkit/drag-and-drop", "0.7.0", "@vueuse/gesture", "MIT"]) {
      expect(doc, `AC9-${phrase}`).toContain(phrase)
    }
    expect(doc, "AC9-INACTIVO").toMatch(/inactiv/)
  })

  it("AC licencias", () => {
    expect(existsSync(abs("vue/NOTICE")), "AC-NOTICE").toBe(true)
    const notice = read("vue/NOTICE")
    expect(notice, "AC-NOTICE-APACHE").toMatch(/Apache-2\.0/)
    expect(notice, "AC-NOTICE-SD").toMatch(/style-dictionary|Style Dictionary/)
    expect(notice, "AC-NOTICE-REKA").toContain("reka-ui")
    expect(notice, "AC-NOTICE-VUE").toMatch(/\bvue\b/i)
    expect(notice, "AC-NOTICE-MIT").toContain("MIT")
  })

  it("AC puente documentado", () => {
    expect(existsSync(abs("docs/vue/vuetify.md")), "AC-VUETIFY-DOC").toBe(true)
    const doc = read("docs/vue/vuetify.md")
    expect(doc, "AC-VUETIFY-APP").toContain("canal-semilla")
    expect(doc, "AC-VUETIFY-SHA").toContain("f93d7781")
    expect(doc, "AC-VUETIFY-OTRA").toContain("app-aldo-pensiones")
    expect(doc, "AC-VUETIFY-VER").toContain("3.13")
    expect(doc, "AC-VUETIFY-RGB").toContain("rgb(var(--v-theme-")
    expect(doc, "AC-VUETIFY-CHANNELS").toMatch(/R,G,B/)
  })

  it("AC demo Cenit solo en vue/demo", () => {
    expect(existsSync(abs("vue/demo/cenit-theme.ts")), "AC-DEMO-THEME").toBe(true)
    const theme = read("vue/demo/cenit-theme.ts")
    expect(theme, "AC-DEMO-PRIMARY").toContain("#244BD6")
    expect(theme, "AC-DEMO-BG").toContain("#F3EFE6")
    expect(theme, "AC-DEMO-OPACITY").toContain("0.7")
    const banned = ["tokens", "vue/src", "vue/dist", "registry"]
    for (const folder of banned) {
      for (const file of walkFiles(abs(folder))) {
        if (file.endsWith(".png")) continue
        expect(readFileSync(file, "utf8").includes("#244BD6"), `AC-DEMO-HEX ${path.relative(root, file)}`).toBe(false)
      }
    }
  })

  it("AC status de auditoría", () => {
    const status = read("ui/status/piloto-vue.ui-status.yaml")
    expect(status, "AC-STATUS-LINE").toMatch(/ui_system:\s*\{version:\s*4\.0\.0\}/)
    expect(status, "AC-STATUS-STATE").toContain("cycle_state: AUDITORIA")
    expect(status, "AC-STATUS-SHA").toContain(sha)
  })
})
