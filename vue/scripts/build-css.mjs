import { mkdirSync, readFileSync, writeFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

import postcss from "postcss"
import tailwind from "@tailwindcss/postcss"

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")
const inputPath = path.join(repo, "vue/src/styles/pilot.input.css")
const alias = readFileSync(path.join(repo, "tokens/tailwind-alias.css"), "utf8")
const source = `${readFileSync(inputPath, "utf8")}\n${alias}\n`

function stripLayer(css, name) {
  const marker = `@layer ${name} {`
  let out = ""
  let cursor = 0
  while (cursor < css.length) {
    const at = css.indexOf(marker, cursor)
    if (at < 0) {
      out += css.slice(cursor)
      break
    }
    out += css.slice(cursor, at)
    let depth = 0
    let index = css.indexOf("{", at)
    for (; index < css.length; index++) {
      if (css[index] === "{") depth++
      else if (css[index] === "}") {
        depth--
        if (depth === 0) {
          index++
          break
        }
      }
    }
    cursor = index
  }
  return out
}

const result = await postcss([tailwind()]).process(source, { from: inputPath })
const css = stripLayer(result.css, "base").replaceAll("color:rgb(from red r g b)", "color:canvastext")
mkdirSync(path.join(repo, "vue/dist"), { recursive: true })
writeFileSync(path.join(repo, "vue/dist/pilot.css"), css)
const banned = [
  [/oklch\(/, "oklch"],
  [/oklab/, "oklab"],
  [/#[0-9a-fA-F]{3,8}\b/, "hex"],
  [/\brgb\(/, "rgb"],
  [/\brgba\(/, "rgba"],
  [/box-sizing:\s*border-box/, "preflight"],
  [/\.v-/, "vuetify"],
]
for (const [pattern, label] of banned) {
  if (pattern.test(css)) throw new Error(`pilot.css contiene ${label}`)
}
if (!css.includes(".rt\\:")) throw new Error("pilot.css no tiene el prefijo rt")
console.log(`pilot.css ${css.length} bytes`)
