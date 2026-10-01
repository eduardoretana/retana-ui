"use client"

import * as React from "react"
import { ChevronDown, ChevronRight, Filter } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export type AdaptiveHeader = {
  icon: React.ReactNode
  label: string
}

export type AdaptiveColumn<Row> = {
  id: string
  header: AdaptiveHeader
  /** Smaller numbers are dropped or folded first. */
  priority: number
  minWidth: number
  /** Fold this column into another column when it no longer fits. */
  mergeInto?: string
  render: (row: Row) => React.ReactNode
  /** Compact value shown inside the merge target. */
  compactRender?: (row: Row) => React.ReactNode
  /** Plain text kept in the cell when the column is folded. */
  textValue?: (row: Row) => string
  align?: "start" | "end"
}

export type AdaptiveGroup<Row> = {
  id: string
  label: string
  icon?: React.ReactNode
  rows: readonly Row[]
}

export type AdaptiveVisibility = "visible" | "merged" | "hidden"

export type AdaptiveTableProps<Row> = {
  columns: readonly AdaptiveColumn<Row>[]
  groups: readonly AdaptiveGroup<Row>[]
  getRowId: (row: Row) => string
  onRowClick?: (row: Row) => void
  collapsibleGroups?: boolean
  emptyState?: React.ReactNode
  loading?: boolean
  loadingLabel?: string
  title?: string
  count?: number
  onFilter?: () => void
  filterLabel?: string
  filter?: React.ReactNode
  locale?: string
  className?: string
  tableClassName?: string
  headerClassName?: string
  groupClassName?: string
  rowClassName?: string
  cellClassName?: string
}

export function formatAdaptiveNumber(
  value: number,
  options: { locale?: string; currency?: string; notation?: "standard" | "compact" } = {},
) {
  const notation = options.notation ?? "standard"
  if (options.currency) {
    return new Intl.NumberFormat(options.locale, {
      style: "currency",
      currency: options.currency,
      notation,
      maximumFractionDigits: notation === "compact" ? 1 : 0,
    }).format(value)
  }
  return new Intl.NumberFormat(options.locale, { notation }).format(value)
}

export function resolveAdaptiveLayout<Row>(
  columns: readonly AdaptiveColumn<Row>[],
  width: number,
): AdaptiveVisibility[] {
  const visibility = columns.map(() => "visible" as AdaptiveVisibility)
  const indexById = new Map(columns.map((column, index) => [column.id, index]))
  const used = () =>
    columns.reduce((sum, column, index) => (visibility[index] === "visible" ? sum + column.minWidth : sum), 0)

  const order = columns
    .map((column, index) => ({ column, index }))
    .sort((a, b) => a.column.priority - b.column.priority || a.index - b.index)

  for (const { column, index } of order) {
    if (used() <= width) break
    if (visibility[index] !== "visible") continue
    const visibleCount = visibility.filter((state) => state === "visible").length
    if (visibleCount <= 1) break
    const targetId = column.mergeInto
    const targetIndex = targetId == null ? undefined : indexById.get(targetId)
    const canMerge = targetIndex != null && targetIndex !== index && visibility[targetIndex] === "visible"
    visibility[index] = canMerge ? "merged" : "hidden"
  }

  for (let index = 0; index < columns.length; index += 1) {
    if (visibility[index] !== "merged") continue
    const targetId = columns[index]?.mergeInto
    const targetIndex = targetId == null ? undefined : indexById.get(targetId)
    if (targetIndex == null || visibility[targetIndex] !== "visible") visibility[index] = "hidden"
  }

  return visibility
}

function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState<number | null>(null)
  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    const observer = new ResizeObserver((entries) => {
      const next = entries[0]?.contentRect.width
      if (typeof next === "number") setWidth(next)
    })
    observer.observe(element)
    return () => observer.disconnect()
  }, [ref])
  return width
}

function useFlip(ref: React.RefObject<HTMLElement | null>, signature: string) {
  const previous = React.useRef(new Map<string, DOMRect>())
  React.useLayoutEffect(() => {
    const root = ref.current
    if (!root) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const seen = new Set<string>()
    for (const node of root.querySelectorAll<HTMLElement>("[data-flip-id]")) {
      if (typeof node.getAnimations === "function") {
        node.getAnimations().forEach((animation) => animation.cancel())
      }
      const id = node.dataset.flipId
      if (!id) continue
      seen.add(id)
      const next = node.getBoundingClientRect()
      const last = previous.current.get(id)
      if (last && !reduced) {
        const dx = last.left - next.left
        const dy = last.top - next.top
        if ((Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) && typeof node.animate === "function") {
          node.animate(
            [{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "translate(0px, 0px)" }],
            { duration: 200, easing: "ease-out" },
          )
        }
      }
      previous.current.set(id, next)
    }
    for (const id of previous.current.keys()) {
      if (!seen.has(id)) previous.current.delete(id)
    }
  }, [ref, signature])
}

export function AdaptiveTable<Row>({
  columns,
  groups,
  getRowId,
  onRowClick,
  collapsibleGroups = false,
  emptyState,
  loading = false,
  loadingLabel = "Loading",
  title,
  count,
  onFilter,
  filterLabel = "Filter",
  filter,
  locale,
  className,
  tableClassName,
  headerClassName,
  groupClassName,
  rowClassName,
  cellClassName,
}: AdaptiveTableProps<Row>) {
  const measureRef = React.useRef<HTMLDivElement>(null)
  const width = useElementWidth(measureRef)
  const layout = resolveAdaptiveLayout(columns, width ?? Number.POSITIVE_INFINITY)
  const visible = columns.filter((_, index) => layout[index] === "visible")
  const signature = `${layout.join(".")}:${groups.map((group) => `${group.id}:${group.rows.length}`).join("|")}`
  useFlip(measureRef, signature)
  const [closed, setClosed] = React.useState<ReadonlySet<string>>(() => new Set())
  const total = count ?? groups.reduce((sum, group) => sum + group.rows.length, 0)
  const hasRows = groups.some((group) => group.rows.length > 0)
  const totalMin = visible.reduce((sum, column) => sum + column.minWidth, 0) || 1

  function mergedInto(columnId: string) {
    return columns.filter((column, index) => layout[index] === "merged" && column.mergeInto === columnId)
  }

  function toggleGroup(id: string) {
    setClosed((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  return (
    <section className={cn("flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-card", className)}>
      {title || filter || onFilter ? (
        <div className={cn("flex items-center gap-2 border-b border-border px-3 py-2", headerClassName)}>
          {title ? <h2 className="truncate text-sm font-semibold">{title}</h2> : null}
          {title ? (
            <Badge variant="secondary" className="tabular-nums">
              {total}
            </Badge>
          ) : null}
          <div className="ms-auto">
            {filter ??
              (onFilter ? (
                <Button type="button" variant="ghost" size="icon-sm" aria-label={filterLabel} onClick={onFilter}>
                  <Filter />
                </Button>
              ) : null)}
          </div>
        </div>
      ) : null}
      <div ref={measureRef} className="min-w-0">
        {loading ? (
          <p className="px-3 py-6 text-sm text-muted-foreground" role="status">
            {loadingLabel}
          </p>
        ) : !hasRows ? (
          <div className="px-3 py-6 text-sm text-muted-foreground">{emptyState ?? "Nothing here"}</div>
        ) : (
          <table lang={locale} className={cn("w-full table-fixed border-collapse text-sm tabular-nums", tableClassName)}>
            <caption className="sr-only">{title ?? "Table"}</caption>
            <colgroup>
              {visible.map((column) => (
                <col key={column.id} style={{ width: `${(column.minWidth / totalMin) * 100}%` }} />
              ))}
            </colgroup>
            <tbody>
              {groups.map((group, groupIndex) => {
                const isClosed = collapsibleGroups && closed.has(group.id)
                const showHeaderIcons = groupIndex === 0
                return (
                  <React.Fragment key={group.id}>
                    <tr className={cn("bg-muted/60", groupClassName)}>
                      {showHeaderIcons ? (
                        visible.map((column, columnIndex) => (
                          <th
                            key={column.id}
                            scope="col"
                            className={cn("px-3 py-2 text-start font-medium", column.align === "end" && "text-end")}
                          >
                            {columnIndex === 0 ? (
                              <span className="flex min-w-0 items-center gap-2">
                                {collapsibleGroups ? (
                                  <button
                                    type="button"
                                    aria-expanded={!isClosed}
                                    aria-controls={`${group.id}-rows`}
                                    onClick={() => toggleGroup(group.id)}
                                    className="grid size-5 shrink-0 place-items-center rounded-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                  >
                                    {isClosed ? (
                                      <ChevronRight className="size-3.5 rtl:rotate-180" />
                                    ) : (
                                      <ChevronDown className="size-3.5" />
                                    )}
                                    <span className="sr-only">{isClosed ? "Expand" : "Collapse"} {group.label}</span>
                                  </button>
                                ) : null}
                                {group.icon ? <span aria-hidden className="[&_svg]:size-3.5">{group.icon}</span> : null}
                                <span className="truncate">{group.label}</span>
                                <Badge variant="secondary" className="tabular-nums">
                                  {group.rows.length}
                                </Badge>
                                <span className="sr-only">{column.header.label}</span>
                              </span>
                            ) : (
                              <span
                                data-flip-id={`header-${column.id}`}
                                className="inline-flex items-center justify-end text-muted-foreground"
                              >
                                <span className="sr-only">{column.header.label}</span>
                                <span aria-hidden className="[&_svg]:size-3.5">
                                  {column.header.icon}
                                </span>
                              </span>
                            )}
                          </th>
                        ))
                      ) : (
                        <th scope="rowgroup" colSpan={visible.length} className="px-3 py-2 text-start font-medium">
                          <span className="flex min-w-0 items-center gap-2">
                            {collapsibleGroups ? (
                              <button
                                type="button"
                                aria-expanded={!isClosed}
                                aria-controls={`${group.id}-rows`}
                                onClick={() => toggleGroup(group.id)}
                                className="grid size-5 shrink-0 place-items-center rounded-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                              >
                                {isClosed ? (
                                  <ChevronRight className="size-3.5 rtl:rotate-180" />
                                ) : (
                                  <ChevronDown className="size-3.5" />
                                )}
                                <span className="sr-only">{isClosed ? "Expand" : "Collapse"} {group.label}</span>
                              </button>
                            ) : null}
                            {group.icon ? <span aria-hidden className="[&_svg]:size-3.5">{group.icon}</span> : null}
                            <span className="truncate">{group.label}</span>
                            <Badge variant="secondary" className="tabular-nums">
                              {group.rows.length}
                            </Badge>
                          </span>
                        </th>
                      )}
                    </tr>
                    {isClosed
                      ? null
                      : group.rows.map((row) => {
                          const rowId = getRowId(row)
                          return (
                            <tr
                              key={rowId}
                              id={`${group.id}-rows`}
                              tabIndex={onRowClick ? 0 : undefined}
                              onClick={onRowClick ? () => onRowClick(row) : undefined}
                              onKeyDown={
                                onRowClick
                                  ? (event) => {
                                      if (event.key === "Enter" || event.key === " ") {
                                        event.preventDefault()
                                        onRowClick(row)
                                      }
                                    }
                                  : undefined
                              }
                              className={cn(
                                "border-t border-border",
                                onRowClick &&
                                  "cursor-pointer hover:bg-accent/70 focus-visible:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                                rowClassName,
                              )}
                            >
                              {visible.map((column) => {
                                const folded = mergedInto(column.id)
                                return (
                                  <td
                                    key={column.id}
                                    data-flip-id={`${rowId}-${column.id}`}
                                    className={cn(
                                      "px-3 py-2 align-middle",
                                      column.align === "end" && folded.length === 0 && "text-end",
                                      cellClassName,
                                    )}
                                  >
                                    {folded.length > 0 ? (
                                      <span className="flex min-w-0 items-center gap-2">
                                        <span className="min-w-0 flex-1 truncate">{column.render(row)}</span>
                                        {folded.map((source) => (
                                          <span
                                            key={source.id}
                                            data-flip-id={`${rowId}-${source.id}`}
                                            className="shrink-0 text-muted-foreground tabular-nums"
                                          >
                                            {source.compactRender?.(row) ?? source.textValue?.(row)}
                                          </span>
                                        ))}
                                      </span>
                                    ) : (
                                      <span className="block min-w-0 overflow-hidden [overflow-wrap:anywhere]">
                                        {column.render(row)}
                                      </span>
                                    )}
                                  </td>
                                )
                              })}
                            </tr>
                          )
                        })}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </section>
  )
}
