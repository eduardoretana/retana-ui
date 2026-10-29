"use client"

import { useId, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type ReactNode } from "react"
import { CircleAlert, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { SeriesSwatch } from "@/registry/retana/ui/chart-marks"

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)"

function subscribeReduced(onStoreChange: () => void) {
  const media = window.matchMedia(REDUCE_QUERY)
  media.addEventListener("change", onStoreChange)
  return () => media.removeEventListener("change", onStoreChange)
}

export function usePrefersReducedMotion() {
  return useSyncExternalStore(subscribeReduced, () => window.matchMedia(REDUCE_QUERY).matches, () => false)
}

export function chartTransition(reduced: boolean) {
  if (reduced) return { duration: 0 }
  return { duration: motionPresets.duration.considered, ease: [...motionPresets.ease.enter] as [number, number, number, number] }
}

export type ChartStatus = "ready" | "loading" | "empty" | "error"

export type ChartStatusLabels = {
  loading: string
  empty: string
  error: string
  retry: string
  more: string
}

export const chartStatusLabels: ChartStatusLabels = {
  loading: "Loading",
  empty: "Nothing to show yet",
  error: "Could not load this chart",
  retry: "Try again",
  more: "More",
}

export const chartStatusLabelsEs: ChartStatusLabels = {
  loading: "Cargando",
  empty: "Todavía no hay datos",
  error: "No se pudo cargar el gráfico",
  retry: "Reintentar",
  more: "Más",
}

export type ChartSummaryColumn = { id: string; label: string }
export type ChartSummaryRow = { id: string; label: string; cells: Record<string, string> }

export type ChartCardClassNames = {
  root?: string
  header?: string
  title?: string
  description?: string
  kpis?: string
  controls?: string
  body?: string
  legend?: string
  insight?: string
  footer?: string
}

export type ChartCardProps = {
  title: string
  description?: string
  status?: ChartStatus
  labels?: Partial<ChartStatusLabels>
  onRetry?: () => void
  menuLabel?: string
  onMenu?: () => void
  menu?: ReactNode
  kpis?: ReactNode
  controls?: ReactNode
  legend?: ReactNode
  insight?: ReactNode
  footer?: ReactNode
  /** One-sentence description of the data, read with the chart. */
  summary: string
  tableCaption?: string
  columns?: ChartSummaryColumn[]
  rows?: ChartSummaryRow[]
  live?: string
  children?: ReactNode
  className?: string
  classNames?: ChartCardClassNames
}

export function ChartCard({
  title,
  description,
  status = "ready",
  labels,
  onRetry,
  menuLabel,
  onMenu,
  menu,
  kpis,
  controls,
  legend,
  insight,
  footer,
  summary,
  tableCaption,
  columns,
  rows,
  live,
  children,
  className,
  classNames,
}: ChartCardProps) {
  const uid = useId().replace(/:/g, "")
  const titleId = `${uid}-title`
  const summaryId = `${uid}-summary`
  const copy = { ...chartStatusLabels, ...labels }
  const root = `[data-chart-card="${uid}"]`

  return (
    <Card
      data-slot="chart-card"
      data-chart-card={uid}
      data-status={status}
      aria-labelledby={titleId}
      aria-describedby={summaryId}
      className={cn("w-full min-w-0 gap-3 rounded-2xl py-4 shadow-sm ring-foreground/10", classNames?.root, className)}
    >
      <style>{`
        @media (prefers-reduced-motion: reduce) {
          ${root}, ${root} * {
            animation: none !important;
            transition: none !important;
          }
        }
      `}</style>
      <header className={cn("flex items-start gap-3 px-4", classNames?.header)}>
        <div className="min-w-0 flex-1">
          <h2 id={titleId} data-slot="chart-card-title" className={cn("truncate text-base font-medium leading-snug", classNames?.title)}>
            {title}
          </h2>
          {description ? (
            <p className={cn("mt-0.5 text-xs text-muted-foreground", classNames?.description)}>{description}</p>
          ) : null}
        </div>
        {menu ??
          (onMenu ? (
            <Button type="button" variant="ghost" size="icon-xs" aria-label={menuLabel ?? copy.more} onClick={onMenu}>
              <MoreHorizontal />
            </Button>
          ) : null)}
      </header>
      {kpis ? <div className={cn("grid grid-cols-2 gap-3 px-4 sm:grid-cols-3", classNames?.kpis)}>{kpis}</div> : null}
      {controls ? <div className={cn("px-4", classNames?.controls)}>{controls}</div> : null}
      <div className={cn("min-w-0 px-4", classNames?.body)}>
        {status === "ready" ? (
          children
        ) : (
          <ChartState status={status} label={copy[status]} onRetry={status === "error" ? onRetry : undefined} retryLabel={copy.retry} />
        )}
      </div>
      {status === "ready" && legend ? <div className={cn("px-4", classNames?.legend)}>{legend}</div> : null}
      {status === "ready" && insight ? <div className={cn("px-4", classNames?.insight)}>{insight}</div> : null}
      {status === "ready" && footer ? <div className={cn("flex flex-wrap items-center gap-2 px-4", classNames?.footer)}>{footer}</div> : null}
      <p id={summaryId} className="sr-only">
        {summary}
      </p>
      {live ? (
        <p className="sr-only" aria-live="polite" aria-atomic="true" data-slot="chart-live">
          {live}
        </p>
      ) : null}
      {columns && rows && rows.length > 0 ? (
        <table className="sr-only">
          {tableCaption ? <caption>{tableCaption}</caption> : null}
          <thead>
            <tr>
              <th scope="col">{tableCaption ?? title}</th>
              {columns.map((column) => (
                <th key={column.id} scope="col">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id}>
                <th scope="row">{row.label}</th>
                {columns.map((column) => (
                  <td key={column.id}>{row.cells[column.id] ?? ""}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </Card>
  )
}

export function ChartState({
  status,
  label,
  onRetry,
  retryLabel,
}: {
  status: Exclude<ChartStatus, "ready">
  label: string
  onRetry?: () => void
  retryLabel: string
}) {
  return (
    <div
      data-slot="chart-state"
      data-status={status}
      className="flex min-h-36 flex-col items-center justify-center gap-3 rounded-xl border border-dashed px-4 py-6 text-center"
      role={status === "error" ? "alert" : "status"}
    >
      {status === "loading" ? (
        <div className="flex h-16 items-end gap-1.5" aria-hidden>
          {[40, 70, 52, 88, 60].map((height) => (
            <span key={height} className="w-3 rounded-sm bg-muted motion-safe:animate-pulse" style={{ height }} />
          ))}
        </div>
      ) : null}
      {status === "error" ? <CircleAlert className="size-5 text-destructive" aria-hidden /> : null}
      <p className="max-w-sm text-sm text-muted-foreground">{label}</p>
      {onRetry ? (
        <Button type="button" size="sm" variant="outline" onClick={onRetry}>
          {retryLabel}
        </Button>
      ) : null}
    </div>
  )
}

export function ChartKpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div data-slot="chart-kpi" className="min-w-0">
      <p className="truncate text-xs text-muted-foreground">{label}</p>
      <p className="truncate text-xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint ? <p className="truncate text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

export function ChartInsight({
  title,
  body,
  action,
}: {
  title: string
  body: string
  action?: ReactNode
}) {
  return (
    <div data-slot="chart-insight" className="flex items-start gap-3 rounded-xl bg-muted/70 p-3">
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{body}</p>
      </div>
      {action}
    </div>
  )
}

export type ChartLegendItem = {
  id: string
  label: string
  value?: string
  tone: number
}

export function ChartLegend({
  label,
  items,
  activeId,
  onActiveChange,
}: {
  label: string
  items: ChartLegendItem[]
  activeId?: string | null
  onActiveChange?: (id: string | null) => void
}) {
  const [focus, setFocus] = useState(0)
  const refs = useRef<Array<HTMLButtonElement | null>>([])

  function select(index: number) {
    const item = items[index]
    if (!item) return
    setFocus(index)
    refs.current[index]?.focus()
    onActiveChange?.(activeId === item.id ? null : item.id)
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!items.length) return
    const keys = ["ArrowRight", "ArrowLeft", "ArrowUp", "ArrowDown", "Home", "End"]
    if (!keys.includes(event.key)) return
    event.preventDefault()
    const next =
      event.key === "Home" ? 0 : event.key === "End" ? items.length - 1 : event.key === "ArrowRight" || event.key === "ArrowDown" ? (focus + 1) % items.length : (focus - 1 + items.length) % items.length
    select(next)
  }

  return (
    <div role="toolbar" aria-label={label} data-slot="chart-legend" className="flex flex-wrap gap-2" onKeyDown={onKeyDown}>
      {items.map((item, index) => {
        const pressed = activeId === item.id
        return (
          <button
            key={item.id}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            data-slot="chart-legend-item"
            aria-pressed={pressed}
            tabIndex={index === focus ? 0 : -1}
            className={cn(
              "inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full px-2 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring",
              pressed ? "bg-muted ring-1 ring-foreground/20" : "hover:bg-muted/70",
            )}
            onClick={() => select(index)}
          >
            <SeriesSwatch index={item.tone} />
            <span className="truncate">{item.label}</span>
            {item.value ? <span className="font-medium tabular-nums text-foreground">{item.value}</span> : null}
          </button>
        )
      })}
    </div>
  )
}

export function ChartTip({
  open,
  x,
  y,
  children,
}: {
  open: boolean
  x: number | string
  y: number | string
  children: ReactNode
}) {
  if (!open) return null
  return (
    <div
      data-slot="chart-tip"
      role="tooltip"
      className="pointer-events-none absolute z-10 max-w-[14rem] rounded-lg bg-foreground px-2.5 py-1.5 text-xs text-background shadow-md"
      style={{ left: x, top: y, transform: "translate(-50%, -110%)" }}
    >
      {children}
    </div>
  )
}

/** Measured plot width. `node` is the element ref; read `node.current` only in effects and events. */
export function usePlotBox(fallbackWidth = 320, fallbackHeight = 180) {
  const node = useRef<HTMLDivElement>(null)
  const [width, setWidth] = useState(fallbackWidth)
  useLayoutEffect(() => {
    const element = node.current
    if (!element) return
    const read = () => {
      const next = element.clientWidth
      if (next > 0) setWidth(next)
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(element)
    return () => observer.disconnect()
  }, [fallbackHeight])
  return { node, width }
}

export function dimOpacity(active: boolean) {
  return active ? 1 : 0.18
}
