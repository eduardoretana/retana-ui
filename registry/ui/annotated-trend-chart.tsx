"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDashboardValue, type DashboardFormat } from "@/registry/retana/lib/dashboard-format"

export type TrendPoint = { x: number | string; y: number }

export type TrendSeries = {
  id: string
  label: string
  points: readonly TrendPoint[]
  emphasis?: "primary" | "muted"
}

export type TrendBand = {
  from: number | string
  to: number | string
  label: string
  tone?: "highlight" | "secondary"
}

export type TrendMarker = { x: number | string; label: string }

export type AnnotatedTrendChartClassNames = {
  root?: string
  plot?: string
  tooltip?: string
  table?: string
}

export type AnnotatedTrendChartProps = {
  series: readonly TrendSeries[]
  /** Accessible name. A summary is appended from the primary series. */
  label: string
  target?: { y: number; label: string }
  bands?: readonly TrendBand[]
  markers?: readonly TrendMarker[]
  endLabel?: boolean
  yFormat?: DashboardFormat
  locale?: string
  currency?: string
  area?: boolean
  /** When false, muted series stay hidden. */
  compare?: boolean
  height?: number
  className?: string
  classNames?: AnnotatedTrendChartClassNames
}

function keyOf(value: number | string) {
  return String(value)
}

function smoothPath(points: { x: number; y: number }[]) {
  if (!points.length) return ""
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  let path = `M ${points[0].x.toFixed(2)} ${points[0].y.toFixed(2)}`
  for (let index = 0; index < points.length - 1; index += 1) {
    const p0 = points[index - 1] ?? points[index]
    const p1 = points[index]
    const p2 = points[index + 1]
    const p3 = points[index + 2] ?? p2
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    path += ` C ${c1x.toFixed(2)} ${c1y.toFixed(2)}, ${c2x.toFixed(2)} ${c2y.toFixed(2)}, ${p2.x.toFixed(2)} ${p2.y.toFixed(2)}`
  }
  return path
}

function buildSummary(label: string, primary: TrendSeries | undefined, format: (value: number) => string, target?: { y: number; label: string }) {
  if (!primary?.points.length) return label
  const first = primary.points[0]
  const last = primary.points[primary.points.length - 1]
  const direction = last.y === first.y ? "held" : last.y > first.y ? "rose" : "fell"
  const targetText = target ? `; ${target.label}` : ""
  return `${label}: ${primary.label} ${direction} from ${format(first.y)} to ${format(last.y)} over ${primary.points.length} points${targetText}`
}

export function AnnotatedTrendChart({
  series,
  label,
  target,
  bands = [],
  markers = [],
  endLabel = true,
  yFormat = "number",
  locale = "en-US",
  currency = "USD",
  area = true,
  compare = true,
  height = 220,
  className,
  classNames,
}: AnnotatedTrendChartProps) {
  const format = React.useCallback(
    (value: number) => formatDashboardValue(value, yFormat, locale, currency),
    [currency, locale, yFormat],
  )
  const visible = series.filter((line) => compare || line.emphasis !== "muted")
  const keys: string[] = []
  for (const line of visible) {
    for (const point of line.points) {
      const key = keyOf(point.x)
      if (!keys.includes(key)) keys.push(key)
    }
  }
  const [width, setWidth] = React.useState(640)
  const [index, setIndex] = React.useState<number | null>(null)
  const [tableOpen, setTableOpen] = React.useState(false)
  const plotRef = React.useRef<HTMLDivElement>(null)
  const gradientId = React.useId().replace(/:/g, "")

  React.useEffect(() => {
    const node = plotRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width
      if (next && next > 0) setWidth(next)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const compact = width < 360
  const pad = { left: 40, right: compact || !endLabel ? 12 : 72, top: 28, bottom: 28 }
  const innerW = Math.max(1, width - pad.left - pad.right)
  const innerH = Math.max(1, height - pad.top - pad.bottom)
  const values = visible.flatMap((line) => line.points.map((point) => point.y))
  if (target) values.push(target.y)
  const min = values.length ? Math.min(...values) : 0
  const max = values.length ? Math.max(...values) : 1
  const span = max - min || 1
  const yAt = (value: number) => pad.top + innerH - ((value - min) / span) * innerH
  const xAt = (key: string) => {
    const at = Math.max(0, keys.indexOf(key))
    const step = keys.length <= 1 ? 0 : at / (keys.length - 1)
    return pad.left + step * innerW
  }
  const primary = visible.find((line) => line.emphasis !== "muted") ?? visible[0]
  const summary = buildSummary(label, primary, format, target)
  const ticks = 4
  const yTicks = Array.from({ length: ticks }, (_, step) => min + (span * step) / (ticks - 1))
  const xTickCount = compact ? 2 : Math.min(4, keys.length)
  const xTicks = Array.from({ length: xTickCount }, (_, step) => keys[Math.round((step * (keys.length - 1)) / Math.max(1, xTickCount - 1))] ?? keys[0])

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!keys.length) return
    const last = keys.length - 1
    if (event.key === "Escape") {
      setIndex(null)
      return
    }
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
    event.preventDefault()
    setIndex((current) => {
      if (current == null) {
        if (event.key === "End" || event.key === "ArrowLeft") return last
        return 0
      }
      if (event.key === "Home") return 0
      if (event.key === "End") return last
      if (event.key === "ArrowRight") return Math.min(last, current + 1)
      return Math.max(0, current - 1)
    })
  }

  const activeKey = index != null ? keys[index] : null

  return (
    <div data-slot="annotated-trend-chart" className={cn("min-w-0", className, classNames?.root)}>
      <div ref={plotRef} className={cn("relative min-w-0", classNames?.plot)}>
        <div
          role="img"
          tabIndex={0}
          aria-label={summary}
          onKeyDown={onKeyDown}
          className="outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md"
        >
          <svg viewBox={`0 0 ${width} ${height}`} width="100%" height={height} className="block text-foreground" aria-hidden>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--chart-3)" stopOpacity="0.35" />
                <stop offset="1" stopColor="var(--chart-3)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {yTicks.map((tick) => (
              <g key={tick}>
                <line x1={pad.left} x2={width - pad.right} y1={yAt(tick)} y2={yAt(tick)} className="stroke-border" strokeDasharray="2 4" />
                <text x={pad.left - 6} y={yAt(tick) + 3} textAnchor="end" className="fill-muted-foreground text-[10px]">
                  {format(tick)}
                </text>
              </g>
            ))}
            {bands.map((band) => {
              const x1 = xAt(keyOf(band.from))
              const x2 = xAt(keyOf(band.to))
              const left = Math.min(x1, x2)
              return (
                <g key={band.label}>
                  <rect
                    x={left}
                    y={pad.top}
                    width={Math.max(2, Math.abs(x2 - x1))}
                    height={innerH}
                    className={band.tone === "secondary" ? "fill-chart-3" : "fill-chart-2"}
                    fillOpacity={0.25}
                  />
                  <text x={left + 4} y={pad.top + 12} className="fill-foreground text-[10px]">
                    {band.label}
                  </text>
                </g>
              )
            })}
            {target ? (
              <g>
                <line
                  x1={pad.left}
                  x2={width - pad.right}
                  y1={yAt(target.y)}
                  y2={yAt(target.y)}
                  className="stroke-destructive"
                  strokeDasharray="4 4"
                />
                <text x={width - pad.right} y={Math.max(12, yAt(target.y) - 6)} textAnchor="end" className="fill-destructive text-[10px]">
                  {target.label}
                </text>
              </g>
            ) : null}
            {visible.map((line) => {
              const points = line.points.map((point) => ({ x: xAt(keyOf(point.x)), y: yAt(point.y) }))
              const d = smoothPath(points)
              const muted = line.emphasis === "muted"
              const last = points[points.length - 1]
              const areaPath = points.length
                ? `${d} L ${points[points.length - 1].x.toFixed(2)} ${(pad.top + innerH).toFixed(2)} L ${points[0].x.toFixed(2)} ${(pad.top + innerH).toFixed(2)} Z`
                : ""
              return (
                <g key={line.id}>
                  {area && !muted && areaPath ? <path d={areaPath} fill={`url(#${gradientId})`} /> : null}
                  <path
                    d={d}
                    fill="none"
                    className={muted ? "stroke-chart-3" : "stroke-primary"}
                    strokeWidth={muted ? 1.5 : 2}
                    strokeOpacity={muted ? 0.7 : 1}
                    strokeLinejoin="round"
                    strokeLinecap="round"
                  />
                  {endLabel && !compact && muted && last ? (
                    <text x={last.x + 6} y={last.y + 4} className="fill-muted-foreground text-[10px]">
                      {line.label}
                    </text>
                  ) : null}
                </g>
              )
            })}
            {primary && primary.points.length ? (
              <g>
                {(() => {
                  const last = primary.points[primary.points.length - 1]
                  const x = xAt(keyOf(last.x))
                  const y = yAt(last.y)
                  return (
                    <>
                      <circle cx={x} cy={y} r="5" className="fill-chart-2 stroke-primary" strokeWidth="2" />
                      <rect x={x - 22} y={y - 26} width="44" height="16" rx="8" className="fill-primary" />
                      <text x={x} y={y - 15} textAnchor="middle" className="fill-primary-foreground text-[10px]">
                        {format(last.y)}
                      </text>
                    </>
                  )
                })()}
              </g>
            ) : null}
            {activeKey ? (
              <line x1={xAt(activeKey)} x2={xAt(activeKey)} y1={pad.top} y2={pad.top + innerH} className="stroke-foreground" strokeDasharray="2 3" />
            ) : null}
            {xTicks.filter(Boolean).map((key) => (
              <text key={key} x={xAt(key)} y={height - 8} textAnchor="middle" className="fill-muted-foreground text-[10px]">
                {key}
              </text>
            ))}
            {markers.map((marker) => (
              <text key={marker.label} x={xAt(keyOf(marker.x))} y={pad.top - 8} textAnchor="middle" className="fill-foreground text-[10px]">
                {marker.label}
              </text>
            ))}
          </svg>
        </div>
        {activeKey ? (
          <div
            data-slot="annotated-trend-tooltip"
            className={cn("mt-2 rounded-lg bg-popover px-3 py-2 text-xs text-popover-foreground shadow-sm ring-1 ring-foreground/10", classNames?.tooltip)}
          >
            <p className="font-medium">{activeKey}</p>
            <ul>
              {visible.map((line) => {
                const point = line.points.find((item) => keyOf(item.x) === activeKey)
                if (!point) return null
                return (
                  <li key={line.id}>
                    {line.label}: {format(point.y)}
                  </li>
                )
              })}
            </ul>
          </div>
        ) : null}
      </div>
      {compact && endLabel ? (
        <ul className="mt-2 flex flex-wrap gap-3 text-xs text-muted-foreground">
          {visible.map((line) => (
            <li key={line.id} className="inline-flex items-center gap-1">
              <span className={cn("h-0.5 w-4", line.emphasis === "muted" ? "bg-chart-3" : "bg-primary")} aria-hidden />
              {line.label}
            </li>
          ))}
        </ul>
      ) : null}
      <Button type="button" variant="ghost" size="sm" className="mt-2" aria-expanded={tableOpen} onClick={() => setTableOpen((open) => !open)}>
        {tableOpen ? "Hide data" : "View data"}
      </Button>
      <table className={cn("text-left text-sm", tableOpen ? "mt-2 w-full" : "sr-only", classNames?.table)}>
        <caption className="sr-only">{summary}</caption>
        <thead>
          <tr>
            <th scope="col">Point</th>
            {visible.map((line) => (
              <th key={line.id} scope="col">
                {line.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {keys.map((key) => (
            <tr key={key}>
              <th scope="row">{key}</th>
              {visible.map((line) => {
                const point = line.points.find((item) => keyOf(item.x) === key)
                return <td key={line.id}>{point ? format(point.y) : "—"}</td>
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
