"use client"

/** Domain-agnostic status chip. Tones map to host tokens. */

import * as React from "react"

import { cn } from "@/lib/utils"
import type { StatusTone } from "@/registry/retana/lib/status-tone"

export type { StatusTone }

export type StatusPillAppearance = "soft" | "outline" | "text" | "solid"

export type StatusPillProps = {
  label: string
  tone?: StatusTone
  /** Solid fill. Critical becomes destructive; other tones use foreground. */
  solid?: boolean
  /** Soft wash, outline, plain text, or solid. `solid` still wins when that prop is set. */
  appearance?: StatusPillAppearance
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

const outline: Record<StatusTone, string> = {
  neutral: "border border-border bg-transparent text-foreground",
  accent: "border border-primary/40 bg-transparent text-foreground",
  warning: "border border-chart-4/50 bg-transparent text-foreground",
  critical: "border border-destructive/40 bg-transparent text-destructive",
  info: "border border-chart-2/40 bg-transparent text-foreground",
  positive: "border border-primary/40 bg-transparent text-foreground",
}

const textOnly: Record<StatusTone, string> = {
  neutral: "bg-transparent text-muted-foreground",
  accent: "bg-transparent text-foreground",
  warning: "bg-transparent text-foreground",
  critical: "bg-transparent text-destructive",
  info: "bg-transparent text-foreground",
  positive: "bg-transparent text-foreground",
}

export function StatusPill({
  label,
  tone = "neutral",
  solid = false,
  appearance,
  dot = true,
  overlay = false,
  icon,
  className,
}: StatusPillProps) {
  const look = solid ? "solid" : appearance ?? "soft"
  const surface = overlay
    ? "bg-card/95 text-card-foreground"
    : look === "solid"
      ? tone === "critical"
        ? "bg-destructive text-background"
        : "bg-foreground text-background"
      : look === "outline"
        ? outline[tone]
        : look === "text"
          ? textOnly[tone]
          : soft[tone]
  return (
    <span
      data-slot="status-pill"
      data-tone={tone}
      data-appearance={look}
      data-solid={look === "solid" ? "" : undefined}
      className={cn(
        "inline-flex h-6 max-w-full items-center gap-1.5 rounded-full px-2 text-xs font-medium",
        look === "text" && "h-auto rounded-none px-0",
        surface,
        className,
      )}
    >
      {dot ? <span aria-hidden className={cn("size-1.5 shrink-0 rounded-full", solid || overlay ? "bg-current" : dots[tone])} /> : null}
      {icon}
      <span className="truncate">{label}</span>
    </span>
  )
}
