import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { GET } from "@/app/api/health/route"
import { reducedFromQuery, sceneLocaleFromQuery, themeFromQuery } from "@/app/catalog/scene-query"

const root = path.resolve(__dirname, "..")

describe("capture seed", () => {
  const seed = fs.readFileSync(path.join(root, "ui/seeds/retana-ui-layout-motion.seed.yaml"), "utf8")
  const map = fs.readFileSync(path.join(root, "ui/specs/retana-ui-layout-motion.direction-map.md"), "utf8")
  const status = fs.readFileSync(path.join(root, "ui/status/retana-ui-layout-motion.ui-status.yaml"), "utf8")

  it("keeps the cycle status and a non-empty seed", () => {
    expect(status).toContain("ui_system: {version: 4.0.0}\n")
    expect(status).toContain("cycle_state: AUDITORIA\n")
    expect(fs.existsSync(path.join(root, "ui-tests/expected-red.yaml"))).toBe(true)
    expect(seed).toContain("version: 1\n")
    expect(seed.match(/nonempty: true/g)?.length).toBe(12)
    expect(seed).toContain("locale: [es-MX, en]")
    expect(seed).toContain("theme: [light, dark]")
    expect(seed).not.toContain("scene: empty")
    expect(seed).not.toContain("scene: loading")
    expect(seed).not.toContain("scene: error")
  })

  it("cites #59 for DESIGN.md and the token file without copying them", () => {
    expect(map).toContain("DESIGN.md")
    expect(map).toContain("rules/brand/retana-ui.tokens.json")
    expect(map).toContain("#59")
    expect(map).toMatch(/No se copian/)
    expect(fs.existsSync(path.join(root, "DESIGN.md"))).toBe(false)
    expect(fs.existsSync(path.join(root, "rules/brand/retana-ui.tokens.json"))).toBe(false)
  })

  it("reads theme, locale, and reduced motion from the query", () => {
    expect(sceneLocaleFromQuery("es-MX")).toBe("es")
    expect(sceneLocaleFromQuery("en")).toBe("en")
    expect(sceneLocaleFromQuery("en-US")).toBe("en")
    expect(themeFromQuery("dark")).toBe("dark")
    expect(themeFromQuery("system")).toBeNull()
    expect(reducedFromQuery("1")).toBe(true)
    expect(reducedFromQuery("0")).toBe(false)
  })
})

describe("health", () => {
  it("returns 200 and does not redirect", async () => {
    const response = GET()
    expect(response.status).toBe(200)
    expect(response.headers.get("location")).toBeNull()
    await expect(response.json()).resolves.toEqual({ ok: true })
  })
})
