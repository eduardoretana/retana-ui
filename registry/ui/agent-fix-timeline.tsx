"use client"

/**
 * Clean-room timeline for a fix narrated by the host.
 * Idea only, no license. This file does not run an agent.
 * The host pushes steps in. Kinds are diagnosis, edit, test, push, and done.
 */

import { Check, FileCode, FlaskConical, MessageSquare, Upload, X } from "lucide-react"

import { cn } from "@/lib/utils"

import { useReducedMotion } from "./use-reduced-motion"

export type FixStepKind = "thought" | "edit" | "test" | "push" | "done"

export type FixStepStatus = "pending" | "active" | "done" | "failed"

export type FixFile = {
  path: string
}

export type FixStep = {
  id: string
  kind: FixStepKind
  label: string
  detail?: string
  files?: readonly FixFile[]
  status?: FixStepStatus
}

export type AgentFixTimelineLabels = {
  kind: (kind: FixStepKind) => string
  empty: string
  failed: string
  pending: string
  active: string
  done: string
  files: string
  live: (step: FixStep | undefined) => string
}

const kindEn: Record<FixStepKind, string> = {
  thought: "Diagnosis",
  edit: "Edit",
  test: "Tests",
  push: "Push",
  done: "Done",
}

const kindEs: Record<FixStepKind, string> = {
  thought: "Diagnóstico",
  edit: "Edición",
  test: "Pruebas",
  push: "Empuje",
  done: "Listo",
}

function liveEn(step: FixStep | undefined) {
  if (!step) return "No steps yet."
  return `${kindEn[step.kind]}. ${step.label}`
}

function liveEs(step: FixStep | undefined) {
  if (!step) return "Sin pasos todavía."
  return `${kindEs[step.kind]}. ${step.label}`
}

export const agentFixTimelineLabels: AgentFixTimelineLabels = {
  kind: (kind) => kindEn[kind],
  empty: "No steps yet.",
  failed: "Failed",
  pending: "Pending",
  active: "In progress",
  done: "Done",
  files: "Files",
  live: liveEn,
}

export const agentFixTimelineLabelsEs: AgentFixTimelineLabels = {
  kind: (kind) => kindEs[kind],
  empty: "Sin pasos todavía.",
  failed: "Falló",
  pending: "En espera",
  active: "En curso",
  done: "Hecho",
  files: "Archivos",
  live: liveEs,
}

export type AgentFixTimelineProps = {
  steps: readonly FixStep[]
  variant?: "rail" | "compact"
  labels?: AgentFixTimelineLabels
  className?: string
}

function KindIcon({ kind }: { kind: FixStepKind }) {
  const className = "size-3.5"
  if (kind === "edit") return <FileCode className={className} aria-hidden />
  if (kind === "test") return <FlaskConical className={className} aria-hidden />
  if (kind === "push") return <Upload className={className} aria-hidden />
  if (kind === "done") return <Check className={className} aria-hidden />
  return <MessageSquare className={className} aria-hidden />
}

function statusWord(labels: AgentFixTimelineLabels, status: FixStepStatus) {
  if (status === "failed") return labels.failed
  if (status === "active") return labels.active
  if (status === "pending") return labels.pending
  return labels.done
}

export function AgentFixTimeline({
  steps,
  variant = "rail",
  labels = agentFixTimelineLabels,
  className,
}: AgentFixTimelineProps) {
  const reduced = useReducedMotion()
  const current = steps.find((step) => step.status === "active") ?? steps.find((step) => step.status === "failed") ?? steps.at(-1)

  if (steps.length === 0) {
    return (
      <div data-testid="agent-fix-timeline" data-variant={variant} data-motion={reduced ? "reduced" : "full"} className={cn("min-w-0", className)}>
        <p role="status" aria-live="polite" className="text-sm text-muted-foreground">
          {labels.empty}
        </p>
      </div>
    )
  }

  return (
    <div
      data-testid="agent-fix-timeline"
      data-variant={variant}
      data-motion={reduced ? "reduced" : "full"}
      className={cn("min-w-0", className)}
    >
      <p role="status" aria-live="polite" className="sr-only">
        {labels.live(current)}
      </p>
      <ol className={cn("flex flex-col", variant === "compact" && "flex-row flex-wrap gap-2")}>
        {steps.map((step, index) => {
          const status = step.status ?? "done"
          return (
            <li
              key={step.id}
              className={cn(
                "min-w-0",
                variant === "rail" && "grid grid-cols-[1rem_minmax(0,1fr)] gap-2",
                variant === "compact" && "max-w-full rounded-md border border-border p-2",
              )}
            >
              {variant === "rail" ? (
                <span className="flex flex-col items-center" aria-hidden>
                  <span
                    className={cn(
                      "mt-1 size-2 shrink-0 rounded-full border border-foreground bg-background transition-[opacity,transform] duration-200 motion-reduce:transition-none",
                      status === "active" && "scale-110 bg-primary",
                      status === "failed" && "bg-destructive",
                      reduced && "scale-100",
                    )}
                  />
                  {index < steps.length - 1 ? <span className="w-px flex-1 bg-border" /> : null}
                </span>
              ) : null}
              <div className={cn("min-w-0", variant === "rail" && "pb-3")}>
                <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
                  <KindIcon kind={step.kind} />
                  <span>{labels.kind(step.kind)}</span>
                  <span className={cn(status === "failed" && "text-destructive")}>{statusWord(labels, status)}</span>
                  {status === "failed" ? <X className="size-3 text-destructive" aria-hidden /> : null}
                </p>
                <p className="text-sm break-words text-foreground">{step.label}</p>
                {step.detail ? <p className="text-xs break-words text-muted-foreground">{step.detail}</p> : null}
                {step.files && step.files.length > 0 ? (
                  <ul aria-label={labels.files} className="mt-1 flex flex-wrap gap-1">
                    {step.files.map((file) => (
                      <li key={file.path} className="max-w-full rounded-md border border-border bg-muted px-1.5 py-0.5 font-mono text-xs break-all text-foreground">
                        {file.path}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
