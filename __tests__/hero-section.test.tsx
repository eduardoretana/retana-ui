import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { HeroSection } from "@/registry/blocks/hero-section"

describe("HeroSection", () => {
  it("switches the hero variant", () => {
    const { rerender } = render(<HeroSection variant="dashboard" animateIn={false} />)
    expect(screen.getByRole("heading", { name: "See every dollar of revenue move" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "See every dollar of revenue move" })).toHaveAttribute("data-variant", "dashboard")
    rerender(<HeroSection variant="workflow" animateIn={false} />)
    expect(screen.getByRole("heading", { name: "Every event, handled in milliseconds" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Every event, handled in milliseconds" })).toHaveAttribute("data-variant", "workflow")
    rerender(<HeroSection variant="editorial" animateIn={false} />)
    expect(screen.getByRole("heading", { name: "Your week, planned before Monday" })).toBeInTheDocument()
    expect(screen.getByRole("region", { name: "Your week, planned before Monday" })).toHaveAttribute("data-variant", "editorial")
  })
})
