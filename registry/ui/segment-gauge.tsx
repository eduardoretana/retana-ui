"use client"

import { useLayoutEffect, useRef, useState } from "react"

import { formatChartNumber, formatChartPercent } from "@/registry/retana/lib/chart-format"
import { clamp } from "@/registry/retana/lib/chart-geom"
import { seriesColor } from "@/registry/retana/lib/chart-series"
import {
  ChartCard,
  ChartKpi,
  ChartLegend,
  ChartTip,
  chartStatusLabels,
  chartStatusLabelsEs,
  type ChartCardClassNames,
  type ChartStatus,
  type ChartStatusLabels,
} from "@/registry/retana/ui/chart-card"

export type GaugeSegment = { id: string; label: string; value: number }

export type SegmentGaugeLabels = ChartStatusLabels & {
  used: string
  free: string
  remainder: string
  legend: string
  probe: (label: string, value: string, share: string) => string
}

export const segmentGaugeLabels: SegmentGaugeLabels = {
  ...chartStatusLabels,
  used: "Used",
  free: "Free",
  remainder: "Still open",
  legend: "Segments",
  probe: (label, value, share) => `${label}: ${value} (${share})`,
}

export const segmentGaugeLabelsEs: SegmentGaugeLabels = {
  ...chartStatusLabelsEs,
  used: "Usado",
  free: "Libre",
  remainder: "Disponible",
  legend: "Tramos",
  probe: (label, value, share) => `${label}: ${value} (${share})`,
}

export type SegmentGaugeProps = {
  title: string
  description?: string
  segments: GaugeSegment[]
  limit: number
  locale?: string
  status?: ChartStatus
  labels?: Partial<SegmentGaugeLabels>
  activeId?: string | null
  onActiveChange?: (id: string | null) => void
  onMenu?: () => void
  onRetry?: () => void
  className?: string
  classNames?: ChartCardClassNames
}

export function SegmentGauge({
  title,
  description,
  segments,
  limit,
  locale,
  status = "ready",
  labels,
  activeId,
  onActiveChange,
  onMenu,
  onRetry,
  className,
  classNames,
}: SegmentGaugeProps) {
  const copy = { ...segmentGaugeLabels, ...labels }
  const track = useRef<HTMLDivElement>(null)
  const [trackWidth, setTrackWidth] = useState(280)
  const [internal, setInternal] = useState<string | null>(null)
  const [probe, setProbe] = useState<{ id: string; ratio: number } | null>(null)
  useLayoutEffect(() => {
    const element = track.current
    if (!element) return
    const read = () => {
      if (element.clientWidth > 0) setTrackWidth(element.clientWidth)
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  const active = activeId !== undefined ? activeId : internal
  const used = segments.reduce((sum, segment) => sum + Math.max(0, segment.value), 0)
  const cap = limit > 0 ? limit : Math.max(used, 1)
  const free = Math.max(0, cap - used)
  const empty = segments.length === 0 && limit <= 0
  const view = status !== "ready" ? status : empty ? "empty" : "ready"
  const parts = [
    ...segments.map((segment) => ({ ...segment, value: Math.max(0, segment.value) })),
    { id: "__free", label: copy.remainder, value: free },
  ]
  const span = parts.reduce((sum, part) => sum + part.value, 0) || 1

  function at(ratio: number) {
    let cursor = 0
    for (const part of parts) {
      cursor += part.value / span
      if (ratio <= cursor) return part.id
    }
    return parts[parts.length - 1]?.id ?? null
  }

  function point(clientX: number) {
    const rect = track.current?.getBoundingClientRect()
    if (!rect || rect.width <= 0) return
    const ratio = clamp((clientX - rect.left) / rect.width, 0, 0.999)
    const id = at(ratio)
    if (!id) return
    setProbe({ id, ratio })
    if (activeId === undefined) setInternal(id)
    onActiveChange?.(id)
  }

  const current = probe?.id ?? active
  const currentPart = parts.find((part) => part.id === current)
  const live = currentPart ? copy.probe(currentPart.label, formatChartNumber(currentPart.value, locale), formatChartPercent(currentPart.value / span, locale)) : undefined

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
      summary={`${copy.used} ${formatChartNumber(used, locale)} / ${formatChartNumber(cap, locale)}. ${segments.map((segment) => `${segment.label} ${formatChartNumber(segment.value, locale)}`).join(", ")}`}
      columns={[{ id: "value", label: copy.used }]}
      rows={segments.map((segment) => ({ id: segment.id, label: segment.label, cells: { value: formatChartNumber(segment.value, locale) } }))}
      live={live}
      kpis={
        <>
          <ChartKpi label={copy.used} value={formatChartPercent(cap ? used / cap : 0, locale)} hint={formatChartNumber(used, locale)} />
          <ChartKpi label={copy.free} value={formatChartPercent(cap ? free / cap : 0, locale)} hint={formatChartNumber(free, locale)} />
        </>
      }
      legend={
        <ChartLegend
          label={copy.legend}
          activeId={active}
          onActiveChange={(id) => {
            if (activeId === undefined) setInternal(id)
            onActiveChange?.(id)
          }}
          items={segments.map((segment, index) => ({ id: segment.id, label: segment.label, tone: index, value: formatChartNumber(segment.value, locale) }))}
        />
      }
    >
      <div className="relative pt-10">
        <div
          ref={track}
          data-slot="segment-gauge"
          role="slider"
          tabIndex={0}
          aria-label={title}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round((probe?.ratio ?? used / span) * 100)}
          aria-valuetext={live ?? copy.used}
          className="relative h-4 rounded-full bg-muted outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onPointerMove={(event) => point(event.clientX)}
          onPointerLeave={() => setProbe(null)}
          onKeyDown={(event) => {
            if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return
            event.preventDefault()
            const currentRatio = probe?.ratio ?? 0
            const next = event.key === "Home" ? 0 : event.key === "End" ? 0.99 : event.key === "ArrowRight" ? clamp(currentRatio + 0.05, 0, 0.99) : clamp(currentRatio - 0.05, 0, 0.99)
            const id = at(next)
            if (!id) return
            setProbe({ id, ratio: next })
            if (activeId === undefined) setInternal(id)
            onActiveChange?.(id)
          }}
        >
          <div
            aria-hidden
            className="absolute inset-0 rounded-full"
            style={{ backgroundImage: "repeating-linear-gradient(-45deg, transparent, transparent 3px, var(--border) 3px, var(--border) 4px)" }}
          />
          <div className="absolute inset-y-0 left-0 flex overflow-hidden rounded-full" style={{ width: `${(used / span) * 100}%` }}>
            {segments.map((segment, index) => (
              <span
                key={segment.id}
                data-slot="gauge-segment"
                data-active={active === segment.id}
                className="h-full"
                style={{
                  width: `${(Math.max(0, segment.value) / Math.max(used, 1)) * 100}%`,
                  background: seriesColor(index),
                  opacity: !active || active === segment.id ? 1 : 0.35,
                }}
              />
            ))}
          </div>
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
          <span>0</span>
          <span>{formatChartNumber(cap / 2, locale)}</span>
          <span>{formatChartNumber(cap, locale)}</span>
        </div>
        <ChartTip open={probe != null} x={(probe?.ratio ?? 0) * trackWidth} y={36}>
          {currentPart ? live : null}
        </ChartTip>
      </div>
    </ChartCard>
  )
}
