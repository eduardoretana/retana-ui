import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { RadioCards } from "@/registry/ui/radio-cards"

const options = [
  { value: "studio", label: "Studio", description: "One kiln" },
  { value: "workshop", label: "Workshop", description: "Three kilns", disabled: true, disabledReason: "Full" },
  { value: "house", label: "House", description: "Every bench" },
]

describe("RadioCards", () => {
  it("selects the next enabled card with the arrow keys", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<RadioCards options={options} defaultValue="studio" name="plan" onValueChange={onValueChange} />)
    screen.getByRole("radio", { name: "Studio" }).focus()
    await user.keyboard("{ArrowDown}")
    expect(onValueChange).toHaveBeenCalledWith("house")
    expect(screen.getByRole("radio", { name: "Workshop" })).toHaveAccessibleDescription("Full")
  })

  it("ignores a disabled card click", async () => {
    const user = userEvent.setup()
    const onValueChange = vi.fn()
    render(<RadioCards options={options} value="studio" onValueChange={onValueChange} />)
    await user.click(screen.getByRole("radio", { name: "Workshop" }))
    expect(onValueChange).not.toHaveBeenCalled()
    await user.click(screen.getByRole("radio", { name: "House" }))
    expect(onValueChange).toHaveBeenCalledWith("house")
  })
})
