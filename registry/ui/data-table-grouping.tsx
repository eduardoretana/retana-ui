"use client"

import * as React from "react"
import { flexRender } from "@tanstack/react-table"
import {
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyCell,
  type LegacyColumnDef,
  type LegacyHeader,
  type LegacyRow,
} from "@tanstack/react-table/legacy"
import type {
  ColumnOrderState,
  ColumnVisibilityState,
  ExpandedState,
  GroupingState,
  PaginationState,
  RowData,
  RowSelectionState,
  SortingState,
  Updater,
} from "@tanstack/react-table"
import { ChevronRight, Columns3, Ellipsis } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  filterTableRows,
  patchSelection,
  selectedCount,
  selectionFlag,
  terminalRows,
  type SelectionFlag,
} from "@/registry/retana/lib/data-table-grouping"

const SELECT_ID = "select"
const ANY = "__any"
const TREE_DEPTH = 32

export const dataTableGroupingDensity = {
  compact: { head: "h-8 px-2 text-xs", cell: "px-2 py-1 text-xs", row: "h-8" },
  comfortable: { head: "h-10 px-2 text-sm", cell: "px-2 py-2 text-sm", row: "h-11" },
  spacious: { head: "h-12 px-3 text-sm", cell: "px-3 py-3 text-sm", row: "h-14" },
} as const

export type DataTableGroupingDensity = keyof typeof dataTableGroupingDensity

export const dataTableGroupingGroupTone = {
  subtle: "bg-muted/40",
  plain: "bg-transparent",
  accent: "bg-accent/40",
} as const

export type DataTableGroupingGroupTone = keyof typeof dataTableGroupingGroupTone

export type DataTableGroupingMeta = {
  align?: "start" | "end"
  aggregate?: "sum" | "avg"
}

export type DataTableGroupingColumn<T extends RowData> = LegacyColumnDef<T>

export type DataTableGroupingCriterion = {
  id: string
  label: string
  /** Column id to group by. Null clears grouping. */
  columnId: string | null
}

export type DataTableGroupingFilter<T extends RowData> = {
  id: string
  label: string
  options: readonly { value: string; label: string }[]
  predicate: (row: T, value: string) => boolean
}

export type DataTableGroupingGroup<T extends RowData> = {
  columnId: string
  value: unknown
  text: string
  count: number
  rows: T[]
}

export type DataTableGroupingLabels = {
  table: string
  groupBy: string
  collapse: string
  expand: string
  collapseAll: string
  expandAll: string
  view: string
  columns: string
  density: string
  compact: string
  comfortable: string
  spacious: string
  moveLeft: string
  moveRight: string
  hideColumn: string
  columnMenu: string
  selectAll: string
  selectRow: string
  selectGroup: string
  selected: string
  rowsPerPage: string
  page: string
  of: string
  previous: string
  next: string
  search: string
  emptyTitle: string
  emptyDescription: string
  loading: string
  errorTitle: string
  retry: string
  grandTotal: string
  showDetails: string
  hideDetails: string
  filterAny: string
  sortAscending: string
  sortDescending: string
  clearSort: string
}

const defaultLabels: DataTableGroupingLabels = {
  table: "Data table",
  groupBy: "Group by",
  collapse: "Collapse",
  expand: "Expand",
  collapseAll: "Collapse all",
  expandAll: "Expand all",
  view: "View",
  columns: "Columns",
  density: "Density",
  compact: "Compact",
  comfortable: "Comfortable",
  spacious: "Spacious",
  moveLeft: "Move left",
  moveRight: "Move right",
  hideColumn: "Hide column",
  columnMenu: "Column options",
  selectAll: "Select all",
  selectRow: "Select",
  selectGroup: "Select group",
  selected: "selected",
  rowsPerPage: "Rows per page",
  page: "Page",
  of: "of",
  previous: "Previous",
  next: "Next",
  search: "Search",
  emptyTitle: "No rows",
  emptyDescription: "Nothing matches these filters.",
  loading: "Loading rows",
  errorTitle: "Could not load rows",
  retry: "Try again",
  grandTotal: "Total",
  showDetails: "Show details",
  hideDetails: "Hide details",
  filterAny: "Any",
  sortAscending: "Sort ascending",
  sortDescending: "Sort descending",
  clearSort: "Clear sort",
}

export type DataTableGroupingProps<T extends RowData> = {
  data: readonly T[]
  columns: readonly DataTableGroupingColumn<T>[]
  getRowId: (row: T) => string
  getRowLabel?: (row: T) => string
  groupCriteria?: readonly DataTableGroupingCriterion[]
  groupBy?: string | null
  defaultGroupBy?: string | null
  onGroupByChange?: (id: string | null) => void
  getGroupLabel?: (group: DataTableGroupingGroup<T>) => React.ReactNode
  getGroupClassName?: (group: DataTableGroupingGroup<T>) => string | undefined
  groupTone?: DataTableGroupingGroupTone
  getSubRows?: (row: T) => readonly T[] | undefined
  setSubRows?: (row: T, children: T[]) => T
  renderDetail?: (row: T) => React.ReactNode
  aggregates?: Partial<Record<string, "sum" | "avg">>
  align?: Partial<Record<string, "start" | "end">>
  filters?: readonly DataTableGroupingFilter<T>[]
  searchText?: (row: T) => string
  searchPlaceholder?: string
  density?: DataTableGroupingDensity
  defaultDensity?: DataTableGroupingDensity
  onDensityChange?: (density: DataTableGroupingDensity) => void
  pageSizeOptions?: readonly number[]
  defaultPageSize?: number
  enablePagination?: boolean
  loading?: boolean
  error?: React.ReactNode
  onRetry?: () => void
  labels?: Partial<DataTableGroupingLabels>
  className?: string
  toolbarClassName?: string
  tableClassName?: string
  groupRowClassName?: string
  rowClassName?: string
  footerClassName?: string
  detailClassName?: string
  /** Max height of the scrolling table body. The total footer stays pinned. */
  maxBodyHeight?: number | string
}

function columnIdOf<T extends RowData>(column: DataTableGroupingColumn<T>, index: number) {
  if (typeof column.id === "string" && column.id) return column.id
  if ("accessorKey" in column && column.accessorKey != null) return String(column.accessorKey)
  return `col_${index}`
}

function readMeta(column: { meta?: unknown }): DataTableGroupingMeta {
  const meta = column.meta
  if (!meta || typeof meta !== "object") return {}
  return meta as DataTableGroupingMeta
}

function groupText(value: unknown) {
  if (value == null || value === "") return "—"
  return String(value)
}

function applyUpdater<T>(updater: Updater<T>, current: T): T {
  return typeof updater === "function" ? (updater as (old: T) => T)(current) : updater
}

function headerText(header: unknown, fallback: string) {
  return typeof header === "string" ? header : fallback
}

function prepareColumns<T extends RowData>(
  columns: readonly DataTableGroupingColumn<T>[],
  aggregates: Partial<Record<string, "sum" | "avg">> | undefined,
) {
  return columns.map((column, index) => {
    const id = columnIdOf(column, index)
    const kind = aggregates?.[id] ?? readMeta(column).aggregate
    const aggregationFn = column.aggregationFn ?? (kind === "avg" ? "mean" : kind === "sum" ? "sum" : undefined)
    if (!aggregationFn) return { ...column, id }
    return {
      ...column,
      id,
      aggregationFn,
      maxAggregationDepth: column.maxAggregationDepth ?? TREE_DEPTH,
      aggregatedCell: column.aggregatedCell ?? column.cell,
    }
  })
}

function alignsEnd(
  column: { id: string; columnDef: { meta?: unknown } },
  align: Partial<Record<string, "start" | "end">> | undefined,
) {
  return (align?.[column.id] ?? readMeta(column.columnDef).align) === "end"
}

function hasAggregate(column: { columnDef: { aggregationFn?: unknown } }) {
  const fn = column.columnDef.aggregationFn
  return fn != null && fn !== "auto"
}

function renderAggregate<T extends RowData>(cell: LegacyCell<T>, rows: LegacyRow<T>[]) {
  const value = cell.column.getAggregationValue?.({ rows, maxDepth: 0 })
  const template = cell.column.columnDef.aggregatedCell ?? cell.column.columnDef.cell
  const context = cell.getContext()
  return flexRender(template, {
    ...context,
    getValue: () => value,
    renderValue: () => value ?? null,
  } as typeof context)
}

function ExpandControl({
  expanded,
  label,
  onClick,
}: {
  expanded: boolean
  label: string
  onClick: () => void
}) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      aria-expanded={expanded}
      aria-label={label}
      onClick={(event) => {
        event.stopPropagation()
        onClick()
      }}
    >
      <ChevronRight
        className={cn("transition-transform duration-200 motion-reduce:transition-none", expanded && "rotate-90")}
      />
    </Button>
  )
}

function SelectBox({
  checked,
  label,
  onCheckedChange,
}: {
  checked: SelectionFlag
  label: string
  onCheckedChange: (selected: boolean) => void
}) {
  return (
    <Checkbox
      checked={checked}
      aria-label={label}
      onClick={(event) => event.stopPropagation()}
      onCheckedChange={(value) => onCheckedChange(value === true)}
      onKeyDown={(event) => event.stopPropagation()}
    />
  )
}

export function DataTableGrouping<T extends RowData>({
  data,
  columns,
  getRowId,
  getRowLabel,
  groupCriteria,
  groupBy,
  defaultGroupBy = null,
  onGroupByChange,
  getGroupLabel,
  getGroupClassName,
  groupTone = "subtle",
  getSubRows,
  setSubRows,
  renderDetail,
  aggregates,
  align,
  filters,
  searchText,
  searchPlaceholder,
  density: densityProp,
  defaultDensity = "comfortable",
  onDensityChange,
  pageSizeOptions = [5, 10, 20, 50],
  defaultPageSize = 10,
  enablePagination = true,
  loading = false,
  error,
  onRetry,
  labels: labelOverrides,
  className,
  toolbarClassName,
  tableClassName,
  groupRowClassName,
  rowClassName,
  footerClassName,
  detailClassName,
  maxBodyHeight = "28rem",
}: DataTableGroupingProps<T>) {
  const labels = { ...defaultLabels, ...labelOverrides }
  const [uncontrolledGroup, setUncontrolledGroup] = React.useState<string | null>(defaultGroupBy)
  const [uncontrolledDensity, setUncontrolledDensity] = React.useState<DataTableGroupingDensity>(defaultDensity)
  const activeGroup = groupBy !== undefined ? groupBy : uncontrolledGroup
  const density = densityProp ?? uncontrolledDensity
  const densityClass = dataTableGroupingDensity[density]
  const grouping = React.useMemo<GroupingState>(() => {
    const criterion = groupCriteria?.find((item) => item.id === activeGroup)
    return criterion?.columnId ? [criterion.columnId] : []
  }, [activeGroup, groupCriteria])
  const groupKey = grouping.join("\0")
  const [expanded, setExpanded] = React.useState<ExpandedState>(true)
  const [expandedGroup, setExpandedGroup] = React.useState(groupKey)
  if (expandedGroup !== groupKey) {
    setExpandedGroup(groupKey)
    setExpanded(true)
  }
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<ColumnVisibilityState>({})
  const [columnOrder, setColumnOrder] = React.useState<ColumnOrderState>([])
  const [pagination, setPagination] = React.useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  })
  const [query, setQuery] = React.useState("")
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({})
  const [details, setDetails] = React.useState<Record<string, boolean>>({})

  const prepared = React.useMemo(
    () => prepareColumns(columns, aggregates),
    [aggregates, columns],
  )

  const tableData = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    const activeFilters = (filters ?? []).filter((filter) => {
      const value = filterValues[filter.id]
      return value != null && value !== ANY && value !== ""
    })
    if (!needle && activeFilters.length === 0) return data
    return filterTableRows(data, {
      getSubRows,
      setSubRows,
      matchSearch: (row) => {
        if (!needle) return true
        if (!searchText) return true
        return searchText(row).toLowerCase().includes(needle)
      },
      matchFilters: (row) => activeFilters.every((filter) => filter.predicate(row, filterValues[filter.id] ?? "")),
    })
  }, [data, filterValues, filters, getSubRows, query, searchText, setSubRows])

  const selectionColumn: DataTableGroupingColumn<T> = {
    id: SELECT_ID,
    enableSorting: false,
    enableHiding: false,
    enableGrouping: false,
    header: () => null,
    cell: () => null,
  }

  const table = useLegacyTable({
    data: tableData as T[],
    columns: [selectionColumn, ...prepared],
    state: {
      grouping,
      expanded,
      rowSelection,
      sorting,
      columnVisibility,
      columnOrder,
      pagination,
    },
    onGroupingChange: (updater) => {
      const next = applyUpdater(updater, grouping)
      const columnId = next[0] ?? null
      const match = groupCriteria?.find((item) => item.columnId === columnId)
      const id = match?.id ?? (columnId == null ? (groupCriteria?.find((item) => item.columnId == null)?.id ?? null) : null)
      if (groupBy === undefined) setUncontrolledGroup(id)
      onGroupByChange?.(id)
    },
    onExpandedChange: setExpanded,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onColumnOrderChange: setColumnOrder,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getPaginationRowModel: enablePagination ? getPaginationRowModel() : undefined,
    groupedColumnMode: false,
    autoResetAll: false,
    autoResetExpanded: false,
    autoResetPageIndex: false,
    paginateExpandedRows: false,
    enableRowSelection: true,
    getRowId: (row) => getRowId(row),
    getSubRows: getSubRows ? (row) => getSubRows(row) as T[] | undefined : undefined,
  })

  const leafIds = terminalRows(table.getPreGroupedRowModel().rows).map((row) => row.id)
  const count = selectedCount(leafIds, rowSelection)
  const pageCount = Math.max(table.getPageCount(), 1)
  const pageIndex = table.getState().pagination.pageIndex
  const showHierarchy = Boolean(groupCriteria?.length || getSubRows || renderDetail)
  const bodyHeight = typeof maxBodyHeight === "number" ? `${maxBodyHeight}px` : maxBodyHeight
  const visibleColumnCount = table.getVisibleLeafColumns().length

  function chooseGroup(id: string | null) {
    if (groupBy === undefined) setUncontrolledGroup(id)
    onGroupByChange?.(id)
    setExpanded(true)
    setPagination((current) => ({ ...current, pageIndex: 0 }))
  }

  function chooseDensity(next: DataTableGroupingDensity) {
    if (densityProp === undefined) setUncontrolledDensity(next)
    onDensityChange?.(next)
  }

  function moveColumn(columnId: string, direction: -1 | 1) {
    setColumnOrder((current) => {
      const base = current.length > 0 ? [...current] : table.getAllLeafColumns().map((column) => column.id)
      const index = base.indexOf(columnId)
      const target = index + direction
      if (index <= 0 || target <= 0 || target >= base.length) return base
      const [item] = base.splice(index, 1)
      if (!item) return base
      base.splice(target, 0, item)
      return base
    })
  }

  function setLeaves(ids: string[], selected: boolean) {
    setRowSelection((current) => patchSelection(current, ids, selected))
  }

  function toggleDetails(id: string) {
    setDetails((current) => ({ ...current, [id]: !current[id] }))
  }

  function setAllDetails(open: boolean) {
    if (!renderDetail) return
    if (!open) {
      setDetails({})
      return
    }
    const next: Record<string, boolean> = {}
    for (const id of leafIds) next[id] = true
    setDetails(next)
  }

  const firstDataColumnId = table.getVisibleLeafColumns().find((column) => column.id !== SELECT_ID)?.id

  return (
    <div className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className={cn("flex flex-col gap-3", toolbarClassName)}>
        <div className="flex flex-wrap items-center gap-2">
          {searchText ? (
            <Input
              type="search"
              value={query}
              placeholder={searchPlaceholder ?? labels.search}
              aria-label={labels.search}
              className="w-full max-w-56"
              onChange={(event) => {
                setQuery(event.target.value)
                setPagination((current) => ({ ...current, pageIndex: 0 }))
              }}
            />
          ) : null}
          {filters?.map((filter) => (
            <Select
              key={filter.id}
              value={filterValues[filter.id] ?? ANY}
              onValueChange={(value) => {
                setFilterValues((current) => ({ ...current, [filter.id]: value }))
                setPagination((current) => ({ ...current, pageIndex: 0 }))
              }}
            >
              <SelectTrigger size="sm" aria-label={filter.label}>
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value={ANY}>{labels.filterAny}</SelectItem>
                  {filter.options.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          ))}
          <div className="ms-auto flex flex-wrap items-center gap-2">
            <p aria-live="polite" className="text-sm text-muted-foreground tabular-nums">
              {count} {labels.selected}
            </p>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button type="button" variant="outline" size="sm">
                  <Columns3 data-icon="inline-start" />
                  {labels.view}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{labels.density}</DropdownMenuLabel>
                  <DropdownMenuRadioGroup
                    value={density}
                    onValueChange={(value) => chooseDensity(value as DataTableGroupingDensity)}
                  >
                    {(["compact", "comfortable", "spacious"] as const).map((option) => (
                      <DropdownMenuRadioItem key={option} value={option}>
                        {labels[option]}
                      </DropdownMenuRadioItem>
                    ))}
                  </DropdownMenuRadioGroup>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{labels.columns}</DropdownMenuLabel>
                  {table
                    .getAllLeafColumns()
                    .filter((column) => column.getCanHide())
                    .map((column) => (
                      <DropdownMenuCheckboxItem
                        key={column.id}
                        checked={column.getIsVisible()}
                        onCheckedChange={(value) => column.toggleVisibility(value === true)}
                        onSelect={(event) => event.preventDefault()}
                      >
                        {headerText(column.columnDef.header, column.id)}
                      </DropdownMenuCheckboxItem>
                    ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        {groupCriteria && groupCriteria.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-muted-foreground">{labels.groupBy}</span>
            <div role="group" aria-label={labels.groupBy} className="flex flex-wrap gap-1">
              {groupCriteria.map((criterion) => {
                const pressed = criterion.id === activeGroup
                return (
                  <Button
                    key={criterion.id}
                    type="button"
                    size="sm"
                    variant={pressed ? "secondary" : "outline"}
                    aria-pressed={pressed}
                    onClick={() => chooseGroup(criterion.id)}
                  >
                    {criterion.label}
                  </Button>
                )
              })}
            </div>
          </div>
        ) : null}
        {showHierarchy ? (
          <div className="flex flex-wrap gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                table.toggleAllRowsExpanded(false)
                setAllDetails(false)
              }}
            >
              {labels.collapseAll}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => {
                table.toggleAllRowsExpanded(true)
                setAllDetails(true)
              }}
            >
              {labels.expandAll}
            </Button>
          </div>
        ) : null}
      </div>

      <div
        className="min-w-0 **:data-[slot=table-container]:overflow-auto **:data-[slot=table-container]:max-h-(--grouping-body-height)"
        style={{ "--grouping-body-height": bodyHeight } as React.CSSProperties}
      >
        <Table aria-label={labels.table} aria-busy={loading || undefined} className={tableClassName}>
          <TableHeader className="sticky top-0 z-10 bg-background">
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    scope="col"
                    className={cn(densityClass.head, alignsEnd(header.column, align) && "text-end")}
                  >
                    {header.isPlaceholder ? null : (
                      <div className={cn("flex items-center gap-1", alignsEnd(header.column, align) && "justify-end")}>
                        {header.column.id === SELECT_ID ? (
                          <SelectBox
                            checked={selectionFlag(leafIds, rowSelection)}
                            label={labels.selectAll}
                            onCheckedChange={(selected) => setLeaves(leafIds, selected)}
                          />
                        ) : (
                          <span className="truncate">{flexRender(header.column.columnDef.header, header.getContext())}</span>
                        )}
                        {header.column.getCanSort() ? <SortMark header={header} /> : null}
                        {header.column.id !== SELECT_ID ? (
                          <ColumnMenu
                            header={header}
                            labels={labels}
                            order={columnOrder.length > 0 ? columnOrder : table.getAllLeafColumns().map((column) => column.id)}
                            onMove={moveColumn}
                          />
                        ) : null}
                      </div>
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="whitespace-normal">
                  <div role="status" aria-label={labels.loading} className="flex flex-col gap-2 py-3">
                    {Array.from({ length: 4 }, (_, index) => (
                      <Skeleton key={index} className="h-8 w-full motion-reduce:animate-none" />
                    ))}
                  </div>
                </TableCell>
              </TableRow>
            ) : error ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="whitespace-normal">
                  <div role="alert" className="flex flex-col items-center gap-3 py-8 text-center">
                    <p className="font-medium">{labels.errorTitle}</p>
                    <div className="text-sm text-muted-foreground">{error}</div>
                    {onRetry ? (
                      <Button type="button" size="sm" variant="outline" onClick={onRetry}>
                        {labels.retry}
                      </Button>
                    ) : null}
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={visibleColumnCount} className="whitespace-normal">
                  <div role="status" className="flex flex-col items-center gap-1 py-8 text-center">
                    <p className="font-medium">{labels.emptyTitle}</p>
                    <p className="text-sm text-muted-foreground">{labels.emptyDescription}</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => {
                const grouped = row.getIsGrouped()
                const leaves = grouped || row.subRows.length > 0 ? terminalRows(row.subRows) : [row]
                const leafIdList = leaves.map((leaf) => leaf.id)
                const checked = selectionFlag(leafIdList, rowSelection)
                const originals = leaves.map((leaf) => leaf.original)
                const text = groupText(row.groupingValue)
                const info: DataTableGroupingGroup<T> = {
                  columnId: row.groupingColumnId ?? "",
                  value: row.groupingValue,
                  text,
                  count: leafIdList.length,
                  rows: originals,
                }
                const labelColumnId =
                  grouped && row.groupingColumnId && table.getColumn(row.groupingColumnId)?.getIsVisible()
                    ? row.groupingColumnId
                    : firstDataColumnId
                const rowLabel = getRowLabel?.(row.original) ?? row.id
                const detailOpen = !grouped && Boolean(details[row.id])
                const treeOpen = row.getIsExpanded()
                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      data-state={checked === true ? "selected" : undefined}
                      data-group={grouped ? text : undefined}
                      data-depth={row.depth}
                      className={cn(
                        densityClass.row,
                        grouped && dataTableGroupingGroupTone[groupTone],
                        grouped && getGroupClassName?.(info),
                        grouped ? groupRowClassName : rowClassName,
                      )}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const end = alignsEnd(cell.column, align)
                        const isLabel = cell.column.id === labelColumnId
                        const isSelect = cell.column.id === SELECT_ID
                        let content: React.ReactNode = null
                        if (isSelect) {
                          content = (
                            <SelectBox
                              checked={checked}
                              label={grouped ? `${labels.selectGroup} ${text}` : `${labels.selectRow} ${rowLabel}`}
                              onCheckedChange={(selected) => setLeaves(leafIdList, selected)}
                            />
                          )
                        } else if (grouped && isLabel) {
                          content = (
                            <div role="group" aria-label={`${text}, ${info.count}`} className="flex min-w-0 items-center gap-2">
                              <ExpandControl
                                expanded={treeOpen}
                                label={`${treeOpen ? labels.collapse : labels.expand} ${text}`}
                                onClick={() => row.toggleExpanded()}
                              />
                              <span className="min-w-0 break-all font-medium">{getGroupLabel ? getGroupLabel(info) : text}</span>
                              <Badge variant="secondary">{info.count}</Badge>
                            </div>
                          )
                        } else if (grouped && hasAggregate(cell.column)) {
                          content = renderAggregate(cell, leaves)
                        } else if (!grouped && isLabel) {
                          const canTree = row.subRows.length > 0
                          content = (
                            <div
                              className="flex min-w-0 items-center gap-2"
                              style={{ paddingInlineStart: `${row.depth * 1.25}rem` }}
                            >
                              {canTree ? (
                                <ExpandControl
                                  expanded={treeOpen}
                                  label={`${treeOpen ? labels.collapse : labels.expand} ${rowLabel}`}
                                  onClick={() => row.toggleExpanded()}
                                />
                              ) : null}
                              {renderDetail ? (
                                <ExpandControl
                                  expanded={detailOpen}
                                  label={`${detailOpen ? labels.hideDetails : labels.showDetails} ${rowLabel}`}
                                  onClick={() => toggleDetails(row.id)}
                                />
                              ) : null}
                              <div className="min-w-0 break-all">
                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                              </div>
                            </div>
                          )
                        } else if (!grouped && row.subRows.length > 0 && hasAggregate(cell.column)) {
                          content = renderAggregate(cell, leaves)
                        } else if (!grouped) {
                          content = flexRender(cell.column.columnDef.cell, cell.getContext())
                        }
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              "whitespace-normal break-all",
                              densityClass.cell,
                              end && "text-end tabular-nums",
                            )}
                          >
                            {content}
                          </TableCell>
                        )
                      })}
                    </TableRow>
                    {detailOpen && renderDetail ? (
                      <TableRow data-detail={row.id} className={detailClassName}>
                        <TableCell colSpan={visibleColumnCount} className="whitespace-normal bg-muted/30 p-3">
                          {renderDetail(row.original)}
                        </TableCell>
                      </TableRow>
                    ) : null}
                  </React.Fragment>
                )
              })
            )}
          </TableBody>
          {!loading && !error && leafIds.length > 0 ? (
            <TableFooter className={cn("sticky bottom-0 z-10 bg-muted", footerClassName)} data-total="grand">
              <TableRow>
                {table.getVisibleLeafColumns().map((column) => {
                  const end = alignsEnd(column, align)
                  const aggregate = hasAggregate(column)
                  const showLabel = column.id !== SELECT_ID && !aggregate && column.id === firstDataColumnId
                  const footerRows = terminalRows(table.getPreGroupedRowModel().rows)
                  return (
                    <TableCell
                      key={column.id}
                      className={cn("whitespace-normal", densityClass.cell, end && "text-end tabular-nums")}
                    >
                      {showLabel ? labels.grandTotal : null}
                      {aggregate ? <FooterAggregate columnId={column.id} rows={footerRows} table={table} /> : null}
                    </TableCell>
                  )
                })}
              </TableRow>
            </TableFooter>
          ) : null}
        </Table>
      </div>

      {enablePagination ? (
        <div className="flex flex-wrap items-center justify-between gap-2" role="navigation" aria-label={labels.page}>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{labels.rowsPerPage}</span>
            <Select
              value={String(pagination.pageSize)}
              onValueChange={(value) => setPagination({ pageIndex: 0, pageSize: Number(value) })}
            >
              <SelectTrigger size="sm" aria-label={labels.rowsPerPage}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2">
            <p className="text-sm text-muted-foreground tabular-nums">
              {labels.page} {Math.min(pageIndex + 1, pageCount)} {labels.of} {pageCount}
            </p>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!table.getCanPreviousPage()}
              onClick={() => table.previousPage()}
            >
              {labels.previous}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={!table.getCanNextPage()}
              onClick={() => table.nextPage()}
            >
              {labels.next}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function FooterAggregate<T extends RowData>({
  columnId,
  rows,
  table,
}: {
  columnId: string
  rows: LegacyRow<T>[]
  table: ReturnType<typeof useLegacyTable<T>>
}) {
  const column = table.getColumn(columnId)
  const sample = rows[0]
  if (!column || !sample) return null
  const cell = sample.getAllCells().find((item) => item.column.id === columnId)
  if (!cell) return null
  return <>{renderAggregate(cell, rows)}</>
}

function SortMark<T extends RowData>({ header }: { header: LegacyHeader<T> }) {
  const sorted = header.column.getIsSorted()
  if (sorted === "asc") return <span aria-hidden className="text-muted-foreground">↑</span>
  if (sorted === "desc") return <span aria-hidden className="text-muted-foreground">↓</span>
  return null
}

function ColumnMenu<T extends RowData>({
  header,
  labels,
  order,
  onMove,
}: {
  header: LegacyHeader<T>
  labels: DataTableGroupingLabels
  order: readonly string[]
  onMove: (columnId: string, direction: -1 | 1) => void
}) {
  const label = headerText(header.column.columnDef.header, header.column.id)
  const index = order.indexOf(header.column.id)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-xs" aria-label={`${labels.columnMenu} ${label}`}>
          <Ellipsis />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuGroup>
          <DropdownMenuItem onSelect={() => header.column.toggleSorting(false)}>
            {labels.sortAscending}
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => header.column.toggleSorting(true)}>
            {labels.sortDescending}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!header.column.getIsSorted()} onSelect={() => header.column.clearSorting()}>
            {labels.clearSort}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem disabled={index <= 1} onSelect={() => onMove(header.column.id, -1)}>
            {labels.moveLeft}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={index < 0 || index >= order.length - 1} onSelect={() => onMove(header.column.id, 1)}>
            {labels.moveRight}
          </DropdownMenuItem>
          <DropdownMenuItem disabled={!header.column.getCanHide()} onSelect={() => header.column.toggleVisibility(false)}>
            {labels.hideColumn}
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function faceInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const letters = parts.slice(0, 2).map((part) => part[0] ?? "")
  return letters.join("").toUpperCase() || "?"
}

export function DataTableGroupingPeople({ names }: { names: readonly string[] }) {
  const shown = names.slice(0, 3)
  const extra = names.length - shown.length
  return (
    <AvatarGroup>
      {shown.map((name) => (
        <Avatar key={name} size="sm">
          <AvatarFallback>{faceInitials(name)}</AvatarFallback>
        </Avatar>
      ))}
      {extra > 0 ? <AvatarGroupCount>+{extra}</AvatarGroupCount> : null}
    </AvatarGroup>
  )
}

export function DataTableGroupingRing({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  const radius = 14
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference
  return (
    <span className="inline-flex items-center gap-2">
      <svg viewBox="0 0 36 36" className="size-8 text-primary" role="img" aria-label={label ?? `${clamped}%`}>
        <circle cx="18" cy="18" r={radius} fill="none" className="stroke-muted" strokeWidth="3" />
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={offset}
          transform="rotate(-90 18 18)"
          className="stroke-current transition-[stroke-dashoffset] duration-300 motion-reduce:transition-none"
        />
      </svg>
      <span className="tabular-nums">{clamped}%</span>
    </span>
  )
}

export function DataTableGroupingMeter({ value, label }: { value: number; label?: string }) {
  const clamped = Math.max(0, Math.min(100, Math.round(value)))
  return (
    <div className="flex min-w-28 items-center gap-2">
      <Progress value={clamped} aria-label={label ?? `${clamped}%`} className="w-16" />
      <span className="text-muted-foreground tabular-nums">{clamped}%</span>
    </div>
  )
}
