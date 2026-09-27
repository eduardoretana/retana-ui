import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { MultiSelect } from "@/registry/ui/multi-select"

describe("MultiSelect", () => {
  it("creates an option and removes it with backspace", async () => {
    const user = userEvent.setup()
    render(
      <MultiSelect
        creatable
        createLabel="Create"
        placeholder="Select"
        searchPlaceholder="Search"
        removeLabel="Remove"
        options={[{ value: "a", label: "Annex" }]}
      />,
    )
    const field = screen.getByRole("combobox")
    await user.click(field)
    await user.type(field, "Bruma{Enter}")
    expect(screen.getAllByText("Bruma").length).toBeGreaterThan(0)
    await user.keyboard("{Backspace}")
    expect(screen.queryByRole("button", { name: "Remove Bruma" })).not.toBeInTheDocument()
  })
})
