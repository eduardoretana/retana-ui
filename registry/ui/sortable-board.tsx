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
  rectSortingStrategy,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, LayoutGrid, List, Pencil, Search } from "lucide-react"
import { toast } from "sonner"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useOptimisticList } from "@/registry/retana/hooks/use-optimistic-list"
import { EmptyState } from "@/registry/retana/ui/entity-form"
import { Thumb } from "@/registry/retana/ui/sortable-list"

export type BoardItem = {
  id: string
  title: string
  categoryId: string | null
  categoryTitle?: string | null
  imageUrl?: string | null
  videoUrl?: string | null
  showOnHomepage: boolean
}

export type BoardCategory = {
  id: string
  title: string
}

function homepageKey(items: readonly { id: string; showOnHomepage: boolean }[]) {
  return items
    .map((item) => `${item.id}\0${item.showOnHomepage ? "1" : "0"}`)
    .sort()
    .join("\n")
}

function parseHomepageKey(key: string) {
  const map = new Map<string, boolean>()
  if (!key) return map
  for (const row of key.split("\n")) {
    const splitAt = row.indexOf("\0")
    if (splitAt < 0) continue
    map.set(row.slice(0, splitAt), row.slice(splitAt + 1) === "1")
  }
  return map
}

/** Drop overrides that no longer differ from the latest `showOnHomepage`. */
export function reconcileHomepageOverrides(
  overrides: Record<string, boolean>,
  previousKey: string,
  items: readonly { id: string; showOnHomepage: boolean }[],
) {
  const prior = parseHomepageKey(previousKey)
  const next: Record<string, boolean> = {}
  for (const item of items) {
    const override = overrides[item.id]
    if (override === undefined) continue
    const seen = prior.get(item.id)
    if (seen === undefined || seen !== item.showOnHomepage) continue
    if (override === item.showOnHomepage) continue
    next[item.id] = override
  }
  return next
}

export type SortableBoardProps = {
  items: readonly BoardItem[]
  categories: readonly BoardCategory[]
  onReorder: (ids: readonly string[]) => Promise<void> | void
  /** Cards stay put. Omitted, the board still drags. */
  readOnly?: boolean
  onToggleHomepage: (id: string, show: boolean) => Promise<void> | void
  onEdit?: (id: string) => void
  view?: "list" | "grid"
  onViewChange?: (view: "list" | "grid") => void
  query?: string
  onQueryChange?: (query: string) => void
  filter?: string
  onFilterChange?: (filter: string) => void
  addButton?: React.ReactNode
  className?: string
  homepageLabel?: string
  searchLabel?: string
  editLabel?: string
  emptyTitle?: string
  allLabel?: string
  uncategorizedLabel?: string
  listLabel?: string
  gridLabel?: string
  viewLabel?: string
  orderHint?: string
  filteredHint?: string
  savedMessage?: string
  updateError?: string
  reorderLabel?: string
  dragInstructions?: string
  pickedUp?: string
  ofWord?: string
  overPlace?: string
  droppedAt?: string
  dropped?: string
  cancelled?: string
}

export function SortableBoard({
  items,
  categories,
  onReorder,
  readOnly = false,
  onToggleHomepage,
  onEdit,
  view: viewProp,
  onViewChange,
  query: queryProp,
  onQueryChange,
  filter: filterProp,
  onFilterChange,
  addButton,
  className,
  homepageLabel = "Homepage",
  searchLabel = "Search",
  editLabel = "Edit",
  emptyTitle = "No matches",
  allLabel = "All",
  uncategorizedLabel = "No category",
  listLabel = "List",
  gridLabel = "Grid",
  viewLabel = "View",
  orderHint = "Drag the handle. This order is the order on the site.",
  filteredHint = "Reordering swaps the projects on screen. The rest stay put.",
  savedMessage = "Order saved",
  updateError = "Could not update",
  reorderLabel = "Reorder",
  dragInstructions = "Press Space, then arrow keys, then Space to drop. Escape cancels.",
  pickedUp = "Picked up, place",
  ofWord = "of",
  overPlace = "Over place",
  droppedAt = "Dropped at place",
  dropped = "Dropped.",
  cancelled = "Cancelled.",
}: SortableBoardProps) {
  const [viewState, setViewState] = React.useState<"list" | "grid">("list")
  const [queryState, setQueryState] = React.useState("")
  const [filterState, setFilterState] = React.useState("all")
  const [home, setHome] = React.useState<Record<string, boolean>>({})
  const incomingHome = homepageKey(items)
  const [seenHome, setSeenHome] = React.useState(incomingHome)
  if (seenHome !== incomingHome) {
    setSeenHome(incomingHome)
    setHome((current) => reconcileHomepageOverrides(current, seenHome, items))
  }
  const view = viewProp ?? viewState
  const query = queryProp ?? queryState
  const filter = filterProp ?? filterState

  const notify = React.useMemo(
    () => ({
      success: (message: string) => toast.success(message),
      error: (message: string) => toast.error(message),
    }),
    [],
  )
  const list = useOptimisticList({ items, onReorder, notify, savedMessage })

  function isHome(item: BoardItem) {
    return home[item.id] ?? item.showOnHomepage
  }

  const q = query.trim().toLowerCase()
  const visible = list.items.filter((item) => {
    if (filter === "home" && !isHome(item)) return false
    if (filter === "none" && item.categoryId) return false
    if (filter.startsWith("cat:") && item.categoryId !== filter.slice(4)) return false
    if (!q) return true
    return (
      item.title.toLowerCase().includes(q) ||
      (item.categoryTitle ?? "").toLowerCase().includes(q)
    )
  })
  const visibleIds = visible.map((item) => item.id)

  const searched = list.items.filter(
    (item) =>
      !q ||
      item.title.toLowerCase().includes(q) ||
      (item.categoryTitle ?? "").toLowerCase().includes(q),
  )
  const chips = [
    { key: "all", label: allLabel, n: searched.length },
    { key: "home", label: homepageLabel, n: searched.filter(isHome).length },
    ...categories.map((category) => ({
      key: `cat:${category.id}`,
      label: category.title,
      n: searched.filter((item) => item.categoryId === category.id).length,
    })),
  ]
  const uncategorized = searched.filter((item) => !item.categoryId).length
  if (uncategorized) chips.push({ key: "none", label: uncategorizedLabel, n: uncategorized })

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function place(id: string | number) {
    return visibleIds.indexOf(String(id)) + 1
  }

  function onDragEnd(event: DragEndEvent) {
    if (!event.over || event.active.id === event.over.id) return
    list.moveVisible(visibleIds, String(event.active.id), String(event.over.id))
  }

  async function toggle(item: BoardItem) {
    const next = !isHome(item)
    setHome((current) => ({ ...current, [item.id]: next }))
    try {
      await onToggleHomepage(item.id, next)
    } catch (error) {
      setHome((current) => ({ ...current, [item.id]: !next }))
      toast.error(error instanceof Error && error.message ? error.message : updateError)
    }
  }

  function setView(next: "list" | "grid") {
    setViewState(next)
    onViewChange?.(next)
  }
  function setQuery(next: string) {
    setQueryState(next)
    onQueryChange?.(next)
  }
  function setFilter(next: string) {
    setFilterState(next)
    onFilterChange?.(next)
  }

  return (
    <div className={cn("flex flex-col gap-3", className)}>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <Tabs value={filter} onValueChange={setFilter} className="min-w-0">
          <TabsList className="h-auto flex-wrap">
            {chips.map((chip) => (
              <TabsTrigger key={chip.key} value={chip.key}>
                {chip.label}
                <Badge variant="secondary" className="ml-1 tabular-nums">
                  {chip.n}
                </Badge>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        <div className="flex flex-1 items-center gap-2 lg:justify-end">
          <div className="relative min-w-40 flex-1 lg:max-w-xs">
            <Search className="pointer-events-none absolute top-1/2 left-2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchLabel}
              aria-label={searchLabel}
              className="pl-8"
            />
          </div>
          <div className="flex rounded-lg bg-muted p-0.5" role="group" aria-label={viewLabel}>
            <Button
              type="button"
              size="sm"
              variant={view === "list" ? "secondary" : "ghost"}
              aria-pressed={view === "list"}
              onClick={() => setView("list")}
            >
              <List />
              {listLabel}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={view === "grid" ? "secondary" : "ghost"}
              aria-pressed={view === "grid"}
              onClick={() => setView("grid")}
            >
              <LayoutGrid />
              {gridLabel}
            </Button>
          </div>
          {addButton}
        </div>
      </div>
      <p className="text-xs text-muted-foreground">
        {filter !== "all" || q ? filteredHint : orderHint}
      </p>
      {visible.length === 0 ? (
        <EmptyState title={emptyTitle} />
      ) : (
        <DndContext
          sensors={readOnly ? [] : sensors}
          collisionDetection={closestCenter}
          onDragEnd={onDragEnd}
          accessibility={{
            screenReaderInstructions: {
              draggable: dragInstructions,
            },
            announcements: {
              onDragStart: ({ active }) => `${pickedUp} ${place(active.id)} ${ofWord} ${visibleIds.length}.`,
              onDragOver: ({ over }) => (over ? `${overPlace} ${place(over.id)}.` : ""),
              onDragEnd: ({ over }) => (over ? `${droppedAt} ${place(over.id)}.` : dropped),
              onDragCancel: () => cancelled,
            },
          }}
        >
          <SortableContext
            items={visibleIds}
            strategy={view === "grid" ? rectSortingStrategy : verticalListSortingStrategy}
          >
            <ol
              className={cn(
                view === "grid"
                  ? "grid gap-3 sm:grid-cols-2 xl:grid-cols-3"
                  : "flex flex-col gap-2",
              )}
            >
              {visible.map((item, index) => (
                <BoardCard
                  key={item.id}
                  item={item}
                  index={index}
                  view={view}
                  home={isHome(item)}
                  homepageLabel={homepageLabel}
                  uncategorizedLabel={uncategorizedLabel}
                  reorderLabel={reorderLabel}
                  editLabel={editLabel}
                  onEdit={onEdit}
                  onToggle={() => void toggle(item)}
                  readOnly={readOnly}
                />
              ))}
            </ol>
          </SortableContext>
        </DndContext>
      )}
    </div>
  )
}

function BoardCard({
  item,
  index,
  view,
  home,
  homepageLabel,
  uncategorizedLabel,
  reorderLabel,
  editLabel,
  onEdit,
  onToggle,
  readOnly = false,
}: {
  item: BoardItem
  index: number
  view: "list" | "grid"
  home: boolean
  homepageLabel: string
  uncategorizedLabel: string
  reorderLabel: string
  editLabel: string
  onEdit?: (id: string) => void
  onToggle: () => void
  readOnly?: boolean
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } =
    useSortable({ id: item.id, disabled: readOnly })
  const style = { transform: CSS.Transform.toString(transform), transition }
  const thumb = item.imageUrl || item.videoUrl

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex gap-3 rounded-xl bg-card p-2 ring-1 ring-foreground/10",
        view === "grid" ? "flex-col" : "items-center",
        isDragging && "opacity-70",
      )}
    >
      <div className={cn("flex items-center gap-2", view === "grid" && "w-full")}>
        <Button
          type="button"
          ref={setActivatorNodeRef}
          variant="ghost"
          size="icon-sm"
          className="cursor-grab touch-none disabled:cursor-default"
          aria-label={`${reorderLabel} ${item.title}`}
          disabled={readOnly}
          {...(readOnly ? {} : attributes)}
          {...(readOnly ? {} : listeners)}
        >
          <GripVertical />
        </Button>
        <span className="text-xs text-muted-foreground tabular-nums">{index + 1}</span>
        {view === "list" ? <Thumb url={thumb} alt={item.title} /> : null}
        {view === "list" ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{item.title}</p>
            <p className="truncate text-xs text-muted-foreground">{item.categoryTitle || uncategorizedLabel}</p>
          </div>
        ) : null}
      </div>
      {view === "grid" ? (
        <div className="aspect-video overflow-hidden rounded-lg bg-muted">
          {thumb ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={thumb} alt="" className="size-full object-cover" />
          ) : (
            <div className="grid size-full place-items-center text-sm text-muted-foreground">
              {item.title.slice(0, 1)}
            </div>
          )}
        </div>
      ) : null}
      {view === "grid" ? (
        <div>
          <p className="truncate text-sm font-medium">{item.title}</p>
          <p className="truncate text-xs text-muted-foreground">{item.categoryTitle || uncategorizedLabel}</p>
        </div>
      ) : null}
      <div className={cn("flex items-center gap-2", view === "list" && "ml-auto")}>
        <label className="flex items-center gap-2 text-xs text-muted-foreground">
          <Switch checked={home} onCheckedChange={onToggle} aria-label={`${homepageLabel}: ${item.title}`} />
          <span className="hidden md:inline">{homepageLabel}</span>
        </label>
        {onEdit ? (
          <Button type="button" variant="outline" size="sm" onClick={() => onEdit(item.id)}>
            <Pencil />
            {editLabel}
          </Button>
        ) : null}
      </div>
    </li>
  )
}
