import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { FilterToolbar, filterToolbarLabelsEs, type FilterChip } from "@/registry/ui/filter-toolbar"

afterEach(() => cleanup())

const chips: FilterChip[] = [
  { id: "type", label: "Tipo", value: "Oficina" },
  { id: "zone", label: "Zona", value: "Norte" },
]

describe("filter-toolbar labels", () => {
  it("FT-LABELS-DEFAULT: English stays the default", () => {
    render(<FilterToolbar filters={chips} onRemove={() => {}} onClearAll={() => {}} />)
    expect(screen.getByRole("button", { name: "Clear all" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Remove Tipo: Oficina" })).toBeTruthy()
  })

  it("FT-LABELS-ES: es-MX labels replace the chrome and the announcements", () => {
    const onRemove = vi.fn()
    const { rerender } = render(<FilterToolbar filters={chips} onRemove={onRemove} onClearAll={() => {}} labels={filterToolbarLabelsEs} />)
    expect(screen.getByRole("button", { name: "Limpiar todo" })).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Quitar Zona: Norte" }))
    expect(onRemove).toHaveBeenCalledWith("zone")
    rerender(<FilterToolbar filters={chips.slice(0, 1)} onRemove={onRemove} onClearAll={() => {}} labels={filterToolbarLabelsEs} />)
    expect(screen.getByRole("status").textContent).toBe("Se quitó Zona: Norte")
    rerender(<FilterToolbar filters={[...chips.slice(0, 1), { id: "zone", label: "Zona", value: "Sur" }]} onRemove={onRemove} labels={filterToolbarLabelsEs} />)
    expect(screen.getByRole("status").textContent).toBe("Se agregó Zona: Sur")
    rerender(<FilterToolbar filters={[]} onRemove={onRemove} labels={filterToolbarLabelsEs} />)
    expect(screen.getByRole("status").textContent).toBe("Se quitaron todos los filtros")
  })

  it("FT-LABELS-PARTIAL: a partial set keeps English for the rest", () => {
    render(<FilterToolbar filters={chips} onRemove={() => {}} onClearAll={() => {}} labels={{ clearAll: "Borrar" }} />)
    expect(screen.getByRole("button", { name: "Borrar" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Remove Zona: Norte" })).toBeTruthy()
  })
})
