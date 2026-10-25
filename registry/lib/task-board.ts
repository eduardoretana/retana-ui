/**
 * Clean-room task board model.
 * The behavior was observed. No mockup source, copy, colors, or assets were copied.
 * Chrome defaults to Spanish. Pass `labels` for another language.
 */

export const TASK_PRIORITIES = ["low", "medium", "high", "critical"] as const

export type TaskPriority = (typeof TASK_PRIORITIES)[number]

export const TASK_TONES = ["neutral", "accent", "warning", "critical", "info", "positive"] as const

export type TaskTone = (typeof TASK_TONES)[number]

export type TaskPerson = {
  id: string
  name: string
  src?: string
}

export type TaskOption = {
  id: string
  label: string
  tone?: TaskTone
}

export type TaskSubtask = {
  id: string
  title: string
  description?: string
  statusId: string
  priority?: TaskPriority
}

export type TaskComment = {
  id: string
  authorId: string
  body: string
  createdAt: string
  parentId?: string | null
}

export type TaskAttachment = {
  id: string
  name: string
  size?: number
  href?: string
}

/** `TMeta` is the host's extra payload. The board never reads it. */
export type TaskRecord<TMeta = Record<string, unknown>> = {
  id: string
  title: string
  description?: string
  stageId: string
  priority: TaskPriority
  categoryId?: string | null
  assigneeIds: readonly string[]
  dueAt?: string | null
  reminderAt?: string | null
  subtasks?: readonly TaskSubtask[]
  comments?: readonly TaskComment[]
  attachments?: readonly TaskAttachment[]
  meta?: TMeta
}

export type TaskPatch<TMeta = Record<string, unknown>> = Partial<
  Pick<
    TaskRecord<TMeta>,
    "title" | "description" | "stageId" | "priority" | "categoryId" | "assigneeIds" | "dueAt" | "reminderAt" | "meta"
  >
>

export type TaskSubtaskDraft = {
  title: string
  description?: string
  statusId?: string
  priority?: TaskPriority
}

export type TaskCommentInput = {
  body: string
  parentId?: string | null
  files?: readonly File[]
}

export type TaskBoardView = "board" | "list"

export type TaskBoardLabels = {
  boardLabel: string
  searchLabel: string
  searchPlaceholder: string
  viewLabel: string
  boardView: string
  listView: string
  prioritySummary: string
  emptyTitle: string
  emptyHint: string
  noMatchesTitle: string
  noMatchesHint: string
  loadingLabel: string
  errorTitle: string
  retry: string
  overdue: string
  subtasks: (count: number) => string
  comments: (count: number) => string
  assignees: (names: readonly string[]) => string
  openTask: (title: string) => string
  dragTask: (title: string) => string
  actionsFor: (title: string) => string
  moveTo: string
  open: string
  addTask: string
  detailTitle: string
  close: string
  previous: string
  next: string
  position: (current: number, total: number) => string
  due: string
  category: string
  priority: string
  stage: string
  reminder: string
  description: string
  readMore: string
  readLess: string
  editDescription: string
  save: string
  cancel: string
  clearValue: string
  noDescription: string
  noCategory: string
  assigneesLabel: string
  subtasksTitle: (count: number) => string
  addSubtask: string
  subtaskPlaceholder: string
  subtaskStatus: (title: string) => string
  subtaskPending: string
  subtaskDoing: string
  subtaskDone: string
  commentsTitle: string
  reply: string
  cancelReply: string
  replyingTo: (name: string) => string
  commentPlaceholder: string
  send: string
  attach: string
  removePendingFile: (name: string) => string
  attachments: string
  removeAttachment: (name: string) => string
  noComments: string
  noSubtasks: string
  pickedUp: (title: string) => string
  overColumn: (label: string) => string
  moved: (title: string, stage: string) => string
  dropped: string
  cancelled: string
  readOnlyNote: string
  filterPriority: (label: string, count: number) => string
  announcements: string
  priorityLow: string
  priorityMedium: string
  priorityHigh: string
  priorityCritical: string
  unassigned: string
  unknownAuthor: string
  noTasksInColumn: string
  shortcuts: string
  dueOn: (date: string) => string
}

/** 1-based position. The index is at least two digits: `01 de 100`. */
export function formatTaskPosition(current: number, total: number, ofWord = "de") {
  const safeTotal = Math.max(0, total)
  const safeCurrent = Math.min(Math.max(0, current), safeTotal)
  return `${String(safeCurrent).padStart(2, "0")} ${ofWord} ${safeTotal}`
}

export const taskBoardLabels: TaskBoardLabels = {
  boardLabel: "Tablero de encargos",
  searchLabel: "Buscar",
  searchPlaceholder: "Buscar encargos",
  viewLabel: "Vista",
  boardView: "Tablero",
  listView: "Lista",
  prioritySummary: "Encargos por prioridad",
  emptyTitle: "No hay encargos",
  emptyHint: "Cuando lleguen, aparecen en sus columnas.",
  noMatchesTitle: "Ningún encargo coincide",
  noMatchesHint: "Prueba con otra búsqueda o prioridad.",
  loadingLabel: "Cargando encargos",
  errorTitle: "No se pudo cargar el tablero",
  retry: "Reintentar",
  overdue: "Vencido",
  subtasks: (count) => `${count} ${count === 1 ? "subtarea" : "subtareas"}`,
  comments: (count) => `${count} ${count === 1 ? "comentario" : "comentarios"}`,
  assignees: (names) => (names.length ? `Responsables: ${names.join(", ")}` : "Sin responsables"),
  openTask: (title) => `Abrir ${title}`,
  dragTask: (title) => `Arrastrar ${title}`,
  actionsFor: (title) => `Acciones de ${title}`,
  moveTo: "Mover a",
  open: "Abrir",
  addTask: "Agregar encargo",
  detailTitle: "Detalle del encargo",
  close: "Cerrar",
  previous: "Anterior",
  next: "Siguiente",
  position: (current, total) => formatTaskPosition(current, total, "de"),
  due: "Fecha",
  category: "Categoría",
  priority: "Prioridad",
  stage: "Etapa",
  reminder: "Recordatorio",
  description: "Descripción",
  readMore: "Leer más",
  readLess: "Leer menos",
  editDescription: "Editar descripción",
  save: "Guardar",
  cancel: "Cancelar",
  clearValue: "Quitar",
  noDescription: "Sin descripción",
  noCategory: "Sin categoría",
  assigneesLabel: "Responsables",
  subtasksTitle: (count) => `Subtareas (${count})`,
  addSubtask: "Agregar subtarea",
  subtaskPlaceholder: "Nueva subtarea",
  subtaskStatus: (title) => `Estado de ${title}`,
  subtaskPending: "Pendiente",
  subtaskDoing: "En curso",
  subtaskDone: "Lista",
  commentsTitle: "Comentarios",
  reply: "Responder",
  cancelReply: "Cancelar respuesta",
  replyingTo: (name) => `Respuesta a ${name}`,
  commentPlaceholder: "Escribe un comentario",
  send: "Enviar",
  attach: "Adjuntar archivo",
  removePendingFile: (name) => `Quitar ${name}`,
  attachments: "Adjuntos",
  removeAttachment: (name) => `Quitar ${name}`,
  noComments: "Todavía no hay comentarios.",
  noSubtasks: "Todavía no hay subtareas.",
  pickedUp: (title) => `Tomaste ${title}.`,
  overColumn: (label) => `Sobre ${label}.`,
  moved: (title, stage) => `${title} se movió a ${stage}.`,
  dropped: "Soltaste el encargo.",
  cancelled: "Cancelado.",
  readOnlyNote: "Solo lectura",
  filterPriority: (label, count) => `Filtrar prioridad ${label}, ${count}`,
  announcements: "Avisos del tablero",
  priorityLow: "Baja",
  priorityMedium: "Media",
  priorityHigh: "Alta",
  priorityCritical: "Crítica",
  unassigned: "Sin responsables",
  unknownAuthor: "Alguien",
  noTasksInColumn: "Ningún encargo",
  shortcuts: "Con el foco fuera de un campo, flecha izquierda y flecha derecha cambian de encargo.",
  dueOn: (date) => `Límite ${date}`,
}

export const taskBoardLabelsEn: TaskBoardLabels = {
  boardLabel: "Task board",
  searchLabel: "Search",
  searchPlaceholder: "Search tasks",
  viewLabel: "View",
  boardView: "Board",
  listView: "List",
  prioritySummary: "Tasks by priority",
  emptyTitle: "No tasks",
  emptyHint: "Tasks show up in their columns.",
  noMatchesTitle: "No matching tasks",
  noMatchesHint: "Try another search or priority.",
  loadingLabel: "Loading tasks",
  errorTitle: "The board could not be loaded",
  retry: "Try again",
  overdue: "Overdue",
  subtasks: (count) => `${count} ${count === 1 ? "subtask" : "subtasks"}`,
  comments: (count) => `${count} ${count === 1 ? "comment" : "comments"}`,
  assignees: (names) => (names.length ? `Assignees: ${names.join(", ")}` : "No assignees"),
  openTask: (title) => `Open ${title}`,
  dragTask: (title) => `Drag ${title}`,
  actionsFor: (title) => `Actions for ${title}`,
  moveTo: "Move to",
  open: "Open",
  addTask: "Add task",
  detailTitle: "Task detail",
  close: "Close",
  previous: "Previous",
  next: "Next",
  position: (current, total) => formatTaskPosition(current, total, "of"),
  due: "Date",
  category: "Category",
  priority: "Priority",
  stage: "Stage",
  reminder: "Reminder",
  description: "Description",
  readMore: "Read more",
  readLess: "Read less",
  editDescription: "Edit description",
  save: "Save",
  cancel: "Cancel",
  clearValue: "Clear",
  noDescription: "No description",
  noCategory: "No category",
  assigneesLabel: "Assignees",
  subtasksTitle: (count) => `Subtasks (${count})`,
  addSubtask: "Add subtask",
  subtaskPlaceholder: "New subtask",
  subtaskStatus: (title) => `Status of ${title}`,
  subtaskPending: "To do",
  subtaskDoing: "Doing",
  subtaskDone: "Done",
  commentsTitle: "Comments",
  reply: "Reply",
  cancelReply: "Cancel reply",
  replyingTo: (name) => `Reply to ${name}`,
  commentPlaceholder: "Write a comment",
  send: "Send",
  attach: "Attach a file",
  removePendingFile: (name) => `Remove ${name}`,
  attachments: "Attachments",
  removeAttachment: (name) => `Remove ${name}`,
  noComments: "No comments yet.",
  noSubtasks: "No subtasks yet.",
  pickedUp: (title) => `Picked up ${title}.`,
  overColumn: (label) => `Over ${label}.`,
  moved: (title, stage) => `${title} moved to ${stage}.`,
  dropped: "Dropped.",
  cancelled: "Cancelled.",
  readOnlyNote: "Read only",
  filterPriority: (label, count) => `Filter priority ${label}, ${count}`,
  announcements: "Board announcements",
  priorityLow: "Low",
  priorityMedium: "Medium",
  priorityHigh: "High",
  priorityCritical: "Critical",
  unassigned: "No assignees",
  unknownAuthor: "Someone",
  noTasksInColumn: "No tasks",
  shortcuts: "With focus outside a field, Left Arrow and Right Arrow change the task.",
  dueOn: (date) => `Due ${date}`,
}

export function resolveTaskBoardLabels(partial?: Partial<TaskBoardLabels>): TaskBoardLabels {
  return { ...taskBoardLabels, ...partial }
}

export function defaultPriorities(labels: TaskBoardLabels): { id: TaskPriority; label: string }[] {
  return [
    { id: "low", label: labels.priorityLow },
    { id: "medium", label: labels.priorityMedium },
    { id: "high", label: labels.priorityHigh },
    { id: "critical", label: labels.priorityCritical },
  ]
}

export function defaultSubtaskStatuses(labels: TaskBoardLabels): TaskOption[] {
  return [
    { id: "pending", label: labels.subtaskPending },
    { id: "doing", label: labels.subtaskDoing },
    { id: "done", label: labels.subtaskDone },
  ]
}

export function isTaskPriority(value: string): value is TaskPriority {
  return (TASK_PRIORITIES as readonly string[]).includes(value)
}

function timeOf(value: Date | string) {
  return value instanceof Date ? value.getTime() : new Date(value).getTime()
}

/** A past due date is overdue unless the stage is in `doneStageIds`. */
export function isTaskOverdue(
  task: { dueAt?: string | null; stageId: string },
  now: Date | string,
  doneStageIds: readonly string[] = [],
) {
  if (!task.dueAt || doneStageIds.includes(task.stageId)) return false
  const due = new Date(task.dueAt).getTime()
  const current = timeOf(now)
  if (Number.isNaN(due) || Number.isNaN(current)) return false
  return due < current
}

export function countTasksByPriority(tasks: readonly { priority: TaskPriority }[]) {
  const counts: Record<TaskPriority, number> = { low: 0, medium: 0, high: 0, critical: 0 }
  for (const task of tasks) {
    if (task.priority in counts) counts[task.priority] += 1
  }
  return counts
}

export function taskMatchesQuery<TMeta = Record<string, unknown>>(
  task: TaskRecord<TMeta>,
  query: string,
  context: {
    people?: readonly TaskPerson[]
    categories?: readonly TaskOption[]
    stages?: readonly TaskOption[]
  } = {},
) {
  const needle = query.trim().toLocaleLowerCase()
  if (!needle) return true
  const names = (context.people ?? [])
    .filter((person) => task.assigneeIds.includes(person.id))
    .map((person) => person.name)
  const category = context.categories?.find((item) => item.id === task.categoryId)?.label ?? ""
  const stage = context.stages?.find((item) => item.id === task.stageId)?.label ?? ""
  const subtasks = (task.subtasks ?? []).map((item) => `${item.title} ${item.description ?? ""}`)
  const comments = (task.comments ?? []).map((item) => item.body)
  const haystack = [task.title, task.description ?? "", category, stage, ...names, ...subtasks, ...comments]
    .join("\n")
    .toLocaleLowerCase()
  return haystack.includes(needle)
}

export type TaskStageGroup<TMeta = Record<string, unknown>> = {
  stage: TaskOption
  tasks: TaskRecord<TMeta>[]
}

/** Stages stay in the given order. Unknown stage ids are appended, one column each. */
export function groupTasksByStage<TMeta = Record<string, unknown>>(
  tasks: readonly TaskRecord<TMeta>[],
  stages: readonly TaskOption[],
): TaskStageGroup<TMeta>[] {
  const known = new Set(stages.map((stage) => stage.id))
  const groups: TaskStageGroup<TMeta>[] = stages.map((stage) => ({
    stage,
    tasks: tasks.filter((task) => task.stageId === stage.id),
  }))
  const orphanIds: string[] = []
  for (const task of tasks) {
    if (!known.has(task.stageId) && !orphanIds.includes(task.stageId)) orphanIds.push(task.stageId)
  }
  for (const id of orphanIds) {
    groups.push({
      stage: { id, label: id },
      tasks: tasks.filter((task) => task.stageId === id),
    })
  }
  return groups
}

export function orderTasks<TMeta = Record<string, unknown>>(
  tasks: readonly TaskRecord<TMeta>[],
  stages: readonly TaskOption[],
) {
  return groupTasksByStage(tasks, stages).flatMap((group) => group.tasks)
}

export function adjacentTaskId(ids: readonly string[], id: string, delta: number) {
  const index = ids.indexOf(id)
  if (index < 0) return null
  return ids[index + delta] ?? null
}

export function formatTaskDate(
  value: string | null | undefined,
  locale = "es",
  style: "short" | "long" = "long",
) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  if (style === "short") {
    return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric" }).format(date)
  }
  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date)
}

export function toDateTimeLocal(value: string | null | undefined) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const pad = (part: number) => String(part).padStart(2, "0")
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function fromDateTimeLocal(value: string) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export type TaskCommentThread = {
  comment: TaskComment
  replies: TaskComment[]
}

/** Replies hang off the root comment. A missing parent becomes its own root. */
export function threadComments(comments: readonly TaskComment[] | undefined): TaskCommentThread[] {
  const list = comments ?? []
  const byId = new Map(list.map((comment) => [comment.id, comment]))
  const rootOf = (comment: TaskComment) => {
    let current = comment
    const seen = new Set<string>()
    while (current.parentId && byId.has(current.parentId) && !seen.has(current.id)) {
      seen.add(current.id)
      const parent = byId.get(current.parentId)
      if (!parent) break
      current = parent
    }
    return current.id
  }
  const replies = new Map<string, TaskComment[]>()
  const roots: TaskComment[] = []
  for (const comment of list) {
    const root = rootOf(comment)
    if (root === comment.id) {
      roots.push(comment)
      continue
    }
    const bucket = replies.get(root) ?? []
    bucket.push(comment)
    replies.set(root, bucket)
  }
  return roots.map((comment) => ({ comment, replies: replies.get(comment.id) ?? [] }))
}

export function formatFileSize(size: number) {
  if (!Number.isFinite(size) || size < 0) return ""
  if (size < 1024) return `${Math.round(size)} B`
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`
  return `${(size / (1024 * 1024)).toFixed(1)} MB`
}

export function personName(people: readonly TaskPerson[], id: string, fallback: string) {
  return people.find((person) => person.id === id)?.name ?? fallback
}

const TONE_DOT: Record<TaskTone, string> = {
  neutral: "bg-muted-foreground",
  accent: "bg-primary",
  warning: "bg-chart-4",
  critical: "bg-destructive",
  info: "bg-chart-2",
  positive: "bg-primary",
}

export function taskToneDot(tone: TaskTone | undefined) {
  return tone ? TONE_DOT[tone] : undefined
}
