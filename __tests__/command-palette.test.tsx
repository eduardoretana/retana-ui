import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { CommandPalette } from "@/registry/ui/command-palette"

describe("CommandPalette", () => {
  it("filters commands and selects the match", async () => {
    const user = userEvent.setup()
    const onSelect = vi.fn()
    render(
      <CommandPalette
        label="Commands"
        items={[
          { id: "kiln", label: "Open kiln log", group: "Studio", shortcut: "K" },
          { id: "glaze", label: "Mix glaze", group: "Studio" },
        ]}
        onSelect={onSelect}
      />,
    )
    await user.type(screen.getByRole("combobox", { name: "Commands" }), "glaze")
    expect(screen.queryByText("Open kiln log")).not.toBeInTheDocument()
    await user.click(screen.getByText("Mix glaze"))
    expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ id: "glaze" }))
  })
})
