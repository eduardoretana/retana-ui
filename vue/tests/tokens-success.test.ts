/**
 * El DTCG tiene que nombrar --success. Si el generador no tiene puente, pnpm tokens aborta.
 */
import { readFileSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

describe("token bridge", () => {
  it("TOKENS-REGEN-SUCCESS maps --success onto the Vuetify success role", () => {
    const here = path.dirname(fileURLToPath(import.meta.url))
    const source = readFileSync(path.join(here, "../scripts/build-tokens.mjs"), "utf8")
    expect(source).toContain('"--success": "rgb(var(--v-theme-success))"')
  })
})
