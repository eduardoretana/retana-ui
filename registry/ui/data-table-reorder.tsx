"use client"

/**
 * Dense table whose rows slide to their new order when a column sort changes.
 * Cells are slots: pass a sparkline, a meter, or a trend from this file, or any node.
 * The component does not write rows. Spanish chrome is the default.
 * `meta` on a row is never read.
 */

import * as React from "react"
import { LayoutGroup, motion, useReducedMotion } from "motion/react"
import { ArrowDown, ArrowUp, ArrowUpDown, Minus } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import {
  nextSort,
  sortTableRows,
  sparklinePoints,
  withTableLabels,
  type DataTableReorderLabels,
  type DataTableSort,
  type SortDirection,
} from "@/registry/retana/lib/data-table-reorder"
import { TooltipCard, type TooltipCardProps } from "@/registry/retana/ui/tooltip-card"

export type DataTableReorderRow<TMeta = Record<string, unknown>> = {
  id: string
  /** Host payload. The table never reads it. */
  meta?: TMeta
}

export type DataTableReorderColumn<TRow> = {
  id: string
  header: string
  width?: string
  align?: "start" | "end" | "center"
  sortable?: boolean
  sortValue?: (row: TRow) => string | number | null | undefined
  cell: (row: TRow) => React.ReactNode
}

export type DataTableDetail = Omit<TooltipCardProps, "children" | "open" | "defaultOpen" | "onOpenChange"> & {
  label?: string
}

export type DataTableReorderClassNames = {
  header?: string
  row?: string
  cell?: string
}

export type DataTableReorderProps<TRow extends DataTableReorderRow<TMeta>, TMeta = Record<string, unknown>> = {
  rows: readonly TRow[]
  columns: readonly DataTableReorderColumn<TRow>[]
  sort?: DataTableSort | null
  defaultSort?: DataTableSort | null
  onSortChange?: (sort: DataTableSort) => void
  onRowSelect?: (row: TRow) => void
  selectedId?: string | null
  detail?: (row: TRow) => DataTableDetail | null
  detailColumnId?: string
  locale?: string
  labels?: Partial<DataTableReorderLabels>
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  disabled?: boolean
  className?: string
  classNames?: DataTableReorderClassNames
}

const subscribe = () => () => {}

function useReducedFlag() {
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

const alignClass = {
  start: "justify-start text-left",
  end: "justify-end text-right",
  center: "justify-center text-center",
} as const

function RowDetail({
  card,
  label,
  disabled,
  onSelect,
  children,
}: {
  card: DataTableDetail
  label: string
  disabled: boolean
  onSelect: () => void
  children: React.ReactNode
}) {
  const { label: _rowLabel, ...cardProps } = card
  void _rowLabel
  return (
    <TooltipCard {...cardProps}>
      <button
        type="button"
        disabled={disabled}
        className="max-w-full truncate rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring"
        aria-label={label}
        onClick={onSelect}
      >
        {children}
      </button>
    </TooltipCard>
  )
}

export function DataTableReorder<TRow extends DataTableReorderRow<TMeta>, TMeta = Record<string, unknown>>({
  rows,
  columns,
  sort: sortProp,
  defaultSort = null,
  onSortChange,
  onRowSelect,
  selectedId,
  detail,
  detailColumnId,
  locale = "es-MX",
  labels,
  loading = false,
  error = null,
  onRetry,
  disabled = false,
  className,
  classNames,
}: DataTableReorderProps<TRow, TMeta>) {
  const copy = withTableLabels(labels)
  const reduced = useReducedFlag()
  const [uncontrolled, setUncontrolled] = React.useState<DataTableSort | null>(defaultSort)
  const sort = sortProp !== undefined ? sortProp : uncontrolled
  const [announcement, setAnnouncement] = React.useState("")
  const layoutId = React.useId()
  const template = columns.map((column) => column.width ?? "minmax(8rem,1fr)").join(" ")
  const detailId = detailColumnId ?? columns[0]?.id

  const sorted = React.useMemo(() => {
    if (!sort) return [...rows]
    const column = columns.find((item) => item.id === sort.columnId)
    if (!column?.sortValue) return [...rows]
    const read = column.sortValue
    return sortTableRows(rows, read, sort.direction, locale)
  }, [rows, columns, sort, locale])

  function commit(columnId: string) {
    const next = nextSort(sort, columnId)
    if (sortProp === undefined) setUncontrolled(next)
    onSortChange?.(next)
    const header = columns.find((column) => column.id === columnId)?.header ?? columnId
    setAnnouncement(copy.sorted(header, next.direction))
  }

  return (
    <div
      data-slot="data-table-reorder"
      data-reduced-motion={reduced ? "true" : "false"}
      data-disabled={disabled ? "true" : "false"}
      className={cn("min-w-0 text-foreground", className)}
    >
      {disabled ? <p className="mb-2 text-xs text-muted-foreground">{copy.disabledNote}</p> : null}
      {error ? (
        <div role="alert" className="mb-3 flex flex-col items-start gap-2 rounded-lg border border-border p-4">
          <p className="text-sm font-medium">{copy.errorTitle}</p>
          <p className="text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">{error}</p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              {copy.retry}
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="overflow-auto rounded-lg border border-border">
        <div role="table" aria-label={copy.caption} aria-busy={loading || undefined} className="min-w-full text-sm">
          <div role="rowgroup" className={cn("sticky top-0 z-10 bg-background", classNames?.header)}>
            <div role="row" className="grid border-b border-border" style={{ gridTemplateColumns: template }}>
              {columns.map((column) => {
                const active = sort?.columnId === column.id
                const canSort = column.sortable !== false && Boolean(column.sortValue)
                const direction: SortDirection | null = active ? sort.direction : null
                const nextDirection: SortDirection = !active || direction === "desc" ? "asc" : "desc"
                return (
                  <div
                    key={column.id}
                    role="columnheader"
                    aria-sort={direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none"}
                    className={cn("min-w-0 px-2 py-1.5", alignClass[column.align ?? "start"])}
                  >
                    {canSort ? (
                      <button
                        type="button"
                        disabled={disabled || loading}
                        className="inline-flex max-w-full items-center gap-1 rounded-md text-xs font-medium text-muted-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring"
                        aria-label={nextDirection === "asc" ? copy.sortAscending(column.header) : copy.sortDescending(column.header)}
                        onClick={() => commit(column.id)}
                      >
                        <span className="truncate">{column.header}</span>
                        {direction === "asc" ? (
                          <ArrowUp aria-hidden="true" className="size-3.5 shrink-0" />
                        ) : direction === "desc" ? (
                          <ArrowDown aria-hidden="true" className="size-3.5 shrink-0" />
                        ) : (
                          <ArrowUpDown aria-hidden="true" className="size-3.5 shrink-0" />
                        )}
                      </button>
                    ) : (
                      <span className="truncate text-xs font-medium text-muted-foreground">{column.header}</span>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
          {loading ? (
            <div className="flex flex-col gap-2 p-3" aria-live="polite">
              <span className="sr-only">{copy.loading}</span>
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : sorted.length === 0 ? (
            <Empty className="min-h-40">
              <EmptyHeader>
                <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
                <EmptyDescription>{copy.emptyHint}</EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <LayoutGroup id={layoutId}>
              <div role="rowgroup">
                {sorted.map((row) => (
                  <motion.div
                    key={row.id}
                    role="row"
                    layout={reduced ? false : "position"}
                    initial={false}
                    transition={{ duration: reduced ? 0 : motionPresets.duration.standard, ease: motionPresets.ease.standard }}
                    data-selected={selectedId === row.id ? "true" : "false"}
                    className={cn("grid border-b border-border last:border-b-0", selectedId === row.id && "bg-muted/60", classNames?.row)}
                    style={{ gridTemplateColumns: template }}
                  >
                    {columns.map((column) => {
                      const content = column.cell(row)
                      const card = column.id === detailId ? detail?.(row) : null
                      const interactive = Boolean(card || (onRowSelect && column.id === detailId))
                      return (
                        <div
                          key={column.id}
                          role="cell"
                          className={cn("flex min-w-0 items-center px-2 py-1.5", alignClass[column.align ?? "start"], classNames?.cell)}
                        >
                          {interactive ? (
                            card ? (
                              <RowDetail card={card} disabled={disabled} label={copy.rowDetail(card.label || card.title)} onSelect={() => onRowSelect?.(row)}>
                                {content}
                              </RowDetail>
                            ) : (
                              <button
                                type="button"
                                disabled={disabled}
                                className="max-w-full truncate rounded-md text-left outline-none focus-visible:ring-3 focus-visible:ring-ring"
                                onClick={() => onRowSelect?.(row)}
                              >
                                {content}
                              </button>
                            )
                          ) : (
                            content
                          )}
                        </div>
                      )
                    })}
                  </motion.div>
                ))}
              </div>
            </LayoutGroup>
          )}
        </div>
      </div>
      <p className="sr-only" aria-live="polite" data-slot="data-table-reorder-announcement">
        {announcement}
      </p>
      <span className="sr-only">{copy.announcements}</span>
    </div>
  )
}

export function DataTableSparkline({
  values,
  label,
  className,
}: {
  values: readonly number[]
  label: string
  className?: string
}) {
  const points = sparklinePoints(values, 72, 20)
  return (
    <svg viewBox="0 0 72 20" role="img" aria-label={label} className={cn("h-5 w-[4.5rem] text-primary", className)}>
      {points ? <polyline points={points} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" /> : null}
    </svg>
  )
}

export function DataTableMeter({
  value,
  max = 100,
  label,
  className,
}: {
  value: number
  max?: number
  label: string
  className?: string
}) {
  const safeMax = max > 0 ? max : 1
  const safeValue = Number.isFinite(value) ? Math.min(safeMax, Math.max(0, value)) : 0
  const pct = safeValue / safeMax
  return (
    <span className={cn("flex min-w-24 items-center gap-2", className)}>
      <span
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={safeMax}
        aria-valuenow={safeValue}
        className="relative h-1.5 w-full overflow-hidden rounded-full bg-muted"
      >
        <span className="absolute inset-y-0 left-0 w-full origin-left bg-primary" style={{ transform: `scaleX(${pct})` }} />
      </span>
      <span className="text-xs text-muted-foreground tabular-nums">{label}</span>
    </span>
  )
}

export function DataTableTrend({
  direction,
  label,
  className,
}: {
  direction: "up" | "down" | "flat"
  label: string
  className?: string
}) {
  const Icon = direction === "up" ? ArrowUp : direction === "down" ? ArrowDown : Minus
  const tone = direction === "up" ? "text-primary" : direction === "down" ? "text-destructive" : "text-muted-foreground"
  return (
    <span className={cn("inline-flex items-center gap-1 text-xs tabular-nums", tone, className)}>
      <Icon aria-hidden="true" className="size-3.5" />
      <span>{label}</span>
    </span>
  )
}
