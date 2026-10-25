/**
 * Clean-room agenda model.
 * The behavior was observed. No mockup source, copy, colors, or assets were copied.
 * Chrome defaults to Spanish. Pass `labels` for another language.
 * Time zones reuse `date-range` (`timeZoneOffsetMs`, `startOfZonedDay`, `addZonedDays`).
 * `view-calendar` stays the date-field month inside multi-view.
 */

import { addZonedDays, startOfZonedDay, timeZoneOffsetMs } from "@/registry/retana/lib/date-range"

export const AGENDA_VIEWS = ["day", "week", "month"] as const

export type AgendaView = (typeof AGENDA_VIEWS)[number]

export const AGENDA_PARTICIPANT_STATUSES = ["confirmed", "pending", "declined"] as const

export type AgendaParticipantStatus = (typeof AGENDA_PARTICIPANT_STATUSES)[number]

export const AGENDA_TONES = ["neutral", "accent", "warning", "critical", "info", "positive"] as const

export type AgendaTone = (typeof AGENDA_TONES)[number]

export const AGENDA_CHANGE_SOURCES = ["move", "resize", "all-day", "create"] as const

export type AgendaChangeSource = (typeof AGENDA_CHANGE_SOURCES)[number]

export const DEFAULT_AGENDA_TIME_ZONE = "America/Mexico_City"

export const DEFAULT_AGENDA_LOCALE = "es-MX"

export const DEFAULT_WEEK_STARTS_ON = 1

export const DEFAULT_SNAP_MINUTES = 15

const DAY_MS = 86_400_000

export type AgendaParticipant = {
  id: string
  name: string
  status: AgendaParticipantStatus
}

export type AgendaCategory = {
  id: string
  label: string
  /** Key for the icon map in the event card. Unknown keys use a calendar icon. */
  icon?: string
  tone?: AgendaTone
}

/**
 * `TMeta` is the host's extra payload. The agenda never reads it.
 * `taskId` and `recordId` are opaque host ids. The agenda does not open them.
 */
export type AgendaEvent<TMeta = Record<string, unknown>> = {
  id: string
  title: string
  description?: string
  startsAt: string
  endsAt: string
  allDay?: boolean
  categoryId?: string | null
  location?: string
  attention?: boolean
  taskId?: string | null
  recordId?: string | null
  participants?: readonly AgendaParticipant[]
  meta?: TMeta
}

export type AgendaMove = {
  startsAt: string
  endsAt: string
  allDay?: boolean
}

export type AgendaEventDraft = {
  title?: string
  startsAt: string
  endsAt: string
  allDay?: boolean
  categoryId?: string | null
}

export type AgendaEventPatch<TMeta = Record<string, unknown>> = Partial<
  Omit<AgendaEvent<TMeta>, "id">
>

export type CalendarParts = {
  year: number
  month: number
  day: number
}

export type ZonedParts = CalendarParts & {
  hour: number
  minute: number
  second: number
}

export type AgendaSegment = {
  eventId: string
  date: string
  startMinute: number
  endMinute: number
  allDay: boolean
  continuesBefore: boolean
  continuesAfter: boolean
}

export type OverlapPlacement = {
  column: number
  columns: number
}

export type EventBox = {
  eventId: string
  date: string
  top: number
  height: number
  inlineStart: number
  inlineSize: number
  continuesBefore: boolean
  continuesAfter: boolean
  column: number
  columns: number
}

export type MonthCell = {
  iso: string
  inMonth: boolean
}

export type AgendaLabels = {
  heading: string
  subtitle: string
  viewLabel: string
  dayView: string
  weekView: string
  monthView: string
  previousRange: string
  nextRange: string
  previousMonth: string
  nextMonth: string
  today: string
  allDay: string
  now: string
  ongoing: string
  emptyTitle: string
  emptyHint: string
  noMatchesTitle: string
  noMatchesHint: string
  loadingLabel: string
  errorTitle: string
  retry: string
  readOnlyNote: string
  newEvent: string
  sync: string
  syncing: string
  upcoming: string
  attention: string
  categories: string
  showCategory: (label: string) => string
  noUpcoming: string
  noAttention: string
  openEvent: (title: string, when: string) => string
  actionsFor: (title: string) => string
  moveEarlier: string
  moveLater: string
  previousDay: string
  nextDay: string
  grow: string
  shrink: string
  makeAllDay: string
  makeTimed: string
  open: string
  detailTab: string
  participantsTab: string
  join: string
  openSummary: string
  createRoom: string
  openTask: string
  openRecord: string
  confirmed: string
  pending: string
  declined: string
  noParticipants: string
  noDescription: string
  location: string
  announcements: string
  moved: (title: string, when: string) => string
  resized: (title: string, when: string) => string
  created: (when: string) => string
  cancelled: string
  snapped: (when: string) => string
  continuesBefore: string
  continuesAfter: string
  beforeHours: string
  afterHours: string
  sidebarLabel: string
  showSidebar: string
  hideSidebar: string
  gridLabel: (range: string) => string
  slotLabel: (day: string, time: string) => string
  more: (count: number) => string
  resize: (title: string) => string
  closeDetail: string
  participantLine: (name: string, status: string) => string
  shortcuts: string
  miniMonthLabel: string
  gapHour: string
  listLabel: string
}

export const agendaLabels: AgendaLabels = {
  heading: "Agenda",
  subtitle: "Revisa el día y lo que sigue.",
  viewLabel: "Vista",
  dayView: "Día",
  weekView: "Semana",
  monthView: "Mes",
  previousRange: "Rango anterior",
  nextRange: "Rango siguiente",
  previousMonth: "Mes anterior",
  nextMonth: "Mes siguiente",
  today: "Hoy",
  allDay: "Todo el día",
  now: "Ahora",
  ongoing: "En curso",
  emptyTitle: "No hay eventos",
  emptyHint: "Cuando existan, aparecen en el horario.",
  noMatchesTitle: "Ningún evento visible",
  noMatchesHint: "Prueba con otra categoría.",
  loadingLabel: "Cargando la agenda",
  errorTitle: "No se pudo cargar la agenda",
  retry: "Reintentar",
  readOnlyNote: "Solo lectura",
  newEvent: "Nuevo evento",
  sync: "Sincronizar calendario",
  syncing: "Sincronizando",
  upcoming: "Próximos",
  attention: "Atención",
  categories: "Categorías",
  showCategory: (label) => `Mostrar ${label}`,
  noUpcoming: "Nada próximo",
  noAttention: "Nada marcado",
  openEvent: (title, when) => `Abrir ${title}, ${when}`,
  actionsFor: (title) => `Acciones de ${title}`,
  moveEarlier: "Mover 15 min antes",
  moveLater: "Mover 15 min después",
  previousDay: "Día anterior",
  nextDay: "Día siguiente",
  grow: "Alargar 15 min",
  shrink: "Acortar 15 min",
  makeAllDay: "Hacer de día completo",
  makeTimed: "Volver a un horario",
  open: "Abrir",
  detailTab: "Detalle",
  participantsTab: "Participantes",
  join: "Unirse a la reunión",
  openSummary: "Abrir resumen",
  createRoom: "Crear sala",
  openTask: "Abrir encargo",
  openRecord: "Abrir registro",
  confirmed: "Confirmado",
  pending: "Pendiente",
  declined: "Rechazó",
  noParticipants: "Sin participantes",
  noDescription: "Sin descripción",
  location: "Lugar",
  announcements: "Avisos de la agenda",
  moved: (title, when) => `${title} se movió a ${when}.`,
  resized: (title, when) => `${title} ahora termina a ${when}.`,
  created: (when) => `Nuevo evento a ${when}.`,
  cancelled: "Cancelado.",
  snapped: (when) => `Esa hora no existe aquí. Quedó a ${when}.`,
  continuesBefore: "Viene del día anterior",
  continuesAfter: "Sigue al día siguiente",
  beforeHours: "Antes del horario",
  afterHours: "Después del horario",
  sidebarLabel: "Barra de la agenda",
  showSidebar: "Mostrar barra",
  hideSidebar: "Ocultar barra",
  gridLabel: (range) => `Agenda, ${range}`,
  slotLabel: (day, time) => `${day} a las ${time}`,
  more: (count) => `+${count} más`,
  resize: (title) => `Cambiar duración de ${title}`,
  closeDetail: "Cerrar detalle",
  participantLine: (name, status) => `${name}, ${status}`,
  shortcuts: "Alt y flechas mueven el evento. Mayúsculas con Alt cambian la duración.",
  miniMonthLabel: "Mes en miniatura",
  gapHour: "Esta hora no existe en esta zona",
  listLabel: "Lista de la semana",
}

export const agendaLabelsEn: AgendaLabels = {
  heading: "Agenda",
  subtitle: "See the day and what comes next.",
  viewLabel: "View",
  dayView: "Day",
  weekView: "Week",
  monthView: "Month",
  previousRange: "Previous range",
  nextRange: "Next range",
  previousMonth: "Previous month",
  nextMonth: "Next month",
  today: "Today",
  allDay: "All day",
  now: "Now",
  ongoing: "In progress",
  emptyTitle: "No events",
  emptyHint: "When there are some, they show on the grid.",
  noMatchesTitle: "No visible events",
  noMatchesHint: "Try another category.",
  loadingLabel: "Loading the agenda",
  errorTitle: "The agenda could not be loaded",
  retry: "Retry",
  readOnlyNote: "Read only",
  newEvent: "New event",
  sync: "Sync calendar",
  syncing: "Syncing",
  upcoming: "Upcoming",
  attention: "Attention",
  categories: "Categories",
  showCategory: (label) => `Show ${label}`,
  noUpcoming: "Nothing upcoming",
  noAttention: "Nothing flagged",
  openEvent: (title, when) => `Open ${title}, ${when}`,
  actionsFor: (title) => `Actions for ${title}`,
  moveEarlier: "Move 15 min earlier",
  moveLater: "Move 15 min later",
  previousDay: "Previous day",
  nextDay: "Next day",
  grow: "Extend 15 min",
  shrink: "Shorten 15 min",
  makeAllDay: "Make all day",
  makeTimed: "Give it a time",
  open: "Open",
  detailTab: "Detail",
  participantsTab: "Participants",
  join: "Join meeting",
  openSummary: "Open summary",
  createRoom: "Create room",
  openTask: "Open task",
  openRecord: "Open record",
  confirmed: "Confirmed",
  pending: "Pending",
  declined: "Declined",
  noParticipants: "No participants",
  noDescription: "No description",
  location: "Location",
  announcements: "Agenda announcements",
  moved: (title, when) => `${title} moved to ${when}.`,
  resized: (title, when) => `${title} now ends at ${when}.`,
  created: (when) => `New event at ${when}.`,
  cancelled: "Cancelled.",
  snapped: (when) => `That hour does not exist here. It landed at ${when}.`,
  continuesBefore: "Continues from the previous day",
  continuesAfter: "Continues into the next day",
  beforeHours: "Before the visible hours",
  afterHours: "After the visible hours",
  sidebarLabel: "Agenda sidebar",
  showSidebar: "Show sidebar",
  hideSidebar: "Hide sidebar",
  gridLabel: (range) => `Agenda, ${range}`,
  slotLabel: (day, time) => `${day} at ${time}`,
  more: (count) => `+${count} more`,
  resize: (title) => `Change duration of ${title}`,
  closeDetail: "Close detail",
  participantLine: (name, status) => `${name}, ${status}`,
  shortcuts: "Alt and the arrow keys move the event. Shift and Alt change the duration.",
  miniMonthLabel: "Mini month",
  gapHour: "This hour does not exist in this time zone",
  listLabel: "Week list",
}

export function resolveAgendaLabels(partial?: Partial<AgendaLabels>): AgendaLabels {
  return { ...agendaLabels, ...partial }
}

export function isAgendaView(value: string): value is AgendaView {
  return (AGENDA_VIEWS as readonly string[]).includes(value)
}

export function participantStatusLabel(status: AgendaParticipantStatus, labels: AgendaLabels) {
  if (status === "confirmed") return labels.confirmed
  if (status === "pending") return labels.pending
  return labels.declined
}

const formatters = new Map<string, Intl.DateTimeFormat>()

function zonedFormatter(timeZone: string) {
  let formatter = formatters.get(timeZone)
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hourCycle: "h23",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    })
    formatters.set(timeZone, formatter)
  }
  return formatter
}

export function zonedParts(ts: number, timeZone: string): ZonedParts {
  const formatted = zonedFormatter(timeZone).formatToParts(new Date(ts))
  const bag = Object.fromEntries(formatted.map((part) => [part.type, part.value]))
  return {
    year: Number(bag.year),
    month: Number(bag.month),
    day: Number(bag.day),
    hour: Number(bag.hour) % 24,
    minute: Number(bag.minute),
    second: Number(bag.second),
  }
}

export function formatCalendarDate(parts: CalendarParts) {
  const month = String(parts.month).padStart(2, "0")
  const day = String(parts.day).padStart(2, "0")
  return `${String(parts.year).padStart(4, "0")}-${month}-${day}`
}

export function parseCalendarDate(value: string): CalendarParts | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const utc = new Date(Date.UTC(year, month - 1, day))
  if (utc.getUTCFullYear() !== year || utc.getUTCMonth() !== month - 1 || utc.getUTCDate() !== day) return null
  return { year, month, day }
}

export function calendarDate(ts: number, timeZone: string) {
  if (!Number.isFinite(ts)) return ""
  const parts = zonedParts(ts, timeZone)
  return formatCalendarDate(parts)
}

function sameCivil(
  ts: number,
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
) {
  const parts = zonedParts(ts, timeZone)
  return (
    parts.year === year &&
    parts.month === month &&
    parts.day === day &&
    parts.hour === hour &&
    parts.minute === minute
  )
}

/**
 * Civil time in `timeZone` to a UTC instant.
 * A repeated hour (fall back) uses the earlier offset.
 * A missing hour (spring forward) snaps forward to the next real minute.
 */
export function zonedDateTimeToUtc(
  year: number,
  month: number,
  day: number,
  hour: number,
  minute: number,
  timeZone: string,
): { instant: number; snapped: boolean } {
  const wall = Date.UTC(year, month - 1, day, hour, minute, 0)
  const rough = wall - timeZoneOffsetMs(timeZone, wall)
  const instant = wall - timeZoneOffsetMs(timeZone, rough)
  if (sameCivil(instant, year, month, day, hour, minute, timeZone)) {
    return { instant, snapped: false }
  }
  const base = Math.floor(rough / 60_000) * 60_000
  for (let delta = -180; delta <= 180; delta += 1) {
    const candidate = base + delta * 60_000
    if (sameCivil(candidate, year, month, day, hour, minute, timeZone)) {
      return { instant: candidate, snapped: false }
    }
  }
  for (let delta = -180; delta <= 180; delta += 1) {
    const candidate = base + delta * 60_000
    const parts = zonedParts(candidate, timeZone)
    if (parts.second !== 0) continue
    const civil = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute)
    if (civil >= wall) return { instant: candidate, snapped: true }
  }
  return { instant, snapped: true }
}

export function zonedDayBounds(iso: string, timeZone: string): { start: number; end: number } | null {
  const parts = parseCalendarDate(iso)
  if (!parts) return null
  const probe = zonedDateTimeToUtc(parts.year, parts.month, parts.day, 12, 0, timeZone).instant
  const start = startOfZonedDay(probe, timeZone)
  return { start, end: addZonedDays(start, 1, timeZone) }
}

export function isGapHour(iso: string, hour: number, timeZone: string) {
  const parts = parseCalendarDate(iso)
  if (!parts || hour < 0 || hour > 23) return false
  const result = zonedDateTimeToUtc(parts.year, parts.month, parts.day, hour, 0, timeZone)
  if (result.snapped) return true
  const back = zonedParts(result.instant, timeZone)
  return back.hour !== hour || back.day !== parts.day || back.month !== parts.month
}

export function instantOnDate(iso: string, minuteOfDay: number, timeZone: string) {
  const parts = parseCalendarDate(iso)
  if (!parts) return { instant: Number.NaN, snapped: false }
  const minute = Math.min(Math.max(minuteOfDay, 0), 24 * 60 - 1)
  return zonedDateTimeToUtc(parts.year, parts.month, parts.day, Math.floor(minute / 60), minute % 60, timeZone)
}

export function clockMinutes(ts: number, timeZone: string) {
  const parts = zonedParts(ts, timeZone)
  return parts.hour * 60 + parts.minute
}

export function addCalendarDays(iso: string, days: number) {
  const parts = parseCalendarDate(iso)
  if (!parts || !Number.isFinite(days)) return iso
  const utc = new Date(Date.UTC(parts.year, parts.month - 1, parts.day + Math.trunc(days)))
  return formatCalendarDate({
    year: utc.getUTCFullYear(),
    month: utc.getUTCMonth() + 1,
    day: utc.getUTCDate(),
  })
}

export function addCalendarMonths(iso: string, months: number) {
  const parts = parseCalendarDate(iso)
  if (!parts || !Number.isFinite(months)) return iso
  const index = parts.year * 12 + (parts.month - 1) + Math.trunc(months)
  const year = Math.floor(index / 12)
  const month = (index % 12) + 1
  const dim = new Date(Date.UTC(year, month, 0)).getUTCDate()
  return formatCalendarDate({ year, month, day: Math.min(parts.day, dim) })
}

export function startOfWeekDate(iso: string, weekStartsOn = DEFAULT_WEEK_STARTS_ON) {
  const parts = parseCalendarDate(iso)
  if (!parts) return iso
  const weekday = new Date(Date.UTC(parts.year, parts.month - 1, parts.day)).getUTCDay()
  const lead = (weekday - weekStartsOn + 7) % 7
  return addCalendarDays(iso, -lead)
}

export function weekdayLabels(locale: string, weekStartsOn = DEFAULT_WEEK_STARTS_ON) {
  const monday = Date.UTC(2026, 0, 5)
  return Array.from({ length: 7 }, (_, index) => {
    const day = new Date(monday + ((index + weekStartsOn + 6) % 7) * DAY_MS)
    return new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(day)
  })
}

export function monthGrid(anchor: string, weekStartsOn = DEFAULT_WEEK_STARTS_ON): MonthCell[] {
  const parts = parseCalendarDate(anchor)
  if (!parts) return []
  const first = formatCalendarDate({ year: parts.year, month: parts.month, day: 1 })
  const start = startOfWeekDate(first, weekStartsOn)
  return Array.from({ length: 42 }, (_, index) => {
    const iso = addCalendarDays(start, index)
    const cell = parseCalendarDate(iso)
    return {
      iso,
      inMonth: Boolean(cell && cell.month === parts.month && cell.year === parts.year),
    }
  })
}

export function visibleDates(view: AgendaView, anchor: string, weekStartsOn = DEFAULT_WEEK_STARTS_ON) {
  if (!parseCalendarDate(anchor)) return []
  if (view === "day") return [anchor]
  if (view === "week") {
    const start = startOfWeekDate(anchor, weekStartsOn)
    return Array.from({ length: 7 }, (_, index) => addCalendarDays(start, index))
  }
  return monthGrid(anchor, weekStartsOn).map((cell) => cell.iso)
}

export function shiftAnchor(
  view: AgendaView,
  anchor: string,
  direction: -1 | 1,
  weekStartsOn = DEFAULT_WEEK_STARTS_ON,
) {
  if (view === "day") return addCalendarDays(anchor, direction)
  if (view === "week") return addCalendarDays(startOfWeekDate(anchor, weekStartsOn), direction * 7)
  return addCalendarMonths(anchor, direction)
}

export function formatTimeZoneShort(ts: number, timeZone: string, locale: string) {
  const parts = new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: "2-digit",
    timeZoneName: "shortOffset",
  }).formatToParts(new Date(ts))
  return parts.find((part) => part.type === "timeZoneName")?.value ?? timeZone
}

export function formatClock(ts: number, timeZone: string, locale: string) {
  return new Intl.DateTimeFormat(locale, {
    hour: "2-digit",
    minute: "2-digit",
    timeZone,
  }).format(new Date(ts))
}

export function formatDayHeading(iso: string, locale: string) {
  const parts = parseCalendarDate(iso)
  if (!parts) return { weekday: "", day: "", full: iso }
  const date = new Date(Date.UTC(parts.year, parts.month - 1, parts.day))
  return {
    weekday: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }).format(date),
    day: new Intl.DateTimeFormat(locale, { day: "numeric", timeZone: "UTC" }).format(date),
    full: new Intl.DateTimeFormat(locale, {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      timeZone: "UTC",
    }).format(date),
  }
}

export function formatRangeLabel(
  view: AgendaView,
  anchor: string,
  locale: string,
  weekStartsOn = DEFAULT_WEEK_STARTS_ON,
) {
  if (view === "day") return formatDayHeading(anchor, locale).full
  if (view === "month") {
    const parts = parseCalendarDate(anchor)
    if (!parts) return anchor
    return new Intl.DateTimeFormat(locale, { month: "long", year: "numeric", timeZone: "UTC" }).format(
      new Date(Date.UTC(parts.year, parts.month - 1, 1)),
    )
  }
  const dates = visibleDates("week", anchor, weekStartsOn)
  const start = parseCalendarDate(dates[0] ?? "")
  const end = parseCalendarDate(dates[6] ?? "")
  if (!start || !end) return anchor
  const formatter = new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  })
  const a = new Date(Date.UTC(start.year, start.month - 1, start.day))
  const b = new Date(Date.UTC(end.year, end.month - 1, end.day))
  const withRange = formatter as Intl.DateTimeFormat & { formatRange?: (start: Date, end: Date) => string }
  if (typeof withRange.formatRange === "function") return withRange.formatRange(a, b)
  return `${formatter.format(a)} – ${formatter.format(b)}`
}

export function formatInterval(startsAt: string, endsAt: string, timeZone: string, locale: string, allDay = false) {
  const start = Date.parse(startsAt)
  const end = Date.parse(endsAt)
  if (!Number.isFinite(start) || !Number.isFinite(end)) return ""
  if (allDay) {
    const from = formatDayHeading(calendarDate(start, timeZone), locale).full
    const toDate = calendarDate(end - 1, timeZone)
    const to = formatDayHeading(toDate, locale).full
    return from === to ? from : `${from} – ${to}`
  }
  const sameDay = calendarDate(start, timeZone) === calendarDate(end - 1, timeZone)
  const startClock = formatClock(start, timeZone, locale)
  const endClock = formatClock(end, timeZone, locale)
  if (sameDay) return `${startClock} – ${endClock}`
  return `${formatDayHeading(calendarDate(start, timeZone), locale).day} ${startClock} – ${formatDayHeading(calendarDate(end - 1, timeZone), locale).day} ${endClock}`
}

export function isCategoryVisible(categoryId: string | null | undefined, hiddenCategoryIds: readonly string[]) {
  if (!categoryId) return true
  return !hiddenCategoryIds.includes(categoryId)
}

export function isEventOngoing(event: Pick<AgendaEvent, "startsAt" | "endsAt" | "allDay">, now: number) {
  if (event.allDay) return false
  const start = Date.parse(event.startsAt)
  const end = Date.parse(event.endsAt)
  return Number.isFinite(start) && Number.isFinite(end) && start <= now && now < end
}

export function eventInstants(event: Pick<AgendaEvent, "startsAt" | "endsAt">) {
  const start = Date.parse(event.startsAt)
  const end = Date.parse(event.endsAt)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return null
  return { start, end }
}

export function segmentsForEvent(
  event: Pick<AgendaEvent, "id" | "startsAt" | "endsAt" | "allDay">,
  timeZone: string,
  dates: readonly string[],
): AgendaSegment[] {
  const instants = eventInstants(event)
  if (!instants) return []
  const segments: AgendaSegment[] = []
  for (const date of dates) {
    const bounds = zonedDayBounds(date, timeZone)
    if (!bounds) continue
    if (event.allDay) {
      if (instants.start < bounds.end && instants.end > bounds.start) {
        segments.push({
          eventId: event.id,
          date,
          startMinute: 0,
          endMinute: 24 * 60,
          allDay: true,
          continuesBefore: instants.start < bounds.start,
          continuesAfter: instants.end > bounds.end,
        })
      }
      continue
    }
    const sliceStart = Math.max(instants.start, bounds.start)
    const sliceEnd = Math.min(instants.end, bounds.end)
    if (sliceEnd <= sliceStart) continue
    const startParts = zonedParts(sliceStart, timeZone)
    const endMinute =
      sliceEnd === bounds.end ? 24 * 60 : clockMinutes(sliceEnd, timeZone) || 24 * 60
    segments.push({
      eventId: event.id,
      date,
      startMinute: startParts.hour * 60 + startParts.minute,
      endMinute: Math.max(endMinute, startParts.hour * 60 + startParts.minute + 1),
      allDay: false,
      continuesBefore: instants.start < bounds.start,
      continuesAfter: instants.end > bounds.end,
    })
  }
  return segments
}

export function placeOverlaps(items: readonly { id: string; start: number; end: number }[]) {
  const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end || a.id.localeCompare(b.id))
  const placement = new Map<string, OverlapPlacement>()
  let cluster: { id: string; column: number }[] = []
  let columnEnds: number[] = []
  let clusterEnd = -Infinity

  function closeCluster() {
    const columns = cluster.reduce((max, item) => Math.max(max, item.column + 1), 1)
    for (const item of cluster) placement.set(item.id, { column: item.column, columns })
    cluster = []
    columnEnds = []
    clusterEnd = -Infinity
  }

  for (const item of sorted) {
    if (cluster.length && item.start >= clusterEnd) closeCluster()
    let column = columnEnds.findIndex((end) => end <= item.start)
    if (column < 0) {
      column = columnEnds.length
      columnEnds.push(item.end)
    } else {
      columnEnds[column] = item.end
    }
    cluster.push({ id: item.id, column })
    clusterEnd = Math.max(clusterEnd, item.end)
  }
  if (cluster.length) closeCluster()
  return placement
}

export function outsideWindow(segment: AgendaSegment, hourStart: number, hourEnd: number): "before" | "after" | null {
  if (segment.allDay) return null
  if (segment.endMinute <= hourStart * 60) return "before"
  if (segment.startMinute >= hourEnd * 60) return "after"
  return null
}

export function layoutTimedSegments(
  segments: readonly AgendaSegment[],
  hourStart: number,
  hourEnd: number,
): EventBox[] {
  const windowStart = hourStart * 60
  const windowEnd = hourEnd * 60
  const span = Math.max(windowEnd - windowStart, 1)
  const byDate = new Map<string, AgendaSegment[]>()
  for (const segment of segments) {
    if (segment.allDay || outsideWindow(segment, hourStart, hourEnd)) continue
    const list = byDate.get(segment.date) ?? []
    list.push(segment)
    byDate.set(segment.date, list)
  }
  const boxes: EventBox[] = []
  for (const [date, list] of byDate) {
    const clipped = list
      .map((segment) => ({
        ...segment,
        start: Math.max(segment.startMinute, windowStart),
        end: Math.min(segment.endMinute, windowEnd),
      }))
      .filter((segment) => segment.end > segment.start)
    const placement = placeOverlaps(clipped.map((segment) => ({ id: segment.eventId, start: segment.start, end: segment.end })))
    for (const segment of clipped) {
      const place = placement.get(segment.eventId) ?? { column: 0, columns: 1 }
      boxes.push({
        eventId: segment.eventId,
        date,
        top: (segment.start - windowStart) / span,
        height: (segment.end - segment.start) / span,
        inlineStart: place.column / place.columns,
        inlineSize: 1 / place.columns,
        continuesBefore: segment.continuesBefore || segment.startMinute < windowStart,
        continuesAfter: segment.continuesAfter || segment.endMinute > windowEnd,
        column: place.column,
        columns: place.columns,
      })
    }
  }
  return boxes
}

export function shiftClock(event: Pick<AgendaEvent, "startsAt" | "endsAt" | "allDay">, deltaMinutes: number, timeZone: string): AgendaMove & { snapped: boolean } {
  const instants = eventInstants(event)
  if (!instants) {
    return { startsAt: event.startsAt, endsAt: event.endsAt, allDay: event.allDay, snapped: false }
  }
  const duration = instants.end - instants.start
  const parts = zonedParts(instants.start, timeZone)
  let total = parts.hour * 60 + parts.minute + Math.trunc(deltaMinutes)
  let date = calendarDate(instants.start, timeZone)
  while (total < 0) {
    total += 24 * 60
    date = addCalendarDays(date, -1)
  }
  while (total >= 24 * 60) {
    total -= 24 * 60
    date = addCalendarDays(date, 1)
  }
  const next = instantOnDate(date, total, timeZone)
  return {
    startsAt: new Date(next.instant).toISOString(),
    endsAt: new Date(next.instant + duration).toISOString(),
    allDay: false,
    snapped: next.snapped,
  }
}

export function shiftEventByDays(
  event: Pick<AgendaEvent, "startsAt" | "endsAt" | "allDay">,
  days: number,
  timeZone: string,
): AgendaMove & { snapped: boolean } {
  const instants = eventInstants(event)
  if (!instants) {
    return { startsAt: event.startsAt, endsAt: event.endsAt, allDay: event.allDay, snapped: false }
  }
  if (event.allDay) {
    const startDate = addCalendarDays(calendarDate(instants.start, timeZone), days)
    const endDate = addCalendarDays(calendarDate(instants.end, timeZone), days)
    const start = zonedDayBounds(startDate, timeZone)
    const end = zonedDayBounds(endDate, timeZone)
    if (!start || !end) return { startsAt: event.startsAt, endsAt: event.endsAt, allDay: true, snapped: false }
    return {
      startsAt: new Date(start.start).toISOString(),
      endsAt: new Date(end.start).toISOString(),
      allDay: true,
      snapped: false,
    }
  }
  const startParts = zonedParts(instants.start, timeZone)
  const startDate = addCalendarDays(calendarDate(instants.start, timeZone), days)
  const moved = instantOnDate(startDate, startParts.hour * 60 + startParts.minute, timeZone)
  const duration = instants.end - instants.start
  return {
    startsAt: new Date(moved.instant).toISOString(),
    endsAt: new Date(moved.instant + duration).toISOString(),
    allDay: false,
    snapped: moved.snapped,
  }
}

export function resizeEventEnd(
  event: Pick<AgendaEvent, "startsAt" | "endsAt" | "allDay">,
  deltaMinutes: number,
  minMinutes: number,
  timeZone: string,
): AgendaMove & { snapped: boolean } {
  const instants = eventInstants(event)
  if (!instants) {
    return { startsAt: event.startsAt, endsAt: event.endsAt, allDay: event.allDay, snapped: false }
  }
  const parts = zonedParts(instants.end, timeZone)
  let total = parts.hour * 60 + parts.minute + Math.trunc(deltaMinutes)
  let date = calendarDate(instants.end, timeZone)
  while (total < 0) {
    total += 24 * 60
    date = addCalendarDays(date, -1)
  }
  while (total >= 24 * 60) {
    total -= 24 * 60
    date = addCalendarDays(date, 1)
  }
  const next = instantOnDate(date, total, timeZone)
  const min = instants.start + Math.max(1, minMinutes) * 60_000
  return {
    startsAt: new Date(instants.start).toISOString(),
    endsAt: new Date(Math.max(next.instant, min)).toISOString(),
    allDay: Boolean(event.allDay),
    snapped: next.snapped,
  }
}

export function allDayMove(event: Pick<AgendaEvent, "startsAt" | "endsAt">, timeZone: string, allDay: boolean): AgendaMove {
  const instants = eventInstants(event)
  if (!instants) return { startsAt: event.startsAt, endsAt: event.endsAt, allDay }
  const date = calendarDate(instants.start, timeZone)
  if (allDay) {
    const bounds = zonedDayBounds(date, timeZone)
    const next = zonedDayBounds(addCalendarDays(date, 1), timeZone)
    if (!bounds || !next) return { startsAt: event.startsAt, endsAt: event.endsAt, allDay: true }
    return { startsAt: new Date(bounds.start).toISOString(), endsAt: new Date(next.start).toISOString(), allDay: true }
  }
  const start = instantOnDate(date, 9 * 60, timeZone)
  return {
    startsAt: new Date(start.instant).toISOString(),
    endsAt: new Date(start.instant + 60 * 60_000).toISOString(),
    allDay: false,
  }
}

export function moveToDateKeepingClock(
  event: Pick<AgendaEvent, "startsAt" | "endsAt" | "allDay">,
  targetDate: string,
  timeZone: string,
): AgendaMove & { snapped: boolean } {
  const instants = eventInstants(event)
  if (!instants || !parseCalendarDate(targetDate)) {
    return { startsAt: event.startsAt, endsAt: event.endsAt, allDay: event.allDay, snapped: false }
  }
  const current = calendarDate(instants.start, timeZone)
  const from = Date.UTC(
    Number(current.slice(0, 4)),
    Number(current.slice(5, 7)) - 1,
    Number(current.slice(8, 10)),
  )
  const toParts = parseCalendarDate(targetDate)!
  const to = Date.UTC(toParts.year, toParts.month - 1, toParts.day)
  const days = Math.round((to - from) / DAY_MS)
  return shiftEventByDays(event, days, timeZone)
}

export function defaultDraft(anchor: string, timeZone: string, minuteOfDay = 9 * 60, durationMinutes = 60): AgendaEventDraft {
  const start = instantOnDate(anchor, minuteOfDay, timeZone)
  const safe = Number.isFinite(start.instant) ? start.instant : Date.parse(`${anchor}T09:00:00.000Z`)
  return {
    startsAt: new Date(safe).toISOString(),
    endsAt: new Date(safe + durationMinutes * 60_000).toISOString(),
    allDay: false,
  }
}

export function upcomingEvents<TMeta>(
  events: readonly AgendaEvent<TMeta>[],
  now: number,
  hiddenCategoryIds: readonly string[],
  limit = 4,
) {
  return events
    .filter((event) => {
      if (!isCategoryVisible(event.categoryId, hiddenCategoryIds) || event.attention) return false
      const start = Date.parse(event.startsAt)
      return Number.isFinite(start) && start >= now
    })
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
    .slice(0, limit)
}

export function attentionEvents<TMeta>(
  events: readonly AgendaEvent<TMeta>[],
  now: number,
  hiddenCategoryIds: readonly string[],
) {
  return events
    .filter((event) => {
      if (!event.attention || !isCategoryVisible(event.categoryId, hiddenCategoryIds)) return false
      const end = Date.parse(event.endsAt)
      return Number.isFinite(end) && end > now
    })
    .sort((a, b) => Date.parse(a.startsAt) - Date.parse(b.startsAt))
}
