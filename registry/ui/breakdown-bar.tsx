"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { formatDashboardValue, shareOf, type DashboardFormat } from "@/registry/retana/lib/dashboard-format"

export type BreakdownSegment = {
  id: string
  label: string
  value: number
}

export type BreakdownBarClassNames = {
  root?: string
  total?: string
  track?: string
  legend?: string
}

export type BreakdownBarProps = {
  total: number
  segments: readonly BreakdownSegment[]
  label?: string
  format?: DashboardFormat
  locale?: string
  currency?: string
  /** legend is the default list. pipeline draws gapped stages with counts underneath. */
  variant?: "legend" | "pipeline"
  /** Segment index drawn in the accent. The last segment stays inverted. */
  emphasis?: number
  heading?: string
  caption?: string
  action?: { label: string; onSelect: () => void }
  className?: string
  classNames?: BreakdownBarClassNames
}

const segmentClass = ["bg-primary", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"]

export function BreakdownBar({
  total,
  segments,
  label = "Breakdown",
  format = "currency",
  locale = "en-US",
  currency = "USD",
  variant = "legend",
  emphasis,
  heading,
  caption,
  action,
  className,
  classNames,
}: BreakdownBarProps) {
  const reduced = useReducedMotion() ?? false
  const [active, setActive] = React.useState<string | null>(null)
  const sum = segments.reduce((acc, segment) => acc + Math.max(0, segment.value), 0)
  const basis = sum > 0 ? sum : Math.max(total, 0)
  const summary = segments
    .map((segment) => `${segment.label} ${formatDashboardValue(segment.value, format, locale, currency)}`)
    .join(", ")

  if (variant === "pipeline") {
    return (
      <div data-slot="breakdown-bar" data-variant="pipeline" className={cn("flex min-w-0 flex-col gap-3", className, classNames?.root)}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium">{heading ?? label}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {caption ? <span>{caption}</span> : null}
            {action ? (
              <button type="button" className="font-medium text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={action.onSelect}>
                {action.label}
              </button>
            ) : null}
          </div>
        </div>
        <div role="img" aria-label={`${label}: ${summary}`} className={cn("flex h-3 gap-1", classNames?.track)}>
          {segments.map((segment, index) => {
            const share = shareOf(Math.max(0, segment.value), basis)
            const last = index === segments.length - 1
            const hot = emphasis === index
            return (
              <span
                key={segment.id}
                data-segment={segment.id}
                className="h-full min-w-1 origin-left"
                style={{ width: `${Math.max(share * 100, share > 0 ? 6 : 0)}%` }}
              >
                <span
                  className={cn(
                    "block h-full rounded-full motion-safe:animate-in motion-safe:slide-in-from-left-2",
                    reduced && "animate-none",
                    hot ? "bg-primary" : last ? "bg-foreground" : "bg-muted-foreground/25",
                  )}
                />
              </span>
            )
          })}
        </div>
        <div className="flex gap-1">
          {segments.map((segment) => {
            const share = shareOf(Math.max(0, segment.value), basis)
            return (
              <div key={segment.id} className="min-w-0" style={{ width: `${Math.max(share * 100, share > 0 ? 6 : 0)}%` }}>
                <p className="font-mono text-sm tabular-nums">{formatDashboardValue(segment.value, "number", locale)}</p>
                <p className="truncate text-[10px] text-muted-foreground">{segment.label}</p>
              </div>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div data-slot="breakdown-bar" className={cn("flex min-w-0 flex-col gap-3", className, classNames?.root)}>
      <p className={cn("text-4xl font-normal tabular-nums tracking-tight break-words", classNames?.total)}>
        {formatDashboardValue(total, format, locale, currency)}
      </p>
      <div
        data-slot="breakdown-track"
        role="img"
        aria-label={`${label}: ${summary}`}
        className={cn("flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted", classNames?.track)}
      >
        {segments.map((segment, index) => {
          const share = shareOf(Math.max(0, segment.value), basis)
          const dim = active != null && active !== segment.id
          return (
            <span
              key={segment.id}
              data-segment={segment.id}
              data-dim={dim ? "true" : undefined}
              className={cn("h-full min-w-1 rounded-full transition-opacity motion-reduce:transition-none data-[dim=true]:opacity-40", segmentClass[index % segmentClass.length])}
              style={{ width: `${Math.max(share * 100, share > 0 ? 4 : 0)}%` }}
            />
          )
        })}
      </div>
      <ul className={cn("flex flex-col", classNames?.legend)}>
        {segments.map((segment, index) => {
          const share = shareOf(Math.max(0, segment.value), basis)
          const dim = active != null && active !== segment.id
          return (
            <li key={segment.id}>
              <button
                type="button"
                className="flex w-full items-center gap-2 rounded-md py-1.5 text-start text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-pressed={active === segment.id}
                onMouseEnter={() => setActive(segment.id)}
                onMouseLeave={() => setActive(null)}
                onFocus={() => setActive(segment.id)}
                onBlur={() => setActive(null)}
              >
                <span className={cn("size-2 shrink-0 rounded-full", segmentClass[index % segmentClass.length])} aria-hidden />
                <span className={cn("min-w-0 flex-1 truncate", dim && "opacity-40")}>{segment.label}</span>
                <span className="shrink-0 tabular-nums">
                  {formatDashboardValue(segment.value, format, locale, currency)}
                  <span className="ms-2 text-muted-foreground">{formatDashboardValue(share, "percent", locale)}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
