/**
 * El muted-foreground claro tiene que seguir en 0.52, el valor de contraste
 * del piloto Vue. El generador lo lee de app/globals.css; no se edita a mano.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../..")

function rootValue(css: string, name: string) {
  const start = css.indexOf(":root {")
  const open = css.indexOf("{", start)
  let depth = 0
  let end = open
  for (let i = open; i < css.length; i++) {
    if (css[i] === "{") depth++
    else if (css[i] === "}") {
      depth--
      if (depth === 0) {
        end = i
        break
      }
    }
  }
  const body = css.slice(open + 1, end)
  const match = new RegExp(`(?:^|\\n)\\s*${name}\\s*:\\s*([^;]+);`).exec(body)
  return match?.[1]?.trim() ?? ""
}

describe("muted foreground contrast", () => {
  it("TOKENS-MUTED-FG keeps the light value at oklch(0.52 0 0)", () => {
    const globals = readFileSync(path.join(repo, "app/globals.css"), "utf8")
    const demo = readFileSync(path.join(repo, "tokens/demo.css"), "utf8")
    const tokens = JSON.parse(readFileSync(path.join(repo, "tokens/retana.tokens.json"), "utf8")) as {
      color: { light: { "muted-foreground": { $value: string } } }
    }
    expect(rootValue(globals, "--muted-foreground")).toBe("oklch(0.52 0 0)")
    expect(rootValue(demo, "--muted-foreground")).toBe("oklch(0.52 0 0)")
    expect(tokens.color.light["muted-foreground"].$value).toBe("oklch(0.52 0 0)")
  })
})
