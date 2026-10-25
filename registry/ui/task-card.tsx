"use client"

/**
 * Clean-room task card. Host semantic classes only.
 * Assignees use the host Avatar so a dense board does not add a tab stop per person.
 * `avatar-group` stays the interactive stack.
 */

import * as React from "react"
import { AlertTriangle, Calendar, GripVertical, ListChecks, MessageSquare, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { PriorityBadge } from "@/registry/retana/ui/priority-badge"
import {
  formatTaskDate,
  resolveTaskBoardLabels,
  type TaskBoardLabels,
  type TaskOption,
  type TaskPerson,
  type TaskRecord,
} from "@/registry/retana/lib/task-board"

export type TaskCardProps<TMeta = Record<string, unknown>> = {
  task: TaskRecord<TMeta>
  people?: readonly TaskPerson[]
  stages?: readonly TaskOption[]
  priorityLabel?: string
  overdue?: boolean
  locale?: string
  labels?: Partial<TaskBoardLabels>
  readOnly?: boolean
  selected?: boolean
  onOpen?: (id: string) => void
  onMoveTo?: (stageId: string) => void
  /** Listeners from a drag sensor. Omitted, the handle stays disabled. */
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>
  className?: string
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function isRtl(node: HTMLElement) {
  return getComputedStyle(node).direction === "rtl"
}

export function TaskCard<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  task,
  people = [],
  stages = [],
  priorityLabel,
  overdue = false,
  locale = "es",
  labels: labelOverrides,
  readOnly = false,
  selected = false,
  onOpen,
  onMoveTo,
  dragHandleProps,
  className,
}: TaskCardProps<TMeta>) {
  const labels = resolveTaskBoardLabels(labelOverrides)
  const assignees = task.assigneeIds
    .map((id) => people.find((person) => person.id === id))
    .filter((person): person is TaskPerson => Boolean(person))
  const visible = assignees.slice(0, 3)
  const extra = assignees.length - visible.length
  const due = formatTaskDate(task.dueAt, locale, "short")
  const subtaskCount = task.subtasks?.length ?? 0
  const commentCount = task.comments?.length ?? 0
  const assigneeLabel = labels.assignees(assignees.map((person) => person.name))

  function onTitleKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (readOnly || !onMoveTo) return
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    const index = stages.findIndex((stage) => stage.id === task.stageId)
    if (index < 0) return
    const forward = event.key === "ArrowRight" ? 1 : -1
    const delta = isRtl(event.currentTarget) ? -forward : forward
    const next = stages[index + delta]
    if (!next) return
    event.preventDefault()
    onMoveTo(next.id)
  }

  return (
    <article
      data-slot="task-card"
      data-task-id={task.id}
      data-stage-id={task.stageId}
      data-overdue={overdue ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
      className={cn(
        "rounded-lg border border-border bg-card p-3 text-card-foreground shadow-sm",
        selected && "ring-2 ring-ring",
        className,
      )}
    >
      <div className="flex items-start gap-1.5">
        <button
          type="button"
          className="mt-0.5 text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:cursor-default"
          aria-label={labels.dragTask(task.title)}
          {...(readOnly ? {} : dragHandleProps)}
          disabled={readOnly || !dragHandleProps}
        >
          <GripVertical className="size-3.5" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <button
            type="button"
            data-task-focus={task.id}
            className="w-full rounded-sm text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            aria-label={labels.openTask(task.title)}
            onClick={() => onOpen?.(task.id)}
            onKeyDown={onTitleKeyDown}
          >
            <span className="line-clamp-3 text-sm font-medium break-all" dir="auto">
              {task.title}
            </span>
          </button>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <PriorityBadge level={task.priority} label={priorityLabel} />
            {overdue ? (
              <span className="inline-flex h-6 items-center gap-1 rounded-full bg-destructive/10 px-2 text-xs font-medium text-destructive">
                <AlertTriangle className="size-3" aria-hidden />
                {labels.overdue}
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center" role="group" aria-label={assigneeLabel}>
              {visible.length === 0 ? (
                <span className="text-xs text-muted-foreground">{labels.unassigned}</span>
              ) : (
                visible.map((person) => (
                  <Avatar key={person.id} size="sm" className="-ms-1.5 ring-2 ring-background first:ms-0">
                    {person.src ? <AvatarImage src={person.src} alt="" /> : null}
                    <AvatarFallback className="text-[10px]">{initials(person.name)}</AvatarFallback>
                  </Avatar>
                ))
              )}
              {extra > 0 ? (
                <span className="-ms-1.5 inline-grid size-6 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background tabular-nums">
                  +{extra}
                </span>
              ) : null}
            </div>
            {due ? (
              <span className="inline-flex shrink-0 items-center gap-1 text-xs text-muted-foreground tabular-nums">
                <Calendar className="size-3.5" aria-hidden />
                <span>{labels.dueOn(due)}</span>
              </span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <ListChecks className="size-3.5" aria-hidden />
              {labels.subtasks(subtaskCount)}
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare className="size-3.5" aria-hidden />
              {labels.comments(commentCount)}
            </span>
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={labels.actionsFor(task.title)}>
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onOpen?.(task.id)}>{labels.open}</DropdownMenuItem>
            {readOnly ? null : (
              <>
                <DropdownMenuLabel>{labels.moveTo}</DropdownMenuLabel>
                {stages.map((stage) => (
                  <DropdownMenuItem
                    key={stage.id}
                    disabled={stage.id === task.stageId}
                    onSelect={() => onMoveTo?.(stage.id)}
                  >
                    {stage.label}
                  </DropdownMenuItem>
                ))}
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  )
}
