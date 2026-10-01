import { fireEvent, render, screen, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { describe, expect, it } from "vitest"

import { Treemap } from "@/registry/ui/treemap"

const data = {
  id: "all",
  label: "All",
  children: [
    {
      id: "clay",
      label: "Clay",
      children: [
        { id: "stone", label: "Stoneware", value: 40 },
        { id: "porc", label: "Porcelain", value: 20 },
      ],
    },
    { id: "glaze", label: "Glaze", value: 15 },
  ],
}

describe("Treemap", () => {
  it("drills in on click and returns from the breadcrumb", () => {
    render(<Treemap data={data} label="Revenue" />)
    const clay = Array.from(document.querySelectorAll("[data-part=label]")).find((node) => node.textContent === "Clay")
    expect(clay).toBeTruthy()
    fireEvent.click(clay!)
    const nav = screen.getByRole("navigation", { name: "Revenue path" })
    expect(within(nav).getByRole("button", { name: "All" })).toBeInTheDocument()
    expect(within(nav).getByText("Clay")).toHaveAttribute("aria-current", "location")
    fireEvent.click(within(nav).getByRole("button", { name: "All" }))
    expect(within(nav).getByText("All")).toHaveAttribute("aria-current", "location")
    expect(within(nav).queryByRole("button", { name: "All" })).not.toBeInTheDocument()
  })

  it("zooms with Enter and leaves with Escape", async () => {
    const user = userEvent.setup()
    render(<Treemap data={data} label="Revenue" />)
    const plot = screen.getByRole("group")
    plot.focus()
    await user.keyboard("{ArrowRight}{Enter}")
    const nav = screen.getByRole("navigation", { name: "Revenue path" })
    expect(within(nav).getByText("Clay")).toHaveAttribute("aria-current", "location")
    await user.keyboard("{Escape}")
    expect(within(nav).getByText("All")).toHaveAttribute("aria-current", "location")
  })
})
