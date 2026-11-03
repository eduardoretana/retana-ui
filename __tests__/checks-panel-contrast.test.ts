import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { checkMeterFill, checkMeterTrack } from "@/registry/ui/checks-panel"

const root = path.resolve(import.meta.dirname, "..")
const css = fs.readFileSync(path.join(root, "app/globals.css"), "utf8")

type Rgb = [number, number, number]

function block(source: string, selector: string) {
  const pattern = new RegExp(`(?:^|\\n)\\s*${selector}\\s*\\{`)
  const match = pattern.exec(source)
  if (!match || match.index == null) throw new Error(`missing ${selector}`)
  const open = source.indexOf("{", match.index)
  const close = source.indexOf("}", open)
  return source.slice(open + 1, close)
}

function tokens(source: string) {
  const found = new Map<string, string>()
  for (const match of source.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)) found.set(match[1]!, match[2]!.trim())
  return found
}

function parseOklch(value: string): { L: number; C: number; H: number; alpha: number } | null {
  const match = value.match(/oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+%?))?\s*\)/)
  if (!match) return null
  const alphaRaw = match[4]
  const alpha = alphaRaw == null ? 1 : alphaRaw.endsWith("%") ? Number(alphaRaw.slice(0, -1)) / 100 : Number(alphaRaw)
  return { L: Number(match[1]), C: Number(match[2]), H: Number(match[3]), alpha }
}

function oklchToLinear(L: number, C: number, H: number): Rgb {
  const rad = (H * Math.PI) / 180
  const a = C * Math.cos(rad)
  const b = C * Math.sin(rad)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  return [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ].map((channel) => Math.min(1, Math.max(0, channel))) as Rgb
}

function encode(channel: number) {
  const c = Math.min(1, Math.max(0, channel))
  return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055
}

function decode(channel: number) {
  const c = Math.min(1, Math.max(0, channel))
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function toSrgb(linear: Rgb): Rgb {
  return linear.map(encode) as Rgb
}

function toLinear(srgb: Rgb): Rgb {
  return srgb.map(decode) as Rgb
}

function over(top: Rgb, bottom: Rgb, alpha: number): Rgb {
  const mix = (index: number) => top[index] * alpha + bottom[index] * (1 - alpha)
  return [mix(0), mix(1), mix(2)]
}

function resolve(value: string, theme: Map<string, string>, surface: Rgb): Rgb {
  const named = value.match(/^var\((--[a-z0-9-]+)(?:\s*,\s*(.+))?\)$/)
  if (named) {
    if (theme.has(named[1]!)) return resolve(theme.get(named[1]!)!, theme, surface)
    if (named[2]) return resolve(named[2].trim(), theme, surface)
    throw new Error(`unresolved color ${value}`)
  }
  const color = parseOklch(value)
  if (!color) throw new Error(`unresolved color ${value}`)
  const linear = oklchToLinear(color.L, color.C, color.H)
  if (color.alpha === 1) return linear
  return toLinear(over(toSrgb(linear), toSrgb(surface), color.alpha))
}

function luminance(rgb: Rgb) {
  return 0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]
}

function contrast(a: Rgb, b: Rgb) {
  const y1 = luminance(a)
  const y2 = luminance(b)
  const [hi, lo] = y1 > y2 ? [y1, y2] : [y2, y1]
  return (hi + 0.05) / (lo + 0.05)
}

const themes = {
  light: tokens(block(css, ":root")),
  dark: tokens(block(css, "\\.dark")),
} as const

describe("check meter contrast", () => {
  it("keeps the fill at least 3:1 against the track and the surface", () => {
    expect(checkMeterTrack).toBe("var(--muted)")
    expect(checkMeterFill.passed).toBe("var(--success, var(--primary))")
    expect(checkMeterFill.running).toBe("var(--foreground)")
    expect(checkMeterFill.failed).toBe("var(--destructive)")
    expect(themes.light.has("--success")).toBe(false)

    for (const [mode, theme] of Object.entries(themes)) {
      const background = resolve("var(--background)", theme, [1, 1, 1])
      const card = resolve("var(--card)", theme, background)
      const track = resolve(checkMeterTrack, theme, card)
      for (const status of ["passed", "running", "failed"] as const) {
        const fill = resolve(checkMeterFill[status]!, theme, card)
        expect(contrast(fill, track), `${mode} ${status} vs track`).toBeGreaterThanOrEqual(3)
        expect(contrast(fill, card), `${mode} ${status} vs card`).toBeGreaterThanOrEqual(3)
        expect(contrast(fill, background), `${mode} ${status} vs background`).toBeGreaterThanOrEqual(3)
      }
    }
  })
})
