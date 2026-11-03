import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { Badge } from "@/components/ui/badge"

describe("badge count", () => {
  it("shows the informative count as text and names it", () => {
    render(<Badge variant="count" count={3} aria-label="3 sin leer" />)
    const badge = screen.getByText("3")
    expect(badge).toHaveAttribute("data-variant", "count")
    expect(badge).toHaveAccessibleName("3 sin leer")
    expect(badge.className).toContain("bg-foreground")
    expect(badge.className).toContain("text-background")
  })

  it("keeps the number in the accessible name of a dot", () => {
    render(<Badge variant="dot" count={3} aria-label="3 sin leer" />)
    const badge = screen.getByText("3")
    expect(badge.className).toContain("sr-only")
    expect(badge.closest("[data-variant=dot]")).toHaveAccessibleName("3 sin leer")
  })

  it("leaves the status variant colored", () => {
    render(<Badge variant="destructive">Error</Badge>)
    const badge = screen.getByText("Error")
    expect(badge.className).toContain("text-destructive")
    expect(badge.className).not.toContain("bg-foreground")
  })
})
