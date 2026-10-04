"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core"
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { GripVertical, MoreHorizontal, Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  fieldById,
  formatCurrency,
  formatNumber,
  groupRecordsWithSum,
  recordTitle,
  type FieldDef,
  type MultiRecord,
  type ViewConfig,
} from "@/registry/retana/lib/multi-view"
import { PriorityBadge, PRIORITY_LEVELS, type PriorityLevel } from "@/registry/retana/ui/priority-badge"
import {
  FieldDisplay,
  FieldIcon,
  StatusPill,
  displayFields,
  usePrefersReducedMotion,
} from "@/registry/retana/ui/multi-view-fields"

export type ViewKanbanProps = {
  records: readonly MultiRecord[]
  fields: readonly FieldDef[]
  config: ViewConfig
  locale?: string
  selectedIds?: readonly string[]
  onSelectedIdsChange?: (ids: string[]) => void
  onOpen?: (id: string) => void
  onDelete?: (ids: readonly string[]) => Promise<void> | void
  onMove?: (id: string, patch: Record<string, unknown>) => Promise<void> | void
  onCreateRequest?: (seed: Record<string, unknown>) => void
  emptyLabel?: string
  emptyHint?: string
  addLabel?: string
  moveLabel?: string
  /** Collapse a column after this many cards and offer the rest behind a button. */
  maxVisible?: number
  moreLabel?: (hidden: number) => string
  /** Cards that should wear a highlight ring for a short time. */
  highlightedIds?: readonly string[]
  /** Summary cards read priority, due, amount, and progress when those keys exist. */
  cardLayout?: "fields" | "summary"
  className?: string
  columnClassName?: string
  cardClassName?: string
}

export function ViewKanban({
  records,
  fields,
  config,
  locale,
  selectedIds = [],
  onSelectedIdsChange,
  onOpen,
  onDelete,
  onMove,
  onCreateRequest,
  emptyLabel = "No items",
  emptyHint,
  addLabel = "Add item",
  moveLabel = "Move to…",
  maxVisible,
  moreLabel = (hidden) => `${hidden} more`,
  highlightedIds,
  cardLayout = "fields",
  className,
  columnClassName,
  cardClassName,
}: ViewKanbanProps) {
  const reduced = usePrefersReducedMotion()
  const groupField = fieldById(fields, config.groupField)
  const sum = fieldById(fields, config.sumField)
  const groups = React.useMemo(
    () =>
      groupRecordsWithSum(records, fields, config.groupField, config.sumField, {
        includeEmpty: true,
        locale,
      }),
    [config.groupField, config.sumField, fields, locale, records],
  )
  const titleFields = fields
  const cardFields = displayFields(
    fields,
    config.cardFields,
    new Set([config.titleField, config.groupField].filter((id): id is string => Boolean(id))),
  ).slice(0, 3)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const active = records.find((record) => record.id === activeId) ?? null

  function labelFor(id: string) {
    if (id.startsWith("col:")) {
      const key = id.slice(4)
      return groups.find((group) => group.key === key)?.label ?? key
    }
    const record = records.find((item) => item.id === id)
    return record ? recordTitle(record, titleFields, config.titleField) : id
  }

  function onDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id))
  }

  function onDragEnd(event: DragEndEvent) {
    setActiveId(null)
    const id = String(event.active.id)
    const overId = event.over ? String(event.over.id) : ""
    if (!overId || !groupField) return
    const nextKey = overId.startsWith("col:")
      ? overId.slice(4)
      : groupKeyOf(records.find((record) => record.id === overId), groupField.id)
    const current = records.find((record) => record.id === id)
    if (!current || nextKey == null) return
    if (String(current[groupField.id] ?? "") === nextKey) return
    void onMove?.(id, { [groupField.id]: nextKey })
  }

  function moveTo(id: string, key: string) {
    if (!groupField) return
    void onMove?.(id, { [groupField.id]: key })
  }

  function toggle(id: string, checked: boolean) {
    if (!onSelectedIdsChange) return
    const next = checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id)
    onSelectedIdsChange(next)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
      accessibility={{
        announcements: {
          onDragStart({ active: item }) {
            return `Picked up ${labelFor(String(item.id))}.`
          },
          onDragOver({ over }) {
            return over ? `Over ${labelFor(String(over.id))}.` : ""
          },
          onDragEnd({ over }) {
            return over ? `Moved to ${labelFor(String(over.id))}.` : "Dropped."
          },
          onDragCancel() {
            return "Cancelled."
          },
        },
      }}
    >
      <div
        data-reduced-motion={reduced ? "true" : "false"}
        className={cn(
          "flex min-w-0 snap-x snap-mandatory gap-3 overflow-x-auto pb-2",
          className,
        )}
      >
        {groups.map((group) => (
          <Column
            key={group.key || "empty"}
            id={`col:${group.key}`}
            className={columnClassName}
          >
            <header className="flex items-center gap-2">
              {groupField ? (
                <StatusPill field={groupField} value={group.key || null} />
              ) : (
                <span className="text-sm font-medium">{group.label}</span>
              )}
              <span className="rounded-full bg-background px-2 py-0.5 text-xs tabular-nums text-muted-foreground">{group.records.length}</span>
              {group.sum != null && sum ? (
                <span className="ml-auto text-xs text-muted-foreground">
                  {sum.type === "currency"
                    ? formatCurrency(group.sum, locale, sum.currency, sum.format ?? "compact")
                    : formatNumber(group.sum, locale)}
                </span>
              ) : null}
            </header>
            <SortableContext items={group.records.map((record) => record.id)} strategy={verticalListSortingStrategy}>
              <div className="flex min-h-24 flex-col gap-2">
                {group.records.length === 0 ? (
                  <div className="flex flex-col items-center gap-2 rounded-lg border border-dashed border-border px-3 py-6 text-center">
                    <div className="flex items-end gap-1" aria-hidden>
                      <span className="h-5 w-7 rounded-md bg-muted" />
                      <span className="h-8 w-7 rounded-md bg-muted" />
                      <span className="h-6 w-7 rounded-md bg-background" />
                    </div>
                    <p className="text-sm font-medium">{emptyLabel}</p>
                    {emptyHint ? <p className="text-xs text-muted-foreground">{emptyHint}</p> : null}
                  </div>
                ) : (
                  (maxVisible != null && !expanded[group.key] ? group.records.slice(0, maxVisible) : group.records).map((record) => (
                    <Card
                      key={record.id}
                      record={record}
                      fields={fields}
                      titleField={config.titleField}
                      cardFields={cardFields}
                      locale={locale}
                      groupKey={group.key}
                      selected={selectedIds.includes(record.id)}
                      onSelectedChange={(checked) => toggle(record.id, checked)}
                      onOpen={onOpen}
                      onDelete={onDelete}
                      reduced={reduced}
                      className={cardClassName}
                      moveLabel={moveLabel}
                      groups={groups.map((item) => ({ key: item.key, label: item.label }))}
                      onMoveTo={(key) => moveTo(record.id, key)}
                      highlighted={highlightedIds?.includes(record.id)}
                      layout={cardLayout}
                    />
                  ))
                )}
              </div>
            </SortableContext>
            {maxVisible != null && !expanded[group.key] && group.records.length > maxVisible ? (
              <Button type="button" variant="ghost" size="sm" className="justify-start" onClick={() => setExpanded((current) => ({ ...current, [group.key]: true }))}>
                {moreLabel(group.records.length - maxVisible)}
              </Button>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="justify-start"
              onClick={() => onCreateRequest?.(groupField ? { [groupField.id]: group.key } : {})}
            >
              <Plus className="size-3.5" />
              {addLabel}
            </Button>
          </Column>
        ))}
      </div>
      <DragOverlay dropAnimation={reduced ? null : undefined}>
        {active ? (
          <article className="rounded-lg border border-border bg-card p-3 shadow-md">
            <p className="truncate text-sm font-medium" dir="auto">
              {recordTitle(active, fields, config.titleField)}
            </p>
          </article>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

function isPriority(value: unknown): value is PriorityLevel {
  return typeof value === "string" && (PRIORITY_LEVELS as readonly string[]).includes(value)
}

function SummaryChips({ record }: { record: MultiRecord }) {
  const priority = isPriority(record.priority) ? record.priority : null
  const due = typeof record.due === "string" ? record.due : null
  const amount = typeof record.amount === "string" || typeof record.amount === "number" ? String(record.amount) : null
  const subtitle = typeof record.subtitle === "string" ? record.subtitle : null
  const progress =
    record.progress && typeof record.progress === "object"
      ? (record.progress as { done?: number; total?: number })
      : null
  return (
    <div className="mt-2 flex flex-col gap-2">
      <div className="flex flex-wrap gap-1">
        {priority ? <PriorityBadge level={priority} /> : null}
        {due ? <span className="inline-flex h-6 items-center rounded-full bg-muted px-2 text-xs">{due}</span> : null}
        {amount ? <span className="inline-flex h-6 items-center rounded-full bg-chart-2/20 px-2 text-xs tabular-nums">{amount}</span> : null}
      </div>
      {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
      {progress && typeof progress.done === "number" && typeof progress.total === "number" ? (
        <div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div className="h-full rounded-full bg-primary" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted-foreground">{progress.done} of {progress.total}</p>
        </div>
      ) : null}
    </div>
  )
}

function groupKeyOf(record: MultiRecord | undefined, fieldId: string): string | null {
  if (!record) return null
  const value = record[fieldId]
  return value == null ? "" : String(value)
}

function Column({
  id,
  className,
  children,
}: {
  id: string
  className?: string
  children: React.ReactNode
}) {
  const { setNodeRef, isOver } = useDroppable({ id })
  return (
    <section
      ref={setNodeRef}
      className={cn(
        "flex w-64 shrink-0 snap-start flex-col gap-2 rounded-xl bg-muted/50 p-2",
        isOver && "ring-2 ring-ring",
        className,
      )}
    >
      {children}
    </section>
  )
}

function Card({
  record,
  fields,
  titleField,
  cardFields,
  locale,
  groupKey,
  selected,
  onSelectedChange,
  onOpen,
  onDelete,
  reduced,
  className,
  moveLabel,
  groups,
  onMoveTo,
  highlighted = false,
  layout = "fields",
}: {
  record: MultiRecord
  fields: readonly FieldDef[]
  titleField?: string
  cardFields: readonly FieldDef[]
  locale?: string
  groupKey: string
  selected: boolean
  onSelectedChange: (checked: boolean) => void
  onOpen?: (id: string) => void
  onDelete?: (ids: readonly string[]) => Promise<void> | void
  reduced: boolean
  className?: string
  moveLabel: string
  groups: readonly { key: string; label: string }[]
  onMoveTo: (key: string) => void
  highlighted?: boolean
  layout?: "fields" | "summary"
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: record.id,
  })
  const title = recordTitle(record, fields, titleField)
  const [ring, setRing] = React.useState(highlighted)
  const [tracked, setTracked] = React.useState(highlighted)
  if (highlighted !== tracked) {
    setTracked(highlighted)
    setRing(highlighted)
  }
  React.useEffect(() => {
    if (!ring) return
    const timer = window.setTimeout(() => setRing(false), 2000)
    return () => window.clearTimeout(timer)
  }, [ring])
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition: reduced ? undefined : transition,
  }
  return (
    <article
      ref={setNodeRef}
      style={style}
      data-highlight={ring ? "true" : undefined}
      className={cn(
        "rounded-lg border border-border bg-card p-2",
        isDragging && "opacity-50",
        ring && "ring-2 ring-primary transition-opacity motion-reduce:transition-none",
        className,
      )}
    >
      <div className="flex items-start gap-2">
        <Checkbox
          aria-label={`Select ${title}`}
          checked={selected}
          onCheckedChange={(value) => onSelectedChange(value === true)}
        />
        <button
          type="button"
          className="mt-0.5 text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label={`Drag ${title}`}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-3.5" />
        </button>
        <button
          type="button"
          className="min-w-0 flex-1 truncate rounded-sm text-left text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring"
          dir="auto"
          onClick={() => onOpen?.(record.id)}
          onKeyDown={(event) => {
            if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
            const current = groups.findIndex((group) => group.key === groupKey)
            const delta = event.key === "ArrowRight" ? 1 : -1
            const next = groups[current + delta]
            if (!next) return
            event.preventDefault()
            onMoveTo(next.key)
          }}
        >
          {title}
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="ghost" size="icon" className="size-7" aria-label={`Actions for ${title}`}>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onOpen?.(record.id)}>Open</DropdownMenuItem>
            <DropdownMenuLabel>{moveLabel}</DropdownMenuLabel>
            {groups.map((group) => (
              <DropdownMenuItem key={group.key || "empty"} onSelect={() => onMoveTo(group.key)}>
                {group.label}
              </DropdownMenuItem>
            ))}
            {onDelete ? (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => void onDelete([record.id])}>Delete</DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {layout === "summary" ? <SummaryChips record={record} /> : (
      <dl className="mt-2 grid gap-1">
        {cardFields.map((field) => (
          <div key={field.id} className="flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground">
            <FieldIcon name={field.icon} className="size-3.5 shrink-0" />
            <FieldDisplay field={field} value={record[field.id]} locale={locale} className="text-foreground" />
          </div>
        ))}
      </dl>
      )}
    </article>
  )
}

