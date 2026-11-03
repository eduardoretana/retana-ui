import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { floatingGlass70, floatingGlass95, floatingScrim } from "@/lib/glass"

const root = path.resolve(__dirname, "..")

function filesUnder(dir: string): string[] {
  const out: string[] = []
  for (const name of readdirSync(dir)) {
    const full = path.join(dir, name)
    if (name === "node_modules" || name === ".next" || name === "public") continue
    const stat = statSync(full)
    if (stat.isDirectory()) out.push(...filesUnder(full))
    else if (/\.(tsx|ts|css)$/.test(name)) out.push(full)
  }
  return out
}

const allowedBlur = new Set([
  "registry/lib/glass.ts",
])

describe("RUI-GLASS-001", () => {
  it("keeps backdrop-blur in the glass helper only", () => {
    const hits: string[] = []
    for (const file of [...filesUnder(path.join(root, "registry")), ...filesUnder(path.join(root, "components")), ...filesUnder(path.join(root, "app"))]) {
      const rel = path.relative(root, file)
      const source = readFileSync(file, "utf8")
      if (source.includes("backdrop-blur") && !allowedBlur.has(rel)) hits.push(rel)
    }
    expect(hits).toEqual([])
  })

  it("gates blur on support and reduced transparency, under 20px", () => {
    for (const value of [floatingGlass70, floatingGlass95, floatingScrim]) {
      expect(value).toContain("bg-background")
      expect(value).toContain("supports-[backdrop-filter]:")
      expect(value).toContain("prefers-reduced-transparency:reduce")
      expect(value).not.toMatch(/backdrop-blur-(xl|2xl|3xl)/)
    }
    expect(floatingScrim).toContain("backdrop-blur-xs")
    expect(floatingGlass70).toContain("backdrop-blur-md")
  })
})
