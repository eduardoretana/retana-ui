import { render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import { anchorNameFromReactId, measureIndicator } from "@/registry/hooks/use-magnetic-indicator"
import {
  MagneticBento,
  MagneticBentoCta,
  MagneticBentoItem,
  MagneticBentoTitle,
} from "@/registry/ui/magnetic-bento"

function Grid({
  active,
  defaultActive = "a",
  onActiveChange,
  persist,
}: {
  active?: string | null
  defaultActive?: string | null
  onActiveChange?: (value: string | null) => void
  persist?: boolean
}) {
  return (
    <MagneticBento label="Samples" active={active} defaultActive={defaultActive} onActiveChange={onActiveChange} persist={persist}>
      <MagneticBentoItem value="a" span={{ col: 2, row: 2 }} accent="chart-1">
        <MagneticBentoTitle>Alpha</MagneticBentoTitle>
        <MagneticBentoCta asChild>
          <a href="#a">Open alpha</a>
        </MagneticBentoCta>
      </MagneticBentoItem>
      <MagneticBentoItem value="b" accent="chart-2">
        <MagneticBentoTitle>Beta</MagneticBentoTitle>
        <MagneticBentoCta asChild>
          <a href="#b">Open beta</a>
        </MagneticBentoCta>
      </MagneticBentoItem>
    </MagneticBento>
  )
}

function card(name: string) {
  const node = screen.getByText(name).closest("article")
  if (!node) throw new Error(`Missing card ${name}`)
  return node
}

function rootOf(node: HTMLElement) {
  const root = node.closest("[data-slot='magnetic-bento']")
  if (!(root instanceof HTMLElement)) throw new Error("Missing grid")
  return root
}

function mockSupports(supported: boolean) {
  vi.spyOn(CSS, "supports").mockImplementation((property: string) => {
    if (String(property).includes("anchor-name")) return supported
    return false
  })
}

function domRect(x: number, y: number, width: number, height: number) {
  return {
    x,
    y,
    left: x,
    top: y,
    right: x + width,
    bottom: y + height,
    width,
    height,
    toJSON() {},
  } as DOMRect
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe("MagneticBento", () => {
  it("builds a unique dashed anchor name from a React id", () => {
    expect(anchorNameFromReactId(":r1:")).toBe("--mb-r1")
    expect(anchorNameFromReactId("a")).not.toBe(anchorNameFromReactId("b"))
  })

  it("measures a card against the grid", () => {
    const root = { getBoundingClientRect: () => domRect(10, 20, 400, 300) } as HTMLElement
    const item = { getBoundingClientRect: () => domRect(30, 50, 120, 80) } as HTMLElement
    expect(measureIndicator(root, item)).toEqual({ x: 20, y: 30, width: 120, height: 80 })
  })

  it("lights the hovered card and keeps it after the pointer leaves", async () => {
    const user = userEvent.setup()
    render(<Grid />)
    const beta = card("Beta")
    await user.hover(beta)
    expect(beta).toHaveAttribute("data-active", "true")
    await user.unhover(beta)
    expect(beta).toHaveAttribute("data-active", "true")
    expect(card("Alpha")).toHaveAttribute("data-active", "false")
  })

  it("clears the highlight when persist is off and the pointer leaves the grid", async () => {
    const user = userEvent.setup()
    render(<Grid persist={false} />)
    const beta = card("Beta")
    await user.hover(beta)
    expect(beta).toHaveAttribute("data-active", "true")
    await user.unhover(rootOf(beta))
    expect(beta).toHaveAttribute("data-active", "false")
  })

  it("moves the highlight to the focused card and with the arrow keys", async () => {
    const user = userEvent.setup()
    render(<Grid />)
    card("Alpha").focus()
    expect(card("Alpha")).toHaveAttribute("data-active", "true")
    await user.keyboard("{ArrowRight}")
    expect(card("Beta")).toHaveFocus()
    expect(card("Beta")).toHaveAttribute("data-active", "true")
  })

  it("activates a card on tap", async () => {
    const user = userEvent.setup()
    render(<Grid defaultActive={null} />)
    await user.click(card("Beta"))
    expect(card("Beta")).toHaveAttribute("data-active", "true")
  })

  it("reports changes in controlled mode and keeps the parent value", async () => {
    const user = userEvent.setup()
    const onActiveChange = vi.fn()
    render(<Grid active="a" onActiveChange={onActiveChange} />)
    await user.hover(card("Beta"))
    expect(onActiveChange).toHaveBeenCalledWith("b")
    expect(card("Alpha")).toHaveAttribute("data-active", "true")
  })

  it("gives each grid its own anchor name", () => {
    render(
      <>
        <Grid />
        <Grid />
      </>,
    )
    const roots = screen.getAllByRole("group", { name: "Samples" })
    const names = roots.map((node) => node.getAttribute("data-anchor"))
    expect(names[0]).toMatch(/^--mb-/)
    expect(names[1]).toMatch(/^--mb-/)
    expect(names[0]).not.toBe(names[1])
    expect(roots[0].querySelector("style")?.textContent).toContain(`position-anchor: ${names[0]}`)
    expect(roots[0].querySelector("style")?.textContent).toContain("inset: anchor(inside)")
    const firstAlpha = roots[0].querySelector("article")
    expect(firstAlpha?.style.getPropertyValue("anchor-name")).toBe(names[0])
  })

  it("positions the indicator from the card box when anchor positioning is missing", async () => {
    mockSupports(false)
    const boxes: Record<string, { x: number; y: number; w: number; h: number }> = {
      a: { x: 0, y: 0, w: 200, h: 160 },
      b: { x: 216, y: 0, w: 80, h: 80 },
    }
    const observed: { current: ResizeObserverCallback | null } = { current: null }
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function rect(this: HTMLElement) {
      if (this.dataset.slot === "magnetic-bento-grid") return domRect(0, 0, 400, 300)
      const value = this.dataset.value
      const box = value ? boxes[value] : undefined
      if (box) return domRect(box.x, box.y, box.w, box.h)
      return domRect(0, 0, 0, 0)
    })
    globalThis.ResizeObserver = class {
      constructor(callback: ResizeObserverCallback) {
        observed.current = callback
      }
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver

    const user = userEvent.setup()
    const { container } = render(<Grid />)
    const root = container.querySelector("[data-slot='magnetic-bento']")
    const indicator = container.querySelector("[data-slot='magnetic-bento-indicator']")
    expect(root).toHaveAttribute("data-indicator", "fallback")
    expect(indicator).toHaveStyle({ width: "200px", height: "160px", transform: "translate3d(0px, 0px, 0px)" })
    expect(card("Alpha").style.getPropertyValue("anchor-name")).toBe("")

    await user.hover(card("Beta"))
    expect(indicator).toHaveStyle({ width: "80px", height: "80px", transform: "translate3d(216px, 0px, 0px)" })
    expect(indicator?.getAttribute("style")).toContain("var(--mb-dur)")
    expect(container.querySelector("style")?.textContent).toContain("450ms")

    boxes.b = { x: 40, y: 90, w: 100, h: 48 }
    observed.current?.([], {} as ResizeObserver)
    expect(indicator).toHaveStyle({ width: "100px", height: "48px", transform: "translate3d(40px, 90px, 0px)" })
    expect(indicator?.getAttribute("style")).toContain("transition: none")
  })

  it("skips the stretch when the reader prefers reduced motion", async () => {
    mockSupports(false)
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function rect(this: HTMLElement) {
      if (this.dataset.slot === "magnetic-bento-grid") return domRect(0, 0, 400, 200)
      if (this.dataset.value === "b") return domRect(80, 0, 40, 40)
      return domRect(0, 0, 40, 40)
    })
    const original = window.matchMedia
    window.matchMedia = (query: string) =>
      ({
        matches: query.includes("prefers-reduced-motion"),
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }) as MediaQueryList

    try {
      const user = userEvent.setup()
      const { container } = render(<Grid />)
      expect(container.querySelector("[data-slot='magnetic-bento']")).toHaveAttribute("data-motion", "reduce")
      expect(container.querySelector("style")?.textContent).toContain("prefers-reduced-motion: reduce")
      await user.hover(card("Beta"))
      const indicator = container.querySelector("[data-slot='magnetic-bento-indicator']")
      expect(indicator?.getAttribute("style")).toContain("opacity 120ms linear")
      expect(indicator?.getAttribute("style") ?? "").not.toContain("450ms")
    } finally {
      window.matchMedia = original
    }
  })
})
