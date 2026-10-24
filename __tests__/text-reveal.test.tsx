import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import { scrollWordOpacity, TEXT_REVEAL_CSS, textRevealDriver, TextReveal } from "@/registry/ui/text-reveal"
import { setMotionPreference } from "@/registry/ui/motion-preference"

afterEach(() => {
  setMotionPreference("system")
  vi.restoreAllMocks()
})

describe("TextReveal", () => {
  it("exposes the full sentence to assistive tech", () => {
    render(<TextReveal text={"Costa Atelier\nabre el horno"} />)
    const heading = screen.getByRole("heading", { name: "Costa Atelier abre el horno" })
    expect(heading).toHaveAttribute("data-trigger", "mount")
    expect(heading.querySelector("[data-slot='text-reveal-line']")).toHaveAttribute("aria-hidden", "true")
  })

  it("keeps scroll words hidden from assistive tech and shows the full line", () => {
    expect(scrollWordOpacity(0)).toBeCloseTo(0.2)
    expect(scrollWordOpacity(1)).toBe(1)
    expect(scrollWordOpacity(0.5)).toBeCloseTo(0.6)
    expect(scrollWordOpacity(Number.NaN)).toBe(1)
    expect(textRevealDriver("mount", false, true)).toBe("mount")
    expect(textRevealDriver("scroll", true, true)).toBe("reduced")
    expect(textRevealDriver("scroll", false, true)).toBe("css")
    expect(textRevealDriver("scroll", false, false)).toBe("hook")
    expect(TEXT_REVEAL_CSS).toContain("animation-timeline: view()")
    expect(TEXT_REVEAL_CSS).toContain("animation-range: entry 20% cover 50%")
    const supports = TEXT_REVEAL_CSS.indexOf("@supports (animation-timeline: view())")
    const range = TEXT_REVEAL_CSS.indexOf("animation-range: entry 20% cover 50%")
    expect(supports).toBeGreaterThan(-1)
    expect(range).toBeGreaterThan(supports)

    vi.spyOn(CSS, "supports").mockReturnValue(false)
    render(<TextReveal trigger="scroll" text={"Costa Atelier\nabre el horno"} />)
    const heading = screen.getByRole("heading", { name: "Costa Atelier abre el horno" })
    expect(heading).toHaveAttribute("data-driver", "hook")
    expect(heading.querySelector(".sr-only")).toHaveTextContent("Costa Atelier abre el horno")
    expect(heading.querySelector("[data-slot='text-reveal-line']")).toHaveAttribute("aria-hidden", "true")
    const word = screen.getAllByText("Costa")[0]
    expect(word).toHaveAttribute("data-driver", "hook")
    expect(word).toHaveStyle({ opacity: "0.2" })
  })

  it("shows the full text when motion is reduced", () => {
    setMotionPreference("reduce")
    render(<TextReveal trigger="scroll" text="Horno abierto" />)
    const heading = screen.getByRole("heading", { name: "Horno abierto" })
    expect(heading).toHaveAttribute("data-driver", "reduced")
    expect(heading).toHaveAttribute("data-reduced", "true")
    for (const word of ["Horno", "abierto"]) {
      expect(screen.getAllByText(word)[0]).toHaveStyle({ opacity: "1" })
    }
  })

  it("uses a view timeline when the browser supports it", () => {
    vi.spyOn(CSS, "supports").mockImplementation((property: string, value?: string) => {
      return property === "animation-timeline" && String(value).includes("view")
    })
    render(<TextReveal trigger="scroll" text="Horno abierto" />)
    expect(screen.getByRole("heading", { name: "Horno abierto" })).toHaveAttribute("data-driver", "css")
  })
})
