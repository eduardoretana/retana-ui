"use client"

/**
 * Clean-room agenda for any CRM.
 * Day, week, and month. The host owns the records.
 * Move, resize, and create go out through callbacks.
 * `view-calendar` stays the date-field month inside multi-view.
 */

import * as React from "react"
import { ChevronLeft, ChevronRight, Plus, RefreshCw, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { AgendaDetail } from "@/registry/retana/ui/agenda-detail"
import { toast } from "sonner"

import { AgendaCategoryIcon, AgendaEventCard } from "@/registry/retana/ui/agenda-event"
import {
  DEFAULT_AGENDA_LOCALE,
  DEFAULT_AGENDA_TIME_ZONE,
  DEFAULT_SNAP_MINUTES,
  DEFAULT_WEEK_STARTS_ON,
  attentionEvents,
  calendarDate,
  clockMinutes,
  conflictPartners,
  defaultDraft,
  findResourceConflicts,
  formatClock,
  formatDayHeading,
  formatHoursFromMs,
  formatInterval,
  formatRangeLabel,
  formatTimeZoneShort,
  instantOnDate,
  isCategoryVisible,
  isEventOngoing,
  isGapHour,
  layoutTimedSegments,
  monthGrid,
  moveToDateKeepingClock,
  outsideWindow,
  resizeEventEnd,
  resolveAgendaLabels,
  resourceLoads,
  segmentsForEvent,
  shiftAnchor,
  shiftClock,
  upcomingEvents,
  visibleDates,
  weekdayLabels,
  type AgendaCategory,
  type AgendaChangeSource,
  type AgendaEvent,
  type AgendaEventDraft,
  type AgendaHoliday,
  type AgendaLabels,
  type AgendaMove,
  type AgendaResource,
  type AgendaView,
  type EventBox,
} from "@/registry/retana/lib/agenda"

const GUTTER = "4.5rem"
/** Wide enough that a two-way overlap still leaves a title and the word "Choque". */
const RESOURCE_COLUMN_MIN = "22rem"

export type AgendaProps<TMeta = Record<string, unknown>> = {
  events: readonly AgendaEvent<TMeta>[]
  categories?: readonly AgendaCategory[]
  view?: AgendaView
  defaultView?: AgendaView
  onViewChange?: (view: AgendaView) => void
  /** Calendar day `YYYY-MM-DD` in `timeZone`. */
  anchor?: string
  defaultAnchor?: string
  onAnchorChange?: (anchor: string) => void
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelectedIdChange?: (id: string | null) => void
  hiddenCategoryIds?: readonly string[]
  defaultHiddenCategoryIds?: readonly string[]
  onHiddenCategoryIdsChange?: (ids: readonly string[]) => void
  /** Host-defined axis. Omit it and the agenda stays a date grid. */
  resources?: readonly AgendaResource[]
  /** `null` shows every resource. Omit the prop for uncontrolled state. */
  resourceId?: string | null
  defaultResourceId?: string | null
  onResourceIdChange?: (id: string | null) => void
  onReschedule?: (id: string, move: AgendaMove, source: AgendaChangeSource) => void | Promise<void>
  onCreate?: (draft: AgendaEventDraft) => void | Promise<void>
  onCreateRequest?: (draft: AgendaEventDraft) => void | Promise<void>
  onJoin?: (id: string) => void
  onOpenSummary?: (id: string) => void
  onCreateRoom?: (id: string) => void
  /** Opaque task id from the host. The agenda does not import a task board. */
  onOpenTask?: (id: string, taskId: string) => void
  /** Opaque CRM record id from the host. */
  onOpenRecord?: (id: string, recordId: string) => void
  onSync?: () => void | Promise<void>
  onRetry?: () => void
  /** All-day chips. The host supplies the dates; the agenda does not invent a calendar. */
  holidays?: readonly AgendaHoliday[]
  onEdit?: (event: AgendaEvent<TMeta>) => void
  onDuplicate?: (event: AgendaEvent<TMeta>) => void
  onDelete?: (id: string) => void
  syncing?: boolean
  readOnly?: boolean
  loading?: boolean
  error?: string | null
  now?: Date | string
  timeZone?: string
  locale?: string
  weekStartsOn?: number
  /** First visible clock hour, inclusive. Default 0. */
  hourStart?: number
  /** Last visible clock hour, exclusive. Default 24. */
  hourEnd?: number
  hourHeight?: number
  snapMinutes?: number
  labels?: Partial<AgendaLabels>
  className?: string
  toolbarClassName?: string
  gridClassName?: string
  eventClassName?: string | undefined
  sidebarClassName?: string
  detailClassName?: string
}

export function Agenda<TMeta extends Record<string, unknown> = Record<string, unknown>>({
  events,
  categories = [],
  view: viewProp,
  defaultView = "week",
  onViewChange,
  anchor: anchorProp,
  defaultAnchor,
  onAnchorChange,
  selectedId: selectedProp,
  defaultSelectedId = null,
  onSelectedIdChange,
  hiddenCategoryIds: hiddenProp,
  defaultHiddenCategoryIds = [],
  onHiddenCategoryIdsChange,
  resources = [],
  resourceId: resourceProp,
  defaultResourceId = null,
  onResourceIdChange,
  onReschedule,
  onCreate,
  onCreateRequest,
  onJoin,
  onOpenSummary,
  onCreateRoom,
  onOpenTask,
  onOpenRecord,
  onSync,
  onRetry,
  holidays = [],
  onEdit,
  onDuplicate,
  onDelete,
  syncing = false,
  readOnly = false,
  loading = false,
  error = null,
  now,
  timeZone = DEFAULT_AGENDA_TIME_ZONE,
  locale = DEFAULT_AGENDA_LOCALE,
  weekStartsOn = DEFAULT_WEEK_STARTS_ON,
  hourStart = 0,
  hourEnd = 24,
  hourHeight = 64,
  snapMinutes = DEFAULT_SNAP_MINUTES,
  labels: labelOverrides,
  className,
  toolbarClassName,
  gridClassName,
  eventClassName,
  sidebarClassName,
  detailClassName,
}: AgendaProps<TMeta>) {
  const labels = resolveAgendaLabels(labelOverrides)
  const rootRef = React.useRef<HTMLDivElement>(null)
  const measuredWidth = useElementWidth(rootRef)
  const narrow = useNarrowScreen()
  const compactResources = measuredWidth > 0 ? measuredWidth < 560 : narrow
  const reduced = usePrefersReducedMotion()
  const clock = useClock(now)
  const [view, setView] = useControllable(viewProp, defaultView, onViewChange)
  const [anchor, setAnchor] = useControllable(
    anchorProp,
    defaultAnchor ?? (clock == null ? "2026-04-08" : calendarDate(clock, timeZone)),
    onAnchorChange,
  )
  const [selectedId, setSelectedId] = useControllable(selectedProp, defaultSelectedId, onSelectedIdChange)
  const [hidden, setHidden] = useControllable(hiddenProp, defaultHiddenCategoryIds, onHiddenCategoryIdsChange)
  const [resourceId, setResourceId] = useControllable(resourceProp, defaultResourceId, onResourceIdChange)
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const [announcement, setAnnouncement] = React.useState("")

  const visible = events.filter((event) => isCategoryVisible(event.categoryId, hidden))
  const shown = resourceId ? visible.filter((event) => event.resourceId === resourceId) : visible
  const rangeDates = visibleDates(view, anchor, weekStartsOn)
  const inRange = shown.filter((event) => segmentsForEvent(event, timeZone, rangeDates).length > 0)
  const conflicts = resources.length > 0 ? findResourceConflicts(inRange) : []
  const loads =
    resources.length > 0
      ? resourceLoads(
          inRange,
          resourceId ? resources.filter((resource) => resource.id === resourceId) : resources,
          rangeDates,
          timeZone,
        )
      : []
  const titleById = new Map(events.map((event) => [event.id, event.title]))
  function conflictText(id: string) {
    const partners = conflictPartners(id, conflicts)
    if (partners.length === 0) return null
    return labels.conflictWith(partners.map((partner) => titleById.get(partner) ?? partner).join(", "))
  }
  const resourceColumns = resources.length > 0 && view === "day" && !resourceId && !compactResources
  const resourceList = resources.length > 0 && view === "day" && !resourceId && compactResources
  const resourceLayout = resourceColumns ? "columns" : resourceList ? "list" : resources.length > 0 && view === "day" ? "single" : "off"
  const selected = events.find((event) => event.id === selectedId) ?? null
  const range = formatRangeLabel(view, anchor, locale, weekStartsOn)
  const categoryById = React.useMemo(() => new Map(categories.map((category) => [category.id, category])), [categories])

  function select(id: string | null) {
    setSelectedId(id)
  }

  function reschedule(id: string, move: AgendaMove, source: AgendaChangeSource) {
    if (readOnly) return
    void onReschedule?.(id, move, source)
    const event = events.find((item) => item.id === id)
    if (!event) return
    const when = formatInterval(move.startsAt, move.endsAt, timeZone, locale, move.allDay)
    setAnnouncement(source === "resize" ? labels.resized(event.title, when) : labels.moved(event.title, when))
  }

  function editEvent(event: AgendaEvent<TMeta>) {
    onEdit?.(event)
  }

  function duplicateEvent(event: AgendaEvent<TMeta>) {
    onDuplicate?.(event)
    const line = labels.duplicated(event.title)
    toast(line)
    setAnnouncement(line)
  }

  function deleteEvent(event: AgendaEvent<TMeta>) {
    onDelete?.(event.id)
    const line = labels.deleted(event.title)
    toast(line)
    setAnnouncement(line)
    if (event.id === selectedId) select(null)
  }

  function requestCreate(draft: AgendaEventDraft) {
    if (readOnly) return
    if (onCreate) void onCreate(draft)
    else onCreateRequest?.(draft)
    setAnnouncement(labels.created(formatInterval(draft.startsAt, draft.endsAt, timeZone, locale, draft.allDay)))
  }

  function toggleCategory(id: string, nextShown: boolean) {
    const next = nextShown ? hidden.filter((item) => item !== id) : [...hidden, id]
    setHidden(next)
  }

  function focusConflict() {
    const ids = new Set(conflicts.flatMap((conflict) => [...conflict.eventIds]))
    const node = [...document.querySelectorAll<HTMLElement>("[data-agenda-focus]")].find((item) =>
      ids.has(item.getAttribute("data-agenda-focus") ?? ""),
    )
    node?.focus()
    setAnnouncement(labels.conflictCount(conflicts.length))
  }

  const resourceLabelId = React.useId()
  const showCapacity = resources.some((resource) => resource.capacityHours != null && resource.capacityHours >= 0)

  const detail = selected ? (
    <AgendaDetail
      event={selected}
      category={categoryById.get(selected.categoryId ?? "") ?? null}
      locale={locale}
      timeZone={timeZone}
      labels={labels}
      readOnly={readOnly}
      onJoin={onJoin}
      onOpenSummary={onOpenSummary}
      onCreateRoom={onCreateRoom}
      onOpenTask={onOpenTask}
      onOpenRecord={onOpenRecord}
      onClose={() => select(null)}
      className={detailClassName}
    />
  ) : null

  const sidebar = (
    <AgendaSidebar
      labels={labels}
      locale={locale}
      timeZone={timeZone}
      anchor={anchor}
      weekStartsOn={weekStartsOn}
      categories={categories}
      hidden={hidden}
      events={shown}
      now={clock}
      syncing={syncing}
      readOnly={readOnly}
      className={sidebarClassName}
      onAnchorChange={setAnchor}
      onToggleCategory={toggleCategory}
      onSync={onSync}
      onCreate={() => requestCreate(defaultDraft(anchor, timeZone))}
      onSelect={(id) => {
        const event = events.find((item) => item.id === id)
        if (event) setAnchor(calendarDate(Date.parse(event.startsAt), timeZone))
        select(id)
        setSidebarOpen(false)
      }}
    />
  )

  const showGrid = !loading && !error
  const listWeek = narrow && view === "week"

  return (
    <div
      ref={rootRef}
      data-slot="agenda"
      data-view={view}
      data-layout={narrow ? "compact" : "full"}
      data-resource-layout={resourceLayout}
      data-readonly={readOnly ? "true" : "false"}
      data-reduced-motion={reduced ? "true" : "false"}
      className={cn("flex h-full w-full min-h-0 min-w-0 max-w-full flex-col bg-background text-foreground", className)}
    >
      <header className={cn("flex flex-wrap items-end justify-between gap-3 border-b border-border px-3 py-3", toolbarClassName)}>
        <div className="min-w-0">
          <h2 className="text-lg font-semibold tracking-tight">{labels.heading}</h2>
          <p className="text-sm text-muted-foreground">{labels.subtitle}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1">
            <Button type="button" variant="outline" size="icon-sm" aria-label={labels.previousRange} onClick={() => setAnchor(shiftAnchor(view, anchor, -1, weekStartsOn))}>
              <ChevronLeft aria-hidden />
            </Button>
            <p className="min-w-36 text-center text-sm font-medium tabular-nums">{range}</p>
            <Button type="button" variant="outline" size="icon-sm" aria-label={labels.nextRange} onClick={() => setAnchor(shiftAnchor(view, anchor, 1, weekStartsOn))}>
              <ChevronRight aria-hidden />
            </Button>
          </div>
          <div role="group" aria-label={labels.viewLabel} className="flex rounded-lg border border-border p-0.5">
            {(
              [
                ["day", labels.dayView],
                ["week", labels.weekView],
                ["month", labels.monthView],
              ] as const
            ).map(([value, label]) => (
              <Button
                key={value}
                type="button"
                size="sm"
                variant={view === value ? "default" : "ghost"}
                aria-pressed={view === value}
                onClick={() => setView(value)}
              >
                {label}
              </Button>
            ))}
          </div>
          {narrow ? (
            <Button type="button" variant="outline" size="sm" onClick={() => setSidebarOpen(true)}>
              {labels.showSidebar}
            </Button>
          ) : null}
          {resources.length > 0 ? (
            <label className="flex min-w-0 items-center gap-2 text-sm" htmlFor={resourceLabelId}>
              <span className="shrink-0 text-muted-foreground">{labels.resourceFilter}</span>
              <select
                id={resourceLabelId}
                value={resourceId ?? ""}
                onChange={(native) => setResourceId(native.target.value ? native.target.value : null)}
                className="h-7 max-w-48 min-w-0 truncate rounded-lg border border-border bg-background px-2 text-sm text-foreground"
              >
                <option value="">{labels.allResources}</option>
                {resources.map((resource) => (
                  <option key={resource.id} value={resource.id}>
                    {resource.label}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
          {conflicts.length > 0 ? (
            <Button
              type="button"
              variant="outline"
              size="sm"
              data-slot="agenda-conflicts"
              aria-label={`${labels.conflictCount(conflicts.length)}. ${labels.goToConflict}`}
              onClick={focusConflict}
            >
              <TriangleAlert aria-hidden data-icon="inline-start" />
              {labels.conflictCount(conflicts.length)}
            </Button>
          ) : null}
        </div>
      </header>
      {showGrid && showCapacity ? (
        <section aria-label={labels.capacitySummary} data-slot="agenda-capacity" className="border-b border-border px-3 py-2">
          <h3 className="sr-only">{labels.capacitySummary}</h3>
          <ul className="flex flex-wrap gap-2">
            {loads.map((load) => {
              const resource = resources.find((item) => item.id === load.resourceId)
              const over = load.overMs > 0
              const scheduled = labels.hours(formatHoursFromMs(load.scheduledMs, locale))
              const capacity = load.capacityMs == null ? null : labels.hours(formatHoursFromMs(load.capacityMs, locale))
              return (
                <li
                  key={load.resourceId}
                  data-over={over ? "true" : "false"}
                  data-slot={over ? "agenda-capacity-over" : "agenda-capacity-row"}
                  className="flex min-w-0 max-w-full items-center gap-1 rounded-md border border-border bg-card px-2 py-1 text-xs font-medium text-card-foreground"
                >
                  {over ? <TriangleAlert aria-hidden className="size-3 shrink-0" /> : null}
                  <span className="max-w-40 truncate" title={resource?.label}>
                    {resource?.label ?? load.resourceId}
                  </span>
                  <span className="tabular-nums">
                    {capacity == null ? scheduled : labels.scheduledOf(scheduled, capacity)}
                  </span>
                  {over ? <span>{labels.overCapacity(labels.hours(formatHoursFromMs(load.overMs, locale)))}</span> : null}
                </li>
              )
            })}
          </ul>
        </section>
      ) : null}
      <p className="sr-only">{labels.shortcuts}</p>
      {readOnly ? <p className="px-3 pt-2 text-xs text-muted-foreground">{labels.readOnlyNote}</p> : null}
      <div className="flex min-h-0 flex-1">
        <div className="flex min-w-0 flex-1 flex-col">
          {loading ? (
            <div className="grid gap-2 p-3" aria-busy="true">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-64 w-full" />
              <p className="text-sm text-muted-foreground">{labels.loadingLabel}</p>
            </div>
          ) : null}
          {error ? (
            <div role="alert" className="grid justify-items-start gap-2 p-4">
              <p className="font-medium">{labels.errorTitle}</p>
              <p className="text-sm text-muted-foreground">{error}</p>
              {onRetry ? (
                <Button type="button" variant="outline" size="sm" onClick={onRetry}>
                  {labels.retry}
                </Button>
              ) : null}
            </div>
          ) : null}
          {showGrid && events.length === 0 ? (
            <p className="px-3 pt-3 text-sm">
              {labels.emptyTitle}
              <span className="text-muted-foreground"> {labels.emptyHint}</span>
            </p>
          ) : null}
          {showGrid && events.length > 0 && shown.length === 0 ? (
            <p className="px-3 pt-3 text-sm">
              {labels.noMatchesTitle}
              <span className="text-muted-foreground"> {resourceId ? labels.noResourceMatchesHint : labels.noMatchesHint}</span>
            </p>
          ) : null}
          {showGrid && resourceList ? (
            <ResourceDayList
              resources={resources}
              events={shown}
              categoryById={categoryById}
              labels={labels}
              locale={locale}
              timeZone={timeZone}
              now={clock}
              readOnly={readOnly}
              snapMinutes={snapMinutes}
              selectedId={selectedId}
              eventClassName={eventClassName}
              conflictText={conflictText}
              onSelect={select}
              onReschedule={reschedule}
              onEdit={onEdit ? editEvent : undefined}
              onDuplicate={onDuplicate ? duplicateEvent : undefined}
              onDelete={onDelete ? deleteEvent : undefined}
            />
          ) : null}
          {showGrid && listWeek && !resourceList ? (
            <WeekList
              dates={visibleDates("week", anchor, weekStartsOn)}
              events={shown}
              categoryById={categoryById}
              labels={labels}
              locale={locale}
              timeZone={timeZone}
              now={clock}
              readOnly={readOnly}
              snapMinutes={snapMinutes}
              selectedId={selectedId}
              eventClassName={eventClassName}
              detail={detail}
              conflictText={conflictText}
              onSelect={select}
              onReschedule={reschedule}
              holidays={holidays}
              onEdit={onEdit ? editEvent : undefined}
              onDuplicate={onDuplicate ? duplicateEvent : undefined}
              onDelete={onDelete ? deleteEvent : undefined}
            />
          ) : null}
          {showGrid && !listWeek && view !== "month" && !resourceList ? (
            <TimeGrid
              dates={visibleDates(view, anchor, weekStartsOn)}
              events={shown}
              resourceLanes={resourceColumns ? resources : undefined}
              conflictText={conflictText}
              categoryById={categoryById}
              labels={labels}
              locale={locale}
              timeZone={timeZone}
              now={clock}
              hourStart={hourStart}
              hourEnd={hourEnd}
              hourHeight={hourHeight}
              snapMinutes={snapMinutes}
              readOnly={readOnly}
              reduced={reduced}
              rangeLabel={range}
              selectedId={selectedId}
              className={gridClassName}
              eventClassName={eventClassName}
              onSelect={select}
              onReschedule={reschedule}
              onCreate={requestCreate}
              holidays={holidays}
              onEdit={onEdit ? editEvent : undefined}
              onDuplicate={onDuplicate ? duplicateEvent : undefined}
              onDelete={onDelete ? deleteEvent : undefined}
            />
          ) : null}
          {showGrid && view === "month" ? (
            <MonthGrid
              anchor={anchor}
              events={shown}
              categoryById={categoryById}
              labels={labels}
              locale={locale}
              timeZone={timeZone}
              weekStartsOn={weekStartsOn}
              now={clock}
              readOnly={readOnly}
              snapMinutes={snapMinutes}
              selectedId={selectedId}
              rangeLabel={range}
              className={gridClassName}
              eventClassName={eventClassName}
              onSelect={select}
              onReschedule={reschedule}
              onAnchorChange={setAnchor}
              onViewChange={setView}
              conflictText={conflictText}
              holidays={holidays}
              onEdit={onEdit ? editEvent : undefined}
              onDuplicate={onDuplicate ? duplicateEvent : undefined}
              onDelete={onDelete ? deleteEvent : undefined}
            />
          ) : null}
        </div>
        {!narrow && view !== "month" && selected ? (
          <aside
            data-slot="agenda-detail-panel"
            aria-label={selected.title}
            className="flex w-80 min-h-0 shrink-0 flex-col overflow-y-auto border-s border-border bg-card"
          >
            <h3 className="px-3 pt-3 text-sm font-semibold break-words" dir="auto">
              {selected.title}
            </h3>
            {detail}
          </aside>
        ) : null}
        {narrow ? null : sidebar}
      </div>
      {narrow ? (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="right" className="w-full sm:max-w-sm">
            <SheetHeader>
              <SheetTitle>{labels.sidebarLabel}</SheetTitle>
              <SheetDescription className="sr-only">{labels.subtitle}</SheetDescription>
            </SheetHeader>
            {sidebarOpen ? sidebar : null}
          </SheetContent>
        </Sheet>
      ) : null}
      {view === "month" && selected ? (
        <Sheet open onOpenChange={(open) => { if (!open) select(null) }}>
          <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-md">
            <SheetHeader>
              <SheetTitle className="pe-8 break-words" dir="auto">{selected.title}</SheetTitle>
              <SheetDescription className="sr-only">{labels.detailTab}</SheetDescription>
            </SheetHeader>
            {detail}
          </SheetContent>
        </Sheet>
      ) : null}
      <div data-slot="agenda-announcement" role="status" aria-live="polite" className="sr-only">
        {announcement}
      </div>
    </div>
  )
}

function HolidayNotes({ date, holidays, labels }: { date: string; holidays: readonly AgendaHoliday[]; labels: AgendaLabels }) {
  const marks = holidays.filter((holiday) => holiday.date === date)
  if (marks.length === 0) return null
  return (
    <>
      {marks.map((holiday) => (
        <p key={`${holiday.date}-${holiday.title}`} className="rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-foreground">
          {labels.holiday(holiday.title)}
        </p>
      ))}
    </>
  )
}

function TimeGrid<TMeta extends Record<string, unknown>>({
  dates,
  events,
  categoryById,
  labels,
  locale,
  timeZone,
  now,
  hourStart,
  hourEnd,
  hourHeight,
  snapMinutes,
  readOnly,
  reduced,
  rangeLabel,
  selectedId,
  className,
  eventClassName,
  onSelect,
  onReschedule,
  onCreate,
  holidays = [],
  onEdit,
  onDuplicate,
  onDelete,
  resourceLanes,
  conflictText,
}: {
  dates: string[]
  events: readonly AgendaEvent<TMeta>[]
  categoryById: Map<string, AgendaCategory>
  labels: AgendaLabels
  locale: string
  timeZone: string
  now: number | null
  hourStart: number
  hourEnd: number
  hourHeight: number
  snapMinutes: number
  readOnly: boolean
  reduced: boolean
  rangeLabel: string
  selectedId: string | null
  className?: string | undefined
  eventClassName?: string | undefined
  onSelect: (id: string | null) => void
  onReschedule: (id: string, move: AgendaMove, source: AgendaChangeSource) => void
  onCreate: (draft: AgendaEventDraft) => void
  holidays?: readonly AgendaHoliday[]
  onEdit?: ((event: AgendaEvent<TMeta>) => void) | undefined
  onDuplicate?: ((event: AgendaEvent<TMeta>) => void) | undefined
  onDelete?: ((event: AgendaEvent<TMeta>) => void) | undefined
  resourceLanes?: readonly AgendaResource[] | undefined
  conflictText?: ((id: string) => string | null) | undefined
}) {
  const scroller = React.useRef<HTMLDivElement>(null)
  const hours = Array.from({ length: Math.max(hourEnd - hourStart, 1) }, (_, index) => hourStart + index)
  const today = now == null ? "" : calendarDate(now, timeZone)
  const resourceMode = Boolean(resourceLanes && resourceLanes.length > 0)
  const day = dates[0] ?? ""
  const lanes = resourceMode
    ? [
        ...(resourceLanes ?? []).map((resource) => ({
          key: resource.id,
          date: day,
          resource: true,
          label: resource.label,
          weekday: "",
          dayNumber: "",
          today: day === today,
        })),
        ...(events.some((event) => !event.resourceId)
          ? [
              {
                key: "__unassigned",
                date: day,
                resource: true,
                label: labels.unassignedResource,
                weekday: "",
                dayNumber: "",
                today: day === today,
              },
            ]
          : []),
      ]
    : dates.map((date) => {
        const heading = formatDayHeading(date, locale)
        return {
          key: date,
          date,
          resource: false,
          label: heading.full,
          weekday: heading.weekday,
          dayNumber: heading.day,
          today: date === today,
        }
      })
  const todayKey = (lanes.find((lane) => lane.today) ?? lanes[0])?.key ?? ""
  const [slot, setSlot] = React.useState(`${todayKey}:${hourStart}`)
  const drag = React.useRef<{
    kind: "move" | "resize" | "create"
    id?: string
    y: number
    date: string
    minute: number
  } | null>(null)
  const zone = now == null ? timeZone : formatTimeZoneShort(now, timeZone, locale)
  function laneEvents(lane: (typeof lanes)[number]) {
    if (!lane.resource) return events
    if (lane.key === "__unassigned") return events.filter((event) => !event.resourceId)
    return events.filter((event) => event.resourceId === lane.key)
  }
  const segments = lanes.flatMap((lane) =>
    laneEvents(lane).flatMap((event) =>
      segmentsForEvent(event, timeZone, [lane.date]).map((segment) => ({ ...segment, date: lane.key })),
    ),
  )
  const boxes = layoutTimedSegments(segments, hourStart, hourEnd)
  const track = resourceMode ? `minmax(${RESOURCE_COLUMN_MIN}, 1fr)` : "minmax(0, 1fr)"
  const columns = `${GUTTER} repeat(${Math.max(lanes.length, 1)}, ${track})`
  const boardWidth = resourceMode ? `calc(${GUTTER} + ${lanes.length} * ${RESOURCE_COLUMN_MIN})` : undefined
  const nowMinute = now == null ? null : clockMinutes(now, timeZone)
  const nowTop = nowMinute == null ? null : (nowMinute - hourStart * 60) / ((hourEnd - hourStart) * 60)
  const showNow = Boolean(today && dates.includes(today) && nowTop != null && nowTop >= 0 && nowTop <= 1)
  const dateKey = dates.join("|")

  React.useLayoutEffect(() => {
    const node = scroller.current
    if (!node || nowTop == null || nowTop < 0 || !showNow) return
    const y = nowTop * (hours.length * hourHeight)
    if (y > node.clientHeight * 0.7) node.scrollTop = Math.max(0, y - node.clientHeight * 0.35)
  }, [dateKey, hourHeight, hours.length, nowTop, showNow])

  function minuteFromClientY(clientY: number) {
    const node = scroller.current
    if (!node) return hourStart * 60
    const rect = node.getBoundingClientRect()
    const offset = clientY - rect.top + node.scrollTop
    const raw = hourStart * 60 + (offset / hourHeight) * 60
    const snapped = Math.round(raw / snapMinutes) * snapMinutes
    return Math.min(Math.max(snapped, hourStart * 60), hourEnd * 60 - snapMinutes)
  }

  function eventCard(event: AgendaEvent<TMeta>, options: { continuesBefore?: boolean; continuesAfter?: boolean; density?: "regular" | "compact" }) {
    return (
      <AgendaEventCard<TMeta>
        event={event}
        category={categoryById.get(event.categoryId ?? "") ?? null}
        locale={locale}
        timeZone={timeZone}
        labels={labels}
        ongoing={now != null && isEventOngoing(event, now)}
        selected={event.id === selectedId}
        readOnly={readOnly}
        snapMinutes={snapMinutes}
        continuesBefore={options.continuesBefore}
        continuesAfter={options.continuesAfter}
        conflictLabel={conflictText?.(event.id) ?? null}
        density={options.density}
        onSelect={onSelect}
        onReschedule={onReschedule}
        onEdit={onEdit ? () => onEdit(event) : undefined}
        onDuplicate={onDuplicate ? () => onDuplicate(event) : undefined}
        onDelete={onDelete ? () => onDelete(event) : undefined}
        className={eventClassName}
      />
    )
  }

  return (
    <div
      role="grid"
      aria-label={labels.gridLabel(rangeLabel)}
      aria-rowcount={hours.length + 2}
      aria-colcount={lanes.length + 1}
      data-resource-column-min={resourceMode ? RESOURCE_COLUMN_MIN : undefined}
      className={cn("flex min-h-0 flex-1 flex-col", resourceMode && "overflow-x-auto", className)}
    >
      <div className="flex min-h-0 min-w-0 flex-1 flex-col" style={boardWidth ? { minWidth: boardWidth } : undefined}>
      <div role="row" className="grid border-b border-border" style={{ gridTemplateColumns: columns }}>
        <div role="columnheader" data-slot="agenda-timezone" className={cn("px-2 py-2 text-[11px] text-muted-foreground", resourceMode && "sticky start-0 z-10 bg-background")}>
          {zone}
        </div>
        {lanes.map((lane) =>
          lane.resource ? (
            <div key={lane.key} role="columnheader" aria-label={lane.label} title={lane.label} className="min-w-0 px-2 py-2 text-start">
              <div data-slot="agenda-resource-label" className="truncate text-xs font-medium">
                {lane.label}
              </div>
            </div>
          ) : (
            <div
              key={lane.key}
              role="columnheader"
              aria-current={lane.today ? "date" : undefined}
              aria-label={lane.label}
              className={cn("px-1 py-2 text-center", lane.today && "bg-accent")}
            >
              <div className="text-[11px] text-muted-foreground">{lane.weekday}</div>
              <div
                className={cn(
                  "mx-auto mt-0.5 grid size-7 place-items-center rounded-full text-sm tabular-nums",
                  lane.today && "bg-primary font-medium text-primary-foreground",
                )}
              >
                {lane.dayNumber}
              </div>
            </div>
          ),
        )}
      </div>
      <div role="row" className="grid border-b border-border" style={{ gridTemplateColumns: columns }}>
        <div role="rowheader" className={cn("px-2 py-1 text-[11px] text-muted-foreground", resourceMode && "sticky start-0 z-10 bg-background")}>
          {labels.allDay}
          {resourceMode ? <HolidayNotes date={day} holidays={holidays} labels={labels} /> : null}
        </div>
        {lanes.map((lane) => {
          const extras = segments.filter((segment) => segment.date === lane.key && (segment.allDay || outsideWindow(segment, hourStart, hourEnd)))
          return (
            <div key={lane.key} role="gridcell" className={cn("min-h-8 border-s border-border p-1", lane.today && "bg-accent/40")}>
              <div className="grid gap-1">
                {lane.resource ? null : <HolidayNotes date={lane.date} holidays={holidays} labels={labels} />}
                {extras.map((segment) => {
                  const event = events.find((item) => item.id === segment.eventId)
                  if (!event) return null
                  const outside = outsideWindow(segment, hourStart, hourEnd)
                  return (
                    <div key={`${segment.eventId}-${outside ?? "all"}`}>
                      {outside ? (
                        <p className="text-[10px] text-muted-foreground">{outside === "before" ? labels.beforeHours : labels.afterHours}</p>
                      ) : null}
                      {eventCard(event, {
                        density: "compact",
                        continuesBefore: segment.continuesBefore,
                        continuesAfter: segment.continuesAfter,
                      })}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
      <div ref={scroller} className={cn("relative min-h-0 flex-1", resourceMode ? "overflow-x-hidden overflow-y-auto" : "overflow-auto")}>
        <div className="relative" style={{ height: hours.length * hourHeight }}>
          {hours.map((hour) => (
            <div key={hour} role="row" className="grid border-b border-border" style={{ gridTemplateColumns: columns, height: hourHeight }}>
              <div role="rowheader" className={cn("pe-2 pt-1 text-end text-[11px] text-muted-foreground tabular-nums", resourceMode && "sticky start-0 z-10 bg-background")}>
                {nominalHour(hour, locale)}
              </div>
              {lanes.map((lane, column) => {
                const gap = isGapHour(lane.date, hour, timeZone)
                return (
                  <div
                    key={lane.key}
                    role="gridcell"
                    data-date={lane.date}
                    data-lane={lane.key}
                    data-hour={hour}
                    data-gap={gap ? "true" : "false"}
                    tabIndex={slot === `${lane.key}:${hour}` ? 0 : -1}
                    aria-label={labels.slotLabel(lane.resource ? lane.label : formatDayHeading(lane.date, locale).full, nominalHour(hour, locale))}
                    aria-disabled={gap || undefined}
                    className={cn(
                      "border-s border-border focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      lane.today && "bg-accent/40",
                      gap && "bg-muted",
                    )}
                    title={gap ? labels.gapHour : undefined}
                    onKeyDown={(native) => {
                      let nextColumn = column
                      let nextHour = hour
                      if (native.key === "ArrowRight") nextColumn = Math.min(lanes.length - 1, column + 1)
                      else if (native.key === "ArrowLeft") nextColumn = Math.max(0, column - 1)
                      else if (native.key === "ArrowDown") nextHour = Math.min(hourEnd - 1, hour + 1)
                      else if (native.key === "ArrowUp") nextHour = Math.max(hourStart, hour - 1)
                      else if (native.key === "Enter" && !readOnly && !gap) {
                        native.preventDefault()
                        const start = instantOnDate(lane.date, hour * 60, timeZone)
                        onCreate({
                          startsAt: new Date(start.instant).toISOString(),
                          endsAt: new Date(start.instant + snapMinutes * 60_000).toISOString(),
                        })
                        return
                      } else return
                      const nextLane = lanes[nextColumn]
                      if (!nextLane || (nextLane.key === lane.key && nextHour === hour)) return
                      native.preventDefault()
                      setSlot(`${nextLane.key}:${nextHour}`)
                      const next = native.currentTarget.closest("[role=grid]")?.querySelector<HTMLElement>(
                        `[data-lane="${nextLane.key}"][data-hour="${nextHour}"]`,
                      )
                      next?.focus()
                    }}
                    onPointerDown={(native) => {
                      if (readOnly || gap || native.button !== 0) return
                      drag.current = { kind: "create", y: native.clientY, date: lane.date, minute: minuteFromClientY(native.clientY) }
                      native.currentTarget.setPointerCapture(native.pointerId)
                    }}
                    onPointerUp={(native) => {
                      const state = drag.current
                      drag.current = null
                      if (!state || state.kind !== "create") return
                      const endMinute = Math.max(minuteFromClientY(native.clientY), state.minute + snapMinutes)
                      if (Math.abs(native.clientY - state.y) < 6) return
                      const start = instantOnDate(state.date, state.minute, timeZone)
                      const end = instantOnDate(state.date, endMinute, timeZone)
                      onCreate({
                        startsAt: new Date(start.instant).toISOString(),
                        endsAt: new Date(Math.max(end.instant, start.instant + snapMinutes * 60_000)).toISOString(),
                      })
                    }}
                  />
                )
              })}
            </div>
          ))}
          <div className="pointer-events-none absolute inset-0 grid" style={{ gridTemplateColumns: columns }}>
            <div />
            {lanes.map((lane) => {
              const laneBoxes = boxes.filter((box) => box.date === lane.key)
              const crowded = laneBoxes.some((box) => box.columns > 2)
              if (crowded) {
                return (
                  <div key={lane.key} className="pointer-events-auto relative overflow-y-auto p-1">
                    <div className="grid gap-1">
                      {laneBoxes.map((box) => {
                        const event = events.find((item) => item.id === box.eventId)
                        if (!event) return null
                        return (
                          <div key={event.id} className="min-w-0">
                            {eventCard(event, { continuesBefore: box.continuesBefore, continuesAfter: box.continuesAfter })}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              }
              return (
              <div key={lane.key} className="relative">
                {laneBoxes.map((box) => {
                    const event = events.find((item) => item.id === box.eventId)
                    if (!event) return null
                    const selected = event.id === selectedId
                    const frame = selected ? { ...box, inlineStart: 0, inlineSize: 1 } : box
                    return (
                      <EventFrame
                        key={event.id}
                        box={frame}
                        selected={selected}
                        readOnly={readOnly}
                        hourHeight={hourHeight}
                        snapMinutes={snapMinutes}
                        timeZone={timeZone}
                        event={event}
                        onReschedule={onReschedule}
                      >
                        {eventCard(event, { continuesBefore: box.continuesBefore, continuesAfter: box.continuesAfter })}
                      </EventFrame>
                    )
                  })}
              </div>
              )
            })}
          </div>
          {showNow && now != null && nowTop != null ? (
            <div
              data-slot="agenda-now"
              className="pointer-events-none absolute z-30"
              style={{ top: `${nowTop * 100}%`, insetInlineStart: 0, insetInlineEnd: 0 }}
            >
              <span className="absolute start-1 z-10 -translate-y-1/2 rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-primary-foreground shadow-sm tabular-nums">
                {formatClock(now, timeZone, locale)}
              </span>
              <span
                className={cn("absolute top-0 h-0.5 bg-primary", !reduced && "motion-safe:transition-none")}
                style={{ insetInlineStart: GUTTER, insetInlineEnd: 0 }}
              />
              <span
                className="absolute size-2 -translate-y-1/2 rounded-full bg-primary"
                style={{
                  insetInlineStart: `calc(${GUTTER} + (100% - ${GUTTER}) * ${Math.max(lanes.findIndex((lane) => lane.today), 0)} / ${Math.max(lanes.length, 1)})`,
                }}
              />
              <span className="sr-only">
                {labels.now}, {formatClock(now, timeZone, locale)}
              </span>
            </div>
          ) : null}
        </div>
      </div>
      </div>
    </div>
  )
}

function EventFrame<TMeta extends Record<string, unknown>>({
  box,
  selected,
  readOnly,
  hourHeight,
  snapMinutes,
  timeZone,
  event,
  onReschedule,
  children,
}: {
  box: EventBox
  selected: boolean
  readOnly: boolean
  hourHeight: number
  snapMinutes: number
  timeZone: string
  event: AgendaEvent<TMeta>
  onReschedule: (id: string, move: AgendaMove, source: AgendaChangeSource) => void
  children: React.ReactNode
}) {
  const drag = React.useRef<{ kind: "move" | "resize"; x: number; y: number } | null>(null)

  return (
    <div
      data-column={box.column}
      className="pointer-events-auto absolute"
      style={{
        top: `${box.top * 100}%`,
        height: `${box.height * 100}%`,
        minHeight: `max(${box.height * 100}%, 1.75rem)`,
        insetInlineStart: `calc(${box.inlineStart * 100}% + 2px)`,
        width: `calc(${box.inlineSize * 100}% - 4px)`,
        zIndex: selected ? 20 : 1,
      }}
      onPointerDown={(native) => {
        if (readOnly || native.button !== 0) return
        const target = native.target as HTMLElement
        const resize = Boolean(target.closest("[data-agenda-resize]"))
        if (!resize && target.closest("[data-agenda-ignore-drag]")) return
        drag.current = { kind: resize ? "resize" : "move", y: native.clientY, x: native.clientX }
        native.currentTarget.setPointerCapture(native.pointerId)
      }}
      onPointerUp={(native) => {
        const state = drag.current
        drag.current = null
        if (!state) return
        const movedPointer = Math.abs(native.clientY - state.y) >= 4 || Math.abs(native.clientX - (state.x ?? native.clientX)) >= 4
        if (!movedPointer) return
        const raw = ((native.clientY - state.y) / hourHeight) * 60
        const minutes = Math.round(raw / snapMinutes) * snapMinutes
        const fromPoint = typeof document.elementFromPoint === "function" ? document.elementFromPoint(native.clientX, native.clientY) : null
        const targetDate = fromPoint?.closest("[data-date]")?.getAttribute("data-date")
        const originDate = calendarDate(Date.parse(event.startsAt), timeZone)
        if (minutes === 0 && (!targetDate || targetDate === originDate)) return
        if (state.kind === "resize") {
          onReschedule(event.id, resizeEventEnd(event, minutes, snapMinutes, timeZone), "resize")
          return
        }
        const moved = targetDate ? moveToDateKeepingClock(event, targetDate, timeZone) : event
        onReschedule(event.id, shiftClock(moved, minutes, timeZone), "move")
      }}
      onKeyDown={(native) => {
        if (native.key === "Escape") drag.current = null
      }}
    >
      {children}
    </div>
  )
}

function WeekList<TMeta extends Record<string, unknown>>({
  dates,
  events,
  categoryById,
  labels,
  locale,
  timeZone,
  now,
  readOnly,
  snapMinutes,
  selectedId,
  eventClassName,
  detail,
  conflictText,
  onSelect,
  onReschedule,
  holidays = [],
  onEdit,
  onDuplicate,
  onDelete,
}: {
  dates: string[]
  events: readonly AgendaEvent<TMeta>[]
  categoryById: Map<string, AgendaCategory>
  labels: AgendaLabels
  locale: string
  timeZone: string
  now: number | null
  readOnly: boolean
  snapMinutes: number
  selectedId: string | null
  eventClassName?: string | undefined
  detail: React.ReactNode
  conflictText?: ((id: string) => string | null) | undefined
  onSelect: (id: string | null) => void
  onReschedule: (id: string, move: AgendaMove, source: AgendaChangeSource) => void
  holidays?: readonly AgendaHoliday[]
  onEdit?: ((event: AgendaEvent<TMeta>) => void) | undefined
  onDuplicate?: ((event: AgendaEvent<TMeta>) => void) | undefined
  onDelete?: ((event: AgendaEvent<TMeta>) => void) | undefined
}) {
  return (
    <div role="list" aria-label={labels.listLabel} className="min-h-0 flex-1 overflow-auto p-3">
      <div className="grid gap-4">
        {dates.map((date) => {
          const heading = formatDayHeading(date, locale)
          const dayEvents = events.filter((event) => segmentsForEvent(event, timeZone, [date]).length > 0)
          return (
            <section key={date} aria-label={heading.full} className="grid gap-2">
              <h3 className="text-sm font-medium">{heading.full}</h3>
              <HolidayNotes date={date} holidays={holidays} labels={labels} />
              {dayEvents.length === 0 ? <p className="text-xs text-muted-foreground">{labels.emptyHint}</p> : null}
              <div className="grid gap-2">
                {dayEvents.map((event) => (
                  <div key={event.id} role="listitem">
                    <AgendaEventCard<TMeta>
                      event={event}
                      category={categoryById.get(event.categoryId ?? "") ?? null}
                      locale={locale}
                      timeZone={timeZone}
                      labels={labels}
                      ongoing={now != null && isEventOngoing(event, now)}
                      selected={event.id === selectedId}
                      readOnly={readOnly}
                      snapMinutes={snapMinutes}
                      conflictLabel={conflictText?.(event.id) ?? null}
                      onSelect={onSelect}
                      onReschedule={onReschedule}
                      onEdit={onEdit ? () => onEdit(event) : undefined}
                      onDuplicate={onDuplicate ? () => onDuplicate(event) : undefined}
                      onDelete={onDelete ? () => onDelete(event) : undefined}
                      className={eventClassName}
                    >
                      {event.id === selectedId ? detail : null}
                    </AgendaEventCard>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function MonthGrid<TMeta extends Record<string, unknown>>({
  anchor,
  events,
  categoryById,
  labels,
  locale,
  timeZone,
  weekStartsOn,
  now,
  readOnly,
  snapMinutes,
  selectedId,
  rangeLabel,
  className,
  eventClassName,
  onSelect,
  onReschedule,
  onAnchorChange,
  onViewChange,
  holidays = [],
  onEdit,
  onDuplicate,
  onDelete,
  conflictText,
}: {
  anchor: string
  events: readonly AgendaEvent<TMeta>[]
  categoryById: Map<string, AgendaCategory>
  labels: AgendaLabels
  locale: string
  timeZone: string
  weekStartsOn: number
  now: number | null
  readOnly: boolean
  snapMinutes: number
  selectedId: string | null
  rangeLabel: string
  className?: string | undefined
  eventClassName?: string | undefined
  onSelect: (id: string | null) => void
  onReschedule: (id: string, move: AgendaMove, source: AgendaChangeSource) => void
  onAnchorChange: (anchor: string) => void
  onViewChange: (view: AgendaView) => void
  holidays?: readonly AgendaHoliday[]
  onEdit?: ((event: AgendaEvent<TMeta>) => void) | undefined
  onDuplicate?: ((event: AgendaEvent<TMeta>) => void) | undefined
  onDelete?: ((event: AgendaEvent<TMeta>) => void) | undefined
  conflictText?: ((id: string) => string | null) | undefined
}) {
  const cells = monthGrid(anchor, weekStartsOn)
  const weeks = Array.from({ length: 6 }, (_, index) => cells.slice(index * 7, index * 7 + 7))
  const today = now == null ? "" : calendarDate(now, timeZone)
  const labelsOfWeek = weekdayLabels(locale, weekStartsOn)
  const drag = React.useRef<{ id: string } | null>(null)

  return (
    <div role="grid" aria-label={labels.gridLabel(rangeLabel)} aria-rowcount={6} aria-colcount={7} className={cn("min-h-0 flex-1 overflow-auto p-2", className)}>
      <div role="row" className="grid grid-cols-7">
        {labelsOfWeek.map((label) => (
          <div key={label} role="columnheader" className="px-2 py-1 text-center text-[11px] text-muted-foreground">
            {label}
          </div>
        ))}
      </div>
      {weeks.map((week) => (
        <div key={week[0]?.iso} role="row" className="grid grid-cols-7 border-t border-border">
          {week.map((cell) => {
            const heading = formatDayHeading(cell.iso, locale)
            const dayEvents = events.filter((event) => segmentsForEvent(event, timeZone, [cell.iso]).length > 0)
            const shown = dayEvents.slice(0, 3)
            const rest = dayEvents.length - shown.length
            return (
              <div
                key={cell.iso}
                role="gridcell"
                data-date={cell.iso}
                className={cn("min-h-24 border-s border-border p-1", !cell.inMonth && "bg-muted/40", cell.iso === today && "bg-accent/40")}
                onPointerUp={() => {
                  const state = drag.current
                  drag.current = null
                  if (!state || readOnly) return
                  const event = events.find((item) => item.id === state.id)
                  if (!event) return
                  onReschedule(event.id, moveToDateKeepingClock(event, cell.iso, timeZone), "move")
                }}
              >
                <button
                  type="button"
                  className={cn(
                    "mb-1 grid size-6 place-items-center rounded-full text-xs tabular-nums focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                    cell.iso === today && "bg-primary text-primary-foreground",
                  )}
                  aria-label={heading.full}
                  aria-current={cell.iso === today ? "date" : undefined}
                  onClick={() => {
                    onAnchorChange(cell.iso)
                    onViewChange("day")
                  }}
                >
                  {heading.day}
                </button>
                <div className="grid gap-1">
                  <HolidayNotes date={cell.iso} holidays={holidays} labels={labels} />
                  {shown.map((event) => (
                    <div
                      key={event.id}
                      onPointerDown={() => {
                        drag.current = { id: event.id }
                      }}
                    >
                      <AgendaEventCard<TMeta>
                        event={event}
                        category={categoryById.get(event.categoryId ?? "") ?? null}
                        locale={locale}
                        timeZone={timeZone}
                        labels={labels}
                        ongoing={now != null && isEventOngoing(event, now)}
                        selected={event.id === selectedId}
                        readOnly={readOnly}
                        snapMinutes={snapMinutes}
                        density="compact"
                        conflictLabel={conflictText?.(event.id) ?? null}
                        onSelect={onSelect}
                        onReschedule={onReschedule}
                        onEdit={onEdit ? () => onEdit(event) : undefined}
                        onDuplicate={onDuplicate ? () => onDuplicate(event) : undefined}
                        onDelete={onDelete ? () => onDelete(event) : undefined}
                        className={eventClassName}
                      />
                    </div>
                  ))}
                  {rest > 0 ? (
                    <button
                      type="button"
                      className="text-start text-[11px] text-muted-foreground underline-offset-2 hover:underline"
                      onClick={() => {
                        onAnchorChange(cell.iso)
                        onViewChange("day")
                      }}
                    >
                      {labels.more(rest)}
                    </button>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

function AgendaSidebar<TMeta extends Record<string, unknown>>({
  labels,
  locale,
  timeZone,
  anchor,
  weekStartsOn,
  categories,
  hidden,
  events,
  now,
  syncing,
  readOnly,
  className,
  onAnchorChange,
  onToggleCategory,
  onSync,
  onCreate,
  onSelect,
}: {
  labels: AgendaLabels
  locale: string
  timeZone: string
  anchor: string
  weekStartsOn: number
  categories: readonly AgendaCategory[]
  hidden: readonly string[]
  events: readonly AgendaEvent<TMeta>[]
  now: number | null
  syncing: boolean
  readOnly: boolean
  className?: string | undefined
  onAnchorChange: (anchor: string) => void
  onToggleCategory: (id: string, shown: boolean) => void
  onSync?: (() => void | Promise<void>) | undefined
  onCreate: () => void
  onSelect: (id: string) => void
}) {
  const anchorMonth = anchor.slice(0, 7)
  const [paged, setPaged] = React.useState<{ month: string; cursor: string } | null>(null)
  const mini = paged && paged.month === anchorMonth ? paged.cursor : anchor
  const cells = monthGrid(mini, weekStartsOn)
  const weeks = Array.from({ length: 6 }, (_, index) => cells.slice(index * 7, index * 7 + 7))
  const today = now == null ? "" : calendarDate(now, timeZone)
  const monthName = formatRangeLabel("month", mini, locale)
  const upcoming = now == null ? [] : upcomingEvents(events, now, [])
  const attention = now == null ? [] : attentionEvents(events, now, [])

  return (
    <aside data-slot="agenda-sidebar" aria-label={labels.sidebarLabel} className={cn("flex h-full min-h-0 w-72 shrink-0 flex-col overflow-hidden border-s border-border", className)}>
      <ScrollArea className="min-h-0 flex-1">
        <div className="grid gap-4 p-3">
          {onSync ? (
            <Button type="button" variant="outline" disabled={syncing} onClick={() => void onSync()}>
              <RefreshCw aria-hidden />
              {syncing ? labels.syncing : labels.sync}
            </Button>
          ) : null}
          <Button type="button" disabled={readOnly} onClick={onCreate}>
            <Plus aria-hidden />
            {labels.newEvent}
          </Button>
          <div className="grid gap-2">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-medium capitalize">{monthName}</p>
              <div className="flex gap-1">
                <Button type="button" variant="ghost" size="icon-sm" aria-label={labels.previousMonth} onClick={() => setPaged({ month: anchorMonth, cursor: shiftAnchor("month", mini, -1) })}>
                  <ChevronLeft aria-hidden />
                </Button>
                <Button type="button" variant="ghost" size="icon-sm" aria-label={labels.nextMonth} onClick={() => setPaged({ month: anchorMonth, cursor: shiftAnchor("month", mini, 1) })}>
                  <ChevronRight aria-hidden />
                </Button>
              </div>
            </div>
            <div role="grid" aria-label={labels.miniMonthLabel} className="grid grid-cols-7 gap-0.5 text-center">
              {weekdayLabels(locale, weekStartsOn).map((label) => (
                <div key={label} className="text-[10px] text-muted-foreground">
                  {label}
                </div>
              ))}
              {weeks.flat().map((cell) => {
                const heading = formatDayHeading(cell.iso, locale)
                return (
                  <button
                    key={cell.iso}
                    type="button"
                    aria-label={heading.full}
                    aria-current={cell.iso === today ? "date" : undefined}
                    aria-pressed={cell.iso === anchor}
                    className={cn(
                      "grid size-7 place-items-center rounded-full text-xs tabular-nums focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      !cell.inMonth && "text-muted-foreground",
                      cell.iso === today && "bg-primary text-primary-foreground",
                      cell.iso === anchor && cell.iso !== today && "bg-accent",
                    )}
                    onClick={() => onAnchorChange(cell.iso)}
                  >
                    {heading.day}
                  </button>
                )
              })}
            </div>
          </div>
          <Separator />
          <EventPile<TMeta> title={labels.upcoming} empty={labels.noUpcoming} events={upcoming} locale={locale} timeZone={timeZone} categories={categories} onSelect={onSelect} />
          <EventPile<TMeta> title={labels.attention} empty={labels.noAttention} events={attention} locale={locale} timeZone={timeZone} categories={categories} onSelect={onSelect} />
          <Separator />
          <div className="grid gap-2">
            <p className="text-sm font-medium">{labels.categories}</p>
            {categories.map((category) => (
              <div key={category.id} className="flex items-center justify-between gap-2">
                <span className="flex min-w-0 items-center gap-2 text-sm">
                  <AgendaCategoryIcon name={category.icon} className="text-muted-foreground" />
                  <span className="truncate">{category.label}</span>
                </span>
                <Switch
                  checked={!hidden.includes(category.id)}
                  onCheckedChange={(checked) => onToggleCategory(category.id, checked)}
                  aria-label={labels.showCategory(category.label)}
                />
              </div>
            ))}
          </div>
        </div>
      </ScrollArea>
    </aside>
  )
}

function EventPile<TMeta extends Record<string, unknown>>({
  title,
  empty,
  events,
  locale,
  timeZone,
  categories,
  onSelect,
}: {
  title: string
  empty: string
  events: readonly AgendaEvent<TMeta>[]
  locale: string
  timeZone: string
  categories: readonly AgendaCategory[]
  onSelect: (id: string) => void
}) {
  return (
    <section aria-label={title} className="grid gap-2">
      <h3 className="text-sm font-medium">{title}</h3>
      {events.length === 0 ? <p className="text-xs text-muted-foreground">{empty}</p> : null}
      <ul className="grid gap-1.5">
        {events.map((event) => {
          const category = categories.find((item) => item.id === event.categoryId)
          return (
            <li key={event.id}>
              <button
                type="button"
                className="flex w-full items-start gap-2 rounded-md border border-border px-2 py-1.5 text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                onClick={() => onSelect(event.id)}
              >
                <AgendaCategoryIcon name={category?.icon} className="mt-0.5 text-muted-foreground" />
                <span className="min-w-0">
                  <span className="block truncate text-sm" dir="auto">
                    {event.title}
                  </span>
                  <span className="text-[11px] text-muted-foreground tabular-nums">
                    {formatInterval(event.startsAt, event.endsAt, timeZone, locale, event.allDay)}
                  </span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

function nominalHour(hour: number, locale: string) {
  return new Intl.DateTimeFormat(locale, { hour: "2-digit", minute: "2-digit", timeZone: "UTC" }).format(
    new Date(Date.UTC(2026, 0, 1, hour, 0)),
  )
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const current = value !== undefined ? value : uncontrolled
  const setValue = React.useCallback(
    (next: T) => {
      if (value === undefined) setUncontrolled(next)
      onChange?.(next)
    },
    [onChange, value],
  )
  return [current, setValue] as const
}

function ResourceDayList<TMeta extends Record<string, unknown>>({
  resources,
  events,
  categoryById,
  labels,
  locale,
  timeZone,
  now,
  readOnly,
  snapMinutes,
  selectedId,
  eventClassName,
  conflictText,
  onSelect,
  onReschedule,
  onEdit,
  onDuplicate,
  onDelete,
}: {
  resources: readonly AgendaResource[]
  events: readonly AgendaEvent<TMeta>[]
  categoryById: Map<string, AgendaCategory>
  labels: AgendaLabels
  locale: string
  timeZone: string
  now: number | null
  readOnly: boolean
  snapMinutes: number
  selectedId: string | null
  eventClassName?: string | undefined
  conflictText: (id: string) => string | null
  onSelect: (id: string | null) => void
  onReschedule: (id: string, move: AgendaMove, source: AgendaChangeSource) => void
  onEdit?: ((event: AgendaEvent<TMeta>) => void) | undefined
  onDuplicate?: ((event: AgendaEvent<TMeta>) => void) | undefined
  onDelete?: ((event: AgendaEvent<TMeta>) => void) | undefined
}) {
  const groups = [
    ...resources.map((resource) => ({
      id: resource.id,
      label: resource.label,
      items: events.filter((event) => event.resourceId === resource.id),
    })),
    ...(events.some((event) => !event.resourceId)
      ? [
          {
            id: "__unassigned",
            label: labels.unassignedResource,
            items: events.filter((event) => !event.resourceId),
          },
        ]
      : []),
  ]
  return (
    <div role="list" aria-label={labels.resourceFilter} data-slot="agenda-resource-list" className="min-h-0 flex-1 overflow-auto p-3">
      <div className="grid gap-4">
        {groups.map((group) => (
          <section key={group.id} aria-labelledby={`resource-${group.id.replace(/[^A-Za-z0-9_-]/g, "-")}`} className="grid min-w-0 gap-2">
            <h3 id={`resource-${group.id.replace(/[^A-Za-z0-9_-]/g, "-")}`} className="truncate text-sm font-medium" title={group.label}>
              {group.label}
            </h3>
            {group.items.length === 0 ? <p className="text-xs text-muted-foreground">{labels.emptyHint}</p> : null}
            {group.items.map((event) => (
              <div key={event.id} role="listitem" className="min-w-0">
                <AgendaEventCard<TMeta>
                  event={event}
                  category={categoryById.get(event.categoryId ?? "") ?? null}
                  locale={locale}
                  timeZone={timeZone}
                  labels={labels}
                  ongoing={now != null && isEventOngoing(event, now)}
                  selected={event.id === selectedId}
                  readOnly={readOnly}
                  snapMinutes={snapMinutes}
                  conflictLabel={conflictText(event.id)}
                  onSelect={onSelect}
                  onReschedule={onReschedule}
                  onEdit={onEdit ? () => onEdit(event) : undefined}
                  onDuplicate={onDuplicate ? () => onDuplicate(event) : undefined}
                  onDelete={onDelete ? () => onDelete(event) : undefined}
                  className={eventClassName}
                />
              </div>
            ))}
          </section>
        ))}
      </div>
    </div>
  )
}

function useElementWidth(ref: React.RefObject<HTMLElement | null>) {
  const [width, setWidth] = React.useState(0)
  React.useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    const apply = () => setWidth(node.clientWidth)
    apply()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(apply)
    observer.observe(node)
    return () => observer.disconnect()
  }, [ref])
  return width
}

function useNarrowScreen() {
  const [narrow, setNarrow] = React.useState(false)
  React.useLayoutEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const apply = () => setNarrow(media.matches)
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])
  return narrow
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const apply = () => setReduced(media.matches)
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])
  return reduced
}

function useClock(now: Date | string | undefined) {
  const fixed = now == null ? null : typeof now === "string" ? Date.parse(now) : now.getTime()
  const [ticking, setTicking] = React.useState<number | null>(null)
  React.useEffect(() => {
    if (fixed != null) return
    const kick = window.setTimeout(() => setTicking(Date.now()), 0)
    const id = window.setInterval(() => setTicking(Date.now()), 60_000)
    return () => {
      window.clearTimeout(kick)
      window.clearInterval(id)
    }
  }, [fixed])
  return fixed ?? ticking
}
