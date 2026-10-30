"use client"

import { useId, useState } from "react"

import { formatChartNumber } from "@/registry/retana/lib/chart-format"
import { extentWithZero, isoFaces, scaleLinear } from "@/registry/retana/lib/chart-geom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChartCard,
  ChartKpi,
  chartScaleStyle,
  chartStatusLabels,
  chartStatusLabelsEs,
  usePlotBox,
  usePrefersReducedMotion,
  type ChartCardClassNames,
  type ChartStatus,
  type ChartStatusLabels,
} from "@/registry/retana/ui/chart-card"
import { SeriesPatterns, seriesPaint } from "@/registry/retana/ui/chart-marks"

export type IsoPoint = { key: string; label: string; value: number; axisLabel?: string }
export type IsoPeriod = { id: string; label: string; points: IsoPoint[] }

export type IsoBarsLabels = ChartStatusLabels & {
  period: string
  value: (label: string, value: string) => string
  total: string
}

export const isoBarsLabels: IsoBarsLabels = {
  ...chartStatusLabels,
  period: "Period",
  value: (label, value) => `${label}: ${value}`,
  total: "Total",
}

export const isoBarsLabelsEs: IsoBarsLabels = {
  ...chartStatusLabelsEs,
  period: "Periodo",
  value: (label, value) => `${label}: ${value}`,
  total: "Total",
}

export type IsoBarsProps = {
  title: string
  description?: string
  periods: IsoPeriod[]
  periodId?: string
  onPeriodChange?: (id: string) => void
  emphasisKey?: string | null
  caption?: string
  unit?: ChartUnitLike
  locale?: string
  status?: ChartStatus
  labels?: Partial<IsoBarsLabels>
  onMenu?: () => void
  onRetry?: () => void
  height?: number
  className?: string
  classNames?: ChartCardClassNames
}

type ChartUnitLike = { suffix?: string; scale?: number }

export function IsoBars({
  title,
  description,
  periods,
  periodId,
  onPeriodChange,
  emphasisKey,
  caption,
  unit,
  locale,
  status = "ready",
  labels,
  onMenu,
  onRetry,
  height = 200,
  className,
  classNames,
}: IsoBarsProps) {
  const copy = { ...isoBarsLabels, ...labels }
  const pattern = useId().replace(/:/g, "")
  const reduced = usePrefersReducedMotion()
  const { node: plotNode, width } = usePlotBox(320, height)
  const [internalPeriod, setPeriod] = useState(periods[0]?.id ?? "")
  const [active, setActive] = useState<number | null>(null)
  const currentId = periodId ?? internalPeriod
  const period = periods.find((item) => item.id === currentId) ?? periods[0]
  const points = period?.points ?? []
  const empty = points.length === 0
  const view = status !== "ready" ? status : empty ? "empty" : "ready"
  const domain = extentWithZero(points.map((point) => point.value * (unit?.scale ?? 1)))
  const depth = width < 360 ? 6 : 10
  const pad = 16 + depth
  const inner = Math.max(1, width - pad * 2)
  const slot = inner / Math.max(1, points.length)
  const barWidth = Math.max(8, Math.min(28, slot - depth - 8))
  const base = scaleLinear(0, domain.min, domain.max, height - 28, 20 + depth)

  function choose(id: string) {
    if (periodId === undefined) setPeriod(id)
    onPeriodChange?.(id)
    setActive(null)
  }

  const shown = active != null ? points[active] : null
  const total = points.reduce((sum, point) => sum + point.value, 0)
  const readout = shown ? copy.value(shown.label, formatChartNumber(shown.value * (unit?.scale ?? 1), locale) + (unit?.suffix ? ` ${unit.suffix}` : "")) : formatChartNumber(total * (unit?.scale ?? 1), locale)

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
      summary={points.map((point) => copy.value(point.label, String(point.value))).join(", ")}
      columns={[{ id: "value", label: copy.total }]}
      rows={points.map((point) => ({ id: point.key, label: point.label, cells: { value: formatChartNumber(point.value, locale) } }))}
      live={readout}
      kpis={
        <ChartKpi
          label={shown ? shown.label : copy.total}
          figure={{
            value: (shown?.value ?? total) * (unit?.scale ?? 1),
            locale,
            suffix: unit?.suffix ? ` ${unit.suffix}` : undefined,
            hierarchy: true,
            announce: true,
          }}
        />
      }
      controls={
        periods.length > 1 ? (
          <Select value={currentId} onValueChange={choose}>
            <SelectTrigger size="sm" aria-label={copy.period} className="w-full max-w-40">
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
      insight={caption ? <p className="text-sm text-muted-foreground">{caption}</p> : undefined}
    >
      <div
        ref={plotNode}
        className="relative w-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ height }}
        role="slider"
        tabIndex={0}
        aria-label={title}
        aria-valuemin={points.length ? 1 : 0}
        aria-valuemax={points.length}
        aria-valuenow={active != null ? active + 1 : points.length}
        aria-valuetext={readout}
        onKeyDown={(event) => {
          if (!points.length) return
          if (!["ArrowRight", "ArrowLeft", "Home", "End", "Escape"].includes(event.key)) return
          event.preventDefault()
          if (event.key === "Escape") {
            setActive(null)
            return
          }
          const current = active ?? points.length - 1
          const next = event.key === "Home" ? 0 : event.key === "End" ? points.length - 1 : event.key === "ArrowRight" ? Math.min(points.length - 1, current + 1) : Math.max(0, current - 1)
          setActive(next)
        }}
      >
        <svg width={width} height={height} className="block" aria-hidden>
          <SeriesPatterns id={pattern} />
          <line x1={8} x2={width - 8} y1={base} y2={base} className="stroke-border" />
          {points.map((point, index) => {
            const value = point.value * (unit?.scale ?? 1)
            const y = scaleLinear(value, domain.min, domain.max, height - 28, 20 + depth)
            const barHeight = base - y
            const x = pad + index * slot + (slot - barWidth) / 2
            const reach = Math.max(1, Math.abs(base - (20 + depth)))
            const faces = isoFaces(x, base, barWidth, reach, depth)
            const signed = Math.max(-1, Math.min(1, barHeight / reach))
            const strong = emphasisKey != null ? point.key === emphasisKey : active != null ? active === index : index === points.length - 1
            const labelHot = active != null ? active === index : strong
            const paint = strong ? seriesPaint(pattern, 0) : "var(--muted)"
            return (
              <g key={index} data-slot="iso-bar" data-key={point.key} onMouseEnter={() => setActive(index)}>
                <g {...chartScaleStyle(reduced, signed, `${x + barWidth / 2}px ${base}px`)}>
                  <path d={faces.roof} fill={paint} opacity={strong ? 0.55 : 1} stroke="var(--border)" strokeDasharray={strong ? undefined : "3 3"} />
                  <path d={faces.side} fill={paint} opacity={strong ? 0.8 : 1} stroke="var(--border)" strokeDasharray={strong ? undefined : "3 3"} />
                  <path d={faces.front} fill={paint} stroke="var(--border)" strokeDasharray={strong ? undefined : "3 3"} />
                </g>
                <text
                  x={x + barWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  className={labelHot ? "fill-foreground text-[10px] font-medium" : "fill-muted-foreground text-[10px]"}
                >
                  {point.axisLabel ?? point.label}
                </text>
              </g>
            )
          })}
        </svg>
      </div>
    </ChartCard>
  )
}
