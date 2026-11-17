import { readFileSync } from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const root = path.resolve(import.meta.dirname, "..")

/** OKLab → sRGB, matriz de CSS Color 4. Croma 0: el tono no entra. */
function oklchToSrgb(L: number, C: number, H: number) {
  const rad = (H * Math.PI) / 180
  const a = C * Math.cos(rad)
  const b = C * Math.sin(rad)
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.291485548 * b
  const l = l_ ** 3
  const m = m_ ** 3
  const s = s_ ** 3
  const linear = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  return linear.map((channel) => {
    const clamped = Math.min(1, Math.max(0, channel))
    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055
  })
}

function channel(c: number) {
  return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(rgb: number[]) {
  return 0.2126 * channel(rgb[0]!) + 0.7152 * channel(rgb[1]!) + 0.0722 * channel(rgb[2]!)
}

export function contrastRatio(foreground: string, background: string) {
  const parse = (value: string) => {
    const match = value.match(/oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)/)
    if (!match) throw new Error(`no es oklch: ${value}`)
    return [Number(match[1]), Number(match[2]), Number(match[3])] as const
  }
  const [fg, bg] = [parse(foreground), parse(background)].map((parts) => luminance(oklchToSrgb(...parts)))
  const [hi, lo] = fg! > bg! ? [fg!, bg!] : [bg!, fg!]
  return (hi + 0.05) / (lo + 0.05)
}

type Mode = "light" | "dark"

function tokenValue(mode: Mode, name: string) {
  const tokens = JSON.parse(readFileSync(path.join(root, "tokens/retana.tokens.json"), "utf8")) as {
    color: Record<Mode, Record<string, { $value?: string }>>
  }
  const value = tokens.color[mode][name]?.$value
  if (!value) throw new Error(`falta ${mode}.${name}`)
  return value
}

describe("contraste de muted-foreground", () => {
  it("AC-CONTRAST muted-foreground ≥ 4.5 contra background, card y muted", () => {
    const surfaces = ["background", "card", "muted"] as const
    const failures: string[] = []
    for (const mode of ["light", "dark"] as const) {
      const foreground = tokenValue(mode, "muted-foreground")
      for (const surface of surfaces) {
        const background = tokenValue(mode, surface)
        const ratio = contrastRatio(foreground, background)
        if (ratio < 4.5) failures.push(`${mode} muted-foreground/ ${surface} = ${ratio.toFixed(4)} (${foreground} sobre ${background})`)
      }
    }
    expect(failures, "AC-CONTRAST-45").toEqual([])
  })
})
