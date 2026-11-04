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

/** Label column. An explicit width wins. Otherwise it grows with the container and stays narrow on a phone. */
export function ganttLabelWidth(containerWidth: number, explicit?: number) {
  if (explicit != null) return explicit
  if (!(containerWidth > 0)) return GANTT_LABEL_WIDTH
  return Math.round(Math.min(320, Math.max(144, containerWidth * 0.24)))
}

/**
 * Timeline width. When the container is wider than the natural scale, the days stretch
 * so the board fills the card. A narrower container keeps the natural width and scrolls.
 */
export function ganttBoard(naturalWidth: number, containerWidth: number, labelWidth: number) {
  const content = labelWidth + Math.max(0, naturalWidth)
  const board = containerWidth > content ? containerWidth : content
  const drawn = Math.max(0, board - labelWidth)
  const scale = naturalWidth > 0 ? drawn / naturalWidth : 1
  return { board, drawn, scale }
}

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
  /**
   * Fraction from 0 to 1. `0.5` is 50% and `1` is 100%.
   * Values below 0 or above 1 are clamped. In development, a value above 1
   * also logs a warning: it is not read as a percent.
   * Omitted, NaN, and non-finite values draw the solid status bar.
   */
  progress?: number
  /**
   * Zero-duration marker. It keeps its dates on the scale and does not
   * weight `workstreamProgress`.
   */
  milestone?: boolean
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
  /** Short visible status. The full word stays in the accessible name. */
  statusShort: Record<GanttStatus, string>
  /** The date control's written format is the browser's, not this locale. */
  dateHint: string
  progressHint: string
  openItem: (label: string) => string
  barLabel: (label: string, start: string, end: string, status: string) => string
  dependency: (from: string, to: string) => string
  workstream: (label: string, count: number) => string
  selected: (label: string) => string
  progress: string
  noProgress: string
  edit: string
  editTitle: string
  editDescription: string
  taskName: string
  assignee: string
  save: string
  cancel: string
  invalidName: string
  invalidRange: string
  invalidDate: string
  invalidProgress: string
  progressValue: (percent: number) => string
  groupProgress: (label: string, percent: number) => string
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
  statusShort: {
    planned: "Plan",
    active: "Curso",
    blocked: "Bloq.",
    done: "Hecho",
    "at-risk": "Riesgo",
  },
  dateHint: "El formato de la fecha lo pone el navegador.",
  progressHint: "De 0 a 100.",
  openItem: (label) => `Abrir ${label}`,
  barLabel: (label, start, end, status) => `${label}, ${status}, del ${start} al ${end}`,
  dependency: (from, to) => `${to} depende de ${from}`,
  workstream: (label, count) => `${label}, ${count}`,
  selected: (label) => `${label} seleccionado`,
  progress: "Avance",
  noProgress: "Sin avance",
  edit: "Editar",
  editTitle: "Editar tarea",
  editDescription: "Los cambios se los queda el anfitrión. Aquí no se guardan solos.",
  taskName: "Nombre",
  assignee: "Responsable",
  save: "Guardar",
  cancel: "Cancelar",
  invalidName: "Escribe un nombre.",
  invalidRange: "La fecha de fin no puede ser anterior al inicio.",
  invalidDate: "Usa una fecha real.",
  invalidProgress: "El avance va de 0 a 100.",
  progressValue: (percent) => `${percent}% de avance`,
  groupProgress: (label, percent) => `${label}, ${percent}% de avance`,
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
  statusShort: {
    planned: "Plan",
    active: "Active",
    blocked: "Hold",
    done: "Done",
    "at-risk": "Risk",
  },
  dateHint: "The date format comes from the browser.",
  progressHint: "From 0 to 100.",
  openItem: (label) => `Open ${label}`,
  barLabel: (label, start, end, status) => `${label}, ${status}, ${start} to ${end}`,
  dependency: (from, to) => `${to} depends on ${from}`,
  workstream: (label, count) => `${label}, ${count}`,
  selected: (label) => `${label} selected`,
  progress: "Progress",
  noProgress: "No progress",
  edit: "Edit",
  editTitle: "Edit task",
  editDescription: "The host keeps the changes. Nothing is saved here.",
  taskName: "Name",
  assignee: "Owner",
  save: "Save",
  cancel: "Cancel",
  invalidName: "Enter a name.",
  invalidRange: "The end date cannot be before the start.",
  invalidDate: "Use a real date.",
  invalidProgress: "Progress is from 0 to 100.",
  progressValue: (percent) => `${percent}% progress`,
  groupProgress: (label, percent) => `${label}, ${percent}% progress`,
}

export function withGanttLabels(labels?: Partial<TimelineGanttLabels>): TimelineGanttLabels {
  return {
    ...timelineGanttLabels,
    ...labels,
    status: { ...timelineGanttLabels.status, ...labels?.status },
    statusShort: { ...timelineGanttLabels.statusShort, ...labels?.statusShort },
  }
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

/**
 * Theme tokens for the progress fill.
 * Fill is `foreground`, track is `muted`, the row surface is `background`.
 * A `foreground` border marks the track, because muted against background is under 3:1.
 * Status colors are not the fill: `chart-4` is under 3:1 on the dark background.
 */
export const GANTT_PROGRESS_PAINT = {
  fill: "foreground",
  track: "muted",
  surface: "background",
  edge: "foreground",
} as const

/**
 * Reads `progress` as a fraction from 0 to 1.
 * `0.5` is 50%. `1` is 100%.
 * Below 0 clamps to 0. Above 1 clamps to 1.
 * In development, a finite value above 1 also warns once per call.
 * It is not treated as a percent: `50` becomes 1, not 50%.
 * NaN, Infinity, and anything that is not a number are missing (`null`), not 0.
 */
export function parseGanttProgress(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null
  if (process.env.NODE_ENV !== "production" && value > 1) {
    console.warn(
      `[timeline-gantt] progress ${value} is outside 0–1 and was clamped to 1. Pass a fraction (0.5 is 50%).`,
    )
  }
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

/**
 * Inclusive calendar days. A one-day task (`start === end`) weighs 1.
 * Returns 0 when the end is before the start (a zero-duration milestone).
 * Returns null when either day is not a real calendar day.
 */
export function ganttSpanDays(start: string, end: string): number | null {
  const from = utcDay(start)
  const to = utcDay(end)
  if (from == null || to == null) return null
  const days = Math.round((to - from) / DAY_MS)
  if (days < 0) return 0
  return days + 1
}

export type WorkstreamProgress = {
  /** Null when no positive-duration task has a known progress. Not zero. */
  ratio: number | null
  percent: number | null
  /** Inclusive days that had a known progress and a positive duration. */
  weightDays: number
  /** Tasks left out because progress was missing or the dates were not real. */
  omitted: number
  /** `milestone` tasks and ranges whose end is before the start. Weight 0. */
  milestones: number
}

/**
 * Duration-weighted progress for one workstream.
 * Tasks without a finite progress are left out of both sides of the ratio.
 * They are not treated as 0%.
 * Zero-duration milestones (`milestone: true`, or end before start) do not move the ratio.
 * A one-day task weighs 1. An empty list is `{ ratio: null }`, not 0%.
 * If every remaining weight is 0, the ratio is null.
 */
export function workstreamProgress(
  items: readonly { start: string; end: string; progress?: number; milestone?: boolean }[],
): WorkstreamProgress {
  if (items.length === 0) {
    return { ratio: null, percent: null, weightDays: 0, omitted: 0, milestones: 0 }
  }
  let weight = 0
  let weighted = 0
  let omitted = 0
  let milestones = 0
  for (const item of items) {
    const span = ganttSpanDays(item.start, item.end)
    if (span == null) {
      omitted += 1
      continue
    }
    if (item.milestone === true || span === 0) {
      milestones += 1
      continue
    }
    const ratio = parseGanttProgress(item.progress)
    if (ratio == null) {
      omitted += 1
      continue
    }
    weight += span
    weighted += ratio * span
  }
  if (weight <= 0) {
    return { ratio: null, percent: null, weightDays: 0, omitted, milestones }
  }
  const ratio = weighted / weight
  return { ratio, percent: Math.round(ratio * 100), weightDays: weight, omitted, milestones }
}

/** Inclusive union of real dates. Inverted ranges still contribute their days. */
export function ganttGroupSpan(items: readonly { start: string; end: string }[]): { start: string; end: string } | null {
  let start: number | null = null
  let end: number | null = null
  for (const item of items) {
    const from = utcDay(item.start)
    const to = utcDay(item.end)
    if (from == null || to == null) continue
    const first = Math.min(from, to)
    const last = Math.max(from, to)
    start = start == null ? first : Math.min(start, first)
    end = end == null ? last : Math.max(end, last)
  }
  if (start == null || end == null) return null
  return { start: isoDay(start), end: isoDay(end) }
}

export type GanttTaskPatch = {
  label?: string
  start?: string
  end?: string
  status?: GanttStatus
  /** Fraction 0–1. `null` clears the progress. */
  progress?: number | null
  assignees?: readonly GanttAssignee[]
}

/** Pure merge. The gantt does not call this. The host does, after `onTaskChangeRequest`. */
export function applyGanttTaskPatch<TMeta>(
  items: readonly GanttItem<TMeta>[],
  taskId: string,
  patch: GanttTaskPatch,
): GanttItem<TMeta>[] {
  return items.map((item) => {
    if (item.id !== taskId) return item
    const next: GanttItem<TMeta> = { ...item }
    if (patch.label != null) next.label = patch.label
    if (patch.start != null) next.start = patch.start
    if (patch.end != null) next.end = patch.end
    if (patch.status != null) next.status = patch.status
    if (patch.assignees != null) next.assignees = patch.assignees
    if (patch.progress === null) delete next.progress
    else if (patch.progress != null) {
      const ratio = parseGanttProgress(patch.progress)
      if (ratio != null) next.progress = ratio
    }
    return next
  })
}

/**
 * Orthogonal dependency. Leaves the predecessor's end, runs through the
 * boundary between rows, and enters the successor's start. No curve.
 */
export function dependencyElbow(
  from: { x: number; width: number; y: number },
  to: { x: number; y: number },
  rowHeight: number,
) {
  const x1 = from.x + from.width
  const y1 = from.y + rowHeight / 2
  const x2 = to.x
  const y2 = to.y + rowHeight / 2
  const round = (value: number) => Math.round(value * 10) / 10
  if (Math.abs(y1 - y2) < 1) {
    return { d: `M ${round(x1)} ${round(y1)} H ${round(x2)}`, x: round(x2), y: round(y2) }
  }
  const stub = 8
  const outX = x1 + stub
  const inX = x2 - stub
  const channelY = y1 < y2 ? from.y + rowHeight - 1 : from.y + 1
  return {
    d: `M ${round(x1)} ${round(y1)} H ${round(outX)} V ${round(channelY)} H ${round(inX)} V ${round(y2)} H ${round(x2)}`,
    x: round(x2),
    y: round(y2),
  }
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
