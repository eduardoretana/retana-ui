import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const css = readFileSync(path.resolve(__dirname, "../app/globals.css"), "utf8")

/** Computed px at a 16px root, measured on CPL before the fixed steps. */
const expectedRem = {
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.625rem",
  xl: "0.875rem",
  "2xl": "1.125rem",
  "3xl": "1.375rem",
  "4xl": "1.625rem",
}

describe("RUI-RADIUS-001", () => {
  it("does not multiply --radius", () => {
    expect(css).not.toMatch(/var\(--radius\)\s*\*/)
  })

  it("keeps the same rem steps that CPL computed", () => {
    for (const [step, value] of Object.entries(expectedRem)) {
      expect(css).toContain(`--radius-${step}: ${value};`)
    }
    expect(css).toContain("--radius: 0.625rem;")
  })
})
