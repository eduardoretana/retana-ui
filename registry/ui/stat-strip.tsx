"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { formatDashboardValue, type DashboardFormat } from "@/registry/retana/lib/dashboard-format"

export type StatDelta = {
  value: number
  format?: DashboardFormat
  /** Visual arrow. Inferred from the sign when omitted. */
  direction?: "up" | "down"
  /** Which direction counts as an improvement. */
  good?: "up" | "down"
  label?: string
}

export type StatStripItem = {
  id: string
  label: string
  value: number | string
  format?: DashboardFormat
  currency?: string
  delta?: StatDelta
  caption?: string
}

export type StatStripClassNames = {
  root?: string
  item?: string
  label?: string
  value?: string
  delta?: string
  caption?: string
}

export type StatStripProps = {
  items: readonly StatStripItem[]
  variant?: "inline" | "panel"
  locale?: string
  className?: string
  classNames?: StatStripClassNames
}

function deltaDirection(delta: StatDelta): "up" | "down" {
  if (delta.direction) return delta.direction
  return delta.value < 0 ? "down" : "up"
}

function deltaIsGood(delta: StatDelta): boolean {
  const direction = deltaDirection(delta)
  return direction === (delta.good ?? "up")
}

function deltaText(delta: StatDelta, locale: string): string {
  if (delta.label) return delta.label
  return formatDashboardValue(delta.value, delta.format ?? "number", locale)
}

export function statAccessibleName(item: StatStripItem, locale: string): string {
  const value = formatDashboardValue(item.value, item.format ?? "text", locale, item.currency)
  if (!item.delta) return [item.label, value, item.caption].filter(Boolean).join(", ")
  const direction = deltaDirection(item.delta)
  const quality = deltaIsGood(item.delta) ? "better" : "worse"
  return [item.label, value, direction, deltaText(item.delta, locale), item.caption, quality].filter(Boolean).join(", ")
}

export function StatStrip({ items, variant = "inline", locale = "en-US", className, classNames }: StatStripProps) {
  return (
    <div
      data-slot="stat-strip"
      data-variant={variant}
      className={cn(
        "@container min-w-0",
        variant === "panel"
          ? "grid grid-cols-1 overflow-hidden rounded-xl bg-card text-card-foreground @min-[16rem]:grid-cols-2 @min-[36rem]:grid-cols-4"
          : "flex min-w-0 flex-wrap gap-x-6 gap-y-3",
        className,
        classNames?.root,
      )}
    >
      {items.map((item, index) => {
        const value = formatDashboardValue(item.value, item.format ?? "text", locale, item.currency)
        const direction = item.delta ? deltaDirection(item.delta) : null
        const good = item.delta ? deltaIsGood(item.delta) : false
        const Icon = direction === "down" ? ArrowDownRight : ArrowUpRight
        return (
          <div
            key={item.id}
            data-slot="stat-strip-item"
            className={cn(
              "min-w-0",
              variant === "inline" && "min-w-36 shrink-0",
              variant === "panel" && "border-border px-4 py-3 @min-[16rem]:border-s @min-[16rem]:[&:nth-child(2n+1)]:border-s-0 @min-[36rem]:[&:nth-child(2n+1)]:border-s @min-[36rem]:first:border-s-0",
              variant === "panel" && index > 0 && "border-t @min-[16rem]:border-t-0",
              classNames?.item,
            )}
          >
            <p className={cn("text-xs text-muted-foreground", classNames?.label)}>{item.label}</p>
            <p className={cn("mt-1 flex flex-wrap items-center gap-2 text-3xl font-normal tabular-nums tracking-tight", classNames?.value)}>
              <span className="break-words">{value}</span>
              {item.delta && direction ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-0.5 text-sm tabular-nums",
                    good ? "text-foreground" : "text-destructive",
                    classNames?.delta,
                  )}
                >
                  <span className={cn("grid size-5 place-items-center rounded-full", good ? "bg-chart-2/20" : "bg-destructive/10")} aria-hidden>
                    <Icon className="size-3.5" />
                  </span>
                  {deltaText(item.delta, locale)}
                </span>
              ) : null}
            </p>
            {item.caption ? <p className={cn("mt-1 text-xs text-muted-foreground", classNames?.caption)}>{item.caption}</p> : null}
            <span className="sr-only">{statAccessibleName(item, locale)}</span>
          </div>
        )
      })}
    </div>
  )
}
