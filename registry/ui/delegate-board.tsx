"use client"

/**
 * Hand work to agents. Clean-room reading of a public behavior description:
 * a task can be dragged onto an agent, or given to whoever is free first.
 * No Affect source, sample data, icons, or assets were copied.
 */

import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { GripVertical } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const DELEGATE_MODES = ["manual", "auto"] as const

export type DelegateMode = (typeof DELEGATE_MODES)[number]

export type DelegateTask<TMeta = unknown> = {
  id: string
  title: string
  detail?: string
  /** Minutes of work. */
  minutes: number
  agentId?: string | null
  meta?: TMeta
}

export type DelegateAgent<TMeta = unknown> = {
  id: string
  name: string
  role: string
  /** Minutes already booked before these tasks. */
  bookedMinutes: number
  meta?: TMeta
}

export type DelegateAssignment = {
  taskId: string
  agentId: string
}

export type DelegateBoardLabels = {
  title: string
  waiting: string
  manual: string
  auto: string
  place: string
  assign: (title: string) => string
  unassigned: string
  drag: (title: string) => string
  freeAt: (clock: string) => string
  previewAt: (clock: string) => string
  minutes: (count: number) => string
  empty: string
  loading: string
  noAgents: string
  picked: (title: string) => string
  moved: (title: string, agent: string) => string
  cancelled: string
}

export type DelegateBoardClassNames = {
  root?: string
  column?: string
  task?: string
}

export type DelegateBoardProps<TMeta = unknown> = {
  tasks?: readonly DelegateTask<TMeta>[]
  agents?: readonly DelegateAgent<TMeta>[]
  /** Minutes from midnight used to render "free at". */
  clockMinutes?: number
  mode?: DelegateMode
  defaultMode?: DelegateMode
  loading?: boolean
  error?: string
  title?: string
  onModeChange?: (mode: DelegateMode) => void
  onAssign?: (taskId: string, agentId: string) => void
  onUnassign?: (taskId: string) => void
  onPlace?: (assignments: readonly DelegateAssignment[]) => void
  className?: string
  classNames?: DelegateBoardClassNames
  labels?: Partial<DelegateBoardLabels>
}

const delegateBoardLabels: DelegateBoardLabels = {
  title: "Hand-off",
  waiting: "Not handed off",
  manual: "Choose who",
  auto: "Whoever is free",
  place: "Hand waiting work to whoever is free",
  assign: (title) => `Hand off “${title}”`,
  unassigned: "Leave unassigned",
  drag: (title) => `Drag “${title}”`,
  freeAt: (clock) => `Free at ${clock}`,
  previewAt: (clock) => `Would be free at ${clock}`,
  minutes: (count) => `${count} min`,
  empty: "No work is waiting to be handed off.",
  loading: "Loading the hand-off",
  noAgents: "No agents are available.",
  picked: (title) => `Picked up ${title}.`,
  moved: (title, agent) => `Moved ${title} to ${agent}.`,
  cancelled: "Cancelled.",
}

export function formatClock(minutesFromMidnight: number) {
  const day = ((Math.round(minutesFromMidnight) % 1440) + 1440) % 1440
  const hours = Math.floor(day / 60)
  const minutes = day % 60
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`
}

export function agentLoad(
  agentId: string,
  tasks: readonly Pick<DelegateTask, "agentId" | "minutes">[],
  bookedMinutes: number,
) {
  return tasks.reduce((sum, task) => (task.agentId === agentId ? sum + task.minutes : sum), bookedMinutes)
}

export function firstFreeAssignments(
  tasks: readonly Pick<DelegateTask, "id" | "minutes" | "agentId">[],
  agents: readonly Pick<DelegateAgent, "id" | "bookedMinutes">[],
): DelegateAssignment[] {
  if (agents.length === 0) return []
  const load = new Map(agents.map((agent) => [agent.id, agentLoad(agent.id, tasks, agent.bookedMinutes)]))
  const assignments: DelegateAssignment[] = []
  for (const task of tasks) {
    if (task.agentId) continue
    let best = agents[0]!
    let bestLoad = load.get(best.id) ?? 0
    for (const agent of agents) {
      const current = load.get(agent.id) ?? 0
      if (current < bestLoad) {
        best = agent
        bestLoad = current
      }
    }
    assignments.push({ taskId: task.id, agentId: best.id })
    load.set(best.id, bestLoad + task.minutes)
  }
  return assignments
}

function resolveLabels(partial?: Partial<DelegateBoardLabels>): DelegateBoardLabels {
  return { ...delegateBoardLabels, ...partial }
}

const TRAY = "tray"

export function DelegateBoard<TMeta = unknown>({
  tasks = [],
  agents = [],
  clockMinutes = 11 * 60 + 40,
  mode: modeProp,
  defaultMode = "manual",
  loading = false,
  error,
  title,
  onModeChange,
  onAssign,
  onUnassign,
  onPlace,
  className,
  classNames,
  labels: labelOverrides,
}: DelegateBoardProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const [internalMode, setInternalMode] = React.useState<DelegateMode>(defaultMode)
  const [previewId, setPreviewId] = React.useState<string | null>(null)
  const mode = modeProp ?? internalMode
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )
  const names = React.useMemo(() => new Map(tasks.map((task) => [task.id, task.title])), [tasks])

  function setMode(next: DelegateMode) {
    if (modeProp === undefined) setInternalMode(next)
    onModeChange?.(next)
  }

  function onDragEnd(event: DragEndEvent) {
    setPreviewId(null)
    const taskId = String(event.active.id)
    const overId = event.over ? String(event.over.id) : ""
    if (!overId) return
    if (overId === TRAY) {
      onUnassign?.(taskId)
      return
    }
    if (overId.startsWith("agent:")) onAssign?.(taskId, overId.slice("agent:".length))
  }

  const waiting = tasks.filter((task) => !task.agentId)
  const preview = tasks.find((task) => task.id === previewId)

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className, classNames?.root)}
    >
      <header className="flex flex-wrap items-center gap-2">
        <h2 id={titleId} className="font-medium">
          {heading}
        </h2>
        <div role="group" aria-label={heading} className="ms-auto flex gap-1">
          {DELEGATE_MODES.map((option) => (
            <Button key={option} type="button" size="sm" variant={mode === option ? "secondary" : "ghost"} aria-pressed={mode === option} onClick={() => setMode(option)}>
              {option === "auto" ? labels.auto : labels.manual}
            </Button>
          ))}
        </div>
      </header>
      {loading ? (
        <div role="status" className="flex gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-28 flex-1" />
          <Skeleton className="h-28 flex-1" />
        </div>
      ) : error && tasks.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : (
        <DndContext
          sensors={sensors}
          onDragStart={(event) => setPreviewId(String(event.active.id))}
          onDragCancel={() => setPreviewId(null)}
          onDragEnd={onDragEnd}
          accessibility={{
            announcements: {
              onDragStart({ active }) {
                return labels.picked(names.get(String(active.id)) ?? String(active.id))
              },
              onDragOver({ over }) {
                if (!over) return ""
                const id = String(over.id)
                if (id === TRAY) return labels.waiting
                const agent = agents.find((item) => `agent:${item.id}` === id)
                return agent?.name ?? ""
              },
              onDragEnd({ active, over }) {
                const task = names.get(String(active.id)) ?? String(active.id)
                if (!over) return labels.cancelled
                const id = String(over.id)
                if (id === TRAY) return labels.moved(task, labels.waiting)
                const agent = agents.find((item) => `agent:${item.id}` === id)
                return labels.moved(task, agent?.name ?? id)
              },
              onDragCancel() {
                return labels.cancelled
              },
            },
          }}
        >
          {error ? (
            <p role="alert" className="mb-2 text-destructive">
              {error}
            </p>
          ) : null}
          {mode === "auto" && waiting.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={agents.length === 0}
              onClick={() => onPlace?.(firstFreeAssignments(tasks, agents))}
            >
              {labels.place}
            </Button>
          ) : null}
          <div className="flex gap-2 overflow-x-auto pb-1">
            <Column id={TRAY} title={labels.waiting} count={waiting.length} className={classNames?.column}>
              {waiting.length === 0 ? <p className="text-xs text-muted-foreground">{labels.empty}</p> : null}
              {waiting.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  agents={agents}
                  labels={labels}
                  className={classNames?.task}
                  onAssign={onAssign}
                  onUnassign={onUnassign}
                  onPreview={setPreviewId}
                />
              ))}
            </Column>
            {agents.length === 0 ? (
              <p className="self-center text-xs text-muted-foreground">{labels.noAgents}</p>
            ) : (
              agents.map((agent) => {
                const mine = tasks.filter((task) => task.agentId === agent.id)
                const load = agentLoad(agent.id, tasks, agent.bookedMinutes)
                const extra = preview && preview.agentId !== agent.id ? preview.minutes : 0
                const when = formatClock(clockMinutes + load + extra)
                return (
                  <Column
                    key={agent.id}
                    id={`agent:${agent.id}`}
                    title={agent.name}
                    detail={agent.role}
                    count={mine.length}
                    when={extra > 0 ? labels.previewAt(when) : labels.freeAt(when)}
                    className={classNames?.column}
                  >
                    {mine.map((task) => (
                      <TaskCard
                        key={task.id}
                        task={task}
                        agents={agents}
                        labels={labels}
                        className={classNames?.task}
                        onAssign={onAssign}
                        onUnassign={onUnassign}
                        onPreview={setPreviewId}
                      />
                    ))}
                  </Column>
                )
              })
            )}
          </div>
        </DndContext>
      )}
    </section>
  )
}

function Column({
  id,
  title,
  detail,
  count,
  when,
  className,
  children,
}: {
  id: string
  title: string
  detail?: string
  count: number
  when?: string
  className?: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <div
      ref={setNodeRef}
      className={cn(
        "flex w-56 shrink-0 flex-col gap-2 rounded-lg border border-border bg-muted/30 p-2",
        isOver && "ring-2 ring-ring",
        className,
      )}
    >
      <header>
        <div className="flex items-center gap-2">
          <h3 className="truncate text-sm font-medium">{title}</h3>
          <Badge variant="secondary">{count}</Badge>
        </div>
        {detail ? <p className="truncate text-xs text-muted-foreground">{detail}</p> : null}
        {when ? <p className="text-xs text-muted-foreground tabular-nums">{when}</p> : null}
      </header>
      {children}
    </div>
  )
}

function TaskCard({
  task,
  agents,
  labels,
  className,
  onAssign,
  onUnassign,
  onPreview,
}: {
  task: DelegateTask
  agents: readonly DelegateAgent[]
  labels: DelegateBoardLabels
  className?: string
  onAssign?: (taskId: string, agentId: string) => void
  onUnassign?: (taskId: string) => void
  onPreview: (id: string | null) => void
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined
  return (
    <article
      ref={setNodeRef}
      style={style}
      className={cn("rounded-md border border-border bg-card p-2", isDragging && "opacity-70", className)}
      onPointerEnter={() => onPreview(task.id)}
      onPointerLeave={() => onPreview(null)}
      onFocus={() => onPreview(task.id)}
      onBlur={() => onPreview(null)}
    >
      <div className="flex items-start gap-1">
        <button type="button" className="mt-0.5 text-muted-foreground" aria-label={labels.drag(task.title)} {...listeners} {...attributes}>
          <GripVertical aria-hidden="true" className="size-4" />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-medium">{task.title}</p>
          {task.detail ? <p className="text-xs text-muted-foreground">{task.detail}</p> : null}
          <p className="text-xs text-muted-foreground tabular-nums">{labels.minutes(task.minutes)}</p>
        </div>
      </div>
      <label className="mt-2 block text-xs text-muted-foreground">
        <span className="sr-only">{labels.assign(task.title)}</span>
        <select
          className="h-8 w-full rounded-md border border-input bg-background px-2 text-sm text-foreground"
          value={task.agentId ?? ""}
          onChange={(event) => {
            const next = event.target.value
            if (!next) onUnassign?.(task.id)
            else onAssign?.(task.id, next)
          }}
        >
          <option value="">{labels.unassigned}</option>
          {agents.map((agent) => (
            <option key={agent.id} value={agent.id}>
              {agent.name}
            </option>
          ))}
        </select>
      </label>
    </article>
  )
}
