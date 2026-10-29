"use client"

import { useId, useState } from "react"

import { formatChartNumber, formatChartPercent } from "@/registry/retana/lib/chart-format"
import { axialToPixel, hexBounds, hexPolygon } from "@/registry/retana/lib/hex-layout"
import { cn } from "@/lib/utils"
import {
  ChartCard,
  ChartKpi,
  ChartLegend,
  ChartTip,
  chartStatusLabels,
  chartStatusLabelsEs,
  dimOpacity,
  type ChartCardClassNames,
  type ChartStatus,
  type ChartStatusLabels,
} from "@/registry/retana/ui/chart-card"
import { SeriesPatterns, seriesPaint } from "@/registry/retana/ui/chart-marks"

export type HexSeries = { id: string; label: string; value: number }
export type HexCell = { id: string; q: number; r: number; seriesId: string; weight?: number }
export type HexRow = { id: string; label: string; value: number; seriesId?: string }

export type HexHeatmapLabels = ChartStatusLabels & {
  legend: string
  cell: (series: string, value: string) => string
  share: string
}

export const hexHeatmapLabels: HexHeatmapLabels = {
  ...chartStatusLabels,
  legend: "Series",
  cell: (series, value) => `${series}: ${value}`,
  share: "Share",
}

export const hexHeatmapLabelsEs: HexHeatmapLabels = {
  ...chartStatusLabelsEs,
  legend: "Series",
  cell: (series, value) => `${series}: ${value}`,
  share: "Parte",
}

export type HexHeatmapProps = {
  title: string
  description?: string
  series: HexSeries[]
  cells: HexCell[]
  rows?: HexRow[]
  locale?: string
  status?: ChartStatus
  labels?: Partial<HexHeatmapLabels>
  activeId?: string | null
  onActiveChange?: (id: string | null) => void
  onMenu?: () => void
  onRetry?: () => void
  className?: string
  classNames?: ChartCardClassNames
}

const SIZE = 16

export function HexHeatmap({
  title,
  description,
  series,
  cells,
  rows,
  locale,
  status = "ready",
  labels,
  activeId,
  onActiveChange,
  onMenu,
  onRetry,
  className,
  classNames,
}: HexHeatmapProps) {
  const copy = { ...hexHeatmapLabels, ...labels }
  const pattern = useId().replace(/:/g, "")
  const [internal, setInternal] = useState<string | null>(null)
  const [tip, setTip] = useState<{ id: string; x: number; y: number } | null>(null)
  const active = activeId !== undefined ? activeId : internal
  const total = series.reduce((sum, item) => sum + Math.max(0, item.value), 0)
  const tone = new Map(series.map((item, index) => [item.id, index]))
  const bounds = hexBounds(cells, SIZE, 4)
  const empty = series.length === 0 || cells.length === 0
  const view = status !== "ready" ? status : empty ? "empty" : "ready"

  function setActive(id: string | null) {
    if (activeId === undefined) setInternal(id)
    onActiveChange?.(id)
  }

  const summary = series.map((item) => `${item.label} ${formatChartNumber(item.value, locale)} (${formatChartPercent(total ? item.value / total : 0, locale)})`).join(", ")

  return (
    <ChartCard
      title={title}
      description={description}
      status={view}
      labels={copy}
      onMenu={onMenu}
      onRetry={onRetry}
      summary={summary || copy.empty}
      className={className}
      classNames={classNames}
      columns={series.map((item) => ({ id: item.id, label: item.label }))}
      rows={[{ id: "value", label: copy.share, cells: Object.fromEntries(series.map((item) => [item.id, formatChartNumber(item.value, locale)])) }]}
      live={tip ? copy.cell(series.find((item) => item.id === cells.find((cell) => cell.id === tip.id)?.seriesId)?.label ?? "", "") : undefined}
      kpis={
        <>
          {series.slice(0, 3).map((item) => (
            <ChartKpi key={item.id} label={item.label} value={formatChartPercent(total ? Math.max(0, item.value) / total : 0, locale)} hint={formatChartNumber(item.value, locale)} />
          ))}
        </>
      }
      legend={
        <ChartLegend
          label={copy.legend}
          activeId={active}
          onActiveChange={setActive}
          items={series.map((item, index) => ({
            id: item.id,
            label: item.label,
            tone: index,
            value: formatChartPercent(total ? Math.max(0, item.value) / total : 0, locale),
          }))}
        />
      }
    >
      <div className="relative mx-auto w-full max-w-sm">
        <svg viewBox={`${bounds.minX} ${bounds.minY} ${bounds.width} ${bounds.height}`} className="h-auto w-full" role="group" aria-label={title}>
          <SeriesPatterns id={pattern} />
          {cells.map((cell) => {
            const point = axialToPixel(cell.q, cell.r, SIZE)
            const index = tone.get(cell.seriesId) ?? 0
            const seriesItem = series.find((item) => item.id === cell.seriesId)
            const shown = !active || active === cell.seriesId
            const weight = cell.weight ?? 1
            return (
              <polygon
                key={cell.id}
                data-slot="hex-cell"
                data-series={cell.seriesId}
                points={hexPolygon(point.x, point.y, SIZE - 1.2)}
                fill={seriesPaint(pattern, index)}
                opacity={shown ? 0.4 + Math.min(1, Math.max(0, weight)) * 0.6 : dimOpacity(false)}
                className="origin-center outline-none transition-transform hover:scale-110 focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transition-none motion-reduce:hover:scale-100"
                tabIndex={0}
                role="button"
                aria-label={copy.cell(seriesItem?.label ?? cell.seriesId, formatChartNumber(seriesItem?.value ?? 0, locale))}
                aria-pressed={active === cell.seriesId}
                onMouseEnter={(event) => {
                  const rect = (event.currentTarget.ownerSVGElement as SVGSVGElement | null)?.getBoundingClientRect()
                  const box = event.currentTarget.getBoundingClientRect()
                  setTip({ id: cell.id, x: box.left + box.width / 2 - (rect?.left ?? 0), y: box.top - (rect?.top ?? 0) })
                }}
                onMouseLeave={() => setTip(null)}
                onFocus={(event) => {
                  const box = event.currentTarget.getBoundingClientRect()
                  const rect = (event.currentTarget.ownerSVGElement as SVGSVGElement | null)?.getBoundingClientRect()
                  setTip({ id: cell.id, x: box.left + box.width / 2 - (rect?.left ?? 0), y: box.top - (rect?.top ?? 0) })
                }}
                onBlur={() => setTip(null)}
                onClick={() => setActive(active === cell.seriesId ? null : cell.seriesId)}
              />
            )
          })}
        </svg>
        <ChartTip open={tip != null} x={tip?.x ?? 0} y={tip?.y ?? 0}>
          {tip
            ? copy.cell(
                series.find((item) => item.id === cells.find((cell) => cell.id === tip.id)?.seriesId)?.label ?? "",
                formatChartNumber(series.find((item) => item.id === cells.find((cell) => cell.id === tip.id)?.seriesId)?.value ?? 0, locale),
              )
            : null}
        </ChartTip>
      </div>
      {rows && rows.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1.5">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between gap-3 text-sm">
              <span className="min-w-0 truncate text-muted-foreground">{row.label}</span>
              <span className={cn("shrink-0 tabular-nums", active && row.seriesId && active !== row.seriesId && "opacity-40")}>{formatChartNumber(row.value, locale)}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </ChartCard>
  )
}
