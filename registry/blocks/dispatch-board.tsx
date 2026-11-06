"use client"

/**
 * Clean-room resource timeline. Conflict pairs and hour sums stay in the agenda core.
 * The host confirms every assign, move, and resize. A refusal drops the preview.
 * Touch: a tap opens, a long-press drags, and a swipe scrolls (pan-x and pan-y).
 */

import * as React from "react"
import { ChevronLeft, ChevronRight, Download, MoreHorizontal, Search, TriangleAlert } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import {
  calendarDate,
  formatClock,
  formatInterval,
  formatRangeLabel,
  instantOnDate,
  resizeEventEnd,
  shiftAnchor,
  shiftClock,
} from "@/registry/retana/lib/agenda"
import {
  DAY_COLUMN_PX,
  EMPTY_DISPATCH_FILTERS,
  HOUR_COLUMN_PX,
  NAME_WIDTH_PX,
  TOUCH_HOLD_MS,
  boardConflicts,
  boardRows,
  dispatchDates,
  fillTemplate,
  filterBoard,
  formatRatio,
  hourColumns,
  jobToEvent,
  jobsToCsv,
  jobsToJson,
  levelWord,
  minutesFromDelta,
  nowRatio,
  placeAbsences,
  placeResourceJobs,
  reduceGesture,
  resourceInitials,
  resourceOccupancy,
  resolveDispatchLabels,
  rowHeights,
  timelineWidth,
  validatePlacement,
  visibleSlice,
  type AssignRequest,
  type DispatchDecision,
  type DispatchFilters,
  type DispatchLabels,
  type DispatchModel,
  type DispatchRejectReason,
  type DispatchView,
  type Job,
  type OccupancyThreshold,
  type PointerKind,
  type Resource,
  type ResourceOccupancy,
} from "@/registry/retana/lib/dispatch-board"

const STRIPES: React.CSSProperties = {
  backgroundImage:
    "repeating-linear-gradient(-45deg, color-mix(in oklab, var(--foreground) 12%, var(--muted)) 0 7px, var(--muted) 7px 14px)",
}

const TONE_EDGE: Record<string, string> = {
  critical: "border-s-destructive",
  warning: "border-s-foreground",
  info: "border-s-accent-foreground",
  positive: "border-s-primary",
  accent: "border-s-primary",
  neutral: "border-s-border",
}

const RING_TONE: Record<string, string> = {
  critical: "text-destructive",
  warning: "text-chart-4",
  positive: "text-primary",
  info: "text-foreground",
  accent: "text-primary",
  neutral: "text-muted-foreground",
}

export type DispatchExport = { format: "csv" | "json"; body: string; filename: string }

export type DispatchRejection = { reason?: DispatchRejectReason; detail: string; jobId?: string }

export type DispatchBoardProps = {
  model: DispatchModel
  labels?: Partial<DispatchLabels>
  locale?: string
  timeZone?: string
  now?: string | Date
  anchor?: string
  defaultAnchor?: string
  onAnchorChange?: (anchor: string) => void
  view?: DispatchView
  defaultView?: DispatchView
  onViewChange?: (view: DispatchView) => void
  hourStart?: number
  hourEnd?: number
  weekStartsOn?: number
  snapMinutes?: number
  filters?: DispatchFilters
  defaultFilters?: DispatchFilters
  onFiltersChange?: (filters: DispatchFilters) => void
  filtersOpen?: boolean
  defaultFiltersOpen?: boolean
  readOnly?: boolean
  loading?: boolean
  error?: string
  onRetry?: () => void
  onBack?: () => void
  onAssignRequest?: (request: AssignRequest) => Promise<DispatchDecision> | DispatchDecision
  onMoveRequest?: (request: AssignRequest) => Promise<DispatchDecision> | DispatchDecision
  onResizeRequest?: (request: AssignRequest) => Promise<DispatchDecision> | DispatchDecision
  onExport?: (payload: DispatchExport) => void | boolean | Promise<void | boolean>
  onOpenJob?: (jobId: string) => void
  rejection?: DispatchRejection | null
  railOpen?: boolean
  defaultRailOpen?: boolean
  onRailOpenChange?: (open: boolean) => void
  thresholds?: readonly OccupancyThreshold[]
  className?: string
}

export function DispatchBoard({
  model,
  labels: labelOverrides,
  locale = "es-MX",
  timeZone = "America/Mexico_City",
  now,
  anchor: anchorProp,
  defaultAnchor,
  onAnchorChange,
  view: viewProp,
  defaultView = "day",
  onViewChange,
  hourStart = 9,
  hourEnd = 16,
  weekStartsOn = 1,
  snapMinutes = 15,
  filters: filtersProp,
  defaultFilters,
  onFiltersChange,
  filtersOpen: filtersOpenProp,
  defaultFiltersOpen = false,
  readOnly = false,
  loading = false,
  error,
  onRetry,
  onBack,
  onAssignRequest,
  onMoveRequest,
  onResizeRequest,
  onExport,
  onOpenJob,
  rejection = null,
  railOpen: railProp,
  defaultRailOpen = true,
  onRailOpenChange,
  thresholds,
  className,
}: DispatchBoardProps) {
  const labels = resolveDispatchLabels(labelOverrides)
  const [anchor, setAnchor] = useControllable(anchorProp, defaultAnchor ?? "2026-11-04", onAnchorChange)
  const [view, setView] = useControllable(viewProp, defaultView, onViewChange)
  const [filters, setFilters] = useControllable(filtersProp, defaultFilters ?? EMPTY_DISPATCH_FILTERS, onFiltersChange)
  const [filtersOpen, setFiltersOpen] = useControllable(filtersOpenProp, defaultFiltersOpen)
  const [railOpen, setRailOpen] = useControllable(railProp, defaultRailOpen, onRailOpenChange)
  const [draft, setDraft] = React.useState<AssignRequest | null>(null)
  const [localRejection, setLocalRejection] = React.useState<DispatchRejection | null>(null)
  const [live, setLive] = React.useState(labels.keyboardHint)
  const [selectedId, setSelectedId] = React.useState<string | null>(null)
  const [scrollTop, setScrollTop] = React.useState(0)
  const [viewport, setViewport] = React.useState(640)
  const [canScrollNext, setCanScrollNext] = React.useState(true)
  const reduced = usePrefersReducedMotion()
  const narrow = useNarrowScreen()
  const scrollerRef = React.useRef<HTMLDivElement>(null)
  const searchRef = React.useRef<HTMLInputElement>(null)
  const ticket = React.useRef(0)
  const clock = useClock(now) ?? Date.parse("2026-11-04T19:46:00.000Z")
  const banner = localRejection ?? rejection

  React.useEffect(() => {
    const node = scrollerRef.current
    if (!node) return
    const measure = () => {
      if (node.clientHeight > 0) setViewport(node.clientHeight)
      const next = node.scrollLeft + node.clientWidth < node.scrollWidth - 4
      setCanScrollNext((current) => (current === next ? current : next))
    }
    measure()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [view, railOpen, narrow, loading])

  React.useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.altKey && !event.shiftKey && !event.metaKey && !event.ctrlKey && event.key.toLowerCase() === "k") {
        event.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const dates = React.useMemo(() => dispatchDates(view, anchor, weekStartsOn), [view, anchor, weekStartsOn])
  const jobs = React.useMemo(() => applyDraft(model.jobs, draft), [model.jobs, draft])
  const occupancy = React.useMemo(
    () =>
      resourceOccupancy({
        resources: model.resources,
        jobs,
        absences: model.absences,
        dates,
        hourStart,
        hourEnd,
        timeZone,
        ...(thresholds ? { thresholds } : {}),
      }),
    [model.resources, model.absences, jobs, dates, hourStart, hourEnd, timeZone, thresholds],
  )
  const filtered = React.useMemo(
    () => filterBoard({ groups: model.groups, resources: model.resources, jobs, filters, occupancy }),
    [model.groups, model.resources, jobs, filters, occupancy],
  )
  const rows = React.useMemo(() => boardRows(model.groups, filtered.resources), [model.groups, filtered.resources])
  const lanes = React.useMemo(() => {
    const map = new Map<string, number>()
    for (const resource of filtered.resources) {
      const mine = filtered.jobs.filter((job) => job.resourceId === resource.id)
      if (mine.length < 2) continue
      let count = 1
      for (const item of placeResourceJobs(mine, dates, hourStart, hourEnd, timeZone)) count = Math.max(count, item.lanes)
      if (count > 1) map.set(resource.id, count)
    }
    return map
  }, [filtered.resources, filtered.jobs, dates, hourStart, hourEnd, timeZone])
  const layout = React.useMemo(() => rowHeights(rows, lanes), [rows, lanes])
  const windowed = visibleSlice(layout.offsets, layout.sizes, scrollTop, viewport, 3)
  const conflicts = React.useMemo(() => boardConflicts(filtered.jobs), [filtered.jobs])
  const width = timelineWidth(view, dates, hourStart, hourEnd)
  const hours = hourColumns(hourStart, hourEnd)
  const queue = filtered.jobs.filter((job) => !job.resourceId)
  const heading = formatRangeLabel(view, anchor, locale, weekStartsOn)

  function announce(message: string) {
    setLive(message)
  }

  function showReject(detail: string, reason: DispatchRejectReason | undefined, jobId: string) {
    setLocalRejection({ detail, ...(reason ? { reason } : {}), jobId })
    announce(detail)
  }

  async function commit(kind: "assign" | "move" | "resize", request: AssignRequest) {
    const current = jobs.find((job) => job.id === request.jobId)
    if (!current) return
    if (request.resourceId) {
      const resource = model.resources.find((item) => item.id === request.resourceId)
      if (!resource) return
      const decision = validatePlacement({
        jobId: current.id,
        title: current.title,
        resource,
        startsAt: request.startsAt,
        endsAt: request.endsAt,
        ...(current.skillId != null ? { skillId: current.skillId } : {}),
        jobs,
        absences: model.absences,
        skills: model.skills,
        dates,
        hourStart,
        hourEnd,
        timeZone,
        labels,
      })
      if (!decision.ok) {
        setDraft(null)
        showReject(decision.detail, decision.reason, current.id)
        return
      }
    }
    const id = ticket.current + 1
    ticket.current = id
    setDraft(request)
    setLocalRejection(null)
    const callback = kind === "assign" ? onAssignRequest : kind === "move" ? onMoveRequest : onResizeRequest
    if (!callback) {
      setDraft(null)
      showReject(labels.requestFailed, undefined, request.jobId)
      return
    }
    try {
      const decision = await callback(request)
      if (ticket.current !== id) return
      if (decision && decision.ok === false) {
        setDraft(null)
        showReject(decision.detail, decision.reason, request.jobId)
        return
      }
      announce(kind === "assign" ? labels.assigned : kind === "move" ? labels.moved : labels.resized)
    } catch {
      if (ticket.current !== id) return
      setDraft(null)
      showReject(labels.requestFailed, undefined, request.jobId)
    }
  }

  function onJobKeyDown(event: React.KeyboardEvent<HTMLButtonElement>, job: Job) {
    if (event.altKey || event.metaKey || event.ctrlKey) return
    if (readOnly) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault()
        const buttons = [...document.querySelectorAll<HTMLButtonElement>("[data-dispatch-job]")]
        const index = buttons.findIndex((button) => button.dataset.dispatchJob === job.id)
        buttons[index + (event.key === "ArrowDown" ? 1 : -1)]?.focus()
      }
      return
    }
    const horizontal = event.key === "ArrowRight" ? snapMinutes : event.key === "ArrowLeft" ? -snapMinutes : 0
    if (!horizontal && event.key !== "ArrowUp" && event.key !== "ArrowDown") return
    event.preventDefault()
    if (event.key === "ArrowUp" || event.key === "ArrowDown") {
      const index = filtered.resources.findIndex((resource) => resource.id === job.resourceId)
      const next = filtered.resources[index + (event.key === "ArrowDown" ? 1 : -1)]
      if (!next || !job.resourceId) return
      void commit("assign", { jobId: job.id, resourceId: next.id, startsAt: job.startsAt, endsAt: job.endsAt })
      return
    }
    if (!job.resourceId) return
    const source = jobToEvent(job)
    const moved = event.shiftKey ? resizeEventEnd(source, horizontal, snapMinutes, timeZone) : shiftClock(source, horizontal, timeZone)
    void commit(event.shiftKey ? "resize" : "move", {
      jobId: job.id,
      resourceId: job.resourceId,
      startsAt: moved.startsAt,
      endsAt: moved.endsAt,
    })
  }

  function startGesture(event: React.PointerEvent<HTMLElement>, job: Job, mode: "move" | "resize") {
    if (readOnly || event.button !== 0) return
    const kind: PointerKind = event.pointerType === "mouse" ? "mouse" : "touch"
    const originX = event.clientX
    const originY = event.clientY
    const node = event.currentTarget
    let gesture = reduceGesture({ phase: "idle" }, { type: "down", kind, x: originX, y: originY, selected: selectedId === job.id })
    if (mode === "resize" && kind === "touch") gesture = reduceGesture(gesture.state, { type: "hold" })
    let timer = 0
    if (kind === "touch" && mode === "move") {
      timer = window.setTimeout(() => {
        gesture = reduceGesture(gesture.state, { type: "hold" })
        node.setAttribute("data-gesture", "holding")
      }, TOUCH_HOLD_MS)
    }
    const move = (native: PointerEvent) => {
      const next = reduceGesture(gesture.state, { type: "move", x: native.clientX, y: native.clientY })
      gesture = next
      if (next.state.phase !== "dragging") return
      node.style.pointerEvents = "none"
      node.style.transform = `translate3d(${native.clientX - originX}px, ${native.clientY - originY}px, 0)`
    }
    const up = (native: PointerEvent) => {
      window.clearTimeout(timer)
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      const finished = reduceGesture(gesture.state, { type: "up" })
      node.style.transform = ""
      node.style.pointerEvents = ""
      node.removeAttribute("data-gesture")
      if (finished.effect === "select") {
        setSelectedId(job.id)
        onOpenJob?.(job.id)
        return
      }
      if (finished.effect !== "drag") return
      const hit = document.elementFromPoint(native.clientX, native.clientY)
      const rowScale = hit?.closest("[data-resource-id]")
      const scaleWidth = rowScale instanceof HTMLElement ? rowScale.getBoundingClientRect().width : width
      const columns = view === "week" ? Math.max(dates.length, 1) : 1
      const delta = minutesFromDelta(native.clientX - originX, scaleWidth, 0, (hourEnd - hourStart) * columns, snapMinutes)
      if (mode === "resize") {
        if (!job.resourceId || delta === 0) return
        const resized = resizeEventEnd(jobToEvent(job), delta, snapMinutes, timeZone)
        void commit("resize", { jobId: job.id, resourceId: job.resourceId, startsAt: resized.startsAt, endsAt: resized.endsAt })
        return
      }
      const resourceId = hit?.closest("[data-resource-id]")?.getAttribute("data-resource-id") ?? job.resourceId
      if (!resourceId) return
      if (resourceId === job.resourceId && delta === 0) {
        setSelectedId(job.id)
        onOpenJob?.(job.id)
        return
      }
      const moved = delta === 0 ? { startsAt: job.startsAt, endsAt: job.endsAt } : shiftClock(jobToEvent(job), delta, timeZone)
      void commit(resourceId === job.resourceId ? "move" : "assign", {
        jobId: job.id,
        resourceId,
        startsAt: moved.startsAt,
        endsAt: moved.endsAt,
      })
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
  }

  async function exportList(format: "csv" | "json") {
    const body = format === "csv" ? jobsToCsv(model.jobs, model.resources, model.statuses, model.skills) : jobsToJson(model.jobs)
    const filename = format === "csv" ? "trabajos.csv" : "trabajos.json"
    const result = await onExport?.({ format, body, filename })
    if (result === false) return
    if (typeof document === "undefined") return
    const blob = new Blob([body], { type: format === "csv" ? "text/csv;charset=utf-8" : "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    link.click()
    URL.revokeObjectURL(url)
  }

  const menuProps = {
    labels,
    resources: filtered.resources,
    model,
    dates,
    hourStart,
    hourEnd,
    timeZone,
    readOnly,
    onAssign: (request: AssignRequest) => void commit("assign", request),
    onMove: (request: AssignRequest) => void commit("move", request),
    onResize: (request: AssignRequest) => void commit("resize", request),
    onReject: showReject,
  }

  return (
    <section
      className={cn("flex h-full min-h-0 min-w-0 flex-col gap-3 bg-background text-foreground", className)}
      data-dispatch-board
      data-reduced-motion={reduced ? "true" : "false"}
      data-readonly={readOnly ? "true" : "false"}
      aria-busy={loading || undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="ghost" className="min-h-11" onClick={() => onBack?.()}>
          <ChevronLeft aria-hidden />
          {labels.back}
        </Button>
        <h2 className="min-w-0 text-base font-semibold text-balance">{heading}</h2>
        <Button type="button" variant="outline" size="icon" className="min-h-11 min-w-11" aria-label={labels.previous} onClick={() => setAnchor(shiftAnchor(view, anchor, -1, weekStartsOn))}>
          <ChevronLeft aria-hidden />
        </Button>
        <Button type="button" variant="outline" className="min-h-11" onClick={() => setAnchor(calendarDate(clock, timeZone))}>
          {labels.today}
        </Button>
        <Button type="button" variant="outline" size="icon" className="min-h-11 min-w-11" aria-label={labels.next} onClick={() => setAnchor(shiftAnchor(view, anchor, 1, weekStartsOn))}>
          <ChevronRight aria-hidden />
        </Button>
        <div role="group" aria-label={labels.viewLabel} className="flex rounded-md border border-border p-0.5">
          {(["day", "week"] as const).map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={view === option}
              className={cn("min-h-11 rounded-md px-3 text-sm", view === option ? "bg-foreground text-background" : "text-muted-foreground")}
              onClick={() => setView(option)}
            >
              {option === "day" ? labels.day : labels.week}
            </button>
          ))}
        </div>
        <label className="relative ms-auto flex min-h-11 min-w-40 flex-1 items-center gap-2 rounded-md border border-border px-2 sm:max-w-xs">
          <Search className="size-4 text-muted-foreground" aria-hidden />
          <span className="sr-only">{labels.search}</span>
          <input
            ref={searchRef}
            value={filters.query}
            onChange={(event) => setFilters({ ...filters, query: event.target.value })}
            placeholder={labels.search}
            aria-keyshortcuts="Alt+K"
            className="min-w-0 flex-1 bg-transparent py-2 text-sm outline-none placeholder:text-muted-foreground"
          />
          <kbd className="rounded border border-border px-1 text-[0.65rem] text-muted-foreground">⌥K</kbd>
        </label>
        <Button type="button" variant="outline" className="min-h-11" aria-expanded={filtersOpen} aria-controls="dispatch-filters" onClick={() => setFiltersOpen(!filtersOpen)}>
          {filtersOpen ? labels.closeFilters : labels.addFilter}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" variant="outline" className="min-h-11">
              <Download aria-hidden />
              {labels.download}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onSelect={() => void exportList("csv")}>{labels.downloadCsv}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => void exportList("json")}>{labels.downloadJson}</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button type="button" variant="outline" className="min-h-11 md:hidden" onClick={() => setRailOpen(true)}>
          {labels.openRail}
          <span className="tabular-nums">({queue.length})</span>
        </Button>
      </div>
      {filtersOpen ? (
        <div id="dispatch-filters" className="flex flex-wrap gap-3 rounded-md border border-border p-3">
          <FilterSelect label={labels.filtersRole} value={filters.groupId} anyLabel={labels.any} onChange={(groupId) => setFilters({ ...filters, groupId })} options={model.groups.map((group) => ({ id: group.id, label: group.label }))} />
          <FilterSelect label={labels.filtersSkill} value={filters.skillId} anyLabel={labels.any} onChange={(skillId) => setFilters({ ...filters, skillId })} options={model.skills.map((skill) => ({ id: skill.id, label: skill.label }))} />
          <FilterSelect label={labels.filtersStatus} value={filters.statusId} anyLabel={labels.any} onChange={(statusId) => setFilters({ ...filters, statusId })} options={model.statuses.map((status) => ({ id: status.id, label: status.label }))} />
          <FilterSelect
            label={labels.filtersOccupancy}
            value={filters.occupancy}
            anyLabel={labels.any}
            onChange={(value) => setFilters({ ...filters, occupancy: value === "open" || value === "steady" || value === "full" ? value : null })}
            options={[
              { id: "open", label: labels.occupancyOpen },
              { id: "steady", label: labels.occupancySteady },
              { id: "full", label: labels.occupancyFull },
            ]}
          />
        </div>
      ) : null}
      <div role="status" aria-live="polite" className={banner ? "flex items-start gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm text-card-foreground" : "sr-only"} data-slot="dispatch-rejection">
        {banner ? (
          <>
            <TriangleAlert className="mt-0.5 size-4 shrink-0" aria-hidden />
            <span>{banner.detail}</span>
          </>
        ) : (
          live
        )}
      </div>
      {error ? (
        <div role="alert" className="flex flex-wrap items-center gap-3 rounded-md border border-border px-3 py-3 text-sm">
          <TriangleAlert className="size-4" aria-hidden />
          <p className="min-w-0 flex-1">{error}</p>
          {onRetry ? (
            <Button type="button" variant="outline" className="min-h-11" onClick={onRetry}>
              {labels.retry}
            </Button>
          ) : null}
        </div>
      ) : null}
      <div className="flex min-h-0 min-w-0 flex-1 gap-3">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col gap-2">
          {loading ? (
            <div className="grid gap-2" aria-label={labels.loading}>
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : filtered.resources.length === 0 ? (
            <div className="rounded-md border border-dashed border-border px-4 py-8">
              <p className="font-medium">{filters.query ? labels.noMatches : labels.emptyTitle}</p>
              <p className="mt-1 text-sm text-muted-foreground">{labels.emptyBody}</p>
            </div>
          ) : (
            <div
              ref={scrollerRef}
              className="min-h-0 flex-1 overflow-auto"
              style={{ touchAction: "pan-x pan-y" }}
              onScroll={(event) => {
                const node = event.currentTarget
                const nextTop = node.scrollTop
                setScrollTop((current) => (Math.abs(current - nextTop) < 24 ? current : nextTop))
                const next = node.scrollLeft + node.clientWidth < node.scrollWidth - 4
                setCanScrollNext((current) => (current === next ? current : next))
              }}
            >
              <div role="grid" aria-label={labels.heading} aria-rowcount={rows.length + 1} aria-colcount={(view === "week" ? dates.length : hours.length) + 1} className="relative" style={{ width: NAME_WIDTH_PX + width }}>
                <div role="row" className="sticky top-0 z-30 flex border-b border-border bg-background">
                  <div role="columnheader" className="sticky start-0 z-40 flex items-center gap-2 bg-background px-3 py-2 text-sm font-medium" style={{ width: NAME_WIDTH_PX }}>
                    {labels.people} ({filtered.resources.length})
                    {conflicts.length > 0 ? (
                      <button type="button" className="inline-flex min-h-6 items-center gap-1 rounded-md border border-border px-1.5 text-xs" onClick={() => document.querySelector<HTMLButtonElement>(`[data-dispatch-job="${CSS.escape(conflicts[0]?.eventIds[0] ?? "")}"]`)?.focus()}>
                        <TriangleAlert className="size-3" aria-hidden />
                        {conflicts.length === 1 ? labels.conflictOne : fillTemplate(labels.conflictMany, { count: String(conflicts.length) })}
                      </button>
                    ) : null}
                  </div>
                  <div className="relative flex" style={{ width }} role="presentation">
                    {view === "day"
                      ? hours.map((hour) => (
                          <div key={hour} role="columnheader" className="shrink-0 px-2 py-2 text-xs text-muted-foreground tabular-nums" style={{ width: HOUR_COLUMN_PX }}>
                            {hourText(anchor, hour, timeZone, locale)}
                          </div>
                        ))
                      : dates.map((date) => (
                          <div key={date} role="columnheader" className="shrink-0 px-2 py-2 text-xs text-muted-foreground" style={{ width: DAY_COLUMN_PX }}>
                            {formatRangeLabel("day", date, locale)}
                          </div>
                        ))}
                    <NowMark dates={dates} view={view} clock={clock} hourStart={hourStart} hourEnd={hourEnd} timeZone={timeZone} locale={locale} label={labels.now} width={width} />
                  </div>
                </div>
                <div className="relative" style={{ height: layout.total }}>
                  <BodyNow dates={dates} view={view} clock={clock} hourStart={hourStart} hourEnd={hourEnd} timeZone={timeZone} width={width} height={layout.total} label={labels.now} />
                  {rows.slice(windowed.start, windowed.end).map((row, index) => {
                    const absolute = windowed.start + index
                    const top = layout.offsets[absolute] ?? 0
                    const height = layout.sizes[absolute] ?? 0
                    if (row.kind === "group") {
                      return (
                        <div key={`g-${row.id}`} role="row" aria-rowindex={absolute + 2} className="absolute flex items-end bg-muted/40 px-3 text-xs font-medium" style={{ top, height, width: NAME_WIDTH_PX + width }}>
                          <span role="rowheader">
                            {row.label} ({row.count})
                          </span>
                        </div>
                      )
                    }
                    const resource = filtered.resources.find((item) => item.id === row.id)
                    if (!resource) return null
                    return (
                      <ResourceRow
                        key={resource.id}
                        resource={resource}
                        jobs={filtered.jobs.filter((job) => job.resourceId === resource.id)}
                        absences={model.absences.filter((absence) => absence.resourceId === resource.id)}
                        load={occupancy.find((item) => item.resourceId === resource.id)}
                        labels={labels}
                        locale={locale}
                        timeZone={timeZone}
                        dates={dates}
                        view={view}
                        hourStart={hourStart}
                        hourEnd={hourEnd}
                        width={width}
                        top={top}
                        height={height}
                        rowIndex={absolute + 2}
                        statuses={model.statuses}
                        skills={model.skills}
                        conflicts={conflicts}
                        readOnly={readOnly}
                        reduced={reduced}
                        onKeyDown={onJobKeyDown}
                        onPointerDown={startGesture}
                        menu={menuProps}
                      />
                    )
                  })}
                </div>
              </div>
            </div>
          )}
          {canScrollNext ? (
            <Button type="button" variant="ghost" className="min-h-11 self-end" onClick={() => scrollerRef.current?.scrollBy({ left: HOUR_COLUMN_PX * 2, behavior: reduced ? "auto" : "smooth" })}>
              {labels.moreHours}
              <ChevronRight aria-hidden />
            </Button>
          ) : null}
        </div>
        {narrow ? (
          <Sheet open={railOpen} onOpenChange={setRailOpen}>
            <SheetContent side="right" className="w-full sm:max-w-sm" data-dispatch-rail="sheet">
              <SheetHeader>
                <SheetTitle>
                  {labels.rail} ({queue.length})
                </SheetTitle>
                <SheetDescription>{labels.unassigned}</SheetDescription>
              </SheetHeader>
              <QueueList jobs={queue} statuses={model.statuses} locale={locale} timeZone={timeZone} labels={labels} menu={menuProps} onPointerDown={startGesture} onOpenJob={onOpenJob} />
            </SheetContent>
          </Sheet>
        ) : railOpen ? (
          <aside className="hidden w-72 shrink-0 flex-col gap-2 border-s border-border ps-3 md:flex" data-dispatch-rail="inline" aria-label={labels.rail}>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-sm font-medium">
                {labels.rail} <span className="tabular-nums">({queue.length})</span>
              </h3>
              <Button type="button" variant="ghost" size="sm" className="min-h-11" onClick={() => setRailOpen(false)}>
                {labels.closeRail}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">{labels.unassigned}</p>
            <QueueList jobs={queue} statuses={model.statuses} locale={locale} timeZone={timeZone} labels={labels} menu={menuProps} onPointerDown={startGesture} onOpenJob={onOpenJob} />
          </aside>
        ) : (
          <Button type="button" variant="outline" className="hidden min-h-11 md:inline-flex" onClick={() => setRailOpen(true)}>
            {labels.openRail} ({queue.length})
          </Button>
        )}
      </div>
      {readOnly ? <p className="text-xs text-muted-foreground">{labels.readonly}</p> : null}
    </section>
  )
}

type MenuProps = {
  labels: DispatchLabels
  resources: readonly Resource[]
  model: DispatchModel
  dates: readonly string[]
  hourStart: number
  hourEnd: number
  timeZone: string
  readOnly: boolean
  onAssign: (request: AssignRequest) => void
  onMove: (request: AssignRequest) => void
  onResize: (request: AssignRequest) => void
  onReject: (detail: string, reason: DispatchRejectReason | undefined, jobId: string) => void
}

function ResourceRow(props: {
  resource: Resource
  jobs: Job[]
  absences: DispatchModel["absences"]
  load: ResourceOccupancy | undefined
  labels: DispatchLabels
  locale: string
  timeZone: string
  dates: string[]
  view: DispatchView
  hourStart: number
  hourEnd: number
  width: number
  top: number
  height: number
  rowIndex: number
  statuses: DispatchModel["statuses"]
  skills: DispatchModel["skills"]
  conflicts: ReturnType<typeof boardConflicts>
  readOnly: boolean
  reduced: boolean
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>, job: Job) => void
  onPointerDown: (event: React.PointerEvent<HTMLElement>, job: Job, mode: "move" | "resize") => void
  menu: MenuProps
}) {
  const { resource, jobs, absences, load, labels, skills, width, top, height, rowIndex } = props
  const placed = placeResourceJobs(jobs, props.dates, props.hourStart, props.hourEnd, props.timeZone)
  const bands = placeAbsences(absences, props.dates, props.hourStart, props.hourEnd, props.timeZone, labels.timeOff)
  const occupancyText = `${load?.ratio == null ? "–" : formatRatio(load.ratio, props.locale)} ${levelWord(load?.level ?? null, labels)}`
  const skillText = resource.skills.map((id) => skills.find((skill) => skill.id === id)?.label ?? id).join(", ")
  return (
    <div role="row" aria-rowindex={rowIndex} className="absolute flex border-b border-border" style={{ top, height, width: NAME_WIDTH_PX + width }} data-dispatch-row={resource.id}>
      <div role="rowheader" className="sticky start-0 z-20 flex items-center gap-2 bg-background px-2" style={{ width: NAME_WIDTH_PX }}>
        <Avatar size="sm">
          <AvatarFallback>{resourceInitials(resource)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium" title={resource.name}>{resource.name}</p>
          <p className="truncate text-xs" title={skillText}>
            <span className="text-foreground tabular-nums">{occupancyText}</span>
            {skillText ? <span className="text-muted-foreground">{` · ${skillText}`}</span> : null}
          </p>
        </div>
        <OccupancyRing ratio={load?.ratio ?? null} tone={load?.tone ?? "neutral"} label={occupancyText} />
      </div>
      <div role="gridcell" className="relative" style={{ width }} data-dispatch-scale data-resource-id={resource.id}>
        {bands.map((band) => (
          <div key={`${band.id}-${band.date}`} className="absolute inset-y-1 flex items-center overflow-hidden rounded-md px-2 text-xs font-medium text-foreground" style={{ ...STRIPES, ...bandBox(band, props.dates, props.view) }} data-dispatch-absence={band.id}>
            <span className="truncate">{band.label}</span>
          </div>
        ))}
        {placed.map((place) => {
          const job = jobs.find((item) => item.id === place.jobId)
          if (!job) return null
          const laneHeight = Math.max(24, (height - 8) / Math.max(place.lanes, 1))
          return (
            <JobCard
              key={`${place.jobId}-${place.date}`}
              job={job}
              placeStyle={{ ...bandBox(place, props.dates, props.view), top: 4 + place.lane * laneHeight, height: laneHeight - 4 }}
              continues={place.continuesBefore || place.continuesAfter}
              {...props}
            />
          )
        })}
      </div>
    </div>
  )
}

function JobCard({
  job,
  placeStyle,
  labels,
  locale,
  timeZone,
  statuses,
  conflicts,
  readOnly,
  reduced,
  continues,
  onKeyDown,
  onPointerDown,
  menu,
}: {
  job: Job
  placeStyle: React.CSSProperties
  labels: DispatchLabels
  locale: string
  timeZone: string
  statuses: DispatchModel["statuses"]
  conflicts: ReturnType<typeof boardConflicts>
  readOnly: boolean
  reduced: boolean
  continues: boolean
  onKeyDown: (event: React.KeyboardEvent<HTMLButtonElement>, job: Job) => void
  onPointerDown: (event: React.PointerEvent<HTMLElement>, job: Job, mode: "move" | "resize") => void
  menu: MenuProps
}) {
  const status = statuses.find((item) => item.id === job.statusId)
  const partners = conflicts.filter((pair) => pair.eventIds.includes(job.id))
  const when = formatInterval(job.startsAt, job.endsAt, timeZone, locale)
  const name = [job.title, status?.label ?? job.statusId, when, job.location, partners.length ? labels.conflict : "", continues ? labels.continues : ""].filter(Boolean).join(". ")
  return (
    <div className={cn("absolute z-10 min-w-28 overflow-hidden rounded-md border border-border border-s-2 bg-card text-card-foreground", TONE_EDGE[status?.tone ?? "neutral"])} style={placeStyle} data-reduced-motion={reduced ? "true" : "false"}>
      <button type="button" data-dispatch-job={job.id} aria-label={name} className="absolute inset-0 z-0 rounded-md focus-visible:ring-2 focus-visible:ring-ring" onKeyDown={(event) => onKeyDown(event, job)} onPointerDown={(event) => onPointerDown(event, job, "move")} />
      <div className="pointer-events-none relative z-10 flex h-full flex-col gap-0.5 p-1 pe-8">
        <span className="inline-flex items-center gap-1 text-xs font-medium">
          <span className={cn("size-1.5 rounded-full bg-current", RING_TONE[status?.tone ?? "neutral"])} aria-hidden />
          {status?.label ?? job.statusId}
          {partners.length > 0 ? (
            <span className="inline-flex items-center gap-0.5" data-slot="dispatch-conflict">
              <TriangleAlert className="size-3" aria-hidden />
              {labels.conflict}
            </span>
          ) : null}
        </span>
        <span className="truncate text-xs font-medium" title={job.title}>{job.title}</span>
        <span className="truncate text-[0.65rem] text-muted-foreground tabular-nums">
          {when}
          {continues ? ` · ${labels.continues}` : ""}
        </span>
        {job.location ? <span className="truncate text-[0.65rem] text-muted-foreground" title={job.location}>{job.location}</span> : null}
        {job.marker ? <span className="absolute end-1 bottom-1 rounded-sm border border-border px-1 text-[0.6rem]" title={job.markerLabel}>{job.marker}</span> : null}
      </div>
      {readOnly ? null : (
        <button type="button" aria-label={labels.grow} className="absolute inset-y-0 end-0 z-20 w-3" onPointerDown={(event) => { event.stopPropagation(); onPointerDown(event, job, "resize") }} />
      )}
      <JobMenu job={job} {...menu} />
    </div>
  )
}

function JobMenu({ job, labels, resources, model, dates, hourStart, hourEnd, timeZone, readOnly, onAssign, onMove, onResize, onReject }: MenuProps & { job: Job }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button type="button" variant="ghost" size="icon-xs" className="absolute end-0.5 top-0.5 z-20" aria-label={`${labels.jobActions} ${job.title}`}>
          <MoreHorizontal aria-hidden />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{job.title}</DropdownMenuLabel>
        {readOnly || !job.resourceId ? null : (
          <>
            <DropdownMenuItem onSelect={() => { const moved = shiftClock(jobToEvent(job), -15, timeZone); onMove({ jobId: job.id, resourceId: job.resourceId ?? "", startsAt: moved.startsAt, endsAt: moved.endsAt }) }}>{labels.moveEarlier}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { const moved = shiftClock(jobToEvent(job), 15, timeZone); onMove({ jobId: job.id, resourceId: job.resourceId ?? "", startsAt: moved.startsAt, endsAt: moved.endsAt }) }}>{labels.moveLater}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { const moved = resizeEventEnd(jobToEvent(job), 15, 15, timeZone); onResize({ jobId: job.id, resourceId: job.resourceId ?? "", startsAt: moved.startsAt, endsAt: moved.endsAt }) }}>{labels.grow}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => { const moved = resizeEventEnd(jobToEvent(job), -15, 15, timeZone); onResize({ jobId: job.id, resourceId: job.resourceId ?? "", startsAt: moved.startsAt, endsAt: moved.endsAt }) }}>{labels.shrink}</DropdownMenuItem>
            <DropdownMenuItem onSelect={() => onAssign({ jobId: job.id, resourceId: null, startsAt: job.startsAt, endsAt: job.endsAt })}>{labels.unassign}</DropdownMenuItem>
          </>
        )}
        {readOnly ? null : (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuLabel>{labels.assignTo}</DropdownMenuLabel>
            {resources.slice(0, 12).map((resource) => {
              const decision = validatePlacement({
                jobId: job.id,
                title: job.title,
                resource,
                startsAt: job.startsAt,
                endsAt: job.endsAt,
                ...(job.skillId != null ? { skillId: job.skillId } : {}),
                jobs: model.jobs,
                absences: model.absences,
                skills: model.skills,
                dates,
                hourStart,
                hourEnd,
                timeZone,
                labels,
              })
              return (
                <DropdownMenuItem
                  key={resource.id}
                  aria-disabled={decision.ok ? undefined : true}
                  onSelect={(event) => {
                    if (!decision.ok) {
                      event.preventDefault()
                      onReject(decision.detail, decision.reason, job.id)
                      return
                    }
                    onAssign({ jobId: job.id, resourceId: resource.id, startsAt: job.startsAt, endsAt: job.endsAt })
                  }}
                >
                  {resource.name}
                </DropdownMenuItem>
              )
            })}
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function QueueList({
  jobs,
  statuses,
  locale,
  timeZone,
  labels,
  menu,
  onPointerDown,
  onOpenJob,
}: {
  jobs: Job[]
  statuses: DispatchModel["statuses"]
  locale: string
  timeZone: string
  labels: DispatchLabels
  menu: MenuProps
  onPointerDown: (event: React.PointerEvent<HTMLElement>, job: Job, mode: "move" | "resize") => void
  onOpenJob?: ((jobId: string) => void) | undefined
}) {
  if (jobs.length === 0) return <p className="text-sm text-muted-foreground">{labels.queueEmpty}</p>
  return (
    <ul className="flex flex-col gap-2" data-dispatch-queue>
      {jobs.map((job) => {
        const status = statuses.find((item) => item.id === job.statusId)
        return (
          <li key={job.id} className="relative min-h-11 rounded-md border border-border bg-card p-2 pe-8 text-card-foreground">
            <button type="button" className="absolute inset-0 z-0 rounded-md" aria-label={`${job.title}. ${status?.label ?? job.statusId}`} onPointerDown={(event) => onPointerDown(event, job, "move")} onClick={() => onOpenJob?.(job.id)} />
            <p className="pointer-events-none text-xs font-medium">{status?.label ?? job.statusId}</p>
            <p className="pointer-events-none truncate text-sm">{job.title}</p>
            <p className="pointer-events-none truncate text-xs text-muted-foreground">
              {formatInterval(job.startsAt, job.endsAt, timeZone, locale)}
              {job.location ? ` · ${job.location}` : ""}
            </p>
            <JobMenu job={job} {...menu} />
          </li>
        )
      })}
    </ul>
  )
}

function OccupancyRing({ ratio, tone, label }: { ratio: number | null; tone: string; label: string }) {
  const value = ratio == null ? 0 : Math.max(0, Math.min(ratio, 1))
  const radius = 7
  const circumference = 2 * Math.PI * radius
  return (
    <span className={cn("inline-flex shrink-0", RING_TONE[tone] ?? "text-muted-foreground")} title={label}>
      <svg viewBox="0 0 20 20" className="size-5" aria-hidden>
        <circle cx="10" cy="10" r={radius} fill="none" stroke="currentColor" strokeWidth="2" className="opacity-25" />
        <circle cx="10" cy="10" r={radius} fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray={`${value * circumference} ${circumference}`} transform="rotate(-90 10 10)" />
      </svg>
      <span className="sr-only">{label}</span>
    </span>
  )
}

function NowMark(props: { dates: readonly string[]; view: DispatchView; clock: number; hourStart: number; hourEnd: number; timeZone: string; locale: string; label: string; width: number }) {
  const spot = nowSpot(props)
  if (!spot) return null
  return (
    <div className="pointer-events-none absolute top-0 bottom-0 z-20 w-px bg-destructive" style={{ insetInlineStart: spot.left }} data-slot="dispatch-now">
      <span className="absolute start-1 top-0 rounded-sm bg-foreground px-1 text-[0.65rem] font-medium text-background tabular-nums">
        {props.label} {formatClock(props.clock, props.timeZone, props.locale)}
      </span>
    </div>
  )
}

function BodyNow(props: { dates: readonly string[]; view: DispatchView; clock: number; hourStart: number; hourEnd: number; timeZone: string; width: number; height: number; label: string }) {
  const spot = nowSpot(props)
  if (!spot) return null
  return (
    <div className="pointer-events-none absolute z-20 w-px bg-destructive" style={{ top: 0, height: props.height, insetInlineStart: NAME_WIDTH_PX + spot.left }} data-slot="dispatch-now-line">
      <span className="sr-only">{props.label}</span>
    </div>
  )
}

function nowSpot(props: { dates: readonly string[]; view: DispatchView; clock: number; hourStart: number; hourEnd: number; timeZone: string; width: number }) {
  const date = props.dates.find((item) => nowRatio(props.clock, item, props.hourStart, props.hourEnd, props.timeZone) != null)
  if (!date) return null
  const ratio = nowRatio(props.clock, date, props.hourStart, props.hourEnd, props.timeZone)
  if (ratio == null) return null
  const index = Math.max(0, props.dates.indexOf(date))
  const left = props.view === "week" ? ((index + ratio) / Math.max(props.dates.length, 1)) * props.width : ratio * props.width
  return { left }
}

function FilterSelect({ label, value, onChange, anyLabel, options }: { label: string; value: string | null; onChange: (value: string | null) => void; anyLabel: string; options: readonly { id: string; label: string }[] }) {
  return (
    <label className="grid gap-1 text-xs text-muted-foreground">
      {label}
      <select className="min-h-11 rounded-md border border-border bg-background px-2 text-sm text-foreground" value={value ?? ""} onChange={(event) => onChange(event.target.value || null)}>
        <option value="">{anyLabel}</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>{option.label}</option>
        ))}
      </select>
    </label>
  )
}

function bandBox(band: { date: string; startRatio: number; sizeRatio: number }, dates: readonly string[], view: DispatchView): React.CSSProperties {
  if (view === "day") return { insetInlineStart: `${band.startRatio * 100}%`, width: `${Math.max(band.sizeRatio * 100, 8)}%` }
  const index = Math.max(0, dates.indexOf(band.date))
  const span = Math.max(dates.length, 1)
  return { insetInlineStart: `${((index + band.startRatio) / span) * 100}%`, width: `${Math.max(band.sizeRatio / span, 0.04) * 100}%` }
}

function hourText(anchor: string, hour: number, timeZone: string, locale: string) {
  const instant = instantOnDate(anchor, hour * 60, timeZone).instant
  if (!Number.isFinite(instant)) return String(hour)
  return formatClock(instant, timeZone, locale)
}

function applyDraft(jobs: readonly Job[], draft: AssignRequest | null): Job[] {
  if (!draft) return [...jobs]
  return jobs.map((job) => (job.id === draft.jobId ? { ...job, startsAt: draft.startsAt, endsAt: draft.endsAt, resourceId: draft.resourceId } : job))
}

function useControllable<T>(value: T | undefined, defaultValue: T, onChange?: (value: T) => void) {
  const [inner, setInner] = React.useState(defaultValue)
  const current = value !== undefined ? value : inner
  const set = React.useCallback((next: T) => { if (value === undefined) setInner(next); onChange?.(next) }, [onChange, value])
  return [current, set] as const
}

function useClock(now: Date | string | undefined) {
  const fixed = now == null ? null : typeof now === "string" ? Date.parse(now) : now.getTime()
  const [ticking, setTicking] = React.useState<number | null>(null)
  React.useEffect(() => {
    if (fixed != null && Number.isFinite(fixed)) return
    const kick = window.setTimeout(() => setTicking(Date.now()), 0)
    const id = window.setInterval(() => setTicking(Date.now()), 60_000)
    return () => { window.clearTimeout(kick); window.clearInterval(id) }
  }, [fixed])
  if (fixed != null && Number.isFinite(fixed)) return fixed
  return ticking
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

function useNarrowScreen() {
  const [narrow, setNarrow] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)")
    const apply = () => setNarrow(media.matches)
    apply()
    media.addEventListener("change", apply)
    return () => media.removeEventListener("change", apply)
  }, [])
  return narrow
}
