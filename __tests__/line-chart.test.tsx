import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { LineChart } from "@/registry/ui/line-chart"

const series = [
  { key: "kiln", label: "Kiln" },
  { key: "glaze", label: "Glaze", dashed: true },
]

const data = [
  { key: "d1", label: "Mon", axisLabel: "Mon", values: { kiln: 4, glaze: 2 } },
  { key: "d2", label: "Tue", axisLabel: "Tue", values: { kiln: 6, glaze: 5 } },
  { key: "d3", label: "Wed", axisLabel: "Wed", values: { kiln: 3, glaze: 7 } },
]

describe("LineChart", () => {
  it("draws each series, toggles the legend, and scrubs with the keyboard", async () => {
    const user = userEvent.setup()
    const { container } = render(<LineChart data={data} series={series} label="Output" />)
    expect(container.querySelectorAll("[data-slot='line-chart-line']")).toHaveLength(2)
    const glaze = screen.getByRole("button", { name: "Glaze" })
    await user.click(glaze)
    expect(glaze).toHaveAttribute("aria-pressed", "false")
    const slider = screen.getByRole("slider", { name: "Output, explore by date" })
    slider.focus()
    await user.keyboard("{Home}")
    expect(slider).toHaveAttribute("aria-valuenow", "1")
    expect(slider).toHaveAttribute("aria-valuetext", "Mon: Kiln 4")
    await user.click(screen.getByRole("button", { name: "Kiln" }))
    expect(screen.getByText("Choose a series to show")).toBeInTheDocument()
  })

  it("shows the empty label", () => {
    render(<LineChart data={[]} series={series} label="Output" emptyLabel="Nothing fired" />)
    expect(screen.getByText("Nothing fired")).toBeInTheDocument()
  })
})
