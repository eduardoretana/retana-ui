import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { clampUnit, readingPercent } from "@/registry/hooks/use-scroll-progress"
import { railRunway, railScrollOffset, HorizontalScrollRail } from "@/registry/ui/horizontal-scroll-rail"
import { parallaxOffset, ParallaxLayers } from "@/registry/ui/parallax-layers"
import { RevealOnScroll } from "@/registry/ui/reveal-on-scroll"
import { ScrollProgress } from "@/registry/ui/scroll-progress"
import { ScrollSnapPanel, ScrollSnapRail } from "@/registry/ui/scroll-snap-rail"
import { StaggerItem, StaggerReveal } from "@/registry/ui/stagger-reveal"
import { StickySectionList } from "@/registry/ui/sticky-section-list"
import { setMotionPreference } from "@/registry/ui/motion-preference"

afterEach(() => {
  setMotionPreference("system")
})

describe("scroll progress math", () => {
  it("clamps the unit interval", () => {
    expect(clampUnit(0)).toBe(0)
    expect(clampUnit(0.4)).toBe(0.4)
    expect(clampUnit(2)).toBe(1)
    expect(clampUnit(-1)).toBe(0)
    expect(clampUnit(Number.NaN)).toBe(0)
    expect(readingPercent(1, 0)).toBe(0)
    expect(readingPercent(0.5, 240)).toBe(50)
    expect(readingPercent(1, 240)).toBe(100)
  })
})

describe("ScrollProgress", () => {
  it("exposes a progressbar at the start of the range", () => {
    render(<ScrollProgress label="Lectura" showValue />)
    const bar = screen.getByRole("progressbar", { name: "Lectura" })
    expect(bar).toHaveAttribute("aria-valuemin", "0")
    expect(bar).toHaveAttribute("aria-valuemax", "100")
    expect(bar).toHaveAttribute("aria-valuenow", "0")
    expect(screen.getByText("0%")).toBeInTheDocument()
  })
})

describe("RevealOnScroll", () => {
  it("stays shown when motion is reduced", () => {
    setMotionPreference("reduce")
    render(
      <RevealOnScroll>
        <p>Nota del horno</p>
      </RevealOnScroll>,
    )
    expect(screen.getByText("Nota del horno")).toBeInTheDocument()
    expect(screen.getByText("Nota del horno").parentElement).toHaveAttribute("data-state", "shown")
    expect(screen.getByText("Nota del horno").parentElement).toHaveAttribute("data-reduced", "true")
  })
})

describe("StaggerReveal", () => {
  it("renders every child and skips the stagger when motion is reduced", () => {
    setMotionPreference("reduce")
    render(
      <StaggerReveal>
        <StaggerItem>Ceniza</StaggerItem>
        <StaggerItem>Sílice</StaggerItem>
      </StaggerReveal>,
    )
    expect(screen.getByText("Ceniza")).toBeInTheDocument()
    expect(screen.getByText("Sílice")).toBeInTheDocument()
    expect(document.querySelector("[data-slot='stagger-reveal']")).toHaveAttribute("data-reduced", "true")
  })
})

describe("ScrollSnapRail", () => {
  it("snaps on the named axis and turns smooth scrolling off when motion is reduced", () => {
    setMotionPreference("reduce")
    render(
      <ScrollSnapRail label="Etapas" axis="y">
        <ScrollSnapPanel>Secado</ScrollSnapPanel>
        <ScrollSnapPanel>Bajada</ScrollSnapPanel>
      </ScrollSnapRail>,
    )
    const rail = screen.getByRole("region", { name: "Etapas" })
    expect(rail).toHaveAttribute("data-axis", "y")
    expect(rail.className).toContain("snap-y")
    expect(rail.className).toContain("scroll-auto")
    expect(screen.getAllByText(/Secado|Bajada/)).toHaveLength(2)
  })
})

describe("StickySectionList", () => {
  it("sticks group headers and names an empty list", () => {
    const { rerender } = render(
      <StickySectionList
        label="Directorio"
        sections={[
          { id: "a", label: "A", items: [{ id: "ana", title: "Ana Solís", detail: "Horno" }] },
          { id: "b", label: "B", items: [] },
        ]}
        emptyLabel="Nadie"
      />,
    )
    expect(screen.getByRole("heading", { name: "A" }).className).toContain("sticky")
    expect(screen.getByText("Ana Solís")).toBeInTheDocument()
    expect(screen.getByText("Nadie")).toBeInTheDocument()
    rerender(<StickySectionList sections={[]} emptyLabel="Sin grupos" />)
    expect(screen.getByText("Sin grupos")).toBeInTheDocument()
  })
})

describe("parallax", () => {
  it("maps speed to a travel distance and holds still when motion is reduced", () => {
    expect(parallaxOffset(0)).toBe(0)
    expect(parallaxOffset(0.5, 64)).toBe(32)
    expect(parallaxOffset(Number.NaN)).toBe(0)
    setMotionPreference("reduce")
    render(
      <ParallaxLayers
        label="Costa"
        layers={[
          { id: "sky", speed: 0.2, decorative: true, children: <span>Cielo</span> },
          { id: "note", depth: 0.8, children: <span>Ficha</span> },
        ]}
      />,
    )
    const group = screen.getByRole("group", { name: "Costa" })
    expect(group).toHaveAttribute("data-motion", "static")
    expect(screen.getByText("Ficha")).toBeInTheDocument()
    expect(screen.getByText("Cielo").closest("[data-slot='parallax-layer']")).toHaveAttribute("aria-hidden", "true")
    expect(screen.getByText("Ficha").closest("[data-slot='parallax-layer']")).not.toHaveAttribute("aria-hidden")
  })
})

describe("horizontal rail", () => {
  it("sizes the sticky runway from the track overflow", () => {
    expect(railRunway(288, 1200, 320)).toEqual({ distance: 880, height: 1168 })
    expect(railRunway(200, 100, 320)).toEqual({ distance: 0, height: 200 })
    expect(railRunway(Number.NaN, 10, 10)).toEqual({ distance: 0, height: 0 })
    expect(railScrollOffset(0)).toEqual(["start start", "end end"])
    expect(railScrollOffset(192.4)).toEqual(["start start", "end 192px"])
  })

  it("falls back to a native scroller and moves focus into view", async () => {
    const user = userEvent.setup()
    const spy = vi.spyOn(Element.prototype, "scrollIntoView").mockImplementation(() => {})
    render(
      <HorizontalScrollRail label="Piezas">
        <button type="button">Cuenco</button>
        <button type="button">Jarra</button>
      </HorizontalScrollRail>,
    )
    const rail = screen.getByRole("region", { name: "Piezas" })
    expect(rail.closest("[data-slot='horizontal-scroll-rail']")).toHaveAttribute("data-mode", "native")
    expect(rail.className).toContain("snap-x")
    await user.tab()
    await user.tab()
    expect(spy).toHaveBeenCalled()
    spy.mockRestore()
  })

  it("pins when the viewport is wide and the track overflows", () => {
    const widths = vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(320)
    const heights = vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(288)
    const scrolls = vi.spyOn(HTMLElement.prototype, "scrollWidth", "get").mockReturnValue(1200)
    const matchMedia = vi.spyOn(window, "matchMedia").mockImplementation(
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
    render(
      <HorizontalScrollRail label="Piezas">
        <span>Cuenco</span>
        <span>Jarra</span>
      </HorizontalScrollRail>,
    )
    const root = document.querySelector("[data-slot='horizontal-scroll-rail']")
    expect(root).toHaveAttribute("data-mode", "pinned")
    const section = root?.querySelector("section")
    expect(section).toHaveStyle({ height: "1168px" })
    widths.mockRestore()
    heights.mockRestore()
    scrolls.mockRestore()
    matchMedia.mockRestore()
  })
})
