/**
 * Theme tokens for clinical and anatomy pieces.
 *
 * OrganUI ships fixed anatomical colours. Retana UI items inherit the host
 * theme instead, so every structure, trace and fill names a token and an
 * optional lightness shade. SVG and CSS use the token directly; WebGL reads
 * the resolved token once per theme change.
 */
export type ClinicalTone =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "primary"
  | "destructive"
  | "muted-foreground"
  | "foreground"

export const CLINICAL_TONES: readonly ClinicalTone[] = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
]

/** CSS value for a tone. shade -1..1 mixes toward background (+) or foreground (-). */
export function toneVar(tone: ClinicalTone, shade = 0) {
  if (!shade) return `var(--${tone})`
  const pct = Math.round(Math.min(Math.abs(shade), 1) * 100)
  return shade > 0
    ? `color-mix(in oklch, var(--${tone}), var(--background) ${pct}%)`
    : `color-mix(in oklch, var(--${tone}), var(--foreground) ${pct}%)`
}

/** A tone picked by position, for series without a fixed meaning. */
export function toneAt(index: number): ClinicalTone {
  return CLINICAL_TONES[((index % CLINICAL_TONES.length) + CLINICAL_TONES.length) % CLINICAL_TONES.length]!
}

export type Rgb = readonly [number, number, number]

const cache = new Map<string, Rgb>()
let probe: CanvasRenderingContext2D | null | undefined

/**
 * Resolve any CSS colour expression (tokens, color-mix) to sRGB 0..1 by
 * painting one pixel. Returns null outside the browser.
 */
export function resolveCssColor(value: string, scope?: Element | null): Rgb | null {
  if (typeof document === "undefined") return null
  const key = value
  const hit = cache.get(key)
  if (hit) return hit
  const host = document.createElement("span")
  host.style.color = value
  host.style.display = "none"
  ;(scope ?? document.body).appendChild(host)
  const computed = getComputedStyle(host).color
  host.remove()
  if (probe === undefined) {
    const canvas = document.createElement("canvas")
    canvas.width = canvas.height = 1
    probe = canvas.getContext("2d", { willReadFrequently: true })
  }
  if (!probe || !computed) return null
  probe.clearRect(0, 0, 1, 1)
  probe.fillStyle = computed
  probe.fillRect(0, 0, 1, 1)
  const [r, g, b] = probe.getImageData(0, 0, 1, 1).data
  const rgb: Rgb = [r! / 255, g! / 255, b! / 255]
  cache.set(key, rgb)
  return rgb
}

/** Drop resolved colours, for example after the host switches theme. */
export function clearToneCache() {
  cache.clear()
}

/** Call back when the document theme class or style changes. */
export function onThemeChange(callback: () => void) {
  if (typeof MutationObserver === "undefined" || typeof document === "undefined") return () => {}
  const observer = new MutationObserver(() => {
    clearToneCache()
    callback()
  })
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class", "style", "data-theme"] })
  return () => observer.disconnect()
}
