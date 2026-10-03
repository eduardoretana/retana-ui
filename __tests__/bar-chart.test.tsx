import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { BarChart } from "@/registry/ui/bar-chart"

const data = [
  { key: "mon", label: "Monday", axisLabel: "M", value: 12 },
  { key: "tue", label: "Tuesday", axisLabel: "T", value: 20 },
  { key: "wed", label: "Wednesday", axisLabel: "W", value: 8 },
]

describe("BarChart", () => {
  it("draws each bar and scrubs them from the keyboard", async () => {
    const user = userEvent.setup()
    const { container } = render(<BarChart data={data} label="Kiln" period="Sep 15–17" unit="pcs" />)
    expect(container.querySelectorAll("[data-slot='bar-chart-bar']")).toHaveLength(3)
    const slider = screen.getByRole("slider", { name: "Kiln, explore by day" })
    expect(slider).toHaveAttribute("aria-valuetext", "Wednesday: 8 pcs")
    slider.focus()
    await user.keyboard("{Home}")
    expect(slider).toHaveAttribute("aria-valuenow", "1")
    expect(slider).toHaveAttribute("aria-valuetext", "Monday: 12 pcs")
    await user.keyboard("{ArrowRight}")
    expect(slider).toHaveAttribute("aria-valuetext", "Tuesday: 20 pcs")
    await user.keyboard("{Escape}")
    expect(slider).toHaveAttribute("aria-valuetext", "Wednesday: 8 pcs")
  })

  it("names an empty range", () => {
    render(<BarChart data={[]} label="Empty kiln" period="none" />)
    expect(screen.getByRole("slider", { name: "Empty kiln, explore by day" })).toHaveAttribute("aria-valuetext", "No data")
  })
})
