"use client"

/** KPI strip meant to sit above a table. Figures come from stat-strip. */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { sparklinePoints } from "@/registry/retana/lib/data-table-reorder"
import { StatStrip, type StatStripItem, type StatStripProps } from "@/registry/retana/ui/stat-strip"

export type TableSummaryItem = StatStripItem & {
  sparkline?: readonly number[]
  /** Names the trend. Required when a sparkline is set, so the line is not the only signal. */
  sparklineLabel?: string
}

export type TableSummaryStripLabels = {
  loading?: string
  retry?: string
}

export type TableSummaryStripProps = Omit<StatStripProps, "items" | "renderExtra"> & {
  items?: readonly TableSummaryItem[]
  loading?: boolean
  /** Replaces the figures with an alert and an optional retry. */
  error?: string
  onRetry?: () => void
  /**
   * `hide` removes the strip when there are no items, or every value is empty.
   * `show` keeps explicit zeros on screen.
   */
  empty?: "hide" | "show"
  /** Optional slot under each item, beside the sparkline when one is set. */
  renderItem?: (item: TableSummaryItem) => React.ReactNode
  labels?: TableSummaryStripLabels
}

function isBlank(item: TableSummaryItem) {
  if (item.sparkline?.some((value) => value !== 0)) return false
  if (typeof item.value === "number") return item.value === 0 && !item.delta
  const text = String(item.value).trim()
  return text === "" || text === "0"
}

function SummarySparkline({ values, label }: { values: readonly number[]; label: string }) {
  const points = sparklinePoints(values, 72, 20)
  if (!points) return null
  return (
    <svg viewBox="0 0 72 20" role="img" aria-label={label} className="h-5 w-16 max-w-full text-primary">
      <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  )
}

export function TableSummaryStrip({
  items = [],
  loading = false,
  error,
  onRetry,
  empty = "hide",
  renderItem,
  labels,
  variant = "inline",
  locale = "en-US",
  className,
  classNames,
}: TableSummaryStripProps) {
  const loadingLabel = labels?.loading ?? "Loading"
  const retryLabel = labels?.retry ?? "Retry"
  const blank = items.length === 0 || items.every(isBlank)
  const hide = !loading && !error && empty === "hide" && blank

  if (hide) return null

  if (loading) {
    const count = Math.max(items.length, 3)
    return (
      <div
        data-slot="table-summary-strip"
        data-state="loading"
        role="status"
        aria-busy="true"
        aria-live="polite"
        className={cn("flex min-w-0 max-w-full flex-wrap gap-x-6 gap-y-3", className)}
      >
        <p className="w-full text-sm text-muted-foreground">{loadingLabel}</p>
        {Array.from({ length: count }, (_, index) => (
          <div key={index} className="min-w-0 basis-36">
            <Skeleton aria-hidden className="h-3 w-16 motion-reduce:animate-none" />
            <Skeleton aria-hidden className="mt-2 h-8 w-24 motion-reduce:animate-none" />
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div data-slot="table-summary-strip" data-state="error" role="alert" className={cn("flex min-w-0 max-w-full flex-wrap items-center gap-2", className)}>
        <p className="min-w-0 text-sm text-destructive">{error}</p>
        {onRetry ? (
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            {retryLabel}
          </Button>
        ) : null}
      </div>
    )
  }

  return (
    <div data-slot="table-summary-strip" data-state={blank ? "empty" : "filled"} className="min-w-0 max-w-full">
      <StatStrip
        items={items}
        variant={variant}
        locale={locale}
        className={className}
        classNames={{
          ...classNames,
          item: cn("max-w-full", classNames?.item),
        }}
        renderExtra={(item) => {
          const summaryItem = item as TableSummaryItem
          const spark = summaryItem.sparkline?.length ? (
            <SummarySparkline values={summaryItem.sparkline} label={summaryItem.sparklineLabel ?? summaryItem.label} />
          ) : null
          const slot = renderItem?.(summaryItem)
          if (!spark && !slot) return null
          return (
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              {spark}
              {slot}
            </div>
          )
        }}
      />
    </div>
  )
}
