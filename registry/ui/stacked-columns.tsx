"use client"

import { useId, useState } from "react"
import { motion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { formatChartNumber } from "@/registry/retana/lib/chart-format"
import { extentWithZero, scaleLinear } from "@/registry/retana/lib/chart-geom"
import {
  ChartCard,
  ChartInsight,
  ChartKpi,
  ChartLegend,
  ChartTip,
  chartStatusLabels,
  chartStatusLabelsEs,
  chartTransition,
  usePlotBox,
  usePrefersReducedMotion,
  type ChartCardClassNames,
  type ChartStatus,
  type ChartStatusLabels,
} from "@/registry/retana/ui/chart-card"
import { SeriesPatterns, seriesPaint } from "@/registry/retana/ui/chart-marks"

export type StackedSeries = { id: string; label: string }
export type StackedPoint = { key: string; label: string; axisLabel?: string; values: Record<string, number> }
export type StackedPeriod = { id: string; label: string; points: StackedPoint[] }
export type StackedNote = { title: string; body: string; actionLabel?: string; onAction?: () => void }

export type StackedColumnsLabels = ChartStatusLabels & {
  period: string
  legend: string
  total: string
  column: (label: string, value: string) => string
}

export const stackedColumnsLabels: StackedColumnsLabels = {
  ...chartStatusLabels,
  period: "Range",
  legend: "Series",
  total: "Total",
  column: (label, value) => `${label}: ${value}`,
}

export const stackedColumnsLabelsEs: StackedColumnsLabels = {
  ...chartStatusLabelsEs,
  period: "Rango",
  legend: "Series",
  total: "Total",
  column: (label, value) => `${label}: ${value}`,
}

export type StackedColumnsProps = {
  title: string
  description?: string
  series: StackedSeries[]
  periods: StackedPeriod[]
  periodId?: string
  onPeriodChange?: (id: string) => void
  activeKey?: string | null
  onActiveChange?: (key: string | null) => void
  note?: StackedNote
  locale?: string
  suffix?: string
  status?: ChartStatus
  labels?: Partial<StackedColumnsLabels>
  onMenu?: () => void
  onRetry?: () => void
  height?: number
  className?: string
  classNames?: ChartCardClassNames
}

function pointTotal(point: StackedPoint, series: StackedSeries[]) {
  return series.reduce((sum, item) => sum + (point.values[item.id] ?? 0), 0)
}

export function StackedColumns({
  title,
  description,
  series,
  periods,
  periodId,
  onPeriodChange,
  activeKey,
  onActiveChange,
  note,
  locale,
  suffix,
  status = "ready",
  labels,
  onMenu,
  onRetry,
  height = 200,
  className,
  classNames,
}: StackedColumnsProps) {
  const copy = { ...stackedColumnsLabels, ...labels }
  const pattern = useId().replace(/:/g, "")
  const reduced = usePrefersReducedMotion()
  const { node: plotNode, width } = usePlotBox(320, height)
  const [internalPeriod, setPeriod] = useState(periods[0]?.id ?? "")
  const [internalKey, setKey] = useState<string | null>(null)
  const [seriesId, setSeriesId] = useState<string | null>(null)
  const currentId = periodId ?? internalPeriod
  const period = periods.find((item) => item.id === currentId) ?? periods[0]
  const points = period?.points ?? []
  const active = activeKey !== undefined ? activeKey : internalKey
  const empty = points.length === 0 || series.length === 0
  const view = status !== "ready" ? status : empty ? "empty" : "ready"
  const stacks = points.map((point) => {
    let up = 0
    let down = 0
    for (const item of series) {
      const value = point.values[item.id] ?? 0
      if (value >= 0) up += value
      else down += value
    }
    return { up, down }
  })
  const domain = extentWithZero(stacks.flatMap((stack) => [stack.up, stack.down]))
  const base = scaleLinear(0, domain.min, domain.max, height - 24, 12)
  const slot = Math.max(1, (width - 16) / Math.max(1, points.length))
  const barWidth = Math.max(6, Math.min(22, slot * 0.55))
  const focus = points.find((point) => point.key === active) ?? null
  const kpiPoints = focus ? [focus] : points
  const withUnit = (value: number) => formatChartNumber(value, locale) + (suffix ? ` ${suffix}` : "")

  function choosePeriod(id: string) {
    if (periodId === undefined) setPeriod(id)
    onPeriodChange?.(id)
    if (activeKey === undefined) setKey(null)
    onActiveChange?.(null)
  }

  function chooseKey(key: string | null) {
    if (activeKey === undefined) setKey(key)
    onActiveChange?.(key)
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
      summary={points.map((point) => copy.column(point.label, withUnit(pointTotal(point, series)))).join(", ")}
      columns={series.map((item) => ({ id: item.id, label: item.label }))}
      rows={points.map((point) => ({
        id: point.key,
        label: point.label,
        cells: Object.fromEntries(series.map((item) => [item.id, formatChartNumber(point.values[item.id] ?? 0, locale)])),
      }))}
      live={focus ? copy.column(focus.label, withUnit(pointTotal(focus, series))) : undefined}
      kpis={
        <>
          {series.slice(0, 2).map((item) => (
            <ChartKpi
              key={item.id}
              label={item.label}
              value={withUnit(kpiPoints.reduce((sum, point) => sum + (point.values[item.id] ?? 0), 0))}
              hint={focus?.label}
            />
          ))}
        </>
      }
      controls={
        periods.length > 1 ? (
          <Tabs value={currentId} onValueChange={choosePeriod}>
            <TabsList aria-label={copy.period}>
              {periods.map((item) => (
                <TabsTrigger key={item.id} value={item.id}>
                  {item.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : null
      }
      legend={
        <ChartLegend
          label={copy.legend}
          activeId={seriesId}
          onActiveChange={setSeriesId}
          items={series.map((item, index) => ({ id: item.id, label: item.label, tone: index }))}
        />
      }
      insight={
        note ? (
          <ChartInsight
            title={note.title}
            body={note.body}
            action={
              note.actionLabel ? (
                <Button type="button" size="sm" variant="outline" onClick={note.onAction}>
                  {note.actionLabel}
                </Button>
              ) : null
            }
          />
        ) : null
      }
    >
      <div
        ref={plotNode}
        className="relative w-full overflow-x-auto"
        style={{ height }}
        role="slider"
        tabIndex={0}
        aria-label={title}
        aria-valuemin={1}
        aria-valuemax={Math.max(1, points.length)}
        aria-valuenow={Math.max(1, (focus ? points.findIndex((point) => point.key === focus.key) : points.length - 1) + 1)}
        aria-valuetext={focus ? copy.column(focus.label, withUnit(pointTotal(focus, series))) : copy.total}
        onKeyDown={(event) => {
          if (!points.length || !["ArrowRight", "ArrowLeft", "Home", "End", "Escape"].includes(event.key)) return
          event.preventDefault()
          if (event.key === "Escape") {
            chooseKey(null)
            return
          }
          const index = Math.max(0, points.findIndex((point) => point.key === active))
          const next = event.key === "Home" ? 0 : event.key === "End" ? points.length - 1 : event.key === "ArrowRight" ? Math.min(points.length - 1, index + 1) : Math.max(0, index - 1)
          chooseKey(points[next]?.key ?? null)
        }}
      >
        <svg width={Math.max(width, points.length * 28)} height={height} className="block">
          <SeriesPatterns id={pattern} />
          <line x1={0} x2={Math.max(width, points.length * 28)} y1={base} y2={base} className="stroke-border" strokeDasharray="3 4" />
          {points.map((point, index) => {
            const x = 12 + index * slot + (slot - barWidth) / 2
            let up = base
            let down = base
            const hot = active === point.key
            return (
              <g key={`${currentId}-${point.key}`} data-slot="stacked-column" onMouseEnter={() => chooseKey(point.key)} opacity={!active || hot ? 1 : 0.4}>
                {series.map((item, seriesIndex) => {
                  const value = point.values[item.id] ?? 0
                  const y = scaleLinear(value, domain.min, domain.max, height - 24, 12)
                  const bar = value >= 0 ? base - y : y - base
                  const top = value >= 0 ? up - bar : down
                  if (value >= 0) up -= bar
                  else down += bar
                  return (
                    <motion.rect
                      key={item.id}
                      x={x}
                      width={barWidth}
                      rx={2}
                      initial={reduced ? false : { height: 0, y: base }}
                      animate={{ height: Math.max(0, bar), y: top }}
                      transition={chartTransition(reduced)}
                      fill={seriesPaint(pattern, seriesIndex)}
                      opacity={!seriesId || seriesId === item.id ? 1 : 0.2}
                    />
                  )
                })}
                <text x={x + barWidth / 2} y={height - 6} textAnchor="middle" className={hot ? "fill-foreground text-[10px] font-medium" : "fill-muted-foreground text-[10px]"}>
                  {point.axisLabel ?? point.label}
                </text>
              </g>
            )
          })}
        </svg>
        <ChartTip open={focus != null} x={12 + Math.max(0, points.findIndex((point) => point.key === active)) * slot + slot / 2} y={24}>
          {focus ? (
            <span>
              {focus.label}
              {series.map((item) => (
                <span key={item.id} className="mt-0.5 block">
                  {item.label}: {withUnit(focus.values[item.id] ?? 0)}
                </span>
              ))}
            </span>
          ) : null}
        </ChartTip>
      </div>
    </ChartCard>
  )
}
