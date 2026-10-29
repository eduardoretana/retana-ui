"use client"

import { useId, useState } from "react"
import { motion } from "motion/react"

import { formatChartUnit, type ChartUnit } from "@/registry/retana/lib/chart-format"
import { extentWithZero, linePath, scaleLinear } from "@/registry/retana/lib/chart-geom"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  ChartCard,
  ChartKpi,
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

export type ComboPart = { id: string; label: string; value: number }
export type ComboPoint = { key: string; label: string; axisLabel?: string; bar: number; line: number; parts?: ComboPart[] }

export type ComboChartLabels = ChartStatusLabels & {
  bar: string
  line: string
  unit: string
  point: (label: string, bar: string, line: string) => string
}

export const comboChartLabels: ComboChartLabels = {
  ...chartStatusLabels,
  bar: "Bars",
  line: "Line",
  unit: "Unit",
  point: (label, bar, line) => `${label}. ${bar}. ${line}.`,
}

export const comboChartLabelsEs: ComboChartLabels = {
  ...chartStatusLabelsEs,
  bar: "Barras",
  line: "Línea",
  unit: "Unidad",
  point: (label, bar, line) => `${label}. ${bar}. ${line}.`,
}

export type ComboChartProps = {
  title: string
  description?: string
  points: ComboPoint[]
  units?: ChartUnit[]
  unitId?: string
  onUnitChange?: (id: string) => void
  locale?: string
  status?: ChartStatus
  labels?: Partial<ComboChartLabels>
  onActiveChange?: (key: string | null) => void
  onMenu?: () => void
  onRetry?: () => void
  height?: number
  className?: string
  classNames?: ChartCardClassNames
}

export function ComboChart({
  title,
  description,
  points,
  units,
  unitId,
  onUnitChange,
  locale,
  status = "ready",
  labels,
  onActiveChange,
  onMenu,
  onRetry,
  height = 200,
  className,
  classNames,
}: ComboChartProps) {
  const copy = { ...comboChartLabels, ...labels }
  const pattern = useId().replace(/:/g, "")
  const reduced = usePrefersReducedMotion()
  const { node: plotNode, width } = usePlotBox(320, height)
  const [internalUnit, setUnit] = useState(units?.[0]?.id ?? "")
  const [active, setActive] = useState<number | null>(null)
  const currentUnit = units?.find((unit) => unit.id === (unitId ?? internalUnit)) ?? units?.[0]
  const empty = points.length === 0
  const view = status !== "ready" ? status : empty ? "empty" : "ready"
  const values = points.flatMap((point) => [point.bar, point.line])
  const domain = extentWithZero(values)
  const base = scaleLinear(0, domain.min, domain.max, height - 24, 16)
  const slot = Math.max(1, (width - 16) / Math.max(1, points.length))
  const barWidth = Math.max(6, Math.min(18, slot * 0.45))
  const coords = points.map((point, index) => ({
    x: 12 + index * slot + slot / 2,
    y: scaleLinear(point.line, domain.min, domain.max, height - 24, 16),
  }))
  const focus = active != null ? points[active] : null
  const totalBar = points.reduce((sum, point) => sum + point.bar, 0)

  function chooseUnit(id: string) {
    if (unitId === undefined) setUnit(id)
    onUnitChange?.(id)
  }

  function choose(index: number | null) {
    setActive(index)
    onActiveChange?.(index != null ? points[index]?.key ?? null : null)
  }

  const barText = (value: number) => `${copy.bar} ${formatChartUnit(value, currentUnit, locale)}`
  const lineText = (value: number) => `${copy.line} ${formatChartUnit(value, currentUnit, locale)}`

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
      summary={points.map((point) => copy.point(point.label, barText(point.bar), lineText(point.line))).join(" ")}
      columns={[
        { id: "bar", label: copy.bar },
        { id: "line", label: copy.line },
      ]}
      rows={points.map((point) => ({
        id: point.key,
        label: point.label,
        cells: { bar: formatChartUnit(point.bar, currentUnit, locale), line: formatChartUnit(point.line, currentUnit, locale) },
      }))}
      live={focus ? copy.point(focus.label, barText(focus.bar), lineText(focus.line)) : undefined}
      kpis={
        <>
          <ChartKpi label={copy.bar} value={formatChartUnit(focus?.bar ?? totalBar, currentUnit, locale)} hint={focus?.label ?? currentUnit?.label} />
          <ChartKpi label={copy.line} value={formatChartUnit(focus?.line ?? points[points.length - 1]?.line ?? 0, currentUnit, locale)} />
        </>
      }
      controls={
        units && units.length > 1 ? (
          <Select value={unitId ?? internalUnit} onValueChange={chooseUnit}>
            <SelectTrigger size="sm" aria-label={copy.unit} className="w-full max-w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {units.map((unit) => (
                <SelectItem key={unit.id} value={unit.id}>
                  {unit.label}
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
        aria-label={title}
        aria-valuemin={1}
        aria-valuemax={Math.max(1, points.length)}
        aria-valuenow={(active ?? points.length - 1) + 1}
        aria-valuetext={focus ? copy.point(focus.label, barText(focus.bar), lineText(focus.line)) : copy.bar}
        onMouseLeave={() => choose(null)}
        onKeyDown={(event) => {
          if (!points.length || !["ArrowRight", "ArrowLeft", "Home", "End", "Escape"].includes(event.key)) return
          event.preventDefault()
          if (event.key === "Escape") {
            choose(null)
            return
          }
          const current = active ?? 0
          const next = event.key === "Home" ? 0 : event.key === "End" ? points.length - 1 : event.key === "ArrowRight" ? Math.min(points.length - 1, current + 1) : Math.max(0, current - 1)
          choose(next)
        }}
      >
        <svg width={width} height={height} aria-hidden>
          <SeriesPatterns id={pattern} />
          <line x1={8} x2={width - 8} y1={base} y2={base} className="stroke-border" strokeDasharray="3 4" />
          {points.map((point, index) => {
            const y = scaleLinear(point.bar, domain.min, domain.max, height - 24, 16)
            const bar = Math.abs(base - y)
            const top = Math.min(base, y)
            const x = 12 + index * slot + (slot - barWidth) / 2
            return (
              <motion.rect
                key={`${currentUnit?.id ?? "u"}-${point.key}`}
                data-slot="combo-bar"
                x={x}
                width={barWidth}
                rx={2}
                initial={reduced ? false : { height: 0, y: base }}
                animate={{ height: bar, y: top, opacity: active == null || active === index ? 1 : 0.35 }}
                transition={chartTransition(reduced)}
                fill={seriesPaint(pattern, 3)}
                onMouseEnter={() => choose(index)}
              />
            )
          })}
          <motion.path
            d={linePath(coords)}
            fill="none"
            stroke="var(--chart-1)"
            strokeWidth={2}
            initial={reduced ? false : { pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={chartTransition(reduced)}
          />
          {coords.map((coord, index) => (
            <circle key={points[index]?.key} cx={coord.x} cy={coord.y} r={active === index ? 4.5 : 0} fill="var(--chart-1)" className="stroke-background" strokeWidth={2} />
          ))}
          {points.map((point, index) => (
            <text key={point.key} x={12 + index * slot + slot / 2} y={height - 6} textAnchor="middle" className="fill-muted-foreground text-[10px]">
              {point.axisLabel ?? point.label}
            </text>
          ))}
        </svg>
        <ChartTip open={focus != null} x={coords[active ?? 0]?.x ?? 0} y={16}>
          {focus ? (
            <span className="block min-w-32">
              <span className="font-medium">{focus.label}</span>
              <span className="mt-1 block">{barText(focus.bar)}</span>
              <span className="block">{lineText(focus.line)}</span>
              {focus.parts && focus.parts.length > 0 ? (
                <span className="mt-1.5 flex h-8 items-end gap-0.5" data-slot="combo-mini">
                  {focus.parts.map((part, index) => {
                    const max = Math.max(...focus.parts!.map((item) => Math.abs(item.value)), 1)
                    return <span key={part.id} title={part.label} className="w-1.5 rounded-sm" style={{ height: `${(Math.abs(part.value) / max) * 100}%`, background: `var(--chart-${(index % 5) + 1})` }} />
                  })}
                </span>
              ) : null}
            </span>
          ) : null}
        </ChartTip>
      </div>
    </ChartCard>
  )
}
