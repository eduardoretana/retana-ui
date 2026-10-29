import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { MagneticBento, MagneticBentoItem, MagneticBentoTitle } from "@/registry/ui/magnetic-bento"

describe("MagneticBento on the bento base", () => {
  it("composes the bento base and keeps the magnetic span contract", () => {
    render(
      <MagneticBento label="Samples">
        <MagneticBentoItem value="a" span={{ col: 2, row: 2 }} accent="chart-1">
          <MagneticBentoTitle>Alpha</MagneticBentoTitle>
        </MagneticBentoItem>
      </MagneticBento>,
    )

    const grid = document.querySelector("[data-slot='magnetic-bento-grid']")
    expect(grid).toHaveAttribute("data-bento-preset", "magnetic")
    expect(grid?.className).toContain("grid-cols-1")
    expect(grid?.className).toContain("gap-4")
    expect(grid?.className).toContain("@min-[36rem]/mb:grid-cols-2")
    expect(grid?.className).toContain("@min-[56rem]/mb:grid-cols-4")

    const item = screen.getByText("Alpha").closest("article")
    expect(item).toHaveAttribute("data-bento-cell", "true")
    expect(item?.className).toContain("col-span-1")
    expect(item?.className).toContain("@min-[36rem]/mb:col-span-2")
    expect(item?.className).toContain("@min-[56rem]/mb:col-span-2")
    expect(item?.className).toContain("row-span-2")
    expect(item?.className).toContain("min-h-80")
  })
})
