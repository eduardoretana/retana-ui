"use client"

/**
 * Clean-room merge control.
 * Idea only, no license.
 * Disabled until the host says checks passed. The first click asks.
 * `onMerge` runs only from the confirm control.
 */

import * as React from "react"
import { Check, GitMerge, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

import { useReducedMotion } from "./use-reduced-motion"

export type MergePhase = "disabled" | "ready" | "confirming" | "merging" | "merged" | "rejected"

export type MergeButtonLabels = {
  merge: string
  confirm: string
  cancel: string
  merging: string
  merged: string
  allPassed: string
  waiting: string
  rejected: string
  live: (phase: MergePhase) => string
}

export const mergeButtonLabels: MergeButtonLabels = {
  merge: "Merge",
  confirm: "Confirm merge into main",
  cancel: "Cancel",
  merging: "Merging",
  merged: "Merged into main",
  allPassed: "All checks passed",
  waiting: "Waiting for checks",
  rejected: "Branch protection rejected the merge",
  live: (phase) => {
    if (phase === "merged") return "Merged into main"
    if (phase === "merging") return "Merging"
    if (phase === "ready" || phase === "confirming") return "All checks passed"
    if (phase === "rejected") return "Branch protection rejected the merge"
    return "Waiting for checks"
  },
}

export const mergeButtonLabelsEs: MergeButtonLabels = {
  merge: "Fusionar",
  confirm: "Confirmar fusión en main",
  cancel: "Cancelar",
  merging: "Fusionando",
  merged: "Fusionado en main",
  allPassed: "Todas las comprobaciones pasaron",
  waiting: "Esperando las comprobaciones",
  rejected: "La protección de la rama rechazó la fusión",
  live: (phase) => {
    if (phase === "merged") return "Fusionado en main"
    if (phase === "merging") return "Fusionando"
    if (phase === "ready" || phase === "confirming") return "Todas las comprobaciones pasaron"
    if (phase === "rejected") return "La protección de la rama rechazó la fusión"
    return "Esperando las comprobaciones"
  },
}

export type MergeButtonProps = {
  phase: MergePhase
  onMerge?: () => void
  onCancel?: () => void
  reason?: string
  /** Replaces the default status sentence. One line, not a second status. */
  statusLabel?: string
  variant?: "rail" | "compact"
  labels?: MergeButtonLabels
  className?: string
}

export function MergeButton({
  phase,
  onMerge,
  onCancel,
  reason,
  statusLabel,
  variant = "rail",
  labels = mergeButtonLabels,
  className,
}: MergeButtonProps) {
  const reduced = useReducedMotion()
  const statusId = React.useId()
  const [asking, setAsking] = React.useState(false)
  const [seenPhase, setSeenPhase] = React.useState(phase)
  const confirmRef = React.useRef<HTMLButtonElement>(null)
  if (seenPhase !== phase) {
    setSeenPhase(phase)
    if (phase !== "ready") setAsking(false)
  }
  const showConfirm = phase === "ready" && asking

  React.useEffect(() => {
    if (showConfirm) confirmRef.current?.focus()
  }, [showConfirm])

  function cancel() {
    setAsking(false)
    onCancel?.()
  }

  const statusText =
    phase === "merged"
      ? labels.merged
      : phase === "merging"
        ? labels.merging
        : phase === "ready"
          ? labels.allPassed
          : phase === "rejected"
            ? labels.rejected
            : (statusLabel ?? labels.waiting)

  return (
    <div
      data-testid="merge-button"
      data-variant={variant}
      data-motion={reduced ? "reduced" : "full"}
      className={cn("flex min-w-0 flex-col items-start gap-2", className)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && showConfirm) {
          event.preventDefault()
          cancel()
        }
      }}
    >
      {phase === "rejected" ? (
        <p id={statusId} role="alert" className="text-sm break-words text-destructive">
          {labels.rejected}
          {reason ? ` ${reason}` : null}
        </p>
      ) : phase === "merged" ? (
        <p id={statusId} role="status" aria-live="polite" className="inline-flex items-center gap-1.5 text-sm text-foreground">
          <Check className="size-3.5" aria-hidden />
          {labels.merged}
        </p>
      ) : (
        <p id={statusId} role="status" aria-live="polite" className={cn("text-sm text-foreground", variant === "compact" && phase === "ready" && "sr-only")}>
          {statusText}
        </p>
      )}
      {phase === "merged" ? null : (
        <div className="flex flex-wrap items-center gap-2">
          {showConfirm ? (
            <>
              <Button ref={confirmRef} type="button" aria-describedby={statusId} onClick={() => onMerge?.()}>
                <GitMerge aria-hidden />
                {labels.confirm}
              </Button>
              <Button type="button" variant="outline" onClick={cancel}>
                {labels.cancel}
              </Button>
            </>
          ) : (
            <Button
              type="button"
              disabled={phase === "disabled" || phase === "merging" || phase === "rejected"}
              aria-describedby={statusId}
              aria-busy={phase === "merging" || undefined}
              onClick={() => {
                if (phase !== "ready") return
                setAsking(true)
              }}
            >
              {phase === "merging" ? <Loader2 className="animate-spin motion-reduce:animate-none" aria-hidden /> : <GitMerge aria-hidden />}
              {variant === "compact" && phase === "ready" ? `${labels.allPassed}. ${labels.merge}` : phase === "merging" ? labels.merging : labels.merge}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
