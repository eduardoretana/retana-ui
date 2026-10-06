"use client"

/** Inverted assistant card. Body is bullets, a status, stats, or a checklist. */

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { StatusTone } from "@/registry/retana/lib/status-tone"
import { ConfidenceBadge } from "@/registry/retana/ui/confidence-badge"

export type InsightBullet = { id: string; tone?: StatusTone; text: string }
export type InsightStat = { label: string; value: string; tone?: StatusTone }
export type InsightCheck = { id: string; label: string }

export type InsightCardProps = {
  title: string
  time?: string
  icon?: React.ReactNode
  headline?: string
  body?: React.ReactNode
  variant?: "bullets" | "status" | "stats" | "checklist"
  bullets?: readonly InsightBullet[]
  confidence?: number
  confidenceLabel?: string
  stats?: readonly InsightStat[]
  checks?: readonly InsightCheck[]
  actionLabel?: string
  onAction?: () => void
  className?: string
}

const bulletDot: Record<StatusTone, string> = {
  neutral: "bg-background/50",
  accent: "bg-primary",
  warning: "bg-chart-4",
  critical: "bg-destructive",
  info: "bg-chart-2",
  positive: "bg-primary",
}

export function InsightCard({
  title,
  time,
  icon,
  headline,
  body,
  variant = "status",
  bullets = [],
  confidence,
  confidenceLabel = "Confidence",
  stats = [],
  checks = [],
  actionLabel,
  onAction,
  className,
}: InsightCardProps) {
  return (
    <section
      data-slot="insight-card"
      data-variant={variant}
      className={cn("flex min-w-0 flex-col gap-3 rounded-2xl bg-foreground p-4 text-background", className)}
    >
      <header className="flex items-center gap-2">
        {icon ? (
          <span aria-hidden className="grid size-7 place-items-center rounded-full bg-background/10 text-background [&_svg]:size-3.5">
            {icon}
          </span>
        ) : null}
        <p className="min-w-0 flex-1 truncate text-sm font-medium">{title}</p>
        {time ? <p className="shrink-0 font-mono text-xs text-background/60">{time}</p> : null}
      </header>
      {headline ? <p className="text-base font-medium wrap-break-word">{headline}</p> : null}
      {body ? <div className="text-sm text-background/70 wrap-break-word">{body}</div> : null}
      {variant === "bullets" && bullets.length ? (
        <ul className="flex flex-col gap-2">
          {bullets.map((bullet) => (
            <li key={bullet.id} className="flex items-start gap-2 text-sm">
              <span aria-hidden className={cn("mt-1.5 size-1.5 shrink-0 rounded-full", bulletDot[bullet.tone ?? "accent"])} />
              <span className="min-w-0 wrap-break-word">{bullet.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {variant === "status" && confidence != null ? (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2 text-xs">
            <span className="text-background/70">{confidenceLabel}</span>
            <span className="font-mono text-primary">{Math.round(confidence * 100)}%</span>
          </div>
          <ConfidenceBadge score={confidence} variant="dots" className="text-background" />
        </div>
      ) : null}
      {variant === "stats" && stats.length ? (
        <dl className="flex flex-col">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-baseline justify-between gap-3 border-t border-background/15 py-2 text-sm first:border-t-0">
              <dt className="text-background/70">{stat.label}</dt>
              <dd className={cn("font-mono", stat.tone === "accent" || stat.tone === "critical" ? "text-primary" : "text-background")}>
                {stat.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {variant === "checklist" && checks.length ? (
        <ul className="flex flex-col gap-2">
          {checks.map((check) => (
            <li key={check.id} className="flex items-start gap-2 text-sm">
              <span aria-hidden className="mt-0.5 grid size-4 shrink-0 place-items-center rounded-full bg-primary text-[10px] text-primary-foreground">
                ✓
              </span>
              <span className="min-w-0 wrap-break-word">{check.label}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {actionLabel ? (
        <Button type="button" className="w-full rounded-full" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  )
}
