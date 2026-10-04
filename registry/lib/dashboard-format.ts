/** Number, date, and greeting helpers for dashboard pieces. No theme tokens. */

export type DashboardFormat = "number" | "currency" | "percent" | "compact" | "text" | "points"

export function formatDashboardValue(
  value: number | string,
  format: DashboardFormat = "text",
  locale = "en-US",
  currency = "USD",
): string {
  if (typeof value !== "number" || !Number.isFinite(value) || format === "text") return String(value)
  if (format === "currency") {
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      notation: Math.abs(value) >= 10000 ? "compact" : "standard",
      maximumFractionDigits: Math.abs(value) >= 10000 ? 1 : 0,
    }).format(value)
  }
  if (format === "percent") {
    return new Intl.NumberFormat(locale, {
      style: "percent",
      maximumFractionDigits: 1,
    }).format(value)
  }
  if (format === "compact") {
    return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value)
  }
  if (format === "points") {
    const formatted = new Intl.NumberFormat(locale, {
      signDisplay: "exceptZero",
      maximumFractionDigits: 1,
    }).format(value)
    return `${formatted} pts`
  }
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(value)
}

export function formatDashboardDate(
  value: string | number | Date,
  locale = "en-US",
  options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" },
): string {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  return new Intl.DateTimeFormat(locale, options).format(date)
}

export function joinMeta(parts: Array<string | number | null | undefined | false>): string {
  return parts.filter((part) => part != null && part !== false && part !== "").map(String).join(" · ")
}

const DAY_PART = {
  en: { morning: "Good morning", afternoon: "Good afternoon", evening: "Good evening" },
  es: { morning: "Buenos días", afternoon: "Buenas tardes", evening: "Buenas noches" },
} as const

/** Time-of-day greeting. Spanish locales use es; everything else uses en. */
export function greeting(date: Date, locale: string, name: string): string {
  const hour = date.getHours()
  const part = hour < 12 ? "morning" : hour < 18 ? "afternoon" : "evening"
  const table = locale.toLowerCase().startsWith("es") ? DAY_PART.es : DAY_PART.en
  return `${table[part]}, ${name}`
}

export function shareOf(value: number, total: number): number {
  if (!Number.isFinite(value) || !Number.isFinite(total) || total <= 0) return 0
  return value / total
}

export function clampRatio(value: number, min: number, max: number): number {
  const span = max - min
  if (!Number.isFinite(span) || span <= 0) return 0
  return Math.min(1, Math.max(0, (value - min) / span))
}

export type RankedInput = { id: string; value: number; share?: number }

export function orderRanked<T extends RankedInput>(items: readonly T[], sort: "asc" | "desc" | "none" = "desc"): T[] {
  const copy = items.map((item) => ({ ...item }))
  if (sort === "asc") copy.sort((a, b) => a.value - b.value || a.id.localeCompare(b.id))
  if (sort === "desc") copy.sort((a, b) => b.value - a.value || a.id.localeCompare(b.id))
  const total = copy.reduce((sum, item) => sum + (Number.isFinite(item.value) ? item.value : 0), 0)
  return copy.map((item) => ({ ...item, share: item.share ?? shareOf(item.value, total) }))
}

/** Delay in seconds for a short opacity stagger. Zero when motion is reduced. */
export function staggerDelay(index: number, reduced: boolean, step = 0.04): number {
  if (reduced || index <= 0) return 0
  return index * step
}
