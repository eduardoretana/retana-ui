"use client"

import { useId, useState } from "react"

import { Button } from "@/components/ui/button"
import { formatChartNumber, formatChartPercent } from "@/registry/retana/lib/chart-format"
import { clamp } from "@/registry/retana/lib/chart-geom"
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

export type RangePlanAction = {
  id: string
  label: string
  variant?: "default" | "outline"
  onClick?: () => void
}

export type RangePlanLabels = ChartStatusLabels & {
  value: string
  complement: string
  slider: string
  tip: (value: string, share: string) => string
}

export const rangePlanLabels: RangePlanLabels = {
  ...chartStatusLabels,
  value: "Chosen",
  complement: "Left",
  slider: "Choose an amount",
  tip: (value, share) => `${value} · ${share}`,
}

export const rangePlanLabelsEs: RangePlanLabels = {
  ...chartStatusLabelsEs,
  value: "Elegido",
  complement: "Restante",
  slider: "Elige una cantidad",
  tip: (value, share) => `${value} · ${share}`,
}

export type RangePlanProps = {
  title: string
  description?: string
  step?: string
  min?: number
  max?: number
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  locale?: string
  suffix?: string
  /** Formats the complement of the chosen value. Defaults to max − value. */
  formatComplement?: (value: number, max: number, locale: string | undefined) => string
  actions?: RangePlanAction[]
  onRetry?: () => void
  status?: ChartStatus
  labels?: Partial<RangePlanLabels>
  onMenu?: () => void
  className?: string
  classNames?: ChartCardClassNames
}

export function RangePlan({
  title,
  description,
  step,
  min = 0,
  max = 100,
  value,
  defaultValue,
  onValueChange,
  locale,
  suffix,
  formatComplement,
  actions,
  status = "ready",
  labels,
  onMenu,
  onRetry,
  className,
  classNames,
}: RangePlanProps) {
  const copy = { ...rangePlanLabels, ...labels }
  const sliderId = useId()
  const [internal, setInternal] = useState(defaultValue ?? min)
  const [dragging, setDragging] = useState(false)
  const current = value ?? internal
  const span = max - min || 1
  const ratio = clamp((current - min) / span, 0, 1)
  const amount = formatChartNumber(current, locale) + (suffix ? ` ${suffix}` : "")
  const complement = formatComplement ? formatComplement(current, max, locale) : formatChartPercent(1 - ratio, locale)
  const empty = !(max > min)
  const view = status !== "ready" ? status : empty ? "empty" : "ready"

  function commit(next: number) {
    if (value === undefined) setInternal(next)
    onValueChange?.(next)
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
      summary={`${copy.value} ${amount}. ${copy.complement} ${complement}.`}
      columns={[{ id: "value", label: copy.value }]}
      rows={[{ id: "plan", label: title, cells: { value: amount } }]}
      live={copy.tip(amount, formatChartPercent(ratio, locale))}
      kpis={
        <>
          <ChartKpi label={step ?? copy.value} value={amount} />
          <ChartKpi label={copy.complement} value={complement} />
        </>
      }
      footer={
        actions?.map((action) => (
          <Button key={action.id} type="button" size="sm" variant={action.variant ?? "default"} onClick={action.onClick}>
            {action.label}
          </Button>
        )) ?? null
      }
    >
      <div className="relative pt-10">
        <div className="mb-3 h-2 overflow-hidden rounded-full bg-muted" aria-hidden>
          <div className="h-full rounded-full bg-primary" style={{ width: `${ratio * 100}%` }} data-slot="range-plan-fill" />
        </div>
        <label className="sr-only" htmlFor={sliderId}>
          {copy.slider}
        </label>
        <input
          id={sliderId}
          data-slot="range-plan-slider"
          type="range"
          min={min}
          max={max}
          step={span > 20 ? 1 : 0.1}
          value={current}
          aria-valuetext={copy.tip(amount, formatChartPercent(ratio, locale))}
          onChange={(event) => {
            setDragging(true)
            commit(Number(event.target.value))
          }}
          onPointerDown={() => setDragging(true)}
          onPointerUp={() => setDragging(false)}
          onBlur={() => setDragging(false)}
          className="h-2 w-full cursor-pointer accent-primary"
        />
        <div className="mt-1 flex justify-between text-[10px] text-muted-foreground tabular-nums">
          <span>{formatChartNumber(min, locale)}</span>
          <span>{formatChartNumber(max, locale)}</span>
        </div>
        <ChartTip open={dragging || current !== min} x={`${ratio * 100}%`} y={28}>
          {copy.tip(amount, formatChartPercent(ratio, locale))}
        </ChartTip>
      </div>
    </ChartCard>
  )
}
