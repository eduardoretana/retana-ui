"use client"

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type AgentTask = {
  id: string
  title: string
  detail?: string
  done?: boolean
}

export type TaskListProps = {
  tasks: readonly AgentTask[]
  title?: string
  onToggle?: (id: string, done: boolean) => void
  progressLabel?: string
  className?: string
}

export function TaskList({
  tasks,
  title = "Tasks",
  onToggle,
  progressLabel = "Progress",
  className,
}: TaskListProps) {
  const done = tasks.filter((task) => task.done).length
  const total = tasks.length
  const percent = total === 0 ? 0 : Math.round((done / total) * 100)

  return (
    <section data-slot="task-list" className={cn("rounded-xl border border-border bg-card p-3", className)}>
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-sm font-medium">{title}</h2>
        <p className="text-xs text-muted-foreground tabular-nums">
          {done}/{total}
        </p>
      </div>
      <div
        role="progressbar"
        aria-label={progressLabel}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className="h-full rounded-full bg-primary transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${percent}%` }} />
      </div>
      <ul className="flex flex-col gap-1">
        {tasks.map((task) => {
          const checked = Boolean(task.done)
          return (
            <li key={task.id}>
              <button
                type="button"
                role="checkbox"
                aria-checked={checked}
                disabled={!onToggle}
                onClick={() => onToggle?.(task.id, !checked)}
                className="flex w-full items-start gap-2 rounded-lg px-1.5 py-1.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-default"
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-0.5 grid size-4 shrink-0 place-items-center rounded border border-border",
                    checked && "border-primary bg-primary text-primary-foreground",
                  )}
                >
                  {checked ? <Check className="size-3" /> : null}
                </span>
                <span className="min-w-0">
                  <span className={cn("block text-sm", checked && "text-muted-foreground line-through")}>{task.title}</span>
                  {task.detail ? <span className="block text-xs text-muted-foreground">{task.detail}</span> : null}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
