"use client"

/**
 * What the plan said against what the run actually spent. Clean-room reading
 * of a public behavior description: each step has a planned ghost and a solid
 * bar, an overrun shifts the steps after it, and the finish moves.
 * No Affect source, sample data, icons, or assets were copied.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const ACTUAL_STATUSES = ["pending", "running", "done"] as const

export type ActualStatus = (typeof ACTUAL_STATUSES)[number]

export type ActualStep<TMeta = unknown> = {
  id: string
  title: string
  detail?: string
  plannedMin: number
  actualMin: number
  status: ActualStatus
  meta?: TMeta
}

export type PlanCourse = {
  plannedMin: number
  expectedMin: number
  slipMin: number
  placed: {
    id: string
    plannedStart: number
    actualStart: number
    spent: number
    overrun: boolean
  }[]
}

export type PlanVsActualLabels = {
  title: string
  planned: (minutes: number) => string
  expected: (minutes: number) => string
  slip: (minutes: number) => string
  ahead: (minutes: number) => string
  onTime: string
  row: (title: string, planned: number, spent: number) => string
  ghost: string
  spent: string
  status: Record<ActualStatus, string>
  overrun: string
  empty: string
  loading: string
  minutes: (minutes: number) => string
}

export type PlanVsActualClassNames = {
  root?: string
  row?: string
}

export type PlanVsActualProps<TMeta = unknown> = {
  steps?: readonly ActualStep<TMeta>[]
  loading?: boolean
  error?: string
  title?: string
  onOpen?: (id: string) => void
  className?: string
  classNames?: PlanVsActualClassNames
  labels?: Partial<PlanVsActualLabels>
}

const planVsActualLabels: PlanVsActualLabels = {
  title: "Plan and what happened",
  planned: (minutes) => `Plan ${minutes} min`,
  expected: (minutes) => `Finish at ${minutes} min`,
  slip: (minutes) => `${minutes} min over`,
  ahead: (minutes) => `${minutes} min ahead`,
  onTime: "On the plan",
  row: (title, planned, spent) => `${title}, planned ${planned} min, spent ${spent} min`,
  ghost: "Planned",
  spent: "Spent",
  status: {
    pending: "Not started",
    running: "In progress",
    done: "Done",
  },
  overrun: "Over the plan",
  empty: "Nothing has been planned yet.",
  loading: "Loading the comparison",
  minutes: (minutes) => `${minutes} min`,
}

function resolveLabels(partial?: Partial<PlanVsActualLabels>): PlanVsActualLabels {
  return { ...planVsActualLabels, ...partial, status: { ...planVsActualLabels.status, ...partial?.status } }
}

export function planCourse(steps: readonly Pick<ActualStep, "id" | "plannedMin" | "actualMin" | "status">[]): PlanCourse {
  let plannedCursor = 0
  let actualCursor = 0
  const placed = steps.map((step) => {
    const spent = step.status === "pending" ? step.plannedMin : step.actualMin
    const row = {
      id: step.id,
      plannedStart: plannedCursor,
      actualStart: actualCursor,
      spent,
      overrun: spent > step.plannedMin,
    }
    plannedCursor += step.plannedMin
    actualCursor += spent
    return row
  })
  return {
    plannedMin: plannedCursor,
    expectedMin: actualCursor,
    slipMin: actualCursor - plannedCursor,
    placed,
  }
}

function pct(value: number, horizon: number) {
  return Math.max(0, Math.min(100, (value / horizon) * 100))
}

export function PlanVsActual<TMeta = unknown>({
  steps = [],
  loading = false,
  error,
  title,
  onOpen,
  className,
  classNames,
  labels: labelOverrides,
}: PlanVsActualProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const course = planCourse(steps)
  const horizon = Math.max(course.plannedMin, course.expectedMin, 1)
  const slipLabel = course.slipMin > 0 ? labels.slip(course.slipMin) : course.slipMin < 0 ? labels.ahead(Math.abs(course.slipMin)) : labels.onTime

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
        <Badge variant="secondary">{labels.planned(course.plannedMin)}</Badge>
        <Badge variant="outline">{labels.expected(course.expectedMin)}</Badge>
        <Badge variant={course.slipMin > 0 ? "destructive" : "outline"}>{slipLabel}</Badge>
      </header>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-12 w-full motion-reduce:animate-none" />
          <Skeleton className="h-12 w-full motion-reduce:animate-none" />
        </div>
      ) : error && steps.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : steps.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <ol className="flex flex-col gap-3">
          {error ? (
            <li role="alert" className="text-destructive">
              {error}
            </li>
          ) : null}
          <li className="flex justify-between text-xs text-muted-foreground" aria-hidden="true">
            <span>{labels.minutes(0)}</span>
            <span>{labels.minutes(Math.round(horizon / 2))}</span>
            <span>{labels.minutes(horizon)}</span>
          </li>
          {steps.map((step) => {
            const place = course.placed.find((row) => row.id === step.id)!
            const ghostLeft = pct(place.plannedStart, horizon)
            const ghostWidth = pct(step.plannedMin, horizon)
            const barLeft = pct(place.actualStart, horizon)
            const barWidth = pct(place.spent, horizon)
            return (
              <li key={step.id} className={classNames?.row}>
                <button
                  type="button"
                  className="flex w-full flex-col gap-1 rounded-md text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  aria-label={labels.row(step.title, step.plannedMin, step.status === "pending" ? 0 : step.actualMin)}
                  onClick={() => onOpen?.(step.id)}
                >
                  <span className="flex flex-wrap items-center gap-2">
                    <span className="font-medium">{step.title}</span>
                    <Badge variant="outline">{labels.status[step.status]}</Badge>
                    {place.overrun ? <Badge variant="destructive">{labels.overrun}</Badge> : null}
                    <span className="ms-auto text-xs text-muted-foreground">
                      {labels.minutes(step.status === "pending" ? 0 : step.actualMin)} / {labels.minutes(step.plannedMin)}
                    </span>
                  </span>
                  <span className="relative h-3 rounded-full bg-muted" aria-hidden="true">
                    <span
                      className="absolute top-0 h-full rounded-full border border-dashed border-foreground/40"
                      style={{ left: `${ghostLeft}%`, width: `${Math.max(ghostWidth, 1)}%` }}
                    />
                    {step.status === "pending" ? null : (
                      <span
                        className={cn("absolute top-0 h-full rounded-full", place.overrun ? "bg-chart-4" : "bg-primary/70")}
                        style={{ left: `${barLeft}%`, width: `${Math.max(barWidth, place.spent > 0 ? 1 : 0)}%` }}
                      />
                    )}
                  </span>
                </button>
                {step.detail ? <p className="mt-1 text-xs text-muted-foreground">{step.detail}</p> : null}
              </li>
            )
          })}
        </ol>
      )}
    </section>
  )
}
