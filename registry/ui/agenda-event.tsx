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
  TriangleAlert,
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
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
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

export function AgendaCategoryIcon({ name, className }: { name?: string | undefined; className?: string | undefined }) {
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
  category?: AgendaCategory | null | undefined
  locale?: string | undefined
  timeZone?: string | undefined
  labels?: Partial<AgendaLabels> | undefined
  ongoing?: boolean | undefined
  selected?: boolean | undefined
  readOnly?: boolean | undefined
  snapMinutes?: number | undefined
  continuesBefore?: boolean | undefined
  continuesAfter?: boolean | undefined
  /** Visible sentence, icon plus text. Null hides the notice. */
  conflictLabel?: string | null | undefined
  density?: "regular" | "compact" | undefined
  onSelect?: ((id: string) => void) | undefined
  onReschedule?: ((id: string, move: AgendaMove, source: AgendaChangeSource) => void) | undefined
  onEdit?: (() => void) | undefined
  onDuplicate?: (() => void) | undefined
  onDelete?: (() => void) | undefined
  className?: string | undefined
  children?: React.ReactNode | undefined
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
  conflictLabel = null,
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
  const openLabel = conflictLabel ? `${labels.openEvent(event.title, when)}. ${conflictLabel}` : labels.openEvent(event.title, when)

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

  const openButton = (
    <button
      type="button"
      data-agenda-focus={event.id}
      className="flex min-w-0 flex-1 items-start gap-1.5 rounded-sm text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
      aria-pressed={selected}
      aria-keyshortcuts="Alt+ArrowUp Alt+ArrowDown Alt+ArrowLeft Alt+ArrowRight"
      aria-label={openLabel}
      onClick={() => onSelect?.(event.id)}
      onKeyDown={onTitleKeyDown}
    >
      <AgendaCategoryIcon name={category?.icon} className="mt-0.5 shrink-0 text-muted-foreground" />
      <span className="min-w-0 flex-1">
        <span data-slot="agenda-event-title" title={event.title} className="block truncate text-xs font-medium text-card-foreground" dir="auto">
          {event.title}
        </span>
        {density === "regular" ? (
          <span
            data-slot="agenda-event-when"
            className="mt-0.5 block truncate text-[11px] text-muted-foreground tabular-nums whitespace-nowrap @max-[11rem]:sr-only"
          >
            {event.allDay ? labels.allDay : when}
            {ongoing ? (
              <>
                <span aria-hidden="true">{"\u00A0·\u00A0"}</span>
                <span className="font-medium text-card-foreground">{labels.ongoing}</span>
              </>
            ) : null}
            {continuesBefore ? (
              <>
                <span aria-hidden="true">{"\u00A0·\u00A0"}</span>
                <span>{labels.continuesBefore}</span>
              </>
            ) : null}
            {continuesAfter ? (
              <>
                <span aria-hidden="true">{"\u00A0·\u00A0"}</span>
                <span>{labels.continuesAfter}</span>
              </>
            ) : null}
          </span>
        ) : null}
        {conflictLabel ? (
          <span
            data-slot="agenda-conflict"
            title={conflictLabel}
            className="mt-0.5 inline-flex max-w-full items-center gap-1 text-[11px] font-medium text-card-foreground"
          >
            <TriangleAlert aria-hidden className="size-3 shrink-0" />
            <span className="whitespace-nowrap">{labels.conflict}</span>
          </span>
        ) : null}
      </span>
    </button>
  )

  return (
    <article
      data-slot="agenda-event"
      data-event-id={event.id}
      data-ongoing={ongoing ? "true" : "false"}
      data-selected={selected ? "true" : "false"}
      data-all-day={event.allDay ? "true" : "false"}
      data-conflict={conflictLabel ? "true" : "false"}
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden rounded-md border border-border border-s-2 bg-card text-card-foreground shadow-sm @container",
        agendaToneEdge(category?.tone),
        selected && "z-20 ring-2 ring-ring",
        density === "compact" && "shadow-none",
        className,
      )}
    >
      <div className="flex min-h-0 items-start gap-1 p-1.5">
        {conflictLabel ? (
          <TooltipProvider delayDuration={300}>
            <Tooltip>
              <TooltipTrigger asChild>{openButton}</TooltipTrigger>
              <TooltipContent>{conflictLabel}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          openButton
        )}
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
                <DropdownMenuItem onSelect={() => commit("all-day", allDayMove(event, timeZone, !event.allDay))}>
                  {event.allDay ? labels.makeTimed : labels.makeAllDay}
                </DropdownMenuItem>
              </>
            ) : null}
            {onEdit ? <DropdownMenuItem onSelect={onEdit}>{labels.edit}</DropdownMenuItem> : null}
            {onDuplicate ? <DropdownMenuItem onSelect={onDuplicate}>{labels.duplicate}</DropdownMenuItem> : null}
            {onDelete ? <DropdownMenuItem onSelect={onDelete}>{labels.remove}</DropdownMenuItem> : null}
          </DropdownMenuContent>
        </DropdownMenu>
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
