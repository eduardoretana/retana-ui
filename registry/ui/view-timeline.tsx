"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  asDateRange,
  barPlacement,
  formatDateLabel,
  groupRecords,
  localToday,
  moveRange,
  parseDateOnly,
  recordTitle,
  resizeRange,
  timelineRange,
  timelineTicks,
  type FieldDef,
  type MultiRecord,
  type TimelineZoom,
  type ViewConfig,
} from "@/registry/retana/lib/multi-view"
import { usePrefersReducedMotion } from "@/registry/retana/ui/multi-view-fields"

const UNIT: Record<TimelineZoom, number> = {
  day: 28,
  week: 36,
  month: 72,
  quarter: 88,
}

const ZOOMS: TimelineZoom[] = ["day", "week", "month", "quarter"]

export type ViewTimelineProps = {
  records: readonly MultiRecord[]
  fields: readonly FieldDef[]
  config: ViewConfig
  locale?: string
  weekStartsOn?: number
  today?: string
  zoom?: TimelineZoom
  onZoomChange?: (zoom: TimelineZoom) => void
  onOpen?: (id: string) => void
  onMove?: (id: string, patch: Record<string, unknown>) => Promise<void> | void
  /** Bars stay put. Omitted, the timeline still moves and resizes. */
  readOnly?: boolean
  className?: string
  rowClassName?: string
  barClassName?: string
}

export function ViewTimeline({
  records,
  fields,
  config,
  locale,
  weekStartsOn = 1,
  today,
  zoom: zoomProp,
  onZoomChange,
  onOpen,
  onMove,
  readOnly = false,
  className,
  rowClassName,
  barClassName,
}: ViewTimelineProps) {
  const reduced = usePrefersReducedMotion()
  const [zoomState, setZoomState] = React.useState<TimelineZoom>("week")
  const zoom = zoomProp ?? zoomState
  const setZoom = (next: TimelineZoom) => {
    if (zoomProp === undefined) setZoomState(next)
    onZoomChange?.(next)
  }
  const startField = config.startField ?? "start"
  const endField = config.endField ?? "end"
  const resolvedToday = today ?? localToday()
  const groups = groupRecords(records, fields, config.groupField, { includeEmpty: false, locale })
  const range = timelineRange(records, startField, endField, zoom, resolvedToday, weekStartsOn)
  const ticks = timelineTicks(range.start, range.end, zoom, locale, weekStartsOn)
  const width = Math.max(ticks.length, 1) * UNIT[zoom]
  const todayIndex = ticks.findIndex((tick) => tick.iso === snap(resolvedToday, zoom, weekStartsOn))

  function commit(id: string, start: string, end: string) {
    void onMove?.(id, { [startField]: start, [endField]: end })
  }

  return (
    <div data-reduced-motion={reduced ? "true" : "false"} className={cn("flex min-w-0 flex-col gap-3", className)}>
      <div className="flex flex-wrap gap-1" role="group" aria-label="Zoom">
        {ZOOMS.map((item) => (
          <Button
            key={item}
            type="button"
            size="sm"
            variant={item === zoom ? "default" : "outline"}
            aria-pressed={item === zoom}
            onClick={() => setZoom(item)}
          >
            {item}
          </Button>
        ))}
      </div>
      <div className="min-w-0 overflow-x-auto rounded-lg border border-border">
        <div className="relative" style={{ minWidth: width + 180 }}>
          <div className="sticky top-0 z-10 flex border-b border-border bg-muted">
            <div className="sticky left-0 w-44 shrink-0 border-r border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
              Group
            </div>
            <div className="relative" style={{ width }}>
              {ticks.map((tick) => (
                <span
                  key={tick.iso}
                  className="absolute top-0 border-l border-border px-1 py-1 text-[10px] text-muted-foreground"
                  style={{ left: ticks.indexOf(tick) * UNIT[zoom], width: UNIT[zoom] }}
                >
                  {tick.label}
                </span>
              ))}
              <div className="h-7" />
              {todayIndex >= 0 ? (
                <div
                  aria-hidden
                  className="absolute top-0 bottom-0 w-px bg-primary"
                  style={{ left: todayIndex * UNIT[zoom] }}
                />
              ) : null}
            </div>
          </div>
          {groups.map((group) => (
            <GroupBlock
              key={group.key || "all"}
              label={group.label}
              records={group.records}
              fields={fields}
              config={config}
              startField={startField}
              endField={endField}
              rangeStart={range.start}
              zoom={zoom}
              weekStartsOn={weekStartsOn}
              unit={UNIT[zoom]}
              width={width}
              locale={locale}
              reduced={reduced}
              rowClassName={rowClassName}
              barClassName={barClassName}
              onOpen={onOpen}
              onCommit={commit}
              readOnly={readOnly}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function snap(iso: string, zoom: TimelineZoom, weekStartsOn: number) {
  if (zoom === "day") return iso
  const ticks = timelineTicks(iso, iso, zoom, undefined, weekStartsOn)
  return ticks[0]?.iso ?? iso
}

function GroupBlock({
  label,
  records,
  fields,
  config,
  startField,
  endField,
  rangeStart,
  zoom,
  weekStartsOn,
  unit,
  width,
  locale,
  reduced,
  rowClassName,
  barClassName,
  onOpen,
  onCommit,
  readOnly = false,
}: {
  label: string
  records: readonly MultiRecord[]
  fields: readonly FieldDef[]
  config: ViewConfig
  startField: string
  endField: string
  rangeStart: string
  zoom: TimelineZoom
  weekStartsOn: number
  unit: number
  width: number
  locale?: string
  reduced: boolean
  rowClassName?: string
  barClassName?: string
  onOpen?: (id: string) => void
  onCommit: (id: string, start: string, end: string) => void
  readOnly?: boolean
}) {
  const [open, setOpen] = React.useState(true)
  return (
    <section>
      <button
        type="button"
        className="flex w-full items-center gap-2 border-b border-border bg-muted/40 px-2 py-1 text-left text-sm font-medium"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <ChevronDown className={cn("size-4 transition-transform motion-reduce:transition-none", !open && "-rotate-90")} />
        <span>{label}</span>
        <span className="text-xs text-muted-foreground">{records.length}</span>
      </button>
      {open
        ? records.map((record) => (
            <TimelineRow
              key={record.id}
              record={record}
              fields={fields}
              titleField={config.titleField}
              startField={startField}
              endField={endField}
              rangeStart={rangeStart}
              zoom={zoom}
              weekStartsOn={weekStartsOn}
              unit={unit}
              width={width}
              locale={locale}
              reduced={reduced}
              className={rowClassName}
              barClassName={barClassName}
              onOpen={onOpen}
              onCommit={onCommit}
              readOnly={readOnly}
            />
          ))
        : null}
    </section>
  )
}

function readRange(record: MultiRecord, startField: string, endField: string) {
  const directStart = record[startField]
  const directEnd = record[endField]
  if (typeof directStart === "string" && typeof directEnd === "string" && parseDateOnly(directStart) && parseDateOnly(directEnd)) {
    return { start: directStart, end: directEnd }
  }
  return asDateRange(record[startField])
}

function TimelineRow({
  record,
  fields,
  titleField,
  startField,
  endField,
  rangeStart,
  zoom,
  weekStartsOn,
  unit,
  width,
  locale,
  reduced,
  className,
  barClassName,
  onOpen,
  onCommit,
  readOnly = false,
}: {
  record: MultiRecord
  fields: readonly FieldDef[]
  titleField?: string
  startField: string
  endField: string
  rangeStart: string
  zoom: TimelineZoom
  weekStartsOn: number
  unit: number
  width: number
  locale?: string
  reduced: boolean
  className?: string
  barClassName?: string
  onOpen?: (id: string) => void
  onCommit: (id: string, start: string, end: string) => void
  readOnly?: boolean
}) {
  const title = recordTitle(record, fields, titleField)
  const range = readRange(record, startField, endField)
  const place = range ? barPlacement(rangeStart, range.start, range.end, zoom, weekStartsOn) : null
  const drag = React.useRef<{ edge: "move" | "start" | "end"; x: number; start: string; end: string } | null>(null)

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>, edge: "move" | "start" | "end") {
    if (readOnly || !range) return
    event.currentTarget.setPointerCapture(event.pointerId)
    drag.current = { edge, x: event.clientX, start: range.start, end: range.end }
  }

  function onPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const session = drag.current
    drag.current = null
    if (!session) return
    const units = Math.round((event.clientX - session.x) / unit)
    if (!units) {
      if (session.edge === "move") onOpen?.(record.id)
      return
    }
    const next =
      session.edge === "move"
        ? moveRange(session.start, session.end, zoom, units)
        : resizeRange(session.start, session.end, session.edge, zoom, units)
    if (next) onCommit(record.id, next.start, next.end)
  }

  function onKeyDown(event: React.KeyboardEvent) {
    if (readOnly || !range) return
    const dir = event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : 0
    if (!dir) return
    event.preventDefault()
    const next = event.shiftKey
      ? resizeRange(range.start, range.end, "end", zoom, dir)
      : moveRange(range.start, range.end, zoom, dir)
    if (next) onCommit(record.id, next.start, next.end)
  }

  const name = range
    ? `${title}, ${formatDateLabel(range.start, locale)} to ${formatDateLabel(range.end, locale)}`
    : title

  return (
    <div className={cn("flex border-b border-border", className)}>
      <div className="sticky left-0 z-10 flex w-44 shrink-0 items-center border-r border-border bg-background px-2">
        <span className="truncate text-sm" dir="auto">
          {title}
        </span>
      </div>
      <div className="relative h-10" style={{ width }}>
        {place && range ? (
          <button
            type="button"
            className={cn(
              "absolute top-2 flex h-6 items-center overflow-hidden rounded-md bg-primary/15 px-2 text-xs text-foreground ring-1 ring-primary/30 focus-visible:ring-2 focus-visible:ring-ring",
              reduced && "transition-none",
              barClassName,
            )}
            style={{ left: place.offset * unit, width: Math.max(place.span * unit - 4, 16) }}
            aria-label={name}
            onKeyDown={onKeyDown}
            onPointerDown={(event) => onPointerDown(event, edgeFromTarget(event))}
            onPointerUp={onPointerUp}
          >
            <span className="absolute inset-y-0 left-0 w-1.5 cursor-ew-resize" data-edge="start" />
            <span className="pointer-events-none truncate" dir="auto">
              {title}
            </span>
            <span className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize" data-edge="end" />
          </button>
        ) : (
          <span className="px-2 text-xs text-muted-foreground">No dates</span>
        )}
      </div>
    </div>
  )
}

function edgeFromTarget(event: React.PointerEvent<HTMLButtonElement>): "move" | "start" | "end" {
  const node = event.target instanceof Element ? event.target.closest("[data-edge]") : null
  const edge = node?.getAttribute("data-edge")
  if (edge === "start" || edge === "end") return edge
  return "move"
}
