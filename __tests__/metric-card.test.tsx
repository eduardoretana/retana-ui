import { render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"

import { MetricCard } from "@/registry/ui/metric-card"

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

describe("MetricCard", () => {
  it("shows the label, value, context, and a signed change", () => {
    render(<MetricCard label="Fired pieces" value={128} suffix=" pcs" context="Since the last firing" change="+12" />)
    expect(screen.getByText("Fired pieces")).toBeInTheDocument()
    expect(screen.getByText("128 pcs")).toBeInTheDocument()
    expect(screen.getByText("Since the last firing")).toBeInTheDocument()
    expect(document.querySelector("[data-trend='up']")).toHaveTextContent("+12")
  })

  it("marks a drop", () => {
    render(<MetricCard label="Cracks" value={3} context="This week" change="-2" />)
    expect(document.querySelector("[data-trend='down']")).toHaveTextContent("-2")
  })
})
