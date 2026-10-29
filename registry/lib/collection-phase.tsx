"use client"

import { cn } from "@/lib/utils"

/** How a piece that lists records is getting its data. */
export type CollectionPhase = "ready" | "loading" | "empty" | "error"

const fallback = {
  loading: "Loading",
  empty: "Nothing here yet",
  error: "Something went wrong",
} as const

export function CollectionPhaseNotice({
  phase,
  label,
  className,
}: {
  phase: Exclude<CollectionPhase, "ready">
  label?: string
  className?: string
}) {
  const error = phase === "error"
  return (
    <p
      role={error ? "alert" : "status"}
      aria-busy={phase === "loading" || undefined}
      data-phase={phase}
      className={cn("text-sm text-pretty", error ? "text-destructive" : "text-muted-foreground", className)}
    >
      {label ?? fallback[phase]}
    </p>
  )
}
