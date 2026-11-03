import { describe, expect, it } from "vitest"

import { antesDeEnviar } from "../docs/herramientas/snippets/pre-accion"
import { simularMerge } from "../docs/herramientas/snippets/approval-gate"
import fs from "node:fs"
import path from "node:path"

describe("documented snippets", () => {
  it("runs the pre-action example and the git.merge gate", () => {
    const now = Date.UTC(2026, 10, 3, 15, 0, 0)
    expect(antesDeEnviar(now).decision).toBe("allow")
    const merge = simularMerge(now)
    expect(merge.evaluation.decision).toBe("require_approval")
    expect(merge.outcome.approval?.kind).toBe("git.merge")
    expect(merge.stored?.status).toBe("pending")
    expect(merge.stored?.action.data.repository).toBe("ejemplo/demo")
  })

  it("keeps the markdown fences equal to the snippet files", () => {
    const root = process.cwd()
    const integration = fs.readFileSync(path.join(root, "docs/herramientas/integracion.md"), "utf8")
    for (const name of ["approval-gate.ts", "pre-accion.ts"]) {
      const source = fs.readFileSync(path.join(root, "docs/herramientas/snippets", name), "utf8").trim()
      expect(integration).toContain(source)
    }
  })
})
