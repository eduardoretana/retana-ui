import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeAll, describe, expect, it } from "vitest"

import { UsageMeter } from "@/registry/ui/usage-meter"

beforeAll(() => {
  globalThis.IntersectionObserver = class {
    constructor(private callback: IntersectionObserverCallback) {}
    observe(target: Element) {
      this.callback([{ isIntersecting: true, target } as IntersectionObserverEntry], this as unknown as IntersectionObserver)
    }
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
    root = null
    rootMargin = ""
    thresholds = []
  } as unknown as typeof IntersectionObserver
})

const segments = [
  { id: "glaze", label: "Glaze", value: 40 },
  { id: "clay", label: "Clay", value: 28 },
]

describe("UsageMeter", () => {
  it("pins a category from the keyboard and clears it with Escape", async () => {
    const user = userEvent.setup()
    render(<UsageMeter label="Workspace storage" segments={segments} limit={100} unit="GB" />)
    expect(screen.getByRole("img", { name: /Workspace storage: 68.0 GB of 100 GB used/ })).toBeInTheDocument()
    const glaze = screen.getByRole("button", { name: "Glaze, 40.0 GB" })
    await user.click(glaze)
    expect(glaze).toHaveAttribute("aria-pressed", "true")
    await user.keyboard("{Escape}")
    expect(glaze).toHaveAttribute("aria-pressed", "false")
  })

  it("warns when usage crosses the limit", () => {
    const seats = [{ id: "studio", label: "Studio", value: 12 }]
    const { rerender } = render(<UsageMeter label="Seats" segments={seats} limit={20} unit="seats" decimals={0} />)
    rerender(<UsageMeter label="Seats" segments={seats} limit={10} unit="seats" decimals={0} />)
    expect(screen.getByText("2 seats over")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Over limit, 2 seats" })).toBeInTheDocument()
    expect(screen.getByText("Over the plan limit by 2 seats.")).toBeInTheDocument()
  })

  it("moves the roving focus between categories", async () => {
    const user = userEvent.setup()
    render(<UsageMeter label="Storage" segments={segments} limit={100} unit="GB" />)
    const glaze = screen.getByRole("button", { name: "Glaze, 40.0 GB" })
    glaze.focus()
    await user.keyboard("{ArrowRight}")
    expect(screen.getByRole("button", { name: "Clay, 28.0 GB" })).toHaveFocus()
    await user.keyboard("{End}")
    expect(screen.getByRole("button", { name: "Free, 32.0 GB" })).toHaveFocus()
  })
})
