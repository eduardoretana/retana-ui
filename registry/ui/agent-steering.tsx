"use client"

/**
 * Notes for an agent that is already working. Clean-room reading of a public
 * behavior description: a note can wait for the next step, or land on the
 * active step immediately. No Affect source, sample data, icons, or assets
 * were copied.
 */

import * as React from "react"
import { Pause, Play, Send, X, Zap } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export const STEER_STEP_STATUSES = ["done", "active", "pending"] as const
export const STEER_RUN_STATUSES = ["running", "paused", "done"] as const

export type SteerStepStatus = (typeof STEER_STEP_STATUSES)[number]
export type SteerRunStatus = (typeof STEER_RUN_STATUSES)[number]

export type SteerNote<TMeta = unknown> = {
  id: string
  text: string
  meta?: TMeta
}

export type SteerStep<TMeta = unknown> = {
  id: string
  title: string
  status?: SteerStepStatus
  notes?: readonly SteerNote<TMeta>[]
  meta?: TMeta
}

export type AgentSteeringLabels = {
  plan: string
  queue: string
  field: string
  hint: string
  placeholder: string
  queueAction: string
  interrupt: string
  pause: string
  resume: string
  remove: (text: string) => string
  now: string
  emptyPlan: string
  loading: string
  done: string
  paused: string
  running: string
  active: string
  pending: string
  stepDone: string
  queuedLive: (text: string) => string
  interruptLive: (text: string) => string
  removedLive: (text: string) => string
}

export type AgentSteeringClassNames = {
  root?: string
  step?: string
  note?: string
  field?: string
}

export type AgentSteeringProps<TMeta = unknown> = {
  title: string
  agent?: string
  steps?: readonly SteerStep<TMeta>[]
  queue?: readonly SteerNote<TMeta>[]
  status?: SteerRunStatus
  draft?: string
  defaultDraft?: string
  loading?: boolean
  error?: string
  placeholder?: string
  onDraftChange?: (text: string) => void
  onQueue?: (text: string) => void
  onInterrupt?: (text: string, queuedId?: string) => void
  onRemove?: (id: string) => void
  onPause?: () => void
  onResume?: () => void
  className?: string
  classNames?: AgentSteeringClassNames
  labels?: Partial<AgentSteeringLabels>
}

const agentSteeringLabels: AgentSteeringLabels = {
  plan: "Plan",
  queue: "Waiting for the next step",
  field: "Note for the agent",
  hint: "Enter queues the note. Ctrl or Cmd Enter applies it now. Shift Enter adds a line.",
  placeholder: "Add a note for the next step",
  queueAction: "Queue for the next step",
  interrupt: "Apply now",
  pause: "Pause",
  resume: "Resume",
  remove: (text) => `Remove “${text}”`,
  now: "Now",
  emptyPlan: "This run has no steps yet.",
  loading: "Loading the plan",
  done: "The run is finished.",
  paused: "Paused",
  running: "Working",
  active: "Current step",
  pending: "Upcoming",
  stepDone: "Done",
  queuedLive: (text) => `Queued “${text}” for the next step`,
  interruptLive: (text) => `Applied “${text}” to the current step`,
  removedLive: (text) => `Removed “${text}”`,
}

function resolveLabels(partial?: Partial<AgentSteeringLabels>): AgentSteeringLabels {
  return { ...agentSteeringLabels, ...partial }
}

export function AgentSteering<TMeta = unknown>({
  title,
  agent,
  steps = [],
  queue = [],
  status = "running",
  draft: draftProp,
  defaultDraft = "",
  loading = false,
  error,
  placeholder,
  onDraftChange,
  onQueue,
  onInterrupt,
  onRemove,
  onPause,
  onResume,
  className,
  classNames,
  labels: labelOverrides,
}: AgentSteeringProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const hintId = React.useId()
  const liveId = React.useId()
  const [internalDraft, setInternalDraft] = React.useState(defaultDraft)
  const [live, setLive] = React.useState("")
  const draft = draftProp ?? internalDraft
  const closed = status === "done" || loading

  function setDraft(next: string) {
    if (draftProp === undefined) setInternalDraft(next)
    onDraftChange?.(next)
  }

  function submit(mode: "queue" | "interrupt", text: string, queuedId?: string) {
    const trimmed = text.trim()
    if (!trimmed || closed) return
    if (mode === "queue") {
      onQueue?.(trimmed)
      setLive(labels.queuedLive(trimmed))
    } else {
      onInterrupt?.(trimmed, queuedId)
      setLive(labels.interruptLive(trimmed))
    }
    if (!queuedId) setDraft("")
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Escape") {
      event.preventDefault()
      setDraft("")
      return
    }
    if (event.key !== "Enter" || event.shiftKey) return
    event.preventDefault()
    submit(event.metaKey || event.ctrlKey ? "interrupt" : "queue", draft)
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className, classNames?.root)}
    >
      <header className="flex flex-wrap items-start gap-2">
        <div className="min-w-0 flex-1">
          <h2 id={titleId} className="font-medium">
            {title}
          </h2>
          {agent ? <p className="text-xs text-muted-foreground">{agent}</p> : null}
        </div>
        <p className="text-xs text-muted-foreground">{status === "paused" ? labels.paused : status === "done" ? labels.done : labels.running}</p>
        {status === "running" && onPause ? (
          <Button type="button" size="sm" variant="outline" onClick={onPause}>
            <Pause aria-hidden="true" />
            {labels.pause}
          </Button>
        ) : null}
        {status === "paused" && onResume ? (
          <Button type="button" size="sm" variant="outline" onClick={onResume}>
            <Play aria-hidden="true" />
            {labels.resume}
          </Button>
        ) : null}
      </header>
      <p id={liveId} className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : error && steps.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : (
        <>
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          {steps.length === 0 ? (
            <p className="text-muted-foreground">{labels.emptyPlan}</p>
          ) : (
            <ol aria-label={labels.plan} className="flex flex-col gap-2">
              {steps.map((step, index) => {
                const stepStatus = step.status ?? "pending"
                return (
                  <li
                    key={step.id}
                    aria-current={stepStatus === "active" ? "step" : undefined}
                    className={cn(
                      "rounded-lg border border-border px-2 py-2",
                      stepStatus === "active" && "bg-chart-2/10",
                      classNames?.step,
                    )}
                  >
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs text-muted-foreground tabular-nums">{index + 1}</span>
                      <span className={cn("font-medium", stepStatus === "done" && "text-muted-foreground")}>{step.title}</span>
                      <span className="ms-auto text-xs text-muted-foreground">
                        {stepStatus === "active" ? labels.active : stepStatus === "done" ? labels.stepDone : labels.pending}
                      </span>
                    </div>
                    {step.notes && step.notes.length > 0 ? (
                      <ul className="mt-2 flex flex-col gap-1">
                        {step.notes.map((note) => (
                          <li key={note.id} className={cn("rounded-md bg-muted px-2 py-1 text-xs", classNames?.note)}>
                            {note.text}
                          </li>
                        ))}
                      </ul>
                    ) : null}
                  </li>
                )
              })}
            </ol>
          )}

          {queue.length > 0 ? (
            <div className="flex flex-col gap-2">
              <h3 className="text-xs font-medium text-muted-foreground">{labels.queue}</h3>
              <ul className="flex flex-col gap-2">
                {queue.map((note) => (
                  <li key={note.id} className="flex items-start gap-2 rounded-lg border border-dashed border-border px-2 py-2">
                    <p className="min-w-0 flex-1 text-sm">{note.text}</p>
                    {onInterrupt && status === "running" ? (
                      <Button type="button" size="sm" variant="outline" onClick={() => submit("interrupt", note.text, note.id)}>
                        <Zap aria-hidden="true" />
                        {labels.now}
                      </Button>
                    ) : null}
                    {onRemove ? (
                      <Button
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        aria-label={labels.remove(note.text)}
                        onClick={() => {
                          onRemove(note.id)
                          setLive(labels.removedLive(note.text))
                        }}
                      >
                        <X aria-hidden="true" />
                      </Button>
                    ) : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="flex flex-col gap-2">
            <label htmlFor={`${titleId}-note`} className="text-xs font-medium text-muted-foreground">
              {labels.field}
            </label>
            <Textarea
              id={`${titleId}-note`}
              value={draft}
              placeholder={placeholder ?? labels.placeholder}
              disabled={closed}
              aria-describedby={hintId}
              className={classNames?.field}
              onChange={(event) => setDraft(event.target.value)}
              onKeyDown={onKeyDown}
            />
            <p id={hintId} className="text-xs text-muted-foreground">
              {labels.hint}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" size="sm" variant="outline" disabled={closed || draft.trim().length === 0} onClick={() => submit("queue", draft)}>
                <Send aria-hidden="true" />
                {labels.queueAction}
              </Button>
              {onInterrupt ? (
                <Button type="button" size="sm" disabled={closed || draft.trim().length === 0} onClick={() => submit("interrupt", draft)}>
                  <Zap aria-hidden="true" />
                  {labels.interrupt}
                </Button>
              ) : null}
            </div>
          </div>
        </>
      )}
    </section>
  )
}
