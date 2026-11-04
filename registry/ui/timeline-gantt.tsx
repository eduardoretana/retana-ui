"use client"

/**
 * Clean-room workstream Gantt.
 * The host owns the items. onSelect and onHover report intent and do not write.
 * Hover opens tooltip-card. Arrow keys move between bars. The header stays put while the scale scrolls.
 * Dates are UTC calendar days. Spanish chrome is the default.
 */

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import {
  GANTT_DAY_WIDTH,
  GANTT_GROUP_HEIGHT,
  GANTT_LABEL_WIDTH,
  GANTT_ROW_HEIGHT,
  GANTT_SCALES,
  GANTT_STATUSES,
  dependencyCurve,
  formatGanttDate,
  ganttBar,
  ganttDependencies,
  ganttDomain,
  ganttGroupSpan,
  ganttTicks,
  isUtcWeekend,
  layoutGroups,
  parseGanttProgress,
  timelineWidth,
  todayOffset,
  utcDay,
  withGanttLabels,
  workstreamProgress,
  type GanttItem,
  type GanttScale,
  type GanttStatus,
  type GanttTaskPatch,
  type GanttWorkstream,
  type TimelineGanttLabels,
} from "@/registry/retana/lib/timeline-gantt"
import { TooltipCard } from "@/registry/retana/ui/tooltip-card"

const barTone: Record<GanttStatus, string> = {
  planned: "bg-muted text-foreground",
  active: "bg-primary text-primary-foreground",
  blocked: "bg-destructive text-background",
  done: "bg-foreground text-background",
  "at-risk": "bg-chart-4 text-foreground",
}

const subscribe = () => () => {}

function useReducedFlag() {
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

export type TimelineGanttClassNames = {
  toolbar?: string
  label?: string
  header?: string
  bar?: string
  today?: string
}

export type TimelineGanttProps<TMeta = Record<string, unknown>> = {
  items: readonly GanttItem<TMeta>[]
  workstreams?: readonly GanttWorkstream[]
  scale?: GanttScale
  defaultScale?: GanttScale
  onScaleChange?: (scale: GanttScale) => void
  now?: string
  locale?: string
  weekStartsOn?: number
  labelWidth?: number
  selectedId?: string | null
  onSelect?: (item: GanttItem<TMeta>) => void
  onHover?: (item: GanttItem<TMeta> | null) => void
  labels?: Partial<TimelineGanttLabels>
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  disabled?: boolean
  /** Keeps the name for assistive tech without a second visible title. */
  hideHeading?: boolean
  className?: string
  classNames?: TimelineGanttClassNames
  renderDetail?: (item: GanttItem<TMeta>) => React.ReactNode
  /** Controlled id of the task in the edit sheet. Omit it to let the gantt remember the open row. */
  editingId?: string | null
  onEditingIdChange?: (id: string | null) => void
  /**
   * The host stores the patch. The gantt does not write `items`.
   * Pass it, or `onEditingIdChange`, to show Editar.
   */
  onTaskChangeRequest?: (taskId: string, patch: GanttTaskPatch) => void
}

export function TimelineGantt<TMeta = Record<string, unknown>>({
  items,
  workstreams,
  scale: scaleProp,
  defaultScale = "week",
  onScaleChange,
  now,
  locale = "es-MX",
  weekStartsOn = 1,
  labelWidth = GANTT_LABEL_WIDTH,
  selectedId,
  onSelect,
  onHover,
  labels,
  loading = false,
  error = null,
  onRetry,
  disabled = false,
  hideHeading = false,
  className,
  classNames,
  renderDetail,
  editingId,
  onEditingIdChange,
  onTaskChangeRequest,
}: TimelineGanttProps<TMeta>) {
  const copy = withGanttLabels(labels)
  const reduced = useReducedFlag()
  const [uncontrolledScale, setUncontrolledScale] = React.useState<GanttScale>(defaultScale)
  const scale = scaleProp ?? uncontrolledScale
  const [clock] = React.useState(() => now ?? new Date().toISOString())
  const nowIso = now ?? clock
  const [openId, setOpenId] = React.useState<string | null>(null)
  const openRef = React.useRef<string | null>(null)
  const blockedId = React.useRef<string | null>(null)
  const [cursor, setCursor] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const headingId = React.useId()
  const editingControlled = editingId !== undefined
  const [internalEditingId, setInternalEditingId] = React.useState<string | null>(null)
  const activeEditingId = editingControlled ? (editingId ?? null) : internalEditingId
  const returnFocusId = React.useRef<string | null>(null)
  const canEdit = Boolean(onTaskChangeRequest || onEditingIdChange)

  const dayWidth = GANTT_DAY_WIDTH[scale]
  const nowMs = Date.parse(nowIso)
  const domain = React.useMemo(
    () => ganttDomain(items, scale, Number.isFinite(nowMs) ? nowMs : Date.UTC(2026, 0, 1), weekStartsOn),
    [items, scale, nowMs, weekStartsOn],
  )
  const width = timelineWidth(domain, dayWidth)
  const ticks = React.useMemo(
    () => ganttTicks(domain, scale, locale, dayWidth, weekStartsOn),
    [domain, scale, locale, dayWidth, weekStartsOn],
  )
  const layout = React.useMemo(
    () => layoutGroups(items, workstreams, GANTT_ROW_HEIGHT, GANTT_GROUP_HEIGHT),
    [items, workstreams],
  )
  const links = React.useMemo(() => ganttDependencies(items), [items])
  const byId = React.useMemo(() => new Map(items.map((item) => [item.id, item])), [items])
  const today = todayOffset(nowIso, domain, dayWidth)
  const chartHasProgress = items.some((item) => parseGanttProgress(item.progress) != null)
  const editingItem = activeEditingId ? (byId.get(activeEditingId) ?? null) : null
  const taskOrder = layout.groups.flatMap((group) => group.tasks.map((task) => task.id))
  const activeId = selectedId ?? cursor ?? taskOrder[0] ?? null
  const columns = `${labelWidth}px ${width}px`

  function commitScale(next: GanttScale) {
    if (scaleProp === undefined) setUncontrolledScale(next)
    onScaleChange?.(next)
  }

  function setOpen(id: string, next: boolean) {
    if (next && blockedId.current === id) return
    const resolved = next ? id : openRef.current === id ? null : openRef.current
    openRef.current = resolved
    setOpenId(resolved)
    onHover?.(resolved ? (byId.get(resolved) ?? null) : null)
  }

  function requestEdit(id: string) {
    returnFocusId.current = barDomId(headingId, id)
    if (!editingControlled) setInternalEditingId(id)
    onEditingIdChange?.(id)
  }

  if (activeEditingId) returnFocusId.current = barDomId(headingId, activeEditingId)

  function closeEdit() {
    const id = returnFocusId.current
    if (!editingControlled) setInternalEditingId(null)
    onEditingIdChange?.(null)
    queueMicrotask(() => {
      if (id) document.getElementById(id)?.focus()
    })
  }

  function moveFocus(fromId: string, key: string) {
    const index = taskOrder.indexOf(fromId)
    if (index < 0) return
    let next = index
    if (key === "ArrowDown") next = Math.min(taskOrder.length - 1, index + 1)
    else if (key === "ArrowUp") next = Math.max(0, index - 1)
    else if (key === "Home") next = 0
    else if (key === "End") next = taskOrder.length - 1
    else return
    const id = taskOrder[next]
    if (!id) return
    setCursor(id)
    document.getElementById(barDomId(headingId, id))?.focus()
  }

  const placed = new Map<string, { x: number; width: number; y: number }>()
  for (const group of layout.groups) {
    for (const task of group.tasks) {
      const item = items[task.index]
      if (!item) continue
      const bar = ganttBar(item, domain, dayWidth)
      if (bar) placed.set(item.id, { x: bar.x, width: bar.width, y: task.y })
    }
  }

  return (
    <section
      aria-labelledby={headingId}
      data-slot="timeline-gantt"
      data-scale={scale}
      data-disabled={disabled ? "true" : "false"}
      data-reduced-motion={reduced ? "true" : "false"}
      className={cn("flex h-full min-h-0 min-w-0 flex-col gap-2 text-foreground", className)}
    >
      <div className={cn("flex flex-wrap items-center justify-between gap-2", classNames?.toolbar)}>
        <h2 id={headingId} className={cn("text-sm font-medium", hideHeading && "sr-only")}>
          {copy.heading}
        </h2>
        <div role="group" aria-label={copy.scaleLabel} className="flex gap-1">
          {GANTT_SCALES.map((option) => (
            <button
              key={option}
              type="button"
              aria-pressed={scale === option}
              disabled={disabled}
              className={cn(
                "rounded-md border px-2 py-1 text-xs outline-none focus-visible:ring-3 focus-visible:ring-ring",
                scale === option ? "border-border bg-muted text-foreground" : "border-transparent text-muted-foreground",
              )}
              onClick={() => commitScale(option)}
            >
              {copy[option]}
            </button>
          ))}
        </div>
      </div>
      {disabled ? <p className="text-xs text-muted-foreground">{copy.disabledNote}</p> : null}
      {loading ? (
        <div className="flex flex-col gap-2" aria-busy="true" aria-live="polite">
          <span className="sr-only">{copy.loading}</span>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <div role="alert" className="flex flex-col items-start gap-2 rounded-lg border border-border p-4">
          <p className="text-sm font-medium">{copy.errorTitle}</p>
          <p className="text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">{error}</p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              {copy.retry}
            </Button>
          ) : null}
        </div>
      ) : items.length === 0 ? (
        <Empty className="min-h-48 border border-dashed">
          <EmptyHeader>
            <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
            <EmptyDescription>{copy.emptyHint}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="min-h-48 flex-1 overflow-auto rounded-lg border border-border">
          <div style={{ width: labelWidth + width }} className="min-w-full">
            <div className={cn("sticky top-0 z-20 grid border-b border-border bg-background", classNames?.header)} style={{ gridTemplateColumns: columns }}>
              <div
                className="sticky start-0 z-30 flex items-end border-r border-border bg-background px-2 pb-1 text-xs font-medium text-muted-foreground"
                style={{ width: labelWidth }}
              >
                {copy.labelColumn}
              </div>
              <div className="relative h-10">
                {ticks.map((tick) => (
                  <div
                    key={tick.id}
                    className="absolute inset-y-0 flex items-end border-r border-border px-1 pb-1 text-[11px] text-muted-foreground"
                    style={{ left: tick.x, width: tick.width }}
                  >
                    <span className="truncate">{tick.label}</span>
                  </div>
                ))}
                {today != null ? (
                  <span
                    className={cn("absolute top-1 -translate-x-1/2 rounded-sm bg-primary px-1 text-[10px] text-primary-foreground", classNames?.today)}
                    style={{ left: today }}
                  >
                    {copy.today}
                  </span>
                ) : null}
              </div>
            </div>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0" style={{ left: labelWidth, width }} aria-hidden="true">
                {scale === "day"
                  ? ticks
                      .filter((tick) => isUtcWeekend(tick.start))
                      .map((tick) => (
                        <div key={tick.id} className="absolute inset-y-0 bg-muted/50" style={{ left: tick.x, width: tick.width }} />
                      ))
                  : null}
                {today != null ? <div className="absolute inset-y-0 w-px bg-primary" style={{ left: today }} data-slot="timeline-gantt-today" /> : null}
              </div>
              <svg
                className="pointer-events-none absolute top-0"
                style={{ left: labelWidth, width, height: layout.height }}
                viewBox={`0 0 ${width} ${Math.max(layout.height, 1)}`}
                aria-hidden="true"
              >
                {links.map((link) => {
                  const from = placed.get(link.fromId)
                  const to = placed.get(link.toId)
                  if (!from || !to) return null
                  const curve = dependencyCurve(from, to, GANTT_ROW_HEIGHT)
                  return (
                    <g key={`${link.fromId}-${link.toId}`} data-slot="timeline-gantt-dependency">
                      <path d={curve.d} className="fill-none stroke-muted-foreground" strokeWidth="1.25" />
                      <circle cx={curve.x} cy={curve.y} r="2.5" className="fill-muted-foreground" />
                    </g>
                  )
                })}
              </svg>
              {layout.groups.map((group) => {
                const members = group.tasks.flatMap((task) => {
                  const item = items[task.index]
                  return item ? [item] : []
                })
                const rollup = chartHasProgress ? workstreamProgress(members) : null
                const span = rollup?.ratio != null ? ganttGroupSpan(members) : null
                const spanBar = span ? ganttBar({ id: group.id, start: span.start, end: span.end }, domain, dayWidth) : null
                return (
                <div key={group.id}>
                  <div className="grid" style={{ gridTemplateColumns: columns }}>
                    <div
                      className={cn(
                        "sticky start-0 z-10 flex items-center border-r border-border bg-muted px-2 text-xs font-medium",
                        chartHasProgress && "min-w-0 gap-2",
                      )}
                      style={{ width: labelWidth, height: GANTT_GROUP_HEIGHT }}
                    >
                      <span className={cn("truncate", chartHasProgress && "min-w-0 flex-1")}>{copy.workstream(group.label, group.tasks.length)}</span>
                      {rollup?.percent != null ? <span className="shrink-0 tabular-nums">{rollup.percent}%</span> : null}
                      {chartHasProgress && rollup?.percent == null && group.tasks.length > 0 ? (
                        <span className="shrink-0 font-normal text-muted-foreground">{copy.noProgress}</span>
                      ) : null}
                    </div>
                    {rollup?.ratio != null && spanBar ? (
                      <div className="relative bg-muted/40" style={{ height: GANTT_GROUP_HEIGHT }}>
                        <div className="absolute top-1/2 h-3 -translate-y-1/2" style={{ left: spanBar.x, width: Math.max(spanBar.width, 12) }}>
                          <GanttProgressTrack
                            slot="timeline-gantt-group-progress"
                            ratio={rollup.ratio}
                            label={copy.groupProgress(group.label, rollup.percent ?? 0)}
                            showLabel={false}
                            reduced={reduced}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="bg-muted/40" style={{ height: GANTT_GROUP_HEIGHT }} />
                    )}
                  </div>
                  {group.tasks.map((task) => {
                    const item = items[task.index]
                    if (!item) return null
                    const bar = ganttBar(item, domain, dayWidth)
                    const ratio = parseGanttProgress(item.progress)
                    const percent = ratio == null ? null : Math.round(ratio * 100)
                    const statusLabel = copy.status[item.status] ?? item.status
                    const startLabel = formatGanttDate(item.start, locale)
                    const endLabel = formatGanttDate(item.end, locale)
                    const depNames = (item.deps ?? []).map((id) => byId.get(id)?.label ?? id)
                    const description = [item.description, depNames.length ? `${copy.dependencies}: ${depNames.join(", ")}` : copy.noDependencies]
                      .filter(Boolean)
                      .join("\n")
                    const detail = renderDetail?.(item)
                    const editActions = [
                      ...(onSelect ? [{ id: "open", label: copy.open, onSelect: () => onSelect(item) }] : []),
                      ...(canEdit ? [{ id: "edit", label: copy.edit, onSelect: () => requestEdit(item.id) }] : []),
                    ]
                    const button = (
                      <button
                        id={barDomId(headingId, item.id)}
                        type="button"
                        disabled={disabled}
                        tabIndex={activeId === item.id ? 0 : -1}
                        aria-pressed={selectedId === item.id}
                        aria-label={copy.barLabel(item.label, startLabel, endLabel, statusLabel)}
                        data-slot="timeline-gantt-bar"
                        data-status={item.status}
                        data-id={item.id}
                        {...(percent != null ? { "data-progress": String(percent) } : {})}
                        className={cn(
                          "absolute top-1.5 flex h-7 items-center rounded-md text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring",
                          ratio == null ? "px-2" : "overflow-hidden p-0",
                          ratio == null ? (barTone[item.status] ?? barTone.planned) : "bg-transparent",
                          selectedId === item.id && "ring-2 ring-ring",
                          classNames?.bar,
                        )}
                        style={bar ? { left: bar.x, width: bar.width } : undefined}
                        onPointerEnter={() => {
                          if (!disabled) setOpen(item.id, true)
                        }}
                        onClick={() => {
                          setCursor(item.id)
                          setAnnouncement(copy.selected(item.label))
                          onSelect?.(item)
                        }}
                        onKeyDown={(event) => {
                          if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
                            event.preventDefault()
                            moveFocus(item.id, event.key)
                          }
                        }}
                      >
                        {ratio != null ? (
                          <span className="pointer-events-none absolute inset-0">
                            <GanttProgressTrack
                              ratio={ratio}
                              label={`${item.label}, ${copy.progressValue(percent ?? 0)}`}
                              showLabel={!!bar && bar.width >= 48}
                              reduced={reduced}
                            />
                          </span>
                        ) : null}
                        <span className={cn("truncate", (ratio != null || (bar && bar.width < 72)) && "sr-only")}>{item.label}</span>
                      </button>
                    )
                    return (
                      <div key={`${item.id}-${task.index}`} className="grid" style={{ gridTemplateColumns: columns }}>
                        <div
                          className={cn(
                            "sticky start-0 z-10 flex items-center border-r border-b border-border bg-background px-2 text-sm",
                            percent != null && "min-w-0 gap-2",
                            classNames?.label,
                          )}
                          style={{ width: labelWidth, height: GANTT_ROW_HEIGHT }}
                        >
                          <span className={cn("truncate", percent != null && "min-w-0 flex-1")}>{item.label}</span>
                          {percent != null ? (
                            <span className={cn("shrink-0 tabular-nums text-xs text-muted-foreground", labelWidth < 88 && "sr-only")}>{percent}%</span>
                          ) : null}
                        </div>
                        <div className="relative border-b border-border" style={{ height: GANTT_ROW_HEIGHT }}>
                          {bar ? (
                            <motion.div
                              className="absolute inset-x-0 top-0 h-full"
                              initial={reduced ? false : { opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ duration: reduced ? 0 : motionPresets.duration.fast, ease: motionPresets.ease.enter }}
                            >
                              {disabled ? (
                                button
                              ) : (
                                <TooltipCard
                                  open={openId === item.id}
                                  onOpenChange={(next) => setOpen(item.id, next)}
                                  onEscape={() => {
                                    const id = item.id
                                    blockedId.current = id
                                    window.setTimeout(() => {
                                      if (blockedId.current === id) blockedId.current = null
                                    }, 450)
                                  }}
                                  side="top"
                                  align="center"
                                  title={item.label}
                                  eyebrow={group.label}
                                  description={description}
                                  {...(item.assignees ? { people: item.assignees } : {})}
                                  metrics={[
                                    { id: "status", label: copy.statusLabel, value: statusLabel },
                                    { id: "start", label: copy.start, value: startLabel },
                                    { id: "end", label: copy.end, value: endLabel },
                                    ...(percent != null ? [{ id: "progress", label: copy.progress, value: `${percent}%` }] : []),
                                    ...(item.metrics ?? []),
                                  ]}
                                  {...(editActions.length > 0 ? { actions: editActions } : {})}
                                  {...(detail != null ? { extra: detail } : {})}
                                >
                                  {button}
                                </TooltipCard>
                              )}
                            </motion.div>
                          ) : (
                            <span className="sr-only">{item.label}</span>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
                )
              })}
            </div>
          </div>
          <ul className="sr-only">
            {links.map((link) => (
              <li key={`${link.fromId}-${link.toId}`}>{copy.dependency(byId.get(link.fromId)?.label ?? link.fromId, byId.get(link.toId)?.label ?? link.toId)}</li>
            ))}
          </ul>
        </div>
      )}
      <p className="sr-only" aria-live="polite" data-slot="timeline-gantt-announcement">
        {announcement}
      </p>
      <span className="sr-only">{copy.announcements}</span>
      <GanttEditSheet
        item={editingItem}
        copy={copy}
        onOpenChange={(open) => {
          if (!open) closeEdit()
        }}
        onSubmit={(patch) => {
          if (!editingItem || !onTaskChangeRequest) return
          onTaskChangeRequest(editingItem.id, patch)
          if (!editingControlled) setInternalEditingId(null)
        }}
        onCloseAutoFocus={(event) => {
          event.preventDefault()
          const id = returnFocusId.current ?? (activeEditingId ? barDomId(headingId, activeEditingId) : null)
          if (id) document.getElementById(id)?.focus()
        }}
      />
    </section>
  )
}

function barDomId(scope: string, id: string) {
  return `${scope}-bar-${id}`
}

function GanttProgressTrack({
  ratio,
  label,
  showLabel,
  reduced,
  slot = "timeline-gantt-progress",
}: {
  ratio: number
  label: string
  showLabel: boolean
  reduced: boolean
  slot?: string
}) {
  const percent = Math.round(ratio * 100)
  const text = `${percent}%`
  return (
    <span
      data-slot={slot}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={percent}
      aria-valuetext={label}
      aria-label={label}
      className="relative block h-full overflow-hidden rounded-md border border-foreground bg-muted"
    >
      {showLabel ? (
        <span className="relative z-0 flex h-full items-center justify-center px-1 text-[10px] font-medium text-foreground tabular-nums">{text}</span>
      ) : null}
      {ratio > 0 ? (
        <motion.span
          aria-hidden
          data-slot="timeline-gantt-progress-fill"
          data-ratio={ratio}
          className="absolute inset-0 z-10 origin-left overflow-hidden bg-foreground"
          initial={reduced ? false : { scaleX: 0 }}
          animate={{ scaleX: ratio }}
          transition={{ duration: reduced ? 0 : motionPresets.duration.fast, ease: motionPresets.ease.enter }}
        >
          {showLabel ? (
            <span
              className="absolute inset-y-0 left-0 flex items-center justify-center px-1 text-[10px] font-medium text-background tabular-nums"
              style={{ width: "100%", transform: `scaleX(${1 / ratio})`, transformOrigin: "left center" }}
            >
              {text}
            </span>
          ) : null}
        </motion.span>
      ) : null}
    </span>
  )
}

function GanttEditSheet<TMeta>({
  item,
  copy,
  onOpenChange,
  onSubmit,
  onCloseAutoFocus,
}: {
  item: GanttItem<TMeta> | null
  copy: TimelineGanttLabels
  onOpenChange: (open: boolean) => void
  onSubmit: (patch: GanttTaskPatch) => void
  onCloseAutoFocus: (event: Event) => void
}) {
  return (
    <Sheet open={item != null} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[390px] max-w-full gap-0 overflow-y-auto sm:max-w-[390px]"
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          const content = event.currentTarget
          if (content instanceof HTMLElement) content.querySelector<HTMLElement>("[data-slot=gantt-edit-name]")?.focus()
        }}
        onCloseAutoFocus={onCloseAutoFocus}
      >
        {item ? <GanttEditForm key={item.id} item={item} copy={copy} onSubmit={onSubmit} onCancel={() => onOpenChange(false)} /> : null}
      </SheetContent>
    </Sheet>
  )
}

function GanttEditForm<TMeta>({
  item,
  copy,
  onSubmit,
  onCancel,
}: {
  item: GanttItem<TMeta>
  copy: TimelineGanttLabels
  onSubmit: (patch: GanttTaskPatch) => void
  onCancel: () => void
}) {
  const nameId = React.useId()
  const startId = React.useId()
  const endId = React.useId()
  const personId = React.useId()
  const statusId = React.useId()
  const progressId = React.useId()
  const known = parseGanttProgress(item.progress)
  const [label, setLabel] = React.useState(item.label)
  const [start, setStart] = React.useState(item.start.slice(0, 10))
  const [end, setEnd] = React.useState(item.end.slice(0, 10))
  const [status, setStatus] = React.useState<GanttStatus>(item.status)
  const [assignee, setAssignee] = React.useState(item.assignees?.[0]?.name ?? "")
  const [progress, setProgress] = React.useState(known == null ? "" : String(Math.round(known * 100)))
  const [error, setError] = React.useState<string | null>(null)
  const rangeError = error === copy.invalidRange || error === copy.invalidDate

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const name = label.trim()
    if (!name) {
      setError(copy.invalidName)
      return
    }
    const startMs = utcDay(start)
    const endMs = utcDay(end)
    if (startMs == null || endMs == null) {
      setError(copy.invalidDate)
      return
    }
    if (endMs < startMs) {
      setError(copy.invalidRange)
      return
    }
    let nextProgress: number | null
    if (progress.trim() === "") nextProgress = null
    else {
      const value = Number(progress)
      if (!Number.isFinite(value) || value < 0 || value > 100) {
        setError(copy.invalidProgress)
        return
      }
      nextProgress = value / 100
    }
    const person = assignee.trim()
    const previous = item.assignees?.[0]
    const nextId = previous && previous.name === person ? previous.id : person.toLocaleLowerCase("es-MX").replace(/\s+/g, "-")
    onSubmit({
      label: name,
      start,
      end,
      status,
      progress: nextProgress,
      assignees: person ? [{ id: nextId, name: person }] : [],
    })
  }

  return (
    <form onSubmit={submit} className="flex min-h-full flex-col">
      <SheetHeader>
        <SheetTitle>{copy.editTitle}</SheetTitle>
        <SheetDescription>{copy.editDescription}</SheetDescription>
      </SheetHeader>
      <FieldGroup className="px-4">
        <Field>
          <FieldLabel htmlFor={nameId}>{copy.taskName}</FieldLabel>
          <Input id={nameId} data-slot="gantt-edit-name" value={label} autoFocus onChange={(event) => setLabel(event.target.value)} />
        </Field>
        <Field data-invalid={rangeError || undefined}>
          <FieldLabel htmlFor={startId}>{copy.start}</FieldLabel>
          <Input id={startId} type="date" value={start} aria-invalid={rangeError || undefined} onChange={(event) => setStart(event.target.value)} />
        </Field>
        <Field data-invalid={rangeError || undefined}>
          <FieldLabel htmlFor={endId}>{copy.end}</FieldLabel>
          <Input id={endId} type="date" value={end} aria-invalid={rangeError || undefined} onChange={(event) => setEnd(event.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor={personId}>{copy.assignee}</FieldLabel>
          <Input id={personId} value={assignee} onChange={(event) => setAssignee(event.target.value)} />
        </Field>
        <Field>
          <FieldLabel htmlFor={statusId}>{copy.statusLabel}</FieldLabel>
          <select
            id={statusId}
            value={status}
            className="h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
            onChange={(event) => {
              const next = GANTT_STATUSES.find((option) => option === event.target.value)
              if (next) setStatus(next)
            }}
          >
            {GANTT_STATUSES.map((option) => (
              <option key={option} value={option}>
                {copy.status[option]}
              </option>
            ))}
          </select>
        </Field>
        <Field data-invalid={error === copy.invalidProgress || undefined}>
          <FieldLabel htmlFor={progressId}>{copy.progress}</FieldLabel>
          <Input
            id={progressId}
            inputMode="decimal"
            value={progress}
            aria-invalid={error === copy.invalidProgress || undefined}
            onChange={(event) => setProgress(event.target.value)}
          />
        </Field>
      </FieldGroup>
      {error ? <FieldError className="px-4">{error}</FieldError> : null}
      <SheetFooter>
        <Button type="submit">{copy.save}</Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          {copy.cancel}
        </Button>
      </SheetFooter>
    </form>
  )
}
