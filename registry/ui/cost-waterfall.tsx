"use client"

/**
 * Where the money and tokens of one agent run went.
 * Clean-room. Affect UI's Cost Waterfall is Pro and was not copied.
 * Bars move with translateX and scaleX. Width is never animated.
 */

import * as React from "react"
import { AlertCircle, Bot, Check, ChevronRight, Clock, Download, Loader2, Save, Sparkles, Wrench } from "lucide-react"
import type { LucideIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { downloadCsv } from "@/registry/retana/lib/csv"
import { useCostRun } from "@/registry/retana/hooks/use-cost-run"
import { SegmentedControl } from "@/registry/retana/ui/segmented-control"
import {
  cacheSavings,
  formatLatency,
  formatMicro,
  formatTokenCount,
  layoutWaterfall,
  microRatio,
  ownCost,
  rollupRun,
  runToCsv,
  runToJson,
  tokenCount,
  type CostMeasure,
  type MoneyFormat,
  type PricingTable,
  type Run,
  type RunEvent,
  type RunStatus,
  type RunStep,
  type StepStatus,
  type WaterfallRow,
} from "@/registry/retana/lib/cost-waterfall"

const KIND_ICON: Record<string, LucideIcon> = { llm: Sparkles, tool: Wrench, save: Save, agent: Bot }

export type CostWaterfallLabels = {
  title: string
  measure: string
  cost: string
  tokens: string
  status: Record<RunStatus, string>
  stepStatus: Record<StepStatus, string>
  totalCost: string
  totalTokens: string
  tokenSplit: (input: string, output: string) => string
  mostExpensive: string
  cacheSavings: string
  step: string
  model: string
  in: string
  out: string
  cache: string
  waterfall: string
  time: string
  top: string
  hidden: (count: number) => string
  input: string
  output: string
  emptyTitle: string
  emptyBody: string
  loading: string
  exportJson: string
  exportCsv: string
  showWaterfall: string
  hideWaterfall: string
  grid: string
  bar: (name: string, value: string) => string
  row: (name: string, kind: string, status: string, cost: string, tokens: string, time: string) => string
  kinds: Record<string, string>
  stepRunning: (name: string) => string
  stepFailed: (name: string, error: string) => string
  runDone: string
  runFailed: string
  noModel: string
  retry: string
}

export const costWaterfallLabelsEn: CostWaterfallLabels = {
  title: "Run cost",
  measure: "Measure",
  cost: "Cost",
  tokens: "Tokens",
  status: { queued: "Queued", live: "Live", done: "Done", error: "Error" },
  stepStatus: { queued: "Queued", running: "Running", success: "Done", error: "Error", skipped: "Skipped" },
  totalCost: "Total cost",
  totalTokens: "Total tokens",
  tokenSplit: (input, output) => `${input} in / ${output} out`,
  mostExpensive: "Most expensive",
  cacheSavings: "Cache savings",
  step: "Step",
  model: "Model",
  in: "In",
  out: "Out",
  cache: "Cache",
  waterfall: "Waterfall",
  time: "Time",
  top: "TOP",
  hidden: (count) => `+${count}`,
  input: "Input",
  output: "Output",
  emptyTitle: "This run has no steps yet.",
  emptyBody: "Steps show up here as the agent works.",
  loading: "Loading the run cost",
  exportJson: "Export JSON",
  exportCsv: "Export CSV",
  showWaterfall: "Show waterfall",
  hideWaterfall: "Hide waterfall",
  grid: "Run steps",
  bar: (name, value) => `${name} adds ${value} on the waterfall`,
  row: (name, kind, status, cost, tokens, time) => `${name}, ${kind}, ${status}, ${cost}, ${tokens}, ${time}`,
  kinds: { llm: "Model", tool: "Tool", save: "Save", agent: "Agent", unknown: "Step" },
  stepRunning: (name) => `${name} is running`,
  stepFailed: (name, error) => `${name} failed. ${error}`,
  runDone: "The run is done",
  runFailed: "The run finished with an error",
  noModel: "No model",
  retry: "Try again",
}

export const costWaterfallLabelsEs: CostWaterfallLabels = {
  title: "Costo de la corrida",
  measure: "Medida",
  cost: "Costo",
  tokens: "Tokens",
  status: { queued: "En cola", live: "En vivo", done: "Listo", error: "Error" },
  stepStatus: { queued: "En cola", running: "En curso", success: "Listo", error: "Error", skipped: "Omitido" },
  totalCost: "Costo total",
  totalTokens: "Tokens totales",
  tokenSplit: (input, output) => `${input} entrada / ${output} salida`,
  mostExpensive: "Más caro",
  cacheSavings: "Ahorro de caché",
  step: "Paso",
  model: "Modelo",
  in: "Entrada",
  out: "Salida",
  cache: "Caché",
  waterfall: "Cascada",
  time: "Tiempo",
  top: "TOP",
  hidden: (count) => `+${count}`,
  input: "Entrada",
  output: "Salida",
  emptyTitle: "Esta corrida todavía no tiene pasos.",
  emptyBody: "Los pasos aparecen aquí cuando el agente trabaja.",
  loading: "Cargando el costo de la corrida",
  exportJson: "Exportar JSON",
  exportCsv: "Exportar CSV",
  showWaterfall: "Mostrar cascada",
  hideWaterfall: "Ocultar cascada",
  grid: "Pasos de la corrida",
  bar: (name, value) => `${name} aporta ${value} en la cascada`,
  row: (name, kind, status, cost, tokens, time) => `${name}, ${kind}, ${status}, ${cost}, ${tokens}, ${time}`,
  kinds: { llm: "Modelo", tool: "Herramienta", save: "Guardado", agent: "Agente", unknown: "Paso" },
  stepRunning: (name) => `${name} está en curso`,
  stepFailed: (name, error) => `${name} falló. ${error}`,
  runDone: "La corrida terminó",
  runFailed: "La corrida terminó con un error",
  noModel: "Sin modelo",
  retry: "Reintentar",
}

export type CostWaterfallClassNames = { root?: string; header?: string; grid?: string; row?: string; waterfall?: string }

export type CostWaterfallProps = {
  run?: Run
  pricing?: PricingTable
  events?: AsyncIterable<RunEvent> | null
  money?: MoneyFormat
  mode?: CostMeasure
  defaultMode?: CostMeasure
  onModeChange?: (mode: CostMeasure) => void
  collapsed?: readonly string[]
  defaultCollapsed?: readonly string[]
  onCollapsedChange?: (ids: string[]) => void
  openId?: string | null
  defaultOpenId?: string | null
  onOpenChange?: (id: string | null) => void
  waterfallOpen?: boolean
  defaultWaterfallOpen?: boolean
  onWaterfallOpenChange?: (open: boolean) => void
  loading?: boolean
  error?: string
  onRetry?: () => void
  labels?: Partial<CostWaterfallLabels>
  className?: string
  classNames?: CostWaterfallClassNames
  /** Scrollport height in pixels. Null shows every row. */
  maxHeight?: number | null
}

const EMPTY_RUN: Run = { id: "empty", title: "", status: "queued", steps: [] }

function mergeLabels(partial?: Partial<CostWaterfallLabels>): CostWaterfallLabels {
  return {
    ...costWaterfallLabelsEn,
    ...partial,
    status: { ...costWaterfallLabelsEn.status, ...partial?.status },
    stepStatus: { ...costWaterfallLabelsEn.stepStatus, ...partial?.stepStatus },
    kinds: { ...costWaterfallLabelsEn.kinds, ...partial?.kinds },
  }
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const current = value !== undefined ? value : uncontrolled
  const setValue = React.useCallback(
    (next: T) => {
      if (value === undefined) setUncontrolled(next)
      onChange?.(next)
    },
    [onChange, value],
  )
  return [current, setValue] as const
}

function expandPath(collapsed: readonly string[], id: string, steps: readonly RunStep[]) {
  const next = new Set(collapsed)
  next.delete(id)
  const guard = new Set<string>()
  let parent = steps.find((step) => step.id === id)?.parentId
  while (parent && !guard.has(parent)) {
    guard.add(parent)
    next.delete(parent)
    parent = steps.find((step) => step.id === parent)?.parentId
  }
  return [...next]
}

function place(start: bigint, end: bigint, origin: bigint, domain: bigint) {
  const left = start < end ? start : end
  const right = start < end ? end : start
  const from = left - origin
  return { x: microRatio(from > 0n ? from : 0n, domain) * 100, scale: microRatio(right - left, domain) }
}

function downloadText(filename: string, content: string, type: string) {
  if (typeof document === "undefined") return
  const blob = new Blob([content], { type })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

function kindLabel(labels: CostWaterfallLabels, kind: string) {
  return labels.kinds[kind] ?? kind
}

function StatusIcon({ status }: { status: StepStatus }) {
  if (status === "running") return <Loader2 aria-hidden className="size-3.5 motion-safe:animate-spin" />
  if (status === "error") return <AlertCircle aria-hidden className="size-3.5" />
  if (status === "success") return <Check aria-hidden className="size-3.5" />
  if (status === "skipped") return <span aria-hidden className="text-xs">–</span>
  return <Clock aria-hidden className="size-3.5" />
}

const WIDE = "grid-cols-[minmax(0,1.3fr)_minmax(0,0.8fr)_auto_auto_auto_minmax(7rem,1.3fr)_auto_auto]"
const MEDIUM = "grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(6rem,1fr)_auto]"
const STACK = "grid-cols-[minmax(0,1fr)_auto]"

export function CostWaterfall({
  run,
  pricing,
  events,
  money: moneyProp,
  mode: modeProp,
  defaultMode = "cost",
  onModeChange,
  collapsed: collapsedProp,
  defaultCollapsed = [],
  onCollapsedChange,
  openId: openProp,
  defaultOpenId = null,
  onOpenChange,
  waterfallOpen: waterfallProp,
  defaultWaterfallOpen = true,
  onWaterfallOpenChange,
  loading = false,
  error,
  onRetry,
  labels: labelOverrides,
  className,
  classNames,
  maxHeight = 480,
}: CostWaterfallProps) {
  const labels = mergeLabels(labelOverrides)
  const money = React.useMemo<MoneyFormat>(() => {
    const next: MoneyFormat = { locale: moneyProp?.locale ?? "en-US", currency: moneyProp?.currency ?? pricing?.currency ?? "USD" }
    if (moneyProp?.fx) next.fx = moneyProp.fx
    return next
  }, [moneyProp, pricing?.currency])
  const streamed = useCostRun(run ?? EMPTY_RUN, events)
  const shown = events ? streamed.run : (run ?? EMPTY_RUN)
  const [mode, setMode] = useControllable(modeProp, defaultMode, onModeChange)
  const [collapsed, setCollapsed] = useControllable(collapsedProp, defaultCollapsed, onCollapsedChange)
  const [openId, setOpenId] = useControllable(openProp, defaultOpenId, onOpenChange)
  const [waterfallOpen, setWaterfallOpen] = useControllable(waterfallProp, defaultWaterfallOpen, onWaterfallOpenChange)
  const [hoverId, setHoverId] = React.useState<string | null>(null)
  const [canHover, setCanHover] = React.useState(false)
  const [width, setWidth] = React.useState(1280)
  const [focusId, setFocusId] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const rootRef = React.useRef<HTMLDivElement>(null)
  const buttons = React.useRef(new Map<string, HTMLButtonElement>())
  const seenErrors = React.useRef(new Set<string>())
  const previous = React.useRef("")

  React.useEffect(() => {
    const media = window.matchMedia("(hover: hover) and (pointer: fine)")
    const apply = () => setCanHover(media.matches)
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])

  React.useEffect(() => {
    const node = rootRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => setWidth(entry?.contentRect.width ?? node.clientWidth))
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const rollup = React.useMemo(() => rollupRun(shown, pricing), [shown, pricing])
  const layout = React.useMemo(() => layoutWaterfall(shown, pricing, mode, collapsed), [shown, pricing, mode, collapsed])
  const byStep = React.useMemo(() => new Map(shown.steps.map((step) => [step.id, step])), [shown.steps])
  const rows = layout.rows.flatMap((row) => {
    const step = byStep.get(row.id)
    return step ? [{ ...row, step }] : []
  })
  const narrow = width < 720
  const stacked = width < 480
  const columns = stacked ? STACK : narrow ? MEDIUM : WIDE

  React.useEffect(() => {
    for (const step of shown.steps) {
      if (step.status !== "error" || seenErrors.current.has(step.id)) continue
      seenErrors.current.add(step.id)
      setCollapsed(expandPath(collapsed, step.id, shown.steps))
      setOpenId(step.id)
    }
  }, [collapsed, setCollapsed, setOpenId, shown.steps])

  React.useEffect(() => {
    const signature = `${shown.status}|${shown.steps.map((step) => `${step.id}:${step.status}`).join(",")}`
    if (signature === previous.current) return
    const prior = previous.current
    previous.current = signature
    if (!prior) return
    const running = shown.steps.find((step) => step.status === "running")
    const failed = shown.steps.find((step) => step.status === "error")
    if (shown.status === "done") setAnnouncement(labels.runDone)
    else if (shown.status === "error" && failed) setAnnouncement(labels.stepFailed(failed.name, failed.error ?? labels.status.error))
    else if (running) setAnnouncement(labels.stepRunning(running.name))
  }, [labels, shown.status, shown.steps])

  function focusRow(id: string) {
    setFocusId(id)
    buttons.current.get(id)?.focus()
  }

  function activate(id: string) {
    const kids = shown.steps.some((item) => item.parentId === id)
    const isCollapsed = collapsed.includes(id)
    if (kids && isCollapsed) {
      setCollapsed(collapsed.filter((item) => item !== id))
      setOpenId(id)
      return
    }
    if (kids && !isCollapsed) {
      setCollapsed([...collapsed, id])
      if (openId === id) setOpenId(null)
      return
    }
    setOpenId(openId === id ? null : id)
  }

  function onRowKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, row: WaterfallRow & { step: RunStep }) {
    const index = rows.findIndex((item) => item.id === row.id)
    const kids = shown.steps.some((item) => item.parentId === row.id)
    const isCollapsed = collapsed.includes(row.id)
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault()
      const nextIndex = event.key === "Home" ? 0 : event.key === "End" ? rows.length - 1 : event.key === "ArrowDown" ? Math.min(rows.length - 1, index + 1) : Math.max(0, index - 1)
      const next = rows[nextIndex]
      if (next) focusRow(next.id)
      return
    }
    if (event.key === "ArrowRight") {
      event.preventDefault()
      if (kids && isCollapsed) {
        setCollapsed(collapsed.filter((item) => item !== row.id))
        return
      }
      const child = rows.find((item) => item.step.parentId === row.id)
      if (child) focusRow(child.id)
      return
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      if (kids && !isCollapsed) {
        setCollapsed([...collapsed, row.id])
        return
      }
      if (row.step.parentId) focusRow(row.step.parentId)
      return
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      activate(row.id)
    }
  }

  function revealExpensive() {
    if (!rollup.mostExpensiveId) return
    setCollapsed(expandPath(collapsed, rollup.mostExpensiveId, shown.steps))
    setOpenId(rollup.mostExpensiveId)
    focusRow(rollup.mostExpensiveId)
  }

  const winner = shown.steps.find((step) => step.id === rollup.mostExpensiveId)
  const moneyOf = (value: bigint) => formatMicro(value, money)
  const tokensOf = (value: number) => formatTokenCount(value, money.locale)

  return (
    <div ref={rootRef} className="w-full min-w-0">
      <Card data-slot="cost-waterfall" data-status={shown.status} data-mode={mode} data-waterfall={waterfallOpen ? "open" : "closed"} className={cn("@container touch-pan-y", className, classNames?.root)}>
        <style>{"@keyframes retana-cost-in{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}"}</style>
        <CardHeader className={cn("gap-3", classNames?.header)}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <h2 className="min-w-0 text-base font-medium text-balance">{shown.title || labels.title}</h2>
            <div className="flex flex-wrap items-center gap-2">
              <SegmentedControl
                label={labels.measure}
                value={mode}
                onValueChange={(value) => {
                  if (value === "cost" || value === "tokens") setMode(value)
                }}
                options={[{ value: "cost", label: labels.cost }, { value: "tokens", label: labels.tokens }]}
              />
              <Badge variant={shown.status === "error" ? "destructive" : shown.status === "done" ? "secondary" : "outline"}>
                {shown.status === "error" ? <AlertCircle aria-hidden /> : shown.status === "done" ? <Check aria-hidden /> : shown.status === "live" ? <Loader2 aria-hidden className="motion-safe:animate-spin" /> : <Clock aria-hidden />}
                {labels.status[shown.status]}
              </Badge>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" size="sm" onClick={() => downloadText(`${shown.id || "run"}.json`, runToJson(shown, pricing), "application/json")}>
              <Download data-icon="inline-start" aria-hidden />
              {labels.exportJson}
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={() => downloadCsv(`${shown.id || "run"}.csv`, runToCsv(shown, pricing))}>
              <Download data-icon="inline-start" aria-hidden />
              {labels.exportCsv}
            </Button>
            <Button type="button" variant="outline" size="sm" aria-pressed={waterfallOpen} onClick={() => setWaterfallOpen(!waterfallOpen)}>
              {waterfallOpen ? labels.hideWaterfall : labels.showWaterfall}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4">
          <dl className="grid gap-3 sm:grid-cols-3">
            <div className="grid gap-1">
              <dt className="text-xs text-muted-foreground">{labels.totalCost}</dt>
              <dd className="text-lg font-medium tabular-nums">{moneyOf(rollup.totalCost)}</dd>
              <p className="text-xs text-muted-foreground tabular-nums">{labels.cacheSavings}: {moneyOf(rollup.cacheSavings)}</p>
            </div>
            <div className="grid gap-1">
              <dt className="text-xs text-muted-foreground">{labels.totalTokens}</dt>
              <dd className="text-lg font-medium tabular-nums">{tokensOf(rollup.totalTokens)}</dd>
              <p className="text-xs text-muted-foreground tabular-nums">{labels.tokenSplit(tokensOf(rollup.tokensIn), tokensOf(rollup.tokensOut))}</p>
            </div>
            <div className="grid gap-1">
              <dt className="text-xs text-muted-foreground">{labels.mostExpensive}</dt>
              <dd>
                {winner ? (
                  <button type="button" className="min-h-11 text-start text-sm font-medium underline-offset-2 hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={revealExpensive}>
                    <span className="line-clamp-2">{winner.name}</span>
                    <span className="mt-0.5 block tabular-nums text-muted-foreground">{moneyOf(ownCost(winner, pricing))}</span>
                  </button>
                ) : (
                  <span className="text-sm text-muted-foreground">—</span>
                )}
              </dd>
            </div>
          </dl>
          <Separator />
          {error ? (
            <div role="alert" className="grid justify-items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              <p>{error}</p>
              {onRetry ? <Button type="button" variant="outline" size="sm" onClick={onRetry}>{labels.retry}</Button> : null}
            </div>
          ) : null}
          {loading ? (
            <div aria-busy="true" aria-label={labels.loading} className="grid gap-2">
              <Skeleton className="h-8 w-full motion-reduce:animate-none" />
              <Skeleton className="h-8 w-full motion-reduce:animate-none" />
              <Skeleton className="h-24 w-full motion-reduce:animate-none" />
            </div>
          ) : null}
          {!loading && !error && shown.steps.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
                <EmptyDescription>{labels.emptyBody}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}
          {!loading && !error && shown.steps.length > 0 ? (
            <ScrollArea className="w-full touch-pan-y" style={maxHeight == null ? undefined : { height: maxHeight }}>
              <div role="treegrid" aria-label={labels.grid} aria-rowcount={rows.length + 1} aria-colcount={stacked ? 2 : narrow ? 4 : 8} className={cn("min-w-0 text-sm", classNames?.grid)}>
                <div role="row" className={cn("grid items-end gap-2 border-b border-border px-2 py-1 text-xs text-muted-foreground", columns)}>
                  <div role="columnheader">{labels.step}</div>
                  {stacked ? null : <div role="columnheader">{labels.model}</div>}
                  {stacked || narrow ? null : <div role="columnheader" className="text-end">{labels.in}</div>}
                  {stacked || narrow ? null : <div role="columnheader" className="text-end">{labels.out}</div>}
                  {stacked || narrow ? null : <div role="columnheader" className="text-end">{labels.cache}</div>}
                  {stacked || !waterfallOpen ? null : <div role="columnheader">{labels.waterfall}</div>}
                  <div role="columnheader" className="text-end">{mode === "tokens" ? labels.tokens : labels.cost}</div>
                  {stacked ? null : <div role="columnheader" className="text-end">{labels.time}</div>}
                </div>
                {rows.map((row) => {
                  const siblings = rows.filter((item) => item.step.parentId === row.step.parentId)
                  const siblingIndex = Math.max(0, siblings.findIndex((item) => item.id === row.id))
                  const hasKids = shown.steps.some((item) => item.parentId === row.id)
                  const isCollapsed = collapsed.includes(row.id)
                  const detailOpen = openId === row.id || (canHover && hoverId === row.id)
                  const cost = ownCost(row.step, pricing)
                  const savings = cacheSavings(row.step, pricing)
                  const Icon = KIND_ICON[row.step.kind] ?? Sparkles
                  const valueText = mode === "tokens" ? tokensOf(tokenCount(row.step)) : moneyOf(cost)
                  const focused = (focusId ?? rows[0]?.id) === row.id
                  const solid = place(row.ownStart, row.ownEnd, layout.origin, layout.domain)
                  const span = place(row.spanStart, row.spanEnd, layout.origin, layout.domain)
                  const showFaint = hasKids && !isCollapsed && span.scale > 0
                  return (
                    <div
                      key={row.id}
                      role="row"
                      aria-level={row.depth}
                      aria-posinset={siblingIndex + 1}
                      aria-setsize={Math.max(siblings.length, 1)}
                      data-step={row.id}
                      data-status={row.step.status}
                      className={cn("border-b border-border motion-safe:animate-[retana-cost-in_180ms_ease-out]", classNames?.row)}
                      onPointerEnter={() => setHoverId(row.id)}
                      onPointerLeave={() => setHoverId((current) => (current === row.id ? null : current))}
                    >
                      <div className={cn("grid items-center gap-2 px-2 py-1", columns)}>
                        <div role="gridcell" className="min-w-0" style={{ paddingInlineStart: `${Math.min(row.depth - 1, 8) * 12}px` }}>
                          <button
                            ref={(node) => {
                              if (node) buttons.current.set(row.id, node)
                              else buttons.current.delete(row.id)
                            }}
                            type="button"
                            tabIndex={focused ? 0 : -1}
                            className="flex min-h-11 w-full min-w-0 items-center gap-2 rounded-md text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            aria-expanded={hasKids ? !isCollapsed : undefined}
                            aria-label={labels.row(row.step.name, kindLabel(labels, row.step.kind), labels.stepStatus[row.step.status], moneyOf(cost), tokensOf(tokenCount(row.step)), formatLatency(row.step.latencyMs, money.locale))}
                            onClick={() => activate(row.id)}
                            onKeyDown={(event) => onRowKeyDown(event, row)}
                          >
                            {hasKids ? (
                              <ChevronRight aria-hidden className={cn("size-4 shrink-0 text-muted-foreground motion-safe:transition-transform motion-safe:duration-150", !isCollapsed && "rotate-90")} />
                            ) : (
                              <span className="size-4 shrink-0" aria-hidden />
                            )}
                            <Icon aria-hidden className={cn("size-4 shrink-0", row.step.status === "error" ? "text-destructive" : "text-muted-foreground")} />
                            <span className="min-w-0">
                              <span className="flex min-w-0 items-center gap-1">
                                <span className="truncate">{row.step.name}</span>
                                <StatusIcon status={row.step.status} />
                                <span className="sr-only">{labels.stepStatus[row.step.status]}</span>
                                {row.step.status === "error" || row.step.status === "running" ? (
                                  <span className={cn("text-xs", row.step.status === "error" && "text-destructive")}>{labels.stepStatus[row.step.status]}</span>
                                ) : null}
                                {rollup.mostExpensiveId === row.id ? <Badge variant="secondary">{labels.top}</Badge> : null}
                                {isCollapsed && row.hiddenCount > 0 ? <Badge variant="outline">{labels.hidden(row.hiddenCount)}</Badge> : null}
                              </span>
                              {stacked ? <span className="block truncate text-xs text-muted-foreground">{row.step.model ?? row.step.destination ?? labels.noModel}</span> : null}
                            </span>
                          </button>
                        </div>
                        {stacked ? null : <div role="gridcell" className="min-w-0 truncate text-muted-foreground">{row.step.model ?? row.step.destination ?? labels.noModel}</div>}
                        {stacked || narrow ? null : <div role="gridcell" className="text-end tabular-nums">{tokensOf(row.step.tokensIn)}</div>}
                        {stacked || narrow ? null : <div role="gridcell" className="text-end tabular-nums">{tokensOf(row.step.tokensOut)}</div>}
                        {stacked || narrow ? null : (
                          <div role="gridcell" className="text-end tabular-nums">
                            <span className="block">{tokensOf(row.step.cacheRead + row.step.cacheWrite)}</span>
                            <span className="block text-xs text-muted-foreground">{moneyOf(savings)}</span>
                          </div>
                        )}
                        {stacked || !waterfallOpen ? null : (
                          <div role="gridcell" className={cn("relative h-8", classNames?.waterfall)}>
                            <span className="sr-only">{labels.bar(row.step.name, valueText)}</span>
                            {showFaint ? <span aria-hidden className="absolute inset-y-2 left-0 w-full origin-left rounded-full bg-foreground/15 motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out" style={{ transform: `translateX(${span.x}%) scaleX(${span.scale})` }} /> : null}
                            {solid.scale > 0 ? (
                              <span aria-hidden className={cn("absolute inset-y-2 left-0 w-full origin-left rounded-full motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out", row.step.status === "error" ? "bg-destructive" : "bg-primary")} style={{ transform: `translateX(${solid.x}%) scaleX(${solid.scale})` }} />
                            ) : null}
                          </div>
                        )}
                        <div role="gridcell" className="text-end font-medium tabular-nums">{valueText}</div>
                        {stacked ? null : <div role="gridcell" className="text-end text-muted-foreground tabular-nums">{formatLatency(row.step.latencyMs, money.locale)}</div>}
                      </div>
                      {stacked && waterfallOpen ? (
                        <div className="relative mx-2 mb-2 h-8">
                          <span className="sr-only">{labels.bar(row.step.name, valueText)}</span>
                          {solid.scale > 0 ? <span aria-hidden className="absolute inset-y-2 left-0 w-full origin-left rounded-full bg-primary motion-safe:transition-transform motion-safe:duration-300 motion-safe:ease-out" style={{ transform: `translateX(${solid.x}%) scaleX(${solid.scale})` }} /> : null}
                        </div>
                      ) : null}
                      {detailOpen ? (
                        <div className="grid gap-2 px-2 pb-3 text-xs" style={{ paddingInlineStart: `${Math.min(row.depth - 1, 8) * 12 + 8}px` }}>
                          {row.step.error ? <p className="text-destructive">{row.step.error}</p> : null}
                          <p><span className="text-muted-foreground">{labels.input}: </span><span className="break-all">{row.step.input || "—"}</span></p>
                          <p><span className="text-muted-foreground">{labels.output}: </span><span className="break-all">{row.step.output || "—"}</span></p>
                          {stacked || narrow ? (
                            <p className="text-muted-foreground tabular-nums">
                              {labels.in} {tokensOf(row.step.tokensIn)} · {labels.out} {tokensOf(row.step.tokensOut)} · {labels.cache} {tokensOf(row.step.cacheRead + row.step.cacheWrite)} · {labels.cacheSavings} {moneyOf(savings)} · {formatLatency(row.step.latencyMs, money.locale)}
                            </p>
                          ) : null}
                        </div>
                      ) : null}
                    </div>
                  )
                })}
              </div>
            </ScrollArea>
          ) : null}
          <p className="sr-only" aria-live="polite">{announcement}</p>
          {streamed.error ? <p role="alert" className="text-sm text-destructive">{streamed.error}</p> : null}
        </CardContent>
      </Card>
    </div>
  )
}
