"use client"

import { useState } from "react"

import { formatChartNumber, formatChartPercent } from "@/registry/retana/lib/chart-format"
import { seriesColor } from "@/registry/retana/lib/chart-series"
import {
  ChartCard,
  ChartKpi,
  ChartTip,
  chartStatusLabels,
  chartStatusLabelsEs,
  type ChartCardClassNames,
  type ChartStatus,
  type ChartStatusLabels,
} from "@/registry/retana/ui/chart-card"

export type DotMeterLabels = ChartStatusLabels & {
  filled: string
  limit: string
  cell: (share: string, cumulative: string, limit: string) => string
}

export const dotMeterLabels: DotMeterLabels = {
  ...chartStatusLabels,
  filled: "Filled",
  limit: "Limit",
  cell: (share, cumulative, limit) => `${share} · ${cumulative} of ${limit}`,
}

export const dotMeterLabelsEs: DotMeterLabels = {
  ...chartStatusLabelsEs,
  filled: "Cubierto",
  limit: "Límite",
  cell: (share, cumulative, limit) => `${share} · ${cumulative} de ${limit}`,
}

export type DotMeterProps = {
  title: string
  description?: string
  value: number
  limit: number
  cells?: number
  locale?: string
  suffix?: string
  status?: ChartStatus
  labels?: Partial<DotMeterLabels>
  onActiveChange?: (index: number | null) => void
  onMenu?: () => void
  onRetry?: () => void
  className?: string
  classNames?: ChartCardClassNames
}

export function DotMeter({
  title,
  description,
  value,
  limit,
  cells = 40,
  locale,
  suffix,
  status = "ready",
  labels,
  onActiveChange,
  onMenu,
  onRetry,
  className,
  classNames,
}: DotMeterProps) {
  const copy = { ...dotMeterLabels, ...labels }
  const [index, setIndex] = useState<number | null>(null)
  const count = Math.max(1, Math.round(cells))
  const cap = limit > 0 ? limit : 0
  const filled = cap > 0 ? Math.max(0, Math.min(count, Math.round((Math.max(0, value) / cap) * count))) : 0
  const empty = cap <= 0 && value <= 0
  const view = status !== "ready" ? status : empty ? "empty" : "ready"
  const unit = (amount: number) => formatChartNumber(amount, locale) + (suffix ? ` ${suffix}` : "")
  const active = index ?? filled - 1
  const cumulative = cap > 0 && active >= 0 ? ((active + 1) / count) * cap : 0
  const share = cap > 0 ? cumulative / cap : 0
  const tip = index != null ? copy.cell(formatChartPercent(share, locale), unit(cumulative), unit(cap)) : undefined

  function focusCell(next: number | null) {
    setIndex(next)
    onActiveChange?.(next)
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
      summary={`${copy.filled} ${unit(Math.max(0, value))} / ${unit(cap)}.`}
      columns={[{ id: "value", label: copy.filled }]}
      rows={[{ id: "meter", label: title, cells: { value: unit(Math.max(0, value)) } }]}
      live={tip}
      kpis={
        <>
          <ChartKpi label={copy.filled} value={formatChartPercent(cap ? Math.max(0, value) / cap : 0, locale)} hint={unit(Math.max(0, value))} />
          <ChartKpi label={copy.limit} value={unit(cap)} />
        </>
      }
    >
      <div className="relative">
        <div className="flex flex-wrap gap-1" role="listbox" aria-label={title}>
          {Array.from({ length: count }, (_, cell) => {
            const on = cell < filled
            const hot = index === cell
            return (
              <button
                key={cell}
                type="button"
                role="option"
                data-slot="dot-cell"
                data-filled={on}
                aria-selected={hot}
                aria-label={copy.cell(formatChartPercent((cell + 1) / count, locale), unit(((cell + 1) / count) * cap), unit(cap))}
                className="size-3.5 rounded-[4px] outline-none ring-foreground/10 focus-visible:ring-2 focus-visible:ring-ring"
                style={{
                  background: on ? seriesColor(0) : "var(--muted)",
                  transform: hot ? "scale(1.25)" : undefined,
                }}
                onMouseEnter={() => focusCell(cell)}
                onMouseLeave={() => focusCell(null)}
                onFocus={() => focusCell(cell)}
                onBlur={() => focusCell(null)}
              />
            )
          })}
        </div>
        <ChartTip open={index != null} x={16 + (index ?? 0) * 18} y={0}>
          {tip}
        </ChartTip>
      </div>
    </ChartCard>
  )
}
