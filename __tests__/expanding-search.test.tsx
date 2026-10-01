import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ExpandingSearch } from "@/registry/ui/expanding-search"

const items = [
  { id: "bowls", title: "Stoneware bowls", meta: "Gallery", group: "Catalog", keywords: ["clay"] },
  { id: "crates", title: "Shipping crates", meta: "Packing", group: "Ops" },
]

describe("ExpandingSearch", () => {
  it("opens, filters, and chooses with the keyboard", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(<ExpandingSearch label="Search the studio" items={items} suggestions={[{ id: "recent", title: "Recent glaze" }]} suggestionsLabel="Recent" onSelect={onSelect} />)

    await user.click(screen.getByRole("button", { name: "Search the studio" }))
    expect(screen.getByRole("option", { name: /Recent glaze/ })).toBeInTheDocument()

    const field = screen.getByRole("combobox", { name: "Search the studio" })
    await user.type(field, "stone")
    expect(screen.getByRole("option", { name: /Stoneware bowls/ })).toBeInTheDocument()
    await waitFor(() => {
      expect(screen.queryByRole("option", { name: /Shipping crates/ })).not.toBeInTheDocument()
    })

    await user.keyboard("{ArrowDown}{Enter}")
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "bowls" }))
    expect(screen.getByRole("button", { name: "Search the studio" })).toBeInTheDocument()
  })

  it("says when nothing matches and Escape folds the field", async () => {
    const user = userEvent.setup()
    render(<ExpandingSearch label="Search the studio" items={items} />)
    await user.click(screen.getByRole("button", { name: "Search the studio" }))
    const field = screen.getByRole("combobox", { name: "Search the studio" })
    await user.type(field, "zzzz")
    expect(screen.getByText(/No results for/, { selector: "p" })).toBeInTheDocument()
    await user.keyboard("{Escape}")
    expect(screen.getByRole("button", { name: "Search the studio" })).toHaveFocus()
  })
})
