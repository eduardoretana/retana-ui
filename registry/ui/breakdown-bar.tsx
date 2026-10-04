"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"

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
  className,
  classNames,
}: BreakdownBarProps) {
  const [active, setActive] = React.useState<string | null>(null)
  const sum = segments.reduce((acc, segment) => acc + Math.max(0, segment.value), 0)
  const basis = sum > 0 ? sum : Math.max(total, 0)
  const summary = segments
    .map((segment) => `${segment.label} ${formatDashboardValue(segment.value, format, locale, currency)}`)
    .join(", ")

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
