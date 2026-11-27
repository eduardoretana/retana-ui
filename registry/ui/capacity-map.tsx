"use client"

import * as React from "react"
import { AlertTriangle, ChevronDown, Sparkles, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { StatusTone } from "@/registry/retana/lib/status-tone"
import {
  aisleRows,
  rowsFromZones,
  resolveCapacityMapLabels,
  resolveStatuses,
  simulateDemand,
  slotAccessibleName,
  statusOf,
  zoneStats,
  type CapacityGroup,
  type CapacityLocale,
  type CapacityMapLabels,
  type CapacityRow,
  type CapacitySlot,
  type CapacityZone,
  type SlotStatusDef,
} from "@/registry/retana/lib/capacity-map"

export type {
  CapacityGroup,
  CapacityLocale,
  CapacityMapLabels,
  CapacityRow,
  CapacitySlot,
  CapacityZone,
  SlotStatusDef,
}

export type CapacityMapLayout = "aisle" | "wrap" | "list"

export type CapacityMapProps = {
  zones: readonly CapacityZone[]
  statuses?: readonly SlotStatusDef[]
  locale?: CapacityLocale
  labels?: Partial<CapacityMapLabels>
  highlightedId?: string | null
  selectedId?: string | null
  onHighlight?: (id: string | null) => void
  onSelect?: (id: string) => void
  defaultOpenZoneIds?: string[]
  openZoneIds?: string[]
  onOpenZoneIdsChange?: (ids: string[]) => void
  layout?: CapacityMapLayout
  simulate?: boolean | { max?: number }
  demand?: number
  onDemandChange?: (value: number) => void
  renderSlotDetail?: (slot: CapacitySlot, ctx: { zone: CapacityZone; group: CapacityGroup }) => React.ReactNode
  loading?: boolean
  error?: string
  onRetry?: () => void
  emptyLabel?: string
  className?: string
}

const toneFill: Record<StatusTone, string> = {
  neutral: "border border-dashed border-border bg-background text-muted-foreground",
  accent: "bg-muted text-foreground",
  warning: "bg-chart-4/15 text-foreground",
  critical: "bg-destructive/10 text-destructive",
  info: "bg-chart-2/15 text-foreground",
  positive: "bg-primary/15 text-foreground",
}

function StatusIcon({ status }: { status: string }) {
  if (status === "occupied") return <User className="size-3.5" aria-hidden />
  if (status === "special") return <Sparkles className="size-3.5" aria-hidden />
  if (status === "exceeded") return <AlertTriangle className="size-3.5" aria-hidden />
  return null
}

export function useCapacityHighlight(initial: string | null = null) {
  const [highlightedId, setHighlightedId] = React.useState<string | null>(initial)
  const onHighlight = React.useCallback((id: string | null) => setHighlightedId(id), [])
  return { highlightedId, onHighlight, setHighlightedId }
}

export function CapacityMap({
  zones,
  statuses: statusProps,
  locale = "es-MX",
  labels: labelProps,
  highlightedId = null,
  selectedId = null,
  onHighlight,
  onSelect,
  defaultOpenZoneIds,
  openZoneIds,
  onOpenZoneIdsChange,
  layout = "aisle",
  simulate = false,
  demand: demandProp,
  onDemandChange,
  renderSlotDetail,
  loading = false,
  error,
  onRetry,
  emptyLabel,
  className,
}: CapacityMapProps) {
  const labels = resolveCapacityMapLabels(locale, labelProps)
  const statuses = React.useMemo(() => resolveStatuses(statusProps ? [...statusProps] : undefined, locale), [statusProps, locale])
  const [open, setOpen] = React.useState<string[]>(() => defaultOpenZoneIds ?? (zones[0] ? [zones[0].id] : []))
  const [simOpen, setSimOpen] = React.useState(() => (demandProp ?? 0) > 0)
  const [internalDemand, setInternalDemand] = React.useState(0)
  const demand = demandProp ?? internalDemand
  const setDemand = (value: number) => {
    if (demandProp === undefined) setInternalDemand(value)
    onDemandChange?.(value)
  }

  const currentOpen = openZoneIds ?? open
  const setCurrentOpen = (ids: string[]) => {
    if (openZoneIds === undefined) setOpen(ids)
    onOpenZoneIdsChange?.(ids)
  }

  const appliedDefaults = React.useRef(false)
  React.useEffect(() => {
    if (openZoneIds !== undefined) return
    if (!defaultOpenZoneIds?.length) return
    const present = defaultOpenZoneIds.filter((id) => zones.some((zone) => zone.id === id))
    if (!present.length || appliedDefaults.current) return
    appliedDefaults.current = true
    setOpen((current) => [...new Set([...current, ...present])])
  }, [defaultOpenZoneIds, openZoneIds, zones])

  const fillable = React.useMemo(
    () => zones.reduce((n, zone) => n + zoneStats(zone, statuses).fillable, 0),
    [zones, statuses],
  )
  const simMax = (typeof simulate === "object" ? simulate.max : undefined) ?? fillable + 8
  const simulation = React.useMemo(() => simulateDemand(zones, demand, statuses), [zones, demand, statuses])
  const filledIds = React.useMemo(() => new Set(simulation.filledIds), [simulation])

  if (loading) {
    return (
      <div className={cn("text-sm text-muted-foreground", className)} role="status" aria-busy="true">
        {labels.loading}
      </div>
    )
  }
  if (error) {
    return (
      <div className={cn("flex flex-col items-start gap-3", className)}>
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
        {onRetry ? (
          <Button type="button" size="sm" variant="outline" onClick={onRetry}>
            {labels.retry}
          </Button>
        ) : null}
      </div>
    )
  }
  if (!zones.length) {
    return <p className={cn("text-sm text-muted-foreground", className)}>{emptyLabel ?? labels.empty}</p>
  }

  return (
    <div data-slot="capacity-map" className={cn("@container flex flex-col gap-4", className)}>
      {simulate ? (
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button type="button" size="sm" variant="outline" onClick={() => setSimOpen((value) => !value)} aria-expanded={simOpen}>
              {labels.simulate}
            </Button>
          </div>
          {simOpen ? (
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-sm text-foreground" htmlFor="capacity-map-demand">
                    {labels.demand}
                  </label>
                  <span className="text-sm tabular-nums text-muted-foreground">{demand}</span>
                </div>
                <input
                  id="capacity-map-demand"
                  type="range"
                  min={0}
                  max={Math.max(1, simMax)}
                  step={1}
                  value={demand}
                  onChange={(event) => setDemand(Number(event.target.value))}
                  onKeyDown={(event) => {
                    if (event.key === "End") {
                      event.preventDefault()
                      setDemand(Math.max(1, simMax))
                    }
                    if (event.key === "Home") {
                      event.preventDefault()
                      setDemand(0)
                    }
                  }}
                  aria-label={labels.demand}
                  className="h-8 w-full cursor-pointer accent-primary"
                />
              </div>
              <ul className="flex flex-col gap-2">
                {zones.map((zone) => {
                  const live = simulation.byZone[zone.id]
                  if (!live) return null
                  const ratio = live.capacity > 0 ? Math.min(1, (live.capacity - live.to) / live.capacity) : 0
                  return (
                    <li key={zone.id} className="flex items-center gap-3 text-sm">
                      <span className="min-w-28 text-foreground">{zone.label}</span>
                      <span className="relative h-1.5 min-w-24 flex-1 overflow-hidden rounded-full bg-muted">
                        <span className="absolute inset-y-0 left-0 origin-left bg-primary motion-reduce:transition-none" style={{ transform: `scaleX(${ratio})`, width: "100%" }} />
                      </span>
                      <span className="tabular-nums text-muted-foreground">
                        {live.from} → {live.to} / {live.capacity}
                      </span>
                    </li>
                  )
                })}
              </ul>
              {simulation.overflow > 0 ? (
                <p role="alert" className="text-sm text-destructive">
                  {labels.overflow(simulation.overflow)}
                </p>
              ) : null}
              {demand > 0 ? (
                <Button type="button" size="sm" variant="outline" className="self-start" onClick={() => setDemand(0)}>
                  {labels.discard}
                </Button>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        {zones.map((zone) => {
          const opened = currentOpen.includes(zone.id)
          const stats = zoneStats(zone, statuses, filledIds)
          const headingId = `capacity-zone-${zone.id}`
          return (
            <Collapsible
              key={zone.id}
              open={opened}
              onOpenChange={(next) => setCurrentOpen(next ? [...currentOpen, zone.id] : currentOpen.filter((id) => id !== zone.id))}
            >
              <section aria-labelledby={headingId} className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 px-3 py-2.5">
                  <CollapsibleTrigger asChild>
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 items-center gap-3 text-left outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground motion-reduce:transition-none transition-transform", opened ? "rotate-0" : "-rotate-90")} aria-hidden />
                      <h3 id={headingId} className="min-w-0 flex-1 text-sm font-medium text-foreground">
                        {zone.label}
                      </h3>
                    </button>
                  </CollapsibleTrigger>
                  <CapacityBar label={labels.available(stats.available, stats.capacity)} value={stats.available} max={stats.capacity} />
                </div>
                <CollapsibleContent>
                  {opened ? (
                    <div className="flex flex-col gap-5 border-t border-border px-3 py-3 @min-[34rem]:flex-row @min-[34rem]:flex-wrap min-[40rem]:flex-row min-[40rem]:flex-wrap">
                      {zone.groups.map((group) => (
                        <SlotGroup
                          key={group.id}
                          zone={zone}
                          group={group}
                          layout={layout}
                          statuses={statuses}
                          labels={labels}
                          highlightedId={highlightedId}
                          selectedId={selectedId}
                          filledIds={filledIds}
                          onHighlight={onHighlight}
                          onSelect={onSelect}
                          renderSlotDetail={renderSlotDetail}
                        />
                      ))}
                    </div>
                  ) : null}
                </CollapsibleContent>
              </section>
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}

function CapacityBar({ label, value, max }: { label: string; value: number; max: number }) {
  const safeMax = max > 0 ? max : 1
  const pct = Math.min(1, Math.max(0, (safeMax - Math.min(value, safeMax)) / safeMax))
  return (
    <span className="flex min-w-36 items-center justify-end gap-2">
      <span className="text-xs tabular-nums text-muted-foreground">{label}</span>
      <span role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={safeMax} aria-valuenow={value} className="relative h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <span className="absolute inset-y-0 left-0 w-full origin-left bg-primary motion-reduce:transition-none" style={{ transform: `scaleX(${pct})` }} />
      </span>
    </span>
  )
}

function SlotGroup({
  zone,
  group,
  layout,
  statuses,
  labels,
  highlightedId,
  selectedId,
  filledIds,
  onHighlight,
  onSelect,
  renderSlotDetail,
}: {
  zone: CapacityZone
  group: CapacityGroup
  layout: CapacityMapLayout
  statuses: SlotStatusDef[]
  labels: CapacityMapLabels
  highlightedId: string | null
  selectedId: string | null
  filledIds: ReadonlySet<string>
  onHighlight?: (id: string | null) => void
  onSelect?: (id: string) => void
  renderSlotDetail?: CapacityMapProps["renderSlotDetail"]
}) {
  const rows = aisleRows(group.slots, group.columns)
  const grid = layout === "list" ? [group.slots] : [rows.top, rows.bottom]
  const refs = React.useRef(new Map<string, HTMLButtonElement>())

  const focusSlot = (id: string) => {
    refs.current.get(id)?.focus()
  }

  const move = (from: CapacitySlot, key: string) => {
    if (layout === "list") {
      const list = [...group.slots]
      const index = list.findIndex((slot) => slot.id === from.id)
      const next = key === "ArrowDown" || key === "ArrowRight" ? list[index + 1] : list[index - 1]
      if (next) focusSlot(next.id)
      return
    }
    const cols = rows.columns
    const inTop = rows.top.some((slot) => slot.id === from.id)
    const line = inTop ? rows.top : rows.bottom
    const col = line.findIndex((slot) => slot.id === from.id)
    if (key === "ArrowRight") {
      if (line[col + 1]) focusSlot(line[col + 1].id)
    } else if (key === "ArrowLeft") {
      if (line[col - 1]) focusSlot(line[col - 1].id)
    } else if (key === "ArrowDown" && inTop && rows.bottom[col]) {
      focusSlot(rows.bottom[col].id)
    } else if (key === "ArrowUp" && !inTop && rows.top[col]) {
      focusSlot(rows.top[col].id)
    } else if (key === "Home") {
      focusSlot((inTop ? rows.top : rows.bottom)[0]?.id ?? from.id)
    } else if (key === "End") {
      const end = inTop ? rows.top : rows.bottom
      focusSlot(end[end.length - 1]?.id ?? from.id)
    }
    void cols
  }

  return (
    <div data-slot="capacity-group" className="flex min-w-0 flex-1 flex-col gap-2">
      <p className="text-xs font-medium text-muted-foreground">{group.label}</p>
      {layout === "list" ? (
        <ul className="flex flex-col gap-1">
          {group.slots.map((slot) => (
            <li key={slot.id}>
              <SlotButton
                slot={slot}
                zone={zone}
                group={group}
                statuses={statuses}
                labels={labels}
                highlighted={highlightedId === slot.id}
                selected={selectedId === slot.id}
                preview={filledIds.has(slot.id)}
                layout="list"
                buttonRef={(node) => {
                  if (node) refs.current.set(slot.id, node)
                  else refs.current.delete(slot.id)
                }}
                onHighlight={onHighlight}
                onSelect={onSelect}
                onMove={move}
                renderSlotDetail={renderSlotDetail}
              />
            </li>
          ))}
        </ul>
      ) : (
        <div className="flex flex-col gap-1.5">
          <SlotRow
            slots={grid[0] ?? []}
            columns={rows.columns}
            zone={zone}
            group={group}
            statuses={statuses}
            labels={labels}
            highlightedId={highlightedId}
            selectedId={selectedId}
            filledIds={filledIds}
            layout={layout}
            buttonRef={(id, node) => {
              if (node) refs.current.set(id, node)
              else refs.current.delete(id)
            }}
            onHighlight={onHighlight}
            onSelect={onSelect}
            onMove={move}
            renderSlotDetail={renderSlotDetail}
          />
          {layout === "aisle" ? (
            <div className="flex h-4 items-center gap-2" aria-hidden="true">
              <span className="h-px flex-1 bg-border" />
              <span className="max-w-[70%] truncate text-[0.65rem] tracking-wide text-muted-foreground uppercase">{group.label}</span>
              <span className="h-px flex-1 bg-border" />
            </div>
          ) : null}
          <SlotRow
            slots={grid[1] ?? []}
            columns={rows.columns}
            zone={zone}
            group={group}
            statuses={statuses}
            labels={labels}
            highlightedId={highlightedId}
            selectedId={selectedId}
            filledIds={filledIds}
            layout={layout}
            buttonRef={(id, node) => {
              if (node) refs.current.set(id, node)
              else refs.current.delete(id)
            }}
            onHighlight={onHighlight}
            onSelect={onSelect}
            onMove={move}
            renderSlotDetail={renderSlotDetail}
          />
        </div>
      )}
    </div>
  )
}

function SlotRow({
  slots,
  columns,
  zone,
  group,
  statuses,
  labels,
  highlightedId,
  selectedId,
  filledIds,
  layout,
  buttonRef,
  onHighlight,
  onSelect,
  onMove,
  renderSlotDetail,
}: {
  slots: readonly CapacitySlot[]
  columns: number
  zone: CapacityZone
  group: CapacityGroup
  statuses: SlotStatusDef[]
  labels: CapacityMapLabels
  highlightedId: string | null
  selectedId: string | null
  filledIds: ReadonlySet<string>
  layout: CapacityMapLayout
  buttonRef: (id: string, node: HTMLButtonElement | null) => void
  onHighlight?: (id: string | null) => void
  onSelect?: (id: string) => void
  onMove: (slot: CapacitySlot, key: string) => void
  renderSlotDetail?: CapacityMapProps["renderSlotDetail"]
}) {
  if (!slots.length) return null
  return (
    <div
      className={cn("grid gap-1.5", layout === "wrap" && "grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))]")}
      style={layout === "wrap" ? undefined : { gridTemplateColumns: `repeat(${columns}, minmax(2.75rem, 1fr))` }}
    >
      {slots.map((slot) => (
        <SlotButton
          key={slot.id}
          slot={slot}
          zone={zone}
          group={group}
          statuses={statuses}
          labels={labels}
          highlighted={highlightedId === slot.id}
          selected={selectedId === slot.id}
          preview={filledIds.has(slot.id)}
          layout={layout}
          buttonRef={(node) => buttonRef(slot.id, node)}
          onHighlight={onHighlight}
          onSelect={onSelect}
          onMove={onMove}
          renderSlotDetail={renderSlotDetail}
        />
      ))}
    </div>
  )
}

function SlotButton({
  slot,
  zone,
  group,
  statuses,
  labels,
  highlighted,
  selected,
  preview,
  layout,
  buttonRef,
  onHighlight,
  onSelect,
  onMove,
  renderSlotDetail,
}: {
  slot: CapacitySlot
  zone: CapacityZone
  group: CapacityGroup
  statuses: SlotStatusDef[]
  labels: CapacityMapLabels
  highlighted: boolean
  selected: boolean
  preview: boolean
  layout: CapacityMapLayout
  buttonRef: (node: HTMLButtonElement | null) => void
  onHighlight?: (id: string | null) => void
  onSelect?: (id: string) => void
  onMove: (slot: CapacitySlot, key: string) => void
  renderSlotDetail?: CapacityMapProps["renderSlotDetail"]
}) {
  const [open, setOpen] = React.useState(false)
  const def = statusOf(statuses, preview ? slot.status : slot.status)
  const name = slotAccessibleName(slot, statuses, slot.detail, preview, labels)
  const fill = preview ? "bg-primary/15 text-foreground ring-1 ring-dashed ring-primary" : toneFill[def.tone]

  const refCb = React.useCallback(
    (node: HTMLButtonElement | null) => {
      buttonRef(node)
      if (node && highlighted) node.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" as ScrollBehavior })
    },
    [buttonRef, highlighted],
  )

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          ref={refCb}
          data-slot="capacity-slot"
          data-highlighted={highlighted ? "" : undefined}
          data-selected={selected ? "" : undefined}
          data-preview={preview ? "fill" : undefined}
          data-status={slot.status}
          aria-current={highlighted || selected ? "true" : undefined}
          aria-label={name}
          onMouseEnter={() => onHighlight?.(slot.id)}
          onMouseLeave={() => onHighlight?.(null)}
          onFocus={() => onHighlight?.(slot.id)}
          onClick={() => onSelect?.(slot.id)}
          onKeyDown={(event) => {
            if (["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown", "Home", "End"].includes(event.key)) {
              event.preventDefault()
              onMove(slot, event.key)
            }
          }}
          className={cn(
            "flex min-h-11 min-w-11 flex-col items-center justify-center gap-0.5 rounded-md px-1 text-[0.65rem] font-medium outline-none motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring",
            layout === "list" && "min-h-11 w-full flex-row justify-start gap-2 px-2 text-sm",
            fill,
            (highlighted || selected) && "z-10 ring-2 ring-ring ring-offset-2 ring-offset-background",
          )}
        >
          <StatusIcon status={preview ? "occupied" : slot.status} />
          <span className="max-w-full truncate">{slot.label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent
        role="dialog"
        aria-label={slot.label}
        className="w-56 motion-reduce:animate-none motion-reduce:duration-0 motion-reduce:data-open:zoom-in-100 motion-reduce:data-closed:zoom-out-100"
      >
        {renderSlotDetail ? (
          renderSlotDetail(slot, { zone, group })
        ) : (
          <div className="flex flex-col gap-1 text-sm">
            <p className="font-medium text-foreground">{slot.label}</p>
            <p className="text-muted-foreground">{statusOf(statuses, slot.status).label}</p>
            {preview ? <p className="text-muted-foreground">{labels.preview}</p> : null}
            {slot.detail ? <p className="text-foreground">{slot.detail}</p> : null}
            <p className="text-xs text-muted-foreground">
              {zone.label} · {group.label}
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}

export type CapacityMapBoardProps = CapacityMapProps & {
  rows?: readonly CapacityRow[]
}

export function CapacityMapBoard({ rows, locale = "es-MX", labels: labelProps, highlightedId, onHighlight, ...props }: CapacityMapBoardProps) {
  const labels = resolveCapacityMapLabels(locale, labelProps)
  const statuses = React.useMemo(() => resolveStatuses(props.statuses ? [...props.statuses] : undefined, locale), [props.statuses, locale])
  const highlight = useCapacityHighlight(highlightedId ?? null)
  const currentId = highlightedId ?? highlight.highlightedId
  const setHighlight = onHighlight ?? highlight.onHighlight
  const tableRows = rows ?? rowsFromZones(props.zones)

  return (
    <div className="flex flex-col gap-4">
      <CapacityMap {...props} locale={locale} labels={labelProps} highlightedId={currentId} onHighlight={setHighlight} />
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full min-w-96 text-sm">
          <caption className="sr-only">{labels.table}</caption>
          <thead className="bg-muted/50 text-left text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-medium">{labels.person}</th>
              <th className="px-3 py-2 font-medium">{labels.slot}</th>
              <th className="px-3 py-2 font-medium">{labels.status}</th>
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row) => {
              const active = currentId === row.slotId
              return (
                <tr
                  key={row.id}
                  tabIndex={0}
                  data-highlighted={active ? "" : undefined}
                  aria-label={`${row.title}, ${row.slotLabel}, ${statusOf(statuses, row.status).label}`}
                  onMouseEnter={() => setHighlight(row.slotId)}
                  onMouseLeave={() => setHighlight(null)}
                  onFocus={() => setHighlight(row.slotId)}
                  onBlur={() => setHighlight(null)}
                  className={cn("cursor-pointer outline-none focus-visible:bg-muted/60", active && "bg-muted/80")}
                >
                  <td className="px-3 py-2 text-foreground">{row.title}</td>
                  <td className="px-3 py-2 tabular-nums text-muted-foreground">{row.slotLabel}</td>
                  <td className="px-3 py-2 text-foreground">{statusOf(statuses, row.status).label}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
