// Regressions found in the 2026-11-13 captures (harness 21db9481) on 07e04e4.
import { cleanup, render, screen, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("maplibre-gl", () => import("./helpers/maplibre-mock"))

import { fake } from "./helpers/maplibre-mock"
import { MapBrowser } from "@/registry/blocks/map-browser"
import type { MapCategory, MapPlace, MapProvider } from "@/registry/lib/map-browser"

const categories: MapCategory[] = [{ id: "office", label: "Oficina", tone: "chart-1" }]
const places: MapPlace[] = [
  { id: "alba", title: "Nodo Alba", position: { lng: -99.1, lat: 19.4 }, category: "office" },
  { id: "brisa", title: "Nodo Brisa", position: { lng: -99.2, lat: 19.3 }, category: "office" },
]
const provider: MapProvider = { styles: { light: { version: 8, sources: {}, layers: [] } }, attribution: "© Mapa de prueba" }

beforeEach(() => fake.reset())
afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe("map-browser capture fixes", () => {
  it("MB-SCROLL-LOCAL: the selected card scrolls inside the list, never the page", () => {
    const intoView = vi.spyOn(Element.prototype, "scrollIntoView")
    const scrollBy = vi.fn()
    vi.spyOn(HTMLElement.prototype, "getBoundingClientRect").mockImplementation(function (this: HTMLElement) {
      if (this.hasAttribute("data-map-browser-scroll")) return DOMRect.fromRect({ x: 0, y: 100, width: 300, height: 200 })
      if (this.dataset.placeId === "brisa" && this.tagName === "BUTTON" && this.closest("[data-map-browser-scroll]"))
        return DOMRect.fromRect({ x: 0, y: 360, width: 300, height: 80 })
      return DOMRect.fromRect({ x: 0, y: 0, width: 0, height: 0 })
    })
    HTMLElement.prototype.scrollBy = scrollBy as unknown as HTMLElement["scrollBy"]
    render(<MapBrowser places={places} total={2} provider={provider} categories={categories} defaultSelectedId="brisa" />)
    const list = screen.getByRole("list", { name: "Resultados" })
    expect(list.closest("[data-map-browser-scroll]")).toBeTruthy()
    expect(intoView).not.toHaveBeenCalled()
    expect(scrollBy).toHaveBeenCalledWith(expect.objectContaining({ top: 140 }))
  })

  it("MB-PIN-CONTRAST: active and selected pins use the foreground ring, not the low-contrast ring token", async () => {
    render(<MapBrowser places={places} total={2} provider={provider} categories={categories} />)
    const pins = await screen.findAllByRole("button", { name: /Nodo (Alba|Brisa), Oficina/ })
    const mapPin = pins.find((p) => p.dataset.slot === "map-pin")!
    expect(mapPin.className).toContain("data-[active=true]:ring-foreground")
    expect(mapPin.className).toContain("data-[selected=true]:ring-foreground")
    expect(mapPin.className).not.toMatch(/data-\[(active|selected)=true\]:ring-ring(\s|$)/)
    expect(within(document.body).queryAllByRole("button").length).toBeGreaterThan(0)
  })
})
