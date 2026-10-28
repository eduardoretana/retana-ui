/** Business days, balances, and a configurable holiday calendar. No React. */

export type IsoDay = string

export type Holiday = {
  date: IsoDay
  name: string
}

export type SkippedDay = {
  date: IsoDay
  reason: "weekend" | "holiday"
  name?: string
}

export type BusinessSpan = {
  days: number
  counted: IsoDay[]
  skipped: SkippedDay[]
}

export type AbsencePortion = "day" | "half"

const ISO = /^(\d{4})-(\d{2})-(\d{2})$/

export function parseIsoDay(value: string) {
  const match = ISO.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const probe = new Date(Date.UTC(year, month - 1, day))
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null
  return { year, month, day }
}

export function isoDay(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

export function weekdayIndex(value: IsoDay) {
  const parts = parseIsoDay(value)
  if (!parts) return null
  return new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()
}

export function isWeekend(value: IsoDay) {
  const weekday = weekdayIndex(value)
  return weekday === 0 || weekday === 6
}

export function eachDay(start: IsoDay, end: IsoDay): IsoDay[] {
  const from = parseIsoDay(start)
  const to = parseIsoDay(end)
  if (!from || !to) return []
  const cursor = new Date(Date.UTC(from.year, from.month - 1, from.day))
  const last = Date.UTC(to.year, to.month - 1, to.day)
  if (cursor.getTime() > last) return []
  const days: IsoDay[] = []
  while (cursor.getTime() <= last && days.length < 366) {
    days.push(isoDay(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, cursor.getUTCDate()))
    cursor.setUTCDate(cursor.getUTCDate() + 1)
  }
  return days
}

function nthWeekday(year: number, month: number, weekday: number, nth: number) {
  const first = new Date(Date.UTC(year, month - 1, 1))
  const offset = (weekday - first.getUTCDay() + 7) % 7
  return isoDay(year, month, 1 + offset + (nth - 1) * 7)
}

/**
 * Statutory rest days in Mexico under LFT article 74.
 * The federal inauguration is 1 December every sixth year (2018, 2024, 2030…).
 * Election days are not implied: pass them in as extra holidays.
 */
export function mexicoStatutoryHolidays(year: number): Holiday[] {
  const holidays: Holiday[] = [
    { date: isoDay(year, 1, 1), name: "Año Nuevo" },
    { date: nthWeekday(year, 2, 1, 1), name: "Día de la Constitución" },
    { date: nthWeekday(year, 3, 1, 3), name: "Natalicio de Benito Juárez" },
    { date: isoDay(year, 5, 1), name: "Día del Trabajo" },
    { date: isoDay(year, 9, 16), name: "Día de la Independencia" },
    { date: nthWeekday(year, 11, 1, 3), name: "Día de la Revolución" },
    { date: isoDay(year, 12, 25), name: "Navidad" },
  ]
  if (year % 6 === 2) {
    holidays.push({ date: isoDay(year, 12, 1), name: "Transmisión del Poder Ejecutivo Federal" })
  }
  return holidays.sort((a, b) => a.date.localeCompare(b.date))
}

export function businessSpan(start: IsoDay, end: IsoDay, holidays: readonly Holiday[] = []): BusinessSpan {
  const named = new Map(holidays.map((holiday) => [holiday.date, holiday.name]))
  const counted: IsoDay[] = []
  const skipped: SkippedDay[] = []
  for (const date of eachDay(start, end)) {
    if (isWeekend(date)) {
      skipped.push({ date, reason: "weekend" })
      continue
    }
    const name = named.get(date)
    if (name) {
      skipped.push({ date, reason: "holiday", name })
      continue
    }
    counted.push(date)
  }
  return { days: counted.length, counted, skipped }
}

/** A half-day absence counts 0.5 only when the start date itself is a business day. */
export function requestedUnits(start: IsoDay, end: IsoDay, holidays: readonly Holiday[], portion: AbsencePortion) {
  const span = businessSpan(portion === "half" ? start : start, portion === "half" ? start : end, holidays)
  if (portion === "half") return span.counted.includes(start) ? 0.5 : 0
  return span.days
}

export function balanceLeft(available: number, pending: number, requested: number) {
  return roundHalf(available - pending - requested)
}

function roundHalf(value: number) {
  return Math.round(value * 2) / 2
}
