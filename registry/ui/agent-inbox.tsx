"use client"

/**
 * Background work the workshop is watching. Clean-room reading of a public
 * behavior description: a calm list with status, age, and a row that opens
 * onto the last steps, where a person can approve, send back, or try again.
 * No Affect source, sample data, icons, or assets were copied.
 */

import * as React from "react"
import { Check, ChevronDown, RotateCcw, Undo2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const INBOX_STATUSES = ["needs-you", "running", "failed", "done"] as const

export type InboxStatus = (typeof INBOX_STATUSES)[number]

export type InboxFilter = "all" | InboxStatus

export type InboxStep = {
  id: string
  label: string
  /** Epoch milliseconds. */
  at: number
}

export type InboxTask<TMeta = unknown> = {
  id: string
  title: string
  summary: string
  agent: string
  status: InboxStatus
  /** Epoch milliseconds when the task started. */
  startedAt: number
  steps?: readonly InboxStep[]
  meta?: TMeta
}

export type AgentInboxLabels = {
  title: string
  waiting: (count: number) => string
  filters: Record<InboxFilter, string>
  count: (label: string, count: number) => string
  status: Record<InboxStatus, string>
  age: (minutes: number) => string
  steps: string
  toggle: (title: string, open: boolean) => string
  open: string
  approve: string
  approveNamed: (title: string) => string
  sendBack: string
  sendBackNamed: (title: string) => string
  retry: string
  retryNamed: (title: string) => string
  from: (agent: string) => string
  empty: string
  noneInFilter: string
  loading: string
  approved: (title: string) => string
  sentBack: (title: string) => string
  retried: (title: string) => string
}

export type AgentInboxClassNames = {
  root?: string
  task?: string
  steps?: string
}

export type AgentInboxProps<TMeta = unknown> = {
  tasks?: readonly InboxTask<TMeta>[]
  /** Minutes are measured against this clock. Omit it and the age stays hidden. */
  now?: number
  filter?: InboxFilter
  onFilterChange?: (filter: InboxFilter) => void
  openIds?: readonly string[]
  onOpenChange?: (ids: string[]) => void
  loading?: boolean
  error?: string
  title?: string
  onOpen?: (id: string) => void
  onApprove?: (id: string) => void
  onSendBack?: (id: string) => void
  onRetry?: (id: string) => void
  className?: string
  classNames?: AgentInboxClassNames
  labels?: Partial<AgentInboxLabels>
}

const agentInboxLabels: AgentInboxLabels = {
  title: "Workshop inbox",
  waiting: (count) => (count === 1 ? "1 waiting on you" : `${count} waiting on you`),
  filters: {
    all: "All",
    "needs-you": "Waiting on you",
    running: "In progress",
    failed: "Failed",
    done: "Filed",
  },
  count: (label, count) => `${label}, ${count}`,
  status: {
    "needs-you": "Waiting on you",
    running: "In progress",
    failed: "Failed",
    done: "Filed",
  },
  age: (minutes) => {
    if (minutes < 1) return "just now"
    if (minutes < 60) return `${minutes} min ago`
    const hours = Math.floor(minutes / 60)
    return hours === 1 ? "1 hour ago" : `${hours} hours ago`
  },
  steps: "Last steps",
  toggle: (title, open) => (open ? `Fold “${title}”` : `Unfold “${title}”`),
  open: "Open",
  approve: "Approve",
  approveNamed: (title) => `Approve “${title}”`,
  sendBack: "Send back",
  sendBackNamed: (title) => `Send “${title}” back`,
  retry: "Try again",
  retryNamed: (title) => `Try “${title}” again`,
  from: (agent) => `With ${agent}`,
  empty: "The workshop inbox is clear.",
  noneInFilter: "Nothing in this group.",
  loading: "Loading the inbox",
  approved: (title) => `Approved “${title}”`,
  sentBack: (title) => `Sent “${title}” back`,
  retried: (title) => `Trying “${title}” again`,
}

function resolveLabels(partial?: Partial<AgentInboxLabels>): AgentInboxLabels {
  return { ...agentInboxLabels, ...partial, filters: { ...agentInboxLabels.filters, ...partial?.filters }, status: { ...agentInboxLabels.status, ...partial?.status } }
}

export function inboxCount(tasks: readonly Pick<InboxTask, "id" | "status">[], status?: InboxStatus) {
  return tasks.filter((task) => !status || task.status === status).length
}

export function inboxAgeMinutes(at: number, now: number) {
  return Math.max(0, Math.round((now - at) / 60_000))
}

const FILTERS: readonly InboxFilter[] = ["all", ...INBOX_STATUSES]

export function AgentInbox<TMeta = unknown>({
  tasks = [],
  now,
  filter: filterProp,
  onFilterChange,
  openIds: openProp,
  onOpenChange,
  loading = false,
  error,
  title,
  onOpen,
  onApprove,
  onSendBack,
  onRetry,
  className,
  classNames,
  labels: labelOverrides,
}: AgentInboxProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const [filterState, setFilterState] = React.useState<InboxFilter>("all")
  const [openState, setOpenState] = React.useState<string[]>([])
  const [live, setLive] = React.useState("")
  const filter = filterProp ?? filterState
  const openIds = openProp ?? openState
  const waiting = inboxCount(tasks, "needs-you")
  const visible = tasks.filter((task) => filter === "all" || task.status === filter)

  function setFilter(next: InboxFilter) {
    if (filterProp === undefined) setFilterState(next)
    onFilterChange?.(next)
  }

  function toggle(id: string) {
    const next = openIds.includes(id) ? openIds.filter((item) => item !== id) : [...openIds, id]
    if (openProp === undefined) setOpenState(next)
    onOpenChange?.(next)
  }

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
        <Badge variant="secondary">{labels.waiting(waiting)}</Badge>
      </header>
      <div role="group" aria-label={labels.title} className="flex flex-wrap gap-1">
        {FILTERS.map((item) => {
          const count = inboxCount(tasks, item === "all" ? undefined : item)
          const pressed = filter === item
          return (
            <Button key={item} type="button" size="sm" variant={pressed ? "default" : "outline"} aria-pressed={pressed} onClick={() => setFilter(item)}>
              {labels.count(labels.filters[item], count)}
            </Button>
          )
        })}
      </div>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-16 w-full motion-reduce:animate-none" />
          <Skeleton className="h-16 w-full motion-reduce:animate-none" />
        </div>
      ) : error && tasks.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : tasks.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {error ? (
            <li role="alert" className="text-destructive">
              {error}
            </li>
          ) : null}
          {visible.length === 0 ? <li className="text-muted-foreground">{labels.noneInFilter}</li> : null}
          {visible.map((task) => {
            const open = openIds.includes(task.id)
            const age = now == null ? null : labels.age(inboxAgeMinutes(task.startedAt, now))
            return (
              <li key={task.id} className={cn("rounded-lg border border-border px-3 py-2", classNames?.task)}>
                <div className="flex flex-wrap items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{task.title}</h3>
                      <Badge variant={task.status === "failed" ? "destructive" : "outline"}>{labels.status[task.status]}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {labels.from(task.agent)}
                      {age ? ` · ${age}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">{task.summary}</p>
                  </div>
                  <Button type="button" size="sm" variant="ghost" aria-expanded={open} aria-label={labels.toggle(task.title, open)} onClick={() => toggle(task.id)}>
                    <ChevronDown aria-hidden="true" className={cn("transition-transform motion-reduce:transition-none", open && "rotate-180")} />
                  </Button>
                </div>
                {open ? (
                  <div className={cn("mt-2 border-t border-border pt-2", classNames?.steps)}>
                    <p className="text-xs font-medium text-muted-foreground">{labels.steps}</p>
                    <ol className="mt-1 flex flex-col gap-1">
                      {(task.steps ?? []).map((step) => (
                        <li key={step.id} className="text-xs">
                          {step.label}
                          {now != null ? <span className="text-muted-foreground"> · {labels.age(inboxAgeMinutes(step.at, now))}</span> : null}
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : null}
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" size="sm" variant="outline" onClick={() => onOpen?.(task.id)}>
                    {labels.open}
                  </Button>
                  {task.status === "needs-you" ? (
                    <>
                      <Button
                        type="button"
                        size="sm"
                        aria-label={labels.approveNamed(task.title)}
                        onClick={() => {
                          onApprove?.(task.id)
                          setLive(labels.approved(task.title))
                        }}
                      >
                        <Check aria-hidden="true" />
                        {labels.approve}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        aria-label={labels.sendBackNamed(task.title)}
                        onClick={() => {
                          onSendBack?.(task.id)
                          setLive(labels.sentBack(task.title))
                        }}
                      >
                        <Undo2 aria-hidden="true" />
                        {labels.sendBack}
                      </Button>
                    </>
                  ) : null}
                  {task.status === "failed" ? (
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-label={labels.retryNamed(task.title)}
                      onClick={() => {
                        onRetry?.(task.id)
                        setLive(labels.retried(task.title))
                      }}
                    >
                      <RotateCcw aria-hidden="true" />
                      {labels.retry}
                    </Button>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
