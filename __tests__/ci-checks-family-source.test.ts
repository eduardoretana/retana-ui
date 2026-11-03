import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "..")

const files = [
  "registry/ui/pr-create-card.tsx",
  "registry/ui/checks-panel.tsx",
  "registry/ui/agent-fix-timeline.tsx",
  "registry/ui/merge-button.tsx",
  "registry/blocks/ci-checks-story.tsx",
]

describe("ci checks family source", () => {
  it("ships no transition-all, hex, or palette color", () => {
    for (const file of files) {
      const abs = path.join(root, file)
      expect(fs.existsSync(abs), file).toBe(true)
      const source = fs.readFileSync(abs, "utf8")
      expect(source, file).not.toMatch(/transition-all/)
      expect(source, file).not.toMatch(/#(?:[0-9a-fA-F]{3,8})\b/)
      expect(source, file).not.toMatch(/\b(?:rgb|rgba|hsl|hsla|oklch|oklab)\s*\(/)
      expect(source, file).not.toMatch(/\b(?:bg|text|border)-(?:red|blue|green|slate|gray|zinc)-/)
    }
  })
})
