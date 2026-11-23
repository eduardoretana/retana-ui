import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ColorPicker, ColorPickerPopover, colorPickerLabelsEs, hexToHsva, type HsvaColor } from "@/registry/ui/color-picker"

const red: HsvaColor = { h: 0, s: 1, v: 1, a: 1 }
const glazes = ["b4532a", "2f6f62", "d9b26f"].map((hex) => hexToHsva(hex)!)

describe("CP-BREAK: worst realistic input from the break-ui pass", () => {
  it("CP-BREAK-LONG-PASTE: a pasted paragraph is rejected and the error quotes it short", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ColorPicker defaultValue={red} onValueChange={onValueChange} hexLabel="Hex" />)
    const field = screen.getByRole("textbox", { name: "Hex" })
    await user.click(field)
    await user.keyboard("{Control>}a{/Control}")
    await user.paste("El color de marca es el terracota de la portada, el que usamos en la feria de 2025 en Guanajuato")
    expect(onValueChange).not.toHaveBeenCalled()
    expect(field).toHaveAttribute("aria-invalid", "true")
    const message = document.getElementById(field.getAttribute("aria-describedby")!)!.textContent!
    expect(message).toContain("…")
    expect(message.length).toBeLessThan(140)
  })

  it("CP-BREAK-TRAILING: whitespace, case and line breaks around a pasted value still parse", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<ColorPicker defaultValue={red} onValueChange={onValueChange} hexLabel="Hex" />)
    const field = screen.getByRole("textbox", { name: "Hex" })
    await user.click(field)
    await user.keyboard("{Control>}a{/Control}")
    await user.paste("  RGB( 51 , 102 , 153 )\n")
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(field).toHaveValue("#336699")
  })

  it("CP-BREAK-LAST: removing the last saved color moves focus to Save, not to the page", async () => {
    const user = userEvent.setup()
    render(<ColorPicker defaultValue={red} defaultSwatches={glazes.slice(0, 1)} />)
    within(screen.getByRole("list", { name: "Saved colors" })).getByRole("button").focus()
    await user.keyboard("{Delete}")
    expect(screen.queryByRole("list", { name: "Saved colors" })).toBeNull()
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Save color" }))
    expect(screen.getByText(/No saved colors yet/)).toBeInTheDocument()
  })

  it("CP-BREAK-TOOLBAR: the move buttons keep focus where the pointer or keyboard left it", async () => {
    const user = userEvent.setup()
    render(<ColorPicker defaultValue={glazes[1]!} defaultSwatches={glazes} />)
    const later = screen.getByRole("button", { name: "Move color 2 later" })
    await user.click(later)
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Move color 3 later" }))
    expect(screen.getByRole("button", { name: "Move color 3 later" })).toHaveAttribute("aria-disabled", "true")
  })

  it("CP-BREAK-NONE-SELECTED: with no saved color selected the toolbar names the action generically", () => {
    render(<ColorPicker defaultValue={red} defaultSwatches={glazes} />)
    expect(screen.getByRole("button", { name: "Remove the selected color" })).toHaveAttribute("aria-disabled", "true")
  })

  it("CP-BREAK-ONE-FORMAT: a single format hides the switch and keeps copy", () => {
    render(<ColorPicker defaultValue={red} formats={["hsl"]} eyedropper="hidden" />)
    expect(screen.queryByRole("group", { name: "Color format" })).toBeNull()
    expect(screen.getByRole("textbox", { name: "HSL" })).toHaveValue("hsl(0 100% 50%)")
    expect(screen.getByRole("button", { name: "Copy value" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Pick a color from the screen" })).toBeNull()
  })

  it("CP-BREAK-POPOVER-ES: the Spanish trigger names the action and the value", () => {
    render(<ColorPickerPopover labels={colorPickerLabelsEs} defaultValue={hexToHsva("336699")!} defaultFormat="rgb" />)
    expect(screen.getByRole("button", { name: "Elegir color, actual rgb(51 102 153)" })).toBeInTheDocument()
  })
})
