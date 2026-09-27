import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { ColorPicker, hexToHsva, hsvaToHex } from "@/registry/ui/color-picker"

describe("ColorPicker", () => {
  it("round-trips a hex value", async () => {
    const user = userEvent.setup()
    expect(hsvaToHex(hexToHsva("336699")!)).toBe("336699")
    render(<ColorPicker hexLabel="Hex" />)
    const field = screen.getByRole("textbox", { name: "Hex" })
    await user.clear(field)
    await user.type(field, "ff0000")
    await user.tab()
    expect(field).toHaveValue("#ff0000")
  })
})
