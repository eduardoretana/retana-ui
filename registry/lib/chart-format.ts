export type ChartLocale = string

const numberFormat = new Map<string, Intl.NumberFormat>()
const percentFormat = new Map<string, Intl.NumberFormat>()
const currencyFormat = new Map<string, Intl.NumberFormat>()

function cached(map: Map<string, Intl.NumberFormat>, key: string, create: () => Intl.NumberFormat) {
  let format = map.get(key)
  if (!format) {
    format = create()
    map.set(key, format)
  }
  return format
}

/** `es` and `en` map to es-MX and en-US. Any other BCP 47 tag is used as-is. */
export function resolveChartLocale(locale: ChartLocale | undefined): string {
  if (!locale || locale === "en") return "en-US"
  if (locale === "es") return "es-MX"
  return locale
}

export function formatChartNumber(value: number, locale: ChartLocale | undefined, digits = 1): string {
  const safe = Number.isFinite(value) ? value : 0
  const tag = resolveChartLocale(locale)
  const fraction = Number.isInteger(safe) ? 0 : digits
  const format = cached(numberFormat, `${tag}:${fraction}`, () =>
    new Intl.NumberFormat(tag, { maximumFractionDigits: fraction, minimumFractionDigits: 0 }),
  )
  return format.format(safe)
}

/** `share` is a ratio, 0.1 → 10%. */
export function formatChartPercent(share: number, locale: ChartLocale | undefined, digits = 0): string {
  const safe = Number.isFinite(share) ? share : 0
  const tag = resolveChartLocale(locale)
  const format = cached(percentFormat, `${tag}:${digits}`, () =>
    new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: digits, minimumFractionDigits: 0 }),
  )
  return format.format(safe)
}

export function formatChartCurrency(value: number, locale: ChartLocale | undefined, currency: string): string {
  const safe = Number.isFinite(value) ? value : 0
  const tag = resolveChartLocale(locale)
  const format = cached(currencyFormat, `${tag}:${currency}`, () =>
    new Intl.NumberFormat(tag, { style: "currency", currency, maximumFractionDigits: 0 }),
  )
  return format.format(safe)
}

export type ChartUnit = {
  id: string
  label: string
  /** Multiplies the raw measure. Defaults to 1. */
  scale?: number
  /** When set, values format as money in this ISO currency. */
  currency?: string
  /** Appended after a plain number, such as "kg". */
  suffix?: string
}

export function formatChartUnit(value: number, unit: ChartUnit | undefined, locale: ChartLocale | undefined): string {
  const scaled = value * (unit?.scale ?? 1)
  if (unit?.currency) return formatChartCurrency(scaled, locale, unit.currency)
  const text = formatChartNumber(scaled, locale)
  return unit?.suffix ? `${text} ${unit.suffix}` : text
}
