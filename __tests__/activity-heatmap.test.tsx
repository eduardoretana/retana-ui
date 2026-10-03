import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it, vi } from "vitest"

import { ActivityHeatmap } from "@/registry/ui/activity-heatmap"

const days = [
  { date: "2026-01-04", count: 1 },
  { date: "2026-01-05", count: 4 },
  { date: "2026-01-06", count: 0 },
]

describe("ActivityHeatmap", () => {
  it("selects a day from the keyboard and highlights a level", async () => {
    const user = userEvent.setup()
    const onSelectDate = vi.fn()
    render(<ActivityHeatmap days={days} label="Firings in January" period="January" onSelectDate={onSelectDate} />)
    const cells = screen.getAllByRole("gridcell")
    expect(cells.length).toBeGreaterThan(0)
    cells[0].focus()
    await user.keyboard("{Enter}")
    expect(onSelectDate).toHaveBeenCalledWith("2026-01-04")
    cells[0].focus()
    await user.keyboard("{ArrowDown}")
    expect(cells[1]).toHaveFocus()
    await user.click(screen.getByRole("button", { name: /Highlight days with 1 contribution/ }))
    expect(screen.getByRole("button", { name: /Highlight days with 1 contribution/ })).toHaveAttribute("aria-pressed", "true")
  })

  it("summarizes an empty range", () => {
    render(<ActivityHeatmap days={[]} label="No firings" period="this year" />)
    expect(screen.getByRole("status")).toHaveTextContent("0 contributions in this year")
  })
})
