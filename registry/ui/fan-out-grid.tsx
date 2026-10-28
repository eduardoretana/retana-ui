"use client"

/**
 * One job handed to many workers. Clean-room reading of a public behavior
 * description: every piece of the job is a cell, and a failed cell can be
 * tried again. No Affect source, sample data, icons, or assets were copied.
 * Cells do not shine or animate.
 */

import * as React from "react"
import { RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const FAN_STATUSES = ["waiting", "running", "retrying", "done", "failed"] as const

export type FanStatus = (typeof FAN_STATUSES)[number]

export type FanCell<TMeta = unknown> = {
  id: string
  title: string
  worker?: string
  status: FanStatus
  detail?: string
  meta?: TMeta
}

export type FanTally = Record<FanStatus, number> & { total: number }

export type FanOutGridLabels = {
  title: string
  done: (done: number, total: number) => string
  status: Record<FanStatus, string>
  worker: (name: string) => string
  open: (title: string) => string
  retry: string
  retryNamed: (title: string) => string
  empty: string
  loading: string
  retried: (title: string) => string
}

export type FanOutGridClassNames = {
  root?: string
  cell?: string
}

export type FanOutGridProps<TMeta = unknown> = {
  cells?: readonly FanCell<TMeta>[]
  job?: string
  loading?: boolean
  error?: string
  title?: string
  onOpen?: (id: string) => void
  onRetry?: (id: string) => void
  className?: string
  classNames?: FanOutGridClassNames
  labels?: Partial<FanOutGridLabels>
}

const fanLabels: FanOutGridLabels = {
  title: "Fan-out",
  done: (done, total) => `${done} of ${total} done`,
  status: {
    waiting: "Waiting",
    running: "In progress",
    retrying: "Trying again",
    done: "Done",
    failed: "Failed",
  },
  worker: (name) => `With ${name}`,
  open: (title) => `Open “${title}”`,
  retry: "Try again",
  retryNamed: (title) => `Try “${title}” again`,
  empty: "This job has no pieces yet.",
  loading: "Loading the grid",
  retried: (title) => `Trying “${title}” again`,
}

function resolveLabels(partial?: Partial<FanOutGridLabels>): FanOutGridLabels {
  return { ...fanLabels, ...partial, status: { ...fanLabels.status, ...partial?.status } }
}

export function fanTally(cells: readonly Pick<FanCell, "id" | "status">[]): FanTally {
  const tally: FanTally = { waiting: 0, running: 0, retrying: 0, done: 0, failed: 0, total: cells.length }
  for (const cell of cells) tally[cell.status] += 1
  return tally
}

const CELL: Record<FanStatus, string> = {
  waiting: "border-border bg-muted/50",
  running: "border-chart-2 bg-chart-2/15",
  retrying: "border-chart-4 bg-chart-4/20",
  done: "border-primary/40 bg-primary/10",
  failed: "border-destructive bg-destructive/10",
}

export function FanOutGrid<TMeta = unknown>({
  cells = [],
  job,
  loading = false,
  error,
  title,
  onOpen,
  onRetry,
  className,
  classNames,
  labels: labelOverrides,
}: FanOutGridProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const tally = fanTally(cells)
  const [openId, setOpenId] = React.useState<string | null>(null)
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
        <Badge variant="secondary">{labels.done(tally.done, tally.total)}</Badge>
        {tally.failed > 0 ? <Badge variant="destructive">{labels.status.failed} {tally.failed}</Badge> : null}
        {tally.retrying > 0 ? <Badge variant="outline">{labels.status.retrying} {tally.retrying}</Badge> : null}
      </header>
      {job ? <p className="text-xs text-muted-foreground">{job}</p> : null}
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status" className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-16 motion-reduce:animate-none" />
          <Skeleton className="h-16 motion-reduce:animate-none" />
          <Skeleton className="h-16 motion-reduce:animate-none" />
          <Skeleton className="h-16 motion-reduce:animate-none" />
        </div>
      ) : error && cells.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : cells.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <ul className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {cells.map((cell) => {
              const open = openId === cell.id
              return (
                <li key={cell.id} className={cn("rounded-lg border px-2 py-2", CELL[cell.status], classNames?.cell)}>
                  <button
                    type="button"
                    className="w-full rounded-md text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-expanded={open}
                    aria-label={labels.open(cell.title)}
                    onClick={() => {
                      setOpenId(open ? null : cell.id)
                      onOpen?.(cell.id)
                    }}
                  >
                    <span className="block font-medium">{cell.title}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">{labels.status[cell.status]}</span>
                    {cell.worker ? <span className="block text-xs text-muted-foreground">{labels.worker(cell.worker)}</span> : null}
                  </button>
                  {open && cell.detail ? <p className="mt-1 text-xs">{cell.detail}</p> : null}
                  {cell.status === "failed" || cell.status === "retrying" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="mt-2"
                      aria-label={labels.retryNamed(cell.title)}
                      onClick={() => {
                        onRetry?.(cell.id)
                        setLive(labels.retried(cell.title))
                      }}
                    >
                      <RotateCcw aria-hidden="true" />
                      {labels.retry}
                    </Button>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
