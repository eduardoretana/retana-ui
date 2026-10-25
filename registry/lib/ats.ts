/**
 * Clean-room applicant tracking model.
 * The behavior was observed. No mockup source, copy, colors, or assets were copied.
 * Chrome defaults to Spanish (es-MX). Pass `labels` for another language.
 * Dates use America/Mexico_City unless the host passes another zone.
 * Time math reuses `date-range`.
 *
 * The stage is not a stored field. The host derives it with `getStage`.
 * A move is `onMoveCandidate(id, from, to)` and may reject; the board rolls it back.
 */

import { addZonedDays, startOfZonedDay, timeZoneOffsetMs } from "@/registry/retana/lib/date-range"

export const ATS_SOURCES = ["referral", "sourced", "inbound", "agency"] as const

export type AtsSource = (typeof ATS_SOURCES)[number]

export const ATS_VERDICTS = ["strong_yes", "yes", "no", "strong_no"] as const

export type AtsVerdict = (typeof ATS_VERDICTS)[number]

export const ATS_VIEWS = ["kanban", "list"] as const

export type AtsView = (typeof ATS_VIEWS)[number]

export const ATS_TONES = ["neutral", "accent", "warning", "critical", "info", "positive"] as const

export type AtsTone = (typeof ATS_TONES)[number]

export const ATS_SORT_KEYS = ["score", "name", "stage", "source", "applied", "next"] as const

export type AtsSortKey = (typeof ATS_SORT_KEYS)[number]

export const ATS_SCORE_MAX = 5

export const DEFAULT_ATS_TIME_ZONE = "America/Mexico_City"

export const DEFAULT_ATS_LOCALE = "es-MX"

export const ATS_STAGE_DRAG_PREFIX = "ats-stage:"

const DAY_MS = 86_400_000

export type AtsPerson = {
  id: string
  name: string
  role?: string
  src?: string
}

export type AtsStage = {
  id: string
  label: string
  /** Semantic tone. The host theme paints it. */
  tone?: AtsTone
  /** Class override for the stage pill and its progress dot. Wins over `tone`. */
  className?: string
}

export type AtsTag = {
  id: string
  label: string
}

export type AtsCriterion = {
  key: string
  label: string
  description?: string
}

/** One row of a submitted scorecard. `rating` is 1–5. */
export type AtsCriterionRating = {
  key: string
  label: string
  rating: number
  comment?: string
}

/**
 * One evaluator. A candidate holds N of these.
 * `onSubmit` emits `criteria`, `overall`, and `verdict`.
 * `TMeta` is the host's extra payload. The pieces never read it.
 */
export type AtsScorecard<TMeta = Record<string, unknown>> = {
  id?: string
  authorId?: string
  createdAt?: string
  criteria: readonly AtsCriterionRating[]
  overall: number
  verdict: AtsVerdict
  /** Optional stage the evaluation was about. Columns do not read this. */
  stageId?: string | null
  summary?: string
  meta?: TMeta
}

export type AtsScorecardDraft = {
  criteria: readonly AtsCriterionRating[]
  overall: number
  verdict: AtsVerdict
}

export type AtsInterview = {
  id: string
  startsAt: string
  endsAt?: string
  kind?: string
  interviewerIds?: readonly string[]
  location?: string
  note?: string
}

export type AtsInterviewSlot = {
  startsAt: string
  endsAt?: string
  kind?: string
  interviewerIds?: readonly string[]
  location?: string
  note?: string
}

export type AtsNote = {
  id: string
  authorId: string
  body: string
  createdAt: string
}

export type AtsFile = {
  id: string
  name: string
  size?: number
  href?: string
}

export type AtsActivity = {
  id: string
  body: string
  createdAt: string
  authorId?: string
}

export type AtsEducation = {
  id: string
  school: string
  degree?: string
  years?: string
}

export type AtsNextStep = {
  label: string
  at?: string | null
}

export type AtsDebrief = {
  summary?: string
  ask?: string
  askAuthorId?: string
}

/**
 * `TMeta` is the host's extra payload. The pieces never read it.
 * There is no stage field. The host passes `getStage`.
 */
export type AtsCandidate<TMeta = Record<string, unknown>> = {
  id: string
  name: string
  headline?: string
  location?: string
  years?: number | null
  email?: string
  phone?: string
  appliedAt: string
  source: AtsSource | (string & {})
  sourceDetail?: string
  ownerId?: string | null
  tags?: readonly AtsTag[]
  notice?: string
  education?: readonly AtsEducation[]
  notes?: readonly AtsNote[]
  files?: readonly AtsFile[]
  activity?: readonly AtsActivity[]
  scorecards?: readonly AtsScorecard[]
  interviews?: readonly AtsInterview[]
  nextStep?: AtsNextStep | null
  applicationNote?: string
  debrief?: AtsDebrief | null
  meta?: TMeta
}

export type AtsJob<TMeta = Record<string, unknown>> = {
  id: string
  title: string
  department?: string
  location?: string
  employment?: string
  hiringManagerId?: string | null
  status?: "open" | "closed" | "paused"
  openedAt?: string
  goalAt?: string | null
  hired?: number
  headcount?: number
  meta?: TMeta
}

export type AtsFilters = {
  query: string
  stageId: string | null
  source: string | null
  scoreMin: number | null
  scoreMax: number | null
  /** Civil date `YYYY-MM-DD` or an ISO instant. */
  from: string | null
  to: string | null
  needsFeedback: boolean
}

export type AtsSort = {
  key: AtsSortKey
  direction: "asc" | "desc"
}

export type AtsStageGroup<TMeta = Record<string, unknown>> = {
  stage: AtsStage
  candidates: AtsCandidate<TMeta>[]
}

export type FunnelStep = {
  stage: AtsStage
  count: number
  /** Share of the previous stage's headcount, 0–1. Null on the first stage and when the previous stage is empty. */
  ofPrevious: number | null
}

export type CriterionAverage = {
  key: string
  label: string
  average: number | null
  count: number
}

/** Host function. Returns a stage id from `stages`. The board does not store the result. */
export type AtsGetStage<TMeta = Record<string, unknown>> = (candidate: AtsCandidate<TMeta>) => string

/** What a progress or actions slot receives. The pieces do not read a stage field. */
export type AtsSlotInfo<TMeta = Record<string, unknown>> = {
  candidate: AtsCandidate<TMeta>
  stageId: string
  stages: readonly AtsStage[]
}

export type VerdictTally = {
  yes: number
  total: number
}

export type AtsLabels = {
  boardLabel: string
  jobs: string
  searchLabel: string
  searchPlaceholder: string
  viewLabel: string
  kanbanView: string
  listView: string
  filters: string
  sourceLabel: string
  allSources: string
  scoreRange: string
  scoreMin: string
  scoreMax: string
  from: string
  to: string
  emptyTitle: string
  emptyHint: string
  noMatchesTitle: string
  noMatchesHint: string
  emptyColumn: string
  loadingLabel: string
  errorTitle: string
  retry: string
  readOnlyNote: string
  openCandidate: (name: string) => string
  dragCandidate: (name: string) => string
  actionsFor: (name: string) => string
  moveTo: string
  open: string
  addAssessment: string
  addAssessmentFor: (name: string) => string
  appliedOn: (date: string) => string
  noAppliedDate: string
  scoreLabel: string
  scoreValue: (score: string) => string
  noScore: string
  scoreOf: (score: string, max: number) => string
  stars: (value: number, max: number) => string
  stageScores: string
  stageScore: (stage: string, score: string) => string
  years: (count: number) => string
  candidate: string
  stage: string
  source: string
  nextStep: string
  owner: string
  selectCandidate: (name: string) => string
  selectAll: string
  sortBy: (label: string) => string
  showing: (visible: number, total: number) => string
  sortedBy: (label: string) => string
  listLabel: string
  detailTitle: string
  close: string
  previous: string
  next: string
  position: (current: number, total: number) => string
  sendEmail: string
  schedule: string
  scheduleFor: (name: string) => string
  scheduleKind: string
  scheduleWhen: string
  confirmSchedule: string
  cancel: string
  moveNext: (stage: string) => string
  tabOverview: string
  tabApplication: string
  tabScorecards: (count: number) => string
  tabActivity: string
  tabFiles: string
  debriefTitle: string
  scorecardsOf: (done: number, total: number) => string
  recommendMove: (stage: string, yes: number, total: number) => string
  recommendHold: (yes: number, total: number) => string
  recommendNone: string
  moveFailed: (name: string, stage: string) => string
  moveBlocked: string
  extraActions: string
  debriefLead: (names: string) => string
  debriefSoft: (names: string, soft: string) => string
  debriefEven: (name: string) => string
  noDebrief: string
  askInStage: (stage: string) => string
  fromAuthor: (name: string) => string
  averageShort: (score: string) => string
  verdictStrongYes: string
  verdictYes: string
  verdictNo: string
  verdictStrongNo: string
  noScorecards: string
  noActivity: string
  noFiles: string
  noNotes: string
  noEducation: string
  personal: string
  education: string
  notes: string
  email: string
  phone: string
  location: string
  notice: string
  hiringManager: string
  unassigned: string
  addNote: string
  notePlaceholder: string
  application: string
  noApplication: string
  process: string
  currentStage: string
  overview: string
  all: string
  needsFeedback: string
  thisMonth: (count: number) => string
  ofPrevious: (percent: string, stage: string) => string
  accepted: (count: number) => string
  hiredProgress: (hired: number, headcount: number) => string
  goalBy: (date: string) => string
  statusOpen: (days: number) => string
  statusPaused: string
  statusClosed: string
  share: string
  sourceReferral: string
  sourceSourced: string
  sourceInbound: string
  sourceAgency: string
  rateAction: (name: string) => string
  editRating: (name: string) => string
  saveCriterion: (name: string) => string
  commentFor: (name: string) => string
  commentPlaceholder: string
  liveScore: (score: string) => string
  liveScoreEmpty: string
  verdictField: string
  noVerdict: string
  summaryField: string
  submitAssessment: string
  assessmentSent: string
  assessmentFor: (name: string) => string
  backToDetail: string
  criteriaEmpty: string
  pickedUp: (name: string) => string
  overColumn: (label: string) => string
  moved: (name: string, stage: string) => string
  dropped: string
  cancelled: string
  announcements: string
  shortcuts: string
  unknownAuthor: string
  filterSource: (label: string) => string
  showFilters: string
  hideFilters: string
  sortScore: string
  sortName: string
  sortStage: string
  sortSource: string
  sortApplied: string
  sortNext: string
  listAnd: string
}

export const atsLabels: AtsLabels = {
  boardLabel: "Seguimiento de candidatos",
  jobs: "Vacantes",
  searchLabel: "Buscar",
  searchPlaceholder: "Buscar candidatos",
  viewLabel: "Vista",
  kanbanView: "Tablero",
  listView: "Lista",
  filters: "Filtros",
  sourceLabel: "Fuente",
  allSources: "Todas las fuentes",
  scoreRange: "Rango de puntaje",
  scoreMin: "Puntaje mínimo",
  scoreMax: "Puntaje máximo",
  from: "Desde",
  to: "Hasta",
  emptyTitle: "No hay candidatos",
  emptyHint: "Cuando alguien aplique, aparece en la primera etapa.",
  noMatchesTitle: "Ningún candidato coincide",
  noMatchesHint: "Prueba con otra búsqueda, fecha o puntaje.",
  emptyColumn: "Sin candidatos",
  loadingLabel: "Cargando candidatos",
  errorTitle: "No se pudo cargar el seguimiento",
  retry: "Reintentar",
  readOnlyNote: "Solo lectura",
  openCandidate: (name) => `Abrir ${name}`,
  dragCandidate: (name) => `Arrastrar ${name}`,
  actionsFor: (name) => `Acciones de ${name}`,
  moveTo: "Mover a",
  open: "Abrir",
  addAssessment: "Agregar evaluación",
  addAssessmentFor: (name) => `Agregar evaluación de ${name}`,
  appliedOn: (date) => `Aplicó el ${date}`,
  noAppliedDate: "Sin fecha de aplicación",
  scoreLabel: "Puntaje",
  scoreValue: (score) => `Puntaje ${score}`,
  noScore: "Sin puntaje",
  scoreOf: (score, max) => `${score} de ${max}`,
  stars: (value, max) => `${value} de ${max} estrellas`,
  stageScores: "Puntaje por etapa",
  stageScore: (stage, score) => `${stage}: ${score}`,
  years: (count) => `${count} ${count === 1 ? "año" : "años"}`,
  candidate: "Candidato",
  stage: "Etapa",
  source: "Fuente",
  nextStep: "Siguiente paso",
  owner: "Responsable",
  selectCandidate: (name) => `Seleccionar ${name}`,
  selectAll: "Seleccionar todos",
  sortBy: (label) => `Ordenar por ${label}`,
  showing: (visible, total) => `Mostrando ${visible} de ${total}`,
  sortedBy: (label) => `ordenado por ${label}`,
  listLabel: "Lista de candidatos",
  detailTitle: "Detalle del candidato",
  close: "Cerrar",
  previous: "Anterior",
  next: "Siguiente",
  position: (current, total) => formatAtsPosition(current, total, "de"),
  sendEmail: "Enviar correo",
  schedule: "Agendar",
  scheduleFor: (name) => `Agendar con ${name}`,
  scheduleKind: "Tipo de cita",
  scheduleWhen: "Fecha y hora",
  confirmSchedule: "Confirmar cita",
  cancel: "Cancelar",
  moveNext: (stage) => `Mover a ${stage}`,
  tabOverview: "Resumen",
  tabApplication: "Postulación",
  tabScorecards: (count) => `Scorecards ${count}`,
  tabActivity: "Actividad",
  tabFiles: "Archivos",
  debriefTitle: "Panel de debrief",
  scorecardsOf: (done, total) => `${done} de ${total} scorecards`,
  recommendMove: (stage, yes, total) => `Mover a ${stage}, ${yes} de ${total} sí`,
  recommendHold: (yes, total) => `Seguir en la etapa, ${yes} de ${total} sí`,
  recommendNone: "Sin recomendaciones todavía.",
  moveFailed: (name, stage) => `${name} sigue en ${stage}.`,
  moveBlocked: "Esa transición no está disponible.",
  extraActions: "Acciones extra",
  debriefLead: (names) => `${names} lideran las tarjetas.`,
  debriefSoft: (names, soft) => `${names} lideran las tarjetas. ${soft} es el punto a revisar.`,
  debriefEven: (name) => `${name} se mantiene parejo en las tarjetas.`,
  noDebrief: "Todavía no hay evaluaciones.",
  askInStage: (stage) => `Preguntar en ${stage}`,
  fromAuthor: (name) => `De las notas de ${name}`,
  averageShort: (score) => `promedio ${score}`,
  verdictStrongYes: "Sí fuerte",
  verdictYes: "Sí",
  verdictNo: "No",
  verdictStrongNo: "No fuerte",
  noScorecards: "Todavía no hay scorecards.",
  noActivity: "Todavía no hay actividad.",
  noFiles: "Todavía no hay archivos.",
  noNotes: "Todavía no hay notas.",
  noEducation: "Sin estudios registrados.",
  personal: "Información personal",
  education: "Estudios",
  notes: "Notas",
  email: "Correo",
  phone: "Teléfono",
  location: "Ubicación",
  notice: "Aviso",
  hiringManager: "Responsable de contratación",
  unassigned: "Sin responsable",
  addNote: "Agregar nota",
  notePlaceholder: "Escribe una nota",
  application: "Postulación",
  noApplication: "Sin carta de postulación.",
  process: "Proceso de contratación",
  currentStage: "Etapa actual",
  overview: "General",
  all: "Todos",
  needsFeedback: "Necesita feedback",
  thisMonth: (count) => `${count} este mes`,
  ofPrevious: (percent, stage) => `${percent} de ${stage}`,
  accepted: (count) => `${count} ${count === 1 ? "aceptó" : "aceptaron"}`,
  hiredProgress: (hired, headcount) => `${hired} de ${headcount} contratados`,
  goalBy: (date) => `meta al ${date}`,
  statusOpen: (days) => `Abierto · día ${days}`,
  statusPaused: "En pausa",
  statusClosed: "Cerrado",
  share: "Compartir",
  sourceReferral: "Referido",
  sourceSourced: "Sourced",
  sourceInbound: "Inbound",
  sourceAgency: "Agencia",
  rateAction: (name) => `Calificar ${name}`,
  editRating: (name) => `Editar ${name}`,
  saveCriterion: (name) => `Guardar ${name}`,
  commentFor: (name) => `Comentario de ${name}`,
  commentPlaceholder: "Qué observaste",
  liveScore: (score) => `Puntaje ${score}`,
  liveScoreEmpty: "Sin puntaje todavía",
  verdictField: "Recomendación",
  noVerdict: "Sin recomendación",
  summaryField: "Resumen",
  submitAssessment: "Enviar evaluación",
  assessmentSent: "Evaluación enviada",
  assessmentFor: (name) => `Evaluación de ${name}`,
  backToDetail: "Volver al detalle",
  criteriaEmpty: "Este puesto no tiene criterios.",
  pickedUp: (name) => `Tomaste ${name}.`,
  overColumn: (label) => `Sobre ${label}.`,
  moved: (name, stage) => `${name} se movió a ${stage}.`,
  dropped: "Soltaste al candidato.",
  cancelled: "Cancelado.",
  announcements: "Avisos del seguimiento",
  shortcuts: "Flechas mueven de etapa. En el detalle, flecha izquierda y derecha cambian de candidato.",
  unknownAuthor: "Alguien del equipo",
  filterSource: (label) => `Fuente ${label}`,
  showFilters: "Mostrar filtros",
  hideFilters: "Ocultar filtros",
  sortScore: "puntaje",
  sortName: "nombre",
  sortStage: "etapa",
  sortSource: "fuente",
  sortApplied: "fecha",
  sortNext: "siguiente paso",
  listAnd: " y ",
}

export const atsLabelsEn: AtsLabels = {
  boardLabel: "Candidate tracking",
  jobs: "Jobs",
  searchLabel: "Search",
  searchPlaceholder: "Search candidates",
  viewLabel: "View",
  kanbanView: "Board",
  listView: "List",
  filters: "Filters",
  sourceLabel: "Source",
  allSources: "All sources",
  scoreRange: "Score range",
  scoreMin: "Minimum score",
  scoreMax: "Maximum score",
  from: "From",
  to: "To",
  emptyTitle: "No candidates",
  emptyHint: "New applications show up in the first stage.",
  noMatchesTitle: "No matching candidates",
  noMatchesHint: "Try another search, date, or score.",
  emptyColumn: "No candidates",
  loadingLabel: "Loading candidates",
  errorTitle: "Candidate tracking could not be loaded",
  retry: "Try again",
  readOnlyNote: "Read only",
  openCandidate: (name) => `Open ${name}`,
  dragCandidate: (name) => `Drag ${name}`,
  actionsFor: (name) => `Actions for ${name}`,
  moveTo: "Move to",
  open: "Open",
  addAssessment: "Add evaluation",
  addAssessmentFor: (name) => `Add evaluation for ${name}`,
  appliedOn: (date) => `Applied ${date}`,
  noAppliedDate: "No application date",
  scoreLabel: "Score",
  scoreValue: (score) => `Score ${score}`,
  noScore: "Not scored",
  scoreOf: (score, max) => `${score} of ${max}`,
  stars: (value, max) => `${value} of ${max} stars`,
  stageScores: "Score by stage",
  stageScore: (stage, score) => `${stage}: ${score}`,
  years: (count) => `${count} ${count === 1 ? "year" : "years"}`,
  candidate: "Candidate",
  stage: "Stage",
  source: "Source",
  nextStep: "Next step",
  owner: "Owner",
  selectCandidate: (name) => `Select ${name}`,
  selectAll: "Select all",
  sortBy: (label) => `Sort by ${label}`,
  showing: (visible, total) => `Showing ${visible} of ${total}`,
  sortedBy: (label) => `sorted by ${label}`,
  listLabel: "Candidate list",
  detailTitle: "Candidate detail",
  close: "Close",
  previous: "Previous",
  next: "Next",
  position: (current, total) => formatAtsPosition(current, total, "of"),
  sendEmail: "Send email",
  schedule: "Schedule",
  scheduleFor: (name) => `Schedule with ${name}`,
  scheduleKind: "Meeting type",
  scheduleWhen: "Date and time",
  confirmSchedule: "Confirm meeting",
  cancel: "Cancel",
  moveNext: (stage) => `Move to ${stage}`,
  tabOverview: "Overview",
  tabApplication: "Application",
  tabScorecards: (count) => `Scorecards ${count}`,
  tabActivity: "Activity",
  tabFiles: "Files",
  debriefTitle: "Debrief panel",
  scorecardsOf: (done, total) => `${done} of ${total} scorecards`,
  recommendMove: (stage, yes, total) => `Move to ${stage}, ${yes} of ${total} yes`,
  recommendHold: (yes, total) => `Stay in stage, ${yes} of ${total} yes`,
  recommendNone: "No recommendation yet.",
  moveFailed: (name, stage) => `${name} stayed in ${stage}.`,
  moveBlocked: "That transition is not available.",
  extraActions: "Extra actions",
  debriefLead: (names) => `${names} lead every card.`,
  debriefSoft: (names, soft) => `${names} lead every card. ${soft} is the soft spot.`,
  debriefEven: (name) => `${name} stays even across the cards.`,
  noDebrief: "No evaluations yet.",
  askInStage: (stage) => `Ask in ${stage}`,
  fromAuthor: (name) => `From ${name}'s notes`,
  averageShort: (score) => `avg ${score}`,
  verdictStrongYes: "Strong yes",
  verdictYes: "Yes",
  verdictNo: "No",
  verdictStrongNo: "Strong no",
  noScorecards: "No scorecards yet.",
  noActivity: "No activity yet.",
  noFiles: "No files yet.",
  noNotes: "No notes yet.",
  noEducation: "No education on file.",
  personal: "Personal",
  education: "Education",
  notes: "Notes",
  email: "Email",
  phone: "Phone",
  location: "Location",
  notice: "Notice",
  hiringManager: "Hiring manager",
  unassigned: "Unassigned",
  addNote: "Add note",
  notePlaceholder: "Write a note",
  application: "Application",
  noApplication: "No application note.",
  process: "Hiring process",
  currentStage: "Current stage",
  overview: "Overall",
  all: "All",
  needsFeedback: "Needs feedback",
  thisMonth: (count) => `${count} this month`,
  ofPrevious: (percent, stage) => `${percent} of ${stage}`,
  accepted: (count) => `${count} accepted`,
  hiredProgress: (hired, headcount) => `${hired} of ${headcount} hired`,
  goalBy: (date) => `goal by ${date}`,
  statusOpen: (days) => `Open · day ${days}`,
  statusPaused: "Paused",
  statusClosed: "Closed",
  share: "Share",
  sourceReferral: "Referral",
  sourceSourced: "Sourced",
  sourceInbound: "Inbound",
  sourceAgency: "Agency",
  rateAction: (name) => `Rate ${name}`,
  editRating: (name) => `Edit ${name}`,
  saveCriterion: (name) => `Save ${name}`,
  commentFor: (name) => `Comment on ${name}`,
  commentPlaceholder: "What you noticed",
  liveScore: (score) => `Score ${score}`,
  liveScoreEmpty: "No score yet",
  verdictField: "Recommendation",
  noVerdict: "No recommendation",
  summaryField: "Summary",
  submitAssessment: "Submit evaluation",
  assessmentSent: "Evaluation sent",
  assessmentFor: (name) => `Evaluation for ${name}`,
  backToDetail: "Back to detail",
  criteriaEmpty: "This job has no criteria.",
  pickedUp: (name) => `Picked up ${name}.`,
  overColumn: (label) => `Over ${label}.`,
  moved: (name, stage) => `${name} moved to ${stage}.`,
  dropped: "Dropped the candidate.",
  cancelled: "Cancelled.",
  announcements: "Tracking announcements",
  shortcuts: "Arrow keys move stages. In the detail, left and right change candidate.",
  unknownAuthor: "Someone on the team",
  filterSource: (label) => `Source ${label}`,
  showFilters: "Show filters",
  hideFilters: "Hide filters",
  sortScore: "score",
  sortName: "name",
  sortStage: "stage",
  sortSource: "source",
  sortApplied: "date",
  sortNext: "next step",
  listAnd: " and ",
}

export const emptyAtsFilters: AtsFilters = {
  query: "",
  stageId: null,
  source: null,
  scoreMin: null,
  scoreMax: null,
  from: null,
  to: null,
  needsFeedback: false,
}

export const defaultAtsSort: AtsSort = { key: "score", direction: "desc" }

export function resolveAtsLabels(partial?: Partial<AtsLabels>): AtsLabels {
  return { ...atsLabels, ...partial }
}

/** 1-based position. The index is at least two digits: `02 de 14`. */
export function formatAtsPosition(current: number, total: number, ofWord = "de") {
  const safeTotal = Math.max(0, total)
  const safeCurrent = Math.min(Math.max(0, current), safeTotal)
  return `${String(safeCurrent).padStart(2, "0")} ${ofWord} ${safeTotal}`
}

export function average(values: readonly number[]): number | null {
  const finite = values.filter((value) => Number.isFinite(value))
  if (!finite.length) return null
  return finite.reduce((sum, value) => sum + value, 0) / finite.length
}

export function roundScore(value: number, digits = 1) {
  const factor = 10 ** digits
  return Math.round((value + Number.EPSILON) * factor) / factor
}

export function formatScore(value: number | null | undefined, digits = 1) {
  if (value == null || !Number.isFinite(value)) return ""
  return roundScore(value, digits).toFixed(digits)
}

export function scorecardOverall(scorecard: {
  overall?: number
  criteria?: readonly { rating: number }[]
}): number | null {
  if (scorecard.overall != null && Number.isFinite(scorecard.overall)) return scorecard.overall
  return average((scorecard.criteria ?? []).map((criterion) => criterion.rating))
}

export function candidateScore(candidate: {
  scorecards?: readonly { overall?: number; criteria?: readonly { rating: number }[] }[]
}): number | null {
  const scores = (candidate.scorecards ?? []).map(scorecardOverall).filter((score): score is number => score != null)
  return average(scores)
}

/** Averages each criterion across every evaluator. */
export function criterionBars(
  scorecards: readonly { criteria: readonly AtsCriterionRating[] }[],
  criteria?: readonly AtsCriterion[],
): CriterionAverage[] {
  const order = criteria?.map((criterion) => criterion.key)
  const map = new Map<string, { key: string; label: string; ratings: number[] }>()
  const seed = (key: string, label: string) => {
    const current = map.get(key) ?? { key, label, ratings: [] }
    if (label) current.label = label
    map.set(key, current)
    return current
  }
  for (const criterion of criteria ?? []) seed(criterion.key, criterion.label)
  for (const card of scorecards) {
    for (const criterion of card.criteria) {
      const bucket = seed(criterion.key, criterion.label)
      if (Number.isFinite(criterion.rating)) bucket.ratings.push(criterion.rating)
    }
  }
  const rows = [...map.values()].map((bucket) => ({
    key: bucket.key,
    label: bucket.label,
    average: average(bucket.ratings),
    count: bucket.ratings.length,
  }))
  if (!order?.length) return rows
  return rows.sort((a, b) => {
    const ai = order.indexOf(a.key)
    const bi = order.indexOf(b.key)
    return (ai < 0 ? order.length : ai) - (bi < 0 ? order.length : bi)
  })
}

export function scoresByStage(
  candidate: { scorecards?: readonly { stageId?: string | null; overall?: number; criteria?: readonly { rating: number }[] }[] },
  stages: readonly AtsStage[],
) {
  return stages.flatMap((stage) => {
    const scores = (candidate.scorecards ?? [])
      .filter((card) => card.stageId === stage.id)
      .map(scorecardOverall)
      .filter((score): score is number => score != null)
    const score = average(scores)
    return score == null ? [] : [{ stageId: stage.id, label: stage.label, score }]
  })
}

/** Firm yes is `strong_yes` and `yes`. `no` and `strong_no` stay in the total. */
export function isFirmYes(verdict: AtsVerdict | undefined) {
  return verdict === "strong_yes" || verdict === "yes"
}

export function verdictTally(scorecards: readonly { verdict?: AtsVerdict }[] | undefined): VerdictTally {
  const cards = (scorecards ?? []).filter((card) => card.verdict)
  return {
    yes: cards.filter((card) => isFirmYes(card.verdict)).length,
    total: cards.length,
  }
}

export function nextStageId(stageId: string, stages: readonly AtsStage[]) {
  const index = stages.findIndex((stage) => stage.id === stageId)
  if (index < 0) return null
  return stages[index + 1]?.id ?? null
}

/** Suggests the next stage when firm yeses are at least half of the scorecards. */
export function recommendedStageId(stageId: string, scorecards: readonly { verdict?: AtsVerdict }[] | undefined, stages: readonly AtsStage[]) {
  const tally = verdictTally(scorecards)
  if (tally.total === 0 || tally.yes * 2 < tally.total) return null
  return nextStageId(stageId, stages)
}

export function recommendationLine(stageId: string, scorecards: readonly { verdict?: AtsVerdict }[] | undefined, stages: readonly AtsStage[], labels: AtsLabels) {
  const tally = verdictTally(scorecards)
  if (tally.total === 0) return labels.recommendNone
  const next = nextStageId(stageId, stages)
  const nextLabel = stages.find((stage) => stage.id === next)?.label
  if (nextLabel && tally.yes * 2 >= tally.total) return labels.recommendMove(nextLabel, tally.yes, tally.total)
  return labels.recommendHold(tally.yes, tally.total)
}

export function debriefNarrative(averages: readonly CriterionAverage[], labels: AtsLabels) {
  const named = averages.flatMap((item) => (item.average == null ? [] : [{ label: item.label, average: item.average }]))
  if (!named.length) return labels.noDebrief
  const ranked = [...named].sort((a, b) => b.average - a.average || a.label.localeCompare(b.label, "es-MX"))
  const top = ranked[0]!
  const lead = ranked.filter((item) => top.average - item.average <= 0.2).slice(0, 2)
  const soft = ranked[ranked.length - 1]!
  const leadText = lead.map((item) => item.label).join(labels.listAnd)
  if (lead.length === ranked.length) return labels.debriefEven(leadText)
  if (soft.average >= 4) return labels.debriefLead(leadText)
  return labels.debriefSoft(leadText, soft.label)
}

export function buildScorecard(criteria: readonly AtsCriterionRating[], verdict: AtsVerdict): AtsScorecardDraft {
  const overall = average(criteria.map((criterion) => criterion.rating)) ?? 0
  return {
    criteria: criteria.map((criterion) => ({
      key: criterion.key,
      label: criterion.label,
      rating: criterion.rating,
      comment: criterion.comment?.trim() || undefined,
    })),
    overall: roundScore(overall),
    verdict,
  }
}

export function funnelSteps<TMeta>(
  candidates: readonly AtsCandidate<TMeta>[],
  stages: readonly AtsStage[],
  getStage: AtsGetStage<TMeta>,
): FunnelStep[] {
  const counts = stages.map((stage) => ({
    stage,
    count: candidates.filter((candidate) => getStage(candidate) === stage.id).length,
  }))
  return counts.map((step, index) => {
    if (index === 0) return { ...step, ofPrevious: null }
    const previous = counts[index - 1]?.count ?? 0
    return { ...step, ofPrevious: previous === 0 ? null : step.count / previous }
  })
}

export function formatPercent(ratio: number | null) {
  if (ratio == null || !Number.isFinite(ratio)) return ""
  return `${Math.round(ratio * 100)}%`
}

export function groupCandidatesByStage<TMeta>(
  candidates: readonly AtsCandidate<TMeta>[],
  stages: readonly AtsStage[],
  getStage: AtsGetStage<TMeta>,
): AtsStageGroup<TMeta>[] {
  return stages.map((stage) => ({
    stage,
    candidates: candidates.filter((candidate) => getStage(candidate) === stage.id),
  }))
}

export function personById(people: readonly AtsPerson[], id: string | null | undefined) {
  if (!id) return null
  return people.find((person) => person.id === id) ?? null
}

export function personInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function sourceLabel(labels: AtsLabels, source: string) {
  if (source === "referral") return labels.sourceReferral
  if (source === "sourced") return labels.sourceSourced
  if (source === "inbound") return labels.sourceInbound
  if (source === "agency") return labels.sourceAgency
  return source
}

export function verdictLabel(labels: AtsLabels, verdict: AtsVerdict | undefined) {
  if (verdict === "strong_yes") return labels.verdictStrongYes
  if (verdict === "yes") return labels.verdictYes
  if (verdict === "no") return labels.verdictNo
  if (verdict === "strong_no") return labels.verdictStrongNo
  return labels.noVerdict
}

export function sortLabel(labels: AtsLabels, key: AtsSortKey) {
  if (key === "score") return labels.sortScore
  if (key === "name") return labels.sortName
  if (key === "stage") return labels.sortStage
  if (key === "source") return labels.sortSource
  if (key === "applied") return labels.sortApplied
  return labels.sortNext
}

const DATE_STYLES = {
  short: { day: "numeric", month: "short" },
  medium: { day: "numeric", month: "short", year: "numeric" },
  time: { weekday: "short", hour: "2-digit", minute: "2-digit" },
} as const

export function formatAtsDate(
  value: string | null | undefined,
  locale = DEFAULT_ATS_LOCALE,
  timeZone = DEFAULT_ATS_TIME_ZONE,
  style: keyof typeof DATE_STYLES = "short",
) {
  if (!value) return ""
  const time = Date.parse(value)
  if (Number.isNaN(time)) return ""
  return new Intl.DateTimeFormat(locale, { timeZone, ...DATE_STYLES[style] }).format(new Date(time))
}

export function zonedYearMonth(time: number, timeZone: string) {
  if (!Number.isFinite(time)) return null
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit" }).formatToParts(new Date(time))
  const year = parts.find((part) => part.type === "year")?.value
  const month = parts.find((part) => part.type === "month")?.value
  if (!year || !month) return null
  return `${year}-${month}`
}

export function countAppliedInMonth(
  candidates: readonly { appliedAt: string }[],
  now: Date | string,
  timeZone = DEFAULT_ATS_TIME_ZONE,
) {
  const clock = typeof now === "string" ? Date.parse(now) : now.getTime()
  const target = zonedYearMonth(clock, timeZone)
  if (!target) return 0
  return candidates.filter((candidate) => {
    const time = Date.parse(candidate.appliedAt)
    return zonedYearMonth(time, timeZone) === target
  }).length
}

/** Inclusive day count. Opened today is day 1. */
export function daysOpen(openedAt: string | undefined, now: Date | string, timeZone = DEFAULT_ATS_TIME_ZONE) {
  if (!openedAt) return null
  const from = Date.parse(openedAt)
  const to = typeof now === "string" ? Date.parse(now) : now.getTime()
  if (Number.isNaN(from) || Number.isNaN(to)) return null
  const start = startOfZonedDay(from, timeZone)
  const end = startOfZonedDay(to, timeZone)
  return Math.max(1, Math.round((end - start) / DAY_MS) + 1)
}

/** Start of a civil `YYYY-MM-DD` in `timeZone`, as a UTC instant. */
export function zonedCivilStart(isoDate: string, timeZone = DEFAULT_ATS_TIME_ZONE) {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(isoDate.trim())
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])
  if (month < 1 || month > 12 || day < 1 || day > 31) return null
  const guess = Date.UTC(year, month - 1, day)
  const offset = timeZoneOffsetMs(timeZone, guess)
  const start = guess - offset
  const offsetAtStart = timeZoneOffsetMs(timeZone, start)
  return offsetAtStart === offset ? start : guess - offsetAtStart
}

export function civilDayEnd(isoDate: string, timeZone = DEFAULT_ATS_TIME_ZONE) {
  const start = zonedCivilStart(isoDate, timeZone)
  if (start == null) return null
  return addZonedDays(start, 1, timeZone) - 1
}

export function candidateNeedsFeedback(
  candidate: { scorecards?: readonly { criteria: readonly { key: string }[] }[] },
  stageId: string,
  options?: { criteria?: readonly { key: string }[]; stageIds?: readonly string[] },
) {
  if (options?.stageIds && !options.stageIds.includes(stageId)) return false
  const cards = candidate.scorecards ?? []
  const criteria = options?.criteria ?? []
  if (!criteria.length) return cards.length === 0
  return !cards.some((card) => {
    const rated = new Set(card.criteria.map((criterion) => criterion.key))
    return criteria.every((criterion) => rated.has(criterion.key))
  })
}

export function candidateMatchesQuery<TMeta>(
  candidate: AtsCandidate<TMeta>,
  query: string,
  context: { people?: readonly AtsPerson[]; stages?: readonly AtsStage[]; labels: AtsLabels; stageId?: string },
) {
  const needle = query.trim().toLocaleLowerCase("es-MX")
  if (!needle) return true
  const owner = personById(context.people ?? [], candidate.ownerId)
  const stage = context.stages?.find((item) => item.id === context.stageId)
  const haystack = [
    candidate.name,
    candidate.headline,
    candidate.location,
    candidate.email,
    candidate.source,
    sourceLabel(context.labels, candidate.source),
    candidate.sourceDetail,
    stage?.label,
    owner?.name,
    candidate.nextStep?.label,
    ...(candidate.tags ?? []).map((tag) => tag.label),
  ]
    .filter(Boolean)
    .join(" ")
    .toLocaleLowerCase("es-MX")
  return haystack.includes(needle)
}

function scoreInRange(score: number | null, filters: AtsFilters) {
  const min = filters.scoreMin
  const max = filters.scoreMax
  const bounded = (min != null && min > 0) || (max != null && max < ATS_SCORE_MAX)
  if (!bounded) return true
  if (score == null) return false
  if (min != null && score < min) return false
  if (max != null && score > max) return false
  return true
}

export function candidateMatchesFilters<TMeta>(
  candidate: AtsCandidate<TMeta>,
  filters: AtsFilters,
  context: {
    getStage: AtsGetStage<TMeta>
    people?: readonly AtsPerson[]
    stages?: readonly AtsStage[]
    criteria?: readonly { key: string }[]
    feedbackStageIds?: readonly string[]
    labels: AtsLabels
    timeZone?: string
  },
) {
  const stageId = context.getStage(candidate)
  if (!candidateMatchesQuery(candidate, filters.query, { ...context, stageId })) return false
  if (filters.stageId && stageId !== filters.stageId) return false
  if (filters.source && candidate.source !== filters.source) return false
  if (!scoreInRange(candidateScore(candidate), filters)) return false
  if (
    filters.needsFeedback &&
    !candidateNeedsFeedback(candidate, stageId, { criteria: context.criteria, stageIds: context.feedbackStageIds })
  ) {
    return false
  }
  const timeZone = context.timeZone ?? DEFAULT_ATS_TIME_ZONE
  const applied = Date.parse(candidate.appliedAt)
  if (filters.from) {
    const start = zonedCivilStart(filters.from, timeZone) ?? Date.parse(filters.from)
    if (Number.isFinite(start) && (Number.isNaN(applied) || applied < start)) return false
  }
  if (filters.to) {
    const end = civilDayEnd(filters.to, timeZone) ?? Date.parse(filters.to)
    if (Number.isFinite(end) && (Number.isNaN(applied) || applied > end)) return false
  }
  return true
}

function compareNullableNumber(a: number | null, b: number | null, direction: number) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return (a - b) * direction
}

export function sortCandidates<TMeta>(
  candidates: readonly AtsCandidate<TMeta>[],
  sort: AtsSort,
  stages: readonly AtsStage[] = [],
  getStage?: AtsGetStage<TMeta>,
) {
  const stageOrder = new Map(stages.map((stage, index) => [stage.id, index]))
  const direction = sort.direction === "asc" ? 1 : -1
  return candidates
    .map((candidate, index) => ({ candidate, index }))
    .sort((left, right) => {
      const result = compareCandidates(left.candidate, right.candidate, sort.key, direction, stageOrder, getStage)
      return result || left.index - right.index
    })
    .map((item) => item.candidate)
}

function compareCandidates<TMeta>(
  left: AtsCandidate<TMeta>,
  right: AtsCandidate<TMeta>,
  key: AtsSortKey,
  direction: number,
  stageOrder: Map<string, number>,
  getStage?: AtsGetStage<TMeta>,
) {
  if (key === "score") return compareNullableNumber(candidateScore(left), candidateScore(right), direction)
  if (key === "name") return left.name.localeCompare(right.name, "es-MX") * direction
  if (key === "stage") {
    const a = stageOrder.get(getStage?.(left) ?? "") ?? Number.MAX_SAFE_INTEGER
    const b = stageOrder.get(getStage?.(right) ?? "") ?? Number.MAX_SAFE_INTEGER
    return (a - b) * direction
  }
  if (key === "source") return left.source.localeCompare(right.source, "es-MX") * direction
  if (key === "applied") return compareNullableNumber(parsed(left.appliedAt), parsed(right.appliedAt), direction)
  return (left.nextStep?.label ?? "").localeCompare(right.nextStep?.label ?? "", "es-MX") * direction
}

function parsed(value: string) {
  const time = Date.parse(value)
  return Number.isNaN(time) ? null : time
}

export function adjacentId(ids: readonly string[], id: string, delta: number) {
  const index = ids.indexOf(id)
  if (index < 0) return null
  return ids[index + delta] ?? null
}

export function feedbackStageIds(stages: readonly AtsStage[]) {
  return stages.slice(1).map((stage) => stage.id)
}

export function formatAtsFileSize(size: number) {
  if (!Number.isFinite(size) || size < 0) return ""
  if (size < 1024) return `${Math.round(size)} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

const TONE_PILL: Record<AtsTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  accent: "bg-primary/15 text-primary",
  warning: "bg-accent text-accent-foreground",
  critical: "bg-destructive/10 text-destructive",
  info: "bg-secondary text-secondary-foreground",
  positive: "bg-primary text-primary-foreground",
}

export function atsTonePill(tone: AtsTone | undefined) {
  return tone ? TONE_PILL[tone] : TONE_PILL.neutral
}

/** Host `className` wins. Otherwise the semantic tone. */
export function atsStageClass(stage: Pick<AtsStage, "tone" | "className"> | undefined) {
  if (!stage) return TONE_PILL.neutral
  return stage.className || atsTonePill(stage.tone)
}

export function resolveDragStageId(overId: string, candidates: readonly { id: string; stageId: string }[]) {
  const overCandidate = candidates.find((candidate) => candidate.id === overId)
  if (overCandidate) return overCandidate.stageId
  if (overId.startsWith(ATS_STAGE_DRAG_PREFIX)) return overId.slice(ATS_STAGE_DRAG_PREFIX.length)
  return null
}
