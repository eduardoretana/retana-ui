"use client"

/**
 * Work table: TanStack Table for columns, visibility, and pagination;
 * dnd-kit for keyboard and pointer reordering. Clean-room behavior.
 * No Motion+. Host tokens only.
 */

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  horizontalListSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { flexRender } from "@tanstack/react-table"
import {
  getCoreRowModel,
  getPaginationRowModel,
  useLegacyTable,
  type LegacyColumnDef,
} from "@tanstack/react-table/legacy"
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  ChevronDown,
  ChevronRight,
  Columns3,
  GripVertical,
  MoreHorizontal,
  Rows3,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
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
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { usePrefersReducedMotion, useWorkTableLayout } from "@/registry/retana/hooks/use-work-table"
import {
  applyIdOrder,
  bareSortableId,
  changeDepth,
  columnSortableId,
  depthOf,
  groupRows,
  groupSortableId,
  moveInTree,
  moveSelection,
  moveToStatus,
  replaceWindow,
  rowSortableId,
  shiftSelection,
  sliceGroup,
  visibleTreeIds,
  workTableAnnouncements,
  WORK_DENSITIES,
  type StatusTone,
  type WorkColumnLayout,
  type WorkDensity,
  type WorkMove,
  type WorkShift,
  type WorkSortDir,
  type WorkSortKey,
} from "@/registry/retana/lib/work-table"
import { StatusPill } from "@/registry/retana/ui/status-pill"

export type WorkTablePerson = {
  id: string
  name: string
}

export type WorkTableLayoutApi = ReturnType<typeof useWorkTableLayout>

export type WorkColumn<T> = {
  id: string
  header: string
  cell: (row: T, index: number) => React.ReactNode
  align?: "start" | "end"
  locked?: boolean
}

export type WorkStatusOption = {
  id: string
  label: string
  tone?: StatusTone
}

export type WorkTableLabels = {
  table: string
  dragRow: string
  dragColumn: string
  order: string
  selectAll: string
  selectRow: string
  columns: string
  density: string
  densityCompact: string
  densityComfortable: string
  densitySpacious: string
  presets: string
  presetName: string
  savePreset: string
  restore: string
  reset: string
  moveUp: string
  moveDown: string
  moveStart: string
  moveEnd: string
  nest: string
  unnest: string
  remove: string
  bulk: string
  selected: string
  assign: string
  clear: string
  rowsPerPage: string
  previous: string
  next: string
  page: string
  emptyTitle: string
  emptyDescription: string
  loading: string
  errorTitle: string
  retry: string
  showMore: (count: number) => string
  showLess: string
  reordered: string
  undo: string
  removed: string
  assigned: string
  pickedUp: string
  of: string
  over: string
  notOver: string
  dropped: string
  cancelled: string
  instructions: string
  points: string
  collapseGroup: string
  expandGroup: string
}

export const defaultWorkTableLabels: WorkTableLabels = {
  table: "Tabla de trabajo",
  dragRow: "Reordenar fila",
  dragColumn: "Reordenar columna",
  order: "Orden",
  selectAll: "Seleccionar todas",
  selectRow: "Seleccionar fila",
  columns: "Columnas",
  density: "Densidad",
  densityCompact: "Compacta",
  densityComfortable: "Cómoda",
  densitySpacious: "Amplia",
  presets: "Diseños",
  presetName: "Nombre del diseño",
  savePreset: "Guardar diseño",
  restore: "Restaurar",
  reset: "Restablecer",
  moveUp: "Mover arriba",
  moveDown: "Mover abajo",
  moveStart: "Mover al inicio",
  moveEnd: "Mover al final",
  nest: "Anidar bajo la anterior",
  unnest: "Subir un nivel",
  remove: "Eliminar",
  bulk: "Acciones en bloque",
  selected: "seleccionadas",
  assign: "Asignar",
  clear: "Limpiar",
  rowsPerPage: "Filas por página",
  previous: "Anterior",
  next: "Siguiente",
  page: "Página",
  emptyTitle: "Sin filas",
  emptyDescription: "Nada coincide con esta vista.",
  loading: "Cargando",
  errorTitle: "No se pudo cargar",
  retry: "Reintentar",
  showMore: (count) => `Mostrar ${count} más`,
  showLess: "Mostrar menos",
  reordered: "Orden actualizado",
  undo: "Deshacer",
  removed: "Fila eliminada",
  assigned: "Asignación actualizada",
  pickedUp: "Tomada, posición",
  of: "de",
  over: "Sobre la posición",
  notOver: "Sin un destino.",
  dropped: "Soltada en la posición",
  cancelled: "Cancelado.",
  instructions: "Para reordenar, pulsa Espacio. Flechas para mover, Espacio para soltar, Escape para cancelar. En un árbol, izquierda y derecha cambian el nivel.",
  points: "pts",
  collapseGroup: "Contraer grupo",
  expandGroup: "Expandir grupo",
}

const DENSITY_CLASS: Record<WorkDensity, string> = {
  compact: "[&_td]:py-1",
  comfortable: "[&_td]:py-2",
  spacious: "[&_td]:py-3.5",
}

export type WorkTableProps<T extends { id: string }> = {
  rows: readonly T[]
  columns: readonly WorkColumn<T>[]
  getRowLabel?: (row: T) => string
  mode?: "flat" | "grouped" | "tree"
  statuses?: readonly WorkStatusOption[]
  getStatusId?: (row: T) => string | null | undefined
  setStatusId?: (row: T, statusId: string) => T
  getParentId?: (row: T) => string | null
  setParentId?: (row: T, parentId: string | null) => T
  getEffort?: (row: T) => number
  groupLimit?: number
  /** Opens every group and skips the per-group limit. */
  groupsExpanded?: boolean
  people?: readonly WorkTablePerson[]
  getAssigneeId?: (row: T) => string | null | undefined
  onReorder?: (ids: string[]) => void
  onMove?: (event: WorkMove<T>) => void
  onUpdate?: (id: string, patch: Partial<T>) => void
  onAssign?: (ids: readonly string[], personId: string | null) => void
  onRemove?: (id: string) => void
  summary?: (rows: readonly T[]) => React.ReactNode
  selectable?: boolean
  showOrder?: boolean
  paginate?: boolean
  pageSize?: number
  pageSizeOptions?: readonly number[]
  readOnly?: boolean
  state?: "ready" | "loading" | "error"
  errorMessage?: string
  onRetry?: () => void
  persistenceKey?: string
  layoutApi?: WorkTableLayoutApi
  labels?: Partial<WorkTableLabels>
  className?: string
  toolbarClassName?: string
  tableClassName?: string
  bulkClassName?: string
  paginationClassName?: string
}

export function WorkTable<T extends { id: string }>(props: WorkTableProps<T>) {
  const {
    rows,
    columns,
    getRowLabel,
    mode = "flat",
    selectable = true,
    showOrder = true,
    paginate = mode === "flat",
    pageSize = 10,
    pageSizeOptions = [5, 10, 20],
    readOnly = false,
    state = "ready",
    persistenceKey,
    layoutApi,
    labels: labelOverrides,
    className,
  } = props
  const labels = { ...defaultWorkTableLabels, ...labelOverrides }
  const reduced = usePrefersReducedMotion()
  const owned = useWorkTableLayout({
    columnIds: columns.map((column) => column.id),
    persistenceKey: layoutApi ? undefined : persistenceKey,
  })
  const layout = layoutApi ?? owned
  const [selected, setSelected] = React.useState<string[]>([])
  const [collapsed, setCollapsed] = React.useState<ReadonlySet<string>>(() => new Set())
  const [expandedGroups, setExpandedGroups] = React.useState<ReadonlySet<string>>(() => new Set())
  const [pagination, setPagination] = React.useState({ pageIndex: 0, pageSize })
  const [live, setLive] = React.useState("")
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [overId, setOverId] = React.useState<string | null>(null)
  const [dropDepth, setDropDepth] = React.useState(0)
  const dropDepthRef = React.useRef(0)
  const rowsRef = React.useRef(rows)
  React.useEffect(() => {
    rowsRef.current = rows
  }, [rows])
  const [presetName, setPresetName] = React.useState("")

  React.useEffect(() => {
    if (!activeId || mode !== "tree") return
    function onKey(event: KeyboardEvent) {
      if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
      event.preventDefault()
      event.stopPropagation()
      setDropDepth((current) => {
        const next = event.key === "ArrowRight" ? current + 1 : Math.max(0, current - 1)
        dropDepthRef.current = next
        return next
      })
      setLive(event.key === "ArrowRight" ? labels.nest : labels.unnest)
    }
    window.addEventListener("keydown", onKey, true)
    return () => window.removeEventListener("keydown", onKey, true)
  }, [activeId, labels.nest, labels.unnest, mode])

  const columnDefs = React.useMemo<LegacyColumnDef<T>[]>(() => {
    const dataColumns: LegacyColumnDef<T>[] = columns.map((column) => ({
      id: column.id,
      header: column.header,
      enableHiding: !column.locked,
      cell: ({ row }) => column.cell(row.original, rows.findIndex((item) => item.id === row.original.id)),
    }))
    const leading: LegacyColumnDef<T>[] = []
    if (selectable) {
      leading.push({
        id: "__select",
        enableHiding: false,
        header: () => (
          <Checkbox
            checked={rows.length > 0 && rows.every((row) => selected.includes(row.id)) ? true : selected.length > 0 ? "indeterminate" : false}
            onCheckedChange={(value) => setSelected(value === true ? rows.map((row) => row.id) : [])}
            aria-label={labels.selectAll}
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={selected.includes(row.original.id)}
            onCheckedChange={(value) => {
              setSelected((current) =>
                value === true ? [...current, row.original.id] : current.filter((id) => id !== row.original.id),
              )
            }}
            aria-label={`${labels.selectRow} ${getRowLabel?.(row.original) ?? row.original.id}`}
            onClick={(event) => event.stopPropagation()}
          />
        ),
      })
    }
    if (showOrder) {
      leading.push({
        id: "__grip",
        enableHiding: false,
        header: () => <span className="sr-only">{labels.order}</span>,
        cell: () => null,
      })
    }
    return [...leading, ...dataColumns]
  }, [columns, getRowLabel, labels.order, labels.selectAll, labels.selectRow, rows, selectable, selected, showOrder])

  const columnVisibility = React.useMemo(() => {
    const visibility: Record<string, boolean> = {}
    for (const column of columns) visibility[column.id] = !layout.layout.hidden.includes(column.id)
    return visibility
  }, [columns, layout.layout.hidden])

  const table = useLegacyTable({
    data: rows as T[],
    columns: columnDefs,
    state: {
      columnOrder: ["__select", "__grip", ...layout.layout.order].filter((id) => columnDefs.some((column) => column.id === id)),
      columnVisibility,
      pagination: paginate ? pagination : { pageIndex: 0, pageSize: Math.max(rows.length, 1) },
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getRowId: (row) => row.id,
  })

  const visibleColumnIds = layout.layout.order.filter((id) => !layout.layout.hidden.includes(id))
  const pageRows = table.getRowModel().rows
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const collision = React.useCallback<CollisionDetection>((args) => {
    const type = args.active.data.current?.type
    return closestCenter({
      ...args,
      droppableContainers: args.droppableContainers.filter((container) => {
        const other = container.data.current?.type
        if (type === "column") return other === "column"
        return other === "row" || other === "group"
      }),
    })
  }, [])

  function place(id: string | number) {
    const bare = bareSortableId(String(id))
    const index = rows.findIndex((row) => row.id === bare)
    if (index >= 0) return index + 1
    const columnIndex = visibleColumnIds.indexOf(bare)
    return columnIndex >= 0 ? columnIndex + 1 : 1
  }

  const announcements = workTableAnnouncements(labels, place, Math.max(rows.length, visibleColumnIds.length))

  function emit(next: readonly T[], move: Omit<WorkMove<T>, "rows"> | null, message = labels.reordered) {
    const previous = rowsRef.current.map((row) => ({ ...row }))
    const previousIds = previous.map((row) => row.id)
    const nextRows = next.map((row) => ({ ...row }))
    if (move && props.onMove) props.onMove({ ...move, rows: nextRows })
    props.onReorder?.(nextRows.map((row) => row.id))
    const position = move?.toIndex != null ? move.toIndex + 1 : undefined
    setLive(position ? `${labels.dropped} ${position}.` : message)
    toast(message, {
      action: {
        label: labels.undo,
        onClick: () => {
          if (move && props.onMove) props.onMove({ ...move, rows: previous, toStatusId: undefined, parentId: undefined })
          props.onReorder?.(previousIds)
          setLive(labels.undo)
        },
      },
    })
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
    dropDepthRef.current = 0
    setDropDepth(0)
    setLive(announcements.onDragStart({ active: event.active }))
  }

  function onDragOver(event: DragOverEvent) {
    const type = event.active.data.current?.type
    if (type === "column" && event.over?.data.current?.type === "column") {
      layout.reorderColumns(bareSortableId(String(event.active.id)), bareSortableId(String(event.over.id)))
    }
    setOverId(event.over ? String(event.over.id) : null)
    if (event.over) setLive(announcements.onDragOver({ over: event.over }))
  }

  function onDragMove(event: DragMoveEvent) {
    if (mode !== "tree") return
    const next = Math.max(0, Math.round(event.delta.x / 24))
    dropDepthRef.current = next
    setDropDepth(next)
  }

  function onDragEnd(event: DragEndEvent) {
    const type = event.active.data.current?.type
    const active = bareSortableId(String(event.active.id))
    const over = event.over ? bareSortableId(String(event.over.id)) : null
    const overType = event.over?.data.current?.type
    setActiveId(null)
    setOverId(null)
    if (readOnly || state !== "ready") return
    if (type === "column") {
      setLive(event.over ? announcements.onDragEnd({ over: event.over }) : labels.cancelled)
      return
    }
    if (type !== "row" || !over) {
      setLive(labels.cancelled)
      return
    }
    const moving = selected.includes(active) ? rows.map((row) => row.id).filter((id) => selected.includes(id)) : [active]
    if (mode === "grouped" && props.getStatusId && props.setStatusId) {
      const toStatusId = overType === "group" ? String(event.over?.data.current?.statusId ?? over) : props.getStatusId(rows.find((row) => row.id === over) as T)
      if (!toStatusId) return
      const next = moveToStatus(rows, moving, toStatusId, overType === "row" ? over : null, props.getStatusId, props.setStatusId)
      emit(next, { ids: moving, toIndex: next.findIndex((row) => row.id === active), toStatusId })
      return
    }
    if (mode === "tree" && props.getParentId && props.setParentId && overType === "row") {
      const next = moveInTree(rows, active, over, dropDepthRef.current, props.setParentId, props.getParentId)
      const moved = next.find((row) => row.id === active)
      const parentId = moved ? props.getParentId(moved) : null
      emit(next, { ids: [active], toIndex: next.findIndex((row) => row.id === active), parentId, depth: depthOf(next, active, props.getParentId) })
      return
    }
    const pageIds = pageRows.map((row) => row.id)
    const windowIds = pageIds.includes(active) && pageIds.includes(over) ? pageIds : rows.map((row) => row.id)
    const nextWindow = moveSelection(windowIds, active, over, moving)
    const nextIds = replaceWindow(rows.map((row) => row.id), windowIds, nextWindow)
    emit(applyIdOrder(rows, nextIds), { ids: moving, toIndex: nextIds.indexOf(active) })
  }

  function onDragCancel() {
    setActiveId(null)
    setOverId(null)
    setLive(labels.cancelled)
  }

  function shift(ids: readonly string[], direction: WorkShift) {
    const nextIds = shiftSelection(rows.map((row) => row.id), ids, direction)
    emit(applyIdOrder(rows, nextIds), { ids: [...ids], toIndex: nextIds.indexOf(ids[0] ?? "") })
  }

  function changeRowDepth(id: string, delta: number) {
    if (!props.setParentId || !props.getParentId) return
    const next = changeDepth(rows, id, delta, props.setParentId, props.getParentId)
    const moved = next.find((row) => row.id === id)
    const parentId = moved ? props.getParentId(moved) : null
    emit(next, { ids: [id], toIndex: next.findIndex((row) => row.id === id), parentId, depth: depthOf(next, id, props.getParentId) })
  }

  function assign(personId: string | null) {
    if (!props.onAssign || selected.length === 0) return
    const previous = selected.map((id) => ({
      id,
      personId: props.getAssigneeId?.(rows.find((row) => row.id === id) as T) ?? null,
    }))
    props.onAssign(selected, personId)
    setLive(labels.assigned)
    toast(labels.assigned, {
      action: {
        label: labels.undo,
        onClick: () => {
          const groups = new Map<string, string[]>()
          for (const item of previous) {
            const key = item.personId ?? ""
            groups.set(key, [...(groups.get(key) ?? []), item.id])
          }
          for (const [key, ids] of groups) props.onAssign?.(ids, key || null)
        },
      },
    })
  }

  const groups = mode === "grouped" && props.statuses && props.getStatusId
    ? groupRows(pageRows.map((row) => row.original), props.statuses, props.getStatusId, props.getEffort)
    : []
  const treeIds = mode === "tree" && props.getParentId
    ? visibleTreeIds(rows, [...collapsed], props.getParentId)
    : []
  const colSpan = table.getVisibleLeafColumns().length + 1
  const activeLabel = activeId
    ? props.getRowLabel?.(rows.find((row) => row.id === bareSortableId(activeId)) as T) ?? bareSortableId(activeId)
    : ""
  const movingCount = activeId && selected.includes(bareSortableId(activeId)) ? selected.length : activeId ? 1 : 0

  return (
    <TooltipProvider>
      <div
        data-slot="work-table"
        data-mode={mode}
        data-motion={reduced ? "reduce" : "full"}
        data-density={layout.layout.density}
        className={cn("flex flex-col gap-3", className)}
      >
        <div className={cn("flex flex-wrap items-center gap-2", props.toolbarClassName)}>
          <ColumnMenu columns={columns} hidden={layout.layout.hidden} labels={labels} onToggle={(id) => layout.hideColumn(id, columns.filter((column) => column.locked).map((column) => column.id))} />
          <DensityMenu density={layout.layout.density} labels={labels} onChange={layout.setDensity} />
          <PresetMenu
            labels={labels}
            name={presetName}
            onName={setPresetName}
            presets={layout.presets}
            onSave={() => {
              layout.rememberPreset(presetName || labels.presets)
              setPresetName("")
            }}
            onRestore={() => layout.restorePreset()}
            onReset={layout.resetLayout}
          />
        </div>

        {selected.length > 0 ? (
          <div data-slot="work-bulk" role="region" aria-label={labels.bulk} className={cn("flex flex-wrap items-center gap-2 rounded-lg bg-muted px-2 py-1.5", props.bulkClassName)}>
            <span className="px-1 text-sm tabular-nums">{selected.length} {labels.selected}</span>
            <Button type="button" size="sm" variant="outline" onClick={() => shift(selected, "up")}><ArrowUp />{labels.moveUp}</Button>
            <Button type="button" size="sm" variant="outline" onClick={() => shift(selected, "down")}><ArrowDown />{labels.moveDown}</Button>
            {props.people && props.people.length > 0 && props.onAssign ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button type="button" size="sm" variant="outline">{labels.assign}</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  {props.people.map((person) => (
                    <DropdownMenuItem key={person.id} onSelect={() => assign(person.id)}>{person.name}</DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
            <Button type="button" size="sm" variant="ghost" onClick={() => setSelected([])}>{labels.clear}</Button>
          </div>
        ) : null}

        <DndContext
          sensors={readOnly || state !== "ready" ? [] : sensors}
          collisionDetection={collision}
          onDragStart={onDragStart}
          onDragOver={onDragOver}
          onDragMove={onDragMove}
          onDragEnd={onDragEnd}
          onDragCancel={onDragCancel}
          accessibility={{
            screenReaderInstructions: { draggable: labels.instructions },
            announcements,
          }}
        >
          <div className="overflow-hidden rounded-xl bg-card ring-1 ring-foreground/10">
            <Table className={cn(DENSITY_CLASS[layout.layout.density], "motion-reduce:transition-none", props.tableClassName)} aria-label={labels.table}>
              <TableHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    <SortableContext items={visibleColumnIds.map(columnSortableId)} strategy={horizontalListSortingStrategy}>
                      {group.headers.map((header) => (
                        <HeaderCell key={header.id} header={header} labels={labels} reduced={reduced} order={visibleColumnIds.indexOf(header.column.id) + 1} />
                      ))}
                    </SortableContext>
                    <TableHead className="w-10"><span className="sr-only">{labels.remove}</span></TableHead>
                  </TableRow>
                ))}
              </TableHeader>
              {state === "loading" ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={colSpan}>
                      <span className="sr-only">{labels.loading}</span>
                      <div className="flex flex-col gap-2 py-2" aria-hidden>
                        {Array.from({ length: 4 }, (_, index) => (
                          <Skeleton key={index} className="h-6 w-full motion-reduce:animate-none" />
                        ))}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : state === "error" ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={colSpan}>
                      <div role="alert" className="flex flex-col items-center gap-2 py-8 text-center">
                        <p className="text-sm font-medium">{labels.errorTitle}</p>
                        {props.errorMessage ? <p className="text-sm text-muted-foreground">{props.errorMessage}</p> : null}
                        {props.onRetry ? <Button type="button" size="sm" variant="outline" onClick={props.onRetry}>{labels.retry}</Button> : null}
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : rows.length === 0 ? (
                <TableBody>
                  <TableRow>
                    <TableCell colSpan={colSpan}>
                      <div role="status" className="flex flex-col items-center gap-1 py-10 text-center">
                        <p className="text-sm font-medium">{labels.emptyTitle}</p>
                        <p className="text-sm text-muted-foreground">{labels.emptyDescription}</p>
                      </div>
                    </TableCell>
                  </TableRow>
                </TableBody>
              ) : mode === "grouped" ? (
                groups.map((group) => (
                  <GroupBody key={group.id} id={group.id}>
                    <TableRow>
                      <TableCell colSpan={colSpan} className="bg-muted/60">
                        <div className="flex flex-wrap items-center gap-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="ghost"
                            aria-expanded={!collapsed.has(group.id)}
                            aria-label={`${collapsed.has(group.id) ? labels.expandGroup : labels.collapseGroup} ${group.label}`}
                            onClick={() => setCollapsed((current) => toggleSet(current, group.id))}
                          >
                            {collapsed.has(group.id) ? <ChevronRight /> : <ChevronDown />}
                            {group.tone ? <StatusPill label={group.label} tone={group.tone} /> : <span className="font-medium">{group.label}</span>}
                          </Button>
                          <span className="text-xs text-muted-foreground tabular-nums">{group.count}</span>
                          <span className="text-xs text-muted-foreground tabular-nums">{group.effort} {labels.points}</span>
                        </div>
                      </TableCell>
                    </TableRow>
                    {collapsed.has(group.id) && !props.groupsExpanded ? null : (
                      <GroupRows
                        rows={sliceGroup(group.rows, props.groupsExpanded ? Number.POSITIVE_INFINITY : props.groupLimit ?? 4, expandedGroups.has(group.id)).visible}
                        hidden={sliceGroup(group.rows, props.groupsExpanded ? Number.POSITIVE_INFINITY : props.groupLimit ?? 4, expandedGroups.has(group.id)).hidden}
                        tableRows={pageRows}
                        labels={labels}
                        reduced={reduced}
                        overId={overId}
                        dropDepth={dropDepth}
                        mode={mode}
                        readOnly={readOnly}
                        selected={selected}
                        getRowLabel={getRowLabel}
                        onShift={shift}
                        onDepth={changeRowDepth}
                        onRemove={props.onRemove}
                        colSpan={colSpan}
                        onToggleMore={() => setExpandedGroups((current) => toggleSet(current, group.id))}
                        total={group.rows.length}
                        limit={props.groupsExpanded ? Number.POSITIVE_INFINITY : props.groupLimit ?? 4}
                      />
                    )}
                  </GroupBody>
                ))
              ) : (
                <TableBody>
                  <SortableContext
                    items={(mode === "tree" ? pageRows.filter((row) => treeIds.includes(row.id)) : pageRows).map((row) => rowSortableId(row.id))}
                    strategy={verticalListSortingStrategy}
                  >
                    {(mode === "tree" ? pageRows.filter((row) => treeIds.includes(row.id)) : pageRows).map((row) => (
                      <DataRow
                        key={row.id}
                        row={row}
                        labels={labels}
                        reduced={reduced}
                        over={overId === rowSortableId(row.id)}
                        dropDepth={dropDepth}
                        mode={mode}
                        readOnly={readOnly}
                        depth={mode === "tree" && props.getParentId ? depthOf(rows, row.id, props.getParentId) : 0}
                        hasChildren={mode === "tree" && props.getParentId ? rows.some((item) => props.getParentId?.(item) === row.id) : false}
                        collapsed={collapsed.has(row.id)}
                        onToggle={() => setCollapsed((current) => toggleSet(current, row.id))}
                        rank={rows.findIndex((item) => item.id === row.id) + 1}
                        onShift={(direction) => shift([row.id], direction)}
                        onDepth={(delta) => changeRowDepth(row.id, delta)}
                        onRemove={props.onRemove ? () => props.onRemove?.(row.id) : undefined}
                        label={props.getRowLabel?.(row.original) ?? row.id}
                      />
                    ))}
                  </SortableContext>
                </TableBody>
              )}
              {mode === "tree" && props.summary && state === "ready" ? (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={colSpan}>{props.summary(rows)}</TableCell>
                  </TableRow>
                </TableFooter>
              ) : null}
            </Table>
          </div>
          <DragOverlay dropAnimation={reduced ? null : { duration: 160, easing: "ease-out" }}>
            {activeId && activeId.startsWith("row:") ? (
              <div className="rounded-md bg-popover px-3 py-2 text-sm text-popover-foreground shadow-md ring-1 ring-foreground/10">
                {activeLabel}
                {movingCount > 1 ? <span className="ms-2 text-muted-foreground tabular-nums">{movingCount}</span> : null}
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>

        {paginate && state === "ready" && rows.length > 0 ? (
          <div className={cn("flex flex-wrap items-center justify-between gap-2", props.paginationClassName)}>
            <label className="flex items-center gap-2 text-sm text-muted-foreground">
              {labels.rowsPerPage}
              <Select value={String(pagination.pageSize)} onValueChange={(value) => setPagination({ pageIndex: 0, pageSize: Number(value) })}>
                <SelectTrigger aria-label={labels.rowsPerPage} className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {pageSizeOptions.map((size) => (
                    <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground tabular-nums">
                {labels.page} {table.getState().pagination.pageIndex + 1} {labels.of} {table.getPageCount()}
              </span>
              <Button type="button" size="sm" variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>{labels.previous}</Button>
              <Button type="button" size="sm" variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>{labels.next}</Button>
            </div>
          </div>
        ) : null}

        <div className="sr-only" role="status" aria-live="polite" data-slot="work-table-live">{live}</div>
      </div>
    </TooltipProvider>
  )
}

function toggleSet(current: ReadonlySet<string>, id: string) {
  const next = new Set(current)
  if (next.has(id)) next.delete(id)
  else next.add(id)
  return next
}

function Tip({ label, children }: { label: string; children: React.ReactElement }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

function ColumnMenu<T>({
  columns,
  hidden,
  labels,
  onToggle,
}: {
  columns: readonly WorkColumn<T>[]
  hidden: readonly string[]
  labels: WorkTableLabels
  onToggle: (id: string) => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="sm" variant="outline"><Columns3 />{labels.columns}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>{labels.columns}</DropdownMenuLabel>
        {columns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={!hidden.includes(column.id)}
            disabled={column.locked}
            onCheckedChange={() => onToggle(column.id)}
            onSelect={(event) => event.preventDefault()}
          >
            {column.header}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DensityMenu({ density, labels, onChange }: { density: WorkDensity; labels: WorkTableLabels; onChange: (density: WorkDensity) => void }) {
  const text = { compact: labels.densityCompact, comfortable: labels.densityComfortable, spacious: labels.densitySpacious }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="sm" variant="outline"><Rows3 />{labels.density}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuRadioGroup value={density} onValueChange={(value) => onChange(value as WorkDensity)}>
          {WORK_DENSITIES.map((item) => (
            <DropdownMenuRadioItem key={item} value={item}>{text[item]}</DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function PresetMenu({
  labels,
  name,
  onName,
  presets,
  onSave,
  onRestore,
  onReset,
}: {
  labels: WorkTableLabels
  name: string
  onName: (value: string) => void
  presets: readonly { id: string; name: string }[]
  onSave: () => void
  onRestore: () => void
  onReset: () => void
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" size="sm" variant="outline">{labels.presets}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56">
        <DropdownMenuLabel>{labels.presets}</DropdownMenuLabel>
        <div className="flex gap-1 px-1 py-1">
          <Input aria-label={labels.presetName} value={name} placeholder={labels.presetName} onChange={(event) => onName(event.target.value)} onKeyDown={(event) => event.stopPropagation()} />
        </div>
        <DropdownMenuItem onSelect={onSave}>{labels.savePreset}</DropdownMenuItem>
        <DropdownMenuItem disabled={presets.length === 0} onSelect={onRestore}>{labels.restore}</DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onReset}>{labels.reset}</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function HeaderCell({
  header,
  labels,
  reduced,
  order,
}: {
  // TanStack's header context is invariant across the legacy table generics.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  header: any
  labels: WorkTableLabels
  reduced: boolean
  order: number
}) {
  if (header.column.id === "__select" || header.column.id === "__grip") {
    return <TableHead>{header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}</TableHead>
  }
  return <SortableHeader header={header} labels={labels} reduced={reduced} order={order} />
}

function SortableHeader({
  header,
  labels,
  reduced,
  order,
}: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  header: any
  labels: WorkTableLabels
  reduced: boolean
  order: number
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: columnSortableId(header.column.id),
    data: { type: "column" },
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: reduced ? "none" : transition,
  }
  return (
    <TableHead ref={setNodeRef} style={style} data-order={order} className={isDragging ? "opacity-70" : undefined}>
      <span className="inline-flex items-center gap-1">
        <Tip label={labels.dragColumn}>
          <button
            type="button"
            ref={setActivatorNodeRef}
            className="inline-flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing motion-reduce:transition-none"
            aria-label={`${labels.dragColumn} ${String(header.column.columnDef.header ?? header.column.id)}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-3.5" />
          </button>
        </Tip>
        <span className="w-4 text-xs text-muted-foreground tabular-nums" aria-hidden>{order}</span>
        {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
      </span>
    </TableHead>
  )
}

function GroupBody({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: groupSortableId(id), data: { type: "group", statusId: id } })
  return (
    <TableBody ref={setNodeRef} data-group={id} data-over={isOver ? "" : undefined}>
      {children}
    </TableBody>
  )
}

function GroupRows<T extends { id: string }>({
  rows,
  hidden,
  tableRows,
  labels,
  reduced,
  overId,
  dropDepth,
  mode,
  readOnly,
  selected,
  getRowLabel,
  onShift,
  onDepth,
  onRemove,
  colSpan,
  onToggleMore,
  total,
  limit,
}: {
  rows: readonly T[]
  hidden: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tableRows: any[]
  labels: WorkTableLabels
  reduced: boolean
  overId: string | null
  dropDepth: number
  mode: "flat" | "grouped" | "tree"
  readOnly: boolean
  selected: readonly string[]
  getRowLabel?: (row: T) => string
  onShift: (ids: readonly string[], direction: WorkShift) => void
  onDepth: (id: string, delta: number) => void
  onRemove?: (id: string) => void
  colSpan: number
  onToggleMore: () => void
  total: number
  limit: number
}) {
  const byId = new Map(tableRows.map((row) => [row.id, row]))
  return (
    <SortableContext items={rows.map((row) => rowSortableId(row.id))} strategy={verticalListSortingStrategy}>
      {rows.map((item) => {
        const tableRow = byId.get(item.id)
        if (!tableRow) return null
        return (
          <DataRow
            key={item.id}
            row={tableRow}
            labels={labels}
            reduced={reduced}
            over={overId === rowSortableId(item.id)}
            dropDepth={dropDepth}
            mode={mode}
            readOnly={readOnly}
            depth={0}
            hasChildren={false}
            collapsed={false}
            rank={0}
            label={getRowLabel?.(item) ?? item.id}
            onShift={(direction) => onShift(selected.includes(item.id) ? selected : [item.id], direction)}
            onDepth={(delta) => onDepth(item.id, delta)}
            onRemove={onRemove ? () => onRemove(item.id) : undefined}
          />
        )
      })}
      {total > limit ? (
        <TableRow>
          <TableCell colSpan={colSpan}>
            <Button type="button" size="sm" variant="ghost" onClick={onToggleMore}>
              {hidden > 0 ? labels.showMore(hidden) : labels.showLess}
            </Button>
          </TableCell>
        </TableRow>
      ) : null}
    </SortableContext>
  )
}

type RenderRow<T> = {
  id: string
  original: T
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getVisibleCells: () => any[]
}

function DataRow<T extends { id: string }>({
  row,
  labels,
  reduced,
  over,
  dropDepth,
  mode,
  readOnly,
  depth,
  hasChildren,
  collapsed,
  onToggle,
  rank,
  onShift,
  onDepth,
  onRemove,
  label,
}: {
  row: RenderRow<T>
  labels: WorkTableLabels
  reduced: boolean
  over: boolean
  dropDepth: number
  mode: "flat" | "grouped" | "tree"
  readOnly: boolean
  depth: number
  hasChildren: boolean
  collapsed: boolean
  onToggle?: () => void
  rank: number
  onShift: (direction: WorkShift) => void
  onDepth: (delta: number) => void
  onRemove?: () => void
  label: string
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({
    id: rowSortableId(row.id),
    disabled: readOnly,
    data: { type: "row" },
  })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition: reduced ? "none" : transition,
  }
  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      data-row-id={row.id}
      data-dragging={isDragging ? "" : undefined}
      data-drop-indicator={over ? "" : undefined}
      data-depth={mode === "tree" ? depth : undefined}
      className={cn(isDragging && "opacity-60", over && "border-t-2 border-primary")}
    >
      {row.getVisibleCells().map((cell) => {
        if (cell.column.id === "__grip") {
          return (
            <TableCell key={cell.id} className="relative w-16">
              {over && mode === "tree" ? (
                <span data-slot="drop-depth" data-depth={dropDepth} className="absolute inset-x-0 top-0 h-0.5 bg-primary" style={{ marginInlineStart: dropDepth * 16 }} />
              ) : null}
              <span className="inline-flex items-center gap-1">
                <Tip label={labels.dragRow}>
                  <button
                    type="button"
                    ref={setActivatorNodeRef}
                    className="inline-flex size-6 cursor-grab items-center justify-center rounded-md text-muted-foreground hover:bg-muted active:cursor-grabbing motion-reduce:transition-none disabled:cursor-default"
                    aria-label={`${labels.dragRow} ${label}`}
                    disabled={readOnly}
                    {...(readOnly ? {} : attributes)}
                    {...(readOnly ? {} : listeners)}
                  >
                    <GripVertical className="size-3.5" />
                  </button>
                </Tip>
                <span className="w-4 text-xs text-muted-foreground tabular-nums">{rank || ""}</span>
              </span>
            </TableCell>
          )
        }
        return (
          <TableCell key={cell.id} className={cn(cell.column.id !== "__select" && "max-w-64")}>
            {cell.column.id === "__select" ? null : null}
            <span className="inline-flex min-w-0 items-center gap-1" style={cell.column.id !== "__select" && mode === "tree" && depth > 0 ? { paddingInlineStart: depth * 16 } : undefined}>
              {hasChildren && cell === row.getVisibleCells().find((item) => item.column.id !== "__select" && item.column.id !== "__grip") ? (
                <Button type="button" size="icon-xs" variant="ghost" aria-expanded={!collapsed} aria-label={collapsed ? labels.expandGroup : labels.collapseGroup} onClick={onToggle}>
                  {collapsed ? <ChevronRight /> : <ChevronDown />}
                </Button>
              ) : null}
              {flexRender(cell.column.columnDef.cell, cell.getContext())}
            </span>
          </TableCell>
        )
      })}
      <TableCell className="w-10">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="icon-sm" variant="ghost" aria-label={label}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onShift("up")}><ArrowUp />{labels.moveUp}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onShift("down")}><ArrowDown />{labels.moveDown}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onShift("start")}><ArrowUpToLine />{labels.moveStart}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onShift("end")}><ArrowDownToLine />{labels.moveEnd}</DropdownMenuItem>
            {mode === "tree" ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => onDepth(1)}>{labels.nest}</DropdownMenuItem>
                <DropdownMenuItem onSelect={() => onDepth(-1)}>{labels.unnest}</DropdownMenuItem>
              </>
            ) : null}
            {onRemove ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive" onSelect={onRemove}>{labels.remove}</DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  )
}

export {
  filterWorkRows,
  mergeRows,
  sortWorkRows,
  treeSummary,
  withSequentialRank,
} from "@/registry/retana/lib/work-table"
export { useWorkCollection, useWorkTableLayout } from "@/registry/retana/hooks/use-work-table"
export type { WorkColumnLayout, WorkMove, WorkSortDir, WorkSortKey }
