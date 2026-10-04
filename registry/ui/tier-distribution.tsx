"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"

import { cn } from "@/lib/utils"
import { formatDashboardValue, shareOf } from "@/registry/retana/lib/dashboard-format"

export type TierTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "primary" | "destructive"

export type TierDistributionTier = {
  id: string
  label: string
  value: number
  tone?: TierTone
}

export type TierDistributionClassNames = {
  root?: string
  option?: string
  block?: string
  label?: string
  value?: string
}

export type TierDistributionProps = {
  tiers: readonly TierDistributionTier[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  label?: string
  locale?: string
  className?: string
  classNames?: TierDistributionClassNames
}

const toneClass: Record<TierTone, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
  primary: "bg-primary",
  destructive: "bg-destructive",
}

const fallbackTone: TierTone[] = ["chart-1", "chart-2", "chart-3", "chart-4"]

export function TierDistribution({
  tiers,
  value,
  defaultValue,
  onValueChange,
  label = "Distribution",
  locale = "en-US",
  className,
  classNames,
}: TierDistributionProps) {
  const list = tiers.slice(0, 4)
  const total = list.reduce((sum, tier) => sum + (Number.isFinite(tier.value) ? Math.max(0, tier.value) : 0), 0)
  const [internal, setInternal] = React.useState(defaultValue ?? list[0]?.id ?? "")
  const selected = value ?? internal
  const active = list.some((tier) => tier.id === selected) ? selected : list[0]?.id ?? ""

  function select(id: string) {
    if (value === undefined) setInternal(id)
    onValueChange?.(id)
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const keys = ["ArrowRight", "ArrowDown", "ArrowLeft", "ArrowUp", "Home", "End"]
    if (!keys.includes(event.key)) return
    if (!list.length) return
    event.preventDefault()
    const index = Math.max(0, list.findIndex((tier) => tier.id === active))
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? list.length - 1
          : event.key === "ArrowRight" || event.key === "ArrowDown"
            ? (index + 1) % list.length
            : (index - 1 + list.length) % list.length
    const id = list[next]?.id
    if (!id) return
    select(id)
    const node = event.currentTarget.querySelector<HTMLElement>(`[data-tier-id="${CSS.escape(id)}"]`)
    node?.focus()
  }

  return (
    <div
      data-slot="tier-distribution"
      role="radiogroup"
      aria-label={label}
      onKeyDown={onKeyDown}
      className={cn("@container flex min-w-0 flex-wrap items-end gap-2", className, classNames?.root)}
    >
      {list.length === 0 ? <p className="text-sm text-muted-foreground">No tiers</p> : null}
      {list.map((tier, index) => {
        const share = shareOf(Math.max(0, tier.value), total)
        const tone = tier.tone ?? fallbackTone[index % fallbackTone.length]
        const checked = tier.id === active
        const count = formatDashboardValue(tier.value, "number", locale)
        const percent = formatDashboardValue(share, "percent", locale)
        return (
          <button
            key={tier.id}
            type="button"
            role="radio"
            data-tier-id={tier.id}
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            onClick={() => select(tier.id)}
            style={{ flexGrow: Math.max(share, 0.2), flexBasis: "6.5rem" }}
            className={cn(
              "flex min-w-[6.5rem] flex-col gap-2 rounded-xl p-2 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              checked ? "bg-muted" : "hover:bg-muted/60",
              classNames?.option,
            )}
          >
            <span className="flex items-baseline justify-between gap-2">
              <span className={cn("text-sm font-medium break-words", classNames?.label)}>{tier.label}</span>
              <span className={cn("text-sm tabular-nums", classNames?.value)}>{count}</span>
            </span>
            <span
              data-slot="tier-distribution-block"
              className={cn(
                "block h-12 w-full min-w-2 rounded-md bg-gradient-to-t from-background/40 to-transparent",
                toneClass[tone],
                classNames?.block,
              )}
              aria-hidden
            />
            <span className="text-xs text-muted-foreground tabular-nums">{percent}</span>
          </button>
        )
      })}
    </div>
  )
}
