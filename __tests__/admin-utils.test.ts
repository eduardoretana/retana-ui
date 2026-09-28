import { describe, expect, it } from "vitest"

import { summarizeAnalytics, sumDaily } from "@/registry/lib/analytics-summary"
import { escapeCsvCell, toCsv } from "@/registry/lib/csv"
import { inRange, presetBounds, resolveRange } from "@/registry/lib/date-range"
import { formatPercentDelta, percentDelta } from "@/registry/lib/format"
import {
  destinationIndex,
  keepPosition,
  moveItem,
  reorderRows,
  reorderVisible,
} from "@/registry/lib/reorder"
import { slugify, uniqueSlug } from "@/registry/lib/slug"
import type { AnalyticsView } from "@/registry/lib/admin-types"

const NOW = Date.UTC(2026, 8, 27, 15, 0, 0)

describe("slugify", () => {
  it("strips accents and punctuation", () => {
    expect(slugify("  Diseño de producto! ")).toBe("diseno-de-producto")
  })

  it("adds a numeric suffix until the slug is free", () => {
    expect(uniqueSlug("Norte", ["norte", "norte-2"], "norte")).toBe("norte")
    expect(uniqueSlug("Norte", ["norte", "norte-2"])).toBe("norte-3")
    expect(uniqueSlug("   ", [])).toBe("item")
  })
})

describe("reorder", () => {
  it("moves an item and ignores indexes outside the list", () => {
    expect(moveItem(["a", "b", "c"], 0, 2)).toEqual(["b", "c", "a"])
    expect(moveItem(["a", "b"], 0, 5)).toEqual(["a", "b"])
  })

  it("maps move buttons onto indexes", () => {
    expect(destinationIndex(2, 5, "up")).toBe(1)
    expect(destinationIndex(2, 5, "down")).toBe(3)
    expect(destinationIndex(2, 5, "top")).toBe(0)
    expect(destinationIndex(2, 5, "bottom")).toBe(4)
    expect(destinationIndex(2, 5, 99)).toBe(4)
  })

  it("reorders only the visible subset and keeps hidden slots", () => {
    const next = reorderVisible(
      ["hidden-a", "vis-1", "hidden-b", "vis-2", "vis-3"],
      ["vis-1", "vis-2", "vis-3"],
      "vis-3",
      "vis-1",
    )
    expect(next).toEqual(["hidden-a", "vis-3", "hidden-b", "vis-1", "vis-2"])
  })

  it("rewrites positions from the id list and appends missing rows", () => {
    const rows = [
      { id: "a", position: 0 },
      { id: "b", position: 1 },
      { id: "c", position: 2 },
    ]
    expect(reorderRows(rows, ["c", "a"]).map((row) => [row.id, row.position])).toEqual([
      ["c", 0],
      ["a", 1],
      ["b", 2],
    ])
  })

  it("keeps the stored position when an existing row is saved", () => {
    expect(keepPosition({ position: 4 }, { position: 0, title: "Norte" })).toEqual({
      position: 4,
      title: "Norte",
    })
    expect(keepPosition(undefined, { position: 9 })).toEqual({ position: 9 })
  })
})

describe("csv", () => {
  it("quotes cells that contain commas, quotes, or newlines", () => {
    expect(escapeCsvCell(null)).toBe("")
    expect(escapeCsvCell('dice "hola",\nfin')).toBe('"dice ""hola"",\nfin"')
    expect(escapeCsvCell("=1+1")).toBe(`"'=1+1"`)
    expect(escapeCsvCell(-12)).toBe("-12")
    expect(
      toCsv(
        [{ name: "Lucía", note: "a, b" }],
        [
          { key: "name", header: "Nombre" },
          { key: "note", header: "Nota" },
        ],
      ),
    ).toBe("Nombre,Nota\nLucía,\"a, b\"")
  })
})

describe("date range", () => {
  it("resolves the last 7 UTC days ending now", () => {
    const range = resolveRange("7d", NOW, "UTC")
    expect(range.from).toBe(Date.UTC(2026, 8, 21))
    expect(range.to).toBe(NOW)
    expect(range.bucket).toBe("day")
    expect(inRange(range.from, range.from, range.to)).toBe(true)
    expect(inRange(range.from - 1, range.from, range.to)).toBe(false)
  })

  it("returns half-open preset bounds", () => {
    expect(presetBounds("today", NOW, "UTC")).toEqual([
      Date.UTC(2026, 8, 27),
      Date.UTC(2026, 8, 28),
    ])
    expect(presetBounds("any", NOW)).toBeNull()
  })

  it("keeps Madrid day bounds across DST", () => {
    const zone = "Europe/Madrid"
    const format = (ts: number) =>
      new Intl.DateTimeFormat("en-CA", {
        timeZone: zone,
        hourCycle: "h23",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }).format(new Date(ts))

    for (const noon of ["2026-10-25T10:00:00.000Z", "2026-03-29T10:00:00.000Z"]) {
      const now = Date.parse(noon)
      const bounds = presetBounds("today", now, zone)
      expect(bounds).not.toBeNull()
      const [from, to] = bounds ?? [0, 0]
      expect(format(from)).toMatch(/00:00:00$/)
      expect(format(to)).toMatch(/00:00:00$/)
      expect(format(to - 1).slice(0, 10)).toBe(format(from).slice(0, 10))
      expect(format(to).slice(0, 10)).not.toBe(format(from).slice(0, 10))
      const week = resolveRange("7d", now, zone)
      expect(format(week.from)).toMatch(/00:00:00$/)
    }
  })
})

describe("analytics summary", () => {
  it("counts visitors, a pricing funnel step, and scroll ratios", () => {
    const view = (patch: Partial<AnalyticsView>): AnalyticsView => ({
      ts: NOW,
      visitor: "v1",
      session: "s1",
      path: "/",
      referrer: null,
      device: "desktop",
      durationMs: 1000,
      scrollPct: 10,
      ...patch,
    })
    const snap = summarizeAnalytics(
      [
        view({ visitor: "v1", session: "s1", path: "/", scrollPct: 100, referrer: "https://www.example.test/a" }),
        view({
          visitor: "v1",
          session: "s1",
          path: "/planes",
          scrollPct: 40,
          referrer: "https://www.example.test/a",
        }),
        view({ visitor: "v2", session: "s2", path: "/", scrollPct: 80, ts: NOW - 86_400_000 }),
      ],
      [{ ts: NOW, session: "s1", path: "/", label: "Reservar", target: null }],
      Date.UTC(2026, 8, 26),
      NOW,
    )
    expect(sumDaily(snap.daily)).toEqual({ visitors: 2, views: 3, clicks: 1 })
    expect(snap.sources[0]).toEqual({ label: "example.test", value: 2 })
    expect(snap.funnel).toEqual([
      { label: "Sesiones", value: 2 },
      { label: "Vieron precios", value: 1 },
      { label: "Hicieron clic", value: 1 },
    ])
    expect(snap.scroll.find((mark) => mark.label === "100%")?.value).toBeCloseTo(1 / 3)
    expect(snap.heat).toHaveLength(7)
    expect(snap.heat[0]).toHaveLength(24)
  })
})

describe("percent delta", () => {
  it("returns null when the previous value is zero and the current is not", () => {
    expect(percentDelta(4, 0)).toBeNull()
    expect(percentDelta(0, 0)).toBe(0)
    expect(formatPercentDelta(0.125)).toBe("+13%")
    expect(formatPercentDelta(null)).toBe("—")
  })
})
