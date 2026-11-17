// F-001 (round-1, RUI-CONTRAST-001): text on the active/hover card must reach 4.5:1
// against the card background, computed from the theme token values in app/globals.css.
import { readFileSync } from "node:fs"
import path from "node:path"
import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

vi.mock("maplibre-gl", () => import("./helpers/maplibre-mock"))

import { fake } from "./helpers/maplibre-mock"
import { MapBrowser } from "@/registry/blocks/map-browser"
import type { MapCategory, MapPlace, MapProvider } from "@/registry/lib/map-browser"

const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8")

function block(selector: string) {
  const start = css.indexOf(`${selector} {`)
  if (start < 0) throw new Error(`no ${selector} block in globals.css`)
  return css.slice(start, css.indexOf("}", start))
}

function tokens(selector: string) {
  const out: Record<string, string> = {}
  for (const m of block(selector).matchAll(/--([\w-]+):\s*([^;]+);/g)) out[m[1]] = m[2].trim()
  return out
}

// oklch -> linear sRGB (Björn Ottosson), then WCAG relative luminance.
function luminance(value: string) {
  const m = value.match(/^oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)$/)
  if (!m) throw new Error(`unsupported color ${value}`)
  const [L, C, h] = [Number(m[1]), Number(m[2]), (Number(m[3]) * Math.PI) / 180]
  const a = C * Math.cos(h)
  const b = C * Math.sin(h)
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mm = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const r = 4.0767416621 * l - 3.3077115913 * mm + 0.2309699292 * s
  const g = -1.2684380046 * l + 2.6097574011 * mm - 0.3413193965 * s
  const bl = -0.0041960863 * l - 0.7034186147 * mm + 1.707614701 * s
  // 8-bit sRGB round-trip, like the rendered pixel the auditor measured.
  const lin = (c: number) => {
    const clamped = Math.min(1, Math.max(0, c))
    const srgb = Math.round((clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055) * 255) / 255
    return srgb <= 0.04045 ? srgb / 12.92 : ((srgb + 0.055) / 1.055) ** 2.4
  }
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(bl)
}

function ratio(fg: string, bg: string) {
  const [a, b] = [luminance(fg), luminance(bg)].sort((x, y) => y - x)
  return (a + 0.05) / (b + 0.05)
}

// Text token that wins on an element in the given card state, reading Tailwind classes.
function textToken(el: Element, state: "hover" | "active") {
  const variant = state === "hover" ? /(?:^|\s)group-hover\/card:text-([\w-]+)/ : /(?:^|\s)group-data-\[active=true\]\/card:text-([\w-]+)/
  for (let node: Element | null = el; node && node.getAttribute("data-slot") !== "map-browser-card"; node = node.parentElement) {
    const cls = node.getAttribute("class") ?? ""
    const override = cls.match(variant)
    if (override) return override[1]
    const base = cls.match(/(?:^|\s)text-(foreground|muted-foreground|primary|accent-foreground|card-foreground)(?=\s|$)/)
    if (base) return base[1]
  }
  return "foreground"
}

function cardBackground(card: Element, state: "hover" | "active") {
  const cls = card.getAttribute("class") ?? ""
  const m = cls.match(state === "hover" ? /(?:^|\s)hover:bg-([\w-]+)/ : /(?:^|\s)data-\[active=true\]:bg-([\w-]+)/)
  return m ? m[1] : "background"
}

const categories: MapCategory[] = [{ id: "office", label: "Oficina", tone: "chart-1" }]
const places: MapPlace[] = [
  { id: "alba", title: "Nodo Alba", subtitle: "Calle Uno 12", position: { lng: -99.1, lat: 19.4 }, category: "office" },
  { id: "brisa", title: "Nodo Brisa", subtitle: "Calle Dos 34", position: { lng: -99.2, lat: 19.3 }, category: "office" },
]
const provider: MapProvider = { styles: { light: { version: 8, sources: {}, layers: [] } }, attribution: "© Mapa de prueba" }

beforeEach(() => fake.reset())
afterEach(() => cleanup())

describe("map-browser card contrast (F-001, RUI-CONTRAST-001)", () => {
  it("MB-CARD-CONTRAST: helper reproduces the auditor's light measurement (muted-foreground on accent ≈ 4.35:1)", () => {
    const light = tokens(":root")
    expect(ratio(light["muted-foreground"], light.accent)).toBeCloseTo(4.35, 1)
  })

  for (const mode of [":root", ".dark"] as const) {
    for (const state of ["hover", "active"] as const) {
      it(`MB-CARD-CONTRAST: every text on the ${state} card reaches 4.5:1 in ${mode === ":root" ? "light" : "dark"}`, () => {
        const theme = tokens(mode)
        render(<MapBrowser places={places} total={2} provider={provider} categories={categories} />)
        const card = screen.getByText("Calle Uno 12").closest("[data-slot=map-browser-card]")!
        fireEvent.pointerEnter(card)
        expect(card.getAttribute("data-active")).toBe("true")
        const bg = cardBackground(card, state)
        const texts = [...card.querySelectorAll("span")].filter((s) => [...s.childNodes].some((n) => n.nodeType === 3 && n.textContent!.trim()))
        expect(texts.map((t) => t.textContent)).toEqual(expect.arrayContaining(["Nodo Alba", "Calle Uno 12", "Oficina"]))
        for (const t of texts) {
          const fg = textToken(t, state)
          const r = ratio(theme[fg], theme[bg])
          expect(r, `${t.textContent}: ${fg} on ${bg} = ${r.toFixed(2)}`).toBeGreaterThanOrEqual(4.5)
        }
      })
    }
  }
})
