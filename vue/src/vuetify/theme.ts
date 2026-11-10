/**
 * Tema Vuetify 3.13 generado desde tokens/retana.tokens.json.
 * Los hex salen de convertir el oklch del DTCG. No viven en los SFC.
 *
 * Hueco: el DTCG compartido no tiene `success`. La presencia en línea lo
 * necesita y no puede usar `primary` (el acento). El rol `success` de Vuetify
 * se rellena aquí, solo en esta capa. React sigue pintando la presencia con
 * `primary`: paridad pendiente.
 */
import tokens from "../../../tokens/retana.tokens.json"

type ColorToken = { $value: string }
type Mode = Record<string, ColorToken>

const modes = tokens.color as unknown as { light: Mode; dark: Mode }

function parseOklch(value: string) {
  const match = value.match(/oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+)(%?))?\s*\)/)
  if (!match) return null
  const alpha = match[4] === undefined ? 1 : match[5] === "%" ? Number(match[4]) / 100 : Number(match[4])
  return { l: Number(match[1]), c: Number(match[2]), h: Number(match[3]), alpha }
}

function oklchToRgb(l: number, c: number, h: number): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180)
  const b = c * Math.sin((h * Math.PI) / 180)
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b
  const s_ = l - 0.0894841775 * a - 1.291485548 * b
  const lc = l_ ** 3
  const mc = m_ ** 3
  const sc = s_ ** 3
  const linear = [
    4.0767416621 * lc - 3.3077115913 * mc + 0.2309699292 * sc,
    -1.2684380046 * lc + 2.6097574011 * mc - 0.3413193965 * sc,
    -0.0041960863 * lc - 0.7034186147 * mc + 1.707614701 * sc,
  ]
  return linear.map((channel) => {
    const clamped = Math.min(1, Math.max(0, channel))
    return clamped <= 0.0031308 ? 12.92 * clamped : 1.055 * clamped ** (1 / 2.4) - 0.055
  }) as [number, number, number]
}

function hex(rgb: [number, number, number]) {
  return `#${rgb.map((channel) => Math.round(Math.min(1, Math.max(0, channel)) * 255).toString(16).padStart(2, "0")).join("")}`
}

function color(mode: Mode, name: string, backdrop: [number, number, number]): string {
  const parsed = parseOklch(mode[name]?.$value ?? "")
  if (!parsed) return "#000000"
  const rgb = oklchToRgb(parsed.l, parsed.c, parsed.h)
  if (parsed.alpha >= 1) return hex(rgb)
  return hex(rgb.map((channel, index) => channel * parsed.alpha + backdrop[index] * (1 - parsed.alpha)) as [number, number, number])
}

function theme(modeName: "light" | "dark") {
  const mode = modes[modeName]
  const backdrop = oklchToRgb(...(["background"] as const).flatMap(() => {
    const parsed = parseOklch(mode.background?.$value ?? "oklch(1 0 0)")
    return parsed ? [parsed.l, parsed.c, parsed.h] : [1, 0, 0]
  }) as [number, number, number])
  const paint = (name: string) => color(mode, name, backdrop)
  return {
    dark: modeName === "dark",
    colors: {
      background: paint("background"),
      "on-background": paint("foreground"),
      surface: paint("card"),
      "on-surface": paint("card-foreground"),
      primary: paint("primary"),
      "on-primary": paint("primary-foreground"),
      secondary: paint("muted-foreground"),
      error: paint("destructive"),
      success: modeName === "dark" ? "#7DCEA0" : "#146C43",
      "serie-pista": paint("muted"),
      "serie-agente": paint("chart-1"),
      "serie-humana": paint("chart-2"),
      "serie-neutra": paint("chart-3"),
      "chart-4": paint("chart-4"),
      "chart-5": paint("chart-5"),
      barra: paint("sidebar"),
      "on-barra": paint("sidebar-foreground"),
      senal: paint("sidebar-primary"),
      "on-senal": paint("sidebar-primary-foreground"),
      "retana-secondary": paint("secondary"),
      "on-retana-secondary": paint("secondary-foreground"),
      "retana-accent": paint("accent"),
      "on-retana-accent": paint("accent-foreground"),
      "sidebar-border": paint("sidebar-border"),
    },
    variables: { "medium-emphasis-opacity": 0.7 },
  }
}

export const bandejaThemes = { light: theme("light"), dark: theme("dark") }

export const bandejaRadius = (tokens.dimension as unknown as { radius: { $value: string } }).radius.$value

/** Radios y densidad para el host Vuetify. Las piezas no usan estos componentes. */
export const bandejaDefaults = {
  global: { ripple: false },
  VBtn: { density: "comfortable", rounded: "lg" },
  VCard: { density: "comfortable", rounded: "lg" },
  VChip: { density: "comfortable", rounded: "pill" },
  VTextField: { density: "comfortable", rounded: "lg" },
  VList: { density: "comfortable" },
}
