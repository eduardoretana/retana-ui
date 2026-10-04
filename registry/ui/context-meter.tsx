"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/local-first/context-usage-meter/context-usage-meter.tsx

import * as React from "react"

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"

export type ContextUsage = {
  input?: number
  output?: number
  reasoning?: number
  cached?: number
}

export type ContextMeterClassNames = {
  root?: string
  trigger?: string
  content?: string
  bar?: string
  row?: string
}

export type ContextMeterProps = {
  used: number
  contextWindow: number
  usage?: ContextUsage
  warnThreshold?: number
  costPerToken?: number
  formatCost?: (cost: number) => string
  locale?: string
  label?: string
  className?: string
  classNames?: ContextMeterClassNames
}

export function formatCompact(value: number, locale = "en") {
  return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

function Ring({ ratio, warn, over, size = 16 }: { ratio: number; warn: boolean; over: boolean; size?: number }) {
  const stroke = 2
  const radius = (size - stroke) / 2
  const turn = Math.min(Math.max(ratio, 0), 1)
  const color = over ? "var(--destructive)" : warn ? "var(--accent-foreground)" : "var(--primary)"
  return (
    <span
      aria-hidden="true"
      className="inline-block shrink-0 rounded-full"
      style={{
        width: size,
        height: size,
        background: `conic-gradient(${color} ${turn}turn, var(--muted) 0)`,
      }}
    >
      <span className="sr-only" style={{ width: radius }} />
    </span>
  )
}

export function ContextMeterTrigger({
  used,
  contextWindow,
  warnThreshold = 0.8,
  locale = "en",
  className,
  ref,
}: Pick<ContextMeterProps, "used" | "contextWindow" | "warnThreshold" | "locale" | "className"> & {
  ref?: React.Ref<HTMLButtonElement>
}) {
  const ratio = contextWindow > 0 ? used / contextWindow : 0
  const percent = Math.round(ratio * 100)
  const warn = ratio >= warnThreshold && ratio < 1
  const over = ratio >= 1
  const label = `Context used: ${percent}%, ${used.toLocaleString(locale)} of ${contextWindow.toLocaleString(locale)} tokens`
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        over ? "text-destructive" : warn ? "text-accent-foreground" : "text-foreground",
        className,
      )}
    >
      <Ring ratio={ratio} warn={warn} over={over} />
      <span className="tabular-nums">{percent}%</span>
    </button>
  )
}

export function ContextMeterRow({ label, value, locale = "en", className }: { label: string; value: number; locale?: string; className?: string }) {
  return (
    <div className={cn("flex items-center justify-between gap-3 text-sm", className)}>
      <span className="text-muted-foreground">{label}</span>
      <span className="font-mono text-foreground tabular-nums">{formatCompact(value, locale)}</span>
    </div>
  )
}

export function ContextMeterContent({
  used,
  contextWindow,
  usage,
  warnThreshold = 0.8,
  costPerToken,
  formatCost,
  locale = "en",
  className,
}: ContextMeterProps) {
  const ratio = contextWindow > 0 ? used / contextWindow : 0
  const percent = Math.round(Math.min(ratio, 1) * 100)
  const over = ratio >= 1
  const warn = ratio >= warnThreshold
  const cost = costPerToken != null ? used * costPerToken : undefined
  return (
    <div className={cn("flex w-64 flex-col gap-2", className)}>
      <div className="flex items-baseline justify-between gap-2">
        <p className="font-medium text-foreground">Context window</p>
        <p className="text-xs text-muted-foreground tabular-nums">
          {formatCompact(used, locale)} / {formatCompact(contextWindow, locale)} tokens
        </p>
      </div>
      <div
        role="meter"
        aria-valuemin={0}
        aria-valuemax={contextWindow}
        aria-valuenow={Math.min(used, contextWindow)}
        aria-valuetext={`${formatCompact(used, locale)} of ${formatCompact(contextWindow, locale)} tokens`}
        className="h-1.5 overflow-hidden rounded-full bg-muted"
      >
        <div className={cn("h-full rounded-full", over ? "bg-destructive" : warn ? "bg-accent" : "bg-primary")} style={{ width: `${percent}%` }} />
      </div>
      {usage?.input != null ? <ContextMeterRow label="Input" value={usage.input} locale={locale} /> : null}
      {usage?.output != null ? <ContextMeterRow label="Output" value={usage.output} locale={locale} /> : null}
      {usage?.reasoning != null ? <ContextMeterRow label="Reasoning" value={usage.reasoning} locale={locale} /> : null}
      {usage?.cached != null ? <ContextMeterRow label="Cached" value={usage.cached} locale={locale} /> : null}
      {cost != null ? (
        <ContextMeterRow label="Cost" value={0} locale={locale} className="sr-only" />
      ) : null}
      {cost != null ? <p className="text-xs text-muted-foreground">{formatCost ? formatCost(cost) : cost.toLocaleString(locale, { style: "currency", currency: "USD" })}</p> : null}
    </div>
  )
}

export function ContextMeter({ className, classNames, label, ...props }: ContextMeterProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <ContextMeterTrigger {...props} className={cn(className, classNames?.root, classNames?.trigger)} />
      </PopoverTrigger>
      <PopoverContent className={classNames?.content} aria-label={label ?? "Context window"}>
        <ContextMeterContent {...props} className={classNames?.content} />
      </PopoverContent>
    </Popover>
  )
}
