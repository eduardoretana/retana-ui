"use client"

import * as React from "react"
import { flexRender } from "@tanstack/react-table"
import {
  getCoreRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy"
import type { RowSelectionState, SortingState } from "@tanstack/react-table"
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Columns3,
  Download,
  Search,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
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
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { downloadCsv, toCsv, type CsvColumn } from "@/registry/retana/lib/csv"
import { EmptyState } from "@/registry/retana/ui/entity-form"

export type DataTableTab<T> = {
  id: string
  label: string
  predicate?: (row: T) => boolean
}

export type DataTableFilter<T> = {
  id: string
  label: string
  options: { value: string; label: string }[]
  predicate: (row: T, value: string) => boolean
}

export type DataTableBulkAction<T> = {
  id: string
  label: string
  destructive?: boolean
  onAction: (rows: T[]) => Promise<void> | void
}

export type AdminDataTableProps<T extends { id: string }> = {
  data: readonly T[]
  columns: LegacyColumnDef<T>[]
  tabs?: readonly DataTableTab<T>[]
  filters?: readonly DataTableFilter<T>[]
  searchText?: (row: T) => string
  searchPlaceholder?: string
  bulkActions?: readonly DataTableBulkAction<T>[]
  csvColumns?: readonly CsvColumn[]
  csvFilename?: string
  toCsvRow?: (row: T) => Record<string, unknown>
  renderDetail?: (row: T) => React.ReactNode
  detailTitle?: (row: T) => string
  className?: string
  emptyTitle?: string
}

export function AdminDataTable<T extends { id: string }>({
  data,
  columns,
  tabs,
  filters,
  searchText,
  searchPlaceholder = "Search",
  bulkActions,
  csvColumns,
  csvFilename = "export.csv",
  toCsvRow,
  renderDetail,
  detailTitle,
  className,
  emptyTitle = "No rows",
}: AdminDataTableProps<T>) {
  const [tab, setTab] = React.useState(tabs?.[0]?.id ?? "all")
  const [query, setQuery] = React.useState("")
  const [filterValues, setFilterValues] = React.useState<Record<string, string>>({})
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnVisibility, setColumnVisibility] = React.useState<Record<string, boolean>>({})
  const [rowSelection, setRowSelection] = React.useState<RowSelectionState>({})
  const [openId, setOpenId] = React.useState<string | null>(null)

  const searched = React.useMemo(() => {
    const q = query.trim().toLowerCase()
    return data.filter((row) => {
      if (q && searchText && !searchText(row).toLowerCase().includes(q)) return false
      for (const filter of filters ?? []) {
        const value = filterValues[filter.id]
        if (value && value !== "any" && !filter.predicate(row, value)) return false
      }
      return true
    })
  }, [data, filterValues, filters, query, searchText])

  const counts = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const item of tabs ?? []) {
      map.set(
        item.id,
        item.predicate ? searched.filter(item.predicate).length : searched.length,
      )
    }
    return map
  }, [searched, tabs])

  const rows = React.useMemo(() => {
    const current = tabs?.find((item) => item.id === tab)
    if (!current?.predicate) return searched
    return searched.filter(current.predicate)
  }, [searched, tab, tabs])

  const selectionColumn: LegacyColumnDef<T> = {
    id: "select",
    enableSorting: false,
    enableHiding: false,
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllRowsSelected()
            ? true
            : table.getIsSomeRowsSelected()
              ? "indeterminate"
              : false
        }
        onCheckedChange={(value) => table.toggleAllRowsSelected(value === true)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(value === true)}
        aria-label="Select row"
        onClick={(event) => event.stopPropagation()}
      />
    ),
  }

  const table = useLegacyTable({
    data: rows,
    columns: [selectionColumn, ...columns],
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getRowId: (row) => row.id,
    enableRowSelection: true,
  })

  const selected = table.getSelectedRowModel().rows.map((row) => row.original)
  const openIndex = rows.findIndex((row) => row.id === openId)
  const openRow = openIndex >= 0 ? rows[openIndex] : undefined

  function exportCsv(source: readonly T[]) {
    if (!csvColumns || !toCsvRow) return
    downloadCsv(csvFilename, toCsv(source.map(toCsvRow), csvColumns))
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-3">
        {tabs && tabs.length > 0 ? (
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="Views">
            {tabs.map((item) => (
              <Button
                key={item.id}
                type="button"
                size="sm"
                role="tab"
                variant={tab === item.id ? "secondary" : "ghost"}
                aria-selected={tab === item.id}
                onClick={() => {
                  setTab(item.id)
                  setRowSelection({})
                }}
              >
                {item.label}
                <Badge variant="outline" className="tabular-nums">
                  {counts.get(item.id) ?? 0}
                </Badge>
              </Button>
            ))}
          </div>
        ) : null}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-40 flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
              className="pl-8"
            />
          </div>
          {(filters ?? []).map((filter) => (
            <Select
              key={filter.id}
              value={filterValues[filter.id] ?? "any"}
              onValueChange={(value) =>
                setFilterValues((current) => ({ ...current, [filter.id]: value }))
              }
            >
              <SelectTrigger className="w-40" aria-label={filter.label}>
                <SelectValue placeholder={filter.label} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="any">{filter.label}</SelectItem>
                {filter.options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ))}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm">
                <Columns3 />
                Columns
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Columns</DropdownMenuLabel>
              {table
                .getAllLeafColumns()
                .filter((column) => column.getCanHide())
                .map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(value === true)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {csvColumns ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => exportCsv(selected.length ? selected : rows)}
            >
              <Download />
              CSV
            </Button>
          ) : null}
        </div>
        {selected.length > 0 && bulkActions && bulkActions.length > 0 ? (
          <div className="flex flex-wrap items-center gap-2 rounded-lg bg-muted px-3 py-2 text-sm">
            <span className="tabular-nums">{selected.length} selected</span>
            {bulkActions.map((action) => (
              <Button
                key={action.id}
                type="button"
                size="sm"
                variant={action.destructive ? "destructive" : "secondary"}
                onClick={() => void action.onAction(selected)}
              >
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="overflow-x-auto rounded-xl ring-1 ring-foreground/10">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const sorted = header.column.getIsSorted()
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder ? null : header.column.getCanSort() ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1"
                          onClick={header.column.getToggleSortingHandler()}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          {sorted === "asc" ? (
                            <ArrowUp className="size-3" />
                          ) : sorted === "desc" ? (
                            <ArrowDown className="size-3" />
                          ) : (
                            <ArrowUpDown className="size-3 opacity-40" />
                          )}
                        </button>
                      ) : (
                        flexRender(header.column.columnDef.header, header.getContext())
                      )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={table.getVisibleLeafColumns().length}>
                  <EmptyState title={emptyTitle} />
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={renderDetail ? "cursor-pointer" : undefined}
                  tabIndex={renderDetail ? 0 : undefined}
                  onClick={() => {
                    if (renderDetail) setOpenId(row.original.id)
                  }}
                  onKeyDown={(event) => {
                    if (!renderDetail) return
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      setOpenId(row.original.id)
                    }
                  }}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {renderDetail ? (
        <Sheet open={openRow != null} onOpenChange={(open) => !open && setOpenId(null)}>
          <SheetContent className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle>{openRow ? (detailTitle?.(openRow) ?? "Details") : "Details"}</SheetTitle>
              <SheetDescription className="sr-only">Row details</SheetDescription>
            </SheetHeader>
            <div className="flex items-center gap-2 px-4">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={openIndex <= 0}
                onClick={() => {
                  const prev = rows[openIndex - 1]
                  if (prev) setOpenId(prev.id)
                }}
              >
                Previous
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={openIndex < 0 || openIndex >= rows.length - 1}
                onClick={() => {
                  const next = rows[openIndex + 1]
                  if (next) setOpenId(next.id)
                }}
              >
                Next
              </Button>
            </div>
            <div className="px-4 pb-6">{openRow ? renderDetail(openRow) : null}</div>
          </SheetContent>
        </Sheet>
      ) : null}
    </div>
  )
}
