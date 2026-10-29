"use client"

import { useId, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import { formatChartNumber } from "@/registry/retana/lib/chart-format"
import { wedgePath } from "@/registry/retana/lib/chart-geom"
import {
  ChartCard,
  ChartKpi,
  ChartLegend,
  chartStatusLabels,
  chartStatusLabelsEs,
  chartTransition,
  usePrefersReducedMotion,
  type ChartCardClassNames,
  type ChartStatus,
  type ChartStatusLabels,
} from "@/registry/retana/ui/chart-card"
import { SeriesPatterns, seriesPaint } from "@/registry/retana/ui/chart-marks"

export type PolarWedge = { id: string; label: string; value: number }
export type PolarSeries = { id: string; label: string; value: number; wedges: PolarWedge[] }

export type PolarAreaLabels = ChartStatusLabels & {
  legend: string
  center: string
  wedge: (series: string, label: string, value: string) => string
}

export const polarAreaLabels: PolarAreaLabels = {
  ...chartStatusLabels,
  legend: "Series",
  center: "Total",
  wedge: (series, label, value) => `${series}, ${label}: ${value}`,
}

export const polarAreaLabelsEs: PolarAreaLabels = {
  ...chartStatusLabelsEs,
  legend: "Series",
  center: "Total",
  wedge: (series, label, value) => `${series}, ${label}: ${value}`,
}

export type PolarAreaProps = {
  title: string
  description?: string
  series: PolarSeries[]
  locale?: string
  suffix?: string
  status?: ChartStatus
  labels?: Partial<PolarAreaLabels>
  activeId?: string | null
  onActiveChange?: (id: string | null) => void
  onMenu?: () => void
  onRetry?: () => void
  className?: string
  classNames?: ChartCardClassNames
}

export function PolarArea({
  title,
  description,
  series,
  locale,
  suffix,
  status = "ready",
  labels,
  activeId,
  onActiveChange,
  onMenu,
  onRetry,
  className,
  classNames,
}: PolarAreaProps) {
  const copy = { ...polarAreaLabels, ...labels }
  const pattern = useId().replace(/:/g, "")
  const reduced = usePrefersReducedMotion()
  const [internal, setInternal] = useState(series[0]?.id ?? "")
  const [wedge, setWedge] = useState<string | null>(null)
  const active = activeId !== undefined && activeId != null ? activeId : internal || series[0]?.id
  const current = series.find((item) => item.id === active) ?? series[0]
  const empty = series.length === 0 || !current || current.wedges.length === 0
  const view = status !== "ready" ? status : empty ? "empty" : "ready"
  const withUnit = (value: number) => formatChartNumber(value, locale) + (suffix ? ` ${suffix}` : "")
  const max = Math.max(1, ...(current?.wedges.map((item) => Math.max(0, item.value)) ?? [1]))
  const size = 220
  const cx = size / 2
  const cy = size / 2
  const outer = 78
  const inner = 36
  const hovered = current?.wedges.find((item) => item.id === wedge)
  const center = hovered ? withUnit(hovered.value) : withUnit(current?.value ?? 0)

  function setActive(id: string | null) {
    const next = id ?? series[0]?.id ?? ""
    if (activeId === undefined) setInternal(next)
    onActiveChange?.(id)
    setWedge(null)
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
      summary={series.map((item) => `${item.label} ${withUnit(item.value)}`).join(", ")}
      columns={[{ id: "value", label: copy.center }]}
      rows={(current?.wedges ?? []).map((item) => ({ id: item.id, label: item.label, cells: { value: withUnit(item.value) } }))}
      live={hovered && current ? copy.wedge(current.label, hovered.label, withUnit(hovered.value)) : center}
      kpis={
        <>
          {series.slice(0, 2).map((item) => (
            <ChartKpi key={item.id} label={item.label} value={withUnit(item.value)} />
          ))}
        </>
      }
      legend={
        <ChartLegend
          label={copy.legend}
          activeId={current?.id}
          onActiveChange={setActive}
          items={series.map((item, index) => ({ id: item.id, label: item.label, tone: index, value: withUnit(item.value) }))}
        />
      }
    >
      <div className="relative mx-auto w-full max-w-[16rem]">
        <svg viewBox={`0 0 ${size} ${size}`} className="h-auto w-full" role="group" aria-label={title}>
          <SeriesPatterns id={pattern} />
          <AnimatePresence mode="wait">
            <motion.g
              key={current?.id}
              initial={reduced ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduced ? undefined : { opacity: 0 }}
              transition={chartTransition(reduced)}
              style={{ transformOrigin: `${cx}px ${cy}px` }}
            >
              {current?.wedges.map((item, index) => {
                const count = current.wedges.length || 1
                const start = -Math.PI / 2 + (index / count) * Math.PI * 2
                const end = start + (Math.PI * 2) / count - 0.03
                const radius = inner + (outer - inner) * (Math.max(0, item.value) / max)
                const hot = !wedge || wedge === item.id
                return (
                  <path
                    key={item.id}
                    data-slot="polar-wedge"
                    d={wedgePath(cx, cy, inner, radius, start, end)}
                    fill={seriesPaint(pattern, index)}
                    opacity={hot ? 1 : 0.28}
                    className="outline-none focus-visible:stroke-ring"
                    stroke="var(--background)"
                    strokeWidth={2}
                    tabIndex={0}
                    role="button"
                    aria-label={copy.wedge(current.label, item.label, withUnit(item.value))}
                    onMouseEnter={() => setWedge(item.id)}
                    onMouseLeave={() => setWedge(null)}
                    onFocus={() => setWedge(item.id)}
                    onBlur={() => setWedge(null)}
                  />
                )
              })}
            </motion.g>
          </AnimatePresence>
        </svg>
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <p className="text-center text-lg font-semibold tabular-nums" data-slot="polar-center">
            {center}
          </p>
        </div>
      </div>
    </ChartCard>
  )
}
