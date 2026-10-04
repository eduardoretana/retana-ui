"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"

import { cn } from "@/lib/utils"
import { clampRatio, formatDashboardValue, type DashboardFormat } from "@/registry/retana/lib/dashboard-format"

export type RadialGaugeTone = "primary" | "neutral" | "destructive"

export type RadialGaugeClassNames = {
  root?: string
  value?: string
  label?: string
  over?: string
  ticks?: string
}

export type RadialGaugeProps = {
  value: number
  min?: number
  max?: number
  /** Accessible name for the meter. */
  label: string
  ticks?: number
  format?: DashboardFormat
  formatter?: (value: number) => string
  locale?: string
  currency?: string
  overLabel?: string
  tone?: RadialGaugeTone
  className?: string
  classNames?: RadialGaugeClassNames
}

const CX = 100
const CY = 96
const RADIUS = 74

function point(angle: number, radius: number) {
  return {
    x: CX + Math.cos(angle) * radius,
    y: CY - Math.sin(angle) * radius,
  }
}

function arcPath(radius: number) {
  const start = point(Math.PI, radius)
  const end = point(0, radius)
  return `M ${start.x.toFixed(2)} ${start.y.toFixed(2)} A ${radius} ${radius} 0 0 1 ${end.x.toFixed(2)} ${end.y.toFixed(2)}`
}

const toneClass: Record<RadialGaugeTone, string> = {
  primary: "stroke-primary text-primary",
  neutral: "stroke-muted-foreground text-muted-foreground",
  destructive: "stroke-destructive text-destructive",
}

export function RadialGauge({
  value,
  min = 0,
  max = 100,
  label,
  ticks = 5,
  format = "number",
  formatter,
  locale = "en-US",
  currency = "USD",
  overLabel = "Over budget",
  tone = "primary",
  className,
  classNames,
}: RadialGaugeProps) {
  const safeMax = max > min ? max : min + 1
  const over = value > max
  const ratio = clampRatio(value, min, safeMax)
  const clamped = value < min || value > max
  const angle = Math.PI * (1 - ratio)
  const needle = point(angle, RADIUS - 10)
  const hub = point(angle, 8)
  const text = formatter ? formatter(value) : formatDashboardValue(value, format, locale, currency)
  const tickCount = Math.max(2, Math.min(9, Math.round(ticks)))
  const marks = Array.from({ length: tickCount }, (_, index) => {
    const at = Math.PI * (1 - index / (tickCount - 1))
    const outer = point(at, RADIUS + 2)
    const inner = point(at, RADIUS - 8)
    return { outer, inner, key: index }
  })
  const valuetext = over ? `${text}, ${overLabel}` : text

  return (
    <div
      data-slot="radial-gauge"
      data-state={over ? "over" : "ok"}
      data-tone={over ? "destructive" : tone}
      role="meter"
      aria-label={label}
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-valuetext={valuetext}
      className={cn("@container flex min-w-0 flex-col items-center gap-1 text-foreground", className, classNames?.root)}
    >
      <svg viewBox="0 0 200 118" className="h-auto w-full max-w-xs" aria-hidden>
        <path d={arcPath(RADIUS)} className="fill-none stroke-muted" strokeWidth="8" strokeLinecap="round" />
        <path
          d={arcPath(RADIUS)}
          pathLength={100}
          className={cn("fill-none", over ? "stroke-destructive" : toneClass[tone])}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${ratio * 100} 100`}
        />
        <g className={classNames?.ticks}>
          {marks.map((mark) => (
            <line
              key={mark.key}
              x1={mark.inner.x}
              y1={mark.inner.y}
              x2={mark.outer.x}
              y2={mark.outer.y}
              className="stroke-muted-foreground"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          ))}
        </g>
        <line
          data-slot="radial-gauge-needle"
          data-clamped={clamped ? "true" : "false"}
          x1={hub.x}
          y1={hub.y}
          x2={needle.x}
          y2={needle.y}
          className={over ? "stroke-destructive" : "stroke-foreground"}
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <circle cx={CX} cy={CY} r="4" className={over ? "fill-destructive" : "fill-foreground"} />
      </svg>
      <p className={cn("text-3xl font-normal tabular-nums tracking-tight", over && "text-destructive", classNames?.value)}>{text}</p>
      <p className={cn("text-xs text-muted-foreground", classNames?.label)}>{label}</p>
      {over ? <p className={cn("text-xs font-medium text-destructive", classNames?.over)}>{overLabel}</p> : null}
    </div>
  )
}
