import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ColorPalette } from "@/registry/ui/color-palette"

describe("ColorPalette", () => {
  it("copies a swatch value", async () => {
    const user = userEvent.setup()
    const writeText = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue(undefined)
    render(
      <ColorPalette
        swatches={[{ id: "ink", label: "Ink", value: "var(--foreground)" }]}
        copyLabel="Copy"
        copiedLabel="Copied"
      />,
    )
    await user.click(screen.getByRole("button", { name: "Copy Ink" }))
    expect(writeText).toHaveBeenCalledWith("var(--foreground)")
    expect(screen.getByRole("status")).toHaveTextContent("Copied")
  })
})
