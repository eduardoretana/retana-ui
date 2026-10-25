"use client"

/**
 * Clean-room task board for any CRM.
 * Columns, priority counts, search, board or list, and a detail sheet.
 * Pass records in. Saves go through callbacks and stay on the host.
 * `view-kanban` remains the schema board inside multi-view.
 */

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS as DndCSS } from "@dnd-kit/utilities"
import { LayoutGrid, List, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetTitle,
} from "@/components/ui/sheet"
import { SearchField } from "@/registry/retana/ui/search-field"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"
import { TaskCard } from "@/registry/retana/ui/task-card"
import { TaskDetail } from "@/registry/retana/ui/task-detail"
import {
  adjacentTaskId,
  countTasksByPriority,
  defaultPriorities,
  defaultSubtaskStatuses,
  groupTasksByStage,
  isTaskOverdue,
  orderTasks,
  resolveTaskBoardLabels,
  taskMatchesQuery,
  taskToneDot,
  type TaskBoardLabels,
  type TaskBoardView,
  type TaskCommentInput,
  type TaskOption,
  type TaskPatch,
  type TaskPerson,
  type TaskPriority,
  type TaskRecord,
  type TaskStageGroup,
  type TaskSubtaskDraft,
} from "@/registry/retana/lib/task-board"

const STAGE_PREFIX = "stage:"

export type TaskBoardProps<TMeta = Record<string, unknown>> = {
  tasks: readonly TaskRecord<TMeta>[]
  stages: readonly TaskOption[]
  categories?: readonly TaskOption[]
  people?: readonly TaskPerson[]
  priorities?: readonly { id: TaskPriority; label: string }[]
  subtaskStatuses?: readonly TaskOption[]
  /** Stages where a past date is not overdue. */
  doneStageIds?: readonly string[]
  view?: TaskBoardView
  defaultView?: TaskBoardView
  onViewChange?: (view: TaskBoardView) => void
  query?: string
  defaultQuery?: string
  onQueryChange?: (query: string) => void
  /** Priority id, or null when the summary is not filtering. */
  priority?: TaskPriority | null
  defaultPriority?: TaskPriority | null
  onPriorityChange?: (priority: TaskPriority | null) => void
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelectedIdChange?: (id: string | null) => void
  /** Preferred path when a task changes column. */
  onMove?: (id: string, toStageId: string, fromStageId: string) => void | Promise<void>
  onUpdate?: (id: string, patch: TaskPatch<TMeta>) => void | Promise<void>
  onAddSubtask?: (id: string, draft: TaskSubtaskDraft) => void | Promise<void>
  onSubtaskStatusChange?: (taskId: string, subtaskId: string, statusId: string) => void | Promise<void>
  onComment?: (id: string, input: TaskCommentInput) => void | Promise<void>
  onAttach?: (id: string, files: readonly File[]) => void | Promise<void>
  onRemoveAttachment?: (taskId: string, attachmentId: string) => void | Promise<void>
  onCreateRequest?: (stageId: string) => void
  onRetry?: () => void
  readOnly?: boolean
  loading?: boolean
  error?: string | null
  /** ISO string or Date. Defaults to the current time, so overdue follows the clock. */
  now?: Date | string
  locale?: string
  labels?: Partial<TaskBoardLabels>
  className?: string
  toolbarClassName?: string
  columnClassName?: string
  cardClassName?: string
  sheetClassName?: string
}

export function TaskBoard<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  tasks,
  stages,
  categories = [],
  people = [],
  priorities,
  subtaskStatuses,
  doneStageIds = [],
  view: viewProp,
  defaultView = "board",
  onViewChange,
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  priority: priorityProp,
  defaultPriority = null,
  onPriorityChange,
  selectedId: selectedIdProp,
  defaultSelectedId = null,
  onSelectedIdChange,
  onMove,
  onUpdate,
  onAddSubtask,
  onSubtaskStatusChange,
  onComment,
  onAttach,
  onRemoveAttachment,
  onCreateRequest,
  onRetry,
  readOnly = false,
  loading = false,
  error = null,
  now,
  locale = "es",
  labels: labelOverrides,
  className,
  toolbarClassName,
  columnClassName,
  cardClassName,
  sheetClassName,
}: TaskBoardProps<TMeta>) {
  const labels = resolveTaskBoardLabels(labelOverrides)
  const priorityOptions = priorities ?? defaultPriorities(labels)
  const statusOptions = subtaskStatuses ?? defaultSubtaskStatuses(labels)
  const clock = now ?? new Date()
  const [view, setView] = useControllable(viewProp, defaultView, onViewChange)
  const [query, setQuery] = useControllable(queryProp, defaultQuery, onQueryChange)
  const [priority, setPriority] = useControllable(priorityProp, defaultPriority, onPriorityChange)
  const [selectedId, setSelectedId] = useControllable(selectedIdProp, defaultSelectedId, onSelectedIdChange)
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const [focusNonce, setFocusNonce] = React.useState(0)
  const focusId = React.useRef<string | null>(null)
  const reduced = usePrefersReducedMotion()
  const narrow = useNarrowScreen()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const searched = React.useMemo(
    () => tasks.filter((task) => taskMatchesQuery(task, query, { people, categories, stages })),
    [categories, people, query, stages, tasks],
  )
  const counts = React.useMemo(() => countTasksByPriority(searched), [searched])
  const visible = priority ? searched.filter((task) => task.priority === priority) : searched
  const groups = React.useMemo(() => groupTasksByStage(visible, stages), [stages, visible])
  const ordered = React.useMemo(() => orderTasks(tasks, stages), [stages, tasks])
  const orderedIds = React.useMemo(() => ordered.map((task) => task.id), [ordered])
  const selected = tasks.find((task) => task.id === selectedId) ?? null
  const selectedIndex = selected ? orderedIds.indexOf(selected.id) : -1
  const active = tasks.find((task) => task.id === activeId) ?? null

  const state = loading
    ? "loading"
    : error
      ? "error"
      : tasks.length === 0
        ? "empty"
        : visible.length === 0
          ? "nomatch"
          : "ready"

  React.useEffect(() => {
    const id = focusId.current
    if (!id) return
    focusId.current = null
    const escaped = typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : id
    document.querySelector<HTMLElement>(`[data-task-focus="${escaped}"]`)?.focus()
  }, [focusNonce])

  function stageLabel(id: string) {
    return stages.find((stage) => stage.id === id)?.label ?? id
  }

  function labelForDrag(id: string) {
    if (id.startsWith(STAGE_PREFIX)) return stageLabel(id.slice(STAGE_PREFIX.length))
    return tasks.find((task) => task.id === id)?.title ?? id
  }

  function moveTask(id: string, toStageId: string, source: "pointer" | "keyboard") {
    if (readOnly) return
    const task = tasks.find((item) => item.id === id)
    if (!task || task.stageId === toStageId) return
    if (source === "keyboard") {
      focusId.current = id
      setFocusNonce((nonce) => nonce + 1)
      setAnnouncement(labels.moved(task.title, stageLabel(toStageId)))
    }
    if (onMove) void onMove(id, toStageId, task.stageId)
    else void onUpdate?.(id, { stageId: toStageId })
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const overId = event.over ? String(event.over.id) : ""
    const toStageId = resolveStageId(overId, tasks)
    if (!toStageId) return
    moveTask(String(event.active.id), toStageId, "pointer")
  }

  function select(id: string | null) {
    setSelectedId(id)
  }

  const previousId = selected ? adjacentTaskId(orderedIds, selected.id, -1) : null
  const nextId = selected ? adjacentTaskId(orderedIds, selected.id, 1) : null

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        announcements: {
          onDragStart({ active: item }) {
            return labels.pickedUp(labelForDrag(String(item.id)))
          },
          onDragOver({ over }) {
            return over ? labels.overColumn(labelForDrag(String(over.id))) : ""
          },
          onDragEnd({ active: item, over }) {
            const title = labelForDrag(String(item.id))
            return over ? labels.moved(title, labelForDrag(String(over.id))) : labels.dropped
          },
          onDragCancel() {
            return labels.cancelled
          },
        },
      }}
    >
      <div
        data-slot="task-board"
        data-state={state}
        data-view={view}
        data-reduced-motion={reduced ? "true" : "false"}
        data-readonly={readOnly ? "true" : "false"}
        role="region"
        aria-label={labels.boardLabel}
        aria-busy={loading || undefined}
        className={cn("flex h-full w-full min-h-0 min-w-0 max-w-full flex-col gap-3", className)}
      >
        <div className={cn("flex shrink-0 flex-col gap-3", toolbarClassName)}>
          <div role="group" aria-label={labels.prioritySummary} className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {priorityOptions.map((item) => {
              const pressed = priority === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={pressed}
                  aria-label={labels.filterPriority(item.label, counts[item.id])}
                  className={cn(
                    "flex min-w-0 items-center gap-2 rounded-xl border border-border bg-card px-3 py-2 text-left text-card-foreground",
                    "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    pressed && "ring-2 ring-ring",
                  )}
                  onClick={() => setPriority(pressed ? null : item.id)}
                >
                  <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">{item.label}</span>
                  <span className="text-lg font-semibold tabular-nums">{counts[item.id]}</span>
                </button>
              )
            })}
          </div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <SearchField
              className="min-w-0 flex-1"
              label={labels.searchLabel}
              placeholder={labels.searchPlaceholder}
              value={query}
              onValueChange={setQuery}
            />
            <SegmentedControl
              className="shrink-0"
              label={labels.viewLabel}
              value={view}
              onValueChange={(next) => {
                if (next === "board" || next === "list") setView(next)
              }}
              options={[
                { value: "board", label: labels.boardView, icon: <LayoutGrid aria-hidden /> },
                { value: "list", label: labels.listView, icon: <List aria-hidden /> },
              ]}
            />
          </div>
          {readOnly ? (
            <p className="text-xs text-muted-foreground" role="status">
              {labels.readOnlyNote}
            </p>
          ) : null}
        </div>

        {state === "loading" ? (
          <div role="status" aria-label={labels.loadingLabel} className="flex min-h-0 w-full min-w-0 flex-1 gap-3 overflow-x-auto">
            {Array.from({ length: 3 }, (_, index) => (
              <div key={index} className="flex w-72 shrink-0 flex-col gap-2 rounded-xl bg-muted/40 p-2">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
              </div>
            ))}
          </div>
        ) : null}

        {state === "error" ? (
          <div
            role="alert"
            className="flex min-h-40 flex-1 flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border p-6 text-center"
          >
            <p className="text-sm font-medium">{labels.errorTitle}</p>
            <p className="max-w-sm text-sm text-muted-foreground break-all">{error}</p>
            {onRetry ? (
              <Button type="button" onClick={onRetry}>
                {labels.retry}
              </Button>
            ) : null}
          </div>
        ) : null}

        {state === "empty" || state === "nomatch" ? (
          <div className="flex min-h-40 flex-1 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-border p-6 text-center">
            <p className="text-sm font-medium">{state === "empty" ? labels.emptyTitle : labels.noMatchesTitle}</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              {state === "empty" ? labels.emptyHint : labels.noMatchesHint}
            </p>
          </div>
        ) : null}

        {state === "ready" && view === "board" ? (
          <div className="flex min-h-0 w-full min-w-0 flex-1 snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-1">
            {groups.map((group) => (
              <StageColumn key={group.stage.id} id={`${STAGE_PREFIX}${group.stage.id}`} label={group.stage.label} className={cn("h-full", columnClassName)}>
                <ColumnHeader group={group} />
                <SortableContext items={group.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                  <div className="flex min-h-24 flex-1 flex-col gap-2 overflow-y-auto">
                    {group.tasks.length === 0 ? (
                      <p className="px-1 py-6 text-center text-xs text-muted-foreground">{labels.noTasksInColumn}</p>
                    ) : (
                      group.tasks.map((task) => (
                        <SortableTask
                          key={task.id}
                          task={task}
                          reduced={reduced}
                          disabled={readOnly}
                          cardClassName={cardClassName}
                          people={people}
                          stages={stages}
                          priorities={priorityOptions}
                          overdue={isTaskOverdue(task, clock, doneStageIds)}
                          locale={locale}
                          labels={labels}
                          selected={task.id === selectedId}
                          onOpen={select}
                          onMoveTo={(stageId) => moveTask(task.id, stageId, "keyboard")}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
                {onCreateRequest && !readOnly ? (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="justify-start"
                    onClick={() => onCreateRequest(group.stage.id)}
                  >
                    <Plus aria-hidden />
                    {labels.addTask}
                  </Button>
                ) : null}
              </StageColumn>
            ))}
          </div>
        ) : null}

        {state === "ready" && view === "list" ? (
          <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-4 overflow-y-auto">
            {groups.map((group) => (
              <StageColumn
                key={group.stage.id}
                id={`${STAGE_PREFIX}${group.stage.id}`}
                label={group.stage.label}
                className={cn("h-auto w-full", columnClassName)}
              >
                <ColumnHeader group={group} />
                <SortableContext items={group.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
                  <div className="grid min-h-16 gap-2">
                    {group.tasks.length === 0 ? (
                      <p className="px-1 py-4 text-center text-xs text-muted-foreground">{labels.noTasksInColumn}</p>
                    ) : (
                      group.tasks.map((task) => (
                        <SortableTask
                          key={task.id}
                          task={task}
                          reduced={reduced}
                          disabled={readOnly}
                          cardClassName={cardClassName}
                          people={people}
                          stages={stages}
                          priorities={priorityOptions}
                          overdue={isTaskOverdue(task, clock, doneStageIds)}
                          locale={locale}
                          labels={labels}
                          selected={task.id === selectedId}
                          onOpen={select}
                          onMoveTo={(stageId) => moveTask(task.id, stageId, "keyboard")}
                        />
                      ))
                    )}
                  </div>
                </SortableContext>
              </StageColumn>
            ))}
          </div>
        ) : null}

        <div role="status" aria-live="polite" aria-atomic="true" data-slot="task-board-announcement" className="sr-only">
          {announcement}
        </div>
      </div>

      <DragOverlay dropAnimation={reduced ? null : undefined}>
        {active ? (
          <article className="rounded-lg border border-border bg-card p-3 shadow-md">
            <p className="line-clamp-2 text-sm font-medium break-all" dir="auto">
              {active.title}
            </p>
          </article>
        ) : null}
      </DragOverlay>

      <Sheet open={Boolean(selected)} onOpenChange={(open) => { if (!open) select(null) }}>
        <SheetContent
          side="right"
          showCloseButton={false}
          style={narrow ? { width: "100%", maxWidth: "none" } : { width: "32rem", maxWidth: "32rem" }}
          className={cn("gap-0 overflow-hidden p-0", sheetClassName)}
        >
          <SheetTitle className="sr-only">{labels.detailTitle}</SheetTitle>
          <SheetDescription className="sr-only">
            {selected ? `${selected.title}. ${labels.shortcuts}` : labels.detailTitle}
          </SheetDescription>
          {selected ? (
            <TaskDetail
                task={selected}
                people={people}
                stages={stages}
                categories={categories}
                priorities={priorityOptions}
                subtaskStatuses={statusOptions}
                position={selectedIndex + 1}
                total={ordered.length}
                locale={locale}
                labels={labels}
                readOnly={readOnly}
                onClose={() => select(null)}
                onPrevious={previousId ? () => select(previousId) : undefined}
                onNext={nextId ? () => select(nextId) : undefined}
                onUpdate={onUpdate}
                onStageChange={(stageId) => moveTask(selected.id, stageId, "keyboard")}
                onAddSubtask={onAddSubtask}
                onSubtaskStatusChange={onSubtaskStatusChange}
                onComment={onComment}
                onAttach={onAttach}
                onRemoveAttachment={onRemoveAttachment}
              />
          ) : null}
        </SheetContent>
      </Sheet>
    </DndContext>
  )
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const current = value !== undefined ? value : uncontrolled
  const setValue = React.useCallback(
    (next: T) => {
      if (value === undefined) setUncontrolled(next)
      onChange?.(next)
    },
    [onChange, value],
  )
  return [current, setValue] as const
}

function useNarrowScreen() {
  const [narrow, setNarrow] = React.useState(true)
  React.useLayoutEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const apply = () => setNarrow(media.matches)
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])
  return narrow
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(media.matches)
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])
  return reduced
}

function resolveStageId<TMeta>(overId: string, tasks: readonly TaskRecord<TMeta>[]) {
  const overTask = tasks.find((task) => task.id === overId)
  if (overTask) return overTask.stageId
  if (overId.startsWith(STAGE_PREFIX)) return overId.slice(STAGE_PREFIX.length)
  return null
}

function ColumnHeader<TMeta>({ group }: { group: TaskStageGroup<TMeta> }) {
  const dot = taskToneDot(group.stage.tone)
  return (
    <header className="flex shrink-0 items-center gap-2 px-1">
      {dot ? <span className={cn("size-2 shrink-0 rounded-full", dot)} aria-hidden /> : null}
      <p className="min-w-0 flex-1 truncate text-sm font-medium">{group.stage.label}</p>
      <span className="rounded-full bg-background px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
        {group.tasks.length}
      </span>
    </header>
  )
}

function StageColumn({
  id,
  label,
  className,
  children,
}: {
  id: string
  label: string
  className?: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <section
      ref={setNodeRef}
      data-slot="task-column"
      aria-label={label}
      className={cn(
        "flex w-72 max-w-full shrink-0 snap-start flex-col gap-2 rounded-xl bg-muted/40 p-2",
        isOver && "ring-2 ring-ring",
        className,
      )}
    >
      {children}
    </section>
  )
}

function SortableTask<TMeta extends Record<string, unknown>>({
  task,
  reduced,
  disabled,
  cardClassName,
  people,
  stages,
  priorities,
  overdue,
  locale,
  labels,
  selected,
  onOpen,
  onMoveTo,
}: {
  task: TaskRecord<TMeta>
  reduced: boolean
  disabled: boolean
  cardClassName?: string
  people: readonly TaskPerson[]
  stages: readonly TaskOption[]
  priorities: readonly { id: TaskPriority; label: string }[]
  overdue: boolean
  locale: string
  labels: TaskBoardLabels
  selected: boolean
  onOpen: (id: string) => void
  onMoveTo: (stageId: string) => void
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    disabled,
  })
  const style: React.CSSProperties = {
    transform: DndCSS.Transform.toString(transform),
    transition: reduced ? undefined : transition,
  }
  const priorityLabel = priorities.find((item) => item.id === task.priority)?.label
  return (
    <div ref={setNodeRef} style={style} className={cn(isDragging && "opacity-40")}>
      <TaskCard
        task={task}
        people={people}
        stages={stages}
        priorityLabel={priorityLabel}
        overdue={overdue}
        locale={locale}
        labels={labels}
        readOnly={disabled}
        selected={selected}
        onOpen={onOpen}
        onMoveTo={onMoveTo}
        dragHandleProps={disabled ? undefined : { ...attributes, ...listeners }}
        className={cn("motion-reduce:transition-none", cardClassName)}
      />
    </div>
  )
}

export type {
  TaskAttachment,
  TaskBoardLabels,
  TaskBoardView,
  TaskComment,
  TaskCommentInput,
  TaskOption,
  TaskPatch,
  TaskPerson,
  TaskPriority,
  TaskRecord,
  TaskSubtask,
  TaskSubtaskDraft,
} from "@/registry/retana/lib/task-board"
