import { readFileSync } from "node:fs"
import path from "node:path"
import { act, cleanup, fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("maplibre-gl", () => import("./helpers/maplibre-mock"))

import { fake } from "./helpers/maplibre-mock"
import { MapBrowser } from "@/registry/blocks/map-browser"
import {
  boundsOf,
  mapBrowserLabelsEn,
  tokenColor,
  viewState,
  type MapCategory,
  type MapPlace,
  type MapProvider,
} from "@/registry/lib/map-browser"

const root = path.resolve(__dirname, "..")
const read = (file: string) => readFileSync(path.join(root, file), "utf8")

const categories: MapCategory[] = [
  { id: "office", label: "Oficina", tone: "chart-1" },
  { id: "depot", label: "Almacén", tone: "chart-2" },
]
const places: MapPlace[] = [
  { id: "alba", title: "Nodo Alba", subtitle: "Valle Norte", position: { lng: -99.1, lat: 19.4 }, category: "office" },
  { id: "brisa", title: "Nodo Brisa", subtitle: "Valle Sur", position: { lng: -99.2, lat: 19.3 }, category: "depot" },
  { id: "cima", title: "Nodo Cima", subtitle: "Loma Alta", position: { lng: -99.0, lat: 19.5 }, category: "office" },
]
const provider: MapProvider = {
  styles: { light: { version: 8, sources: {}, layers: [] } },
  attribution: "© Mapa de prueba",
}

function mount(props: Partial<Parameters<typeof MapBrowser>[0]> = {}) {
  return render(
    <MapBrowser places={places} total={places.length} provider={provider} categories={categories} {...props} />,
  )
}
const mapRoot = () => document.querySelector("[data-slot='geo-map']") as HTMLElement
const pin = (name: string) => screen.findByRole("button", { name })
const card = (title: string) =>
  within(screen.getByRole("list", { name: "Resultados" })).getByRole("button", { name: new RegExp(`^${title}`) })

beforeEach(() => fake.reset())
afterEach(() => cleanup())

describe("map-browser", () => {
  it("MB-VIEWSTATE: viewState separates loading, error, empty, nomatch and ready", () => {
    expect(viewState({ places, total: 3, status: "loading" })).toBe("loading")
    expect(viewState({ places, total: 3, status: "error" })).toBe("error")
    expect(viewState({ places: [], total: 0 })).toBe("empty")
    expect(viewState({ places: [], total: 9 })).toBe("nomatch")
    expect(viewState({ places, total: 3 })).toBe("ready")
  })

  it("MB-BOUNDS: boundsOf wraps every place and is null with none", () => {
    expect(boundsOf(places)).toEqual([[-99.2, 19.3], [-99.0, 19.5]])
    expect(boundsOf([])).toBeNull()
  })

  it("MB-STATES: each data state shows its es-MX copy and action", async () => {
    const onRetry = vi.fn()
    const onClearFilters = vi.fn()
    const { rerender } = mount({ status: "loading" })
    expect(screen.getAllByText("Cargando resultados").length).toBeGreaterThan(0)
    rerender(<MapBrowser places={[]} total={3} status="error" provider={provider} onRetry={onRetry} />)
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }))
    expect(onRetry).toHaveBeenCalledTimes(1)
    rerender(<MapBrowser places={[]} total={0} provider={provider} />)
    expect(screen.getByText("Aún no hay lugares.")).toBeTruthy()
    rerender(<MapBrowser places={[]} total={9} provider={provider} onClearFilters={onClearFilters} />)
    expect(screen.getByText("Ningún resultado con estos filtros.")).toBeTruthy()
    fireEvent.click(screen.getByRole("button", { name: "Limpiar filtros" }))
    expect(onClearFilters).toHaveBeenCalledTimes(1)
  })

  it("MB-IDLE: the map root reports data-map-state idle once the map settles", async () => {
    mount()
    await waitFor(() => expect(mapRoot().dataset.mapState).toBe("idle"))
  })

  it("MB-SYNC-HOVER: hover on a card lights its pin, and hover on a pin lights its card", async () => {
    mount()
    const alba = await pin("Nodo Alba, Oficina")
    fireEvent.pointerEnter(card("Nodo Brisa"))
    expect((await pin("Nodo Brisa, Almacén")).dataset.active).toBe("true")
    expect(alba.dataset.active).toBe("false")
    fireEvent.pointerEnter(alba)
    expect(card("Nodo Alba").dataset.active).toBe("true")
    expect(card("Nodo Brisa").dataset.active).toBe("false")
  })

  it("MB-SELECT: a pin click selects its card once", async () => {
    const onSelectedChange = vi.fn()
    mount({ onSelectedChange })
    fireEvent.click(await pin("Nodo Cima, Oficina"))
    expect(card("Nodo Cima").getAttribute("aria-current")).toBe("true")
    expect((await pin("Nodo Cima, Oficina")).dataset.selected).toBe("true")
    expect(onSelectedChange).toHaveBeenCalledTimes(1)
    expect(onSelectedChange).toHaveBeenCalledWith("cima")
  })

  it("MB-FILTER-COUNT: when the host filters, pins and cards stay equal", async () => {
    const { rerender } = mount()
    await pin("Nodo Alba, Oficina")
    rerender(<MapBrowser places={places.slice(0, 2)} total={3} provider={provider} categories={categories} />)
    await waitFor(() => expect(document.querySelectorAll("[data-slot='map-pin']")).toHaveLength(2))
    expect(document.querySelectorAll("[data-slot='map-browser-card']")).toHaveLength(2)
  })

  it("MB-CLUSTER: a native cluster renders as a named button that zooms in", async () => {
    mount({ cluster: true })
    await waitFor(() => expect(fake.last()?.sources.size).toBe(1))
    fake.clusters = [
      { type: "Feature", geometry: { type: "Point", coordinates: [-99.1, 19.4] }, properties: { cluster: true, cluster_id: 7, point_count: 12 } },
      { type: "Feature", geometry: { type: "Point", coordinates: [-99.0, 19.5] }, properties: { id: "cima" } },
    ]
    await act(async () => fake.last().emit("idle"))
    const bubble = await screen.findByRole("button", { name: "12 resultados, acercar" })
    fireEvent.click(bubble)
    await waitFor(() => {
      const ease = fake.last().calls.find((c) => c.name === "easeTo")
      expect((ease?.args[0] as { zoom: number }).zoom).toBe(9)
    })
    expect(fake.last().sources.get("map-browser-places")?.options.cluster).toBe(true)
  })

  it("MB-DETAIL: the selected place opens a side panel; Escape closes it and focus returns", async () => {
    mount()
    const origin = card("Nodo Brisa")
    origin.focus()
    fireEvent.click(origin)
    const panel = await screen.findByRole("complementary", { name: "Nodo Brisa" })
    expect(within(panel).getByText("Valle Sur")).toBeTruthy()
    fireEvent.keyDown(panel, { key: "Escape" })
    await waitFor(() => expect(screen.queryByRole("complementary", { name: "Nodo Brisa" })).toBeNull())
    await waitFor(() => expect(document.activeElement).toBe(card("Nodo Brisa")))
  })

  it("MB-ATTR: attribution is always visible and an empty one throws", async () => {
    mount()
    expect(screen.getByText("© Mapa de prueba")).toBeTruthy()
    await waitFor(() => expect(fake.last()?.options.attributionControl).toBe(false))
    const spy = vi.spyOn(console, "error").mockImplementation(() => {})
    expect(() => mount({ provider: { ...provider, attribution: "  " } })).toThrow(/attribution/)
    spy.mockRestore()
  })

  it("MB-PROVIDER: the worker comes from the host and registry code names no tile CDN", async () => {
    mount({ provider: { ...provider, workerUrl: "/vendor/maplibre-worker.mjs" } })
    await waitFor(() => expect(fake.workerUrl).toBe("/vendor/maplibre-worker.mjs"))
    for (const file of ["registry/blocks/map-browser.tsx", "registry/ui/geo-map.tsx", "registry/lib/map-browser.ts"]) {
      const source = read(file)
      expect(source).not.toMatch(/cartocdn|unpkg|maptiler|jsdelivr/)
      expect(source).not.toMatch(/maplibre-gl\.css/)
      expect(source).not.toMatch(/supercluster/)
    }
  })

  it("MB-KEYBOARD: pins are one tab stop, arrows follow list order, Enter selects", async () => {
    const onSelectedChange = vi.fn()
    mount({ onSelectedChange })
    const first = await pin("Nodo Alba, Oficina")
    const pins = Array.from(document.querySelectorAll<HTMLElement>("[data-slot='map-pin']"))
    expect(pins.filter((p) => p.tabIndex === 0)).toHaveLength(1)
    first.focus()
    fireEvent.keyDown(first, { key: "ArrowRight" })
    expect(document.activeElement).toBe(await pin("Nodo Brisa, Almacén"))
    fireEvent.keyDown(document.activeElement as HTMLElement, { key: "End" })
    expect(document.activeElement).toBe(await pin("Nodo Cima, Oficina"))
    fireEvent.click(document.activeElement as HTMLElement)
    expect(onSelectedChange).toHaveBeenCalledWith("cima")
  })

  it("MB-ANNOUNCE: a filter change is announced once as N resultados", async () => {
    const { rerender } = mount()
    rerender(<MapBrowser places={places.slice(0, 2)} total={3} provider={provider} categories={categories} />)
    const status = document.querySelector("[data-slot='map-browser-status']") as HTMLElement
    await waitFor(() => expect(status.textContent).toBe("2 resultados"))
    expect(status.getAttribute("role")).toBe("status")
  })

  it("MB-TOKENS: canvas colors are resolved from CSS tokens, not literals", async () => {
    const el = document.createElement("div")
    el.style.setProperty("--primary", "red")
    document.body.appendChild(el)
    expect(tokenColor("--primary", el)).toBeTruthy()
    const factory = vi.fn((token: (name: string) => string) => ({ version: 8 as const, sources: {}, layers: [], metadata: { bg: token("--background") } }))
    mount({ provider: { ...provider, styles: { light: factory } } })
    await waitFor(() => expect(factory).toHaveBeenCalled())
    expect(read("registry/ui/geo-map.tsx")).toMatch(/tokenColor\(/)
  })

  it("MB-REDUCED: with reduced motion the camera jumps", async () => {
    const original = window.matchMedia
    window.matchMedia = ((query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    })) as typeof window.matchMedia
    try {
      mount({ cluster: true })
      await waitFor(() => expect(fake.last()?.sources.size).toBe(1))
      fake.clusters = [
        { type: "Feature", geometry: { type: "Point", coordinates: [-99.1, 19.4] }, properties: { cluster: true, cluster_id: 3, point_count: 3 } },
      ]
      await act(async () => fake.last().emit("idle"))
      fireEvent.click(await screen.findByRole("button", { name: "3 resultados, acercar" }))
      await waitFor(() => {
        const ease = fake.last().calls.find((c) => c.name === "easeTo")
        expect((ease?.args[0] as { duration: number }).duration).toBe(0)
      })
    } finally {
      window.matchMedia = original
    }
  })

  it("MB-I18N: English labels replace every chrome string", async () => {
    mount({ labels: mapBrowserLabelsEn })
    expect(screen.getByText("3 results")).toBeTruthy()
    expect(screen.getByRole("region", { name: "Map" })).toBeTruthy()
    expect(screen.getByRole("button", { name: "Zoom in" })).toBeTruthy()
  })

  it("MB-MAP-ERROR: without WebGL the map says so and the list keeps working", async () => {
    fake.failConstructor = true
    mount()
    expect(await screen.findByText("No se pudo mostrar el mapa. La lista sigue disponible.")).toBeTruthy()
    expect(mapRoot().dataset.mapState).toBe("error")
    fireEvent.click(card("Nodo Alba"))
    expect(card("Nodo Alba").getAttribute("aria-current")).toBe("true")
  })

  it("MB-PLP: registry entry, scenes, notice and docs are in place", () => {
    type Item = { name: string; dependencies: string[]; docs: string; meta: { scenes: Array<{ id: string }> } }
    const registry = JSON.parse(read("registry.json")) as { items: Item[] }
    const item = registry.items.find((i) => i.name === "map-browser")
    expect(item).toBeTruthy()
    const ids = item!.meta.scenes.map((s) => s.id)
    for (const id of ["filled", "empty", "loading", "error", "nomatch", "map-error", "cluster", "selected", "hover"]) {
      expect(ids).toContain(id)
    }
    expect(item!.dependencies).toContain("maplibre-gl@6.18.0")
    expect(item!.docs).toMatch(/PropXYZ: referencia clean-room, no se copió código ni assets/)
    expect(item!.docs).toMatch(/MapCN/)
    const notice = read("NOTICE")
    expect(notice).toMatch(/MIT License · Copyright \(c\) 2025 Anmoldeep Singh/)
    expect(notice).toMatch(/Copyright \(c\) 2023, MapLibre contributors/)
    expect(notice).toMatch(/BSD-3-Clause/)
  })
})
