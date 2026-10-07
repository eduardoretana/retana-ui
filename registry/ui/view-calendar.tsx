"use client"

import * as React from "react"
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  addDays,
  chunkWeeks,
  formatDateLabel,
  formatMonthLabel,
  localToday,
  monthGrid,
  parseDateOnly,
  recordTitle,
  weekdayLabels,
  type FieldDef,
  type MultiRecord,
  type ViewConfig,
} from "@/registry/retana/lib/multi-view"
import { useContainerWidth, usePrefersReducedMotion } from "@/registry/retana/ui/multi-view-fields"

export type ViewCalendarProps = {
  records: readonly MultiRecord[]
  fields: readonly FieldDef[]
  config: ViewConfig
  locale?: string
  weekStartsOn?: number
  today?: string
  onOpen?: (id: string) => void
  onMove?: (id: string, patch: Record<string, unknown>) => Promise<void> | void
  /** Events stay on their day. Omitted, the calendar still drags. */
  readOnly?: boolean
  todayLabel?: string
  moreLabel?: (count: number) => string
  className?: string
  gridClassName?: string
  cardClassName?: string
  agendaClassName?: string
}

export function ViewCalendar({
  records,
  fields,
  config,
  locale,
  weekStartsOn = 1,
  today,
  onOpen,
  onMove,
  readOnly = false,
  todayLabel = "Today",
  moreLabel = (count) => `+${count} more`,
  className,
  gridClassName,
  cardClassName,
  agendaClassName,
}: ViewCalendarProps) {
  const reduced = usePrefersReducedMotion()
  const [rootRef, width] = useContainerWidth<HTMLDivElement>()
  const agenda = width > 0 && width < 560
  const uid = React.useId().replace(/:/g, "")
  const focusSkip = React.useRef(true)
  const dateField = config.dateField ?? "date"
  const resolvedToday = today ?? localToday()
  const initial = parseDateOnly(resolvedToday) ?? { y: 2026, m: 1, d: 1 }
  const [cursor, setCursor] = React.useState({ y: initial.y, m: initial.m - 1 })
  const [focus, setFocus] = React.useState(resolvedToday)
  React.useEffect(() => {
    if (focusSkip.current) {
      focusSkip.current = false
      return
    }
    document.getElementById(`${uid}-${focus}`)?.focus()
  }, [focus, uid])
  const days = React.useMemo(
    () => monthGrid(cursor.y, cursor.m, weekStartsOn),
    [cursor.m, cursor.y, weekStartsOn],
  )
  const weeks = chunkWeeks(days)
  const headers = weekdayLabels(locale, weekStartsOn)
  const byDay = React.useMemo(() => {
    const map = new Map<string, MultiRecord[]>()
    for (const record of records) {
      const iso = record[dateField]
      if (typeof iso !== "string" || !parseDateOnly(iso)) continue
      const list = map.get(iso)
      if (list) list.push(record)
      else map.set(iso, [record])
    }
    return map
  }, [dateField, records])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  )

  function shiftMonth(delta: number) {
    setCursor((current) => {
      const index = current.y * 12 + current.m + delta
      return { y: Math.floor(index / 12), m: ((index % 12) + 12) % 12 }
    })
  }

  function goToday() {
    const parts = parseDateOnly(resolvedToday)
    if (!parts) return
    setCursor({ y: parts.y, m: parts.m - 1 })
    setFocus(resolvedToday)
  }

  function moveFocus(iso: string, delta: number) {
    const next = addDays(iso, delta)
    if (!next) return
    const parts = parseDateOnly(next)
    if (parts) setCursor({ y: parts.y, m: parts.m - 1 })
    setFocus(next)
  }

  function reschedule(id: string, iso: string) {
    void onMove?.(id, { [dateField]: iso })
  }

  function onDragEnd(event: DragEndEvent) {
    const over = event.over ? String(event.over.id) : ""
    if (!over.startsWith("day:")) return
    reschedule(String(event.active.id), over.slice(4))
  }

  const monthName = formatMonthLabel(cursor.y, cursor.m, locale)

  return (
    <div ref={rootRef} data-reduced-motion={reduced ? "true" : "false"} className={cn("@container flex min-w-0 flex-col gap-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="w-full text-sm font-medium @[28rem]:w-auto @[28rem]:flex-1">{monthName}</h2>
        <label className="sr-only" htmlFor={`${uid}-month`}>
          Month
        </label>
        <input
          id={`${uid}-month`}
          type="month"
          className="h-8 rounded-md border border-input bg-background px-2 text-sm"
          value={`${cursor.y}-${String(cursor.m + 1).padStart(2, "0")}`}
          onChange={(event) => {
            const [y, m] = event.target.value.split("-").map(Number)
            if (!y || !m) return
            setCursor({ y, m: m - 1 })
          }}
        />
        <Button type="button" variant="outline" size="icon" className="size-8" aria-label="Previous month" onClick={() => shiftMonth(-1)}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button type="button" variant="outline" size="icon" className="size-8" aria-label="Next month" onClick={() => shiftMonth(1)}>
          <ChevronRight className="size-4" />
        </Button>
        <Button type="button" variant="outline" size="sm" onClick={goToday}>
          {todayLabel}
        </Button>
      </div>
      {agenda ? (
        <Agenda
          days={days.filter((day) => day.inMonth)}
          byDay={byDay}
          fields={fields}
          titleField={config.titleField}
          today={resolvedToday}
          locale={locale}
          dateField={dateField}
          onOpen={onOpen}
          onReschedule={reschedule}
          readOnly={readOnly}
          className={agendaClassName}
          cardClassName={cardClassName}
        />
      ) : (
        <DndContext sensors={readOnly ? [] : sensors} onDragEnd={onDragEnd}>
          <div
            role="grid"
            aria-label={monthName}
            className={cn("grid min-w-0 gap-px overflow-hidden rounded-lg border border-border bg-border", gridClassName)}
          >
            <div role="row" className="grid grid-cols-7 gap-px">
              {headers.map((label) => (
                <div key={label} role="columnheader" className="bg-muted px-1 py-1 text-center text-xs text-muted-foreground">
                  {label}
                </div>
              ))}
            </div>
            {weeks.map((week, weekIndex) => (
              <div role="row" key={week[0]?.iso ?? weekIndex} className="grid grid-cols-7 gap-px">
                {week.map((day) => (
                  <DayCell
                    key={day.iso}
                    cellId={`${uid}-${day.iso}`}
                    iso={day.iso}
                    inMonth={day.inMonth}
                    today={day.iso === resolvedToday}
                    focused={focus === day.iso}
                    records={byDay.get(day.iso) ?? []}
                    fields={fields}
                    titleField={config.titleField}
                    locale={locale}
                    moreLabel={moreLabel}
                    cardClassName={cardClassName}
                    onFocus={() => setFocus(day.iso)}
                    onKeyDown={(event) => {
                      if (event.altKey || event.target !== event.currentTarget) return
                      const delta =
                        event.key === "ArrowRight" ? 1 :
                        event.key === "ArrowLeft" ? -1 :
                        event.key === "ArrowDown" ? 7 :
                        event.key === "ArrowUp" ? -7 : 0
                      if (!delta) return
                      event.preventDefault()
                      moveFocus(day.iso, delta)
                    }}
                    onOpen={onOpen}
                    onReschedule={reschedule}
                    readOnly={readOnly}
                    dateField={dateField}
                  />
                ))}
              </div>
            ))}
          </div>
          <DragOverlay dropAnimation={reduced ? null : undefined} />
        </DndContext>
      )}
    </div>
  )
}

function DayCell({
  cellId,
  iso,
  inMonth,
  today,
  focused,
  records,
  fields,
  titleField,
  locale,
  moreLabel,
  cardClassName,
  onFocus,
  onKeyDown,
  onOpen,
  onReschedule,
  readOnly = false,
  dateField,
}: {
  cellId: string
  iso: string
  inMonth: boolean
  today: boolean
  focused: boolean
  records: readonly MultiRecord[]
  fields: readonly FieldDef[]
  titleField?: string
  locale?: string
  moreLabel: (count: number) => string
  cardClassName?: string
  onFocus: () => void
  onKeyDown: (event: React.KeyboardEvent) => void
  onOpen?: (id: string) => void
  onReschedule: (id: string, iso: string) => void
  readOnly?: boolean
  dateField: string
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `day:${iso}` })
  const visible = records.slice(0, 2)
  const hidden = records.slice(2)
  const parts = parseDateOnly(iso)
  return (
    <div
      ref={setNodeRef}
      id={cellId}
      role="gridcell"
      tabIndex={focused ? 0 : -1}
      aria-selected={focused}
      aria-current={today ? "date" : undefined}
      aria-label={formatDateLabel(iso, locale)}
      data-today={today ? "true" : "false"}
      onFocus={(event) => {
        if (event.target !== event.currentTarget) return
        onFocus()
      }}
      onKeyDown={onKeyDown}
      className={cn(
        "flex min-h-24 min-w-0 flex-col gap-1 bg-background p-1 outline-none focus-visible:ring-2 focus-visible:ring-ring",
        !inMonth && "bg-muted/40 text-muted-foreground",
        isOver && "bg-accent",
      )}
    >
      <span className={cn("inline-flex size-6 items-center justify-center rounded-full text-xs", today && "bg-primary text-primary-foreground")}>
        {parts?.d}
      </span>
      {visible.map((record) => (
        <RecordChip
          key={record.id}
          record={record}
          fields={fields}
          titleField={titleField}
          className={cardClassName}
          onOpen={onOpen}
          onReschedule={(delta) => {
            if (readOnly) return
            const next = addDays(iso, delta)
            if (next) onReschedule(record.id, next)
          }}
          readOnly={readOnly}
          dateField={dateField}
        />
      ))}
      {hidden.length ? (
        <Popover>
          <PopoverTrigger asChild>
            <button type="button" className="text-left text-xs text-muted-foreground underline-offset-2 hover:underline">
              {moreLabel(hidden.length)}
            </button>
          </PopoverTrigger>
          <PopoverContent className="grid gap-1">
            {hidden.map((record) => (
              <button key={record.id} type="button" className="truncate text-left text-sm" onClick={() => onOpen?.(record.id)}>
                {recordTitle(record, fields, titleField)}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      ) : null}
    </div>
  )
}

function RecordChip({
  record,
  fields,
  titleField,
  className,
  onOpen,
  onReschedule,
  readOnly = false,
}: {
  record: MultiRecord
  fields: readonly FieldDef[]
  titleField?: string
  className?: string
  onOpen?: (id: string) => void
  onReschedule: (delta: number) => void
  readOnly?: boolean
  dateField: string
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: record.id, disabled: readOnly })
  const title = recordTitle(record, fields, titleField)
  return (
    <button
      ref={setNodeRef}
      type="button"
      className={cn(
        "truncate rounded-md bg-muted px-1.5 py-0.5 text-left text-xs focus-visible:ring-2 focus-visible:ring-ring",
        isDragging && "opacity-40",
        className,
      )}
      aria-label={`Reschedule ${title}`}
      dir="auto"
      onClick={() => onOpen?.(record.id)}
      {...(readOnly ? {} : attributes)}
      {...(readOnly ? {} : listeners)}
      onKeyDown={(event) => {
        if (readOnly) return
        if (event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
          event.preventDefault()
          event.stopPropagation()
          onReschedule(event.key === "ArrowRight" ? 1 : -1)
          return
        }
        listeners?.onKeyDown?.(event)
      }}
    >
      {title}
    </button>
  )
}

function Agenda({
  days,
  byDay,
  fields,
  titleField,
  today,
  locale,
  onOpen,
  onReschedule,
  readOnly = false,
  className,
  cardClassName,
}: {
  days: { iso: string; inMonth: boolean }[]
  byDay: Map<string, MultiRecord[]>
  fields: readonly FieldDef[]
  titleField?: string
  today: string
  locale?: string
  dateField: string
  onOpen?: (id: string) => void
  onReschedule: (id: string, iso: string) => void
  readOnly?: boolean
  className?: string
  cardClassName?: string
}) {
  const listed = days.filter((day) => day.iso === today || (byDay.get(day.iso)?.length ?? 0) > 0)
  return (
    <ol className={cn("grid gap-3", className)}>
      {listed.map((day) => (
        <li key={day.iso} className="grid gap-1">
          <h3 className={cn("text-xs font-medium", day.iso === today && "text-primary")}>
            {formatDateLabel(day.iso, locale)}
          </h3>
          {(byDay.get(day.iso) ?? []).map((record) => (
            <button
              key={record.id}
              type="button"
              className={cn("truncate rounded-md border border-border bg-card px-2 py-1 text-left text-sm", cardClassName)}
              dir="auto"
              onClick={() => onOpen?.(record.id)}
              onKeyDown={(event) => {
                if (readOnly) return
                if (!event.altKey || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return
                const next = addDays(day.iso, event.key === "ArrowRight" ? 1 : -1)
                if (!next) return
                event.preventDefault()
                onReschedule(record.id, next)
              }}
            >
              {recordTitle(record, fields, titleField)}
            </button>
          ))}
          {(byDay.get(day.iso) ?? []).length === 0 ? (
            <p className="text-sm text-muted-foreground">No items</p>
          ) : null}
        </li>
      ))}
    </ol>
  )
}
