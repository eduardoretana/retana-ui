"use client"

/**
 * Clean-room agenda event. Host semantic classes only.
 * Alt+arrows move. Shift+Alt+arrows resize. The menu repeats both.
 */

import * as React from "react"
import {
  Briefcase,
  Calendar,
  Clapperboard,
  Flag,
  MapPin,
  MoreHorizontal,
  PenLine,
  Search,
  Users,
  Video,
  Wrench,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import {
  allDayMove,
  formatInterval,
  resizeEventEnd,
  resolveAgendaLabels,
  shiftClock,
  shiftEventByDays,
  type AgendaCategory,
  type AgendaChangeSource,
  type AgendaEvent,
  type AgendaLabels,
  type AgendaMove,
  type AgendaTone,
} from "@/registry/retana/lib/agenda"

const ICONS: Record<string, LucideIcon> = {
  users: Users,
  wrench: Wrench,
  pen: PenLine,
  map: MapPin,
  clapperboard: Clapperboard,
  briefcase: Briefcase,
  calendar: Calendar,
  flag: Flag,
  search: Search,
  video: Video,
}

export function AgendaCategoryIcon({ name, className }: { name?: string; className?: string }) {
  const Icon = (name && ICONS[name]) || Calendar
  return <Icon className={cn("size-3.5", className)} aria-hidden />
}

export function agendaToneEdge(tone?: AgendaTone) {
  switch (tone) {
    case "accent":
      return "border-s-primary"
    case "critical":
      return "border-s-destructive"
    case "info":
      return "border-s-accent-foreground"
    case "positive":
      return "border-s-secondary-foreground"
    case "warning":
      return "border-s-foreground"
    default:
      return "border-s-border"
  }
}

export type AgendaEventCardProps<TMeta = Record<string, unknown>> = {
  event: AgendaEvent<TMeta>
  category?: AgendaCategory | null
  locale?: string
  timeZone?: string
  labels?: Partial<AgendaLabels>
  ongoing?: boolean
  selected?: boolean
  readOnly?: boolean
  snapMinutes?: number
  continuesBefore?: boolean
  continuesAfter?: boolean
  density?: "regular" | "compact"
  onSelect?: (id: string) => void
  onReschedule?: (id: string, move: AgendaMove, source: AgendaChangeSource) => void
  onEdit?: () => void
  onDuplicate?: () => void
  onDelete?: () => void
  className?: string
  children?: React.ReactNode
}

export function AgendaEventCard<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  event,
  category,
  locale = "es-MX",
  timeZone = "America/Mexico_City",
  labels: labelOverrides,
  ongoing = false,
  selected = false,
  readOnly = false,
  snapMinutes = 15,
  continuesBefore = false,
  continuesAfter = false,
  density = "regular",
  onSelect,
  onReschedule,
  onEdit,
  onDuplicate,
  onDelete,
  className,
  children,
}: AgendaEventCardProps<TMeta>) {
  const labels = resolveAgendaLabels(labelOverrides)
  const when = formatInterval(event.startsAt, event.endsAt, timeZone, locale, event.allDay)
  const canEdit = !readOnly && Boolean(onReschedule)

  function commit(source: AgendaChangeSource, move: AgendaMove) {
    onReschedule?.(event.id, move, source)
  }

  function onTitleKeyDown(native: React.KeyboardEvent<HTMLButtonElement>) {
    if (!canEdit || !native.altKey) return
    if (native.key !== "ArrowUp" && native.key !== "ArrowDown" && native.key !== "ArrowLeft" && native.key !== "ArrowRight") return
    native.preventDefault()
    const backward = native.key === "ArrowUp" || native.key === "ArrowLeft"
    const sign = backward ? -1 : 1
    if (native.shiftKey && (native.key === "ArrowUp" || native.key === "ArrowDown")) {
      const move = resizeEventEnd(event, sign * snapMinutes, snapMinutes, timeZone)
      commit("resize", move)
      return
    }
    if (native.key === "ArrowLeft" || native.key === "ArrowRight") {
      commit("move", shiftEventByDays(event, sign, timeZone))
      return
    }
    commit("move", shiftClock(event, sign * snapMinutes, timeZone))
  }

  return (
    <article
      data-slot="agenda-event"
      data-event-id={event.id}
      data-ongoing={ongoing ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
      data-all-day={event.allDay ? "true" : "false"}
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-border border-s-2 bg-card text-card-foreground shadow-sm",
        agendaToneEdge(category?.tone),
        selected && "z-20 ring-2 ring-ring",
        density === "compact" && "shadow-none",
        className,
      )}
    >
      <div className="flex min-h-0 items-start gap-1 p-1.5">
        <button
          type="button"
          data-agenda-focus={event.id}
          className="flex min-w-0 flex-1 items-start gap-1.5 rounded-sm text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          aria-pressed={selected}
          aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
          aria-label={labels.openEvent(event.title, when)}
          onClick={() => onSelect?.(event.id)}
          onKeyDown={onTitleKeyDown}
        >
          <AgendaCategoryIcon name={category?.icon} className="mt-0.5 shrink-0 text-muted-foreground" />
          <span className="min-w-0">
            <span className={cn("block font-medium break-words", density === "compact" ? "truncate text-xs" : "line-clamp-2 text-xs")} dir="auto">
              {event.title}
            </span>
            {density === "regular" ? (
              <span className="mt-0.5 flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground tabular-nums">
                <span>{event.allDay ? labels.allDay : when}</span>
                {ongoing ? <span className="font-medium text-primary">{labels.ongoing}</span> : null}
                {continuesBefore ? <span>{labels.continuesBefore}</span> : null}
                {continuesAfter ? <span>{labels.continuesAfter}</span> : null}
              </span>
            ) : null}
          </span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="size-6 shrink-0"
              data-agenda-ignore-drag=""
              aria-label={labels.actionsFor(event.title)}
            >
              <MoreHorizontal aria-hidden />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => onSelect?.(event.id)}>{labels.open}</DropdownMenuItem>
            {canEdit ? (
              <>
                <DropdownMenuItem onSelect={() => commit("move", shiftClock(event, -snapMinutes, timeZone))}>
                  {labels.moveEarlier}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => commit("move", shiftClock(event, snapMinutes, timeZone))}>
                  {labels.moveLater}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => commit("move", shiftEventByDays(event, -1, timeZone))}>
                  {labels.previousDay}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => commit("move", shiftEventByDays(event, 1, timeZone))}>
                  {labels.nextDay}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => commit("resize", resizeEventEnd(event, snapMinutes, snapMinutes, timeZone))}>
                  {labels.grow}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => commit("resize", resizeEventEnd(event, -snapMinutes, snapMinutes, timeZone))}>
                  {labels.shrink}
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => commit(event.allDay ? "all-day" : "all-day", allDayMove(event, timeZone, !event.allDay))}>
                  {event.allDay ? labels.makeTimed : labels.makeAllDay}
                </DropdownMenuItem>
              </>
            ) : null}
          </DropdownMenuContent>
        </DropdownMenu>
        {onEdit || onDuplicate || onDelete ? (
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" size="sm" variant="outline" className="h-auto whitespace-normal px-2" aria-label={labels.eventMenu(event.title)}>
                {labels.manage}
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-44 gap-1">
              {onEdit ? (
                <Button type="button" size="sm" variant="ghost" className="h-auto justify-start whitespace-normal" onClick={onEdit}>
                  {labels.edit}
                </Button>
              ) : null}
              {onDuplicate ? (
                <Button type="button" size="sm" variant="ghost" className="h-auto justify-start whitespace-normal" onClick={onDuplicate}>
                  {labels.duplicate}
                </Button>
              ) : null}
              {onDelete ? (
                <Button type="button" size="sm" variant="ghost" className="h-auto justify-start whitespace-normal text-destructive" onClick={onDelete}>
                  {labels.remove}
                </Button>
              ) : null}
            </PopoverContent>
          </Popover>
        ) : null}
      </div>
      {selected && children ? (
        <div data-agenda-ignore-drag="" className="min-h-0 border-t border-border">
          {children}
        </div>
      ) : null}
      {canEdit && density === "regular" ? (
        <button
          type="button"
          data-agenda-resize=""
          data-agenda-ignore-drag=""
          aria-label={labels.resize(event.title)}
          className="absolute inset-x-2 bottom-0 h-1.5 cursor-ns-resize rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onKeyDown={(native) => {
            if (native.key !== "ArrowUp" && native.key !== "ArrowDown") return
            native.preventDefault()
            const sign = native.key === "ArrowUp" ? -1 : 1
            commit("resize", resizeEventEnd(event, sign * snapMinutes, snapMinutes, timeZone))
          }}
        />
      ) : null}
    </article>
  )
}
