/**
 * Clean-room schedule model for a workstream Gantt.
 * Behavior only: no mockup source, copy, colors, or assets.
 * Chrome defaults to Spanish (es-MX). Pass `labels` or `timelineGanttLabelsEn`.
 * Dates are calendar days. `now` may be a full timestamp; the day is read in UTC.
 * `TMeta` is the host payload. This module never reads it.
 */

export const GANTT_SCALES = ["day", "week", "month"] as const

export type GanttScale = (typeof GANTT_SCALES)[number]

export const GANTT_STATUSES = ["planned", "active", "blocked", "done", "at-risk"] as const

export type GanttStatus = (typeof GANTT_STATUSES)[number]

export const GANTT_ROW_HEIGHT = 40

export const GANTT_GROUP_HEIGHT = 32

export const GANTT_LABEL_WIDTH = 176

export const DAY_MS = 86_400_000

export const GANTT_DAY_WIDTH: Record<GanttScale, number> = {
  day: 36,
  week: 16,
  month: 6,
}

export type GanttAssignee = {
  id: string
  name: string
}

export type GanttMetric = {
  id: string
  label: string
  value: string
}

export type GanttItem<TMeta = Record<string, unknown>> = {
  id: string
  workstream: string
  label: string
  /** Inclusive calendar day, YYYY-MM-DD. */
  start: string
  /** Inclusive calendar day, YYYY-MM-DD. */
  end: string
  status: GanttStatus
  deps?: readonly string[]
  description?: string
  assignees?: readonly GanttAssignee[]
  metrics?: readonly GanttMetric[]
  /** Host payload. The gantt never reads it. */
  meta?: TMeta
}

export type GanttWorkstream = {
  id: string
  label: string
}

export type GanttDomain = {
  /** Inclusive UTC midnight. */
  start: number
  /** Exclusive UTC midnight. */
  end: number
}

export type GanttTick = {
  id: string
  start: number
  end: number
  label: string
  x: number
  width: number
}

export type GanttBar = {
  id: string
  x: number
  width: number
  start: number
  end: number
}

export type GanttGroupLayout = {
  id: string
  label: string
  y: number
  height: number
  tasks: { id: string; index: number; y: number; height: number }[]
}

export type GanttDependency = {
  fromId: string
  toId: string
}

export type TimelineGanttLabels = {
  heading: string
  labelColumn: string
  scaleLabel: string
  day: string
  week: string
  month: string
  today: string
  emptyTitle: string
  emptyHint: string
  loading: string
  errorTitle: string
  retry: string
  disabledNote: string
  statusLabel: string
  start: string
  end: string
  dependencies: string
  noDependencies: string
  open: string
  announcements: string
  people: string
  status: Record<GanttStatus, string>
  openItem: (label: string) => string
  barLabel: (label: string, start: string, end: string, status: string) => string
  dependency: (from: string, to: string) => string
  workstream: (label: string, count: number) => string
  selected: (label: string) => string
}

export const timelineGanttLabels: TimelineGanttLabels = {
  heading: "Cronograma",
  labelColumn: "Frentes",
  scaleLabel: "Escala",
  day: "Día",
  week: "Semana",
  month: "Mes",
  today: "Hoy",
  emptyTitle: "No hay tareas en este periodo",
  emptyHint: "Cuando lleguen encargos, aparecen como barras.",
  loading: "Cargando el cronograma",
  errorTitle: "No se pudo mostrar el cronograma",
  retry: "Reintentar",
  disabledNote: "El cronograma está deshabilitado",
  statusLabel: "Estado",
  start: "Inicio",
  end: "Fin",
  dependencies: "Depende de",
  noDependencies: "Sin dependencias",
  open: "Abrir",
  announcements: "Avisos del cronograma",
  people: "Personas",
  status: {
    planned: "Planeado",
    active: "En curso",
    blocked: "Bloqueado",
    done: "Hecho",
    "at-risk": "En riesgo",
  },
  openItem: (label) => `Abrir ${label}`,
  barLabel: (label, start, end, status) => `${label}, ${status}, del ${start} al ${end}`,
  dependency: (from, to) => `${to} depende de ${from}`,
  workstream: (label, count) => `${label}, ${count}`,
  selected: (label) => `${label} seleccionado`,
}

export const timelineGanttLabelsEn: TimelineGanttLabels = {
  heading: "Schedule",
  labelColumn: "Workstreams",
  scaleLabel: "Scale",
  day: "Day",
  week: "Week",
  month: "Month",
  today: "Today",
  emptyTitle: "No tasks in this range",
  emptyHint: "Bars show up here when work is scheduled.",
  loading: "Loading the schedule",
  errorTitle: "The schedule could not be shown",
  retry: "Try again",
  disabledNote: "The schedule is disabled",
  statusLabel: "Status",
  start: "Start",
  end: "End",
  dependencies: "Depends on",
  noDependencies: "No dependencies",
  open: "Open",
  announcements: "Schedule announcements",
  people: "People",
  status: {
    planned: "Planned",
    active: "Active",
    blocked: "Blocked",
    done: "Done",
    "at-risk": "At risk",
  },
  openItem: (label) => `Open ${label}`,
  barLabel: (label, start, end, status) => `${label}, ${status}, ${start} to ${end}`,
  dependency: (from, to) => `${to} depends on ${from}`,
  workstream: (label, count) => `${label}, ${count}`,
  selected: (label) => `${label} selected`,
}

export function withGanttLabels(labels?: Partial<TimelineGanttLabels>): TimelineGanttLabels {
  return { ...timelineGanttLabels, ...labels, status: { ...timelineGanttLabels.status, ...labels?.status } }
}

/** UTC midnight for a YYYY-MM-DD prefix, or null when the day is not real. */
export function utcDay(iso: string): number | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  const ms = Date.UTC(year, month - 1, day)
  const check = new Date(ms)
  if (check.getUTCFullYear() !== year || check.getUTCMonth() !== month - 1 || check.getUTCDate() !== day) return null
  return ms
}

export function isoDay(ms: number): string {
  return new Date(ms).toISOString().slice(0, 10)
}

export function addUtcDays(ms: number, days: number) {
  return ms + days * DAY_MS
}

export function startOfUtcDay(ms: number) {
  const date = new Date(ms)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function startOfUtcWeek(ms: number, weekStartsOn = 1) {
  const day = new Date(ms).getUTCDay()
  const delta = (day - weekStartsOn + 7) % 7
  return ms - delta * DAY_MS
}

export function startOfUtcMonth(ms: number) {
  const date = new Date(ms)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1)
}

export function addUtcMonths(ms: number, count: number) {
  const date = new Date(ms)
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + count, 1)
}

export function isUtcWeekend(ms: number) {
  const day = new Date(ms).getUTCDay()
  return day === 0 || day === 6
}

export function formatGanttDate(iso: string, locale: string) {
  const ms = utcDay(iso)
  if (ms == null) return iso
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(ms)
}

export function ganttDomain(
  items: readonly { start: string; end: string }[],
  scale: GanttScale,
  nowMs: number,
  weekStartsOn = 1,
): GanttDomain {
  const stamps: number[] = []
  for (const item of items) {
    const start = utcDay(item.start)
    const end = utcDay(item.end)
    if (start != null) stamps.push(start)
    if (end != null) stamps.push(end)
  }
  const safeNow = Number.isFinite(nowMs) ? nowMs : Date.UTC(2026, 0, 1)
  let first = stamps.length ? Math.min(...stamps) : startOfUtcDay(safeNow)
  let last = stamps.length ? Math.max(...stamps) : first
  if (last < first) last = first
  const near = 45 * DAY_MS
  if (safeNow >= first - near && safeNow <= last + near) {
    const today = startOfUtcDay(safeNow)
    first = Math.min(first, today)
    last = Math.max(last, today)
  }
  if (scale === "month") {
    const start = startOfUtcMonth(first)
    const end = addUtcMonths(startOfUtcMonth(last), 1)
    return { start, end: Math.max(end, addUtcMonths(start, 1)) }
  }
  if (scale === "week") {
    const start = startOfUtcWeek(addUtcDays(first, -7), weekStartsOn)
    const end = addUtcDays(startOfUtcWeek(last, weekStartsOn), 14)
    return { start, end }
  }
  return { start: addUtcDays(first, -1), end: addUtcDays(last, 2) }
}

export function timelineWidth(domain: GanttDomain, dayWidth: number) {
  const days = Math.max(1, Math.round((domain.end - domain.start) / DAY_MS))
  return days * dayWidth
}

export function ganttTicks(
  domain: GanttDomain,
  scale: GanttScale,
  locale: string,
  dayWidth: number,
  weekStartsOn = 1,
): GanttTick[] {
  const ticks: GanttTick[] = []
  const guard = 500
  if (scale === "day") {
    let cursor = domain.start
    for (let count = 0; cursor < domain.end && count < guard; count += 1) {
      ticks.push({
        id: isoDay(cursor),
        start: cursor,
        end: cursor + DAY_MS,
        label: new Intl.DateTimeFormat(locale, { weekday: "narrow", day: "numeric", timeZone: "UTC" }).format(cursor),
        x: ((cursor - domain.start) / DAY_MS) * dayWidth,
        width: dayWidth,
      })
      cursor += DAY_MS
    }
    return ticks
  }
  if (scale === "week") {
    let cursor = startOfUtcWeek(domain.start, weekStartsOn)
    for (let count = 0; cursor < domain.end && count < guard; count += 1) {
      const weekEnd = addUtcDays(cursor, 7)
      const start = Math.max(cursor, domain.start)
      const end = Math.min(weekEnd, domain.end)
      if (end > start) {
        ticks.push({
          id: isoDay(start),
          start,
          end,
          label: new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", timeZone: "UTC" }).format(start),
          x: ((start - domain.start) / DAY_MS) * dayWidth,
          width: ((end - start) / DAY_MS) * dayWidth,
        })
      }
      cursor = weekEnd
    }
    return ticks
  }
  let cursor = startOfUtcMonth(domain.start)
  for (let count = 0; cursor < domain.end && count < guard; count += 1) {
    const next = addUtcMonths(cursor, 1)
    const start = Math.max(cursor, domain.start)
    const end = Math.min(next, domain.end)
    if (end > start) {
      ticks.push({
        id: isoDay(cursor),
        start,
        end,
        label: new Intl.DateTimeFormat(locale, { month: "short", year: "numeric", timeZone: "UTC" }).format(cursor),
        x: ((start - domain.start) / DAY_MS) * dayWidth,
        width: ((end - start) / DAY_MS) * dayWidth,
      })
    }
    cursor = next
  }
  return ticks
}

export function ganttBar(
  item: { id: string; start: string; end: string },
  domain: GanttDomain,
  dayWidth: number,
): GanttBar | null {
  const start = utcDay(item.start)
  let end = utcDay(item.end)
  if (start == null || end == null) return null
  if (end < start) end = start
  const exclusive = end + DAY_MS
  const x = ((start - domain.start) / DAY_MS) * dayWidth
  const width = Math.max(dayWidth * 0.7, ((exclusive - start) / DAY_MS) * dayWidth - 6)
  return { id: item.id, x, width, start, end: exclusive }
}

export function todayOffset(nowIso: string, domain: GanttDomain, dayWidth: number): number | null {
  const day = utcDay(nowIso)
  if (day == null || day < domain.start || day >= domain.end) return null
  const parsed = Date.parse(nowIso)
  const fraction = Number.isFinite(parsed) ? Math.min(1, Math.max(0, (parsed - day) / DAY_MS)) : 0
  return ((day - domain.start) / DAY_MS + fraction) * dayWidth
}

export function groupWorkstreams<T extends { workstream: string }>(
  items: readonly T[],
  workstreams?: readonly GanttWorkstream[],
) {
  const listed = new Set((workstreams ?? []).map((stream) => stream.id))
  const labels = new Map((workstreams ?? []).map((stream) => [stream.id, stream.label]))
  const order: string[] = []
  const groups = new Map<string, number[]>()
  for (const stream of workstreams ?? []) {
    if (groups.has(stream.id)) continue
    order.push(stream.id)
    groups.set(stream.id, [])
  }
  items.forEach((item, index) => {
    if (!groups.has(item.workstream)) {
      order.push(item.workstream)
      groups.set(item.workstream, [])
    }
    groups.get(item.workstream)?.push(index)
  })
  return order
    .filter((id) => (groups.get(id)?.length ?? 0) > 0 || listed.has(id))
    .map((id) => ({
      id,
      label: labels.get(id) ?? id,
      indexes: groups.get(id) ?? [],
    }))
}

export function layoutGroups(
  items: readonly { id: string; workstream: string }[],
  workstreams: readonly GanttWorkstream[] | undefined,
  rowHeight = GANTT_ROW_HEIGHT,
  groupHeight = GANTT_GROUP_HEIGHT,
) {
  const groups: GanttGroupLayout[] = []
  let y = 0
  for (const group of groupWorkstreams(items, workstreams)) {
    const groupY = y
    y += groupHeight
    const tasks = group.indexes.map((index) => {
      const task = { id: items[index]?.id ?? String(index), index, y, height: rowHeight }
      y += rowHeight
      return task
    })
    groups.push({ id: group.id, label: group.label, y: groupY, height: groupHeight, tasks })
  }
  return { groups, height: y }
}

export function ganttDependencies(items: readonly { id: string; deps?: readonly string[] }[]): GanttDependency[] {
  const ids = new Set(items.map((item) => item.id))
  const seen = new Set<string>()
  const links: GanttDependency[] = []
  for (const item of items) {
    for (const dep of item.deps ?? []) {
      if (!ids.has(dep) || dep === item.id) continue
      const key = `${dep}->${item.id}`
      if (seen.has(key)) continue
      seen.add(key)
      links.push({ fromId: dep, toId: item.id })
    }
  }
  return links
}

export function dependencyCurve(
  from: { x: number; width: number; y: number },
  to: { x: number; y: number },
  rowHeight: number,
) {
  const x1 = from.x + from.width
  const y1 = from.y + rowHeight / 2
  const x2 = to.x
  const y2 = to.y + rowHeight / 2
  const bend = Math.max(12, Math.min(40, Math.abs(x2 - x1) * 0.45))
  const endX = x2 - 4
  const round = (value: number) => Math.round(value * 10) / 10
  return {
    d: `M ${round(x1)} ${round(y1)} C ${round(x1 + bend)} ${round(y1)}, ${round(endX - bend)} ${round(y2)}, ${round(endX)} ${round(y2)}`,
    x: round(x2),
    y: round(y2),
  }
}
