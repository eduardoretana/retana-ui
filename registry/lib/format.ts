export function formatNumber(value: number, locale = "es"): string {
  return new Intl.NumberFormat(locale).format(value)
}

/** Relative change. `null` when the previous value is 0 and the current is not. */
export function percentDelta(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null
  return (current - previous) / Math.abs(previous)
}

export function formatPercentDelta(delta: number | null, locale = "es"): string {
  if (delta == null) return "—"
  const pct = Math.round(delta * 100)
  const formatted = new Intl.NumberFormat(locale, {
    signDisplay: "exceptZero",
  }).format(pct)
  return `${formatted}%`
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "0 B"
  if (bytes < 1024) return `${Math.round(bytes)} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function formatWhen(ts: number | null, locale = "es", timeZone?: string): string {
  if (ts == null) return "—"
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone,
  }).format(ts)
}
