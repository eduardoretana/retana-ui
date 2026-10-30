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

/**
 * Unflattened figure. `value`, `decimals`, `locale`, `prefix`, `suffix`,
 * `hierarchy`, and `announce` match NumberRoll. Percent and currency stay
 * here so callers do not preformat. The reel replaces the draw when #59 lands.
 */
export type ChartKpiFigure = {
  value: number
  decimals?: number
  locale?: ChartLocale
  prefix?: string
  suffix?: string
  /** `value` is a ratio. 0.1 is 10%. */
  percent?: boolean
  currency?: string
  hierarchy?: boolean
  announce?: boolean
}

const figureFormat = new Map<string, Intl.NumberFormat>()

function figureFormatter(figure: ChartKpiFigure, safe: number) {
  const tag = resolveChartLocale(figure.locale)
  if (figure.currency) {
    return cached(figureFormat, `c:${tag}:${figure.currency}`, () =>
      new Intl.NumberFormat(tag, {
        style: "currency",
        currency: figure.currency,
        maximumFractionDigits: 0,
        minimumFractionDigits: 0,
      }),
    )
  }
  if (figure.percent) {
    const digits = figure.decimals ?? 0
    return cached(figureFormat, `p:${tag}:${digits}`, () =>
      new Intl.NumberFormat(tag, { style: "percent", maximumFractionDigits: digits, minimumFractionDigits: 0 }),
    )
  }
  const digits = figure.decimals ?? 1
  const maximum = figure.decimals == null ? (Number.isInteger(safe) ? 0 : digits) : Math.min(8, Math.max(0, Math.trunc(figure.decimals)))
  return cached(figureFormat, `n:${tag}:${maximum}`, () =>
    new Intl.NumberFormat(tag, { maximumFractionDigits: maximum, minimumFractionDigits: 0 }),
  )
}

/** Integer, fraction (with the percent sign), and the full announced string. */
export function chartFigureParts(figure: ChartKpiFigure): { text: string; integer: string; fraction: string } {
  const safe = Number.isFinite(figure.value) ? figure.value : 0
  const format = figureFormatter(figure, safe)
  let integer = ""
  let fraction = ""
  for (const part of format.formatToParts(safe)) {
    if (part.type === "decimal" || part.type === "fraction" || part.type === "percentSign") fraction += part.value
    else integer += part.value
  }
  const prefix = figure.prefix ?? ""
  const suffix = figure.suffix ?? ""
  return {
    text: `${prefix}${format.format(safe)}${suffix}`,
    integer: `${prefix}${integer}`,
    fraction,
  }
}

export function chartFigureForUnit(value: number, unit: ChartUnit | undefined, locale: ChartLocale | undefined): ChartKpiFigure {
  const scaled = value * (unit?.scale ?? 1)
  if (unit?.currency) return { value: scaled, currency: unit.currency, locale, hierarchy: true, announce: true }
  return { value: scaled, locale, suffix: unit?.suffix ? ` ${unit.suffix}` : undefined, hierarchy: true, announce: true }
}
