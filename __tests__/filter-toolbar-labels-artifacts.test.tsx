// LITE cycle artifacts for the filter-toolbar labels extension (ui-system 4.0.0).
import { existsSync, readFileSync } from "node:fs"
import path from "node:path"
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { Demo } from "@/app/examples/filter-toolbar/demo"

const root = path.resolve(__dirname, "..")
const read = (file: string) => (existsSync(path.join(root, file)) ? readFileSync(path.join(root, file), "utf8") : "")

afterEach(() => cleanup())

describe("filter-toolbar labels · LITE artifacts", () => {
  it("FTL-STATUS: ui-status declares ui-system 4.0.0 on one line, LITE and AUDITORIA", () => {
    const status = read("ui/status/filter-toolbar-labels.ui-status.yaml")
    expect(status).toMatch(/^schema: uis\.status\/v2$/m)
    expect(status).toMatch(/^ui_system: \{version: 4\.0\.0\}$/m)
    expect(status).toMatch(/^cycle_state: AUDITORIA$/m)
    expect(status).toMatch(/^spec_id: filter-toolbar-labels$/m)
    expect(status).toMatch(/^profile: LITE$/m)
    expect(status).toMatch(/^head: [0-9a-f]{40}$/m)
    expect(status).toMatch(/^plan: ui\/specs\/filter-toolbar-labels\.md$/m)
  })

  it("FTL-SPEC: the LITE spec has a brief, AC with measure and test, and states", () => {
    const spec = read("ui/specs/filter-toolbar-labels.md")
    expect(spec).toMatch(/^## Brief$/m)
    expect(spec).toMatch(/^## Criterios de aceptación$/m)
    expect(spec).toMatch(/\| AC \| Criterio \| Medida \| Prueba \|/)
    expect(spec).toMatch(/^## Estados$/m)
    for (const test of ["FT-LABELS-DEFAULT", "FT-LABELS-ES", "FT-LABELS-PARTIAL"]) expect(spec).toContain(test)
  })

  it("FTL-DEMO-ES: the example renders the es-MX chrome when asked", () => {
    render(<Demo locale="es" />)
    expect(screen.getAllByRole("button", { name: "Limpiar todo" }).length).toBeGreaterThan(0)
    expect(screen.getAllByRole("button", { name: /^Quitar Canal: / }).length).toBeGreaterThan(0)
  })

  it("FTL-DEMO-EN: English stays the default of the example", () => {
    render(<Demo />)
    expect(screen.getAllByRole("button", { name: "Clear all" }).length).toBeGreaterThan(0)
  })
})
