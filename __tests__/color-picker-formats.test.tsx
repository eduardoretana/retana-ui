import { readFileSync } from "node:fs"
import path from "node:path"

import { act, fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import * as Picker from "@/registry/ui/color-picker"
import { ColorPicker, hexToHsva, type HsvaColor } from "@/registry/ui/color-picker"

type Parsed = { color: HsvaColor; format: string; hasAlpha: boolean } | null
type PickerModule = typeof Picker & {
  parseColor?: (input: string, hint?: string) => Parsed
  formatColor?: (color: HsvaColor, format: string) => string
  ColorPickerPopover?: React.ComponentType<Record<string, unknown>>
  colorPickerLabelsEs?: Record<string, unknown>
}
const mod = Picker as PickerModule
// Untyped on purpose: the red commit runs these props against the CPL source.
const Any = ColorPicker as unknown as React.ComponentType<Record<string, unknown>>

const red: HsvaColor = { h: 0, s: 1, v: 1, a: 1 }
const glazes: HsvaColor[] = [hexToHsva("b4532a")!, hexToHsva("2f6f62")!, hexToHsva("d9b26f")!]

function hexOf(color: HsvaColor) {
  return Picker.hsvaToHex(color)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("CP-PARSE: parseColor validates before anything is applied", () => {
  it("CP-PARSE: accepts hex, rgb and hsl in their common spellings", () => {
    expect(mod.parseColor).toBeTypeOf("function")
    const parse = mod.parseColor!
    expect(hexOf(parse("#336699")!.color)).toBe("336699")
    expect(hexOf(parse("369")!.color)).toBe("336699")
    expect(parse("#33669980")!.color.a).toBeCloseTo(0.5, 2)
    expect(hexOf(parse("rgb(51 102 153)")!.color)).toBe("336699")
    expect(hexOf(parse("rgba(51, 102, 153, 0.5)")!.color)).toBe("336699")
    expect(parse("rgb(51 102 153 / 40%)")!.color.a).toBeCloseTo(0.4, 2)
    expect(hexOf(parse("hsl(120 100% 50%)")!.color)).toBe("00ff00")
    expect(hexOf(parse("hsl(240deg, 100%, 50%)")!.color)).toBe("0000ff")
    expect(hexOf(parse("51, 102, 153", "rgb")!.color)).toBe("336699")
    expect(parse("rgb(51 102 153)")!.format).toBe("rgb")
  })

  it("CP-PARSE: rejects out of range, partial, empty and oversized input", () => {
    const parse = mod.parseColor!
    for (const bad of [
      "",
      "   ",
      "#12345",
      "#ggg",
      "rgb(300 0 0)",
      "rgb(-1 0 0)",
      "rgb(1, 2)",
      "rgb(1 2 3 / 2)",
      "hsl(120 101% 50%)",
      "hsl(120 50% -5%)",
      "hsl(NaN 50% 50%)",
      "rgb(Infinity 0 0)",
      "red",
      "#" + "f".repeat(80),
      "rgb(1 2 3) rgb(4 5 6)",
    ]) {
      expect(parse(bad), bad).toBeNull()
    }
  })

  it("CP-PARSE: formatColor prints each format", () => {
    expect(mod.formatColor).toBeTypeOf("function")
    const color = hexToHsva("336699")!
    expect(mod.formatColor!(color, "hex")).toBe("#336699")
    expect(mod.formatColor!(color, "rgb")).toBe("rgb(51 102 153)")
    expect(mod.formatColor!(color, "hsl")).toBe("hsl(210 50% 40%)")
    expect(mod.formatColor!({ ...color, a: 0.5 }, "rgb")).toBe("rgb(51 102 153 / 0.5)")
  })
})

describe("CP-FORMAT: the input switches between HEX, RGB and HSL", () => {
  it("CP-FORMAT-SWITCH: the format group relabels the field and reprints the value", async () => {
    const user = userEvent.setup()
    const onFormatChange = vi.fn()
    render(<Any defaultValue={hexToHsva("336699")!} onFormatChange={onFormatChange} />)
    const group = screen.getByRole("group", { name: "Color format" })
    await user.click(within(group).getByRole("button", { name: "RGB" }))
    expect(within(group).getByRole("button", { name: "RGB" })).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("textbox", { name: "RGB" })).toHaveValue("rgb(51 102 153)")
    expect(onFormatChange).toHaveBeenLastCalledWith("rgb")
    await user.click(within(group).getByRole("button", { name: "HSL" }))
    expect(screen.getByRole("textbox", { name: "HSL" })).toHaveValue("hsl(210 50% 40%)")
  })

  it("CP-FORMAT-VALIDATE: an invalid value is kept, marked and explained, never applied", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Any defaultValue={red} defaultFormat="rgb" onValueChange={onValueChange} />)
    const field = screen.getByRole("textbox", { name: "RGB" })
    await user.clear(field)
    await user.type(field, "rgb(300 0 0){Enter}")
    expect(onValueChange).not.toHaveBeenCalled()
    expect(field).toHaveAttribute("aria-invalid", "true")
    expect(field).toHaveValue("rgb(300 0 0)")
    const describedBy = field.getAttribute("aria-describedby") ?? ""
    const message = describedBy
      .split(" ")
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
    expect(message).toMatch(/rgb\(300 0 0\)/)
    await user.keyboard("{Escape}")
    expect(field).toHaveValue("rgb(255 0 0)")
    expect(field).not.toHaveAttribute("aria-invalid", "true")
  })

  it("CP-FORMAT-VALIDATE: a valid value in another format is applied and shown in the current one", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Any defaultValue={red} onValueChange={onValueChange} hexLabel="Hex" />)
    const field = screen.getByRole("textbox", { name: "Hex" })
    await user.clear(field)
    await user.type(field, "hsl(120 100% 50%){Enter}")
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(field).toHaveValue("#00ff00")
  })

  it("CP-FORMAT-PASTE: a paste is validated before it is applied", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<Any defaultValue={red} onValueChange={onValueChange} hexLabel="Hex" />)
    const field = screen.getByRole("textbox", { name: "Hex" })
    await user.click(field)
    await user.keyboard("{Control>}a{/Control}")
    await user.paste("not a color")
    expect(onValueChange).not.toHaveBeenCalled()
    expect(field).toHaveAttribute("aria-invalid", "true")
    await user.keyboard("{Control>}a{/Control}")
    await user.paste("rgb(0 0 255)")
    expect(onValueChange).toHaveBeenCalledTimes(1)
    expect(hexOf(onValueChange.mock.calls[0]![0] as HsvaColor)).toBe("0000ff")
    expect(field).not.toHaveAttribute("aria-invalid", "true")
  })

  it("CP-FORMAT-ES: the Spanish label set covers the new chrome", () => {
    expect(mod.colorPickerLabelsEs).toBeTypeOf("object")
    render(<Any defaultValue={red} labels={mod.colorPickerLabelsEs} />)
    expect(screen.getByRole("group", { name: "Formato de color" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Copiar valor" })).toBeInTheDocument()
  })
})

describe("CP-COPY: copy the value with a short, announced confirmation", () => {
  it("CP-COPY: writes the value in the current format and announces it", async () => {
    const user = userEvent.setup()
    const write = vi.spyOn(navigator.clipboard, "writeText").mockResolvedValue()
    const onCopy = vi.fn()
    render(<Any defaultValue={hexToHsva("336699")!} defaultFormat="rgb" onCopy={onCopy} />)
    await user.click(screen.getByRole("button", { name: "Copy value" }))
    expect(write).toHaveBeenCalledWith("rgb(51 102 153)")
    expect(onCopy).toHaveBeenCalledWith("rgb(51 102 153)")
    expect(screen.getByRole("status")).toHaveTextContent("Copied rgb(51 102 153)")
  })

  it("CP-COPY: a refused clipboard is announced, not swallowed", async () => {
    const user = userEvent.setup()
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValue(new Error("denied"))
    render(<Any defaultValue={red} />)
    await user.click(screen.getByRole("button", { name: "Copy value" }))
    expect(screen.getByRole("status")).toHaveTextContent("Could not copy")
  })
})

describe("CP-POPOVER: trigger with swatch and value, picker in a popover", () => {
  it("CP-POPOVER: the trigger shows the value and opens the picker", async () => {
    const user = userEvent.setup()
    expect(mod.ColorPickerPopover).toBeTypeOf("function")
    const Popover = mod.ColorPickerPopover!
    render(<Popover defaultValue={hexToHsva("336699")!} />)
    const trigger = screen.getByRole("button", { name: /#336699/ })
    expect(trigger).toHaveTextContent("#336699")
    expect(trigger.querySelector("[data-slot=color-picker-swatch]")).not.toBeNull()
    await user.click(trigger)
    expect(await screen.findByRole("slider", { name: "Saturation and brightness" })).toBeInTheDocument()
  })
})

describe("CP-EYEDROPPER: unsupported browsers see a disabled button with a reason", () => {
  it("CP-EYEDROPPER: visible, aria-disabled and explained when the API is missing", async () => {
    const user = userEvent.setup()
    expect("EyeDropper" in globalThis).toBe(false)
    const onValueChange = vi.fn()
    render(<Any defaultValue={red} onValueChange={onValueChange} />)
    const button = screen.getByRole("button", { name: "Pick a color from the screen" })
    expect(button).toHaveAttribute("aria-disabled", "true")
    expect(button).not.toBeDisabled()
    expect(button).toHaveAccessibleDescription(/browser/i)
    await user.click(button)
    expect(onValueChange).not.toHaveBeenCalled()
    expect(screen.getByText(/browser/i, { selector: "p" })).toBeVisible()
  })

  it("CP-EYEDROPPER: hide-unsupported keeps the CPL behavior", () => {
    render(<Any defaultValue={red} eyedropper="hide-unsupported" />)
    expect(screen.queryByRole("button", { name: "Pick a color from the screen" })).toBeNull()
  })
})

describe("CP-SWATCHES: remove and reorder saved colors without dragging (WCAG 2.5.7)", () => {
  it("CP-SWATCH-KEYS: Alt+Arrow moves, Delete removes, focus follows", async () => {
    const user = userEvent.setup()
    const onSwatchesChange = vi.fn()
    render(<Any defaultValue={red} defaultSwatches={glazes} onSwatchesChange={onSwatchesChange} />)
    const list = screen.getByRole("list", { name: "Saved colors" })
    const first = within(list).getAllByRole("button")[0]!
    first.focus()
    await user.keyboard("{Alt>}{ArrowRight}{/Alt}")
    const moved = onSwatchesChange.mock.calls.at(-1)![0] as HsvaColor[]
    expect(moved.map(hexOf)).toEqual([glazes[1], glazes[0], glazes[2]].map(hexOf))
    expect(document.activeElement).toBe(within(list).getAllByRole("button")[1])
    expect(screen.getByRole("status")).toHaveTextContent(/position 2/i)
    await user.keyboard("{Delete}")
    const removed = onSwatchesChange.mock.calls.at(-1)![0] as HsvaColor[]
    expect(removed.map(hexOf)).toEqual([glazes[1], glazes[2]].map(hexOf))
    expect(within(list).getAllByRole("button")).toHaveLength(2)
  })

  it("CP-SWATCH-BUTTONS: single-pointer buttons move and remove the active color", async () => {
    const user = userEvent.setup()
    const onSwatchesChange = vi.fn()
    render(<Any defaultValue={red} defaultSwatches={glazes} onSwatchesChange={onSwatchesChange} />)
    const list = screen.getByRole("list", { name: "Saved colors" })
    await user.click(within(list).getAllByRole("button")[2]!)
    await user.click(screen.getByRole("button", { name: /move .*earlier/i }))
    expect((onSwatchesChange.mock.calls.at(-1)![0] as HsvaColor[]).map(hexOf)).toEqual([glazes[0], glazes[2], glazes[1]].map(hexOf))
    await user.click(screen.getByRole("button", { name: /remove/i }))
    expect((onSwatchesChange.mock.calls.at(-1)![0] as HsvaColor[]).map(hexOf)).toEqual([glazes[0], glazes[1]].map(hexOf))
  })

  it("CP-SWATCH-SAVE: saves the current color; at the limit the button explains instead of hiding", async () => {
    const user = userEvent.setup()
    const onSwatchesChange = vi.fn()
    const { rerender } = render(<Any value={red} swatches={glazes} onSwatchesChange={onSwatchesChange} maxSwatches={4} />)
    await user.click(screen.getByRole("button", { name: "Save color" }))
    expect((onSwatchesChange.mock.calls.at(-1)![0] as HsvaColor[]).map(hexOf)).toEqual([...glazes, red].map(hexOf))
    onSwatchesChange.mockClear()
    rerender(<Any value={red} swatches={[...glazes, red]} onSwatchesChange={onSwatchesChange} maxSwatches={4} />)
    const save = screen.getByRole("button", { name: "Save color" })
    expect(save).toHaveAttribute("aria-disabled", "true")
    await user.click(save)
    expect(onSwatchesChange).not.toHaveBeenCalled()
    expect(save).toHaveAccessibleDescription(/4/)
  })
})

describe("CP-COMMIT: onValueCommit fires once per gesture, onValueChange stays live", () => {
  it("CP-COMMIT: a drag on the field commits once on release", () => {
    const onValueChange = vi.fn()
    const onValueCommit = vi.fn()
    render(<Any defaultValue={red} onValueChange={onValueChange} onValueCommit={onValueCommit} />)
    const field = screen.getByRole("slider", { name: "Saturation and brightness" })
    vi.spyOn(field, "getBoundingClientRect").mockReturnValue({ left: 0, top: 0, width: 100, height: 100, right: 100, bottom: 100, x: 0, y: 0, toJSON: () => ({}) })
    vi.spyOn(field, "hasPointerCapture").mockReturnValue(true)
    act(() => {
      fireEvent.pointerDown(field, { pointerId: 1, clientX: 10, clientY: 10 })
      fireEvent.pointerMove(field, { pointerId: 1, clientX: 20, clientY: 20 })
      fireEvent.pointerMove(field, { pointerId: 1, clientX: 30, clientY: 30 })
      fireEvent.pointerUp(field, { pointerId: 1, clientX: 30, clientY: 30 })
    })
    expect(onValueChange.mock.calls.length).toBeGreaterThanOrEqual(3)
    expect(onValueCommit).toHaveBeenCalledTimes(1)
    expect((onValueCommit.mock.calls[0]![0] as HsvaColor).s).toBeCloseTo(0.3, 2)
  })

  it("CP-COMMIT: arrow keys on the field commit on key up", async () => {
    const user = userEvent.setup()
    const onValueCommit = vi.fn()
    render(<Any defaultValue={{ h: 0, s: 0.5, v: 0.5, a: 1 }} onValueCommit={onValueCommit} />)
    screen.getByRole("slider", { name: "Saturation and brightness" }).focus()
    await user.keyboard("{ArrowRight}")
    expect(onValueCommit).toHaveBeenCalledTimes(1)
  })
})

describe("CP-PLP: registry, scenes and credit", () => {
  const root = path.resolve(__dirname, "..")
  type Item = { name: string; registryDependencies: string[]; docs: string; meta: { scenes?: Array<{ id: string }>; api: Array<{ name: string }> } }

  it("CP-PLP: the item lists its scenes, the popover primitive and the clean-room credit", () => {
    const registry = JSON.parse(readFileSync(path.join(root, "registry.json"), "utf8")) as { items: Item[] }
    const item = registry.items.find((entry) => entry.name === "color-picker")!
    expect(item.registryDependencies).toContain("popover")
    const ids = (item.meta.scenes ?? []).map((scene) => scene.id)
    for (const id of ["filled", "empty", "loading", "error", "invalid", "no-eyedropper", "full", "popover"]) {
      expect(ids, id).toContain(id)
    }
    expect(item.docs).toMatch(/shadcn\/studio/)
    expect(item.docs).toMatch(/Commons Clause/)
    expect(item.docs).toMatch(/clean-room/i)
    expect(item.meta.api.map((row) => row.name).join(" ")).toMatch(/onValueCommit/)
    const notice = readFileSync(path.join(root, "NOTICE"), "utf8")
    expect(notice).toMatch(/shadcn\/studio/)
  })
})
