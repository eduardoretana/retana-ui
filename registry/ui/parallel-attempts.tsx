"use client"

/**
 * The same task tried a few ways at once. Clean-room reading of a public
 * behavior description: each attempt shows its approach and how far it got,
 * the best finished score is marked, and a person can keep a different one.
 * No Affect source, sample data, icons, or assets were copied. Bars do not race.
 */

import * as React from "react"
import { Check } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const ATTEMPT_STATUSES = ["running", "done", "failed"] as const

export type AttemptStatus = (typeof ATTEMPT_STATUSES)[number]

export type Attempt<TMeta = unknown> = {
  id: string
  agent: string
  approach: string
  status: AttemptStatus
  /** 0 to 1. */
  progress: number
  /** 0 to 100 once it has a score. */
  score?: number
  note?: string
  meta?: TMeta
}

export type ParallelAttemptsLabels = {
  title: string
  done: (done: number, total: number) => string
  status: Record<AttemptStatus, string>
  ahead: string
  tied: string
  chosen: string
  score: (score: number) => string
  pick: string
  pickNamed: (approach: string) => string
  progress: (approach: string, percent: number) => string
  empty: string
  loading: string
  picked: (approach: string) => string
}

export type ParallelAttemptsClassNames = {
  root?: string
  attempt?: string
}

export type ParallelAttemptsProps<TMeta = unknown> = {
  attempts?: readonly Attempt<TMeta>[]
  task?: string
  pickedId?: string | null
  loading?: boolean
  error?: string
  title?: string
  onPick?: (id: string) => void
  className?: string
  classNames?: ParallelAttemptsClassNames
  labels?: Partial<ParallelAttemptsLabels>
}

const attemptLabels: ParallelAttemptsLabels = {
  title: "Same task, several ways",
  done: (done, total) => `${done} of ${total} finished`,
  status: { running: "In progress", done: "Finished", failed: "Failed" },
  ahead: "Ahead",
  tied: "Tied",
  chosen: "Kept",
  score: (score) => `Score ${score}`,
  pick: "Keep this one",
  pickNamed: (approach) => `Keep “${approach}”`,
  progress: (approach, percent) => `${approach}, ${percent}%`,
  empty: "Nothing is being tried yet.",
  loading: "Loading the attempts",
  picked: (approach) => `Kept “${approach}”`,
}

function resolveLabels(partial?: Partial<ParallelAttemptsLabels>): ParallelAttemptsLabels {
  return { ...attemptLabels, ...partial, status: { ...attemptLabels.status, ...partial?.status } }
}

export function leadingAttempt(attempts: readonly Pick<Attempt, "id" | "status" | "score">[]) {
  const finished = attempts.filter((attempt) => attempt.status === "done" && typeof attempt.score === "number")
  if (finished.length === 0) return null
  const best = Math.max(...finished.map((attempt) => attempt.score ?? 0))
  const winners = finished.filter((attempt) => attempt.score === best)
  return winners.length === 1 ? winners[0]!.id : null
}

export function ParallelAttempts<TMeta = unknown>({
  attempts = [],
  task,
  pickedId,
  loading = false,
  error,
  title,
  onPick,
  className,
  classNames,
  labels: labelOverrides,
}: ParallelAttemptsProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const leader = leadingAttempt(attempts)
  const finished = attempts.filter((attempt) => attempt.status === "done").length
  const tied = leader == null && attempts.some((attempt) => attempt.status === "done" && typeof attempt.score === "number")
  const [live, setLive] = React.useState("")

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
        <Badge variant="secondary">{labels.done(finished, attempts.length)}</Badge>
        {tied && !pickedId ? <Badge variant="outline">{labels.tied}</Badge> : null}
      </header>
      {task ? <p className="text-xs text-muted-foreground">{task}</p> : null}
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-16 w-full motion-reduce:animate-none" />
          <Skeleton className="h-16 w-full motion-reduce:animate-none" />
        </div>
      ) : error && attempts.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : attempts.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <ol className="flex flex-col gap-2">
          {error ? (
            <li role="alert" className="text-destructive">
              {error}
            </li>
          ) : null}
          {attempts.map((attempt) => {
            const percent = Math.max(0, Math.min(100, Math.round(attempt.progress * 100)))
            const chosen = pickedId === attempt.id
            return (
              <li key={attempt.id} className={cn("rounded-lg border border-border px-3 py-2", chosen && "border-primary", classNames?.attempt)}>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{attempt.approach}</h3>
                  <Badge variant={attempt.status === "failed" ? "destructive" : "outline"}>{labels.status[attempt.status]}</Badge>
                  {attempt.id === leader && !pickedId ? <Badge variant="secondary">{labels.ahead}</Badge> : null}
                  {chosen ? <Badge variant="secondary">{labels.chosen}</Badge> : null}
                  <span className="ms-auto text-xs text-muted-foreground">{attempt.agent}</span>
                </div>
                {attempt.note ? <p className="mt-1 text-xs text-muted-foreground">{attempt.note}</p> : null}
                <Progress
                  value={percent}
                  aria-label={labels.progress(attempt.approach, percent)}
                  aria-valuenow={percent}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  className="mt-2"
                />
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {typeof attempt.score === "number" ? <span className="text-xs">{labels.score(attempt.score)}</span> : null}
                  {attempt.status === "done" && !chosen ? (
                    <Button
                      type="button"
                      size="sm"
                      className="ms-auto"
                      aria-label={labels.pickNamed(attempt.approach)}
                      onClick={() => {
                        onPick?.(attempt.id)
                        setLive(labels.picked(attempt.approach))
                      }}
                    >
                      <Check aria-hidden="true" />
                      {labels.pick}
                    </Button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
