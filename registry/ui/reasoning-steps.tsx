"use client"

import * as React from "react"
import { AlertCircle, Check, ChevronDown, Circle, LoaderCircle } from "lucide-react"

import { cn } from "@/lib/utils"

export type ReasoningStatus = "pending" | "active" | "done" | "error"

export type ReasoningStep = {
  id: string
  title: string
  detail?: string
  status: ReasoningStatus
  /** Elapsed time in milliseconds. */
  durationMs?: number
}

export type ReasoningStepsProps = {
  steps: readonly ReasoningStep[]
  title?: string
  defaultOpen?: boolean
  open?: boolean
  onOpenChange?: (open: boolean) => void
  pendingLabel?: string
  activeLabel?: string
  doneLabel?: string
  errorLabel?: string
  className?: string
}

const STATUS_ICON = {
  pending: Circle,
  active: LoaderCircle,
  done: Check,
  error: AlertCircle,
} as const

function formatDuration(ms: number) {
  if (ms < 1000) return `${Math.max(0, Math.round(ms))} ms`
  return `${(ms / 1000).toFixed(1)} s`
}

export function ReasoningSteps({
  steps,
  title = "Reasoning",
  defaultOpen = true,
  open,
  onOpenChange,
  pendingLabel = "Pending",
  activeLabel = "In progress",
  doneLabel = "Done",
  errorLabel = "Error",
  className,
}: ReasoningStepsProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const isOpen = open ?? uncontrolled
  const labels: Record<ReasoningStatus, string> = {
    pending: pendingLabel,
    active: activeLabel,
    done: doneLabel,
    error: errorLabel,
  }
  const done = steps.filter((step) => step.status === "done").length

  function toggle() {
    const next = !isOpen
    if (open === undefined) setUncontrolled(next)
    onOpenChange?.(next)
  }

  return (
    <section
      data-slot="reasoning-steps"
      data-open={isOpen ? "true" : "false"}
      className={cn("rounded-xl border border-border bg-card", className)}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={isOpen}
        onClick={toggle}
      >
        <ChevronDown className={cn("size-4 text-muted-foreground transition-transform motion-reduce:transition-none", !isOpen && "-rotate-90")} />
        <span className="font-medium">{title}</span>
        <span className="ml-auto text-xs text-muted-foreground tabular-nums">
          {done}/{steps.length}
        </span>
      </button>
      {isOpen ? (
        <ol className="flex flex-col gap-1 border-t border-border px-2 py-2">
          {steps.map((step) => {
            const Icon = STATUS_ICON[step.status]
            return (
              <li
                key={step.id}
                data-status={step.status}
                className="flex gap-2 rounded-lg px-1.5 py-1.5"
              >
                <Icon
                  aria-hidden
                  className={cn(
                    "mt-0.5 size-4 shrink-0",
                    step.status === "active" && "motion-safe:animate-spin text-foreground",
                    step.status === "done" && "text-primary",
                    step.status === "error" && "text-destructive",
                    step.status === "pending" && "text-muted-foreground",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2">
                    <p className="text-sm">{step.title}</p>
                    <span className="sr-only">{labels[step.status]}</span>
                    {typeof step.durationMs === "number" ? (
                      <span className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">
                        {formatDuration(step.durationMs)}
                      </span>
                    ) : null}
                  </div>
                  {step.detail ? <p className="mt-0.5 text-xs text-muted-foreground">{step.detail}</p> : null}
                </div>
              </li>
            )
          })}
        </ol>
      ) : null}
    </section>
  )
}
