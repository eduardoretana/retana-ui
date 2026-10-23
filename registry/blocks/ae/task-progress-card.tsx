"use client"

/** Clean-room AE dashboard piece. A task list with progress bars. Theme tokens only. */

import { motion, useReducedMotion } from "motion/react"
import { CheckCircle2, Circle } from "lucide-react"

import { cn } from "@/lib/utils"
import { growTransition } from "@/registry/retana/lib/ae-dash"
import { AeCard, AeEmpty } from "@/registry/retana/blocks/ae/card-shell"

export type ProgressTask = { id: string; title: string; progress: number; due?: string }

export type TaskProgressCardProps = { title?: string; tasks: ProgressTask[]; className?: string }

export function TaskProgressCard({ title = "Tareas", tasks, className }: TaskProgressCardProps) {
  const reduce = !!useReducedMotion()
  const done = tasks.filter((task) => Math.round(task.progress) >= 100).length
  return (
    <AeCard title={title} className={className} action={<span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium tabular-nums">{done}/{tasks.length}</span>}>
      {tasks.length === 0 ? (
        <AeEmpty>Sin tareas pendientes.</AeEmpty>
      ) : (
        <ul className="grid gap-4">
          {tasks.map((task, index) => {
            const value = Math.max(0, Math.min(100, Math.round(task.progress)))
            const complete = value >= 100
            return (
              <li key={task.id} className="grid min-w-0 gap-2">
                <div className="flex min-w-0 items-start gap-2 text-sm">
                  {complete ? <CheckCircle2 aria-hidden className="mt-0.5 size-4 shrink-0 text-primary" /> : <Circle aria-hidden className="mt-0.5 size-4 shrink-0 text-muted-foreground" />}
                  <span className={cn("min-w-0 flex-1 break-words", complete && "text-muted-foreground line-through")}>{task.title}</span>
                  {task.due ? <span className="shrink-0 text-xs text-muted-foreground">{task.due}</span> : null}
                </div>
                <div role="progressbar" aria-label={task.title} aria-valuemin={0} aria-valuemax={100} aria-valuenow={value} className="ml-6 h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div className={cn("h-full rounded-full", complete ? "bg-foreground/60" : "bg-primary")} style={{ originX: 0, width: `${value}%` }} initial={{ scaleX: reduce ? 1 : 0 }} animate={{ scaleX: 1 }} transition={growTransition(reduce, index)} />
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </AeCard>
  )
}
