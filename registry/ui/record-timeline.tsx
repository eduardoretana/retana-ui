"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"
import { Calendar, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { formatDashboardDate, joinMeta } from "@/registry/retana/lib/dashboard-format"

export type RecordTimelineStatus = "default" | "alert" | "done" | "pending"

export type RecordTimelineEvent = {
  id: string
  title: string
  date: string | number | Date
  description?: string
  meta?: string
  status?: RecordTimelineStatus
}

export type RecordTimelineClassNames = {
  root?: string
  item?: string
  title?: string
  description?: string
}

export type RecordTimelineProps = {
  events: readonly RecordTimelineEvent[]
  label?: string
  context?: string
  rangeLabel?: string
  order?: "asc" | "desc"
  locale?: string
  collapseAfter?: number
  moreLabel?: (hidden: number) => string
  onSelect?: (event: RecordTimelineEvent) => void
  className?: string
  classNames?: RecordTimelineClassNames
}

function timeValue(value: string | number | Date) {
  const date = value instanceof Date ? value : new Date(value)
  const ms = date.getTime()
  return Number.isNaN(ms) ? 0 : ms
}

export function RecordTimeline({
  events,
  label = "Record timeline",
  context,
  rangeLabel,
  order = "asc",
  locale = "en-US",
  collapseAfter,
  moreLabel = (hidden) => `Show ${hidden} earlier`,
  onSelect,
  className,
  classNames,
}: RecordTimelineProps) {
  const [expanded, setExpanded] = React.useState(false)
  const sorted = [...events].sort((a, b) => timeValue(a.date) - timeValue(b.date))
  const ordered = order === "desc" ? sorted.reverse() : sorted
  const hidden = collapseAfter != null && !expanded ? Math.max(0, ordered.length - collapseAfter) : 0
  const visible = hidden > 0 ? (order === "asc" ? ordered.slice(hidden) : ordered.slice(0, collapseAfter)) : ordered

  return (
    <div data-slot="record-timeline" className={cn("min-w-0", className, classNames?.root)}>
      {context || rangeLabel ? (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          {context ? <p className="min-w-0 break-words">{context}</p> : <span />}
          {rangeLabel ? (
            <span className="inline-flex h-6 items-center gap-1 rounded-full bg-muted px-2">
              <Calendar className="size-3.5" aria-hidden />
              {rangeLabel}
            </span>
          ) : null}
        </div>
      ) : null}
      {hidden > 0 && order === "asc" ? (
        <Button type="button" variant="ghost" size="sm" className="mb-2" onClick={() => setExpanded(true)}>
          {moreLabel(hidden)}
        </Button>
      ) : null}
      <ol aria-label={label} className="flex flex-col">
        {visible.map((event, index) => {
          const status = event.status ?? "default"
          const when = formatDashboardDate(event.date, locale, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
          const iso = new Date(event.date)
          const dateTime = Number.isNaN(iso.getTime()) ? undefined : iso.toISOString()
          const statusText = status === "default" ? "" : status
          return (
            <li key={event.id} className={cn("relative flex gap-3 pb-4 last:pb-0", classNames?.item)}>
              {index < visible.length - 1 ? <span className="absolute start-[7px] top-4 bottom-0 w-px bg-border" aria-hidden /> : null}
              <span
                data-status={status}
                className={cn(
                  "relative z-[1] mt-1 grid size-4 shrink-0 place-items-center rounded-full",
                  status === "default" && "border border-muted-foreground/40 bg-card",
                  status === "alert" && "bg-destructive",
                  status === "done" && "bg-chart-2 text-foreground",
                  status === "pending" && "border border-dashed border-muted-foreground bg-card",
                )}
                aria-hidden
              >
                {status === "done" ? <Check className="size-2.5" /> : null}
              </span>
              <div className="min-w-0 flex-1">
                {onSelect ? (
                  <button type="button" className="w-full rounded-md text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => onSelect(event)}>
                    <EventCopy event={event} when={when} dateTime={dateTime} statusText={statusText} classNames={classNames} />
                  </button>
                ) : (
                  <EventCopy event={event} when={when} dateTime={dateTime} statusText={statusText} classNames={classNames} />
                )}
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

function EventCopy({
  event,
  when,
  dateTime,
  statusText,
  classNames,
}: {
  event: RecordTimelineEvent
  when: string
  dateTime?: string
  statusText: string
  classNames?: RecordTimelineClassNames
}) {
  return (
    <>
      <span className="flex items-baseline justify-between gap-3">
        <span className={cn("text-sm font-medium break-words", classNames?.title)}>
          {event.title}
          {statusText ? <span className="sr-only"> — {statusText}</span> : null}
        </span>
        <time dateTime={dateTime} className="shrink-0 text-xs text-muted-foreground">
          {when}
        </time>
      </span>
      {event.description ? <p className={cn("mt-0.5 text-sm text-muted-foreground", classNames?.description)}>{event.description}</p> : null}
      {event.meta ? <p className="mt-0.5 text-xs text-muted-foreground">{joinMeta(event.meta.split("·").map((part) => part.trim()))}</p> : null}
    </>
  )
}
