import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import {
  MagneticBento,
  MagneticBentoCta,
  MagneticBentoDescription,
  MagneticBentoIcon,
  MagneticBentoItem,
  MagneticBentoTitle,
} from "@/registry/ui/magnetic-bento"

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

  it("separates cells without a border and caps the reading measure", () => {
    const { container } = render(
      <MagneticBento label="Samples">
        <MagneticBentoItem value="a" span={{ col: 2, row: 1 }} accent="chart-1">
          <MagneticBentoIcon>
            <span>icono</span>
          </MagneticBentoIcon>
          <MagneticBentoTitle>Horno norte</MagneticBentoTitle>
          <MagneticBentoDescription>Calendario de quemas.</MagneticBentoDescription>
          <MagneticBentoCta href="#horno">Ver agenda</MagneticBentoCta>
        </MagneticBentoItem>
      </MagneticBento>,
    )

    const item = screen.getByText("Horno norte").closest("article")
    expect(item?.className).not.toContain("border")
    expect(item?.className).toContain("shadow-sm")
    expect(item?.className).toContain("gap-3")
    expect(item?.className).toContain("focus-visible:ring-2")
    expect(document.querySelector("[data-slot='magnetic-bento-title']")?.className).toContain("max-w-[17.5rem]")
    expect(document.querySelector("[data-slot='magnetic-bento-description']")?.className).toContain("max-w-[17.5rem]")
    const html = container.innerHTML
    expect(html).not.toContain("transition-colors")
    expect(html).not.toContain("transition-all")
    expect(html).toContain("transition-[opacity,transform]")
    expect(document.querySelector("[data-slot='magnetic-bento-cta']")?.className).toContain("text-foreground")
    expect(document.querySelector("[data-slot='magnetic-bento-cta']")?.className ?? "").not.toContain("mb-item-accent")
    expect(document.querySelector("[data-slot='magnetic-bento-grid']")?.className).toContain("@min-[36rem]/mb:grid-cols-2")
    expect(document.querySelector("[data-slot='magnetic-bento-grid']")?.className).toContain("@min-[56rem]/mb:grid-cols-4")
  })
})
