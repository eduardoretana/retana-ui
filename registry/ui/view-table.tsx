"use client"

import * as React from "react"
import {
  createColumnHelper,
  tableFeatures,
  useTable,
  columnVisibilityFeature,
  rowSelectionFeature,
} from "@tanstack/react-table"
import { ArrowDown, ArrowUp, ChevronsUpDown, MoreHorizontal, SlidersHorizontal } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  fieldById,
  recordTitle,
  type FieldDef,
  type MultiRecord,
  type SortClause,
  type ViewConfig,
} from "@/registry/retana/lib/multi-view"
import { FieldDisplay, FieldIcon } from "@/registry/retana/ui/multi-view-fields"

const features = tableFeatures({
  rowSelectionFeature,
  columnVisibilityFeature,
})

type Row = MultiRecord
const helper = createColumnHelper<typeof features, Row>()

export type ViewTableProps = {
  records: readonly MultiRecord[]
  fields: readonly FieldDef[]
  config?: ViewConfig
  locale?: string
  sort?: SortClause | null
  onSortChange?: (sort: SortClause | null) => void
  selectedIds?: readonly string[]
  onSelectedIdsChange?: (ids: string[]) => void
  onOpen?: (id: string) => void
  onDelete?: (ids: readonly string[]) => Promise<void> | void
  emptyLabel?: string
  openLabel?: string
  columnsLabel?: string
  className?: string
  toolbarClassName?: string
  tableClassName?: string
  rowClassName?: string
  headerClassName?: string
}

export function ViewTable({
  records,
  fields,
  config,
  locale,
  sort = null,
  onSortChange,
  selectedIds,
  onSelectedIdsChange,
  onOpen,
  onDelete,
  emptyLabel = "No records",
  openLabel = "Open",
  columnsLabel = "Columns",
  className,
  toolbarClassName,
  tableClassName,
  rowClassName,
  headerClassName,
}: ViewTableProps) {
  const [innerSelected, setInnerSelected] = React.useState<string[]>([])
  const selected = selectedIds ?? innerSelected
  const setSelected = React.useCallback(
    (ids: string[]) => {
      if (selectedIds === undefined) setInnerSelected(ids)
      onSelectedIdsChange?.(ids)
    },
    [onSelectedIdsChange, selectedIds],
  )

  const titleId = config?.titleField
  const columnFields = React.useMemo(() => {
    const ids = config?.columns
    const list = ids?.length
      ? ids.flatMap((id) => {
          const field = fieldById(fields, id)
          return field ? [field] : []
        })
      : [...fields]
    return list
  }, [config?.columns, fields])

  const data = React.useMemo(() => records as Row[], [records])

  const rowSelection = React.useMemo(() => {
    const next: Record<string, true> = {}
    for (const id of selected) next[id] = true
    return next
  }, [selected])

  const columns = React.useMemo(
    () =>
      helper.columns([
        helper.display({
          id: "select",
          enableHiding: false,
          header: ({ table }) => (
            <Checkbox
              aria-label="Select all"
              checked={
                table.getIsAllRowsSelected()
                  ? true
                  : table.getIsSomeRowsSelected()
                    ? "indeterminate"
                    : false
              }
              onCheckedChange={(value) => table.toggleAllRowsSelected(value === true)}
            />
          ),
          cell: ({ row }) => (
            <Checkbox
              aria-label={`Select ${recordTitle(row.original, fields, titleId)}`}
              checked={row.getIsSelected()}
              onCheckedChange={(value) => row.toggleSelected(value === true)}
            />
          ),
        }),
        ...columnFields.map((field) =>
          helper.display({
            id: field.id,
            header: () => field.label,
            cell: ({ row }) => (
              <FieldCell
                field={field}
                record={row.original}
                locale={locale}
                title={field.id === (titleId ?? columnFields.find((item) => item.type === "text")?.id)}
                openLabel={openLabel}
                onOpen={onOpen}
              />
            ),
          }),
        ),
        helper.display({
          id: "actions",
          enableHiding: false,
          header: () => <span className="sr-only">Actions</span>,
          cell: ({ row }) => (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-7"
                  aria-label={`Actions for ${recordTitle(row.original, fields, titleId)}`}
                >
                  <MoreHorizontal className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onSelect={() => onOpen?.(row.original.id)}>{openLabel}</DropdownMenuItem>
                {onDelete ? (
                  <DropdownMenuItem onSelect={() => void onDelete([row.original.id])}>Delete</DropdownMenuItem>
                ) : null}
              </DropdownMenuContent>
            </DropdownMenu>
          ),
        }),
      ]),
    [columnFields, fields, locale, onDelete, onOpen, openLabel, titleId],
  )

  const table = useTable({
    features,
    data,
    columns,
    getRowId: (row) => row.id,
    state: { rowSelection },
    onRowSelectionChange: (updater) => {
      const next = typeof updater === "function" ? updater(rowSelection) : updater
      setSelected(Object.keys(next).filter((id) => next[id] === true))
    },
  })

  const titleField = titleId ?? columnFields.find((field) => field.type === "text")?.id

  return (
    <div className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className={cn("flex justify-end", toolbarClassName)}>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" size="sm">
              <SlidersHorizontal className="size-3.5" />
              {columnsLabel}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table.getAllLeafColumns().map((column) =>
              column.getCanHide() ? (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(value === true)}
                >
                  {fieldById(fields, column.id)?.label ?? column.id}
                </DropdownMenuCheckboxItem>
              ) : null,
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="min-w-0 overflow-auto">
        <Table className={tableClassName}>
          <TableHeader className={headerClassName}>
            {table.getHeaderGroups().map((group) => (
              <TableRow key={group.id}>
                {group.headers.map((header) => {
                  const field = fieldById(fields, header.column.id)
                  const sortable = Boolean(field && onSortChange)
                  const active = sort?.field === header.column.id
                  return (
                    <TableHead key={header.id} aria-sort={ariaSort(active ? sort : null, header.column.id)}>
                      {header.isPlaceholder ? null : field && sortable ? (
                        <button
                          type="button"
                          className="inline-flex items-center gap-1 rounded-sm text-left font-medium focus-visible:ring-2 focus-visible:ring-ring"
                          onClick={() => onSortChange?.(nextSort(sort, field.id))}
                        >
                          <FieldIcon name={field.icon} className="size-3.5 text-muted-foreground" />
                          <span>{field.label}</span>
                          {active && sort?.direction === "asc" ? (
                            <ArrowUp className="size-3.5" aria-hidden />
                          ) : active && sort?.direction === "desc" ? (
                            <ArrowDown className="size-3.5" aria-hidden />
                          ) : (
                            <ChevronsUpDown className="size-3.5 text-muted-foreground" aria-hidden />
                          )}
                        </button>
                      ) : (
                        <table.FlexRender header={header} />
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
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-24 text-center text-muted-foreground">
                  {emptyLabel}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} data-state={row.getIsSelected() ? "selected" : undefined} className={rowClassName}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="max-w-64">
                      {cell.column.id === titleField || cell.column.id === "select" || cell.column.id === "actions" ? (
                        <table.FlexRender cell={cell} />
                      ) : (
                        <table.FlexRender cell={cell} />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function ariaSort(sort: SortClause | null, id: string): "ascending" | "descending" | "none" | undefined {
  if (!sort || sort.field !== id) return undefined
  return sort.direction === "asc" ? "ascending" : "descending"
}

function nextSort(sort: SortClause | null, field: string): SortClause | null {
  if (sort?.field !== field) return { field, direction: "asc" }
  if (sort.direction === "asc") return { field, direction: "desc" }
  return null
}

function FieldCell({
  field,
  record,
  locale,
  title,
  openLabel,
  onOpen,
}: {
  field: FieldDef
  record: MultiRecord
  locale?: string
  title: boolean
  openLabel: string
  onOpen?: (id: string) => void
}) {
  if (!title) return <FieldDisplay field={field} value={record[field.id]} locale={locale} />
  const label = recordTitle(record, [field], field.id)
  return (
    <span className="group flex min-w-0 items-center gap-2">
      <span className="grid size-6 shrink-0 place-items-center rounded-md bg-muted text-[10px] font-medium">
        {label.slice(0, 1).toUpperCase()}
      </span>
      <button
        type="button"
        className="min-w-0 truncate rounded-sm text-left font-medium focus-visible:ring-2 focus-visible:ring-ring"
        dir="auto"
        onClick={() => onOpen?.(record.id)}
      >
        {label}
      </button>
      <span className="text-xs text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 motion-reduce:transition-none">
        {openLabel}
      </span>
    </span>
  )
}
