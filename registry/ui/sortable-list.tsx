"use client"

import * as React from "react"
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  ArrowDown,
  ArrowDownToLine,
  ArrowUp,
  ArrowUpToLine,
  GripVertical,
  Pencil,
} from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { destinationIndex } from "@/registry/retana/lib/reorder"
import { useOptimisticList } from "@/registry/retana/hooks/use-optimistic-list"
import { EmptyState } from "@/registry/retana/ui/entity-form"

export type SortableListItem = {
  id: string
  title: string
  meta?: string
  thumbnailUrl?: string | null
  thumbnailAlt?: string
}

export type SortableListProps = {
  items: readonly SortableListItem[]
  onReorder: (ids: readonly string[]) => Promise<void> | void
  onEdit?: (id: string) => void
  /** Visible subset. Hidden ids keep their places when this list is reordered. */
  visibleIds?: readonly string[]
  label?: string
  editLabel?: string
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  savedMessage?: string
  errorMessage?: string
}

function isVideo(url: string) {
  return /\.(mp4|webm|mov)($|\?)/i.test(url)
}

export function SortableList({
  items,
  onReorder,
  onEdit,
  visibleIds,
  label = "rows",
  editLabel = "Edit",
  emptyTitle = "Nothing here",
  emptyDescription = "Add an item to start.",
  className,
  savedMessage = "Order saved",
  errorMessage = "Could not save the order",
}: SortableListProps) {
  const notify = React.useMemo(
    () => ({
      success: (message: string) => toast.success(message),
      error: (message: string) => toast.error(message),
    }),
    [],
  )
  const list = useOptimisticList({
    items,
    onReorder,
    notify,
    savedMessage,
    errorMessage,
  })
  const shown = visibleIds
    ? list.items.filter((item) => visibleIds.includes(item.id))
    : list.items
  const shownIds = shown.map((item) => item.id)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function place(id: string | number) {
    return shownIds.indexOf(String(id)) + 1
  }

  function onDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return
    list.moveVisible(shownIds, String(event.active.id), String(event.over.id))
  }

  function move(id: string, target: "up" | "down" | "top" | "bottom") {
    const index = shownIds.indexOf(id)
    if (index < 0) return
    const to = destinationIndex(index, shownIds.length, target)
    const overId = shownIds[to]
    if (!overId) return
    list.moveVisible(shownIds, id, overId)
  }

  if (shown.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} className={className} />
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={onDragEnd}
      accessibility={{
        screenReaderInstructions: {
          draggable:
            "To reorder, press Space. Use the arrow keys to move, Space to drop, Escape to cancel.",
        },
        announcements: {
          onDragStart: ({ active }) =>
            `Picked up, place ${place(active.id)} of ${shownIds.length} ${label}.`,
          onDragOver: ({ over }) => (over ? `Over place ${place(over.id)}.` : "Not over a place."),
          onDragEnd: ({ over }) => (over ? `Dropped at place ${place(over.id)}.` : "Dropped."),
          onDragCancel: () => "Cancelled.",
        },
      }}
    >
      <SortableContext items={shownIds} strategy={verticalListSortingStrategy}>
        <ol className={cn("flex flex-col gap-2", className)}>
          {shown.map((item) => (
            <SortableRow
              key={item.id}
              item={item}
              index={shownIds.indexOf(item.id)}
              count={shownIds.length}
              editLabel={editLabel}
              onEdit={onEdit}
              onMove={move}
            />
          ))}
        </ol>
      </SortableContext>
    </DndContext>
  )
}

function SortableRow({
  item,
  index,
  count,
  editLabel,
  onEdit,
  onMove,
}: {
  item: SortableListItem
  index: number
  count: number
  editLabel: string
  onEdit?: (id: string) => void
  onMove: (id: string, target: "up" | "down" | "top" | "bottom") => void
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id })
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-2 rounded-xl bg-card px-2 py-2 ring-1 ring-foreground/10",
        isDragging && "opacity-70",
      )}
    >
      <Button
        type="button"
        ref={setActivatorNodeRef}
        variant="ghost"
        size="icon-sm"
        className="cursor-grab touch-none active:cursor-grabbing motion-reduce:transition-none"
        aria-label={`Reorder ${item.title}`}
        {...attributes}
        {...listeners}
      >
        <GripVertical />
      </Button>
      <span className="w-6 text-center text-xs text-muted-foreground tabular-nums">{index + 1}</span>
      <Thumb url={item.thumbnailUrl} alt={item.thumbnailAlt ?? ""} />
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{item.title}</p>
        {item.meta ? <p className="truncate text-xs text-muted-foreground">{item.meta}</p> : null}
      </div>
      <div className="hidden items-center gap-0.5 sm:flex">
        <MoveButton label={`Move ${item.title} to the top`} disabled={index <= 0} onClick={() => onMove(item.id, "top")}>
          <ArrowUpToLine />
        </MoveButton>
        <MoveButton label={`Move ${item.title} up`} disabled={index <= 0} onClick={() => onMove(item.id, "up")}>
          <ArrowUp />
        </MoveButton>
        <MoveButton label={`Move ${item.title} down`} disabled={index >= count - 1} onClick={() => onMove(item.id, "down")}>
          <ArrowDown />
        </MoveButton>
        <MoveButton label={`Move ${item.title} to the bottom`} disabled={index >= count - 1} onClick={() => onMove(item.id, "bottom")}>
          <ArrowDownToLine />
        </MoveButton>
      </div>
      {onEdit ? (
        <Button type="button" variant="outline" size="sm" onClick={() => onEdit(item.id)}>
          <Pencil />
          {editLabel}
        </Button>
      ) : null}
    </li>
  )
}

function MoveButton({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button type="button" variant="ghost" size="icon-sm" aria-label={label} title={label} disabled={disabled} onClick={onClick}>
      {children}
    </Button>
  )
}

export function Thumb({ url, alt }: { url?: string | null; alt: string }) {
  if (!url) {
    return (
      <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted text-xs font-medium text-muted-foreground">
        {alt.slice(0, 1).toUpperCase() || "·"}
      </span>
    )
  }
  if (isVideo(url)) {
    return <video className="size-10 shrink-0 rounded-md bg-muted object-cover" src={url} muted playsInline />
  }
  // eslint-disable-next-line @next/next/no-img-element
  return <img className="size-10 shrink-0 rounded-md bg-muted object-cover" src={url} alt={alt} />
}
