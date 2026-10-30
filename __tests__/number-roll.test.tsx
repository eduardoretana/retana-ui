import { render, screen } from "@testing-library/react"
import { MotionConfig } from "motion/react"
import { describe, expect, it } from "vitest"

import { AnimatedCounter } from "@/registry/ui/animated-counter"
import { digitStep, formatNumberRoll, nearestDigitOffset, NumberRoll, rollTokens } from "@/registry/ui/number-roll"

describe("number roll math", () => {
  it("rolls forward and back on the wheel", () => {
    expect(digitStep(1, 3, 1)).toBe(2)
    expect(digitStep(3, 1, -1)).toBe(-2)
    expect(digitStep(9, 0, 1)).toBe(1)
    expect(digitStep(0, 9, -1)).toBe(-1)
    expect(digitStep(4, 4, 1)).toBe(0)
  })

  it("keeps a glyph within one step of the wheel", () => {
    expect(nearestDigitOffset(0, 9.5)).toBeCloseTo(0.5)
    expect(nearestDigitOffset(9, 9.5)).toBeCloseTo(-0.5)
    expect(nearestDigitOffset(0, 10)).toBeCloseTo(0)
  })

  it("formats es-MX and en-US from the same parts the reel draws", () => {
    for (const locale of ["es-MX", "en-US"]) {
      const formatted = formatNumberRoll(18640.5, 2, locale)
      const drawn = rollTokens(18640.5, 2, locale)
        .map((token) => (token.kind === "digit" ? String(token.digit) : token.text))
        .join("")
      expect(drawn).toBe(formatted)
      expect(formatted).toBe("18,640.50")
    }
    expect(formatNumberRoll(-12.5, 2, "es-MX")).toBe("-12.50")
  })
})

describe("NumberRoll", () => {
  it("announces the full value and splits the fraction", () => {
    const { container } = render(<NumberRoll value={12.5} decimals={1} />)
    expect(screen.getByText("12.5")).toBeInTheDocument()
    expect(container.querySelector("[data-slot=number-roll-integer]")).not.toBeNull()
    expect(container.querySelector("[data-slot=number-roll-fraction]")).not.toBeNull()
    expect(container.querySelector("[data-slot=number-roll-fraction]")?.className).not.toContain("text-muted-foreground")
  })

  it("makes the fraction smaller and lighter when hierarchy is on", () => {
    const { container } = render(<NumberRoll value={18640.5} decimals={2} hierarchy prefix="$" locale="es-MX" />)
    expect(screen.getByText("$18,640.50")).toBeInTheDocument()
    expect(container.querySelector("[data-slot=number-roll-fraction]")?.className).toContain("text-muted-foreground")
    expect(container.querySelector("[data-slot=number-roll-integer]")?.className).toContain("font-medium")
  })

  it("settles without travel when motion is reduced", () => {
    const { container } = render(
      <MotionConfig reducedMotion="always">
        <NumberRoll value={40} />
      </MotionConfig>,
    )
    expect(container.querySelector("[data-slot=number-roll]")?.getAttribute("data-motion")).toBe("reduced")
  })
})

describe("AnimatedCounter still announces through the reel", () => {
  it("keeps the formatted value for assistive tech", () => {
    render(<AnimatedCounter value={1280} prefix="$" suffix=" MXN" label="Workshop" />)
    expect(screen.getByText("Workshop")).toBeInTheDocument()
    expect(screen.getByText("$1,280 MXN")).toBeInTheDocument()
  })
})
