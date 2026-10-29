import { describe, expect, it } from "vitest"

import { formatChartCurrency, formatChartNumber, formatChartPercent, formatChartUnit, resolveChartLocale } from "@/registry/lib/chart-format"
import { flowRoute, layoutFlow } from "@/registry/lib/flow-layout"
import { extentWithZero, wedgePath } from "@/registry/lib/chart-geom"
import { hexBounds, hexPolygon } from "@/registry/lib/hex-layout"
import { seriesColor, seriesMark } from "@/registry/lib/chart-series"

describe("chart format", () => {
  it("resolves es-MX and en-US and formats both", () => {
    expect(resolveChartLocale("es")).toBe("es-MX")
    expect(resolveChartLocale("en")).toBe("en-US")
    expect(formatChartNumber(1234.5, "es-MX")).toBe("1,234.5")
    expect(formatChartNumber(1234.5, "en-US")).toBe("1,234.5")
    expect(formatChartPercent(0.1, "es-MX")).toBe("10%")
    expect(formatChartCurrency(2100, "en-US", "USD")).toContain("2,100")
    expect(formatChartUnit(2, { id: "lb", label: "lb", suffix: "lb", scale: 2 }, "en-US")).toBe("4 lb")
  })
})

describe("chart geometry", () => {
  it("keeps zero in the domain and draws six hex corners", () => {
    expect(extentWithZero([-2, 4])).toMatchObject({ min: expect.any(Number), max: expect.any(Number) })
    expect(extentWithZero([-2, 4]).min).toBeLessThan(0)
    expect(extentWithZero([]).max).toBe(1)
    expect(hexPolygon(0, 0, 10).split(" ").length).toBe(6)
    expect(hexBounds([{ q: 0, r: 0 }, { q: 1, r: -1 }], 10).width).toBeGreaterThan(0)
    expect(wedgePath(0, 0, 10, 20, 0, Math.PI / 2)).toContain("A")
    expect(seriesColor(5)).toBe("var(--chart-1)")
    expect(seriesMark(3)).toBe(3)
  })
})

describe("flow layout", () => {
  const nodes = [
    { id: "cistern", label: "Cistern", column: 0 },
    { id: "rain", label: "Rain", column: 0 },
    { id: "beds", label: "Beds", column: 1 },
    { id: "pots", label: "Pots", column: 1 },
    { id: "harvest", label: "Harvest", column: 2 },
  ]
  const links = [
    { id: "c-b", source: "cistern", target: "beds", value: 80 },
    { id: "c-p", source: "cistern", target: "pots", value: 24 },
    { id: "r-b", source: "rain", target: "beds", value: 36 },
    { id: "b-h", source: "beds", target: "harvest", value: 90 },
    { id: "p-h", source: "pots", target: "harvest", value: 18 },
    { id: "drop", source: "rain", target: "pots", value: -5 },
  ]

  it("draws ribbons and keeps the directed route through a node", () => {
    const layout = layoutFlow(nodes, links, 320, 200)
    expect(layout.nodes).toHaveLength(5)
    expect(layout.links.find((link) => link.id === "drop")).toBeUndefined()
    expect(layout.links[0]?.path.startsWith("M")).toBe(true)
    const route = flowRoute("beds", links)
    expect(route.nodes.has("harvest")).toBe(true)
    expect(route.nodes.has("cistern")).toBe(true)
    expect(route.nodes.has("pots")).toBe(false)
  })
})
