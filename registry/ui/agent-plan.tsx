"use client"

/**
 * A plan to review before the workshop runs it. Clean-room reading of a public
 * behavior description: rename a step, move it, drop it, add one, then retry
 * a step that failed. No Affect source, sample data, icons, or assets were copied.
 */

import * as React from "react"
import { ArrowDown, ArrowUp, Plus, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const PLAN_STATUSES = ["pending", "running", "done", "failed", "dropped"] as const

export type PlanStepStatus = (typeof PLAN_STATUSES)[number]

export type PlanStep<TMeta = unknown> = {
  id: string
  title: string
  detail?: string
  estimateMin: number
  elapsedMin?: number
  status: PlanStepStatus
  meta?: TMeta
}

export type AgentPlanLabels = {
  title: string
  remaining: (minutes: number) => string
  status: Record<PlanStepStatus, string>
  spent: (elapsed: number, estimate: number) => string
  rename: string
  renameNamed: (title: string) => string
  name: (title: string) => string
  moveUp: (title: string) => string
  moveDown: (title: string) => string
  remove: string
  removeNamed: (title: string) => string
  retry: string
  retryNamed: (title: string) => string
  add: string
  addNamed: string
  hint: string
  empty: string
  loading: string
  renamed: (title: string) => string
  moved: (title: string) => string
  removed: (title: string) => string
  added: (title: string) => string
  retried: (title: string) => string
}

export type AgentPlanClassNames = {
  root?: string
  step?: string
}

export type AgentPlanProps<TMeta = unknown> = {
  steps?: readonly PlanStep<TMeta>[]
  goal?: string
  loading?: boolean
  error?: string
  title?: string
  onRename?: (id: string, title: string) => void
  onMove?: (id: string, direction: -1 | 1) => void
  onRemove?: (id: string) => void
  onAdd?: (title: string) => void
  onRetry?: (id: string) => void
  className?: string
  classNames?: AgentPlanClassNames
  labels?: Partial<AgentPlanLabels>
}

const agentPlanLabels: AgentPlanLabels = {
  title: "Plan before it runs",
  remaining: (minutes) => (minutes === 1 ? "1 min still ahead" : `${minutes} min still ahead`),
  status: {
    pending: "Not started",
    running: "In progress",
    done: "Done",
    failed: "Failed",
    dropped: "Dropped",
  },
  spent: (elapsed, estimate) => `${elapsed} of ${estimate} min`,
  rename: "Rename",
  renameNamed: (title) => `Rename “${title}”`,
  name: (title) => `Name for “${title}”`,
  moveUp: (title) => `Move “${title}” up`,
  moveDown: (title) => `Move “${title}” down`,
  remove: "Drop",
  removeNamed: (title) => `Drop “${title}”`,
  retry: "Try again",
  retryNamed: (title) => `Try “${title}” again`,
  add: "Add a step",
  addNamed: "New step",
  hint: "Alt and the arrow keys move a step. Delete drops it.",
  empty: "No steps yet. Add the first one.",
  loading: "Loading the plan",
  renamed: (title) => `Renamed to “${title}”`,
  moved: (title) => `Moved “${title}”`,
  removed: (title) => `Dropped “${title}”`,
  added: (title) => `Added “${title}”`,
  retried: (title) => `Trying “${title}” again`,
}

function resolveLabels(partial?: Partial<AgentPlanLabels>): AgentPlanLabels {
  return { ...agentPlanLabels, ...partial, status: { ...agentPlanLabels.status, ...partial?.status } }
}

export function planMinutes(steps: readonly Pick<PlanStep, "id" | "status" | "estimateMin" | "elapsedMin">[]) {
  return steps.reduce((total, step) => {
    if (step.status === "dropped" || step.status === "done" || step.status === "failed") return total
    if (step.status === "running") return total + Math.max(0, step.estimateMin - (step.elapsedMin ?? 0))
    return total + step.estimateMin
  }, 0)
}

export function AgentPlan<TMeta = unknown>({
  steps = [],
  goal,
  loading = false,
  error,
  title,
  onRename,
  onMove,
  onRemove,
  onAdd,
  onRetry,
  className,
  classNames,
  labels: labelOverrides,
}: AgentPlanProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const hintId = React.useId()
  const heading = title ?? labels.title
  const [editing, setEditing] = React.useState<string | null>(null)
  const [draft, setDraft] = React.useState("")
  const skipRename = React.useRef(false)
  const [adding, setAdding] = React.useState("")
  const [live, setLive] = React.useState("")
  const active = steps.filter((step) => step.status !== "dropped")
  const left = planMinutes(steps)

  function commitRename(step: PlanStep<TMeta>) {
    const next = draft.trim()
    setEditing(null)
    if (!next || next === step.title) return
    onRename?.(step.id, next)
    setLive(labels.renamed(next))
  }

  function onStepKey(event: React.KeyboardEvent<HTMLLIElement>, step: PlanStep<TMeta>, index: number) {
    if (editing === step.id || step.status === "dropped") return
    if (event.altKey && event.key === "ArrowUp" && index > 0) {
      event.preventDefault()
      onMove?.(step.id, -1)
      setLive(labels.moved(step.title))
    }
    if (event.altKey && event.key === "ArrowDown" && index < active.length - 1) {
      event.preventDefault()
      onMove?.(step.id, 1)
      setLive(labels.moved(step.title))
    }
    if (event.key === "Delete") {
      event.preventDefault()
      onRemove?.(step.id)
      setLive(labels.removed(step.title))
    }
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-describedby={hintId}
      aria-busy={loading || undefined}
      className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className, classNames?.root)}
    >
      <header className="flex flex-wrap items-center gap-2">
        <h2 id={titleId} className="font-medium">
          {heading}
        </h2>
        <Badge variant="secondary">{labels.remaining(left)}</Badge>
      </header>
      {goal ? <p className="text-xs text-muted-foreground">{goal}</p> : null}
      <p id={hintId} className="text-xs text-muted-foreground">
        {labels.hint}
      </p>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-14 w-full motion-reduce:animate-none" />
          <Skeleton className="h-14 w-full motion-reduce:animate-none" />
        </div>
      ) : error && steps.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : steps.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {error ? (
            <li role="alert" className="text-destructive">
              {error}
            </li>
          ) : null}
          {steps.map((step) => {
            const index = active.findIndex((item) => item.id === step.id)
            const dropped = step.status === "dropped"
            return (
              <li
                key={step.id}
                tabIndex={dropped ? undefined : 0}
                aria-keyshortcuts={dropped ? undefined : "Alt+ArrowUp Alt+ArrowDown Delete"}
                onKeyDown={(event) => onStepKey(event, step, index)}
                className={cn(
                  "rounded-lg border border-border px-3 py-2 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  dropped && "opacity-60",
                  classNames?.step,
                )}
              >
                <div className="flex flex-wrap items-center gap-2">
                  {editing === step.id ? (
                    <Input
                      autoFocus
                      aria-label={labels.name(step.title)}
                      value={draft}
                      onChange={(event) => setDraft(event.target.value)}
                      onBlur={() => {
                        if (skipRename.current) {
                          skipRename.current = false
                          return
                        }
                        commitRename(step)
                      }}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault()
                          event.currentTarget.blur()
                        }
                        if (event.key === "Escape") {
                          event.preventDefault()
                          skipRename.current = true
                          setEditing(null)
                          event.currentTarget.blur()
                        }
                      }}
                      className="h-8 max-w-sm"
                    />
                  ) : (
                    <h3 className={cn("font-medium", dropped && "line-through")}>{step.title}</h3>
                  )}
                  <Badge variant={step.status === "failed" ? "destructive" : "outline"}>{labels.status[step.status]}</Badge>
                  <span className="text-xs text-muted-foreground">{labels.spent(step.elapsedMin ?? 0, step.estimateMin)}</span>
                </div>
                {step.detail ? <p className="mt-1 text-xs text-muted-foreground">{step.detail}</p> : null}
                {dropped ? null : (
                  <div className="mt-2 flex flex-wrap gap-1">
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={labels.renameNamed(step.title)}
                      onClick={() => {
                        setEditing(step.id)
                        setDraft(step.title)
                      }}
                    >
                      {labels.rename}
                    </Button>
                    <Button type="button" size="sm" variant="ghost" aria-label={labels.moveUp(step.title)} disabled={index <= 0} onClick={() => onMove?.(step.id, -1)}>
                      <ArrowUp aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      aria-label={labels.moveDown(step.title)}
                      disabled={index < 0 || index >= active.length - 1}
                      onClick={() => onMove?.(step.id, 1)}
                    >
                      <ArrowDown aria-hidden="true" />
                    </Button>
                    <Button type="button" size="sm" variant="ghost" aria-label={labels.removeNamed(step.title)} onClick={() => onRemove?.(step.id)}>
                      {labels.remove}
                    </Button>
                    {step.status === "failed" ? (
                      <Button type="button" size="sm" variant="outline" aria-label={labels.retryNamed(step.title)} onClick={() => onRetry?.(step.id)}>
                        <RotateCcw aria-hidden="true" />
                        {labels.retry}
                      </Button>
                    ) : null}
                  </div>
                )}
              </li>
            )
          })}
        </ol>
      )}
      {loading || (error && steps.length === 0) ? null : (
        <form
          className="flex flex-wrap gap-2"
          onSubmit={(event) => {
            event.preventDefault()
            const next = adding.trim()
            if (!next) return
            onAdd?.(next)
            setAdding("")
            setLive(labels.added(next))
          }}
        >
          <Input aria-label={labels.addNamed} value={adding} onChange={(event) => setAdding(event.target.value)} placeholder={labels.add} className="h-8 max-w-sm" />
          <Button type="submit" size="sm" variant="outline">
            <Plus aria-hidden="true" />
            {labels.add}
          </Button>
        </form>
      )}
    </section>
  )
}
