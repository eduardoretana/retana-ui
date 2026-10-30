import { execFileSync } from "node:child_process"
import path from "node:path"

import { describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "..")
const script = path.join(root, "scripts/anim-perf-lint.mjs")
const files = ["registry/ui/number-roll.tsx", "registry/ui/animated-counter.tsx"]

describe("anim_perf_lint", () => {
  it("accepts transform and opacity on the continuity primitives", () => {
    const present = files.filter((file) => {
      try {
        execFileSync("node", ["-e", `require('node:fs').accessSync(${JSON.stringify(path.join(root, file))})`])
        return true
      } catch {
        return false
      }
    })
    expect(present.length).toBeGreaterThan(0)
    const stdout = execFileSync("node", [script, ...present.map((file) => path.join(root, file)), "--json"], {
      encoding: "utf8",
    })
    const report = JSON.parse(stdout) as { ok: boolean; findings: unknown[] }
    expect(report.ok).toBe(true)
    expect(report.findings).toEqual([])
  })
})
