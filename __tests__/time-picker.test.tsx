import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { TimePicker } from "@/registry/ui/time-picker"

describe("TimePicker", () => {
  it("selects a time from the list", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker label="Kiln" onChange={onChange} />)
    await user.click(screen.getByRole("button", { name: /Kiln/ }))
    await user.click(screen.getByRole("option", { name: "10:30 AM" }))
    expect(onChange).toHaveBeenCalledWith("10:30")
    expect(screen.getByRole("button", { name: /10:30 AM/ })).toHaveAttribute("aria-expanded", "false")
  })

  it("moves the highlight with the arrow keys and confirms with Enter", async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<TimePicker label="Kiln" defaultValue="09:00" minuteStep={30} onChange={onChange} />)
    screen.getByRole("button", { name: /Kiln/ }).focus()
    await user.keyboard("{ArrowDown}{ArrowDown}{Enter}")
    expect(onChange).toHaveBeenCalledWith("09:30")
  })
})
