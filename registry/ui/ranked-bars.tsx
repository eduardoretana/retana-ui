"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"

import { cn } from "@/lib/utils"
import { formatDashboardValue, orderRanked, type DashboardFormat } from "@/registry/retana/lib/dashboard-format"

export type RankedBarItem = {
  id: string
  label: string
  value: number
  meta?: string
  /** Override the computed share (0–1). */
  share?: number
}

export type RankedBarsClassNames = {
  root?: string
  item?: string
  label?: string
  bar?: string
  value?: string
}

export type RankedBarsProps = {
  items: readonly RankedBarItem[]
  label?: string
  valueFormat?: DashboardFormat
  locale?: string
  currency?: string
  showPercent?: boolean
  max?: number
  highlight?: "first" | "none" | string
  sort?: "asc" | "desc" | "none"
  limit?: number
  moreLabel?: string
  lessLabel?: string
  onSelect?: (item: RankedBarItem) => void
  className?: string
  classNames?: RankedBarsClassNames
}

export function RankedBars({
  items,
  label = "Ranked values",
  valueFormat = "number",
  locale = "en-US",
  currency = "USD",
  showPercent,
  max,
  highlight = "first",
  sort = "desc",
  limit,
  moreLabel = "Show all",
  lessLabel = "Show less",
  onSelect,
  className,
  classNames,
  layout = "stacked",
}: RankedBarsProps & { layout?: "stacked" | "inline" }) {
  const [expanded, setExpanded] = React.useState(false)
  const ordered = orderRanked(items, sort)
  const visible = limit != null && !expanded ? ordered.slice(0, limit) : ordered
  const peak = max ?? Math.max(...ordered.map((item) => item.value), 0)
  const percentOn = showPercent ?? ordered.some((item) => item.share != null)

  return (
    <div data-slot="ranked-bars" className={cn("min-w-0", className, classNames?.root)}>
      <ol aria-label={label} className="flex flex-col gap-3">
        {visible.map((item, index) => {
          const ratio = peak > 0 ? Math.min(1, item.value / peak) : 0
          const emphasized = highlight === "first" ? index === 0 : highlight !== "none" && highlight === item.id
          const value = formatDashboardValue(item.value, valueFormat, locale, currency)
          const percent = formatDashboardValue(item.share ?? 0, "percent", locale)
          const summary = [item.label, item.meta, value, percentOn ? percent : null].filter(Boolean).join(", ")
          const bar = (
            <span className="block h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
              <span
                data-slot="ranked-bar-fill"
                className={cn(
                  "block h-full origin-left rounded-full motion-reduce:transition-none",
                  emphasized ? "bg-primary" : "bg-chart-3",
                  classNames?.bar,
                )}
                style={{ transform: `scaleX(${Math.max(ratio, 0.02)})` }}
              />
            </span>
          )
          const labelNode = (
            <span className={cn("min-w-0 truncate text-sm font-medium", classNames?.label)}>{item.label}</span>
          )
          const valueNode = (
            <span className={cn("inline-flex shrink-0 items-baseline gap-2 text-sm tabular-nums", classNames?.value)}>
              {item.meta ? <span className="text-muted-foreground">{item.meta} </span> : null}
              {percentOn ? <span className="font-medium">{percent}</span> : <span>{value}</span>}
            </span>
          )
          const inner =
            layout === "inline" ? (
              <span className="grid min-w-0 grid-cols-[minmax(0,35%)_minmax(0,1fr)_auto] items-center gap-3">
                {labelNode}
                {bar}
                {valueNode}
              </span>
            ) : (
              <span className="flex min-w-0 flex-col gap-1.5">
                <span className="flex min-w-0 items-baseline justify-between gap-3">
                  {labelNode}
                  {valueNode}
                </span>
                {bar}
              </span>
            )
          return (
            <li key={item.id} data-rank={index + 1}>
              {onSelect ? (
                <button
                  type="button"
                  className={cn(
                    "w-full rounded-lg text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    classNames?.item,
                  )}
                  aria-label={summary}
                  onClick={() => onSelect(item)}
                >
                  {inner}
                </button>
              ) : (
                <div className={classNames?.item} aria-label={summary}>
                  {inner}
                </div>
              )}
            </li>
          )
        })}
      </ol>
      {limit != null && ordered.length > limit ? (
        <button type="button" className="mt-3 text-sm text-muted-foreground underline-offset-2 hover:underline" onClick={() => setExpanded((value) => !value)}>
          {expanded ? lessLabel : moreLabel}
        </button>
      ) : null}
    </div>
  )
}
