import { readFileSync } from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = path.resolve(__dirname, "..")

function source(file: string) {
  return readFileSync(path.join(root, file), "utf8")
}

const forbidden = /height:\s*(?:0|"auto")|gridTemplateRows|transition-all|transition-\[height\]|transition-\[color,box-shadow\]/

describe("RUI-ANIM-PERF-002", () => {
  it("comparison-table rows mount at their height and only fade", () => {
    const table = source("registry/blocks/comparison-table.tsx")
    expect(table).not.toMatch(forbidden)
    expect(table).toContain("opacity: 0, y: 4")
    expect(table).toContain("exit={{ opacity: 0 }}")
    expect(table).toContain("duration: 0")
  })

  it("dock-nav does not transition the search spacer height", () => {
    const dock = source("registry/ui/dock-nav.tsx")
    expect(dock).not.toMatch(forbidden)
    expect(dock).toContain("motion-safe:fade-in-0")
    expect(dock).toContain("motion-safe:slide-in-from-bottom-1")
    expect(dock).toContain("motion-reduce:animate-none")
  })
})
