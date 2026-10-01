import { render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"

import { Gauge } from "@/registry/ui/gauge"

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

describe("Gauge", () => {
  it("exposes the value and the threshold it has reached", () => {
    render(
      <Gauge
        value={92}
        label="Kiln load"
        detail="Stoneware"
        thresholds={[
          { from: 0, tone: "accent", label: "Room" },
          { from: 90, tone: "danger", label: "Hot" },
        ]}
      />,
    )
    const meter = screen.getByRole("meter", { name: "Kiln load" })
    expect(meter).toHaveAttribute("aria-valuenow", "92")
    expect(meter).toHaveAttribute("aria-valuemin", "0")
    expect(meter).toHaveAttribute("aria-valuemax", "100")
    expect(meter).toHaveAttribute("aria-valuetext", "92%, Hot")
    expect(screen.getByRole("figure", { name: "Kiln load: 92 of 100, Hot" })).toHaveAttribute("data-tone", "danger")
    expect(screen.getByText("Stoneware")).toBeInTheDocument()
  })
})
