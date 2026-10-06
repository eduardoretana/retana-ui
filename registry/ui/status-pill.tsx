"use client"

/** Domain-agnostic status chip. Tones map to host tokens. */

import * as React from "react"

import { cn } from "@/lib/utils"
import type { StatusTone } from "@/registry/retana/lib/status-tone"

export type { StatusTone }

export type StatusPillProps = {
  label: string
  tone?: StatusTone
  /** Solid fill. Critical becomes destructive; other tones use foreground. */
  solid?: boolean
  dot?: boolean
  /** Sits on a photo: card surface, no tone wash. */
  overlay?: boolean
  icon?: React.ReactNode
  className?: string
}

const soft: Record<StatusTone, string> = {
  neutral: "bg-muted text-foreground",
  accent: "bg-primary/15 text-foreground",
  warning: "bg-chart-4/15 text-foreground",
  critical: "bg-destructive/10 text-destructive",
  info: "bg-chart-2/15 text-foreground",
  positive: "bg-primary/15 text-foreground",
}

const dots: Record<StatusTone, string> = {
  neutral: "bg-muted-foreground",
  accent: "bg-primary",
  warning: "bg-chart-4",
  critical: "bg-destructive",
  info: "bg-chart-2",
  positive: "bg-primary",
}

export function StatusPill({
  label,
  tone = "neutral",
  solid = false,
  dot = true,
  overlay = false,
  icon,
  className,
}: StatusPillProps) {
  const surface = overlay
    ? "bg-card/95 text-card-foreground"
    : solid
      ? tone === "critical"
        ? "bg-destructive text-background"
        : "bg-foreground text-background"
      : soft[tone]
  return (
    <span
      data-slot="status-pill"
      data-tone={tone}
      data-solid={solid ? "" : undefined}
      className={cn("inline-flex h-6 max-w-full items-center gap-1.5 rounded-full px-2 text-xs font-medium", surface, className)}
    >
      {dot ? <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", solid || overlay ? "bg-current" : dots[tone])} /> : null}
      {icon}
      <span className="truncate">{label}</span>
    </span>
  )
}
