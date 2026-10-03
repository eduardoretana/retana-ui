import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { BrushChart } from "@/registry/ui/brush-chart"

const DAY = 86_400_000
const start = Date.UTC(2026, 0, 1)
const data = Array.from({ length: 40 }, (_, index) => ({ date: start + index * DAY, value: 10 + (index % 7) }))

describe("BrushChart", () => {
  it("draws the series, steps the window, and reads a point from the keyboard", async () => {
    const user = userEvent.setup()
    const { container } = render(
      <BrushChart
        data={data}
        label="Firings"
        defaultRange={[start, start + 13 * DAY]}
        annotations={[{ date: start + 2 * DAY, label: "Gallery" }]}
      />,
    )
    expect(container.querySelector("[data-slot='brush-chart-line']")).toBeInTheDocument()
    const windowSlider = screen.getByRole("slider", { name: "Firings window" })
    const before = windowSlider.getAttribute("aria-valuetext")
    windowSlider.focus()
    await user.keyboard("{Shift>}{ArrowRight}{/Shift}")
    expect(windowSlider.getAttribute("aria-valuetext")).not.toBe(before)
    const plot = screen.getByRole("group", { name: /left and right arrows/ })
    plot.focus()
    await user.keyboard("{Home}")
    expect(screen.getByRole("status").textContent).not.toEqual("")
  })

  it("shows an empty series", () => {
    render(<BrushChart data={[{ date: start, value: 1 }]} label="Firings" emptyLabel="No firings yet" />)
    expect(screen.getByText("No firings yet")).toBeInTheDocument()
  })
})
