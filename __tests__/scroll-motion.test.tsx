import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { Demo as Animations } from "@/app/examples/animations/demo"
import { clampUnit, readingPercent } from "@/registry/hooks/use-scroll-progress"
import { railRunway, railScrollOffset, HorizontalScrollRail } from "@/registry/ui/horizontal-scroll-rail"
import { parallaxDriver, PARALLAX_CSS, parallaxOffset, ParallaxLayers } from "@/registry/ui/parallax-layers"
import { RevealOnScroll } from "@/registry/ui/reveal-on-scroll"
import { SCROLL_PROGRESS_CSS, scrollProgressDriver, scrollProgressTimeline, ScrollProgress } from "@/registry/ui/scroll-progress"
import { ScrollSnapPanel, ScrollSnapRail } from "@/registry/ui/scroll-snap-rail"
import { StaggerItem, StaggerReveal } from "@/registry/ui/stagger-reveal"
import { StickySectionList } from "@/registry/ui/sticky-section-list"
import { setMotionPreference } from "@/registry/ui/motion-preference"

afterEach(() => {
  setMotionPreference("system")
  vi.restoreAllMocks()
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
    expect(document.querySelector("[data-slot='scroll-progress-bar']")).toHaveAttribute("data-driver", "hook")
  })

  it("keeps the hook as the accessible value and the fallback without scroll timelines", () => {
    expect(scrollProgressTimeline(false)).toBe("scroll(root)")
    expect(scrollProgressTimeline(true)).toBe("scroll(nearest)")
    expect(SCROLL_PROGRESS_CSS).toContain("animation-timeline: var(--scroll-progress-timeline, scroll(root))")
    expect(SCROLL_PROGRESS_CSS).toContain("scaleX(0)")
    expect(SCROLL_PROGRESS_CSS).toContain("scaleX(1)")
    expect(scrollProgressDriver({ reduced: false, supported: false, overflow: 400, axis: "y", hasTarget: false, hasOffset: false })).toBe("hook")
    expect(scrollProgressDriver({ reduced: true, supported: true, overflow: 400, axis: "y", hasTarget: false, hasOffset: false })).toBe("reduced")
    expect(scrollProgressDriver({ reduced: false, supported: true, overflow: 0, axis: "y", hasTarget: false, hasOffset: false })).toBe("hook")
    expect(scrollProgressDriver({ reduced: false, supported: true, overflow: 400, axis: "y", hasTarget: false, hasOffset: false })).toBe("css")
    vi.spyOn(CSS, "supports").mockReturnValue(false)
    render(<ScrollProgress label="Lectura" />)
    expect(screen.getByRole("progressbar", { name: "Lectura" })).toHaveAttribute("aria-valuenow", "0")
    expect(document.querySelector("[data-slot='scroll-progress-bar']")).toHaveAttribute("data-driver", "hook")
    vi.restoreAllMocks()
  })

  it("drives scaleX from scroll(root) when the timeline is supported and the page overflows", () => {
    vi.spyOn(CSS, "supports").mockImplementation((property: string, value?: string) => {
      return property === "animation-timeline" && String(value).includes("scroll")
    })
    const root = document.documentElement
    vi.spyOn(root, "clientHeight", "get").mockReturnValue(200)
    vi.spyOn(root, "scrollHeight", "get").mockReturnValue(800)
    Object.defineProperty(document, "scrollingElement", { configurable: true, get: () => root })
    render(<ScrollProgress label="Lectura" />)
    const bar = document.querySelector("[data-slot='scroll-progress-bar']") as HTMLElement
    expect(bar).toHaveAttribute("data-driver", "css")
    expect(bar.style.getPropertyValue("--scroll-progress-timeline")).toBe("scroll(root)")
    expect(screen.getByRole("progressbar", { name: "Lectura" })).toHaveAttribute("aria-valuenow", "0")
    Reflect.deleteProperty(document, "scrollingElement")
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
  it("uses a view timeline when the browser supports it and the hook otherwise", () => {
    expect(parallaxDriver(true, true)).toBe("static")
    expect(parallaxDriver(false, false)).toBe("hook")
    expect(parallaxDriver(false, true)).toBe("css")
    expect(PARALLAX_CSS).toContain("animation-timeline: view()")
    expect(PARALLAX_CSS).toContain("translateY")
    vi.spyOn(CSS, "supports").mockReturnValue(false)
    const { unmount } = render(
      <ParallaxLayers label="Costa" layers={[{ id: "note", speed: 0.4, children: <span>Ficha</span> }]} />,
    )
    expect(screen.getByText("Ficha").closest("[data-slot='parallax-layer']")).toHaveAttribute("data-driver", "hook")
    unmount()
    vi.spyOn(CSS, "supports").mockImplementation((property: string, value?: string) => {
      return property === "animation-timeline" && String(value).includes("view")
    })
    render(
      <ParallaxLayers label="Costa" layers={[{ id: "note", speed: 0.4, children: <span>Ficha</span> }]} />,
    )
    const layer = screen.getByText("Ficha").closest("[data-slot='parallax-layer']") as HTMLElement
    expect(layer).toHaveAttribute("data-driver", "css")
    expect(layer.style.getPropertyValue("--parallax-from")).toBe("25.6px")
    vi.restoreAllMocks()
  })

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

describe("animation glossary", () => {
  it("names the ten scroll terms", () => {
    render(<Animations />)
    for (const term of [
      "Scroll-triggered",
      "Scroll-linked",
      "Parallax",
      "Sticky",
      "Pin",
      "Scroll snap",
      "Horizontal scroll",
      "Stagger",
      "Text reveal",
      "Progress bar",
    ]) {
      expect(screen.getByText(term)).toBeInTheDocument()
    }
  })
})
