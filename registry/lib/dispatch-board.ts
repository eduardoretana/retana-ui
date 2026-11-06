/**
 * Clean-room dispatch model.
 * Jobs, skills, and absences are host data. Overlap pairs and hour sums
 * come from the agenda core (`findResourceConflicts`, `resourceLoads`).
 * This file does not paint and does not own a theme.
 */

import {
  calendarDate,
  clockMinutes,
  conflictPartners,
  eventInstants,
  findResourceConflicts,
  instantOnDate,
  placeOverlaps,
  resourceLoads,
  segmentsForEvent,
  visibleDates,
  zonedDayBounds,
  type AgendaEvent,
  type AgendaResource,
} from "@/registry/retana/lib/agenda"
import { toCsv, type CsvColumn } from "@/registry/retana/lib/csv"
import type { StatusTone } from "@/registry/retana/lib/status-tone"

export const DISPATCH_VIEWS = ["day", "week"] as const

export type DispatchView = (typeof DISPATCH_VIEWS)[number]

export const DISPATCH_REJECT_REASONS = ["conflict", "absence", "skill", "outside-hours"] as const

export type DispatchRejectReason = (typeof DISPATCH_REJECT_REASONS)[number]

export const OCCUPANCY_LEVELS = ["open", "steady", "full"] as const

export type OccupancyLevelId = (typeof OCCUPANCY_LEVELS)[number]

export const TOUCH_HOLD_MS = 360

export const TOUCH_SLOP_PX = 8

export const POINTER_SLOP_PX = 6

export const GROUP_ROW_PX = 32

export const RESOURCE_ROW_PX = 84

export const HOUR_COLUMN_PX = 112

export const DAY_COLUMN_PX = 168

export const NAME_WIDTH_PX = 288

export type Skill = {
  id: string
  label: string
}

export type ResourceGroup = {
  id: string
  label: string
}

/** A person or other bookable row. `capacityHours` is one civil day, before absences. */
export type Resource = {
  id: string
  name: string
  groupId: string
  skills: readonly string[]
  capacityHours: number
  initials?: string
}

/** Host-defined status. The id is not a closed list. */
export type JobStatus = {
  id: string
  label: string
  tone?: StatusTone
}

export type Job = {
  id: string
  title: string
  statusId: string
  startsAt: string
  endsAt: string
  location?: string
  skillId?: string | null
  /** Missing or null: the job stays in the unassigned queue. */
  resourceId?: string | null
  marker?: string
  markerLabel?: string
}

export type Absence = {
  id: string
  resourceId: string
  startsAt: string
  endsAt: string
  label?: string
}

export type DispatchModel = {
  groups: readonly ResourceGroup[]
  resources: readonly Resource[]
  skills: readonly Skill[]
  statuses: readonly JobStatus[]
  jobs: readonly Job[]
  absences: readonly Absence[]
}

export type DispatchDecision =
  | { ok: true }
  | { ok: false; reason: DispatchRejectReason; detail: string }

export type AssignRequest = {
  jobId: string
  resourceId: string | null
  startsAt: string
  endsAt: string
}

export type MoveRequest = AssignRequest

export type ResizeRequest = AssignRequest

export type OccupancyThreshold = {
  id: OccupancyLevelId
  /** Inclusive upper bound of scheduled / available. The last step should be Infinity. */
  until: number
  tone: StatusTone
}

export const DEFAULT_OCCUPANCY_THRESHOLDS: readonly OccupancyThreshold[] = [
  { id: "open", until: 0.5, tone: "positive" },
  { id: "steady", until: 0.85, tone: "warning" },
  { id: "full", until: Number.POSITIVE_INFINITY, tone: "critical" },
]

export type ResourceOccupancy = {
  resourceId: string
  scheduledMs: number
  capacityMs: number | null
  absenceMs: number
  availableMs: number | null
  ratio: number | null
  level: OccupancyLevelId | null
  tone: StatusTone
}

export type DispatchFilters = {
  query: string
  groupId: string | null
  skillId: string | null
  statusId: string | null
  occupancy: OccupancyLevelId | null
}

export const EMPTY_DISPATCH_FILTERS: DispatchFilters = {
  query: "",
  groupId: null,
  skillId: null,
  statusId: null,
  occupancy: null,
}

export type DispatchLabels = {
  heading: string
  back: string
  previous: string
  next: string
  today: string
  day: string
  week: string
  viewLabel: string
  search: string
  searchShortcut: string
  addFilter: string
  closeFilters: string
  download: string
  downloadCsv: string
  downloadJson: string
  people: string
  rail: string
  openRail: string
  closeRail: string
  unassigned: string
  queueEmpty: string
  emptyTitle: string
  emptyBody: string
  noMatches: string
  loading: string
  retry: string
  timeOff: string
  conflict: string
  conflictOne: string
  conflictMany: string
  now: string
  continues: string
  moreHours: string
  assignTo: string
  unassign: string
  moveEarlier: string
  moveLater: string
  grow: string
  shrink: string
  openJob: string
  rowActions: string
  jobActions: string
  filtersRole: string
  filtersSkill: string
  filtersStatus: string
  filtersOccupancy: string
  any: string
  occupancyOpen: string
  occupancySteady: string
  occupancyFull: string
  reasonConflict: string
  reasonAbsence: string
  reasonSkill: string
  reasonHours: string
  requestFailed: string
  assigned: string
  moved: string
  resized: string
  keyboardHint: string
  readonly: string
}

export const dispatchLabels: DispatchLabels = {
  heading: "Despacho",
  back: "Volver a la agenda",
  previous: "Periodo anterior",
  next: "Periodo siguiente",
  today: "Hoy",
  day: "Diario",
  week: "Semanal",
  viewLabel: "Vista",
  search: "Buscar trabajo",
  searchShortcut: "Alt+K",
  addFilter: "Agregar filtro",
  closeFilters: "Cerrar filtros",
  download: "Descargar lista",
  downloadCsv: "Descargar CSV",
  downloadJson: "Descargar JSON",
  people: "Personas",
  rail: "Lista de trabajos",
  openRail: "Abrir lista de trabajos",
  closeRail: "Cerrar lista",
  unassigned: "Sin asignar",
  queueEmpty: "No hay trabajos sin asignar.",
  emptyTitle: "No hay personas en este tablero",
  emptyBody: "Cuando haya recursos, cada persona ocupa una fila.",
  noMatches: "Ningún trabajo coincide con la búsqueda.",
  loading: "Cargando el tablero",
  retry: "Reintentar",
  timeOff: "Ausencia",
  conflict: "Choque",
  conflictOne: "1 choque",
  conflictMany: "{count} choques",
  now: "Ahora",
  continues: "Continúa",
  moreHours: "Ver horas siguientes",
  assignTo: "Asignar a",
  unassign: "Quitar asignación",
  moveEarlier: "Mover 15 min antes",
  moveLater: "Mover 15 min después",
  grow: "Alargar 15 min",
  shrink: "Acortar 15 min",
  openJob: "Abrir trabajo",
  rowActions: "Acciones de {name}",
  jobActions: "Acciones del trabajo",
  filtersRole: "Rol",
  filtersSkill: "Habilidad",
  filtersStatus: "Estado",
  filtersOccupancy: "Ocupación",
  any: "Todos",
  occupancyOpen: "con margen",
  occupancySteady: "en ritmo",
  occupancyFull: "llena",
  reasonConflict: "Choca con {names}. Elige otro horario u otra persona.",
  reasonAbsence: "Esa persona está ausente en ese horario. Elige otro momento.",
  reasonSkill: "Le falta la habilidad {skill}. Elige a alguien que la tenga.",
  reasonHours: "Queda fuera del horario visible. Muévelo dentro de la jornada.",
  requestFailed: "No se guardó el cambio. Inténtalo de nuevo.",
  assigned: "Trabajo asignado.",
  moved: "Trabajo movido.",
  resized: "Duración actualizada.",
  keyboardHint: "Las flechas mueven el trabajo. Mayús y flechas cambian la duración.",
  readonly: "Solo lectura",
}

export const dispatchLabelsEn: DispatchLabels = {
  heading: "Dispatch",
  back: "Back to the agenda",
  previous: "Previous period",
  next: "Next period",
  today: "Today",
  day: "Daily",
  week: "Weekly",
  viewLabel: "View",
  search: "Search jobs",
  searchShortcut: "Alt+K",
  addFilter: "Add filter",
  closeFilters: "Close filters",
  download: "Download job list",
  downloadCsv: "Download CSV",
  downloadJson: "Download JSON",
  people: "People",
  rail: "Job list",
  openRail: "Open job list",
  closeRail: "Close list",
  unassigned: "Unassigned",
  queueEmpty: "No unassigned jobs.",
  emptyTitle: "No people on this board",
  emptyBody: "When resources arrive, each person gets a row.",
  noMatches: "No job matches the search.",
  loading: "Loading the board",
  retry: "Try again",
  timeOff: "Time off",
  conflict: "Conflict",
  conflictOne: "1 conflict",
  conflictMany: "{count} conflicts",
  now: "Now",
  continues: "Continues",
  moreHours: "Show later hours",
  assignTo: "Assign to",
  unassign: "Unassign",
  moveEarlier: "Move 15 min earlier",
  moveLater: "Move 15 min later",
  grow: "Extend 15 min",
  shrink: "Shorten 15 min",
  openJob: "Open job",
  rowActions: "Actions for {name}",
  jobActions: "Job actions",
  filtersRole: "Role",
  filtersSkill: "Skill",
  filtersStatus: "Status",
  filtersOccupancy: "Occupancy",
  any: "Any",
  occupancyOpen: "open",
  occupancySteady: "steady",
  occupancyFull: "full",
  reasonConflict: "Overlaps {names}. Pick another time or person.",
  reasonAbsence: "That person is away then. Pick another time.",
  reasonSkill: "Missing the {skill} skill. Pick someone who has it.",
  reasonHours: "Outside the visible hours. Move it into the shift.",
  requestFailed: "The change was not saved. Try again.",
  assigned: "Job assigned.",
  moved: "Job moved.",
  resized: "Duration updated.",
  keyboardHint: "Arrow keys move the job. Shift and arrows change the duration.",
  readonly: "Read only",
}

export function resolveDispatchLabels(partial?: Partial<DispatchLabels>): DispatchLabels {
  return { ...dispatchLabels, ...partial }
}

export function isDispatchView(value: string): value is DispatchView {
  return value === "day" || value === "week"
}

const ABSENCE_PREFIX = "absence:"

export function jobToEvent(job: Pick<Job, "id" | "title" | "startsAt" | "endsAt" | "resourceId" | "location">): AgendaEvent {
  return {
    id: job.id,
    title: job.title,
    startsAt: job.startsAt,
    endsAt: job.endsAt,
    ...(job.resourceId ? { resourceId: job.resourceId } : {}),
    ...(job.location ? { location: job.location } : {}),
  }
}

export function absenceToEvent(absence: Absence): AgendaEvent {
  return {
    id: `${ABSENCE_PREFIX}${absence.id}`,
    title: absence.label?.trim() ? absence.label : "Ausencia",
    startsAt: absence.startsAt,
    endsAt: absence.endsAt,
    resourceId: absence.resourceId,
  }
}

export function isAbsenceEventId(id: string) {
  return id.startsWith(ABSENCE_PREFIX)
}

export function dispatchDates(view: DispatchView, anchor: string, weekStartsOn = 1) {
  return visibleDates(view, anchor, weekStartsOn)
}

export function hourColumns(hourStart: number, hourEnd: number) {
  const hours: number[] = []
  const start = Math.trunc(hourStart)
  const end = Math.trunc(hourEnd)
  for (let hour = start; hour < end; hour += 1) hours.push(hour)
  return hours
}

export function boardConflicts(jobs: readonly Job[]) {
  return findResourceConflicts(jobs.map((job) => jobToEvent(job)))
}

export function fillTemplate(template: string, values: Record<string, string>) {
  return template.replace(/\{(\w+)\}/g, (_, key: string) => values[key] ?? "")
}

function workingBounds(date: string, hourStart: number, hourEnd: number, timeZone: string) {
  const day = zonedDayBounds(date, timeZone)
  const open = instantOnDate(date, Math.max(0, hourStart) * 60, timeZone).instant
  const close = hourEnd >= 24 ? day?.end : instantOnDate(date, hourEnd * 60, timeZone).instant
  if (!day || !Number.isFinite(open) || close == null || !Number.isFinite(close) || close <= open) return null
  return { open, close }
}

/** Intersection of one record with each visible shift. The sum stays in `resourceLoads`. */
export function workingSlices(
  event: Pick<AgendaEvent, "id" | "startsAt" | "endsAt" | "resourceId">,
  dates: readonly string[],
  hourStart: number,
  hourEnd: number,
  timeZone: string,
): AgendaEvent[] {
  const instants = eventInstants(event)
  if (!instants || !event.resourceId) return []
  const slices: AgendaEvent[] = []
  for (const date of dates) {
    const window = workingBounds(date, hourStart, hourEnd, timeZone)
    if (!window) continue
    const start = Math.max(instants.start, window.open)
    const end = Math.min(instants.end, window.close)
    if (end <= start) continue
    slices.push({
      id: `${event.id}:${date}`,
      title: event.id,
      resourceId: event.resourceId,
      startsAt: new Date(start).toISOString(),
      endsAt: new Date(end).toISOString(),
    })
  }
  return slices
}

export function outsideWorkingHours(
  startsAt: string,
  endsAt: string,
  dates: readonly string[],
  hourStart: number,
  hourEnd: number,
  timeZone: string,
) {
  const instants = eventInstants({ startsAt, endsAt })
  if (!instants) return true
  let touched = false
  for (const date of dates) {
    const bounds = zonedDayBounds(date, timeZone)
    const window = workingBounds(date, hourStart, hourEnd, timeZone)
    if (!bounds || !window) continue
    const start = Math.max(instants.start, bounds.start)
    const end = Math.min(instants.end, bounds.end)
    if (end <= start) continue
    touched = true
    if (start < window.open || end > window.close) return true
  }
  return !touched
}

export function validatePlacement(input: {
  jobId: string
  title: string
  resource: Resource
  startsAt: string
  endsAt: string
  skillId?: string | null
  jobs: readonly Job[]
  absences: readonly Absence[]
  skills: readonly Skill[]
  dates: readonly string[]
  hourStart: number
  hourEnd: number
  timeZone: string
  labels: Pick<DispatchLabels, "reasonConflict" | "reasonAbsence" | "reasonSkill" | "reasonHours">
}): DispatchDecision {
  const candidate = jobToEvent({
    id: input.jobId,
    title: input.title,
    startsAt: input.startsAt,
    endsAt: input.endsAt,
    resourceId: input.resource.id,
  })
  const others = input.jobs.filter((job) => job.id !== input.jobId).map((job) => jobToEvent(job))
  const conflicts = findResourceConflicts([...others, candidate])
  const partnerIds = conflictPartners(input.jobId, conflicts)
  if (partnerIds.length > 0) {
    const names = partnerIds.map((id) => input.jobs.find((job) => job.id === id)?.title ?? id).join(", ")
    return { ok: false, reason: "conflict", detail: fillTemplate(input.labels.reasonConflict, { names }) }
  }
  const absenceHits = findResourceConflicts([...input.absences.map(absenceToEvent), candidate]).filter((pair) => {
    const [first, second] = pair.eventIds
    return (first === input.jobId && isAbsenceEventId(second)) || (second === input.jobId && isAbsenceEventId(first))
  })
  if (absenceHits.length > 0) {
    return { ok: false, reason: "absence", detail: input.labels.reasonAbsence }
  }
  if (input.skillId && !input.resource.skills.includes(input.skillId)) {
    const skill = input.skills.find((item) => item.id === input.skillId)?.label ?? input.skillId
    return { ok: false, reason: "skill", detail: fillTemplate(input.labels.reasonSkill, { skill }) }
  }
  if (outsideWorkingHours(input.startsAt, input.endsAt, input.dates, input.hourStart, input.hourEnd, input.timeZone)) {
    return { ok: false, reason: "outside-hours", detail: input.labels.reasonHours }
  }
  return { ok: true }
}

export function occupancyLevel(ratio: number, thresholds: readonly OccupancyThreshold[] = DEFAULT_OCCUPANCY_THRESHOLDS) {
  for (const threshold of thresholds) {
    if (ratio <= threshold.until) return threshold
  }
  return thresholds[thresholds.length - 1] ?? DEFAULT_OCCUPANCY_THRESHOLDS[2]
}

export function resourceOccupancy(input: {
  resources: readonly Resource[]
  jobs: readonly Job[]
  absences: readonly Absence[]
  dates: readonly string[]
  hourStart: number
  hourEnd: number
  timeZone: string
  thresholds?: readonly OccupancyThreshold[]
}): ResourceOccupancy[] {
  const thresholds = input.thresholds ?? DEFAULT_OCCUPANCY_THRESHOLDS
  const agendaResources: AgendaResource[] = input.resources.map((resource) => ({
    id: resource.id,
    label: resource.name,
    capacityHours: resource.capacityHours,
  }))
  const jobSlices = input.jobs.flatMap((job) =>
    workingSlices(jobToEvent(job), input.dates, input.hourStart, input.hourEnd, input.timeZone),
  )
  const absenceSlices = input.absences.flatMap((absence) =>
    workingSlices(absenceToEvent(absence), input.dates, input.hourStart, input.hourEnd, input.timeZone),
  )
  const scheduled = resourceLoads(jobSlices, agendaResources, input.dates, input.timeZone)
  const absent = resourceLoads(absenceSlices, agendaResources, input.dates, input.timeZone)
  return input.resources.map((resource) => {
    const load = scheduled.find((row) => row.resourceId === resource.id)
    const off = absent.find((row) => row.resourceId === resource.id)
    const scheduledMs = load?.scheduledMs ?? 0
    const capacityMs = load?.capacityMs ?? null
    const absenceMs = off?.scheduledMs ?? 0
    const availableMs = capacityMs == null ? null : Math.max(0, capacityMs - absenceMs)
    let ratio: number | null = null
    if (availableMs != null) ratio = availableMs === 0 ? (scheduledMs > 0 ? 1 : 0) : scheduledMs / availableMs
    const level = ratio == null ? null : occupancyLevel(ratio, thresholds)
    return {
      resourceId: resource.id,
      scheduledMs,
      capacityMs,
      absenceMs,
      availableMs,
      ratio,
      level: level?.id ?? null,
      tone: level?.tone ?? "neutral",
    }
  })
}

export function formatRatio(ratio: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(ratio)
}

export function levelWord(level: OccupancyLevelId | null, labels: DispatchLabels) {
  if (level === "steady") return labels.occupancySteady
  if (level === "full") return labels.occupancyFull
  return labels.occupancyOpen
}

export type BoardRow =
  | { kind: "group"; id: string; label: string; count: number }
  | { kind: "resource"; id: string }

export function boardRows(groups: readonly ResourceGroup[], resources: readonly Resource[]): BoardRow[] {
  const grouped = new Map<string, Resource[]>()
  for (const resource of resources) {
    const list = grouped.get(resource.groupId) ?? []
    list.push(resource)
    grouped.set(resource.groupId, list)
  }
  const rows: BoardRow[] = []
  const seen = new Set<string>()
  for (const group of groups) {
    const members = grouped.get(group.id)
    if (!members?.length) continue
    seen.add(group.id)
    rows.push({ kind: "group", id: group.id, label: group.label, count: members.length })
    for (const resource of members) rows.push({ kind: "resource", id: resource.id })
  }
  for (const [groupId, members] of grouped) {
    if (seen.has(groupId) || members.length === 0) continue
    rows.push({ kind: "group", id: groupId, label: groupId, count: members.length })
    for (const resource of members) rows.push({ kind: "resource", id: resource.id })
  }
  return rows
}

export function rowHeights(rows: readonly BoardRow[], lanesByResource: ReadonlyMap<string, number>) {
  const offsets: number[] = []
  const sizes: number[] = []
  let total = 0
  for (const row of rows) {
    const lanes = row.kind === "resource" ? Math.max(1, lanesByResource.get(row.id) ?? 1) : 1
    const size = row.kind === "group" ? GROUP_ROW_PX : Math.max(RESOURCE_ROW_PX, 12 + lanes * 40)
    offsets.push(total)
    sizes.push(size)
    total += size
  }
  return { offsets, sizes, total }
}

export function visibleSlice(offsets: readonly number[], sizes: readonly number[], scrollTop: number, viewport: number, overscan = 4) {
  if (offsets.length === 0) return { start: 0, end: 0 }
  const top = Math.max(0, scrollTop)
  const bottom = top + Math.max(viewport, 1)
  let start = 0
  for (let index = 0; index < offsets.length; index += 1) {
    const offset = offsets[index] ?? 0
    const size = sizes[index] ?? 0
    if (offset + size > top) {
      start = index
      break
    }
    start = index
  }
  start = Math.max(0, start - overscan)
  let end = start
  const limit = bottom + overscan * RESOURCE_ROW_PX
  while (end < offsets.length && (offsets[end] ?? 0) < limit) end += 1
  return { start, end: Math.min(offsets.length, end + overscan) }
}

export type PlacedJob = {
  jobId: string
  date: string
  startRatio: number
  sizeRatio: number
  lane: number
  lanes: number
  continuesBefore: boolean
  continuesAfter: boolean
}

export function placeResourceJobs(
  jobs: readonly Job[],
  dates: readonly string[],
  hourStart: number,
  hourEnd: number,
  timeZone: string,
): PlacedJob[] {
  const span = (hourEnd - hourStart) * 60
  if (span <= 0) return []
  const windowStart = hourStart * 60
  const windowEnd = hourEnd * 60
  const placed: PlacedJob[] = []
  for (const date of dates) {
    const pieces: {
      key: string
      jobId: string
      start: number
      end: number
      continuesBefore: boolean
      continuesAfter: boolean
    }[] = []
    for (const job of jobs) {
      const segments = segmentsForEvent(jobToEvent(job), timeZone, [date])
      for (const segment of segments) {
        const start = Math.max(segment.startMinute, windowStart)
        const end = Math.min(segment.endMinute, windowEnd)
        if (end <= start) continue
        pieces.push({
          key: `${job.id}:${date}`,
          jobId: job.id,
          start,
          end,
          continuesBefore: segment.continuesBefore || segment.startMinute < windowStart,
          continuesAfter: segment.continuesAfter || segment.endMinute > windowEnd,
        })
      }
    }
    const lanes = placeOverlaps(pieces.map((piece) => ({ id: piece.key, start: piece.start, end: piece.end })))
    for (const piece of pieces) {
      const lane = lanes.get(piece.key)
      placed.push({
        jobId: piece.jobId,
        date,
        startRatio: (piece.start - windowStart) / span,
        sizeRatio: Math.max((piece.end - piece.start) / span, 1 / span),
        lane: lane?.column ?? 0,
        lanes: lane?.columns ?? 1,
        continuesBefore: piece.continuesBefore,
        continuesAfter: piece.continuesAfter,
      })
    }
  }
  return placed
}

export type PlacedAbsence = {
  id: string
  date: string
  startRatio: number
  sizeRatio: number
  label: string
}

export function placeAbsences(
  absences: readonly Absence[],
  dates: readonly string[],
  hourStart: number,
  hourEnd: number,
  timeZone: string,
  fallbackLabel: string,
): PlacedAbsence[] {
  const span = (hourEnd - hourStart) * 60
  if (span <= 0) return []
  const windowStart = hourStart * 60
  const windowEnd = hourEnd * 60
  const placed: PlacedAbsence[] = []
  for (const date of dates) {
    for (const absence of absences) {
      const segments = segmentsForEvent(absenceToEvent(absence), timeZone, [date])
      for (const segment of segments) {
        const start = Math.max(segment.startMinute, windowStart)
        const end = Math.min(segment.endMinute, windowEnd)
        if (end <= start) continue
        placed.push({
          id: absence.id,
          date,
          startRatio: (start - windowStart) / span,
          sizeRatio: (end - start) / span,
          label: absence.label?.trim() ? absence.label : fallbackLabel,
        })
      }
    }
  }
  return placed
}

export function snapMinute(minute: number, snap: number) {
  const step = Math.max(1, Math.trunc(snap) || 1)
  return Math.round(minute / step) * step
}

export function minutesFromDelta(dx: number, timelineWidth: number, hourStart: number, hourEnd: number, snap: number) {
  const span = (hourEnd - hourStart) * 60
  if (timelineWidth <= 0 || span <= 0) return 0
  return snapMinute((dx / timelineWidth) * span, snap)
}

export function nowRatio(now: number, date: string, hourStart: number, hourEnd: number, timeZone: string) {
  if (!Number.isFinite(now) || calendarDate(now, timeZone) !== date) return null
  const minute = clockMinutes(now, timeZone)
  const start = hourStart * 60
  const end = hourEnd * 60
  if (end <= start || minute < start || minute > end) return null
  return (minute - start) / (end - start)
}

export function filterBoard(input: {
  groups: readonly ResourceGroup[]
  resources: readonly Resource[]
  jobs: readonly Job[]
  filters: DispatchFilters
  occupancy: readonly ResourceOccupancy[]
}) {
  const query = input.filters.query.trim().toLocaleLowerCase()
  let resources = input.resources.filter((resource) => {
    if (input.filters.groupId && resource.groupId !== input.filters.groupId) return false
    if (input.filters.skillId && !resource.skills.includes(input.filters.skillId)) return false
    if (input.filters.occupancy) {
      const level = input.occupancy.find((row) => row.resourceId === resource.id)?.level ?? null
      if (level !== input.filters.occupancy) return false
    }
    return true
  })
  const jobs = input.jobs.filter((job) => {
    if (input.filters.statusId && job.statusId !== input.filters.statusId) return false
    if (!query) return true
    const resource = input.resources.find((item) => item.id === job.resourceId)
    const haystack = `${job.title} ${job.location ?? ""} ${resource?.name ?? ""}`.toLocaleLowerCase()
    return haystack.includes(query)
  })
  if (query) {
    const resourceIds = new Set(jobs.map((job) => job.resourceId).filter((id): id is string => Boolean(id)))
    const nameHits = new Set(
      input.resources.filter((resource) => resource.name.toLocaleLowerCase().includes(query)).map((resource) => resource.id),
    )
    resources = resources.filter((resource) => resourceIds.has(resource.id) || nameHits.has(resource.id))
  }
  return { resources, jobs }
}

export function jobsToCsv(
  jobs: readonly Job[],
  resources: readonly Resource[],
  statuses: readonly JobStatus[],
  skills: readonly Skill[],
) {
  const columns: CsvColumn[] = [
    { key: "id", header: "id" },
    { key: "title", header: "title" },
    { key: "status", header: "status" },
    { key: "resource", header: "resource" },
    { key: "skill", header: "skill" },
    { key: "startsAt", header: "startsAt" },
    { key: "endsAt", header: "endsAt" },
    { key: "location", header: "location" },
  ]
  const rows = jobs.map((job) => ({
    id: job.id,
    title: job.title,
    status: statuses.find((status) => status.id === job.statusId)?.label ?? job.statusId,
    resource: resources.find((resource) => resource.id === job.resourceId)?.name ?? "",
    skill: skills.find((skill) => skill.id === job.skillId)?.label ?? "",
    startsAt: job.startsAt,
    endsAt: job.endsAt,
    location: job.location ?? "",
  }))
  return toCsv(rows, columns)
}

export function jobsToJson(jobs: readonly Job[]) {
  return JSON.stringify(jobs, null, 2)
}

export function resourceInitials(resource: Pick<Resource, "name" | "initials">) {
  if (resource.initials?.trim()) return resource.initials.trim().slice(0, 2)
  const parts = resource.name.split(/\s+/).filter(Boolean)
  const first = parts[0]?.[0] ?? ""
  const second = parts[1]?.[0] ?? parts[0]?.[1] ?? ""
  return `${first}${second}`.toUpperCase()
}

export type PointerKind = "mouse" | "touch"

export type Gesture =
  | { phase: "idle" }
  | { phase: "pending"; kind: PointerKind; x: number; y: number; selected: boolean; held: boolean }
  | { phase: "dragging"; kind: PointerKind }
  | { phase: "ignored" }

export type GestureEvent =
  | { type: "down"; kind: PointerKind; x: number; y: number; selected: boolean }
  | { type: "move"; x: number; y: number }
  | { type: "hold" }
  | { type: "up" }

export type GestureEffect = "none" | "select" | "drag" | "scroll"

function distance(state: Extract<Gesture, { phase: "pending" }>, x: number, y: number) {
  return { dx: x - state.x, dy: y - state.y, hypot: Math.hypot(x - state.x, y - state.y) }
}

/** Touch: a tap selects, a long-press arms a drag, and a swipe stays a scroll. */
export function reduceGesture(state: Gesture, event: GestureEvent): { state: Gesture; effect: GestureEffect } {
  if (event.type === "down") {
    return {
      state: { phase: "pending", kind: event.kind, x: event.x, y: event.y, selected: event.selected, held: false },
      effect: "none",
    }
  }
  if (state.phase !== "pending" && state.phase !== "dragging") {
    return { state: event.type === "up" ? { phase: "idle" } : state, effect: "none" }
  }
  if (event.type === "hold" && state.phase === "pending" && state.kind === "touch") {
    return { state: { ...state, held: true }, effect: "none" }
  }
  if (event.type === "move" && state.phase === "pending") {
    const moved = distance(state, event.x, event.y)
    if (state.kind === "mouse") {
      if (moved.hypot < POINTER_SLOP_PX) return { state, effect: "none" }
      return { state: { phase: "dragging", kind: "mouse" }, effect: "drag" }
    }
    if (moved.hypot < TOUCH_SLOP_PX) return { state, effect: "none" }
    if (Math.abs(moved.dy) >= Math.abs(moved.dx) || !(state.held || state.selected)) {
      return { state: { phase: "ignored" }, effect: "scroll" }
    }
    return { state: { phase: "dragging", kind: "touch" }, effect: "drag" }
  }
  if (event.type === "move" && state.phase === "dragging") return { state, effect: "drag" }
  if (event.type === "up") {
    if (state.phase === "dragging") return { state: { phase: "idle" }, effect: "drag" }
    if (state.phase === "pending") return { state: { phase: "idle" }, effect: "select" }
    return { state: { phase: "idle" }, effect: "none" }
  }
  return { state, effect: "none" }
}

export function timelineWidth(view: DispatchView, dates: readonly string[], hourStart: number, hourEnd: number) {
  if (view === "week") return Math.max(1, dates.length) * DAY_COLUMN_PX
  return Math.max(1, hourColumns(hourStart, hourEnd).length) * HOUR_COLUMN_PX
}

export function buildResources(count: number, group: ResourceGroup, skills: readonly Skill[]): Resource[] {
  const skillIds = skills.map((skill) => skill.id)
  const resources: Resource[] = []
  for (let index = 0; index < count; index += 1) {
    const skill = skillIds[index % Math.max(skillIds.length, 1)]
    resources.push({
      id: `recurso-${index + 1}`,
      name: `Asesor ${index + 1}`,
      groupId: group.id,
      skills: skill ? [skill] : [],
      capacityHours: 7,
      initials: `A${(index % 9) + 1}`,
    })
  }
  return resources
}
