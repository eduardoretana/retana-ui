import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "..")
const doc = fs.readFileSync(path.join(root, "docs/layout-transitions.md"), "utf8")
const gallery = fs.readFileSync(path.join(root, "app/examples/layout-rules/gallery.tsx"), "utf8")

const rules = [
  "RUI-LAYOUT-WIDTH-001",
  "RUI-LAYOUT-BORDER-001",
  "RUI-LAYOUT-COLOR-001",
  "RUI-TYPE-HIERARCHY-001",
  "RUI-MOTION-CONTINUITY-001",
]

describe("layout transition rules", () => {
  it("records the clean-room source and license", () => {
    expect(doc).toContain("clean-room")
    expect(doc).toContain("https://x.com/jakubantalik/status/2115844862012768541")
    expect(doc).toContain("NOTICE")
  })

  it.each(rules)("%s documents a no and a yes", (id) => {
    const start = doc.indexOf(`## ${id}`)
    expect(start).toBeGreaterThan(-1)
    const later = rules
      .map((rule) => doc.indexOf(`## ${rule}`, start + id.length))
      .filter((index) => index > start)
    const end = later.length ? Math.min(...later) : doc.length
    const section = doc.slice(start, end)
    expect(section).toContain("### No")
    expect(section).toContain("### Sí")
    expect(gallery).toContain(`rule="${id}"`)
  })
})
