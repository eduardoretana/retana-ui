/** Query contract for a headless capture. Light, dark, es-MX, and EN are applied from the URL. */

export type CaptureTheme = "light" | "dark"
export type CaptureLocale = "es" | "en"

export function captureLocale(value: string | null): CaptureLocale {
  if (!value) return "es"
  const next = value.toLowerCase()
  if (next === "en" || next.startsWith("en-")) return "en"
  return "es"
}

export function captureTheme(value: string | null): CaptureTheme | null {
  if (value === "light" || value === "dark") return value
  return null
}

export function captureReduced(value: string | null): boolean {
  return value === "reduce" || value === "reduced"
}
