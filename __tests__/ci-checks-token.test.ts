import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "..")

const clientFiles = [
  "registry/hooks/use-ci-checks.ts",
  "registry/blocks/ci-checks-live.tsx",
  "registry/lib/ci-checks.ts",
  "registry/lib/ci-checks/normalize.ts",
  "registry/lib/ci-checks/poll.ts",
  "registry/lib/ci-checks/merge.ts",
  "registry/lib/ci-checks/webhook.ts",
  "registry/lib/ci-checks/approval.ts",
  "registry/lib/ci-checks/progress.ts",
  "registry/lib/ci-checks/agent-port.ts",
  "registry/lib/ci-checks/secrets.ts",
  "registry/lib/ci-checks/types.ts",
]

describe("token boundary", () => {
  it("keeps the GitHub token out of the client and the deterministic core", () => {
    for (const file of clientFiles) {
      const source = fs.readFileSync(path.join(root, file), "utf8")
      expect(source, file).not.toMatch(/CI_CHECKS_GITHUB_TOKEN/)
      expect(source, file).not.toMatch(/CI_CHECKS_WEBHOOK_SECRET/)
      expect(source, file).not.toMatch(/process\.env/)
      expect(source, file).not.toMatch(/\bghp_/)
      expect(source, file).not.toMatch(/github_pat_/)
    }
  })

  it("reads the token only in the example route", () => {
    const route = fs.readFileSync(path.join(root, "app/api/ci-checks/[owner]/[repo]/pulls/[pull]/route.ts"), "utf8")
    expect(route).toMatch(/process\.env\.CI_CHECKS_GITHUB_TOKEN/)
    expect(route).toMatch(/CI_CHECKS_MERGE_ENABLED/)
    const hook = fs.readFileSync(path.join(root, "registry/hooks/use-ci-checks.ts"), "utf8")
    expect(hook).not.toMatch(/authorization\s*:/i)
    expect(hook).not.toMatch(/Bearer /)
  })

  it("does not import the adapter from the core barrel", () => {
    const barrel = fs.readFileSync(path.join(root, "registry/lib/ci-checks.ts"), "utf8")
    expect(barrel).not.toMatch(/github-adapter/)
    expect(barrel).not.toMatch(/from \"\.\/ci-checks\/http\"/)
  })
})
