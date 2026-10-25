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
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import {
  GANTT_DAY_WIDTH,
  GANTT_GROUP_HEIGHT,
  GANTT_LABEL_WIDTH,
  GANTT_ROW_HEIGHT,
  GANTT_SCALES,
  dependencyCurve,
  formatGanttDate,
  ganttBar,
  ganttDependencies,
  ganttDomain,
  ganttTicks,
  isUtcWeekend,
  layoutGroups,
  timelineWidth,
  todayOffset,
  withGanttLabels,
  type GanttItem,
  type GanttScale,
  type GanttStatus,
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
}: TimelineGanttProps<TMeta>) {
  const copy = withGanttLabels(labels)
  const reduced = useReducedFlag()
  const [uncontrolledScale, setUncontrolledScale] = React.useState<GanttScale>(defaultScale)
  const scale = scaleProp ?? uncontrolledScale
  const [clock] = React.useState(() => now ?? new Date().toISOString())
  const nowIso = now ?? clock
  const [openId, setOpenId] = React.useState<string | null>(null)
  const openRef = React.useRef<string | null>(null)
  const [cursor, setCursor] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const headingId = React.useId()

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
  const taskOrder = layout.groups.flatMap((group) => group.tasks.map((task) => task.id))
  const activeId = selectedId ?? cursor ?? taskOrder[0] ?? null
  const columns = `${labelWidth}px ${width}px`

  function commitScale(next: GanttScale) {
    if (scaleProp === undefined) setUncontrolledScale(next)
    onScaleChange?.(next)
  }

  function setOpen(id: string, next: boolean) {
    const resolved = next ? id : openRef.current === id ? null : openRef.current
    openRef.current = resolved
    setOpenId(resolved)
    onHover?.(resolved ? (byId.get(resolved) ?? null) : null)
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
              {layout.groups.map((group) => (
                <div key={group.id}>
                  <div className="grid" style={{ gridTemplateColumns: columns }}>
                    <div
                      className="sticky start-0 z-10 flex items-center border-r border-border bg-muted px-2 text-xs font-medium"
                      style={{ width: labelWidth, height: GANTT_GROUP_HEIGHT }}
                    >
                      <span className="truncate">{copy.workstream(group.label, group.tasks.length)}</span>
                    </div>
                    <div className="bg-muted/40" style={{ height: GANTT_GROUP_HEIGHT }} />
                  </div>
                  {group.tasks.map((task) => {
                    const item = items[task.index]
                    if (!item) return null
                    const bar = ganttBar(item, domain, dayWidth)
                    const statusLabel = copy.status[item.status] ?? item.status
                    const startLabel = formatGanttDate(item.start, locale)
                    const endLabel = formatGanttDate(item.end, locale)
                    const depNames = (item.deps ?? []).map((id) => byId.get(id)?.label ?? id)
                    const description = [item.description, depNames.length ? `${copy.dependencies}: ${depNames.join(", ")}` : copy.noDependencies]
                      .filter(Boolean)
                      .join("\n")
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
                        className={cn(
                          "absolute top-1.5 flex h-7 items-center rounded-md px-2 text-xs font-medium outline-none focus-visible:ring-3 focus-visible:ring-ring",
                          barTone[item.status] ?? barTone.planned,
                          selectedId === item.id && "ring-2 ring-ring",
                          classNames?.bar,
                        )}
                        style={bar ? { left: bar.x, width: bar.width } : undefined}
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
                        <span className={cn("truncate", bar && bar.width < 72 && "sr-only")}>{item.label}</span>
                      </button>
                    )
                    return (
                      <div key={`${item.id}-${task.index}`} className="grid" style={{ gridTemplateColumns: columns }}>
                        <div
                          className={cn(
                            "sticky start-0 z-10 flex items-center border-r border-b border-border bg-background px-2 text-sm",
                            classNames?.label,
                          )}
                          style={{ width: labelWidth, height: GANTT_ROW_HEIGHT }}
                        >
                          <span className="truncate">{item.label}</span>
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
                                  title={item.label}
                                  eyebrow={group.label}
                                  description={description}
                                  people={item.assignees}
                                  metrics={[
                                    { id: "status", label: copy.statusLabel, value: statusLabel },
                                    { id: "start", label: copy.start, value: startLabel },
                                    { id: "end", label: copy.end, value: endLabel },
                                    ...(item.metrics ?? []),
                                  ]}
                                  actions={onSelect ? [{ id: "open", label: copy.open, onSelect: () => onSelect(item) }] : undefined}
                                  extra={renderDetail?.(item)}
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
              ))}
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
    </section>
  )
}

function barDomId(scope: string, id: string) {
  return `${scope}-bar-${id}`
}
