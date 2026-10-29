"use client"

import { useId, useState } from "react"
import { motion } from "motion/react"

import { formatChartNumber } from "@/registry/retana/lib/chart-format"
import { extentWithZero, linePath, scaleLinear } from "@/registry/retana/lib/chart-geom"
import {
  ChartCard,
  ChartKpi,
  ChartLegend,
  ChartTip,
  chartStatusLabels,
  chartStatusLabelsEs,
  chartTransition,
  dimOpacity,
  usePlotBox,
  usePrefersReducedMotion,
  type ChartCardClassNames,
  type ChartStatus,
  type ChartStatusLabels,
} from "@/registry/retana/ui/chart-card"
import { seriesColor } from "@/registry/retana/lib/chart-series"
import { SeriesPatterns } from "@/registry/retana/ui/chart-marks"

export type CoupledPoint = { key: string; value: number }
export type CoupledSeries = { id: string; label: string; points: CoupledPoint[] }

export type CoupledLinesLabels = ChartStatusLabels & {
  legend: string
  point: (label: string, rows: string) => string
}

export const coupledLinesLabels: CoupledLinesLabels = {
  ...chartStatusLabels,
  legend: "Series",
  point: (label, rows) => `${label}. ${rows}`,
}

export const coupledLinesLabelsEs: CoupledLinesLabels = {
  ...chartStatusLabelsEs,
  legend: "Series",
  point: (label, rows) => `${label}. ${rows}`,
}

export type CoupledLinesProps = {
  title: string
  description?: string
  categories: { key: string; label: string; axisLabel?: string }[]
  series: CoupledSeries[]
  locale?: string
  suffix?: string
  status?: ChartStatus
  labels?: Partial<CoupledLinesLabels>
  activeId?: string | null
  onActiveChange?: (id: string | null) => void
  onMenu?: () => void
  onRetry?: () => void
  height?: number
  className?: string
  classNames?: ChartCardClassNames
}

export function CoupledLines({
  title,
  description,
  categories,
  series,
  locale,
  suffix,
  status = "ready",
  labels,
  activeId,
  onActiveChange,
  onMenu,
  onRetry,
  height = 200,
  className,
  classNames,
}: CoupledLinesProps) {
  const copy = { ...coupledLinesLabels, ...labels }
  const pattern = useId().replace(/:/g, "")
  const reduced = usePrefersReducedMotion()
  const { node: plotNode, width } = usePlotBox(320, height)
  const [internal, setInternal] = useState<string | null>(null)
  const [cursor, setCursor] = useState<number | null>(null)
  const active = activeId !== undefined ? activeId : internal
  const empty = categories.length === 0 || series.length === 0
  const view = status !== "ready" ? status : empty ? "empty" : "ready"
  const values = series.flatMap((item) => item.points.map((point) => point.value))
  const domain = extentWithZero(values)
  const left = 8
  const right = Math.max(left + 1, width - 8)
  const slot = categories.length > 1 ? (right - left) / (categories.length - 1) : 0
  const xOf = (index: number) => (categories.length === 1 ? width / 2 : left + index * slot)
  const yOf = (value: number) => scaleLinear(value, domain.min, domain.max, height - 22, 12)
  const withUnit = (value: number) => formatChartNumber(value, locale) + (suffix ? ` ${suffix}` : "")

  function setActive(id: string | null) {
    if (activeId === undefined) setInternal(id)
    onActiveChange?.(id)
  }

  const focus = cursor != null ? categories[cursor] : null
  const rows = focus
    ? series
        .filter((item) => !active || item.id === active)
        .map((item) => {
          const point = item.points.find((entry) => entry.key === focus.key)
          return `${item.label} ${withUnit(point?.value ?? 0)}`
        })
        .join(", ")
    : ""

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
      summary={series.map((item) => `${item.label}: ${item.points.map((point) => `${point.key} ${withUnit(point.value)}`).join(", ")}`).join(". ")}
      columns={series.map((item) => ({ id: item.id, label: item.label }))}
      rows={categories.map((category) => ({
        id: category.key,
        label: category.label,
        cells: Object.fromEntries(series.map((item) => [item.id, withUnit(item.points.find((point) => point.key === category.key)?.value ?? 0)])),
      }))}
      live={focus ? copy.point(focus.label, rows) : undefined}
      kpis={
        <>
          {series.slice(0, 2).map((item) => {
            const point = focus ? item.points.find((entry) => entry.key === focus.key) : item.points[item.points.length - 1]
            return <ChartKpi key={item.id} label={item.label} value={withUnit(point?.value ?? 0)} hint={focus?.label} />
          })}
        </>
      }
      legend={
        <ChartLegend
          label={copy.legend}
          activeId={active}
          onActiveChange={setActive}
          items={series.map((item, index) => ({ id: item.id, label: item.label, tone: index }))}
        />
      }
    >
      <div
        ref={plotNode}
        className="relative w-full outline-none focus-visible:ring-2 focus-visible:ring-ring"
        style={{ height }}
        role="slider"
        tabIndex={0}
        aria-label={title}
        aria-valuemin={1}
        aria-valuemax={Math.max(1, categories.length)}
        aria-valuenow={(cursor ?? 0) + 1}
        aria-valuetext={focus ? copy.point(focus.label, rows) : title}
        onMouseLeave={() => setCursor(null)}
        onMouseMove={(event) => {
          const rect = plotNode.current?.getBoundingClientRect()
          if (!rect || categories.length === 0) return
          const ratio = (event.clientX - rect.left) / rect.width
          const index = Math.max(0, Math.min(categories.length - 1, Math.round(ratio * (categories.length - 1))))
          setCursor(index)
        }}
        onKeyDown={(event) => {
          if (!categories.length || !["ArrowRight", "ArrowLeft", "Home", "End", "Escape"].includes(event.key)) return
          event.preventDefault()
          if (event.key === "Escape") {
            setCursor(null)
            return
          }
          const current = cursor ?? 0
          const next = event.key === "Home" ? 0 : event.key === "End" ? categories.length - 1 : event.key === "ArrowRight" ? Math.min(categories.length - 1, current + 1) : Math.max(0, current - 1)
          setCursor(next)
        }}
      >
        <svg width={width} height={height} aria-hidden>
          <SeriesPatterns id={pattern} />
          {series.map((item, index) => {
            const path = linePath(categories.map((category, categoryIndex) => {
              const point = item.points.find((entry) => entry.key === category.key)
              return { x: xOf(categoryIndex), y: yOf(point?.value ?? 0) }
            }))
            const shown = !active || active === item.id
            return (
              <motion.path
                key={item.id}
                data-slot="coupled-line"
                d={path}
                fill="none"
                stroke={seriesColor(index)}
                strokeWidth={index % 5 === 4 ? 3 : 2}
                strokeDasharray={index % 5 === 1 ? "5 3" : index % 5 === 2 ? "1.5 3" : index % 5 === 3 ? "6 2 1.5 2" : undefined}
                opacity={shown ? 1 : dimOpacity(false)}
                initial={reduced ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={chartTransition(reduced)}
              />
            )
          })}
          {cursor != null
            ? series.map((item, index) => {
                if (active && active !== item.id) return null
                const point = item.points.find((entry) => entry.key === categories[cursor]?.key)
                return <circle key={item.id} data-slot="coupled-dot" cx={xOf(cursor)} cy={yOf(point?.value ?? 0)} r={4} fill={seriesColor(index)} className="stroke-background" strokeWidth={2} />
              })
            : null}
          {categories.map((category, index) => (
            <text key={category.key} x={xOf(index)} y={height - 4} textAnchor="middle" className={cursor === index ? "fill-foreground text-[10px]" : "fill-muted-foreground text-[10px]"}>
              {category.axisLabel ?? category.label}
            </text>
          ))}
        </svg>
        <ChartTip open={focus != null} x={xOf(cursor ?? 0)} y={20}>
          {focus ? (
            <span>
              <span className="font-medium">{focus.label}</span>
              {series
                .filter((item) => !active || item.id === active)
                .map((item) => (
                  <span key={item.id} className="mt-0.5 block">
                    {item.label}: {withUnit(item.points.find((point) => point.key === focus.key)?.value ?? 0)}
                  </span>
                ))}
            </span>
          ) : null}
        </ChartTip>
      </div>
    </ChartCard>
  )
}
