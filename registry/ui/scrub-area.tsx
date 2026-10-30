"use client"

import { useId, useState } from "react"

import { formatChartNumber } from "@/registry/retana/lib/chart-format"
import { areaPath, extentWithZero, linePath, scaleLinear } from "@/registry/retana/lib/chart-geom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChartCard,
  ChartKpi,
  ChartTip,
  chartScaleStyle,
  chartStatusLabels,
  chartStatusLabelsEs,
  usePlotBox,
  usePrefersReducedMotion,
  type ChartCardClassNames,
  type ChartStatus,
  type ChartStatusLabels,
} from "@/registry/retana/ui/chart-card"

export type ScrubPoint = { key: string; label: string; value: number; axisLabel?: string }
export type ScrubPeriod = { id: string; label: string; points: ScrubPoint[] }

export type ScrubAreaLabels = ChartStatusLabels & {
  period: string
  total: string
  delta: string
  point: (label: string, value: string) => string
  scrub: string
}

export const scrubAreaLabels: ScrubAreaLabels = {
  ...chartStatusLabels,
  period: "Period",
  total: "Latest",
  delta: "Change",
  point: (label, value) => `${label}: ${value}`,
  scrub: "Move through the series",
}

export const scrubAreaLabelsEs: ScrubAreaLabels = {
  ...chartStatusLabelsEs,
  period: "Periodo",
  total: "Reciente",
  delta: "Cambio",
  point: (label, value) => `${label}: ${value}`,
  scrub: "Recorre la serie",
}

export type ScrubAreaProps = {
  title: string
  description?: string
  periods: ScrubPeriod[]
  periodId?: string
  onPeriodChange?: (id: string) => void
  locale?: string
  suffix?: string
  status?: ChartStatus
  labels?: Partial<ScrubAreaLabels>
  onActiveChange?: (key: string | null) => void
  onMenu?: () => void
  onRetry?: () => void
  height?: number
  className?: string
  classNames?: ChartCardClassNames
}

export function ScrubArea({
  title,
  description,
  periods,
  periodId,
  onPeriodChange,
  locale,
  suffix,
  status = "ready",
  labels,
  onActiveChange,
  onMenu,
  onRetry,
  height = 200,
  className,
  classNames,
}: ScrubAreaProps) {
  const copy = { ...scrubAreaLabels, ...labels }
  const gradient = useId().replace(/:/g, "")
  const reduced = usePrefersReducedMotion()
  const { node: plotNode, width } = usePlotBox(320, height)
  const [internalPeriod, setPeriod] = useState(periods[0]?.id ?? "")
  const currentId = periodId ?? internalPeriod
  const period = periods.find((item) => item.id === currentId) ?? periods[0]
  const points = period?.points ?? []
  const [cursor, setCursor] = useState<number | null>(null)
  const empty = points.length === 0
  const view = status !== "ready" ? status : empty ? "empty" : "ready"
  const domain = extentWithZero(points.map((point) => point.value))
  const left = 8
  const right = Math.max(left + 1, width - 8)
  const slot = points.length > 1 ? (right - left) / (points.length - 1) : 0
  const xOf = (index: number) => (points.length === 1 ? width / 2 : left + index * slot)
  const yOf = (value: number) => scaleLinear(value, domain.min, domain.max, height - 24, 16)
  const coords = points.map((point, index) => ({ x: xOf(index), y: yOf(point.value) }))
  const baseline = yOf(Math.min(0, domain.min))
  const index = cursor ?? Math.max(0, points.length - 1)
  const focus = points[index]
  const first = points[0]?.value ?? 0
  const last = focus?.value ?? 0
  const delta = first !== 0 ? (last - first) / Math.abs(first) : 0
  const withUnit = (value: number) => formatChartNumber(value, locale) + (suffix ? ` ${suffix}` : "")

  function choosePeriod(id: string) {
    if (periodId === undefined) setPeriod(id)
    onPeriodChange?.(id)
    setCursor(null)
    onActiveChange?.(null)
  }

  function choose(next: number | null) {
    setCursor(next)
    onActiveChange?.(next != null ? points[next]?.key ?? null : null)
  }

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
      summary={points.map((point) => copy.point(point.label, withUnit(point.value))).join(", ")}
      columns={[{ id: "value", label: copy.total }]}
      rows={points.map((point) => ({ id: point.key, label: point.label, cells: { value: withUnit(point.value) } }))}
      live={focus ? copy.point(focus.label, withUnit(focus.value)) : undefined}
      kpis={
        <>
          <ChartKpi
            label={focus?.label ?? copy.total}
            figure={{ value: last, locale, suffix: suffix ? ` ${suffix}` : undefined, hierarchy: true, announce: true }}
          />
          <ChartKpi
            emphasis="quiet"
            label={copy.delta}
            figure={{ value: delta, percent: true, decimals: 1, locale, hierarchy: true, announce: true }}
            hint={points[0]?.label}
          />
        </>
      }
      controls={
        periods.length > 1 ? (
          <Select value={currentId} onValueChange={choosePeriod}>
            <SelectTrigger size="sm" aria-label={copy.period} className="w-full max-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {periods.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : null
      }
    >
      <div
        ref={plotNode}
        className="relative w-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ height }}
        role="slider"
        tabIndex={0}
        aria-label={copy.scrub}
        aria-valuemin={1}
        aria-valuemax={Math.max(1, points.length)}
        aria-valuenow={index + 1}
        aria-valuetext={focus ? copy.point(focus.label, withUnit(focus.value)) : copy.total}
        onMouseLeave={() => choose(null)}
        onMouseMove={(event) => {
          const rect = plotNode.current?.getBoundingClientRect()
          if (!rect || points.length === 0) return
          const ratio = (event.clientX - rect.left - left) / Math.max(1, right - left)
          const next = Math.max(0, Math.min(points.length - 1, Math.round(ratio * (points.length - 1))))
          choose(next)
        }}
        onKeyDown={(event) => {
          if (!points.length || !["ArrowRight", "ArrowLeft", "Home", "End"].includes(event.key)) return
          event.preventDefault()
          const current = cursor ?? points.length - 1
          const next = event.key === "Home" ? 0 : event.key === "End" ? points.length - 1 : event.key === "ArrowRight" ? Math.min(points.length - 1, current + 1) : Math.max(0, current - 1)
          choose(next)
        }}
      >
        <svg width={width} height={height} aria-hidden>
          <defs>
            <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="var(--chart-2)" stopOpacity="0.45" />
              <stop offset="1" stopColor="var(--chart-2)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <g data-slot="scrub-area-shape" {...chartScaleStyle(reduced, 1, `${left}px ${height / 2}px`, "x")}>
            <path d={areaPath(coords, baseline)} fill={`url(#${gradient})`} />
            <path d={linePath(coords)} fill="none" stroke="var(--chart-2)" strokeWidth={2} />
          </g>
          {focus ? (
            <g data-slot="scrub-guide">
              <line x1={xOf(index)} x2={xOf(index)} y1={12} y2={height - 22} className="stroke-foreground/40" strokeDasharray="3 3" />
              <circle cx={xOf(index)} cy={yOf(focus.value)} r={4} fill="var(--chart-2)" className="stroke-background" strokeWidth={2} />
            </g>
          ) : null}
          {points.map((point, pointIndex) => (
            <text key={point.key} x={xOf(pointIndex)} y={height - 6} textAnchor="middle" className={pointIndex === index ? "fill-foreground text-[10px]" : "fill-muted-foreground text-[10px]"}>
              {point.axisLabel ?? point.label}
            </text>
          ))}
        </svg>
        <ChartTip open={cursor != null && focus != null} x={xOf(index)} y={yOf(focus?.value ?? 0)}>
          {focus ? (
            <span>
              {focus.label}
              <span className="mt-0.5 block font-medium">{withUnit(focus.value)}</span>
            </span>
          ) : null}
        </ChartTip>
      </div>
    </ChartCard>
  )
}
