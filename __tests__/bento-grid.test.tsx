import { render, screen } from "@testing-library/react"
import { MotionConfig } from "motion/react"
import { describe, expect, it } from "vitest"

import {
  BENTO_DESKTOP_MIN_REM,
  BENTO_MID_MIN_REM,
  BENTO_ONE_COLUMN_UNTIL_PX,
  BENTO_STAGGER_MAX_S,
  BentoCell,
  BentoGrid,
  bentoStaggerDelay,
} from "@/registry/ui/bento-grid"

describe("BentoGrid", () => {
  it("keeps one column through 390px and opens the full count on desktop", () => {
    expect(BENTO_ONE_COLUMN_UNTIL_PX).toBeGreaterThanOrEqual(390)
    expect(BENTO_MID_MIN_REM * 16).toBeGreaterThan(390)
    expect(BENTO_DESKTOP_MIN_REM * 16).toBeGreaterThan(BENTO_MID_MIN_REM * 16)

    render(
      <BentoGrid label="Muro" columns={4}>
        <BentoCell span={{ col: 2, row: 2 }}>Horno</BentoCell>
      </BentoGrid>,
    )

    const track = document.querySelector("[data-slot='bento-grid-track']")
    expect(track).toHaveAttribute("data-bento-preset", "default")
    expect(track?.className).toContain("grid-cols-1")
    expect(track?.className).toContain("@min-[30rem]/bento:grid-cols-2")
    expect(track?.className).toContain("@min-[56rem]/bento:grid-cols-4")
    expect(track?.className).toContain("gap-4")
    expect(track?.className).not.toMatch(/gap-\[\d+px\]/)
    expect(track?.className).not.toMatch(/p-\[\d+px\]/)
    expect(track?.className).not.toMatch(/rounded-\[\d+px\]/)
  })

  it("records the requested span and collapses it until the mid breakpoint", () => {
    render(
      <BentoGrid label="Muro">
        <BentoCell span={{ col: 2, row: 2 }}>Amplia</BentoCell>
        <BentoCell span={{ col: 1, row: 1 }}>Corta</BentoCell>
      </BentoGrid>,
    )

    const wide = screen.getByText("Amplia").closest("[data-slot='bento-cell']")
    expect(wide).toHaveAttribute("data-col", "2")
    expect(wide).toHaveAttribute("data-row", "2")
    expect(wide?.className).toContain("col-span-1")
    expect(wide?.className).toContain("@min-[30rem]/bento:col-span-2")
    expect(wide?.className).toContain("@min-[56rem]/bento:col-span-2")
    expect(wide?.className).toContain("row-span-1")
    expect(wide?.className).toContain("@min-[30rem]/bento:row-span-2")
    expect(wide?.className).not.toContain("order-")
  })

  it("keeps source order so one column reads in the same sequence", () => {
    render(
      <BentoGrid label="Muro">
        <BentoCell>Uno</BentoCell>
        <BentoCell>Dos</BentoCell>
        <BentoCell>Tres</BentoCell>
      </BentoGrid>,
    )

    const cells = [...document.querySelectorAll("[data-slot='bento-cell']")]
    expect(cells.map((cell) => cell.textContent)).toEqual(["Uno", "Dos", "Tres"])
  })

  it("renders one cell without inventing neighbors", () => {
    render(
      <BentoGrid label="Muro">
        <BentoCell span={{ col: 2, row: 2 }}>Sola</BentoCell>
      </BentoGrid>,
    )
    expect(document.querySelectorAll("[data-slot='bento-cell']")).toHaveLength(1)
  })

  it("shows empty, loading, and error without links", () => {
    const { rerender } = render(<BentoGrid label="Muro" emptyLabel="Sin piezas" />)
    expect(screen.getByText("Sin piezas")).toBeInTheDocument()
    expect(document.querySelector("[data-slot='bento-grid']")).toHaveAttribute("data-state", "empty")
    expect(document.querySelectorAll("[data-slot='bento-cell']")).toHaveLength(0)
    expect(screen.queryByRole("link")).toBeNull()

    rerender(<BentoGrid label="Muro" status="loading" loadingLabel="Cargando el muro" />)
    expect(screen.getByText("Cargando el muro")).toBeInTheDocument()
    expect(document.querySelector("[data-slot='bento-grid']")).toHaveAttribute("aria-busy", "true")
    expect(screen.queryByRole("link")).toBeNull()

    rerender(<BentoGrid label="Muro" status="error" errorLabel="No se pudo cargar" />)
    const alert = screen.getByRole("alert")
    expect(alert).toHaveTextContent("No se pudo cargar")
    expect(alert.className).toContain("font-medium")
    expect(screen.queryByRole("link")).toBeNull()
    expect(document.querySelector("[data-slot='bento-grid-track']")).toBeNull()
  })

  it("staggers ready cells with opacity and translate, capped at 0.4s", () => {
    expect(BENTO_STAGGER_MAX_S).toBe(0.4)
    expect(bentoStaggerDelay(0, 20)).toBe(0)
    expect(bentoStaggerDelay(19, 20)).toBeLessThanOrEqual(0.4)
    expect(bentoStaggerDelay(19, 20)).toBeCloseTo(0.4)

    render(
      <BentoGrid label="Muro">
        <BentoCell>Uno</BentoCell>
        <BentoCell>Dos</BentoCell>
        <BentoCell>Tres</BentoCell>
      </BentoGrid>,
    )

    const track = document.querySelector("[data-slot='bento-grid-track']")
    expect(track).toHaveAttribute("data-stagger-max", "0.4")
    expect(track?.className).not.toMatch(/transition/)
    const cells = [...document.querySelectorAll("[data-slot='bento-cell']")]
    expect(cells).toHaveLength(3)
    const delays = cells.map((cell) => Number(cell.getAttribute("data-enter-delay")))
    expect(delays[0]).toBe(0)
    expect(delays[2]).toBeLessThanOrEqual(0.4)
    expect(delays[2]).toBeGreaterThan(delays[1])
    for (const cell of cells) {
      expect(cell.getAttribute("data-motion")).toBe("full")
      expect(cell.className).not.toContain("will-change")
    }
  })

  it("uses duration 0 when motion is reduced", () => {
    render(
      <MotionConfig reducedMotion="always">
        <BentoGrid label="Muro">
          <BentoCell>Uno</BentoCell>
          <BentoCell>Dos</BentoCell>
        </BentoGrid>
      </MotionConfig>,
    )
    const cells = [...document.querySelectorAll("[data-slot='bento-cell']")]
    expect(cells.length).toBeGreaterThan(0)
    for (const cell of cells) expect(cell.getAttribute("data-motion")).toBe("reduced")
  })
})
