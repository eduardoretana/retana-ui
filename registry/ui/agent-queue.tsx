"use client"

/**
 * Work waiting on agents. Clean-room reading of a public behavior
 * description: jobs sit in a queue, occupy worker slots, and land done or
 * failed, with a backlog shape when the workers are held.
 * No Affect source, sample data, icons, or assets were copied.
 */

import * as React from "react"
import { ArrowUp, Check, Pause, Play, RotateCcw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const QUEUE_LANES = ["queued", "running", "done", "failed"] as const

export type QueueLane = (typeof QUEUE_LANES)[number]

export type QueueJob<TMeta = unknown> = {
  id: string
  title: string
  detail?: string
  lane: QueueLane
  workerId?: string
  /** 0 to 1 while a worker holds the job. */
  progress?: number
  waitedMs?: number
  meta?: TMeta
}

export type QueueWorker<TMeta = unknown> = {
  id: string
  name: string
  /** How many jobs this worker can hold at once. */
  slots: number
  meta?: TMeta
}

export type AgentQueueLabels = {
  title: string
  waiting: (count: number) => string
  pause: string
  resume: string
  backlog: (latest: number) => string
  workers: string
  slots: (used: number, total: number) => string
  free: string
  held: string
  queue: string
  settled: string
  moveUp: (title: string) => string
  retry: string
  open: string
  done: string
  failed: string
  running: string
  queued: string
  wait: (ms: number) => string
  empty: string
  loading: string
  orphan: string
}

export type AgentQueueClassNames = {
  root?: string
  header?: string
  depth?: string
  worker?: string
  job?: string
  empty?: string
}

export type AgentQueueProps<TMeta = unknown> = {
  jobs?: readonly QueueJob<TMeta>[]
  workers?: readonly QueueWorker<TMeta>[]
  /** Recent backlog counts, oldest first. The last sample is the current depth. */
  depth?: readonly number[]
  paused?: boolean
  loading?: boolean
  error?: string
  title?: string
  onPause?: () => void
  onResume?: () => void
  onRetry?: (id: string) => void
  onMoveUp?: (id: string) => void
  onOpen?: (id: string) => void
  className?: string
  classNames?: AgentQueueClassNames
  labels?: Partial<AgentQueueLabels>
}

const agentQueueLabels: AgentQueueLabels = {
  title: "Work queue",
  waiting: (count) => (count === 1 ? "1 waiting" : `${count} waiting`),
  pause: "Hold workers",
  resume: "Let workers continue",
  backlog: (latest) => `Backlog, latest sample ${latest}`,
  workers: "Workers",
  slots: (used, total) => `${used} of ${total} slots`,
  free: "Free",
  held: "Held",
  queue: "Waiting",
  settled: "Settled",
  moveUp: (title) => `Move “${title}” up`,
  retry: "Try again",
  open: "Open",
  done: "Done",
  failed: "Failed",
  running: "In progress",
  queued: "Waiting",
  wait: (ms) => {
    const minutes = Math.max(0, Math.round(ms / 60000))
    if (minutes < 1) return "<1m"
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const rest = minutes % 60
    return rest ? `${hours}h ${rest}m` : `${hours}h`
  },
  empty: "Nothing is waiting on the workers.",
  loading: "Loading the queue",
  orphan: "No worker assigned",
}

export function queueBacklog(jobs: readonly Pick<QueueJob, "lane">[]) {
  return jobs.filter((job) => job.lane === "queued").length
}

export function workerUsage(workerId: string, jobs: readonly Pick<QueueJob, "lane" | "workerId">[]) {
  return jobs.filter((job) => job.lane === "running" && job.workerId === workerId).length
}

function resolveLabels(partial?: Partial<AgentQueueLabels>): AgentQueueLabels {
  return { ...agentQueueLabels, ...partial }
}

function Depth({ samples, label, className }: { samples: readonly number[]; label: string; className?: string }) {
  const max = Math.max(1, ...samples)
  return (
    <div role="img" aria-label={label} className={cn("flex h-8 items-end gap-0.5", className)}>
      {samples.map((value, index) => (
        <span
          key={`${index}-${value}`}
          className="min-w-1 flex-1 rounded-sm bg-primary/70"
          style={{ height: `${Math.max(12, Math.round((value / max) * 100))}%` }}
        />
      ))}
    </div>
  )
}

export function AgentQueue<TMeta = unknown>({
  jobs = [],
  workers = [],
  depth = [],
  paused = false,
  loading = false,
  error,
  title,
  onPause,
  onResume,
  onRetry,
  onMoveUp,
  onOpen,
  className,
  classNames,
  labels: labelOverrides,
}: AgentQueueProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const heading = title ?? labels.title
  const titleId = React.useId()
  const waiting = queueBacklog(jobs)
  const queued = jobs.filter((job) => job.lane === "queued")
  const running = jobs.filter((job) => job.lane === "running")
  const settled = jobs.filter((job) => job.lane === "done" || job.lane === "failed")
  const orphans = running.filter((job) => !job.workerId || !workers.some((worker) => worker.id === job.workerId))

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className, classNames?.root)}
    >
      <header className={cn("flex flex-wrap items-center gap-2", classNames?.header)}>
        <h2 id={titleId} className="text-sm font-medium">
          {heading}
        </h2>
        <Badge variant="secondary">{labels.waiting(waiting)}</Badge>
        {paused ? <Badge variant="outline">{labels.held}</Badge> : null}
        <div className="ms-auto">
          {paused ? (
            <Button type="button" size="sm" variant="outline" onClick={onResume} disabled={!onResume}>
              <Play aria-hidden="true" />
              {labels.resume}
            </Button>
          ) : (
            <Button type="button" size="sm" variant="outline" onClick={onPause} disabled={!onPause || loading}>
              <Pause aria-hidden="true" />
              {labels.pause}
            </Button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="flex flex-col gap-2" role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-14 w-full" />
          <Skeleton className="h-14 w-full" />
        </div>
      ) : error && jobs.length === 0 ? (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      ) : jobs.length === 0 && workers.length === 0 ? (
        <p className={cn("text-sm text-muted-foreground", classNames?.empty)}>{labels.empty}</p>
      ) : (
        <>
          {error ? (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          ) : null}
          {depth.length > 0 ? (
            <Depth samples={depth} label={labels.backlog(depth[depth.length - 1] ?? 0)} className={classNames?.depth} />
          ) : null}

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium text-muted-foreground">{labels.workers}</h3>
            {workers.length === 0 ? (
              <p className="text-sm text-muted-foreground">{labels.free}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {workers.map((worker) => {
                  const used = workerUsage(worker.id, jobs)
                  const mine = running.filter((job) => job.workerId === worker.id)
                  return (
                    <li key={worker.id} className={cn("rounded-lg border border-border p-2", classNames?.worker)}>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{worker.name}</span>
                        <span className="text-xs text-muted-foreground">{labels.slots(used, worker.slots)}</span>
                        {paused ? (
                          <Badge variant="outline" className="ms-auto bg-chart-4/15">
                            {labels.held}
                          </Badge>
                        ) : used === 0 ? (
                          <span className="ms-auto text-xs text-muted-foreground">{labels.free}</span>
                        ) : null}
                      </div>
                      {mine.map((job) => (
                        <JobRow key={job.id} job={job} labels={labels} onOpen={onOpen} className={classNames?.job} />
                      ))}
                    </li>
                  )
                })}
              </ul>
            )}
            {orphans.map((job) => (
              <JobRow key={job.id} job={job} labels={labels} onOpen={onOpen} className={classNames?.job} kicker={labels.orphan} />
            ))}
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="text-xs font-medium text-muted-foreground">{labels.queue}</h3>
            {queued.length === 0 ? (
              <p className="text-sm text-muted-foreground">{labels.empty}</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {queued.map((job, index) => (
                  <li key={job.id}>
                    <JobRow
                      job={job}
                      labels={labels}
                      onOpen={onOpen}
                      className={classNames?.job}
                      action={
                        index > 0 && onMoveUp ? (
                          <Button type="button" size="sm" variant="ghost" aria-label={labels.moveUp(job.title)} onClick={() => onMoveUp(job.id)}>
                            <ArrowUp aria-hidden="true" />
                          </Button>
                        ) : null
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </div>

          {settled.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-medium text-muted-foreground">{labels.settled}</h3>
              <ul className="flex flex-col gap-2">
                {settled.map((job) => (
                  <li key={job.id}>
                    <JobRow
                      job={job}
                      labels={labels}
                      onOpen={onOpen}
                      className={classNames?.job}
                      action={
                        job.lane === "failed" && onRetry ? (
                          <Button type="button" size="sm" variant="outline" onClick={() => onRetry(job.id)}>
                            <RotateCcw aria-hidden="true" />
                            {labels.retry}
                          </Button>
                        ) : null
                      }
                    />
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </>
      )}
    </section>
  )
}

function JobRow({
  job,
  labels,
  onOpen,
  action,
  kicker,
  className,
}: {
  job: QueueJob
  labels: AgentQueueLabels
  onOpen?: (id: string) => void
  action?: React.ReactNode
  kicker?: string
  className?: string
}) {
  const laneLabel = labels[job.lane]
  return (
    <div className={cn("flex flex-wrap items-center gap-2 py-1", className)}>
      {job.lane === "done" ? <Check aria-hidden="true" className="size-4 text-primary" /> : null}
      <div className="min-w-0 flex-1">
        <p className="truncate font-medium">
          {kicker ? <span className="me-2 text-xs font-normal text-muted-foreground">{kicker}</span> : null}
          {onOpen ? (
            <button type="button" className="truncate underline-offset-2 hover:underline" onClick={() => onOpen(job.id)}>
              {job.title}
            </button>
          ) : (
            job.title
          )}
        </p>
        {job.detail ? <p className="truncate text-xs text-muted-foreground">{job.detail}</p> : null}
        {job.lane === "running" ? (
          <Progress
            className="mt-1"
            value={Math.round((job.progress ?? 0) * 100)}
            aria-label={labels.running}
            aria-valuenow={Math.round((job.progress ?? 0) * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        ) : null}
      </div>
      <Badge variant={job.lane === "failed" ? "destructive" : "outline"} className={job.lane === "running" ? "bg-chart-2/15" : undefined}>
        {laneLabel}
      </Badge>
      {job.lane === "queued" && job.waitedMs != null ? (
        <span className="text-xs text-muted-foreground tabular-nums">{labels.wait(job.waitedMs)}</span>
      ) : null}
      {action}
    </div>
  )
}
