import { toCsv, type CsvColumn } from "@/registry/retana/lib/csv"

/**
 * One collection, many views. Pure helpers only: no fetching, no theme.
 * Dates are calendar days (`YYYY-MM-DD`) so a timezone never shifts the day.
 */

export const FIELD_TYPES = [
  "text",
  "number",
  "currency",
  "date",
  "daterange",
  "select",
  "status",
  "person",
  "relation",
  "boolean",
  "url",
  "image",
  "progress",
] as const

export type FieldType = (typeof FIELD_TYPES)[number]

export const FIELD_ICON_NAMES = [
  "text",
  "hash",
  "currency",
  "calendar",
  "user",
  "link",
  "image",
  "check",
  "status",
  "flag",
  "building",
  "progress",
  "tag",
] as const

export type FieldIconName = (typeof FIELD_ICON_NAMES)[number]

export type ChartTone = 1 | 2 | 3 | 4 | 5

export type FieldOption = {
  value: string
  label: string
  tone?: ChartTone
}

export type FieldDef = {
  id: string
  label: string
  type: FieldType
  icon?: FieldIconName
  options?: readonly FieldOption[]
  /** ISO currency code. Default USD. */
  currency?: string
  /** `compact` (default for currency) or `standard`. */
  format?: "compact" | "standard"
  /** Property-panel section. Default Details. */
  section?: string
  readOnly?: boolean
}

export const VIEW_KINDS = [
  "table",
  "kanban",
  "calendar",
  "timeline",
  "grouped-list",
  "gallery",
] as const

export type ViewKind = (typeof VIEW_KINDS)[number]

export type ViewConfig = {
  id: string
  kind: ViewKind
  label: string
  titleField?: string
  subtitleField?: string
  groupField?: string
  sumField?: string
  dateField?: string
  startField?: string
  endField?: string
  coverField?: string
  chipField?: string
  /** Gallery headline. Falls back to the first currency or number field. */
  headlineField?: string
  cardFields?: readonly string[]
  columns?: readonly string[]
}

export type MultiRecord = { id: string } & Record<string, unknown>

export type PersonValue = { name: string; avatarUrl?: string | null }

export type DateRangeValue = { start: string; end: string }

export const FILTER_OPS = [
  "is",
  "isNot",
  "contains",
  "gt",
  "lt",
  "empty",
  "notEmpty",
  "before",
  "after",
] as const

export type FilterOp = (typeof FILTER_OPS)[number]

export type FilterClause = {
  id: string
  field: string
  op: FilterOp
  value?: string
}

export type SortDirection = "asc" | "desc"

export type SortClause = {
  field: string
  direction: SortDirection
}

export type RecordGroup<T> = {
  key: string
  label: string
  records: T[]
  sum: number | null
}

export type CalendarDay = {
  iso: string
  inMonth: boolean
}

export type TimelineZoom = "day" | "week" | "month" | "quarter"

export type TimelineTick = {
  iso: string
  label: string
}

export type DateParts = { y: number; m: number; d: number }

const DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/
const DAY_MS = 86_400_000

export function isFilterOp(value: string): value is FilterOp {
  return (FILTER_OPS as readonly string[]).includes(value)
}

export function parseDateOnly(value: unknown): DateParts | null {
  if (typeof value !== "string") return null
  const match = DATE_RE.exec(value)
  if (!match) return null
  const y = Number(match[1])
  const m = Number(match[2])
  const d = Number(match[3])
  if (m < 1 || m > 12 || d < 1 || d > 31) return null
  const utc = new Date(Date.UTC(y, m - 1, d))
  if (
    utc.getUTCFullYear() !== y ||
    utc.getUTCMonth() !== m - 1 ||
    utc.getUTCDate() !== d
  ) {
    return null
  }
  return { y, m, d }
}

export function formatDateOnly(parts: DateParts): string {
  const m = String(parts.m).padStart(2, "0")
  const d = String(parts.d).padStart(2, "0")
  return `${String(parts.y).padStart(4, "0")}-${m}-${d}`
}

function dateUtc(parts: DateParts): number {
  return Date.UTC(parts.y, parts.m - 1, parts.d)
}

function fromUtc(ms: number): DateParts {
  const date = new Date(ms)
  return { y: date.getUTCFullYear(), m: date.getUTCMonth() + 1, d: date.getUTCDate() }
}

/** Local calendar day for "today". Pass a Date in tests. */
export function localToday(now = new Date()): string {
  return formatDateOnly({
    y: now.getFullYear(),
    m: now.getMonth() + 1,
    d: now.getDate(),
  })
}

export function addDays(iso: string, days: number): string | null {
  const parts = parseDateOnly(iso)
  if (!parts || !Number.isFinite(days)) return null
  return formatDateOnly(fromUtc(dateUtc(parts) + Math.trunc(days) * DAY_MS))
}

export function diffDays(start: string, end: string): number | null {
  const a = parseDateOnly(start)
  const b = parseDateOnly(end)
  if (!a || !b) return null
  return Math.round((dateUtc(b) - dateUtc(a)) / DAY_MS)
}

export function addMonths(iso: string, months: number): string | null {
  const parts = parseDateOnly(iso)
  if (!parts || !Number.isFinite(months)) return null
  const index = parts.y * 12 + (parts.m - 1) + Math.trunc(months)
  const y = Math.floor(index / 12)
  const m = (index % 12) + 1
  const dim = new Date(Date.UTC(y, m, 0)).getUTCDate()
  return formatDateOnly({ y, m, d: Math.min(parts.d, dim) })
}

export function startOfWeek(iso: string, weekStartsOn = 1): string | null {
  const parts = parseDateOnly(iso)
  if (!parts) return null
  const weekday = new Date(dateUtc(parts)).getUTCDay()
  const lead = (weekday - weekStartsOn + 7) % 7
  return addDays(iso, -lead)
}

export function startOfMonth(iso: string): string | null {
  const parts = parseDateOnly(iso)
  if (!parts) return null
  return formatDateOnly({ y: parts.y, m: parts.m, d: 1 })
}

export function startOfQuarter(iso: string): string | null {
  const parts = parseDateOnly(iso)
  if (!parts) return null
  const m = Math.floor((parts.m - 1) / 3) * 3 + 1
  return formatDateOnly({ y: parts.y, m, d: 1 })
}

export function weekdayIndex(iso: string): number | null {
  const parts = parseDateOnly(iso)
  if (!parts) return null
  return new Date(dateUtc(parts)).getUTCDay()
}

export function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value)
    if (Number.isFinite(n)) return n
  }
  return null
}

export function asPerson(value: unknown): PersonValue | null {
  if (typeof value === "string" && value.trim()) return { name: value.trim() }
  if (!value || typeof value !== "object") return null
  const name = (value as { name?: unknown }).name
  if (typeof name !== "string" || !name.trim()) return null
  const avatar = (value as { avatarUrl?: unknown }).avatarUrl
  return {
    name: name.trim(),
    avatarUrl: typeof avatar === "string" ? avatar : undefined,
  }
}

export function asDateRange(value: unknown): DateRangeValue | null {
  if (!value || typeof value !== "object") return null
  const start = (value as { start?: unknown }).start
  const end = (value as { end?: unknown }).end
  if (typeof start !== "string" || typeof end !== "string") return null
  if (!parseDateOnly(start) || !parseDateOnly(end)) return null
  return { start, end }
}

export function isEmptyValue(value: unknown): boolean {
  if (value == null) return true
  if (typeof value === "string") return value.trim() === ""
  if (typeof value === "number") return !Number.isFinite(value)
  if (typeof value === "boolean") return false
  if (asPerson(value)) return false
  if (asDateRange(value)) return false
  return false
}

export function foldText(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export function fieldById(
  fields: readonly FieldDef[],
  id: string | undefined,
): FieldDef | undefined {
  if (!id) return undefined
  return fields.find((field) => field.id === id)
}

export function titleFieldOf(
  fields: readonly FieldDef[],
  preferred?: string,
): FieldDef | undefined {
  return fieldById(fields, preferred) ?? fields.find((field) => field.type === "text")
}

export function recordTitle(
  record: MultiRecord,
  fields: readonly FieldDef[],
  preferred?: string,
): string {
  const field = titleFieldOf(fields, preferred)
  if (!field) return record.id
  const text = formatFieldValue(record[field.id], field)
  return text || record.id
}

export function optionLabel(field: FieldDef, value: string): string {
  return field.options?.find((option) => option.value === value)?.label ?? value
}

export function optionTone(field: FieldDef, value: string, index = 0): ChartTone {
  const tone = field.options?.find((option) => option.value === value)?.tone
  if (tone) return tone
  const fallback = (index % 5) + 1
  return fallback as ChartTone
}

export function formatCurrency(
  value: number,
  locale?: string,
  currency = "USD",
  format: "compact" | "standard" = "compact",
): string {
  const compact = format === "compact" && Math.abs(value) >= 1000
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 1 : 2,
    minimumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale, { maximumFractionDigits: 2 }).format(value)
}

export function formatDateLabel(iso: string, locale?: string): string {
  const parts = parseDateOnly(iso)
  if (!parts) return ""
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(parts.y, parts.m - 1, parts.d)))
}

export function formatMonthLabel(year: number, monthIndex: number, locale?: string): string {
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, monthIndex, 1)))
}

export function weekdayLabels(locale: string | undefined, weekStartsOn = 1): string[] {
  const monday = new Date(Date.UTC(2026, 0, 5))
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday.getTime() + ((index + weekStartsOn + 6) % 7) * DAY_MS)
    return new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(day)
  })
}

export function formatFieldValue(
  value: unknown,
  field: FieldDef,
  locale?: string,
): string {
  if (isEmptyValue(value)) return ""
  switch (field.type) {
    case "number":
      return formatNumber(asNumber(value) ?? 0, locale)
    case "currency":
      return formatCurrency(
        asNumber(value) ?? 0,
        locale,
        field.currency,
        field.format ?? "compact",
      )
    case "progress": {
      const n = asNumber(value) ?? 0
      return `${formatNumber(n, locale)}%`
    }
    case "date":
      return formatDateLabel(String(value), locale)
    case "daterange": {
      const range = asDateRange(value)
      if (!range) return ""
      return `${formatDateLabel(range.start, locale)} – ${formatDateLabel(range.end, locale)}`
    }
    case "select":
    case "status":
      return optionLabel(field, String(value))
    case "person":
    case "relation":
      return asPerson(value)?.name ?? ""
    case "boolean":
      return value === true ? "Yes" : "No"
    default:
      return typeof value === "string" ? value : String(value)
  }
}

export function searchText(
  record: MultiRecord,
  fields: readonly FieldDef[],
  locale?: string,
): string {
  const parts = fields.map((field) => formatFieldValue(record[field.id], field, locale))
  parts.push(record.id)
  return foldText(parts.filter(Boolean).join(" "))
}

export function searchRecords<T extends MultiRecord>(
  records: readonly T[],
  fields: readonly FieldDef[],
  query: string,
  locale?: string,
): T[] {
  const needle = foldText(query.trim())
  if (!needle) return [...records]
  return records.filter((record) => searchText(record, fields, locale).includes(needle))
}

function compareClause(
  record: MultiRecord,
  field: FieldDef,
  clause: FilterClause,
  locale?: string,
): boolean {
  const value = record[field.id]
  const empty = isEmptyValue(value)
  switch (clause.op) {
    case "empty":
      return empty
    case "notEmpty":
      return !empty
    case "contains": {
      if (empty) return false
      const hay = foldText(formatFieldValue(value, field, locale))
      return hay.includes(foldText(clause.value ?? ""))
    }
    case "is":
    case "isNot": {
      const expected = clause.value ?? ""
      let same = false
      if (field.type === "number" || field.type === "currency" || field.type === "progress") {
        same = asNumber(value) === asNumber(expected)
      } else if (field.type === "boolean") {
        same = String(value === true) === expected
      } else if (field.type === "person" || field.type === "relation") {
        same = (asPerson(value)?.name ?? "") === expected
      } else {
        same = String(value ?? "") === expected
      }
      return clause.op === "is" ? same : !same
    }
    case "gt":
    case "lt": {
      const left = asNumber(value)
      const right = asNumber(clause.value)
      if (left == null || right == null) return false
      return clause.op === "gt" ? left > right : left < right
    }
    case "before":
    case "after": {
      const iso = typeof value === "string" ? value : asDateRange(value)?.start
      if (!iso || !clause.value || !parseDateOnly(iso) || !parseDateOnly(clause.value)) return false
      return clause.op === "before" ? iso < clause.value : iso > clause.value
    }
    default:
      return true
  }
}

export function filterRecords<T extends MultiRecord>(
  records: readonly T[],
  fields: readonly FieldDef[],
  filters: readonly FilterClause[],
  locale?: string,
): T[] {
  if (!filters.length) return [...records]
  return records.filter((record) =>
    filters.every((clause) => {
      const field = fieldById(fields, clause.field)
      if (!field) return true
      return compareClause(record, field, clause, locale)
    }),
  )
}

function sortValue(record: MultiRecord, field: FieldDef): string | number | null {
  const value = record[field.id]
  if (isEmptyValue(value)) return null
  if (field.type === "number" || field.type === "currency" || field.type === "progress") {
    return asNumber(value)
  }
  if (field.type === "boolean") return value === true ? 1 : 0
  if (field.type === "date") return typeof value === "string" ? value : null
  if (field.type === "daterange") return asDateRange(value)?.start ?? null
  if (field.type === "person" || field.type === "relation") return asPerson(value)?.name ?? null
  if (field.type === "select" || field.type === "status") return optionLabel(field, String(value))
  return String(value)
}

export function compareFieldValues(
  left: MultiRecord,
  right: MultiRecord,
  field: FieldDef,
  direction: SortDirection,
  locale?: string,
): number {
  const a = sortValue(left, field)
  const b = sortValue(right, field)
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  let result = 0
  if (typeof a === "number" && typeof b === "number") result = a - b
  else result = String(a).localeCompare(String(b), locale, { numeric: true, sensitivity: "base" })
  return direction === "asc" ? result : -result
}

export function sortRecords<T extends MultiRecord>(
  records: readonly T[],
  fields: readonly FieldDef[],
  sort: SortClause | null | undefined,
  locale?: string,
): T[] {
  if (!sort) return [...records]
  const field = fieldById(fields, sort.field)
  if (!field) return [...records]
  return records
    .map((record, index) => ({ record, index }))
    .sort((a, b) => {
      const result = compareFieldValues(a.record, b.record, field, sort.direction, locale)
      return result || a.index - b.index
    })
    .map((entry) => entry.record)
}

export function groupKey(record: MultiRecord, field: FieldDef): string {
  const value = record[field.id]
  if (isEmptyValue(value)) return ""
  if (field.type === "person" || field.type === "relation") return asPerson(value)?.name ?? ""
  if (field.type === "boolean") return value === true ? "true" : "false"
  return String(value)
}

export function groupRecords<T extends MultiRecord>(
  records: readonly T[],
  fields: readonly FieldDef[],
  fieldId: string | null | undefined,
  options?: { includeEmpty?: boolean; emptyLabel?: string; locale?: string },
): RecordGroup<T>[] {
  const field = fieldById(fields, fieldId ?? undefined)
  if (!field) {
    return [{ key: "", label: options?.emptyLabel ?? "All", records: [...records], sum: null }]
  }
  const buckets = new Map<string, T[]>()
  for (const record of records) {
    const key = groupKey(record, field)
    const list = buckets.get(key)
    if (list) list.push(record)
    else buckets.set(key, [record])
  }
  const keys: string[] = []
  if (field.options?.length) {
    for (const option of field.options) keys.push(option.value)
  }
  if (field.type === "boolean") keys.push("true", "false")
  for (const key of buckets.keys()) {
    if (!keys.includes(key)) keys.push(key)
  }
  if (!keys.includes("") && buckets.has("")) keys.push("")

  const emptyLabel = options?.emptyLabel ?? "Empty"
  return keys.filter((key) => options?.includeEmpty || (buckets.get(key)?.length ?? 0) > 0)
    .map((key) => ({
      key,
      label: key === "" ? emptyLabel : labelForGroup(field, key),
      records: buckets.get(key) ?? [],
      sum: null,
    }))
}

function labelForGroup(field: FieldDef, key: string): string {
  if (field.type === "boolean") return key === "true" ? "Yes" : "No"
  if (field.type === "select" || field.type === "status") return optionLabel(field, key)
  return key
}

export function sumField(
  records: readonly MultiRecord[],
  field: FieldDef | undefined,
): number | null {
  if (!field) return null
  let total = 0
  let any = false
  for (const record of records) {
    const n = asNumber(record[field.id])
    if (n == null) continue
    total += n
    any = true
  }
  return any ? total : null
}

export function groupRecordsWithSum<T extends MultiRecord>(
  records: readonly T[],
  fields: readonly FieldDef[],
  fieldId: string | null | undefined,
  sumFieldId: string | undefined,
  options?: { includeEmpty?: boolean; emptyLabel?: string; locale?: string },
): RecordGroup<T>[] {
  const groups = groupRecords(records, fields, fieldId, options)
  const metric = fieldById(fields, sumFieldId)
  return groups.map((group) => ({ ...group, sum: sumField(group.records, metric) }))
}

/** Six weeks, Monday-first unless `weekStartsOn` says otherwise. `monthIndex` is 0–11. */
export function monthGrid(year: number, monthIndex: number, weekStartsOn = 1): CalendarDay[] {
  const first = formatDateOnly({ y: year, m: monthIndex + 1, d: 1 })
  const origin = startOfWeek(first, weekStartsOn) ?? first
  const days: CalendarDay[] = []
  for (let index = 0; index < 42; index += 1) {
    const iso = addDays(origin, index) ?? origin
    const parts = parseDateOnly(iso)
    days.push({
      iso,
      inMonth: Boolean(parts && parts.y === year && parts.m === monthIndex + 1),
    })
  }
  return days
}

export function chunkWeeks(days: readonly CalendarDay[]): CalendarDay[][] {
  const weeks: CalendarDay[][] = []
  for (let index = 0; index < days.length; index += 7) weeks.push(days.slice(index, index + 7))
  return weeks
}

export function shiftIso(iso: string, zoom: TimelineZoom, units: number): string | null {
  if (zoom === "day") return addDays(iso, units)
  if (zoom === "week") return addDays(iso, units * 7)
  if (zoom === "month") return addMonths(iso, units)
  return addMonths(iso, units * 3)
}

export function snapToUnit(iso: string, zoom: TimelineZoom, weekStartsOn = 1): string | null {
  if (!parseDateOnly(iso)) return null
  if (zoom === "day") return iso
  if (zoom === "week") return startOfWeek(iso, weekStartsOn)
  if (zoom === "month") return startOfMonth(iso)
  return startOfQuarter(iso)
}

export function unitsBetween(
  start: string,
  end: string,
  zoom: TimelineZoom,
  weekStartsOn = 1,
): number | null {
  const a = snapToUnit(start, zoom, weekStartsOn)
  const b = snapToUnit(end, zoom, weekStartsOn)
  if (!a || !b) return null
  if (zoom === "day" || zoom === "week") {
    const days = diffDays(a, b)
    if (days == null) return null
    return zoom === "day" ? days : Math.round(days / 7)
  }
  const pa = parseDateOnly(a)
  const pb = parseDateOnly(b)
  if (!pa || !pb) return null
  const months = (pb.y - pa.y) * 12 + (pb.m - pa.m)
  return zoom === "month" ? months : Math.round(months / 3)
}

/** Inclusive range. A same-day bar still occupies one unit. */
export function barPlacement(
  rangeStart: string,
  start: string,
  end: string,
  zoom: TimelineZoom,
  weekStartsOn = 1,
): { offset: number; span: number } | null {
  const offset = unitsBetween(rangeStart, start, zoom, weekStartsOn)
  const raw = unitsBetween(start, end, zoom, weekStartsOn)
  if (offset == null || raw == null) return null
  return { offset, span: Math.max(1, raw + 1) }
}

export function moveRange(
  start: string,
  end: string,
  zoom: TimelineZoom,
  units: number,
): { start: string; end: string } | null {
  const nextStart = shiftIso(start, zoom, units)
  const nextEnd = shiftIso(end, zoom, units)
  if (!nextStart || !nextEnd) return null
  return { start: nextStart, end: nextEnd }
}

export function resizeRange(
  start: string,
  end: string,
  edge: "start" | "end",
  zoom: TimelineZoom,
  units: number,
): { start: string; end: string } | null {
  if (edge === "end") {
    const next = shiftIso(end, zoom, units)
    if (!next) return null
    if ((diffDays(start, next) ?? -1) < 0) return { start, end: start }
    return { start, end: next }
  }
  const next = shiftIso(start, zoom, units)
  if (!next) return null
  if ((diffDays(next, end) ?? -1) < 0) return { start: end, end }
  return { start: next, end }
}

export function timelineRange(
  records: readonly MultiRecord[],
  startField: string,
  endField: string,
  zoom: TimelineZoom,
  today: string,
  weekStartsOn = 1,
): { start: string; end: string } {
  let min = today
  let max = today
  for (const record of records) {
    const start = record[startField]
    const end = record[endField]
    if (typeof start === "string" && parseDateOnly(start) && start < min) min = start
    if (typeof end === "string" && parseDateOnly(end) && end > max) max = end
  }
  const paddedStart = shiftIso(min, zoom, -1) ?? min
  const paddedEnd = shiftIso(max, zoom, 1) ?? max
  return {
    start: snapToUnit(paddedStart, zoom, weekStartsOn) ?? paddedStart,
    end: snapToUnit(paddedEnd, zoom, weekStartsOn) ?? paddedEnd,
  }
}

export function timelineTicks(
  start: string,
  end: string,
  zoom: TimelineZoom,
  locale?: string,
  weekStartsOn = 1,
): TimelineTick[] {
  const ticks: TimelineTick[] = []
  let cursor = snapToUnit(start, zoom, weekStartsOn)
  const limit = 400
  while (cursor && cursor <= end && ticks.length < limit) {
    ticks.push({ iso: cursor, label: tickLabel(cursor, zoom, locale) })
    cursor = shiftIso(cursor, zoom, 1)
  }
  return ticks
}

function tickLabel(iso: string, zoom: TimelineZoom, locale?: string): string {
  const parts = parseDateOnly(iso)
  if (!parts) return iso
  const date = new Date(Date.UTC(parts.y, parts.m - 1, parts.d))
  if (zoom === "day") {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(date)
  }
  if (zoom === "week") {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(date)
  }
  if (zoom === "month") {
    return new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" }).format(date)
  }
  const quarter = Math.floor((parts.m - 1) / 3) + 1
  return `Q${quarter} ${parts.y}`
}

export function recordsToCsv(
  records: readonly MultiRecord[],
  fields: readonly FieldDef[],
  locale?: string,
): string {
  const columns: CsvColumn[] = fields.map((field) => ({ key: field.id, header: field.label }))
  const rows = records.map((record) => {
    const row: Record<string, unknown> = {}
    for (const field of fields) row[field.id] = formatFieldValue(record[field.id], field, locale)
    return row
  })
  return toCsv(rows, columns)
}

export function encodeFilters(filters: readonly FilterClause[]): string {
  return filters
    .map((clause) =>
      [clause.field, clause.op, clause.value ?? ""].map((part) => encodeURIComponent(part)).join("~"),
    )
    .join("|")
}

export function decodeFilters(raw: string | null | undefined): FilterClause[] {
  if (!raw) return []
  const clauses: FilterClause[] = []
  for (const part of raw.split("|")) {
    if (!part) continue
    const [fieldRaw, opRaw, valueRaw = ""] = part.split("~")
    if (!fieldRaw || !opRaw) continue
    const field = decodeURIComponent(fieldRaw)
    const op = decodeURIComponent(opRaw)
    if (!isFilterOp(op)) continue
    clauses.push({
      id: `url-${clauses.length}`,
      field,
      op,
      value: decodeURIComponent(valueRaw),
    })
  }
  return clauses
}

export function encodeSort(sort: SortClause | null | undefined): string | null {
  if (!sort) return null
  return `${sort.field}:${sort.direction}`
}

export function decodeSort(raw: string | null | undefined): SortClause | null {
  if (!raw) return null
  const split = raw.indexOf(":")
  if (split < 1) return null
  const field = raw.slice(0, split)
  const direction = raw.slice(split + 1)
  if (direction !== "asc" && direction !== "desc") return null
  return { field, direction }
}

export function draftFromFormData(
  formData: FormData,
  fields: readonly FieldDef[],
): Record<string, unknown> {
  const draft: Record<string, unknown> = {}
  for (const field of fields) {
    if (field.readOnly) continue
    if (field.type === "boolean") {
      const raw = formData.get(field.id)
      draft[field.id] = raw === "true" || raw === "on"
      continue
    }
    if (field.type === "daterange") {
      const start = formData.get(field.id)
      const end = formData.get(`${field.id}__end`)
      if (typeof start === "string" && start && typeof end === "string" && end) {
        draft[field.id] = { start, end }
      }
      continue
    }
    const raw = formData.get(field.id)
    if (typeof raw !== "string" || raw.trim() === "") continue
    if (field.type === "number" || field.type === "currency" || field.type === "progress") {
      draft[field.id] = Number(raw)
      continue
    }
    draft[field.id] = raw
  }
  return draft
}

export function validateDraft(
  draft: Record<string, unknown>,
  fields: readonly FieldDef[],
  titleField?: string,
): string | null {
  const title = titleFieldOf(fields, titleField)
  if (title && !title.readOnly) {
    const value = draft[title.id]
    if (typeof value !== "string" || !value.trim()) return `${title.label} is required`
  }
  for (const field of fields) {
    if (field.type !== "number" && field.type !== "currency" && field.type !== "progress") continue
    const value = draft[field.id]
    if (value == null || value === "") continue
    if (typeof value === "number" && !Number.isFinite(value)) return `${field.label} must be a number`
    if (typeof value === "string" && value.trim() !== "" && !Number.isFinite(Number(value))) {
      return `${field.label} must be a number`
    }
  }
  return null
}

export function createRecordId(prefix = "rec"): string {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}`
}
