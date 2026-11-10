import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import StyleDictionary from "style-dictionary"

const here = path.dirname(fileURLToPath(import.meta.url))
const repo = path.resolve(here, "../..")
const tokensDir = path.join(repo, "tokens")

const vuetifyByCss = {
  "--background": "rgb(var(--v-theme-background))",
  "--foreground": "rgb(var(--v-theme-on-background))",
  "--card": "rgb(var(--v-theme-surface))",
  "--card-foreground": "rgb(var(--v-theme-on-surface))",
  "--popover": "rgb(var(--v-theme-surface))",
  "--popover-foreground": "rgb(var(--v-theme-on-surface))",
  "--primary": "rgb(var(--v-theme-primary))",
  "--primary-foreground": "rgb(var(--v-theme-on-primary))",
  "--secondary": "rgb(var(--v-theme-retana-secondary))",
  "--secondary-foreground": "rgb(var(--v-theme-on-retana-secondary))",
  "--muted": "rgb(var(--v-theme-serie-pista))",
  "--muted-foreground": "rgb(var(--v-theme-secondary))",
  "--accent": "rgb(var(--v-theme-retana-accent))",
  "--accent-foreground": "rgb(var(--v-theme-on-retana-accent))",
  "--destructive": "rgb(var(--v-theme-error))",
  "--border": "rgba(var(--v-theme-on-surface), 0.12)",
  "--input": "rgba(var(--v-theme-on-surface), 0.5)",
  "--ring": "rgb(var(--v-theme-primary))",
  "--chart-1": "rgb(var(--v-theme-serie-agente))",
  "--chart-2": "rgb(var(--v-theme-serie-humana))",
  "--chart-3": "rgb(var(--v-theme-serie-neutra))",
  "--chart-4": "rgb(var(--v-theme-chart-4))",
  "--chart-5": "rgb(var(--v-theme-chart-5))",
  "--sidebar": "rgb(var(--v-theme-barra))",
  "--sidebar-foreground": "rgb(var(--v-theme-on-barra))",
  "--sidebar-primary": "rgb(var(--v-theme-senal))",
  "--sidebar-primary-foreground": "rgb(var(--v-theme-on-senal))",
  "--sidebar-accent": "rgba(var(--v-theme-on-barra), 0.16)",
  "--sidebar-accent-foreground": "rgb(var(--v-theme-on-barra))",
  "--sidebar-border": "rgb(var(--v-theme-sidebar-border))",
  "--sidebar-ring": "rgb(var(--v-theme-on-barra))",
  "--radius": "var(--retana-radius, 0.5rem)",
  "--success": "rgb(var(--v-theme-success))",
}

function block(css, header) {
  const start = css.indexOf(header)
  if (start < 0) throw new Error(`no está ${header}`)
  const open = css.indexOf("{", start)
  let depth = 0
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++
    else if (css[i] === "}") {
      depth--
      if (depth === 0) return css.slice(open + 1, i)
    }
  }
  throw new Error(`sin cierre ${header}`)
}

function declarations(body) {
  return [...body.matchAll(/(^|\n)\s*(--[\w-]+)\s*:\s*([^;]+);/g)].map((match) => ({
    name: match[2],
    value: match[3].trim(),
  }))
}

function pascal(cssName) {
  return cssName
    .replace(/^--/, "")
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join("")
}

function extension(fields) {
  return { $extensions: { "com.retana": fields } }
}

const css = readFileSync(path.join(repo, "app/globals.css"), "utf8")
const themeBody = block(css, "@theme inline")
const rootDecls = declarations(block(css, ":root {"))
const darkDecls = declarations(block(css, "\n.dark {"))
const themeDecls = declarations(themeBody)
const root = new Map(rootDecls.map((item) => [item.name, item.value]))
const dark = new Map(darkDecls.map((item) => [item.name, item.value]))
const hostNames = rootDecls.map((item) => item.name)

const colorLight = {}
const colorDark = {}
const alias = {}

for (const decl of themeDecls) {
  const target = /^var\((--[\w-]+)\)$/.exec(decl.value)
  const pointsAtHost = target && root.has(target[1]) && decl.name.startsWith("--color-")
  if (pointsAtHost) {
    const key = target[1].slice(2)
    colorLight[key] = {
      $type: "color",
      $value: root.get(target[1]),
      ...extension({
        css: target[1],
        tailwind: decl.name,
        tailwindValue: decl.value,
        vuetify: vuetifyByCss[target[1]],
      }),
    }
    colorDark[key] = {
      $type: "color",
      $value: dark.get(target[1]),
      ...extension({ css: target[1], mode: "dark" }),
    }
    continue
  }
  const key = decl.name.slice(2)
  alias[key] = {
    $type: decl.name.startsWith("--font-") ? "fontFamily" : "dimension",
    $value: decl.value,
    ...extension({
      css: decl.name,
      tailwind: decl.name,
      tailwindValue: decl.value,
    }),
  }
}

const tokens = {
  $description:
    "Contrato de nombres semánticos de retana-ui. Los $value de color son el demo opt-in del sitio (app/globals.css), no la marca de un producto. Un host como canal-semilla sustituye el valor y conserva el nombre.",
  color: { light: colorLight, dark: colorDark },
  dimension: {
    radius: {
      $type: "dimension",
      $value: root.get("--radius"),
      ...extension({
        css: "--radius",
        vuetify: vuetifyByCss["--radius"],
      }),
    },
  },
  alias,
}

for (const name of hostNames) {
  if (!vuetifyByCss[name]) throw new Error(`sin puente para ${name}`)
}

mkdirSync(tokensDir, { recursive: true })
writeFileSync(path.join(tokensDir, "retana.tokens.json"), `${JSON.stringify(tokens, null, 2)}\n`)

const sd = new StyleDictionary({
  usesDtcg: true,
  source: [path.join(tokensDir, "retana.tokens.json")],
  platforms: {
    retana: {
      buildPath: `${tokensDir}/`,
      files: [
        { destination: "contract.css", format: "retana/contract" },
        { destination: "demo.css", format: "retana/demo" },
        { destination: "tailwind-alias.css", format: "retana/alias" },
        { destination: "bridge.css", format: "retana/bridge" },
        { destination: "RetanaTokenNames.cs", format: "retana/csharp" },
      ],
    },
  },
  hooks: {
    formats: {
      "retana/contract": ({ dictionary }) => {
        if (!dictionary.allTokens.length) throw new Error("Style Dictionary no leyó tokens")
        const lines = hostNames.map((name) => `  /* retana-contract: ${name} */`)
        return `/* Contrato de nombres. El host asigna el valor. Generado con Style Dictionary. */\n:root {\n${lines.join("\n")}\n}\n`
      },
      "retana/demo": ({ dictionary }) => {
        if (!dictionary.allTokens.length) throw new Error("Style Dictionary no leyó tokens")
        const light = rootDecls.map((item) => `  ${item.name}: ${item.value};`).join("\n")
        const night = darkDecls.map((item) => `  ${item.name}: ${item.value};`).join("\n")
        return `/* Demo opt-in del sitio. No es la marca de un producto. Generado con Style Dictionary. */\n:root {\n${light}\n}\n\n.dark {\n${night}\n}\n`
      },
      "retana/alias": ({ dictionary }) => {
        if (!dictionary.allTokens.length) throw new Error("Style Dictionary no leyó tokens")
        const lines = themeDecls.map((item) => `  ${item.name}: ${item.value};`).join("\n")
        return `/* Alias de Tailwind v4. Solo var() y calc(). Generado con Style Dictionary. */\n@theme inline {\n${lines}\n}\n`
      },
      "retana/bridge": ({ dictionary }) => {
        if (!dictionary.allTokens.length) throw new Error("Style Dictionary no leyó tokens")
        const lines = hostNames.map((name) => `  ${name}: ${vuetifyByCss[name]};`)
        return `/* Puente opt-in a Vuetify 3.13. Canales R,G,B en --v-theme-*. No lo importa la app. Generado con Style Dictionary.\n   --secondary de RETANA no es --v-theme-secondary: ese nombre de Vuetify es muted-foreground.\n   --radius no sale de --v-theme-*: Vuetify 3.13 no emite un canal para el radio. */\n:root {\n${lines.join("\n")}\n}\n`
      },
      "retana/csharp": ({ dictionary }) => {
        if (!dictionary.allTokens.length) throw new Error("Style Dictionary no leyó tokens")
        const fields = hostNames.map((name) => `    public const string ${pascal(name)} = "${name}";`)
        return `// <auto-generated> Style Dictionary. Nombres, sin valores. </auto-generated>\nnamespace Retana.Ui;\n\npublic static class RetanaTokenNames\n{\n${fields.join("\n")}\n}\n`
      },
    },
  },
})

await sd.buildAllPlatforms()
console.log(`tokens: ${dictionaryCount(sd)} entradas, ${hostNames.length} nombres de host`)

function dictionaryCount(instance) {
  return hostNames.length + themeDecls.length
}
