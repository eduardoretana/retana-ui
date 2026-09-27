"use client"

import * as React from "react"
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart"
import { chartBgClass, chartVar, type ChartTone } from "@/registry/retana/lib/chart-tone"
import { formatNumber, formatPercentDelta, percentDelta } from "@/registry/retana/lib/format"

export type StatCardProps = {
  label: string
  value: number
  previous?: number
  tone?: ChartTone
  sparkline?: readonly number[]
  caption?: string
  className?: string
  format?: (value: number) => string
}

export function StatCard({
  label,
  value,
  previous,
  tone = 1,
  sparkline,
  caption,
  className,
  format = (n) => formatNumber(n),
}: StatCardProps) {
  const delta = previous == null ? null : percentDelta(value, previous)
  const up = delta != null && delta > 0
  const down = delta != null && delta < 0
  return (
    <Card className={className}>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-2xl tabular-nums">{format(value)}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-end justify-between gap-3">
        <p className={cn("text-xs", up || down ? "text-foreground" : "text-muted-foreground")}>
          {delta == null ? (caption ?? "") : formatPercentDelta(delta)}
          {caption && delta != null ? <span className="text-muted-foreground"> {caption}</span> : null}
        </p>
        {sparkline && sparkline.length > 1 ? (
          <Sparkline values={sparkline} tone={tone} />
        ) : null}
      </CardContent>
    </Card>
  )
}

function Sparkline({ values, tone }: { values: readonly number[]; tone: ChartTone }) {
  const width = 96
  const height = 32
  const max = Math.max(...values, 1)
  const min = Math.min(...values, 0)
  const span = max - min || 1
  const d = values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * width
      const y = height - ((value - min) / span) * (height - 2) - 1
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join("")
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} aria-hidden className="shrink-0">
      <path d={d} fill="none" stroke={chartVar(tone)} strokeWidth="1.5" />
    </svg>
  )
}

export type TrendPoint = {
  label: string
  visitors: number
  views: number
}

export type TrendChartProps = {
  points: readonly TrendPoint[]
  ranges?: readonly { key: string; label: string }[]
  range?: string
  onRangeChange?: (key: string) => void
  className?: string
  title?: string
  description?: string
  visitorsLabel?: string
  viewsLabel?: string
  rangeLabel?: string
}

export function TrendChart({
  points,
  ranges,
  range,
  onRangeChange,
  className,
  title = "Traffic",
  description,
  visitorsLabel = "Visitors",
  viewsLabel = "Page views",
  rangeLabel = "Range",
}: TrendChartProps) {
  const trendConfig = {
    visitors: { label: visitorsLabel, color: "var(--chart-1)" },
    views: { label: viewsLabel, color: "var(--chart-2)" },
  } satisfies ChartConfig
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div>
            <CardTitle>{title}</CardTitle>
            {description ? <CardDescription>{description}</CardDescription> : null}
          </div>
          {ranges && ranges.length > 0 ? (
            <div className="flex flex-wrap gap-1" role="group" aria-label={rangeLabel}>
              {ranges.map((item) => (
                <Button
                  key={item.key}
                  type="button"
                  size="xs"
                  variant={range === item.key ? "secondary" : "ghost"}
                  aria-pressed={range === item.key}
                  onClick={() => onRangeChange?.(item.key)}
                >
                  {item.label}
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={trendConfig} className="aspect-auto h-56 w-full">
          <AreaChart data={[...points]} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} minTickGap={24} />
            <YAxis width={32} tickLine={false} axisLine={false} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              dataKey="views"
              type="monotone"
              stroke="var(--color-views)"
              fill="var(--color-views)"
              fillOpacity={0.15}
              strokeWidth={1.5}
            />
            <Area
              dataKey="visitors"
              type="monotone"
              stroke="var(--color-visitors)"
              fill="var(--color-visitors)"
              fillOpacity={0.2}
              strokeWidth={1.5}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export type FunnelStep = {
  label: string
  value: number
  tone?: ChartTone
}

export function FunnelChart({
  steps,
  title = "Funnel",
  className,
}: {
  steps: readonly FunnelStep[]
  title?: string
  className?: string
}) {
  const max = Math.max(...steps.map((step) => step.value), 1)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-col gap-1">
            <div className="flex items-baseline justify-between text-sm">
              <span>{step.label}</span>
              <span className="tabular-nums">{formatNumber(step.value)}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div
                className={cn("h-full rounded-full", chartBgClass(step.tone ?? ((index % 5) + 1) as ChartTone))}
                style={{ width: `${Math.max(4, (step.value / max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

export function RankedBars({
  items,
  title = "Sources",
  tone = 2,
  emptyLabel = "No data",
  className,
}: {
  items: readonly { label: string; value: number }[]
  title?: string
  tone?: ChartTone
  emptyLabel?: string
  className?: string
}) {
  const max = Math.max(...items.map((item) => item.value), 1)
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">{emptyLabel}</p>
        ) : (
          items.map((item) => (
            <div key={item.label} className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 text-sm">
              <div className="min-w-0">
                <div className="mb-1 flex justify-between gap-2">
                  <span className="truncate">{item.label}</span>
                  <span className="tabular-nums text-muted-foreground">{formatNumber(item.value)}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className={cn("h-full rounded-full", chartBgClass(tone))}
                    style={{ width: `${(item.value / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export function Heatmap({
  grid,
  title = "Day and hour",
  description = "Darker cells had more views.",
  tone = 1,
  dayLabels = DAYS,
  className,
}: {
  /** 7 rows (Monday first) of 24 hours. */
  grid: readonly (readonly number[])[]
  title?: string
  description?: string
  tone?: ChartTone
  dayLabels?: readonly string[]
  className?: string
}) {
  const max = Math.max(0, ...grid.flat())
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <div className="min-w-[36rem]">
          <div className="grid grid-cols-[2.5rem_repeat(24,minmax(0,1fr))] gap-0.5 text-[10px] text-muted-foreground">
            <span />
            {Array.from({ length: 24 }, (_, hour) => (
              <span key={hour} className="text-center">
                {hour % 3 === 0 ? String(hour).padStart(2, "0") : ""}
              </span>
            ))}
            {grid.map((row, day) => (
              <React.Fragment key={dayLabels[day] ?? day}>
                <span className="flex items-center">{dayLabels[day]}</span>
                {Array.from({ length: 24 }, (_, hour) => {
                  const value = row[hour] ?? 0
                  const level = max === 0 || value === 0 ? 0 : Math.ceil((value / max) * 4)
                  return (
                    <span
                      key={hour}
                      title={`${dayLabels[day] ?? ""} ${String(hour).padStart(2, "0")}:00 · ${value}`}
                      className={cn(
                        "aspect-square rounded-sm",
                        level === 0 && "bg-muted",
                        level > 0 && chartBgClass(tone),
                        level === 1 && "opacity-30",
                        level === 2 && "opacity-50",
                        level === 3 && "opacity-75",
                        level >= 4 && "opacity-100",
                      )}
                    />
                  )
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export function ScrollDepthChart({
  marks,
  title = "Scroll depth",
  description = "Share of views that reached each mark.",
  valueLabel = "Reached",
  className,
}: {
  marks: readonly { label: string; value: number }[]
  title?: string
  description?: string
  valueLabel?: string
  className?: string
}) {
  const scrollConfig = {
    value: { label: valueLabel, color: "var(--chart-3)" },
  } satisfies ChartConfig
  const data = marks.map((mark) => ({
    label: mark.label,
    value: Math.round(mark.value * (mark.value <= 1 ? 100 : 1)),
  }))
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={scrollConfig} className="aspect-auto h-48 w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis width={32} tickLine={false} axisLine={false} unit="%" />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" fill="var(--color-value)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
