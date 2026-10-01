import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import { SlopeChart } from "@/registry/ui/slope-chart"

const items = [
  { key: "gallery", label: "Gallery", start: 10, end: 30 },
  { key: "wholesale", label: "Wholesale", start: 40, end: 15 },
]

const previousWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth")

afterEach(() => {
  if (previousWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", previousWidth)
})

describe("SlopeChart", () => {
  it("compares before and after and moves in end order", async () => {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return 360 } })
    const user = userEvent.setup()
    render(<SlopeChart data={items} label="Orders" startLabel="Before" endLabel="After" highlightKey="gallery" />)
    const columns = screen.getAllByText(/Before|After/).filter((node) => node.getAttribute("data-slot") === "slope-chart-column")
    expect(columns.map((node) => node.textContent)).toEqual(["Before", "After"])
    expect(document.querySelector("[data-slot=slope-chart-item][data-accent=true]")).toBeTruthy()
    const plot = screen.getByRole("group")
    plot.focus()
    await user.keyboard("{Home}")
    const live = document.querySelector("[aria-live=polite]")
    expect(live).toHaveTextContent("Gallery")
    expect(live).toHaveTextContent("Before 10")
    expect(live).toHaveTextContent("After 30")
    expect(live).toHaveTextContent("up 1")
    await user.keyboard("{ArrowDown}")
    expect(live).toHaveTextContent("Wholesale")
    expect(live).toHaveTextContent("Before 40")
    expect(live).toHaveTextContent("After 15")
    await user.keyboard("{Escape}")
    expect(live).toHaveTextContent("")
    expect(screen.getByRole("table", { name: "Orders" })).toBeInTheDocument()
  })

  it("names an empty comparison", () => {
    render(<SlopeChart data={[]} label="Orders" startLabel="Before" endLabel="After" emptyLabel="No orders" />)
    expect(screen.getByText("No orders")).toBeInTheDocument()
    expect(screen.getByRole("group")).toHaveAttribute("tabindex", "-1")
  })
})
