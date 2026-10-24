/**
 * Ordering, grouping, tree drops, and formatters for the work table.
 * Domain-agnostic. Tones are StatusTone names from status-tone.ts.
 * Clean-room behavior. No paid-library source or assets.
 */

import type { StatusTone } from "@/registry/retana/lib/status-tone"
import { moveItem } from "@/registry/retana/lib/reorder"

export type { StatusTone }

export const WORK_PRIORITIES = ["p0", "p1", "p2", "p3"] as const
export type WorkPriority = (typeof WORK_PRIORITIES)[number]

export const WORK_DENSITIES = ["compact", "comfortable", "spacious"] as const
export type WorkDensity = (typeof WORK_DENSITIES)[number]

export const WORK_SORT_KEYS = ["manual", "date", "priority", "effort"] as const
export type WorkSortKey = (typeof WORK_SORT_KEYS)[number]
export type WorkSortDir = "asc" | "desc"
export type WorkShift = "up" | "down" | "start" | "end"

export type WorkColumnLayout = {
  order: string[]
  hidden: string[]
  density: WorkDensity
}

export type WorkLayoutPreset = {
  id: string
  name: string
  layout: WorkColumnLayout
}

export type WorkTableSnapshot = {
  layout: WorkColumnLayout
  presets: WorkLayoutPreset[]
  activePresetId: string | null
}

export type WorkMove<T> = {
  ids: string[]
  rows: T[]
  toIndex: number
  toStatusId?: string | null
  parentId?: string | null
  depth?: number
}

export type TreeNode = {
  id: string
  parentId: string | null
}

const PRIORITY_TONE: Record<WorkPriority, StatusTone> = {
  p0: "critical",
  p1: "warning",
  p2: "info",
  p3: "neutral",
}

const PRIORITY_RANK: Record<WorkPriority, number> = { p0: 0, p1: 1, p2: 2, p3: 3 }

export function priorityTone(priority: WorkPriority): StatusTone {
  return PRIORITY_TONE[priority]
}

export function priorityRank(priority: WorkPriority | null | undefined): number {
  if (!priority) return PRIORITY_RANK.p3 + 1
  return PRIORITY_RANK[priority]
}

export function reorderIds(ids: readonly string[], activeId: string, overId: string): string[] {
  const from = ids.indexOf(activeId)
  const to = ids.indexOf(overId)
  if (from < 0 || to < 0 || from === to) return [...ids]
  return moveItem(ids, from, to)
}

/** Drag a row, or the whole selection when the active row is selected. */
export function moveSelection(
  ids: readonly string[],
  activeId: string,
  overId: string,
  selected: readonly string[] = [],
): string[] {
  if (!ids.includes(activeId) || !ids.includes(overId) || activeId === overId) return [...ids]
  const selectedSet = new Set(selected)
  const block = selectedSet.has(activeId) ? ids.filter((id) => selectedSet.has(id)) : [activeId]
  const blockSet = new Set(block)
  if (blockSet.has(overId)) return [...ids]
  const from = ids.indexOf(activeId)
  const to = ids.indexOf(overId)
  const rest = ids.filter((id) => !blockSet.has(id))
  let insertAt = rest.indexOf(overId)
  if (insertAt < 0) return [...ids]
  if (from < to) insertAt += 1
  const next = rest.slice()
  next.splice(insertAt, 0, ...block)
  return next
}

export function shiftSelection(ids: readonly string[], selected: readonly string[], shift: WorkShift): string[] {
  const selectedSet = new Set(selected.filter((id) => ids.includes(id)))
  if (selectedSet.size === 0) return [...ids]
  const block = ids.filter((id) => selectedSet.has(id))
  const rest = ids.filter((id) => !selectedSet.has(id))
  if (shift === "start") return [...block, ...rest]
  if (shift === "end") return [...rest, ...block]
  const first = ids.findIndex((id) => selectedSet.has(id))
  const last = ids.reduce((found, id, index) => (selectedSet.has(id) ? index : found), -1)
  if (shift === "up") {
    if (first <= 0) return [...ids]
    const before = ids[first - 1]
    if (!before) return [...ids]
    const insertAt = rest.indexOf(before)
    if (insertAt < 0) return [...ids]
    const next = rest.slice()
    next.splice(insertAt, 0, ...block)
    return next
  }
  if (last < 0 || last >= ids.length - 1) return [...ids]
  const after = ids[last + 1]
  if (!after) return [...ids]
  const insertAt = rest.indexOf(after)
  if (insertAt < 0) return [...ids]
  const next = rest.slice()
  next.splice(insertAt + 1, 0, ...block)
  return next
}

/** Replace a visible window, keeping every id outside that window in place. */
export function replaceWindow(all: readonly string[], previousWindow: readonly string[], nextWindow: readonly string[]): string[] {
  const windowSet = new Set(previousWindow)
  const next: string[] = []
  let inserted = false
  for (const id of all) {
    if (!windowSet.has(id)) {
      next.push(id)
      continue
    }
    if (!inserted) {
      next.push(...nextWindow)
      inserted = true
    }
  }
  if (!inserted) next.push(...nextWindow)
  return next
}

/** Merge a transformed visible window back into the full collection. */
export function mergeRows<T extends { id: string }>(all: readonly T[], nextVisible: readonly T[]): T[] {
  const visible = new Map(nextVisible.map((row) => [row.id, row]))
  const previousIds = all.filter((row) => visible.has(row.id)).map((row) => row.id)
  const ordered = replaceWindow(
    all.map((row) => row.id),
    previousIds,
    nextVisible.map((row) => row.id),
  )
  const byId = new Map(all.map((row) => [row.id, row]))
  for (const row of nextVisible) byId.set(row.id, row)
  return ordered.map((id) => {
    const row = byId.get(id)
    if (!row) throw new Error(`Missing row ${id}`)
    return row
  })
}

export function applyIdOrder<T extends { id: string }>(rows: readonly T[], ids: readonly string[]): T[] {
  const byId = new Map(rows.map((row) => [row.id, row]))
  const next: T[] = []
  const seen = new Set<string>()
  for (const id of ids) {
    const row = byId.get(id)
    if (!row || seen.has(id)) continue
    seen.add(id)
    next.push(row)
  }
  for (const row of rows) {
    if (seen.has(row.id)) continue
    next.push(row)
  }
  return next
}

export function withSequentialRank<T extends { rank?: number | null }>(rows: readonly T[]): T[] {
  return rows.map((row, index) => ({ ...row, rank: index + 1 }))
}

export function defaultLayout(columnIds: readonly string[], density: WorkDensity = "comfortable"): WorkColumnLayout {
  return { order: [...columnIds], hidden: [], density }
}

export function reconcileLayout(layout: WorkColumnLayout, columnIds: readonly string[]): WorkColumnLayout {
  const known = new Set(columnIds)
  const order = layout.order.filter((id) => known.has(id))
  for (const id of columnIds) {
    if (!order.includes(id)) order.push(id)
  }
  const density = WORK_DENSITIES.includes(layout.density) ? layout.density : "comfortable"
  return {
    order,
    hidden: layout.hidden.filter((id) => known.has(id)),
    density,
  }
}

export function toggleHidden(layout: WorkColumnLayout, columnId: string, locked: readonly string[] = []): WorkColumnLayout {
  if (locked.includes(columnId) || !layout.order.includes(columnId)) return layout
  const hidden = new Set(layout.hidden)
  if (hidden.has(columnId)) hidden.delete(columnId)
  else hidden.add(columnId)
  const visible = layout.order.filter((id) => !hidden.has(id) || locked.includes(id))
  if (visible.length === 0) return layout
  return { ...layout, hidden: layout.order.filter((id) => hidden.has(id)) }
}

export function cloneLayout(layout: WorkColumnLayout): WorkColumnLayout {
  return { order: [...layout.order], hidden: [...layout.hidden], density: layout.density }
}

export function layoutsEqual(a: WorkColumnLayout, b: WorkColumnLayout): boolean {
  return a.density === b.density && sameList(a.order, b.order) && sameList(a.hidden, b.hidden)
}

function sameList(a: readonly string[], b: readonly string[]) {
  return a.length === b.length && a.every((id, index) => id === b[index])
}

export function slugPresetId(name: string, taken: readonly string[]): string {
  const base = name
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
  const root = base || "diseno"
  if (!taken.includes(root)) return root
  let index = 2
  while (taken.includes(`${root}-${index}`)) index += 1
  return `${root}-${index}`
}

export function savePreset(presets: readonly WorkLayoutPreset[], name: string, layout: WorkColumnLayout): WorkLayoutPreset[] {
  const id = slugPresetId(name, presets.map((preset) => preset.id))
  return [...presets, { id, name: name.trim() || id, layout: cloneLayout(layout) }]
}

export function presetById(presets: readonly WorkLayoutPreset[], id: string | null): WorkLayoutPreset | null {
  if (!id) return presets.at(-1) ?? null
  return presets.find((preset) => preset.id === id) ?? presets.at(-1) ?? null
}

function isDensity(value: unknown): value is WorkDensity {
  return value === "compact" || value === "comfortable" || value === "spacious"
}

function isPreset(value: unknown): value is WorkLayoutPreset {
  if (!value || typeof value !== "object") return false
  const preset = value as Partial<WorkLayoutPreset>
  return typeof preset.id === "string" && typeof preset.name === "string" && isLayout(preset.layout)
}

function isLayout(value: unknown): value is WorkColumnLayout {
  if (!value || typeof value !== "object") return false
  const layout = value as Partial<WorkColumnLayout>
  return Array.isArray(layout.order) && layout.order.every((id) => typeof id === "string") && Array.isArray(layout.hidden) && isDensity(layout.density)
}

export function parseSnapshot(raw: string | null, columnIds: readonly string[]): WorkTableSnapshot | null {
  if (!raw) return null
  try {
    const value = JSON.parse(raw) as Partial<WorkTableSnapshot>
    if (!isLayout(value.layout)) return null
    return {
      layout: reconcileLayout(
        {
          order: value.layout.order,
          hidden: value.layout.hidden.filter((id) => typeof id === "string"),
          density: value.layout.density,
        },
        columnIds,
      ),
      presets: Array.isArray(value.presets) ? value.presets.filter(isPreset).map((preset) => ({
        ...preset,
        layout: reconcileLayout(preset.layout, columnIds),
      })) : [],
      activePresetId: typeof value.activePresetId === "string" ? value.activePresetId : null,
    }
  } catch {
    return null
  }
}

export type KeyValueStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
}

export function storageKeyFor(persistenceKey: string) {
  return `retana-work-table:${persistenceKey}`
}

export function loadSnapshot(storage: KeyValueStorage, persistenceKey: string, columnIds: readonly string[]): WorkTableSnapshot | null {
  try {
    return parseSnapshot(storage.getItem(storageKeyFor(persistenceKey)), columnIds)
  } catch {
    return null
  }
}

export function saveSnapshot(storage: KeyValueStorage, persistenceKey: string, snapshot: WorkTableSnapshot) {
  try {
    storage.setItem(storageKeyFor(persistenceKey), JSON.stringify(snapshot))
  } catch {
    /* storage may be blocked */
  }
}

export type WorkGroup<T> = {
  id: string
  label: string
  tone?: StatusTone
  rows: T[]
  count: number
  effort: number
}

export function groupRows<T>(
  rows: readonly T[],
  statuses: readonly { id: string; label: string; tone?: StatusTone }[],
  getStatusId: (row: T) => string | null | undefined,
  getEffort: (row: T) => number = () => 0,
): WorkGroup<T>[] {
  const buckets = new Map<string, T[]>()
  for (const status of statuses) buckets.set(status.id, [])
  const rest: T[] = []
  for (const row of rows) {
    const id = getStatusId(row)
    const bucket = id ? buckets.get(id) : undefined
    if (bucket) bucket.push(row)
    else rest.push(row)
  }
  const groups = statuses.map((status) => {
    const grouped = buckets.get(status.id) ?? []
    return {
      id: status.id,
      label: status.label,
      tone: status.tone,
      rows: grouped,
      count: grouped.length,
      effort: grouped.reduce((sum, row) => sum + (getEffort(row) || 0), 0),
    }
  })
  if (rest.length) {
    groups.push({
      id: "__none",
      label: "",
      tone: undefined,
      rows: rest,
      count: rest.length,
      effort: rest.reduce((sum, row) => sum + (getEffort(row) || 0), 0),
    })
  }
  return groups
}

export function sliceGroup<T>(rows: readonly T[], limit: number, expanded: boolean): { visible: T[]; hidden: number } {
  if (expanded || !Number.isFinite(limit) || rows.length <= limit) {
    return { visible: [...rows], hidden: 0 }
  }
  const size = Math.max(0, limit)
  return { visible: rows.slice(0, size), hidden: rows.length - size }
}

export function moveToStatus<T extends { id: string }>(
  rows: readonly T[],
  movingIds: readonly string[],
  toStatusId: string,
  overId: string | null,
  getStatusId: (row: T) => string | null | undefined,
  setStatusId: (row: T, statusId: string) => T,
): T[] {
  const movingSet = new Set(movingIds.filter((id) => rows.some((row) => row.id === id)))
  if (movingSet.size === 0) return rows.map((row) => ({ ...row }))
  const moving = rows.filter((row) => movingSet.has(row.id)).map((row) => setStatusId({ ...row }, toStatusId))
  const rest = rows.filter((row) => !movingSet.has(row.id)).map((row) => ({ ...row }))
  if (overId && !movingSet.has(overId)) {
    const index = rest.findIndex((row) => row.id === overId)
    const from = rows.findIndex((row) => movingSet.has(row.id))
    const over = rows.findIndex((row) => row.id === overId)
    if (index >= 0) {
      const insertAt = from < over ? index + 1 : index
      const next = rest.slice()
      next.splice(insertAt, 0, ...moving)
      return next
    }
  }
  let last = -1
  rest.forEach((row, index) => {
    if (getStatusId(row) === toStatusId) last = index
  })
  const next = rest.slice()
  next.splice(last + 1, 0, ...moving)
  return next
}

type ParentOf<T> = (row: T) => string | null

function readParent<T extends { id: string }>(row: T, getParentId?: ParentOf<T>) {
  if (getParentId) return getParentId(row)
  const parent = (row as { parentId?: string | null }).parentId
  return parent ?? null
}

export function descendantIds<T extends { id: string }>(rows: readonly T[], id: string, getParentId?: ParentOf<T>): string[] {
  const result: string[] = []
  const walk = (parentId: string) => {
    for (const row of rows) {
      if (readParent(row, getParentId) !== parentId || result.includes(row.id)) continue
      result.push(row.id)
      walk(row.id)
    }
  }
  walk(id)
  return result
}

export function depthOf<T extends { id: string }>(rows: readonly T[], id: string, getParentId?: ParentOf<T>): number {
  const byId = new Map(rows.map((row) => [row.id, row]))
  let depth = 0
  let current = byId.get(id)
  const seen = new Set<string>()
  while (current && readParent(current, getParentId)) {
    if (seen.has(current.id)) break
    seen.add(current.id)
    depth += 1
    const parentId = readParent(current, getParentId)
    current = parentId ? byId.get(parentId) : undefined
    if (depth > 32) break
  }
  return depth
}

export function isDescendant<T extends { id: string }>(rows: readonly T[], ancestorId: string, id: string, getParentId?: ParentOf<T>): boolean {
  return descendantIds(rows, ancestorId, getParentId).includes(id)
}

export function visibleTreeIds<T extends { id: string }>(rows: readonly T[], collapsed: readonly string[], getParentId?: ParentOf<T>): string[] {
  const hidden = new Set<string>()
  for (const id of collapsed) {
    for (const desc of descendantIds(rows, id, getParentId)) hidden.add(desc)
  }
  return rows.filter((row) => !hidden.has(row.id)).map((row) => row.id)
}

export function parentAtDepth<T extends { id: string }>(rows: readonly T[], index: number, depth: number, getParentId?: ParentOf<T>): string | null {
  if (depth <= 0 || index <= 0) return null
  for (let cursor = index - 1; cursor >= 0; cursor -= 1) {
    const row = rows[cursor]
    if (!row) continue
    const rowDepth = depthOf(rows, row.id, getParentId)
    if (rowDepth === depth - 1) return row.id
    if (rowDepth < depth - 1) return null
  }
  return null
}

export function clampTreeDepth<T extends { id: string }>(rows: readonly T[], index: number, depth: number, getParentId?: ParentOf<T>): number {
  if (index <= 0) return 0
  const previous = rows[index - 1]
  if (!previous) return 0
  return Math.max(0, Math.min(depth, depthOf(rows, previous.id, getParentId) + 1))
}

export function moveInTree<T extends { id: string }>(
  rows: readonly T[],
  activeId: string,
  overId: string,
  depth: number,
  setParentId: (row: T, parentId: string | null) => T,
  getParentId?: ParentOf<T>,
): T[] {
  if (activeId === overId) return rows.map((row) => ({ ...row }))
  if (isDescendant(rows, activeId, overId, getParentId)) return rows.map((row) => ({ ...row }))
  const subtree = new Set([activeId, ...descendantIds(rows, activeId, getParentId)])
  const moving = rows.filter((row) => subtree.has(row.id)).map((row) => ({ ...row }))
  const rest = rows.filter((row) => !subtree.has(row.id)).map((row) => ({ ...row }))
  const overIndex = rest.findIndex((row) => row.id === overId)
  if (overIndex < 0) return rows.map((row) => ({ ...row }))
  const overDepth = depthOf(rest, overId, getParentId)
  const wanted = Math.max(0, Math.min(depth, overDepth + 1))
  if (wanted > overDepth) {
    const next = rest.slice()
    next.splice(overIndex + 1, 0, ...moving)
    return next.map((row) => (row.id === activeId ? setParentId(row, overId) : row))
  }
  let insertAt = overIndex
  const activeIndex = rows.findIndex((row) => row.id === activeId)
  const originalOver = rows.findIndex((row) => row.id === overId)
  if (activeIndex < originalOver) insertAt += 1
  const next = rest.slice()
  next.splice(insertAt, 0, ...moving)
  const safeDepth = clampTreeDepth(next, insertAt, wanted, getParentId)
  const parentId = parentAtDepth(next, insertAt, safeDepth, getParentId)
  return next.map((row) => (row.id === activeId ? setParentId(row, parentId) : row))
}

export function changeDepth<T extends { id: string }>(
  rows: readonly T[],
  id: string,
  delta: number,
  setParentId: (row: T, parentId: string | null) => T,
  getParentId?: ParentOf<T>,
): T[] {
  const index = rows.findIndex((row) => row.id === id)
  if (index < 0) return rows.map((row) => ({ ...row }))
  const nextDepth = clampTreeDepth(rows, index, depthOf(rows, id, getParentId) + delta, getParentId)
  const parentId = parentAtDepth(rows, index, nextDepth, getParentId)
  return rows.map((row) => (row.id === id ? setParentId(row, parentId) : row))
}

export function treeSummary<T extends { id: string; effort?: number | null }>(rows: readonly T[], getParentId?: ParentOf<T>) {
  const sections = rows.filter((row) => !readParent(row, getParentId)).length
  const articles = rows.length - sections
  const points = rows.reduce((sum, row) => sum + (row.effort ?? 0), 0)
  return { sections, articles, points }
}

export type WorkFilterAccess<T> = {
  query?: string
  text?: (row: T) => string
  priorities?: readonly WorkPriority[]
  priority?: (row: T) => WorkPriority | null | undefined
  assignees?: readonly string[]
  assignee?: (row: T) => string | null | undefined
  cycle?: string | null
  getCycle?: (row: T) => string | null | undefined
}

export function filterWorkRows<T>(rows: readonly T[], access: WorkFilterAccess<T>): T[] {
  const query = access.query?.trim().toLowerCase() ?? ""
  return rows.filter((row) => {
    if (query && access.text && !access.text(row).toLowerCase().includes(query)) return false
    if (access.priorities && access.priorities.length > 0 && access.priority) {
      const priority = access.priority(row)
      if (!priority || !access.priorities.includes(priority)) return false
    }
    if (access.assignees && access.assignees.length > 0 && access.assignee) {
      const assignee = access.assignee(row)
      if (!assignee || !access.assignees.includes(assignee)) return false
    }
    if (access.cycle && access.getCycle && access.getCycle(row) !== access.cycle) return false
    return true
  })
}

export type WorkSortAccess<T> = {
  due?: (row: T) => string | null | undefined
  priority?: (row: T) => WorkPriority | null | undefined
  effort?: (row: T) => number | null | undefined
}

export function sortWorkRows<T>(rows: readonly T[], key: WorkSortKey, dir: WorkSortDir, access: WorkSortAccess<T> = {}): T[] {
  if (key === "manual") return [...rows]
  const factor = dir === "asc" ? 1 : -1
  return rows
    .map((row, index) => ({ row, index }))
    .sort((a, b) => {
      const delta = compareRows(a.row, b.row, key, access, factor)
      if (delta === 0) return a.index - b.index
      return delta
    })
    .map((item) => item.row)
}

function compareRows<T>(a: T, b: T, key: WorkSortKey, access: WorkSortAccess<T>, factor: number) {
  if (key === "date") return compareNullable(timeValue(access.due?.(a)), timeValue(access.due?.(b)), factor)
  if (key === "priority") return (priorityRank(access.priority?.(a)) - priorityRank(access.priority?.(b))) * factor
  if (key === "effort") return compareNullable(access.effort?.(a) ?? null, access.effort?.(b) ?? null, factor)
  return 0
}

function timeValue(value: string | null | undefined) {
  if (!value) return null
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? null : time
}

/** Nulls stay last in both directions. */
function compareNullable(a: number | null, b: number | null, factor: number) {
  if (a == null && b == null) return 0
  if (a == null) return 1
  if (b == null) return -1
  return (a - b) * factor
}

export function paginate<T>(rows: readonly T[], pageIndex: number, pageSize: number) {
  const size = Math.max(1, pageSize)
  const pageCount = Math.max(1, Math.ceil(rows.length / size))
  const index = Math.min(Math.max(0, pageIndex), pageCount - 1)
  const start = index * size
  return { rows: rows.slice(start, start + size), pageIndex: index, pageCount, pageSize: size }
}

export function formatCompactNumber(value: number): string {
  const sign = value < 0 ? "-" : ""
  const abs = Math.abs(value)
  if (abs >= 1_000_000) return `${sign}${trimNumber(abs / 1_000_000)}m`
  if (abs >= 1000) return `${sign}${trimNumber(abs / 1000)}k`
  return `${sign}${trimNumber(abs)}`
}

export function formatPercent(value: number): string {
  return `${trimNumber(value)}%`
}

export function formatMinutes(value: number): string {
  return `${Math.round(value)} min`
}

function trimNumber(value: number) {
  const rounded = Math.round(value * 10) / 10
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1)
}

export function formatRelativeDue(
  iso: string | null | undefined,
  now: Date,
  labels: { overdue?: string; empty?: string } = {},
): { label: string; overdue: boolean } {
  if (!iso) return { label: labels.empty ?? "—", overdue: false }
  const due = new Date(iso)
  if (Number.isNaN(due.getTime())) return { label: labels.empty ?? "—", overdue: false }
  const days = Math.round((utcDay(due) - utcDay(now)) / 86_400_000)
  if (days < 0) return { label: labels.overdue ?? "Vencida", overdue: true }
  if (days === 0) return { label: "Hoy", overdue: false }
  if (days === 1) return { label: "Mañana", overdue: false }
  return { label: `En ${days} días`, overdue: false }
}

export function formatSla(
  iso: string | null | undefined,
  now: Date,
  labels: { overdue?: string; empty?: string } = {},
): { label: string; overdue: boolean } {
  if (!iso) return { label: labels.empty ?? "—", overdue: false }
  const due = new Date(iso)
  if (Number.isNaN(due.getTime())) return { label: labels.empty ?? "—", overdue: false }
  const delta = due.getTime() - now.getTime()
  if (delta < 0) return { label: labels.overdue ?? "Vencido", overdue: true }
  const hours = Math.round(delta / 3_600_000)
  if (hours < 1) {
    const minutes = Math.max(1, Math.round(delta / 60_000))
    return { label: `${minutes} min restantes`, overdue: false }
  }
  return { label: `${hours}h restantes`, overdue: false }
}

function utcDay(date: Date) {
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
}

export function effortFilled(points: number, segments = 5, max = 8): number {
  if (points <= 0 || segments <= 0) return 0
  const ratio = Math.min(points, max) / max
  return Math.max(1, Math.round(ratio * segments))
}

export function columnSortableId(id: string) {
  return `column:${id}`
}

export function rowSortableId(id: string) {
  return `row:${id}`
}

export function groupSortableId(id: string) {
  return `group:${id}`
}

export function bareSortableId(id: string) {
  const index = id.indexOf(":")
  return index < 0 ? id : id.slice(index + 1)
}

export type WorkAnnouncementLabels = {
  pickedUp: string
  of: string
  over: string
  notOver: string
  dropped: string
  cancelled: string
  instructions: string
}

export function workTableAnnouncements(
  labels: WorkAnnouncementLabels,
  place: (id: string | number) => number,
  count: number,
) {
  return {
    onDragStart({ active }: { active: { id: string | number } }) {
      return `${labels.pickedUp} ${place(active.id)} ${labels.of} ${count}.`
    },
    onDragOver({ over }: { over: { id: string | number } | null }) {
      return over ? `${labels.over} ${place(over.id)}.` : labels.notOver
    },
    onDragEnd({ over }: { over: { id: string | number } | null }) {
      return over ? `${labels.dropped} ${place(over.id)}.` : labels.dropped
    },
    onDragCancel() {
      return labels.cancelled
    },
  }
}
