"use client"

/**
 * Clean-room planning grid. A public post about a planning block was the
 * behavior reference only. No ReUI source, sample rows, or assets were copied.
 * Built on useLegacyTable and getExpandedRowModel.
 */

import * as React from "react"
import type { ExpandedState } from "@tanstack/react-table"
import { getCoreRowModel, getExpandedRowModel, useLegacyTable, type LegacyColumnDef } from "@tanstack/react-table/legacy"
import { ChevronRight, Lock, MoreHorizontal, Plus, Redo2, Undo2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import {
  addChild,
  applyGrowth,
  findNode,
  leafNodes,
  outlookOf,
  rollupTree,
  updateCell,
  variance,
  type PlanNode,
  type PlanPeriod,
} from "@/registry/retana/lib/planning-grid"

export type { PlanNode, PlanPeriod }
export type HeatMode = "all" | "row" | "column"

export type PlanningGridLabels = {
  title: string
  actualToDate: string
  forecastLeft: string
  outlook: string
  vsPlan: string
  search: string
  save: string
  revert: string
  undo: string
  redo: string
  heat: string
  heatAll: string
  heatRow: string
  heatColumn: string
  empty: string
  loading: string
  groupCount: (count: number) => string
  totals: string
  growth: string
  lock: string
  unlock: string
  add: string
  fresh: string
  actions: (label: string) => string
  expand: (label: string) => string
  collapse: (label: string) => string
  actual: string
  forecast: string
  bullet: string
  prior: string
  plan: string
  cell: (label: string, period: string, value: string) => string
  changed: string
  money: (value: number) => string
}

const gridLabels: PlanningGridLabels = {
  title: "Plan",
  actualToDate: "Actual to date",
  forecastLeft: "Forecast left",
  outlook: "Outlook vs plan",
  vsPlan: "Vs plan",
  search: "Search",
  save: "Save",
  revert: "Revert",
  undo: "Undo",
  redo: "Redo",
  heat: "Heat",
  heatAll: "Whole view",
  heatRow: "By row",
  heatColumn: "By column",
  empty: "Nothing to plan.",
  loading: "Loading the plan",
  groupCount: (count) => `${count}`,
  totals: "Total",
  growth: "Growth",
  lock: "Lock forecast",
  unlock: "Unlock forecast",
  add: "Add a line",
  fresh: "New",
  actions: (label) => `Actions for ${label}`,
  expand: (label) => `Open ${label}`,
  collapse: (label) => `Close ${label}`,
  actual: "Actual",
  forecast: "Forecast",
  bullet: "Bullet",
  prior: "Prior year",
  plan: "Plan",
  cell: (label, period, value) => `${label}, ${period}, ${value}`,
  changed: "Changed",
  money: (value) => String(value),
}

const BANDS = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"] as const

function heatClass(value: number, min: number, max: number) {
  if (max <= min) return ""
  const t = (value - min) / (max - min)
  if (t > 0.85) return "bg-primary/40"
  if (t > 0.65) return "bg-primary/30"
  if (t > 0.45) return "bg-primary/20"
  if (t > 0.25) return "bg-primary/10"
  return ""
}

function cloneNodes(nodes: readonly PlanNode[]): PlanNode[] {
  return JSON.parse(JSON.stringify(nodes)) as PlanNode[]
}

export type PlanningGridProps = {
  rows?: readonly PlanNode[]
  periods?: readonly PlanPeriod[]
  periodWeights?: Readonly<Record<string, number>>
  baseline?: readonly PlanNode[]
  heat?: HeatMode
  defaultHeat?: HeatMode
  onHeatChange?: (heat: HeatMode) => void
  onRowsChange?: (rows: readonly PlanNode[]) => void
  onSave?: (rows: readonly PlanNode[]) => void
  loading?: boolean
  error?: string
  labels?: Partial<PlanningGridLabels>
  className?: string
}

export function PlanningGrid({
  rows = [],
  periods = [],
  periodWeights,
  baseline,
  heat: heatProp,
  defaultHeat = "all",
  onHeatChange,
  onRowsChange,
  onSave,
  loading = false,
  error,
  labels: labelOverrides,
  className,
}: PlanningGridProps) {
  const labels = { ...gridLabels, ...labelOverrides }
  const weights = periodWeights ?? Object.fromEntries(periods.map((period) => [period.id, 1]))
  const [query, setQuery] = React.useState("")
  const [heatInner, setHeatInner] = React.useState<HeatMode>(defaultHeat)
  const heat = heatProp ?? heatInner
  const [past, setPast] = React.useState<PlanNode[][]>([])
  const [future, setFuture] = React.useState<PlanNode[][]>([])
  const [saved, setSaved] = React.useState<PlanNode[]>(() => rollupTree(cloneNodes(baseline ?? rows), periods))
  const [editing, setEditing] = React.useState<{ id: string; periodId: string; draft: string } | null>(null)
  const [selected, setSelected] = React.useState<{ id: string; periodId: string } | null>(null)
  const [adding, setAdding] = React.useState<string | null>(null)
  const [draftLabel, setDraftLabel] = React.useState("")
  const [live, setLive] = React.useState("")
  const growthBase = React.useRef<PlanNode[] | null>(null)
  const forecastIds = periods.filter((period) => period.kind === "forecast").map((period) => period.id)
  const actualIds = periods.filter((period) => period.kind === "actual").map((period) => period.id)
  const tree = React.useMemo(() => rollupTree(rows, periods), [periods, rows])
  const visible = React.useMemo(() => filterTree(tree, query), [query, tree])

  const columns = React.useMemo<LegacyColumnDef<PlanNode>[]>(
    () => [{ id: "label", header: labels.title, cell: () => null }, ...periods.map((period) => ({ id: period.id, header: period.label, cell: () => null }))],
    [labels.title, periods],
  )
  const [expanded, setExpanded] = React.useState<ExpandedState>(true)
  const table = useLegacyTable({
    data: visible,
    columns,
    state: { expanded },
    onExpandedChange: setExpanded,
    getRowId: (row) => row.id,
    getSubRows: (row) => row.children ?? [],
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
  })

  function commit(next: PlanNode[], message: string) {
    setPast((current) => [...current, cloneNodes(rows)].slice(-40))
    setFuture([])
    onRowsChange?.(rollupTree(next, periods))
    setLive(message)
  }

  function undo() {
    const previous = past.at(-1)
    if (!previous) return
    setPast((current) => current.slice(0, -1))
    setFuture((current) => [...current, cloneNodes(rows)])
    onRowsChange?.(previous)
    setLive(labels.undo)
  }

  function redo() {
    const next = future.at(-1)
    if (!next) return
    setFuture((current) => current.slice(0, -1))
    setPast((current) => [...current, cloneNodes(rows)])
    onRowsChange?.(next)
    setLive(labels.redo)
  }

  function revert() {
    commit(cloneNodes(saved), labels.revert)
  }

  function save() {
    setSaved(cloneNodes(rows))
    setPast([])
    setFuture([])
    onSave?.(rows)
    setLive(labels.save)
  }

  const savedFlat = React.useMemo(() => flatten(saved), [saved])
  function changed(id: string, periodId: string) {
    const node = findNode(rows, id)
    if (!node || node.children?.length) return false
    const before = savedFlat.get(id)?.values[periodId]
    return before != null && node.values[periodId] !== before
  }

  const leaves = leafNodes(tree)
  const totals = sumPeriod(leaves, periods)
  const kpi = outlookOf(totals, periods)
  const planTotal = roundSum(leaves.map((leaf) => leaf.plan))
  const columnRange = Object.fromEntries(periods.map((period) => [period.id, rangeOf(leaves.map((leaf) => leaf.values[period.id] ?? 0))]))
  const allRange = rangeOf(leaves.flatMap((leaf) => periods.map((period) => leaf.values[period.id] ?? 0)))
  const modelRows = table.getRowModel().rows
  const periodIndex = new Map(periods.map((period, index) => [period.id, index]))

  function move(deltaRow: number, deltaCol: number, extend = false) {
    if (!selected) return
    const rowIndex = modelRows.findIndex((row) => row.original.id === selected.id)
    const col = periodIndex.get(selected.periodId) ?? 0
    const nextRow = modelRows[Math.min(modelRows.length - 1, Math.max(0, rowIndex + deltaRow))]
    const nextPeriod = periods[Math.min(periods.length - 1, Math.max(0, col + deltaCol))]
    if (!nextRow || !nextPeriod) return
    setSelected({ id: nextRow.original.id, periodId: nextPeriod.id })
    void extend
  }

  function writeCell(id: string, periodId: string, raw: string) {
    const value = Number(raw.replace(/[^0-9.-]/g, ""))
    if (Number.isNaN(value)) return
    const node = findNode(rows, id)
    if (!node || node.locked.includes(periodId) || node.children?.length) return
    commit(updateCell(rows, id, periodId, value), labels.changed)
  }

  function onGridKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (editing) return
    const key = event.key
    if ((event.metaKey || event.ctrlKey) && key.toLowerCase() === "z") {
      event.preventDefault()
      if (event.shiftKey) redo()
      else undo()
      return
    }
    if ((event.metaKey || event.ctrlKey) && key.toLowerCase() === "c" && selected) {
      event.preventDefault()
      const text = selectionText()
      void navigator.clipboard?.writeText(text).catch(() => setLive(text))
      return
    }
    if ((event.metaKey || event.ctrlKey) && key.toLowerCase() === "v") {
      event.preventDefault()
      void navigator.clipboard?.readText().then((text) => paste(text)).catch(() => undefined)
      return
    }
    if (!selected) return
    if (key === "ArrowRight") { event.preventDefault(); move(0, 1, event.shiftKey) }
    else if (key === "ArrowLeft") { event.preventDefault(); move(0, -1, event.shiftKey) }
    else if (key === "ArrowDown") { event.preventDefault(); move(1, 0, event.shiftKey) }
    else if (key === "ArrowUp") { event.preventDefault(); move(-1, 0, event.shiftKey) }
    else if (key === "Enter" || key === "F2") {
      event.preventDefault()
      beginEdit(selected.id, selected.periodId)
    } else if (key === "Escape") setSelected(null)
    else if (key.length === 1 && !event.metaKey && !event.ctrlKey && !event.altKey) {
      beginEdit(selected.id, selected.periodId, key)
    }
  }

  function beginEdit(id: string, periodId: string, typed?: string) {
    const node = findNode(rows, id)
    if (!node || node.children?.length || node.locked.includes(periodId)) return
    setEditing({ id, periodId, draft: typed ?? String(node.values[periodId] ?? 0) })
    setSelected({ id, periodId })
  }

  function selectionText() {
    if (!selected) return ""
    const node = findNode(rows, selected.id)
    return String(node?.values[selected.periodId] ?? "")
  }

  function paste(text: string) {
    if (!selected) return
    const lines = text.trim().split(/\r?\n/).map((line) => line.split("\t"))
    let next: PlanNode[] = cloneNodes(rows)
    const startRow = modelRows.findIndex((row) => row.original.id === selected.id)
    const startCol = periodIndex.get(selected.periodId) ?? 0
    lines.forEach((line, rowOffset) => {
      const row = modelRows[startRow + rowOffset]
      if (!row || row.original.children?.length) return
      line.forEach((cell, colOffset) => {
        const period = periods[startCol + colOffset]
        if (!period) return
        const value = Number(cell.replace(/[^0-9.-]/g, ""))
        if (!Number.isNaN(value)) next = updateCell(next, row.original.id, period.id, value)
      })
    })
    commit(next, labels.changed)
  }

  const firstForecast = periods.find((period) => period.kind === "forecast")

  return (
    <section className={cn("flex flex-col gap-3 text-sm text-card-foreground", className)} aria-busy={loading || undefined}>
      <div className="sr-only" aria-live="polite">{live}</div>
      <div className="grid gap-2 sm:grid-cols-3">
        <Kpi label={labels.actualToDate} value={labels.money(kpi.actual)} />
        <Kpi label={labels.forecastLeft} value={labels.money(kpi.forecast)} />
        <Kpi label={labels.outlook} value={`${labels.money(kpi.outlook)} · ${labels.money(variance(kpi.outlook, planTotal))}`} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Input value={query} onChange={(event) => setQuery(event.target.value)} aria-label={labels.search} placeholder={labels.search} className="h-8 w-full sm:w-48" />
        <div role="group" aria-label={labels.heat} className="flex flex-wrap gap-1">
          {(["all", "row", "column"] as const).map((mode) => (
            <Button key={mode} type="button" size="sm" variant={heat === mode ? "default" : "outline"} aria-pressed={heat === mode} onClick={() => { if (heatProp === undefined) setHeatInner(mode); onHeatChange?.(mode) }}>
              {mode === "all" ? labels.heatAll : mode === "row" ? labels.heatRow : labels.heatColumn}
            </Button>
          ))}
        </div>
        <div className="ms-auto flex flex-wrap gap-1">
          <Button type="button" size="sm" variant="outline" onClick={undo} disabled={past.length === 0} aria-label={labels.undo}><Undo2 className="size-3.5" aria-hidden />{labels.undo}</Button>
          <Button type="button" size="sm" variant="outline" onClick={redo} disabled={future.length === 0} aria-label={labels.redo}><Redo2 className="size-3.5" aria-hidden />{labels.redo}</Button>
          <Button type="button" size="sm" variant="outline" onClick={revert}>{labels.revert}</Button>
          <Button type="button" size="sm" onClick={save}>{labels.save}</Button>
        </div>
      </div>
      {error ? <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive">{error}</p> : null}
      {loading ? (
        <div aria-label={labels.loading} className="grid gap-2">
          <Skeleton className="h-8 w-full motion-reduce:animate-none" />
          <Skeleton className="h-24 w-full motion-reduce:animate-none" />
        </div>
      ) : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border" onKeyDown={onGridKeyDown}>
          <table role="grid" aria-label={labels.title} aria-rowcount={modelRows.length + 2} aria-colcount={periods.length + 3} className="w-full min-w-[52rem] border-collapse text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 z-20 bg-card px-2 py-1 text-start" />
                <th className="sticky left-36 z-20 bg-card px-2 py-1 text-start">{labels.growth}</th>
                {actualIds.length > 0 ? <th colSpan={actualIds.length} className="bg-muted px-2 py-1 text-center font-medium">{labels.actual}</th> : null}
                {forecastIds.length > 0 ? <th colSpan={forecastIds.length} className="bg-muted/50 px-2 py-1 text-center font-medium">{labels.forecast}{firstForecast ? ` · ${firstForecast.label}` : ""}</th> : null}
                <th className="sticky right-28 z-20 bg-card px-2 py-1 text-end">{labels.vsPlan}</th>
                <th className="sticky right-0 z-20 bg-card px-2 py-1 text-start">
                  <span title={leaves.map((leaf) => `${leaf.label}: ${labels.money(outlookOf(leaf.values, periods).outlook)}`).join("\n")}>{labels.bullet}</span>
                  <Scatter leaves={leaves} periods={periods} />
                </th>
              </tr>
              <tr>
                <th className="sticky left-0 z-20 bg-card px-2 py-1" />
                <th className="sticky left-36 z-20 bg-card px-2 py-1" />
                {periods.map((period) => (
                  <th key={period.id} className={cn("px-2 py-1 text-end font-medium", period.kind === "forecast" && "bg-muted/40")}>
                    <span title={`${period.label}: ${labels.money(totals[period.id] ?? 0)}`}>{period.label}</span>
                    <span className="mt-1 flex h-6 items-end gap-px" aria-hidden>
                      <span className="w-2 rounded-sm bg-primary" style={{ height: `${barHeight(totals[period.id] ?? 0, allRange)}%` }} />
                    </span>
                  </th>
                ))}
                <th className="sticky right-28 z-20 bg-card" />
                <th className="sticky right-0 z-20 bg-card" />
              </tr>
            </thead>
            <tbody>
              {modelRows.map((row) => {
                const node = row.original
                const groupIndex = topIndex(tree, node.id)
                const outlook = outlookOf(node.values, periods)
                const rowRange = rangeOf(periods.map((period) => node.values[period.id] ?? 0))
                const isGroup = Boolean(node.children?.length)
                return (
                  <React.Fragment key={node.id}>
                    <tr className="border-t border-border">
                      <th className="sticky left-0 z-10 bg-card px-2 py-1 text-start font-medium" scope="row">
                        <span className="inline-flex items-center gap-1" style={{ paddingInlineStart: `${row.depth * 0.75}rem` }}>
                          <span className={cn("inline-block h-4 w-1 rounded-full", BANDS[groupIndex % BANDS.length])} aria-hidden />
                          {row.getCanExpand() ? (
                            <Button type="button" size="icon-sm" variant="ghost" className="size-6" aria-expanded={row.getIsExpanded()} aria-label={row.getIsExpanded() ? labels.collapse(node.label) : labels.expand(node.label)} onClick={() => row.toggleExpanded()}>
                              <ChevronRight className={cn("size-3.5 transition-transform motion-reduce:transition-none", row.getIsExpanded() && "rotate-90")} aria-hidden />
                            </Button>
                          ) : null}
                          <span>{node.label}</span>
                          {isGroup ? <span className="text-muted-foreground">{labels.groupCount(node.children?.length ?? 0)}</span> : null}
                        </span>
                      </th>
                      <td className="sticky left-36 z-10 bg-card px-2 py-1">
                        {isGroup ? (
                          <label className="flex items-center gap-2">
                            <span className="sr-only">{labels.growth}</span>
                            <input
                              type="range"
                              min={-50}
                              max={80}
                              defaultValue={0}
                              aria-label={`${labels.growth} ${node.label}`}
                              className="w-24"
                              onPointerDown={() => {
                                growthBase.current = cloneNodes(rows)
                              }}
                              onChange={(event) => {
                                const growth = Number(event.target.value) / 100
                                const base = growthBase.current ?? rows
                                const next = mapTree(base, node.id, (item) => applyGrowth(item, periods, growth, weights))
                                onRowsChange?.(rollupTree(next, periods))
                                setLive(labels.growth)
                              }}
                              onPointerUp={() => {
                                if (growthBase.current) setPast((current) => [...current, growthBase.current as PlanNode[]].slice(-40))
                                setFuture([])
                              }}
                            />
                          </label>
                        ) : null}
                      </td>
                      {periods.map((period) => {
                        const value = node.values[period.id] ?? 0
                        const scale = heat === "row" ? rowRange : heat === "column" ? columnRange[period.id] ?? allRange : allRange
                        const locked = node.locked.includes(period.id)
                        const dirty = changed(node.id, period.id)
                        const isEditing = editing?.id === node.id && editing.periodId === period.id
                        const isSelected = selected?.id === node.id && selected.periodId === period.id
                        return (
                          <td
                            key={period.id}
                            role="gridcell"
                            aria-selected={isSelected}
                            tabIndex={isSelected ? 0 : -1}
                            className={cn("relative px-2 py-1 text-end tabular-nums", period.kind === "forecast" && "bg-muted/30", heatClass(value, scale.min, scale.max), isSelected && "ring-2 ring-ring ring-inset", locked && "text-muted-foreground")}
                            onClick={() => setSelected({ id: node.id, periodId: period.id })}
                            onDoubleClick={() => beginEdit(node.id, period.id)}
                          >
                            {isEditing ? (
                              <Input
                                autoFocus
                                aria-label={labels.cell(node.label, period.label, editing.draft)}
                                value={editing.draft}
                                className="h-7 w-20 px-1 text-end"
                                onChange={(event) => setEditing({ ...editing, draft: event.target.value })}
                                onBlur={() => { writeCell(node.id, period.id, editing.draft); setEditing(null) }}
                                onKeyDown={(event) => {
                                  if (event.key === "Enter") { event.preventDefault(); writeCell(node.id, period.id, editing.draft); setEditing(null) }
                                  if (event.key === "Escape") { event.preventDefault(); setEditing(null) }
                                  if (event.key === "Tab") { event.preventDefault(); writeCell(node.id, period.id, editing.draft); setEditing(null); move(0, event.shiftKey ? -1 : 1) }
                                }}
                              />
                            ) : (
                              <span title={labels.cell(node.label, period.label, labels.money(value))}>
                                {locked ? <Lock className="me-1 inline size-3" aria-hidden /> : null}
                                {labels.money(value)}
                                {dirty ? <span className="ms-1 inline-block size-1.5 rounded-full bg-primary" title={labels.changed} /> : null}
                              </span>
                            )}
                          </td>
                        )
                      })}
                      <td className="sticky right-28 z-10 bg-card px-2 py-1 text-end tabular-nums">{labels.money(variance(outlook.outlook, node.plan))}</td>
                      <td className="sticky right-0 z-10 bg-card px-2 py-1">
                        <Bullet actual={outlook.actual} forecast={outlook.forecast} plan={node.plan} prior={node.prior} title={`${node.label}: ${labels.plan} ${labels.money(node.plan)}, ${labels.prior} ${labels.money(node.prior)}`} />
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button type="button" size="icon-sm" variant="ghost" className="size-6" aria-label={labels.actions(node.label)}>
                              <MoreHorizontal className="size-3.5" aria-hidden />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => commit(toggleLock(rows, node.id, forecastIds), labels.lock)}>{node.locked.length ? labels.unlock : labels.lock}</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                    {isGroup && row.getIsExpanded() ? (
                      <tr className="group border-t border-border">
                        <td colSpan={periods.length + 4} className="px-8 py-1">
                          {adding === node.id ? (
                            <Input
                              autoFocus
                              aria-label={labels.add}
                              value={draftLabel}
                              className="h-7 w-48"
                              onChange={(event) => setDraftLabel(event.target.value)}
                              onKeyDown={(event) => {
                                if (event.key === "Enter") {
                                  const child = blankChild(`${node.id}-${draftLabel || labels.fresh}`, draftLabel || labels.fresh, periods)
                                  commit(addChild(rows, node.id, child), labels.add)
                                  setAdding(null)
                                  setDraftLabel("")
                                }
                                if (event.key === "Escape") setAdding(null)
                              }}
                            />
                          ) : (
                            <Button type="button" size="sm" variant="ghost" className="h-7 opacity-100 [@media(hover:hover)]:opacity-0 [@media(hover:hover)]:group-hover:opacity-100 [@media(hover:hover)]:focus:opacity-100" onClick={() => { setAdding(node.id); setDraftLabel("") }}>
                              <Plus className="size-3.5" aria-hidden /> {labels.add}
                            </Button>
                          )}
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                )
              })}
              <tr className="border-t border-border font-medium">
                <th className="sticky left-0 z-10 bg-card px-2 py-2 text-start" scope="row">{labels.totals}</th>
                <td className="sticky left-36 z-10 bg-card" />
                {periods.map((period) => <td key={period.id} className="px-2 py-2 text-end tabular-nums">{labels.money(totals[period.id] ?? 0)}</td>)}
                <td className="sticky right-28 z-10 bg-card px-2 py-2 text-end tabular-nums">{labels.money(variance(kpi.outlook, planTotal))}</td>
                <td className="sticky right-0 z-10 bg-card" />
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </section>
  )
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-card px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="font-medium tabular-nums">{value}</p>
    </div>
  )
}

function Bullet({ actual, forecast, plan, prior, title }: { actual: number; forecast: number; plan: number; prior: number; title: string }) {
  const max = Math.max(actual + forecast, plan, prior, 1)
  return (
    <span title={title} className="relative block h-2 w-24 overflow-hidden rounded-full bg-muted">
      <span className="absolute inset-y-0 start-0 bg-primary" style={{ width: `${(actual / max) * 100}%` }} />
      <span className="absolute inset-y-0 bg-primary/40" style={{ left: `${(actual / max) * 100}%`, width: `${(forecast / max) * 100}%` }} />
      <span className="absolute inset-y-0 w-px bg-foreground" style={{ left: `${(plan / max) * 100}%` }} />
      <span className="absolute inset-y-0 w-px bg-chart-4" style={{ left: `${(prior / max) * 100}%` }} />
    </span>
  )
}

function Scatter({ leaves, periods }: { leaves: readonly PlanNode[]; periods: readonly PlanPeriod[] }) {
  return (
    <span className="mt-1 flex h-4 items-end gap-0.5" aria-hidden>
      {leaves.slice(0, 8).map((leaf) => {
        const outlook = outlookOf(leaf.values, periods).outlook
        const max = Math.max(leaf.plan, outlook, 1)
        return <span key={leaf.id} title={leaf.label} className="inline-block size-1.5 rounded-full bg-primary" style={{ opacity: 0.35 + 0.65 * (outlook / max) }} />
      })}
    </span>
  )
}

function mapTree(nodes: readonly PlanNode[], id: string, update: (node: PlanNode) => PlanNode): PlanNode[] {
  return nodes.map((node) => {
    if (node.id === id) return update(node)
    if (!node.children) return node
    return { ...node, children: mapTree(node.children, id, update) }
  })
}

function filterTree(nodes: readonly PlanNode[], query: string): PlanNode[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return [...nodes]
  const visit = (node: PlanNode): PlanNode | null => {
    const children = (node.children ?? []).map(visit).filter((child): child is PlanNode => child != null)
    if (node.label.toLowerCase().includes(needle) || children.length > 0) return { ...node, children }
    return null
  }
  return nodes.map(visit).filter((node): node is PlanNode => node != null)
}

function flatten(nodes: readonly PlanNode[]) {
  const map = new Map<string, PlanNode>()
  const walk = (list: readonly PlanNode[]) => {
    for (const node of list) {
      map.set(node.id, node)
      if (node.children) walk(node.children)
    }
  }
  walk(nodes)
  return map
}

function sumPeriod(nodes: readonly PlanNode[], periods: readonly PlanPeriod[]) {
  const totals: Record<string, number> = {}
  for (const period of periods) totals[period.id] = nodes.reduce((sum, node) => sum + (node.values[period.id] ?? 0), 0)
  return totals
}

function rangeOf(values: readonly number[]) {
  return { min: Math.min(...values, 0), max: Math.max(...values, 0) }
}

function roundSum(values: readonly number[]) {
  return Math.round(values.reduce((sum, value) => sum + value, 0) * 100) / 100
}

function barHeight(value: number, range: { min: number; max: number }) {
  if (range.max <= range.min) return 20
  return 15 + ((value - range.min) / (range.max - range.min)) * 85
}

function topIndex(nodes: readonly PlanNode[], id: string) {
  const index = nodes.findIndex((node) => node.id === id || node.children?.some((child) => child.id === id || child.children?.some((grand) => grand.id === id)))
  return Math.max(0, index)
}

function toggleLock(nodes: readonly PlanNode[], id: string, forecastIds: readonly string[]): PlanNode[] {
  return nodes.map((node) => {
    if (node.id === id) {
      const locked = node.locked.length ? [] : [...forecastIds]
      return { ...node, locked }
    }
    if (!node.children) return node
    return { ...node, children: toggleLock(node.children, id, forecastIds) }
  })
}

function blankChild(id: string, label: string, periods: readonly PlanPeriod[]): PlanNode {
  return {
    id,
    label,
    weight: 1,
    prior: 0,
    plan: 0,
    locked: [],
    values: Object.fromEntries(periods.map((period) => [period.id, 0])),
  }
}
