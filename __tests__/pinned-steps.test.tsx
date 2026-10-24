import { act, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"

import {
  PINNED_STEP_MARGIN,
  pinnedStepMotion,
  pinnedStepsMode,
  PinnedSteps,
  type PinnedStep,
} from "@/registry/ui/pinned-steps"
import { motionPresets } from "@/registry/lib/motion"
import { setMotionPreference } from "@/registry/ui/motion-preference"

const steps: PinnedStep[] = [
  {
    id: "dry",
    title: "Secado",
    body: "La puerta queda entreabierta.",
    decorative: true,
    visual: <span>Forma</span>,
  },
  {
    id: "glaze",
    title: "Esmalte",
    body: "Doce minutos de meseta.",
    visual: <span>1.220 °C</span>,
  },
]

afterEach(() => {
  setMotionPreference("system")
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

function wideViewport() {
  vi.spyOn(window, "matchMedia").mockImplementation(
    (query: string) =>
      ({
        matches: query.includes("min-width"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList,
  )
}

describe("pinned steps", () => {
  it("stacks under the width cutoff and with reduced motion", () => {
    expect(pinnedStepsMode(false, false)).toBe("stacked")
    expect(pinnedStepsMode(true, true)).toBe("stacked")
    expect(pinnedStepsMode(true, false)).toBe("pinned")
    setMotionPreference("reduce")
    wideViewport()
    render(<PinnedSteps label="Quema" steps={steps} />)
    const root = document.querySelector("[data-slot='pinned-steps']")
    expect(root).toHaveAttribute("data-mode", "stacked")
    expect(root?.querySelector(".sticky")).toBeNull()
    expect(screen.getByRole("heading", { name: "Secado" })).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Esmalte" })).toBeInTheDocument()
    expect(screen.getByText("Forma").closest("[data-slot='pinned-step-visual']")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByText("1.220 °C").closest("[data-slot='pinned-step-visual']")).toHaveAttribute("aria-live", "polite")
  })

  it("pins on a wide viewport and watches each step at the center band", () => {
    const margins: string[] = []
    const callbacks: IntersectionObserverCallback[] = []
    class Observer {
      constructor(callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {
        callbacks.push(callback)
        margins.push(options?.rootMargin ?? "")
      }
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return []
      }
    }
    vi.stubGlobal("IntersectionObserver", Observer)
    wideViewport()
    render(<PinnedSteps label="Quema" steps={steps} />)
    const root = document.querySelector("[data-slot='pinned-steps']")
    expect(root).toHaveAttribute("data-mode", "pinned")
    expect(root?.querySelector("[data-slot='pinned-steps-visual']")?.className).toContain("sticky")
    expect(margins).toEqual([PINNED_STEP_MARGIN, PINNED_STEP_MARGIN])
    expect(callbacks).toHaveLength(2)
    const visual = screen.getByText("Secado").closest("[data-slot='pinned-step']")
    expect(visual).toHaveAttribute("data-active", "true")
    const shown = screen.getByText("Forma").closest("[data-slot='pinned-step-visual']") as HTMLElement
    expect(shown).toHaveStyle({ opacity: "1" })
    expect(shown.style.transition).toContain(`${motionPresets.duration.considered}s`)
    const hidden = screen.getByText("1.220 °C").closest("[data-slot='pinned-step-visual']") as HTMLElement
    expect(hidden).toHaveStyle({ opacity: "0" })
    expect(hidden).toHaveAttribute("aria-hidden", "true")
    act(() => {
      callbacks[1]?.([{ isIntersecting: true } as IntersectionObserverEntry], {} as IntersectionObserver)
    })
    expect(screen.getByText("Esmalte").closest("[data-slot='pinned-step']")).toHaveAttribute("data-active", "true")
    expect(screen.getByText("1.220 °C").closest("[data-slot='pinned-step-visual']")).toHaveAttribute("aria-live", "polite")
  })

  it("names an empty list and keeps reduced motion still", () => {
    expect(pinnedStepMotion(false, true).transition).toBe("none")
    render(<PinnedSteps steps={[]} emptyLabel="Sin pasos" />)
    expect(screen.getByText("Sin pasos")).toBeInTheDocument()
  })
})
