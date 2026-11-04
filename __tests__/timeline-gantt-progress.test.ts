import { readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it, vi } from "vitest"

import {
  GANTT_PROGRESS_PAINT,
  applyGanttTaskPatch,
  dependencyElbow,
  ganttSpanDays,
  parseGanttProgress,
  workstreamProgress,
  type GanttItem,
} from "@/registry/lib/timeline-gantt"

const root = path.resolve(import.meta.dirname, "..")

describe("parseGanttProgress", () => {
  it("reads a fraction and clamps anything outside 0–1", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(parseGanttProgress(0)).toBe(0)
    expect(parseGanttProgress(0.5)).toBe(0.5)
    expect(parseGanttProgress(1)).toBe(1)
    expect(parseGanttProgress(0.01)).toBeCloseTo(0.01)
    expect(parseGanttProgress(-4)).toBe(0)
    expect(parseGanttProgress(50)).toBe(1)
    expect(parseGanttProgress(1.5)).toBe(1)
    expect(warn).toHaveBeenCalledTimes(2)
    expect(warn.mock.calls[0]?.[0]).toEqual(expect.stringContaining("outside 0–1"))
    warn.mockRestore()
  })

  it("does not warn for a fraction inside the range", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {})
    expect(parseGanttProgress(0.5)).toBe(0.5)
    expect(warn).not.toHaveBeenCalled()
    warn.mockRestore()
  })

  it("treats non-finite values as missing, not as zero", () => {
    expect(parseGanttProgress(Number.NaN)).toBeNull()
    expect(parseGanttProgress(Number.POSITIVE_INFINITY)).toBeNull()
    expect(parseGanttProgress(undefined)).toBeNull()
    expect(parseGanttProgress("40")).toBeNull()
  })
})

describe("ganttSpanDays", () => {
  it("counts a one-day task as one inclusive day", () => {
    expect(ganttSpanDays("2026-10-20", "2026-10-20")).toBe(1)
    expect(ganttSpanDays("2026-10-20", "2026-10-24")).toBe(5)
  })

  it("treats an inverted range as a zero-duration milestone", () => {
    expect(ganttSpanDays("2026-10-24", "2026-10-20")).toBe(0)
    expect(ganttSpanDays("2026-02-31", "2026-03-01")).toBeNull()
  })
})

describe("workstreamProgress", () => {
  it("returns null for an empty group", () => {
    expect(workstreamProgress([])).toEqual({ ratio: null, percent: null, weightDays: 0, omitted: 0, milestones: 0 })
  })

  it("weights by inclusive duration and leaves out tasks with no progress", () => {
    const result = workstreamProgress([
      { start: "2026-10-01", end: "2026-10-05", progress: 0 },
      { start: "2026-10-06", end: "2026-10-10", progress: 1 },
      { start: "2026-10-11", end: "2026-10-15" },
    ])
    expect(result.ratio).toBeCloseTo(0.5)
    expect(result.percent).toBe(50)
    expect(result.weightDays).toBe(10)
    expect(result.omitted).toBe(1)
    expect(result.milestones).toBe(0)
  })

  it("does not let a zero-duration milestone move the ratio", () => {
    const result = workstreamProgress([
      { start: "2026-10-01", end: "2026-10-04", progress: 0.5 },
      { start: "2026-10-08", end: "2026-10-08", progress: 1, milestone: true },
      { start: "2026-10-20", end: "2026-10-01", progress: 1 },
    ])
    expect(result.ratio).toBeCloseTo(0.5)
    expect(result.weightDays).toBe(4)
    expect(result.milestones).toBe(2)
  })

  it("stays null when every task is a milestone or has no progress", () => {
    expect(workstreamProgress([{ start: "2026-10-01", end: "2026-10-01", progress: 1, milestone: true }]).ratio).toBeNull()
    expect(workstreamProgress([{ start: "2026-10-01", end: "2026-10-03" }]).ratio).toBeNull()
  })

  it("counts a one-day task", () => {
    const result = workstreamProgress([{ start: "2026-10-20", end: "2026-10-20", progress: 0.4 }])
    expect(result.ratio).toBeCloseTo(0.4)
    expect(result.weightDays).toBe(1)
  })
})

describe("dependencyElbow", () => {
  it("routes through the row boundary instead of a curve", () => {
    const path = dependencyElbow({ x: 10, width: 40, y: 0 }, { x: 90, y: 40 }, 40)
    expect(path.d).not.toMatch(/\bC\b/)
    expect(path.d).toContain("H ")
    expect(path.d).toContain("V ")
    expect(path.y).toBe(60)
  })
})

describe("applyGanttTaskPatch", () => {
  const items: GanttItem[] = [
    { id: "a", workstream: "impresion", label: "Catálogo", start: "2026-10-01", end: "2026-10-04", status: "active", progress: 0.2 },
  ]

  it("merges a patch and can clear progress", () => {
    const next = applyGanttTaskPatch(items, "a", { label: "Catálogo nuevo", progress: 0.8, status: "done" })
    expect(next[0]).toMatchObject({ label: "Catálogo nuevo", progress: 0.8, status: "done", start: "2026-10-01" })
    const cleared = applyGanttTaskPatch(next, "a", { progress: null })
    expect(cleared[0]?.progress).toBeUndefined()
  })
})

describe("progress contrast", () => {
  const css = readFileSync(path.join(root, "app/globals.css"), "utf8")
  const source = readFileSync(path.join(root, "registry/ui/timeline-gantt.tsx"), "utf8")

  it("paints the fill and the track with the documented theme tokens", () => {
    expect(source).toContain("bg-foreground")
    expect(source).toContain("bg-muted")
    expect(source).toContain("border-foreground")
    expect(source).toContain("origin-left")
    expect(source).toContain("scaleX")
    expect(source).not.toContain("transition-all")
    expect(GANTT_PROGRESS_PAINT).toEqual({ fill: "foreground", track: "muted", surface: "background", edge: "foreground" })
  })

  it("keeps fill against track and fill against the surface at 3:1 in light and dark", () => {
    const light = ruleTokens(css, ":root")
    const dark = ruleTokens(css, ".dark")
    for (const [mode, tokens] of [
      ["light", light],
      ["dark", dark],
    ] as const) {
      const surface = parseOklch(required(tokens, GANTT_PROGRESS_PAINT.surface)).rgb
      const track = composite(parseOklch(required(tokens, GANTT_PROGRESS_PAINT.track)), surface)
      const fill = composite(parseOklch(required(tokens, GANTT_PROGRESS_PAINT.fill)), surface)
      const edge = composite(parseOklch(required(tokens, GANTT_PROGRESS_PAINT.edge)), surface)
      const fillTrack = contrast(fill, track)
      const fillSurface = contrast(fill, surface)
      const edgeSurface = contrast(edge, surface)
      expect(fillTrack, `${mode} fill/track ${fillTrack.toFixed(2)}`).toBeGreaterThanOrEqual(3)
      expect(fillSurface, `${mode} fill/surface ${fillSurface.toFixed(2)}`).toBeGreaterThanOrEqual(3)
      expect(edgeSurface, `${mode} edge/surface ${edgeSurface.toFixed(2)}`).toBeGreaterThanOrEqual(3)
    }
  })
})

function required(tokens: Record<string, string>, name: string) {
  const value = tokens[name]
  if (!value) throw new Error(`missing --${name}`)
  return value
}

function ruleTokens(css: string, selector: string) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const start = new RegExp(`(?:^|\\n)${escaped}\\s*\\{`).exec(css)
  if (!start || start.index == null) throw new Error(`missing ${selector}`)
  const open = css.indexOf("{", start.index)
  let depth = 0
  let end = open
  for (let index = open; index < css.length; index += 1) {
    if (css[index] === "{") depth += 1
    else if (css[index] === "}") {
      depth -= 1
      if (depth === 0) {
        end = index
        break
      }
    }
  }
  const body = css.slice(open + 1, end)
  const tokens: Record<string, string> = {}
  for (const match of body.matchAll(/--([a-z0-9-]+)\s*:\s*([^;]+);/g)) {
    tokens[match[1]!] = match[2]!.trim()
  }
  return tokens
}

type Rgb = [number, number, number]

function parseOklch(value: string): { rgb: Rgb; alpha: number } {
  const match = value.match(/oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)/)
  if (!match) throw new Error(`unsupported color ${value}`)
  const alpha = match[4] ? (match[4].endsWith("%") ? Number(match[4].slice(0, -1)) / 100 : Number(match[4])) : 1
  return { rgb: oklchToLinear(Number(match[1]), Number(match[2]), Number(match[3])), alpha }
}

function oklchToLinear(lightness: number, chroma: number, hue: number): Rgb {
  const radians = (hue * Math.PI) / 180
  const a = chroma * Math.cos(radians)
  const b = chroma * Math.sin(radians)
  const l = lightness + 0.3963377774 * a + 0.2158037573 * b
  const m = lightness - 0.1055613458 * a - 0.0638541728 * b
  const s = lightness - 0.0894841775 * a - 1.291485548 * b
  const l3 = l ** 3
  const m3 = m ** 3
  const s3 = s ** 3
  return [
    clamp01(4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3),
    clamp01(-1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3),
    clamp01(-0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3),
  ]
}

function clamp01(channel: number) {
  return Math.min(1, Math.max(0, channel))
}

function composite(fg: { rgb: Rgb; alpha: number }, bg: Rgb): Rgb {
  const alpha = fg.alpha
  return [
    fg.rgb[0] * alpha + bg[0] * (1 - alpha),
    fg.rgb[1] * alpha + bg[1] * (1 - alpha),
    fg.rgb[2] * alpha + bg[2] * (1 - alpha),
  ]
}

function luminance([r, g, b]: Rgb) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function contrast(a: Rgb, b: Rgb) {
  const left = luminance(a)
  const right = luminance(b)
  const [hi, lo] = left > right ? [left, right] : [right, left]
  return (hi + 0.05) / (lo + 0.05)
}
