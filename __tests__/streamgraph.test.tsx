import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Streamgraph } from "@/registry/ui/streamgraph"

const series = [
  { key: "kiln", label: "Kiln" },
  { key: "glaze", label: "Glaze" },
]

const data = [
  { key: "w1", label: "Week 1", axisLabel: "W1", values: { kiln: 4, glaze: 2 } },
  { key: "w2", label: "Week 2", axisLabel: "W2", values: { kiln: 6, glaze: 3 } },
  { key: "w3", label: "Week 3", axisLabel: "W3", values: { kiln: 5, glaze: 8 } },
]

describe("Streamgraph", () => {
  it("draws each layer, moves through time, and toggles the legend", async () => {
    const user = userEvent.setup()
    const { container } = render(<Streamgraph data={data} series={series} label="Tickets" />)
    expect(container.querySelectorAll("[data-slot='streamgraph-layer']")).toHaveLength(2)
    const plot = screen.getByRole("group", { name: /left and right arrows/ })
    plot.focus()
    await user.keyboard("{ArrowLeft}")
    expect(screen.getByRole("status")).toHaveTextContent("Week 2")
    await user.keyboard("{ArrowUp}")
    expect(screen.getByRole("status")).toHaveTextContent("Glaze")
    const glaze = screen.getByRole("button", { name: "Glaze" })
    await user.click(glaze)
    expect(glaze).toHaveAttribute("aria-pressed", "false")
    await user.click(screen.getByRole("button", { name: "Kiln" }))
    expect(screen.getByText("Choose a layer to show")).toBeInTheDocument()
  })

  it("shows the empty label", () => {
    render(<Streamgraph data={[]} series={series} label="Tickets" emptyLabel="No tickets yet" />)
    expect(screen.getByText("No tickets yet")).toBeInTheDocument()
  })
})
