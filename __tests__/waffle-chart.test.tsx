import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it } from "vitest"

import { WaffleChart } from "@/registry/ui/waffle-chart"

const data = [
  { key: "bisque", label: "Bisque", value: 50 },
  { key: "glaze", label: "Glaze", value: 30 },
  { key: "loss", label: "Loss", value: 20 },
]

const previousWidth = Object.getOwnPropertyDescriptor(HTMLElement.prototype, "clientWidth")

afterEach(() => {
  if (previousWidth) Object.defineProperty(HTMLElement.prototype, "clientWidth", previousWidth)
})

describe("WaffleChart", () => {
  it("draws a 10 by 10 grid and walks it from the keyboard", async () => {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return 200 } })
    const user = userEvent.setup()
    const { container } = render(<WaffleChart data={data} label="Firing mix" />)
    expect(screen.getByRole("group")).toHaveAccessibleName(/100 cells/)
    expect(container.querySelectorAll("[data-slot=waffle-chart-cell]")).toHaveLength(100)
    const plot = screen.getByRole("group")
    plot.focus()
    await user.keyboard("{ArrowRight}")
    expect(document.querySelector("[aria-live=polite]")).toHaveTextContent("Bisque")
    await user.keyboard("{PageDown}")
    expect(document.querySelector("[aria-live=polite]")).toHaveTextContent("Glaze")
  })

  it("pins a category from the legend", async () => {
    Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get() { return 200 } })
    const user = userEvent.setup()
    render(<WaffleChart data={data} label="Firing mix" />)
    const glaze = screen.getByRole("button", { name: /Glaze/ })
    await user.click(glaze)
    expect(glaze).toHaveAttribute("aria-pressed", "true")
    expect(screen.getByRole("group")).toHaveAttribute("data-active", "true")
    await user.click(glaze)
    expect(glaze).toHaveAttribute("aria-pressed", "false")
  })
})
