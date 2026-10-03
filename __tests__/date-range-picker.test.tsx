import { render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { useState } from "react"
import { describe, expect, it } from "vitest"

import { DateRangePicker, type DateRange } from "@/registry/ui/date-range-picker"

describe("DateRangePicker", () => {
  it("shows two months, applies a preset, and moves with the keyboard", async () => {
    const user = userEvent.setup()
    function Harness() {
      const [range, setRange] = useState<DateRange | null>(null)
      return <DateRangePicker label="Report range" value={range} onChange={setRange} months={2} />
    }
    render(<Harness />)

    await user.click(screen.getByRole("button", { name: "Report range: Select dates" }))
    const dialog = screen.getByRole("dialog", { name: "Report range" })
    expect(within(dialog).getAllByRole("grid")).toHaveLength(2)

    await user.click(within(dialog).getByRole("button", { name: "Last 7 days" }))
    await user.click(within(dialog).getByRole("button", { name: "Apply" }))
    expect(screen.getByRole("button", { name: /Report range:/ })).not.toHaveAccessibleName("Report range: Select dates")

    await user.click(screen.getByRole("button", { name: /Report range:/ }))
    const open = screen.getByRole("dialog", { name: "Report range" })
    const focused = open.querySelector<HTMLButtonElement>("button[data-date]:focus") ?? within(open).getAllByRole("button").find((button) => button.hasAttribute("data-date"))
    focused?.focus()
    const before = document.activeElement?.getAttribute("data-date")
    await user.keyboard("{ArrowRight}")
    expect(document.activeElement?.getAttribute("data-date")).not.toBe(before)
  })

  it("closes on Escape without applying", async () => {
    const user = userEvent.setup()
    const calls: DateRange[] = []
    render(<DateRangePicker label="Report range" onChange={(range) => calls.push(range)} months={1} />)
    await user.click(screen.getByRole("button", { name: "Report range: Select dates" }))
    const dialog = screen.getByRole("dialog", { name: "Report range" })
    within(dialog).getAllByRole("button").find((button) => button.hasAttribute("data-date"))?.focus()
    await user.keyboard("{Escape}")
    expect(screen.getByRole("button", { name: "Report range: Select dates" })).toHaveAttribute("aria-expanded", "false")
    expect(calls).toHaveLength(0)
  })
})
