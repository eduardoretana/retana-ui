"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"

import { cn } from "@/lib/utils"

export const PRIORITY_LEVELS = ["low", "medium", "high", "critical"] as const

export type PriorityLevel = (typeof PRIORITY_LEVELS)[number]

export type PriorityBadgeClassNames = {
  root?: string
  glyph?: string
  label?: string
}

export type PriorityBadgeProps = {
  level: PriorityLevel
  label?: string
  variant?: "chip" | "glyph" | "pill"
  /** Pill only. Soft keeps a wash. Solid fills high and critical. */
  appearance?: "soft" | "solid"
  className?: string
  classNames?: PriorityBadgeClassNames
}

const DEFAULT_LABEL: Record<PriorityLevel, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  critical: "Critical",
}

export function priorityRank(level: PriorityLevel): number {
  return PRIORITY_LEVELS.indexOf(level) + 1
}

export function comparePriority(a: PriorityLevel, b: PriorityLevel): number {
  return priorityRank(a) - priorityRank(b)
}

function SignalGlyph({ filled, className }: { filled: number; className?: string }) {
  const heights = [4, 7, 10, 13]
  return (
    <svg viewBox="0 0 16 14" className={cn("h-3.5 w-4", className)} aria-hidden>
      {heights.map((height, index) => (
        <rect
          key={height}
          x={index * 4}
          y={14 - height}
          width="2.5"
          height={height}
          rx="0.5"
          className={index < filled ? "fill-current" : "fill-current opacity-30"}
        />
      ))}
    </svg>
  )
}

export function PriorityBadge({
  level,
  label,
  variant = "chip",
  appearance,
  className,
  classNames,
}: PriorityBadgeProps) {
  const text = label ?? DEFAULT_LABEL[level]
  const critical = level === "critical"
  if (variant === "pill") {
    const solid = appearance === "solid" || (appearance !== "soft" && (level === "high" || level === "critical"))
    return (
      <span
        data-slot="priority-badge"
        data-level={level}
        data-variant="pill"
        className={cn(
          "inline-flex h-6 max-w-full items-center rounded-full px-2 text-xs font-medium",
          solid && (level === "high" || level === "critical") && "bg-destructive text-background",
          solid && level !== "high" && level !== "critical" && "bg-foreground text-background",
          !solid && (level === "critical" || level === "high") && "bg-destructive/10 text-destructive",
          !solid && level === "medium" && "bg-chart-4/15 text-foreground",
          !solid && level === "low" && "bg-muted text-foreground",
          className,
          classNames?.root,
        )}
      >
        <span className={cn("truncate", classNames?.label)}>{text}</span>
      </span>
    )
  }
  if (variant === "glyph") {
    return (
      <span className={cn("inline-flex text-foreground", critical && "text-destructive", className, classNames?.root)} aria-label={text}>
        <SignalGlyph filled={priorityRank(level)} className={classNames?.glyph} />
      </span>
    )
  }
  return (
    <span
      data-slot="priority-badge"
      data-level={level}
      className={cn(
        "inline-flex h-6 max-w-full items-center gap-1 rounded-full px-2 text-xs font-medium",
        critical ? "bg-destructive/10 text-destructive" : "bg-muted text-foreground",
        className,
        classNames?.root,
      )}
    >
      <SignalGlyph filled={priorityRank(level)} className={classNames?.glyph} />
      <span className={cn("truncate", classNames?.label)}>{text}</span>
    </span>
  )
}
