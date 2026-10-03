import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { DonutChart } from "@/registry/ui/donut-chart"

const data = [
  { key: "studio", label: "Studio", value: 40 },
  { key: "workshop", label: "Workshop", value: 30 },
  { key: "house", label: "House", value: 30 },
]

describe("DonutChart", () => {
  it("draws each segment, moves legend focus, and hides a segment", async () => {
    const user = userEvent.setup()
    const { container } = render(<DonutChart data={data} label="Plans" totalLabel="Total" />)
    expect(container.querySelectorAll("[data-slot='donut-chart-segment']")).toHaveLength(3)
    const studio = screen.getByRole("button", { name: /Studio/ })
    const workshop = screen.getByRole("button", { name: /Workshop/ })
    studio.focus()
    await user.keyboard("{ArrowDown}")
    expect(workshop).toHaveFocus()
    await user.click(studio)
    expect(studio).toHaveAttribute("aria-pressed", "false")
    expect(screen.getByRole("status")).toHaveTextContent("Studio hidden")
  })

  it("names an empty whole", () => {
    render(<DonutChart data={[]} label="Plans" emptyLabel="No plans yet" />)
    expect(screen.getByRole("figure", { name: "Plans" })).toHaveTextContent("No plans yet")
  })
})
