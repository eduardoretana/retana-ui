"use client"

/**
 * Clean-room checks pill.
 * Idea only, no license: a count pill opens a list of checks.
 * The panel is closed until the host or the reader opens it.
 * Durations are display data. When `estimated` is set, the row says so.
 */

import * as React from "react"
import { Ban, Check, Circle, CircleMinus, Loader2, X } from "lucide-react"
import { motion } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

import { useReducedMotion } from "./use-reduced-motion"

export type CheckStatus = "queued" | "running" | "passed" | "failed" | "skipped" | "cancelled"

export type CheckItem = {
  id: string
  name: string
  status: CheckStatus
  startedAt?: string
  durationMs?: number
  /** 0 to 1. The host computes it. This component does not invent a clock. */
  progress?: number
  estimated?: boolean
  url?: string
}

export type ChecksPanelLabels = {
  pill: (passed: number, total: number) => string
  status: (status: CheckStatus) => string
  listLabel: (sha: string) => string
  header: (sha: string, message: string) => string
  live: (passed: number, total: number) => string
  estimated: string
  waiting: string
  expand: string
  collapse: string
  seconds: (count: number) => string
  minutes: (minutes: number, seconds: number) => string
}

const statusEn: Record<CheckStatus, string> = {
  queued: "Queued",
  running: "Running",
  passed: "Passed",
  failed: "Failed",
  skipped: "Skipped",
  cancelled: "Cancelled",
}

const statusEs: Record<CheckStatus, string> = {
  queued: "En cola",
  running: "En curso",
  passed: "Pasó",
  failed: "Falló",
  skipped: "Omitida",
  cancelled: "Cancelada",
}

function durationEn(labels: ChecksPanelLabels, ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000))
  const minutes = Math.floor(seconds / 60)
  const rest = seconds % 60
  if (minutes <= 0) return labels.seconds(rest)
  return labels.minutes(minutes, rest)
}

export const checksPanelLabels: ChecksPanelLabels = {
  pill: (passed, total) => `Checks ${passed}/${total}`,
  status: (status) => statusEn[status],
  listLabel: (sha) => `Checks on ${sha}`,
  header: (sha, message) => `Checks on ${sha} ${message}`,
  live: (passed, total) => `${passed} of ${total} checks passed.`,
  estimated: "estimated",
  waiting: "waiting",
  expand: "Show checks",
  collapse: "Hide checks",
  seconds: (count) => `${count}s`,
  minutes: (minutes, seconds) => (seconds === 0 ? `${minutes}m` : `${minutes}m ${seconds}s`),
}

export const checksPanelLabelsEs: ChecksPanelLabels = {
  pill: (passed, total) => `Comprobaciones ${passed}/${total}`,
  status: (status) => statusEs[status],
  listLabel: (sha) => `Comprobaciones en ${sha}`,
  header: (sha, message) => `Comprobaciones en ${sha} ${message}`,
  live: (passed, total) => `${passed} de ${total} comprobaciones pasaron.`,
  estimated: "estimado",
  waiting: "en espera",
  expand: "Mostrar comprobaciones",
  collapse: "Ocultar comprobaciones",
  seconds: (count) => `${count} s`,
  minutes: (minutes, seconds) => (seconds === 0 ? `${minutes} min` : `${minutes} min ${seconds} s`),
}

export type ChecksPanelProps = {
  passed: number
  total: number
  sha: string
  message: string
  checks: readonly CheckItem[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  variant?: "rail" | "compact"
  labels?: ChecksPanelLabels
  className?: string
}

function StatusIcon({ status }: { status: CheckStatus }) {
  const className = "size-3.5 shrink-0"
  if (status === "passed") return <Check className={className} aria-hidden />
  if (status === "failed") return <X className={className} aria-hidden />
  if (status === "running") return <Loader2 className={cn(className, "animate-spin motion-reduce:animate-none")} aria-hidden />
  if (status === "skipped") return <CircleMinus className={className} aria-hidden />
  if (status === "cancelled") return <Ban className={className} aria-hidden />
  return <Circle className={className} aria-hidden />
}

function Meter({
  name,
  value,
  status,
  reduced,
}: {
  name: string
  value: number
  status: CheckStatus
  reduced: boolean
}) {
  const scale = Math.min(1, Math.max(0, value))
  return (
    <div
      role="meter"
      aria-label={name}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(scale * 100)}
      className="h-1.5 w-full overflow-hidden rounded-full bg-foreground/50"
    >
      <div
        data-bar
        className={cn(
          "h-full w-full origin-left bg-chart-2 transition-transform duration-200 motion-reduce:transition-none",
          status === "failed" && "bg-destructive",
        )}
        style={{ transform: `scaleX(${scale})`, transitionDuration: reduced ? "0ms" : "200ms" }}
      />
    </div>
  )
}

export function ChecksPanel({
  passed,
  total,
  sha,
  message,
  checks,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  variant = "rail",
  labels = checksPanelLabels,
  className,
}: ChecksPanelProps) {
  const reduced = useReducedMotion()
  const [uncontrolled, setUncontrolled] = React.useState(defaultOpen)
  const open = openProp ?? uncontrolled
  const panelId = React.useId()
  const setOpen = (next: boolean) => {
    onOpenChange?.(next)
    if (openProp === undefined) setUncontrolled(next)
  }
  const pill = labels.pill(passed, total)

  return (
    <div
      data-testid="checks-panel"
      data-variant={variant}
      data-motion={reduced ? "reduced" : "full"}
      className={cn("flex w-full min-w-0 flex-col items-start gap-2", className)}
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className="inline-flex max-w-full items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm text-foreground transition-[opacity,transform] duration-200 hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.98] motion-reduce:transition-none motion-reduce:active:scale-100"
      >
        <span className="truncate">{pill}</span>
        <span className="sr-only">{open ? labels.collapse : labels.expand}</span>
      </button>
      {open ? (
        <motion.div
          id={panelId}
          initial={reduced ? false : { opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduced ? { duration: 0 } : { duration: motionPresets.duration.standard, ease: motionPresets.ease.standard }}
          style={{ willChange: reduced ? "auto" : "transform, opacity" }}
          className="w-full min-w-0 rounded-xl border border-border bg-card p-3 shadow-sm"
        >
          <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-0.5">
            <p className="font-mono text-xs text-muted-foreground">{labels.listLabel(sha)}</p>
            <p className="min-w-0 truncate text-sm text-foreground" title={message}>
              {message}
            </p>
          </div>
          <ol
            aria-label={labels.listLabel(sha)}
            className={cn(
              "mt-3 flex max-h-80 min-w-0 flex-col gap-3 overflow-y-auto",
              variant === "compact" && "sm:grid sm:grid-cols-2",
            )}
          >
            {checks.map((check) => {
              const time =
                check.durationMs == null ? labels.waiting : durationEn(labels, check.durationMs)
              return (
                <li key={check.id} className="min-w-0">
                  <div className="flex min-w-0 flex-wrap items-center gap-2">
                    <StatusIcon status={check.status} />
                    {check.url ? (
                      <a href={check.url} className="min-w-0 text-sm break-all text-foreground underline-offset-2 hover:underline">
                        {check.name}
                      </a>
                    ) : (
                      <span className="min-w-0 text-sm break-all text-foreground">{check.name}</span>
                    )}
                    <span className={cn("text-xs", check.status === "failed" ? "text-destructive" : "text-muted-foreground")}>
                      {labels.status(check.status)}
                    </span>
                    <span className="ml-auto font-mono text-xs text-muted-foreground">
                      {time}
                      {check.estimated ? <span> {labels.estimated}</span> : null}
                    </span>
                  </div>
                  <div className="mt-1">
                    <Meter name={check.name} value={check.progress ?? 0} status={check.status} reduced={reduced} />
                  </div>
                </li>
              )
            })}
          </ol>
        </motion.div>
      ) : null}
      <p role="status" aria-live="polite" className="sr-only">
        {labels.live(passed, total)}
      </p>
    </div>
  )
}
