import { render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  rangeProgress,
  SCROLL_LINKED_CSS,
  scrollLinkedAnimationRange,
  scrollLinkedDriver,
  scrollLinkedTimelineName,
  unitRange,
  ScrollLinked,
} from "@/registry/ui/scroll-linked"
import { setMotionPreference } from "@/registry/ui/motion-preference"

afterEach(() => {
  setMotionPreference("system")
  vi.restoreAllMocks()
})

describe("scroll-linked", () => {
  it("maps a progress window onto the effect", () => {
    expect(unitRange(undefined)).toEqual([0, 1])
    expect(unitRange([0.2, 0.2])).toEqual([0.2, 0.2])
    expect(rangeProgress(0.5, [0, 1])).toBe(0.5)
    expect(rangeProgress(0.2, [0.2, 0.6])).toBe(0)
    expect(rangeProgress(0.4, [0.2, 0.6])).toBeCloseTo(0.5)
    expect(rangeProgress(Number.NaN, [0, 1])).toBe(0)
    expect(scrollLinkedAnimationRange([0, 1], "view")).toBe("cover 0% cover 100%")
    expect(scrollLinkedAnimationRange([0, 0.45], "view")).toBe("cover 0% cover 45%")
    expect(scrollLinkedAnimationRange([0, 1], "scroll")).toBe("0% 100%")
    expect(scrollLinkedTimelineName("view", false)).toBe("view()")
    expect(scrollLinkedTimelineName("scroll", false)).toBe("scroll(root)")
    expect(scrollLinkedTimelineName("scroll", true)).toBe("scroll(nearest)")
    expect(SCROLL_LINKED_CSS).toContain("animation-timeline: view()")
    expect(SCROLL_LINKED_CSS).toContain("animation-timeline: scroll()")
    expect(scrollLinkedDriver(true, true)).toBe("reduced")
    expect(scrollLinkedDriver(false, true)).toBe("css")
    expect(scrollLinkedDriver(false, false)).toBe("hook")
  })

  it("shows the final state when motion is reduced", () => {
    setMotionPreference("reduce")
    render(
      <ScrollLinked preset="rise" range={[0, 0.4]}>
        <p>Nota del horno</p>
      </ScrollLinked>,
    )
    const node = screen.getByText("Nota del horno").parentElement
    expect(node).toHaveAttribute("data-driver", "reduced")
    expect(node).toHaveAttribute("data-state", "final")
    expect(node).toHaveStyle({ opacity: "1", transform: "none" })
  })

  it("falls back to the scroll hook when view timelines are missing", () => {
    vi.spyOn(CSS, "supports").mockReturnValue(false)
    render(
      <ScrollLinked preset="fade">
        <p>Ceniza</p>
      </ScrollLinked>,
    )
    expect(screen.getByText("Ceniza").parentElement).toHaveAttribute("data-driver", "hook")
  })

  it("uses a CSS view timeline when the browser supports it", () => {
    vi.spyOn(CSS, "supports").mockImplementation((property: string, value?: string) => {
      return property === "animation-timeline" && String(value).includes("view")
    })
    render(
      <ScrollLinked preset="rotate" range={[0, 0.5]}>
        <p>Giro</p>
      </ScrollLinked>,
    )
    const node = screen.getByText("Giro").parentElement as HTMLElement
    expect(node).toHaveAttribute("data-driver", "css")
    expect(node.style.getPropertyValue("--scroll-linked-timeline")).toBe("view()")
    expect(node.style.getPropertyValue("--scroll-linked-range")).toBe("cover 0% cover 50%")
  })
})
