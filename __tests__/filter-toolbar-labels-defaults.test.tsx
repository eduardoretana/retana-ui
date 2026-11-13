// Found in the #91 captures (harness 21db9481, 8cd562f): with the es-MX set the empty message, the Add filter
// trigger and the group name still fell back to English.
import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it } from "vitest"

import { FilterToolbar, filterToolbarLabelsEs } from "@/registry/ui/filter-toolbar"

afterEach(() => cleanup())

const fields = [{ id: "zone", label: "Zona", options: ["Norte", "Sur"] }]

describe("filter-toolbar labels · prop defaults", () => {
  it("FT-LABELS-DEFAULTS-ES: the es-MX set also covers the empty message, Add filter and the group name", () => {
    render(<FilterToolbar filters={[]} onRemove={() => {}} addFilter={{ fields, onAdd: () => {} }} labels={filterToolbarLabelsEs} />)
    expect(screen.getByText("Sin filtros aplicados")).toBeTruthy()
    expect(screen.getByRole("button", { name: /Agregar filtro/ })).toBeTruthy()
    expect(screen.getByRole("group", { name: "Filtros activos" })).toBeTruthy()
  })

  it("FT-LABELS-DEFAULTS-PROPS: explicit props still win over the labels set", () => {
    render(
      <FilterToolbar
        filters={[]}
        onRemove={() => {}}
        emptyLabel="Nada aún"
        label="Mis filtros"
        addFilter={{ fields, onAdd: () => {}, label: "Añadir" }}
        labels={filterToolbarLabelsEs}
      />,
    )
    expect(screen.getByText("Nada aún")).toBeTruthy()
    expect(screen.getByRole("button", { name: /Añadir/ })).toBeTruthy()
    expect(screen.getByRole("group", { name: "Mis filtros" })).toBeTruthy()
  })

  it("FT-LABELS-DEFAULTS-EN: without labels the English defaults stay", () => {
    render(<FilterToolbar filters={[]} onRemove={() => {}} addFilter={{ fields, onAdd: () => {} }} />)
    expect(screen.getByText("No filters applied")).toBeTruthy()
    expect(screen.getByRole("button", { name: /Add filter/ })).toBeTruthy()
    expect(screen.getByRole("group", { name: "Active filters" })).toBeTruthy()
  })
})
