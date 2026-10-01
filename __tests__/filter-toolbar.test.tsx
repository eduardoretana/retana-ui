import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { FilterToolbar, type FilterChip, type FilterField } from "@/registry/ui/filter-toolbar"

const fields: FilterField[] = [
  { id: "clay", label: "Clay", options: ["stoneware", "porcelain"] },
  { id: "kiln", label: "Kiln", options: [{ value: "two", label: "Kiln 2", hint: 4 }] },
]

function Harness({ initial = [] as FilterChip[] }) {
  const [filters, setFilters] = useState(initial)
  return (
    <FilterToolbar
      filters={filters}
      onRemove={(id) => setFilters((current) => current.filter((filter) => filter.id !== id))}
      onClearAll={() => setFilters([])}
      addFilter={{
        fields,
        onAdd: (filter) => setFilters((current) => [...current.filter((item) => item.id !== filter.id), filter]),
      }}
    />
  )
}

describe("FilterToolbar", () => {
  it("adds a filter from the menu, removes it, and clears the rest", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    expect(screen.getByText("No filters applied")).toBeInTheDocument()
    await user.click(screen.getByRole("button", { name: "Add filter" }))
    await user.click(screen.getByRole("menuitem", { name: "Clay" }))
    await user.click(screen.getByRole("menuitemradio", { name: "stoneware" }))
    expect(screen.getByRole("button", { name: "Remove Clay: stoneware" })).toBeInTheDocument()
    expect(screen.getByRole("status")).toHaveTextContent("Added Clay: stoneware")
    await user.click(screen.getByRole("button", { name: "Remove Clay: stoneware" }))
    expect(screen.getByRole("status")).toHaveTextContent("Removed Clay: stoneware")
  })

  it("clears every chip and announces it", async () => {
    const user = userEvent.setup()
    render(<Harness initial={[{ id: "clay", label: "Clay", value: "stoneware" }, { id: "kiln", label: "Kiln", value: "Kiln 2" }]} />)
    await user.click(screen.getByRole("button", { name: "Clear all" }))
    expect(screen.getByRole("status")).toHaveTextContent("All filters cleared")
    expect(screen.getByText("No filters applied")).toBeInTheDocument()
  })

  it("opens the menu from the keyboard", async () => {
    const user = userEvent.setup()
    render(<Harness />)
    await user.tab()
    await user.keyboard("{ArrowDown}")
    expect(screen.getByRole("menuitem", { name: "Clay" })).toHaveFocus()
  })
})
