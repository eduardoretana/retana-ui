import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "..")

const forbidden = /(?:from|import)\s*(?:\(\s*)?["'](?:react|react-dom|next)(?:\/[^"']*)?["']|import\s+["'][^"']+\.css["']|from\s+["'](?:@\/components\/|[^"']*components\/)/

export function forbiddenCoreImport(source: string) {
  return forbidden.test(source)
}

describe("RUI-TOOLS-001", () => {
  it("fails a sample that imports React", () => {
    expect(forbiddenCoreImport('import React from "react"')).toBe(true)
    expect(forbiddenCoreImport('import "app.css"')).toBe(true)
    expect(forbiddenCoreImport('import { Button } from "@/components/ui/button"')).toBe(true)
    expect(forbiddenCoreImport('import { median } from "./progress"')).toBe(false)
  })

  it("keeps every core file free of React, Next, CSS, and components", () => {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, "retana-ui.json"), "utf8")) as {
      tools: { core: string }[]
    }
    const registry = JSON.parse(fs.readFileSync(path.join(root, "registry.json"), "utf8")) as {
      items: { name: string; files?: { path: string }[] }[]
    }
    for (const tool of manifest.tools) {
      const item = registry.items.find((entry) => entry.name === tool.core)
      expect(item, tool.core).toBeTruthy()
      for (const file of item?.files ?? []) {
        const source = fs.readFileSync(path.join(root, file.path), "utf8")
        expect(forbiddenCoreImport(source), file.path).toBe(false)
      }
    }
  })
})
