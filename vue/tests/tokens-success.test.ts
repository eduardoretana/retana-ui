/**
 * El DTCG tiene que nombrar --success. Si el generador no tiene puente, pnpm tokens aborta.
 */
import { readFileSync } from "node:fs"
import { describe, expect, it } from "vitest"

describe("token bridge", () => {
  it("TOKENS-REGEN-SUCCESS maps --success onto the Vuetify success role", () => {
    const source = readFileSync(new URL("../scripts/build-tokens.mjs", import.meta.url), "utf8")
    expect(source).toContain('"--success": "rgb(var(--v-theme-success))"')
  })
})
