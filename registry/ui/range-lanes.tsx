"use client"

import { useState } from "react"

import { formatChartNumber } from "@/registry/retana/lib/chart-format"
import { clamp } from "@/registry/retana/lib/chart-geom"
import { seriesColor } from "@/registry/retana/lib/chart-series"
import {
  ChartCard,
  ChartLegend,
  ChartTip,
  chartStatusLabels,
  chartStatusLabelsEs,
  type ChartCardClassNames,
  type ChartStatus,
  type ChartStatusLabels,
} from "@/registry/retana/ui/chart-card"

export type RangeLane = { id: string; label: string; start: number; end: number; tone?: number }

export type RangeLanesLabels = ChartStatusLabels & {
  legend: string
  lane: (label: string, start: string, end: string) => string
  scale: string
}

export const rangeLanesLabels: RangeLanesLabels = {
  ...chartStatusLabels,
  legend: "Lanes",
  lane: (label, start, end) => `${label}: ${start} – ${end}`,
  scale: "Scale",
}

export const rangeLanesLabelsEs: RangeLanesLabels = {
  ...chartStatusLabelsEs,
  legend: "Carriles",
  lane: (label, start, end) => `${label}: ${start} – ${end}`,
  scale: "Escala",
}

export type RangeLanesProps = {
  title: string
  description?: string
  lanes: RangeLane[]
  domain?: { min: number; max: number }
  ticks?: { value: number; label: string }[]
  locale?: string
  status?: ChartStatus
  labels?: Partial<RangeLanesLabels>
  activeId?: string | null
  onActiveChange?: (id: string | null) => void
  onMenu?: () => void
  onRetry?: () => void
  className?: string
  classNames?: ChartCardClassNames
}

export function RangeLanes({
  title,
  description,
  lanes,
  domain,
  ticks,
  locale,
  status = "ready",
  labels,
  activeId,
  onActiveChange,
  onMenu,
  onRetry,
  className,
  classNames,
}: RangeLanesProps) {
  const copy = { ...rangeLanesLabels, ...labels }
  const [internal, setInternal] = useState<string | null>(null)
  const [tip, setTip] = useState<{ id: string; x: number } | null>(null)
  const active = activeId !== undefined ? activeId : internal
  const empty = lanes.length === 0
  const view = status !== "ready" ? status : empty ? "empty" : "ready"
  const min = domain?.min ?? Math.min(0, ...lanes.flatMap((lane) => [lane.start, lane.end]))
  const max = domain?.max ?? Math.max(1, ...lanes.flatMap((lane) => [lane.start, lane.end]))
  const span = max - min || 1

  function setActive(id: string | null) {
    if (activeId === undefined) setInternal(id)
    onActiveChange?.(id)
  }

  function place(value: number) {
    return `${clamp((value - min) / span, 0, 1) * 100}%`
  }

  const hovered = lanes.find((lane) => lane.id === tip?.id)

  return (
    <ChartCard
      title={title}
      description={description}
      status={view}
      labels={copy}
      onMenu={onMenu}
      onRetry={onRetry}
      className={className}
      classNames={classNames}
      summary={lanes.map((lane) => copy.lane(lane.label, formatChartNumber(lane.start, locale), formatChartNumber(lane.end, locale))).join(". ")}
      columns={[
        { id: "start", label: "Start" },
        { id: "end", label: "End" },
      ]}
      rows={lanes.map((lane) => ({
        id: lane.id,
        label: lane.label,
        cells: { start: formatChartNumber(lane.start, locale), end: formatChartNumber(lane.end, locale) },
      }))}
      live={hovered ? copy.lane(hovered.label, formatChartNumber(hovered.start, locale), formatChartNumber(hovered.end, locale)) : undefined}
      legend={
        <ChartLegend
          label={copy.legend}
          activeId={active}
          onActiveChange={setActive}
          items={lanes.map((lane, index) => ({ id: lane.id, label: lane.label, tone: lane.tone ?? index }))}
        />
      }
    >
      <div className="relative flex flex-col gap-2" role="listbox" aria-label={title}>
        {ticks && ticks.length > 0 ? (
          <div className="grid grid-cols-[5.5rem_1fr] text-[10px] text-muted-foreground" aria-hidden>
            <span />
            <span className="relative h-4">
              {ticks.map((tick) => (
                <span key={tick.value} className="absolute -translate-x-1/2" style={{ left: place(tick.value) }}>
                  {tick.label}
                </span>
              ))}
            </span>
          </div>
        ) : null}
        {lanes.map((lane, index) => {
          const start = Math.min(lane.start, lane.end)
          const end = Math.max(lane.start, lane.end)
          const startRatio = clamp((start - min) / span, 0, 1)
          const endRatio = clamp((end - min) / span, 0, 1)
          const strong = active == null || active === lane.id
          return (
            <button
              key={lane.id}
              type="button"
              role="option"
              data-slot="range-lane"
              aria-selected={active === lane.id}
              aria-label={copy.lane(lane.label, formatChartNumber(start, locale), formatChartNumber(end, locale))}
              className="grid h-8 w-full grid-cols-[5.5rem_1fr] items-center gap-2 rounded-lg bg-muted/50 px-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onMouseEnter={(event) => {
                const rect = event.currentTarget.getBoundingClientRect()
                setTip({ id: lane.id, x: event.clientX - rect.left })
              }}
              onMouseLeave={() => setTip(null)}
              onFocus={() => setActive(lane.id)}
              onClick={() => setActive(active === lane.id ? null : lane.id)}
            >
              <span className="truncate text-xs">{lane.label}</span>
              <span className="relative h-full">
                <span
                  aria-hidden
                  data-slot="range-lane-bar"
                  className="absolute top-1/2 h-2.5 w-full origin-left rounded-md motion-safe:transition-transform motion-safe:duration-300 motion-reduce:transition-none"
                  style={{
                    transform: `translate(${startRatio * 100}%, -50%) scaleX(${Math.max(0.02, endRatio - startRatio)})`,
                    transformOrigin: "left center",
                    background: strong ? seriesColor(lane.tone ?? index) : "var(--muted-foreground)",
                  }}
                />
              </span>
            </button>
          )
        })}
        <ChartTip open={hovered != null} x={tip?.x ?? 0} y={0}>
          {hovered ? copy.lane(hovered.label, formatChartNumber(Math.min(hovered.start, hovered.end), locale), formatChartNumber(Math.max(hovered.start, hovered.end), locale)) : null}
        </ChartTip>
      </div>
    </ChartCard>
  )
}
