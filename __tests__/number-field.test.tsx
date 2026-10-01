import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { NumberField } from "@/registry/ui/number-field"

describe("NumberField", () => {
  it("steps with buttons, arrows, and limits", async () => {
    const user = userEvent.setup()
    render(<NumberField label="Seats" defaultValue={2} min={0} max={5} step={1} prefix="$" suffix={(value) => (value === 1 ? " seat" : " seats")} />)
    const input = screen.getByRole("spinbutton", { name: "Seats" })
    expect(input).toHaveAttribute("aria-valuenow", "2")
    expect(input).toHaveAttribute("aria-valuetext", "$2 seats")

    await user.click(screen.getByRole("button", { name: "Increase Seats" }))
    expect(input).toHaveAttribute("aria-valuenow", "3")

    input.focus()
    await user.keyboard("{ArrowUp}")
    expect(input).toHaveAttribute("aria-valuenow", "4")
    await user.keyboard("{Shift>}{ArrowUp}{/Shift}")
    expect(input).toHaveAttribute("aria-valuenow", "5")
    expect(screen.getByText(/Max/)).toBeInTheDocument()

    await user.keyboard("{Home}")
    expect(input).toHaveAttribute("aria-valuenow", "0")
    await user.click(screen.getByRole("button", { name: "Decrease Seats" }))
    expect(input).toHaveAttribute("aria-valuenow", "0")
    expect(screen.getByText(/Min/)).toBeInTheDocument()
  })

  it("scrubs from the label and stays controlled", () => {
    function Harness() {
      const [value, setValue] = useState(1)
      return <NumberField label="Kiln" value={value} onValueChange={setValue} min={0} max={20} scrub />
    }
    render(<Harness />)
    const input = screen.getByRole("spinbutton", { name: "Kiln" })
    const label = screen.getByText("Kiln")
    fireEvent.pointerDown(label, { button: 0, clientX: 0, pointerId: 1 })
    fireEvent.pointerMove(label, { button: 0, clientX: 24, pointerId: 1 })
    fireEvent.pointerUp(label, { button: 0, clientX: 24, pointerId: 1 })
    expect(Number(input.getAttribute("aria-valuenow"))).toBeGreaterThan(1)
  })
})
