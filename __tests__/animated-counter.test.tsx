import { render, screen } from "@testing-library/react"
import { beforeAll, describe, expect, it } from "vitest"

import { AnimatedCounter } from "@/registry/ui/animated-counter"

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

describe("AnimatedCounter", () => {
  it("exposes the formatted value to assistive tech", () => {
    render(<AnimatedCounter value={1280} prefix="$" suffix=" MXN" label="Workshop" />)
    expect(screen.getByText("Workshop")).toBeInTheDocument()
    expect(screen.getByText("$1,280 MXN")).toBeInTheDocument()
  })

  it("keeps fraction digits", () => {
    render(<AnimatedCounter value={12.5} decimals={1} />)
    expect(screen.getByText("12.5")).toBeInTheDocument()
  })
})
