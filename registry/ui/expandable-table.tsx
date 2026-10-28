"use client"

/**
 * Clean-room expandable table. A row can open a panel or a nested tree.
 * Shadcn Studio Pro was not purchased, fetched, or ported. No source, sample
 * rows, icons, or assets were copied. Built on this repo's TanStack Table
 * v8-compatible API (useLegacyTable and getExpandedRowModel).
 */

import * as React from "react"
import { flexRender } from "@tanstack/react-table"
import type { ExpandedState, RowSelectionState, Updater } from "@tanstack/react-table"
import {
  getCoreRowModel,
  getExpandedRowModel,
  getPaginationRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy"
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import {
  expandAll,
  expandableIds,
  filterExpandableRows,
  type ExpandableMap,
  type ExpandableNode,
} from "@/registry/retana/lib/expandable-table"

export type { ExpandableMap, ExpandableNode }

export const EXPANDABLE_DENSITIES = ["regular", "compact"] as const
export type ExpandableDensity = (typeof EXPANDABLE_DENSITIES)[number]

export type ExpandableColumn<T> = {
  id: string
  header: string
  cell: (row: T) => React.ReactNode
  align?: "start" | "end"
}

export type ExpandableFilter<T> = {
  id: string
  label: string
  all: string
  options: readonly { value: string; label: string }[]
  predicate: (row: T, value: string) => boolean
}

export type ExpandableAction = {
  id: string
  label: string
}

export type ChecklistItem = {
  id: string
  title: string
  status: string
  owner: string
  date: string
  comment?: string
}

export type ExpansionLine = {
  id: string
  name: string
  qty: string
  price: string
  amount: string
  kind?: "line" | "subtotal" | "total"
}

export type ExpandableTableLabels = {
  expand: (title: string) => string
  collapse: (title: string) => string
  expandAll: string
  collapseAll: string
  search: string
  density: string
  regular: string
  compact: string
  subtasks: string
  select: (title: string) => string
  selectPage: string
  actions: (title: string) => string
  previous: string
  next: string
  page: (current: number, total: number) => string
  empty: string
  noMatches: string
  loading: string
  rows: (count: number) => string
}

const tableLabels: ExpandableTableLabels = {
  expand: (title) => `Open ${title}`,
  collapse: (title) => `Close ${title}`,
  expandAll: "Open all",
  collapseAll: "Close all",
  search: "Search",
  density: "Density",
  regular: "Regular",
  compact: "Compact",
  subtasks: "Show subtasks",
  select: (title) => `Select ${title}`,
  selectPage: "Select the rows on this page",
  actions: (title) => `Actions for ${title}`,
  previous: "Previous page",
  next: "Next page",
  page: (current, total) => `Page ${current} of ${total}`,
  empty: "Nothing to show.",
  noMatches: "Nothing matches.",
  loading: "Loading the table",
  rows: (count) => `${count} selected`,
}

function resolveLabels(partial?: Partial<ExpandableTableLabels>): ExpandableTableLabels {
  return { ...tableLabels, ...partial }
}

function applyUpdater<T>(updater: Updater<T>, current: T): T {
  return typeof updater === "function" ? (updater as (value: T) => T)(current) : updater
}

export type ExpandableTableProps<T extends ExpandableNode> = {
  rows: readonly T[]
  columns: readonly ExpandableColumn<T>[]
  getSubRows?: (row: T) => readonly T[] | undefined
  setSubRows?: (row: T, children: T[]) => T
  renderDetail?: (row: T) => React.ReactNode
  rowTitle: (row: T) => string
  searchText?: (row: T) => string
  filters?: readonly ExpandableFilter<T>[]
  actions?: readonly ExpandableAction[]
  onAction?: (actionId: string, row: T) => void
  expanded?: ExpandedState
  defaultExpanded?: ExpandedState
  onExpandedChange?: (expanded: ExpandedState) => void
  rowSelection?: RowSelectionState
  defaultRowSelection?: RowSelectionState
  onRowSelectionChange?: (selection: RowSelectionState) => void
  density?: ExpandableDensity
  defaultDensity?: ExpandableDensity
  onDensityChange?: (density: ExpandableDensity) => void
  subtasksOpen?: boolean
  onSubtasksChange?: (open: boolean) => void
  pageSize?: number
  loading?: boolean
  error?: string
  labels?: Partial<ExpandableTableLabels>
  className?: string
}

export function ExpandableTable<T extends ExpandableNode>({
  rows,
  columns,
  getSubRows,
  setSubRows,
  renderDetail,
  rowTitle,
  searchText,
  filters,
  actions,
  onAction,
  expanded: expandedProp,
  defaultExpanded = {},
  onExpandedChange,
  rowSelection: selectionProp,
  defaultRowSelection = {},
  onRowSelectionChange,
  density: densityProp,
  defaultDensity = "regular",
  onDensityChange,
  subtasksOpen = false,
  onSubtasksChange,
  pageSize = 5,
  loading = false,
  error,
  labels: labelOverrides,
  className,
}: ExpandableTableProps<T>) {
  const labels = resolveLabels(labelOverrides)
  const [query, setQuery] = React.useState("")
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({})
  const [innerExpanded, setInnerExpanded] = React.useState<ExpandedState>(defaultExpanded)
  const [innerSelection, setInnerSelection] = React.useState<RowSelectionState>(defaultRowSelection)
  const [innerDensity, setInnerDensity] = React.useState<ExpandableDensity>(defaultDensity)
  const expanded = expandedProp ?? innerExpanded
  const rowSelection = selectionProp ?? innerSelection
  const density = densityProp ?? innerDensity
  const hasDetail = Boolean(renderDetail)

  const data = React.useMemo(() => {
    const predicates = (filters ?? [])
      .filter((filter) => filterValues[filter.id])
      .map((filter) => (row: T) => filter.predicate(row, filterValues[filter.id] ?? ""))
    return filterExpandableRows(rows, { query, searchText, getSubRows, setSubRows, predicates })
  }, [filterValues, filters, getSubRows, query, rows, searchText, setSubRows])

  function commitExpanded(updater: Updater<ExpandedState>) {
    const next = applyUpdater(updater, expanded)
    if (expandedProp === undefined) setInnerExpanded(next)
    onExpandedChange?.(next)
  }

  function commitSelection(updater: Updater<RowSelectionState>) {
    const next = applyUpdater(updater, rowSelection)
    if (selectionProp === undefined) setInnerSelection(next)
    onRowSelectionChange?.(next)
  }

  const tanstackColumns = React.useMemo<LegacyColumnDef<T>[]>(() => {
    const defined: LegacyColumnDef<T>[] = columns.map((column) => ({
      id: column.id,
      header: column.header,
      cell: ({ row }) => column.cell(row.original),
      meta: { align: column.align },
    }))
    return [
      { id: "select", header: () => null, cell: () => null, enableHiding: false },
      { id: "expand", header: () => null, cell: () => null, enableHiding: false },
      ...defined,
      { id: "actions", header: () => null, cell: () => null, enableHiding: false },
    ]
  }, [columns])

  const table = useLegacyTable({
    data: data as T[],
    columns: tanstackColumns,
    state: { expanded, rowSelection },
    onExpandedChange: commitExpanded,
    onRowSelectionChange: commitSelection,
    getRowId: (row) => row.id,
    getSubRows: getSubRows ? (row) => [...(getSubRows(row) ?? [])] : undefined,
    getRowCanExpand: (row) => hasDetail || row.subRows.length > 0,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    autoResetAll: false,
    autoResetExpanded: false,
    autoResetPageIndex: false,
    paginateExpandedRows: false,
    initialState: { pagination: { pageIndex: 0, pageSize } },
  })

  const pageRows = table.getRowModel().rows
  const selectedCount = Object.values(rowSelection).filter(Boolean).length
  const pageCount = Math.max(table.getPageCount(), 1)
  const pageIndex = table.getState().pagination.pageIndex

  function openEvery(open: boolean) {
    commitExpanded(open ? expandAll(expandableIds(data, getSubRows, hasDetail)) : {})
  }

  function toggleSubtasks(open: boolean) {
    onSubtasksChange?.(open)
    openEvery(open)
  }

  const pad = density === "compact" ? "px-2 py-1" : "px-3 py-2"

  return (
    <section className={cn("flex flex-col gap-3 text-sm text-card-foreground", className)} aria-busy={loading || undefined}>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            table.setPageIndex(0)
          }}
          placeholder={labels.search}
          aria-label={labels.search}
          className="h-8 w-full sm:w-48"
        />
        {(filters ?? []).map((filter) => (
          <Select
            key={filter.id}
            value={filterValues[filter.id] || "all"}
            onValueChange={(value) => {
              setFilterValues((current) => ({ ...current, [filter.id]: value === "all" ? "" : value }))
              table.setPageIndex(0)
            }}
          >
            <SelectTrigger className="h-8 w-full sm:w-40" aria-label={filter.label}>
              <SelectValue placeholder={filter.label} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{filter.all}</SelectItem>
              {filter.options.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}
        {onSubtasksChange ? (
          <label className="inline-flex items-center gap-2 text-xs">
            <Switch checked={subtasksOpen} onCheckedChange={toggleSubtasks} aria-label={labels.subtasks} />
            {labels.subtasks}
          </label>
        ) : null}
        <div className="ms-auto flex flex-wrap gap-2">
          <Button type="button" size="sm" variant="outline" className="h-auto whitespace-normal" onClick={() => openEvery(true)}>
            {labels.expandAll}
          </Button>
          <Button type="button" size="sm" variant="outline" className="h-auto whitespace-normal" onClick={() => openEvery(false)}>
            {labels.collapseAll}
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" size="sm" variant="outline">
                {labels.density}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuRadioGroup
                value={density}
                onValueChange={(value) => {
                  const next = value as ExpandableDensity
                  if (densityProp === undefined) setInnerDensity(next)
                  onDensityChange?.(next)
                }}
              >
                <DropdownMenuRadioItem value="regular">{labels.regular}</DropdownMenuRadioItem>
                <DropdownMenuRadioItem value="compact">{labels.compact}</DropdownMenuRadioItem>
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      {error ? (
        <p role="alert" className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2 text-destructive">
          {error}
        </p>
      ) : null}
      {loading ? (
        <div className="flex flex-col gap-2" aria-label={labels.loading}>
          <Skeleton className="h-8 w-full motion-reduce:animate-none" />
          <Skeleton className="h-8 w-full motion-reduce:animate-none" />
          <Skeleton className="h-8 w-2/3 motion-reduce:animate-none" />
        </div>
      ) : data.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border px-3 py-6 text-center text-muted-foreground">
          {rows.length === 0 ? labels.empty : labels.noMatches}
        </p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full min-w-[36rem] border-collapse text-start">
            <thead className="bg-muted/50 text-xs text-muted-foreground">
              {table.getHeaderGroups().map((group) => (
                <tr key={group.id}>
                  {group.headers.map((header) => (
                    <th key={header.id} className={cn("font-medium", pad, header.column.id === "select" && "w-10", header.column.id === "expand" && "w-10")}>
                      {header.column.id === "select" ? (
                        <Checkbox
                          aria-label={labels.selectPage}
                          checked={table.getIsAllPageRowsSelected() ? true : table.getIsSomePageRowsSelected() ? "indeterminate" : false}
                          onCheckedChange={(value) => table.toggleAllPageRowsSelected(value === true)}
                        />
                      ) : header.column.id === "expand" || header.column.id === "actions" ? null : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {pageRows.map((row) => {
                const title = rowTitle(row.original)
                const open = row.getIsExpanded()
                const canOpen = row.getCanExpand()
                return (
                  <React.Fragment key={row.id}>
                    <tr className="border-t border-border" data-depth={row.depth}>
                      <td className={pad}>
                        <Checkbox
                          aria-label={labels.select(title)}
                          checked={row.getIsSelected()}
                          onCheckedChange={(value) => row.toggleSelected(value === true)}
                        />
                      </td>
                      <td className={pad}>
                        {canOpen ? (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            className="size-7"
                            aria-expanded={open}
                            aria-label={open ? labels.collapse(title) : labels.expand(title)}
                            onClick={() => row.toggleExpanded()}
                            onKeyDown={(event) => {
                              if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
                              event.preventDefault()
                              row.toggleExpanded(event.key === "ArrowRight")
                            }}
                          >
                            <ChevronRight className={cn("size-4 transition-transform duration-200 motion-reduce:transition-none", open && "rotate-90")} aria-hidden />
                          </Button>
                        ) : null}
                      </td>
                      {row.getVisibleCells().filter((cell) => !["select", "expand", "actions"].includes(cell.column.id)).map((cell) => {
                        const align = (cell.column.columnDef.meta as { align?: string } | undefined)?.align
                        return (
                          <td key={cell.id} className={cn(pad, align === "end" && "text-end tabular-nums")}>
                            <span className="inline-flex min-w-0 items-center" style={{ paddingInlineStart: cell.column.id === columns[0]?.id ? `${row.depth * 1.1}rem` : undefined }}>
                              {row.depth > 0 && cell.column.id === columns[0]?.id ? (
                                <span className="me-2 inline-block size-3 border-b border-s border-border" aria-hidden />
                              ) : null}
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </span>
                          </td>
                        )
                      })}
                      <td className={cn(pad, "text-end")}>
                        {actions && actions.length > 0 ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" size="icon-sm" variant="ghost" className="size-7" aria-label={labels.actions(title)}>
                                <MoreHorizontal className="size-4" aria-hidden />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              {actions.map((action) => (
                                <DropdownMenuItem key={action.id} onSelect={() => onAction?.(action.id, row.original)}>
                                  {action.label}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : null}
                      </td>
                    </tr>
                    {hasDetail ? (
                      <tr>
                        <td colSpan={columns.length + 3} className="p-0">
                          <div
                            className={cn(
                              "grid transition-[grid-template-rows] duration-200 motion-reduce:transition-none",
                              open ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
                            )}
                          >
                            <div className="overflow-hidden" aria-hidden={open ? undefined : true}>
                              <div className="border-t border-border bg-muted/30 p-3">{open ? renderDetail?.(row.original) : null}</div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        <span>{labels.rows(selectedCount)}</span>
        <div className="ms-auto flex items-center gap-1">
          <Button type="button" size="icon-sm" variant="outline" className="size-7" aria-label={labels.previous} disabled={!table.getCanPreviousPage()} onClick={() => table.previousPage()}>
            <ChevronLeft className="size-4" aria-hidden />
          </Button>
          <span className="tabular-nums">{labels.page(pageIndex + 1, pageCount)}</span>
          <Button type="button" size="icon-sm" variant="outline" className="size-7" aria-label={labels.next} disabled={!table.getCanNextPage()} onClick={() => table.nextPage()}>
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </section>
  )
}

export function ExpansionChecklist({ items, label }: { items: readonly ChecklistItem[]; label: string }) {
  return (
    <ul aria-label={label} className="grid gap-2 sm:grid-cols-2">
      {items.map((item) => (
        <li key={item.id} className="flex min-w-0 flex-col gap-1 rounded-lg border border-border bg-card p-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{item.status}</Badge>
            <span className="text-xs text-muted-foreground">{item.date}</span>
          </div>
          <p className="font-medium break-words">{item.title}</p>
          <p className="text-xs text-muted-foreground">{item.owner}</p>
          {item.comment ? <p className="text-xs break-words">{item.comment}</p> : null}
        </li>
      ))}
    </ul>
  )
}

export function ExpansionLines({
  lines,
  caption,
}: {
  lines: readonly ExpansionLine[]
  caption: string
}) {
  return (
    <table className="w-full text-xs" aria-label={caption}>
      <tbody>
        {lines.map((line) => (
          <tr key={line.id} className={cn("border-t border-border", line.kind === "total" && "font-medium")}>
            <td className="py-1 pe-3">{line.name}</td>
            <td className="py-1 pe-3 text-end tabular-nums text-muted-foreground">{line.kind === "line" ? line.qty : ""}</td>
            <td className="py-1 pe-3 text-end tabular-nums text-muted-foreground">{line.kind === "line" ? line.price : ""}</td>
            <td className="py-1 text-end tabular-nums">{line.amount}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}
