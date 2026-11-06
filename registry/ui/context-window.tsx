"use client"

/**
 * Context window for an agent console.
 *
 * Clean-room reading of a public behavior: a tick bar fills as sources load,
 * and near the limit the chat can become a summary. No Bencho or shedsgns
 * source, sample data, icons, or assets were copied.
 *
 * The host owns compaction. Crossing a threshold only notifies. Pinned
 * sources are not compacted. Pin and evict are optimistic and roll back if
 * the host rejects them.
 */

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { ArrowDown, Pin } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import {
  allocateTicks,
  applyContextEvent,
  contextTokenTotal,
  estimateContextCost,
  formatTokenCount,
  resolveModelLimit,
  thresholdInTokens,
  type ContextCompactRecord,
  type ContextEvent,
  type ContextSource,
  type ContextStatus,
  type ContextThreshold,
  type ContextWindowModel,
  type ModelLimitResolver,
  type PricingCurrency,
  type PricingLike,
} from "@/registry/retana/lib/context-window"

export type ContextActivity = "reading" | "compacting"

export type ThresholdHit = {
  kind: "warn" | "compact"
  used: number
  limit: number
}

export type ContextWindowLabels = {
  titleReading: string
  titleCompacting: string
  of: string
  tokens: (formatted: string) => string
  meter: (used: string, limit: string, parts: string) => string
  empty: string
  loading: string
  bar: string
  sources: string
  status: Record<ContextStatus, string>
  kind: (kind: string) => string
  pinned: string
  cached: (formatted: string) => string
  pin: string
  unpin: string
  evict: string
  evictPinned: string
  pinFailed: string
  evictFailed: string
  detail: string
  closeDetail: string
  compactArrow: (before: string, after: string) => string
  pressureNear: string
  pressureOver: string
  cost: (formatted: string) => string
  agent: string
  tooltip: (agent: string, line: string) => string
  announcedTotal: (used: string, limit: string) => string
  announcedCompact: (note: string) => string
}

const KIND_EN: Record<string, string> = {
  system: "System",
  tools: "Tools",
  "memory-short": "Short memory",
  "memory-mid": "Mid memory",
  "memory-long": "Long memory",
  rag: "Retrieval",
  chat: "Chat",
  file: "File",
}

const KIND_ES: Record<string, string> = {
  system: "Sistema",
  tools: "Herramientas",
  "memory-short": "Memoria corta",
  "memory-mid": "Memoria media",
  "memory-long": "Memoria larga",
  rag: "Recuperación",
  chat: "Charla",
  file: "Archivo",
}

export const contextWindowLabels: ContextWindowLabels = {
  titleReading: "Context reading",
  titleCompacting: "Context compacting",
  of: "of",
  tokens: (formatted) => `${formatted} tokens`,
  meter: (used, limit, parts) => `${used} of ${limit}. ${parts}`,
  empty: "Nothing is in this window. Sources show up when the agent starts reading.",
  loading: "Loading the window",
  bar: "Window share",
  sources: "Sources",
  status: { loading: "Loading", loaded: "Loaded", evicted: "Out", compacted: "Compacted" },
  kind: (kind) => KIND_EN[kind] ?? kind,
  pinned: "Pinned",
  cached: (formatted) => `Cache ${formatted}`,
  pin: "Pin source",
  unpin: "Unpin source",
  evict: "Remove from window",
  evictPinned: "Unpin it before removing it",
  pinFailed: "Could not pin it. The source is unchanged.",
  evictFailed: "Could not remove it. It is still in the window.",
  detail: "Source detail",
  closeDetail: "Close detail",
  compactArrow: (before, after) => `Down from ${before} to ${after}`,
  pressureNear: "Almost full",
  pressureOver: "Over the limit",
  cost: (formatted) => `About ${formatted}`,
  agent: "Agent",
  tooltip: (agent, line) => `${agent} · ${line}`,
  announcedTotal: (used, limit) => `${used} of ${limit} tokens.`,
  announcedCompact: (note) => note,
}

export const contextWindowLabelsEs: ContextWindowLabels = {
  titleReading: "Contexto leyendo",
  titleCompacting: "Contexto compactando",
  of: "de",
  tokens: (formatted) => `${formatted} tokens`,
  meter: (used, limit, parts) => `${used} de ${limit}. ${parts}`,
  empty: "Nada en la ventana. Las fuentes aparecen cuando el agente empieza a leer.",
  loading: "Cargando la ventana",
  bar: "Reparto de la ventana",
  sources: "Fuentes",
  status: { loading: "Cargando", loaded: "Lista", evicted: "Fuera", compacted: "Compactada" },
  kind: (kind) => KIND_ES[kind] ?? kind,
  pinned: "Fijada",
  cached: (formatted) => `Caché ${formatted}`,
  pin: "Fijar fuente",
  unpin: "Quitar fijación",
  evict: "Quitar de la ventana",
  evictPinned: "Suelta la fijación para quitarla",
  pinFailed: "No se pudo fijar. La fuente sigue como estaba.",
  evictFailed: "No se quitó la fuente. Sigue en la ventana.",
  detail: "Detalle de la fuente",
  closeDetail: "Cerrar detalle",
  compactArrow: (before, after) => `Bajó de ${before} a ${after}`,
  pressureNear: "Casi llena",
  pressureOver: "Sobre el límite",
  cost: (formatted) => `Unos ${formatted}`,
  agent: "Agente",
  tooltip: (agent, line) => `${agent} · ${line}`,
  announcedTotal: (used, limit) => `${used} de ${limit} tokens.`,
  announcedCompact: (note) => note,
}

export type ContextWindowClassNames = {
  root?: string
  bar?: string
  source?: string
  footer?: string
  tooltip?: string
}

export type ContextWindowProps = {
  sources?: readonly ContextSource[]
  /** When set, `sources` and `compactRecord` come from this model. */
  model?: ContextWindowModel
  compactRecord?: ContextCompactRecord | null
  modelLimit?: number
  modelId?: string
  /** Host bridge for model-router. This package does not import that branch. */
  resolveLimit?: ModelLimitResolver
  warnAt?: ContextThreshold
  compactAt?: ContextThreshold
  onThreshold?: (hit: ThresholdHit) => void
  pricing?: PricingLike
  currency?: PricingCurrency
  locale?: string
  activity?: ContextActivity
  caption?: string
  tooltip?: string
  agentLabel?: string
  onPinChange?: (id: string, pinned: boolean) => void | Promise<void>
  onEvictRequest?: (id: string) => void | Promise<void>
  onSelect?: (id: string | null) => void
  selectedId?: string | null
  labels?: Partial<ContextWindowLabels>
  className?: string
  classNames?: ContextWindowClassNames
  loading?: boolean
  error?: string
  tickCount?: number
  size?: "default" | "sm"
}

const subscribeNothing = () => () => {}

function useReducedMotionSafe() {
  const hydrated = React.useSyncExternalStore(subscribeNothing, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

function resolveLabels(partial?: Partial<ContextWindowLabels>): ContextWindowLabels {
  return {
    ...contextWindowLabels,
    ...partial,
    status: { ...contextWindowLabels.status, ...partial?.status },
  }
}

function kindTone(kind: string): string {
  switch (kind) {
    case "system":
      return "bg-chart-1"
    case "tools":
      return "bg-chart-2"
    case "memory-short":
      return "bg-chart-3"
    case "memory-mid":
      return "bg-chart-4"
    case "memory-long":
      return "bg-chart-5"
    case "rag":
      return "bg-primary"
    case "chat":
      return "bg-foreground"
    case "file":
      return "bg-ring"
    default: {
      const tones = ["bg-chart-1", "bg-chart-2", "bg-chart-3", "bg-chart-4", "bg-chart-5"] as const
      let hash = 0
      for (let index = 0; index < kind.length; index += 1) hash = (hash + kind.charCodeAt(index)) % tones.length
      return tones[hash] ?? "bg-chart-1"
    }
  }
}

function optionName(source: ContextSource, labels: ContextWindowLabels, locale: string): string {
  const parts = [
    source.label,
    labels.tokens(formatTokenCount(source.tokens, locale)),
    labels.status[source.status],
    labels.kind(source.kind),
  ]
  if (source.pinned) parts.push(labels.pinned)
  if (source.cached) parts.push(labels.cached(formatTokenCount(source.cacheTokens, locale)))
  return parts.join(", ")
}

function moveFocus(ids: readonly string[], current: string | null, key: string): string | null {
  if (ids.length === 0) return null
  const index = Math.max(0, current ? ids.indexOf(current) : 0)
  if (key === "ArrowRight" || key === "ArrowDown") return ids[Math.min(ids.length - 1, index + 1)] ?? null
  if (key === "ArrowLeft" || key === "ArrowUp") return ids[Math.max(0, index - 1)] ?? null
  if (key === "Home") return ids[0] ?? null
  if (key === "End") return ids[ids.length - 1] ?? null
  return null
}

function TokenFigure({ value, locale, reduced }: { value: number; locale: string; reduced: boolean }) {
  const text = formatTokenCount(value, locale)
  if (reduced) return <span className="tabular-nums">{text}</span>
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.span
        key={text}
        className="inline-block tabular-nums"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  )
}

function Caption({ text, reduced }: { text: string; reduced: boolean }) {
  if (!text) return null
  if (reduced) return <p className="min-w-0 text-sm text-pretty text-muted-foreground">{text}</p>
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.p
        key={text}
        className="min-w-0 text-sm text-pretty text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
      >
        {text}
      </motion.p>
    </AnimatePresence>
  )
}

export function ContextWindow({
  sources,
  model,
  compactRecord = null,
  modelLimit,
  modelId,
  resolveLimit,
  warnAt,
  compactAt,
  onThreshold,
  pricing,
  currency = "USD",
  locale = "en-US",
  activity = "reading",
  caption = "",
  tooltip,
  agentLabel,
  onPinChange,
  onEvictRequest,
  onSelect,
  selectedId,
  labels: labelOverrides,
  className,
  classNames,
  loading = false,
  error,
  tickCount = 48,
  size = "default",
}: ContextWindowProps) {
  const labels = React.useMemo(() => resolveLabels(labelOverrides), [labelOverrides])
  const reduced = useReducedMotionSafe()
  const titleId = React.useId()
  const tipId = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const tipRef = React.useRef<HTMLDivElement>(null)
  const itemRefs = React.useRef(new Map<string, HTMLDivElement>())
  const base = React.useMemo(() => model?.sources ?? sources ?? [], [model, sources])
  const record = model ? model.lastCompact : compactRecord
  const [overrides, setOverrides] = React.useState<Record<string, ContextSource>>({})
  const [busyId, setBusyId] = React.useState<string | null>(null)
  const [hotId, setHotId] = React.useState<string | null>(null)
  const [localSelected, setLocalSelected] = React.useState<string | null>(null)
  const [announcement, setAnnouncement] = React.useState("")
  const [announcedKey, setAnnouncedKey] = React.useState<string | null>(null)
  const selected = selectedId === undefined ? localSelected : selectedId
  const display = base.map((source) => overrides[source.id] ?? source)
  const visible = display.filter((source) => source.status !== "evicted")
  const used = contextTokenTotal(display)
  const limit = resolveModelLimit({
    ...(modelLimit === undefined ? {} : { modelLimit }),
    ...(modelId === undefined ? {} : { modelId }),
    ...(resolveLimit === undefined ? {} : { resolveLimit }),
  })
  const warnLine = warnAt ? thresholdInTokens(warnAt, limit) : null
  const compactLine = compactAt ? thresholdInTokens(compactAt, limit) : null
  const pressure = limit > 0 && used > limit ? "over" : warnLine !== null && used >= warnLine ? "near" : "room"
  const allocation = allocateTicks(visible, limit, tickCount)
  const cost = pricing ? estimateContextCost({ sources: display, pricing, currency, locale }) : null
  const agent = agentLabel ?? labels.agent
  const tipLine = tooltip ?? (activity === "compacting" ? labels.titleCompacting : labels.titleReading)
  const title = activity === "compacting" ? labels.titleCompacting : labels.titleReading
  const current = visible.find((source) => source.id === selected) ?? null
  const meterParts = visible
    .map((source) => `${source.label}, ${labels.status[source.status]}, ${labels.tokens(formatTokenCount(source.tokens, locale))}`)
    .join("; ")
  const meterText = labels.meter(formatTokenCount(used, locale), formatTokenCount(limit, locale), meterParts || labels.empty)
  const syncKey = base.map((source) => `${source.id}:${source.pinned}:${source.status}`).join("|")
  const [seenKey, setSeenKey] = React.useState(syncKey)
  if (seenKey !== syncKey) {
    setSeenKey(syncKey)
    setOverrides((currentOverrides) => {
      const ids = Object.keys(currentOverrides)
      if (ids.length === 0) return currentOverrides
      let changed = false
      const next = { ...currentOverrides }
      for (const id of ids) {
        const override = currentOverrides[id]
        const source = base.find((item) => item.id === id)
        if (!override || !source) continue
        if (source.pinned === override.pinned && source.status === override.status) {
          delete next[id]
          changed = true
        }
      }
      return changed ? next : currentOverrides
    })
  }
  const compactKey = record ? `${record.toId}:${record.tokensAfter}:${record.note}` : ""

  const previousUsed = React.useRef<number | null>(null)
  React.useEffect(() => {
    const before = previousUsed.current
    previousUsed.current = used
    if (before === null) return
    if (warnLine !== null && before < warnLine && used >= warnLine) onThreshold?.({ kind: "warn", used, limit })
    if (compactLine !== null && before < compactLine && used >= compactLine) onThreshold?.({ kind: "compact", used, limit })
  }, [used, limit, warnLine, compactLine, onThreshold])

  const liveKey = `${used}|${limit}|${locale}|${compactKey}`
  if (announcedKey !== liveKey) {
    const previous = announcedKey
    setAnnouncedKey(liveKey)
    if (previous !== null) {
      const previousCompact = previous.split("|")[3] ?? ""
      setAnnouncement(
        compactKey && compactKey !== previousCompact && record
          ? labels.announcedCompact(record.note)
          : labels.announcedTotal(formatTokenCount(used, locale), formatTokenCount(limit, locale)),
      )
    }
  }

  React.useEffect(() => {
    if (!selected) return undefined
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      onSelect?.(null)
      if (selectedId === undefined) setLocalSelected(null)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [selected, selectedId, onSelect])

  function select(id: string | null) {
    onSelect?.(id)
    if (selectedId === undefined) setLocalSelected(id)
  }

  function showTip(clientX: number, clientY: number) {
    const root = rootRef.current
    const tip = tipRef.current
    if (!root || !tip) return
    const rect = root.getBoundingClientRect()
    const width = tip.offsetWidth
    const height = tip.offsetHeight
    const left = Math.min(Math.max(8, clientX - rect.left + 12), Math.max(8, rect.width - width - 8))
    const top = Math.min(Math.max(8, clientY - rect.top + 16), Math.max(8, rect.height - height - 8))
    tip.style.transform = `translate3d(${left}px, ${top}px, 0)`
    tip.style.opacity = "1"
  }

  function hideTip() {
    const tip = tipRef.current
    const root = rootRef.current
    if (!tip) return
    const active = document.activeElement
    if (root && active instanceof Node && root.contains(active) && active !== root) return
    tip.style.opacity = "0"
  }

  function placeAt(node: HTMLElement) {
    const rect = node.getBoundingClientRect()
    showTip(rect.left + rect.width / 2, rect.top)
  }

  function remember(key: string, node: HTMLDivElement | null) {
    if (node) itemRefs.current.set(key, node)
    else itemRefs.current.delete(key)
  }

  function onCompositeKeyDown(event: React.KeyboardEvent, ids: readonly string[], scope: "bar" | "row") {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      if (hotId) select(selected === hotId ? null : hotId)
      return
    }
    const next = moveFocus(ids, hotId, event.key)
    if (!next) return
    event.preventDefault()
    setHotId(next)
    const node = itemRefs.current.get(`${scope}:${next}`)
    node?.focus()
    if (node) placeAt(node)
  }

  async function runAction(source: ContextSource, next: ContextSource, task: () => void | Promise<void>, failure: string) {
    if (busyId) return
    setBusyId(source.id)
    setOverrides((currentOverrides) => ({ ...currentOverrides, [source.id]: next }))
    try {
      await task()
    } catch {
      setOverrides((currentOverrides) => {
        if (!(source.id in currentOverrides)) return currentOverrides
        const copy = { ...currentOverrides }
        delete copy[source.id]
        return copy
      })
      setAnnouncement(failure)
    } finally {
      setBusyId((id) => (id === source.id ? null : id))
    }
  }

  function tabIndexFor(id: string, ids: readonly string[]) {
    const currentId = hotId && ids.includes(hotId) ? hotId : ids[0]
    return id === currentId ? 0 : -1
  }

  const rowIds = visible.map((source) => source.id)
  const barIds = allocation.segments.map((segment) => segment.id)

  return (
    <div
      ref={rootRef}
      className={cn("relative @container", className)}
      onPointerMove={(event) => {
        showTip(event.clientX, event.clientY)
        const target = event.target
        const holder = target instanceof Element ? target.closest("[data-source-id]") : null
        const id = holder?.getAttribute("data-source-id") ?? null
        setHotId((currentId) => (currentId === id ? currentId : id))
      }}
      onPointerLeave={() => {
        setHotId(null)
        hideTip()
      }}
      onBlur={(event) => {
        const next = event.relatedTarget
        if (!(next instanceof Node) || !event.currentTarget.contains(next)) {
          const tip = tipRef.current
          if (tip) tip.style.opacity = "0"
        }
      }}
    >
      <Card
        size={size}
        role="region"
        aria-labelledby={titleId}
        aria-busy={loading || undefined}
        className={classNames?.root}
      >
        <CardHeader>
          <CardTitle>
            <h2 id={titleId} className="text-base font-medium text-balance">
              {title}
            </h2>
          </CardTitle>
          <CardAction>
            <div className="flex flex-col items-end gap-1">
              {pressure === "over" ? <Badge variant="destructive">{labels.pressureOver}</Badge> : null}
              {pressure === "near" ? <Badge variant="outline">{labels.pressureNear}</Badge> : null}
              <p className="tabular-nums">
                <TokenFigure value={used} locale={locale} reduced={reduced} />
                <span className="text-muted-foreground"> {labels.of} </span>
                <span className="text-muted-foreground tabular-nums">{formatTokenCount(limit, locale)}</span>
              </p>
            </div>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <div className="sr-only" role="status" aria-live="polite">
            {announcement}
          </div>
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          {loading ? (
            <div role="status">
              <span className="sr-only">{labels.loading}</span>
              <Skeleton className="h-16 w-full motion-reduce:animate-none" />
            </div>
          ) : visible.length === 0 ? (
            <p className="text-pretty text-muted-foreground">{labels.empty}</p>
          ) : (
            <>
              <div
                className="sr-only"
                role="meter"
                aria-valuemin={0}
                aria-valuemax={Math.max(limit, used)}
                aria-valuenow={used}
                aria-valuetext={meterText}
              />
              <div
                role="listbox"
                aria-label={labels.bar}
                className={cn("flex h-3 w-full gap-px", classNames?.bar)}
                onKeyDown={(event) => onCompositeKeyDown(event, barIds, "bar")}
              >
                {allocation.segments.map((segment) => {
                  const source = visible.find((item) => item.id === segment.id)
                  if (!source) return null
                  return (
                    <motion.div
                      key={source.id}
                      layout={reduced ? false : true}
                      role="option"
                      tabIndex={tabIndexFor(source.id, barIds)}
                      aria-selected={selected === source.id}
                      aria-label={optionName(source, labels, locale)}
                      data-source-id={source.id}
                      data-status={source.status}
                      data-pinned={source.pinned ? "true" : "false"}
                      ref={(node) => remember(`bar:${source.id}`, node)}
                      className="flex h-full min-w-px gap-px rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      style={{ flexGrow: segment.count, flexBasis: 0 }}
                      initial={false}
                      animate={{ opacity: 1 }}
                      transition={reduced ? { duration: 0 } : { opacity: { duration: 0.2 }, layout: { duration: 0.28, ease: "easeOut" } }}
                      onClick={() => select(selected === source.id ? null : source.id)}
                      onFocus={() => {
                        setHotId(source.id)
                        const node = itemRefs.current.get(`bar:${source.id}`)
                        if (node) placeAt(node)
                      }}
                    >
                      {Array.from({ length: segment.count }, (_, index) => (
                        <span
                          key={index}
                          aria-hidden="true"
                          className={cn(
                            "min-w-px flex-1 rounded-full",
                            source.status === "compacted" && "h-3 bg-muted-foreground",
                            source.status === "loading" && cn("h-1.5 self-end opacity-50", kindTone(source.kind)),
                            source.status === "loaded" && cn("h-3", kindTone(source.kind)),
                          )}
                        />
                      ))}
                    </motion.div>
                  )
                })}
                {allocation.empty > 0 ? (
                  <div aria-hidden="true" className="flex h-full min-w-px gap-px" style={{ flexGrow: allocation.empty, flexBasis: 0 }}>
                    {Array.from({ length: allocation.empty }, (_, index) => (
                      <span key={index} className="min-w-px flex-1 rounded-full bg-muted" />
                    ))}
                  </div>
                ) : null}
              </div>
              <div
                role="listbox"
                aria-label={labels.sources}
                className="grid max-h-80 touch-pan-y grid-cols-1 gap-1 overflow-y-auto @[20rem]:grid-cols-3"
                onKeyDown={(event) => onCompositeKeyDown(event, rowIds, "row")}
              >
                {visible.map((source) => {
                  const drop = record && record.toId === source.id ? record : null
                  return (
                    <div
                      key={source.id}
                      role="option"
                      tabIndex={tabIndexFor(source.id, rowIds)}
                      aria-selected={selected === source.id}
                      aria-describedby={hotId === source.id ? tipId : undefined}
                      aria-label={optionName(source, labels, locale)}
                      data-source-id={source.id}
                      data-status={source.status}
                      data-pinned={source.pinned ? "true" : "false"}
                      ref={(node) => remember(`row:${source.id}`, node)}
                      className={cn(
                        "grid min-h-11 touch-pan-y grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2 rounded-md px-2 text-start",
                        "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        source.status === "compacted" && "border border-dashed border-border",
                        hotId === source.id && "bg-muted",
                        classNames?.source,
                      )}
                      onClick={() => select(selected === source.id ? null : source.id)}
                      onFocus={() => {
                        setHotId(source.id)
                        const node = itemRefs.current.get(`row:${source.id}`)
                        if (node) placeAt(node)
                      }}
                    >
                      <span aria-hidden="true" className={cn("size-2 rounded-full", kindTone(source.kind), source.status === "loading" && "opacity-50")} />
                      <span className="flex min-w-0 items-center gap-1">
                        {source.pinned ? <Pin className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
                        {source.status === "loading" ? <span aria-hidden="true">…</span> : null}
                        <span className="truncate">{source.label}</span>
                      </span>
                      <span className="flex flex-col items-end">
                        <span className="inline-flex items-center gap-1 tabular-nums">
                          {drop ? <ArrowDown className="size-3" aria-hidden="true" /> : null}
                          {formatTokenCount(source.tokens, locale)}
                        </span>
                        {drop ? (
                          <span className="text-xs text-muted-foreground line-through tabular-nums">
                            <span className="sr-only">{labels.compactArrow(formatTokenCount(drop.tokensBefore, locale), formatTokenCount(drop.tokensAfter, locale))}</span>
                            <span aria-hidden="true">{formatTokenCount(drop.tokensBefore, locale)}</span>
                          </span>
                        ) : null}
                      </span>
                    </div>
                  )
                })}
              </div>
              {current ? (
                <div role="region" aria-label={labels.detail} className="flex flex-col gap-2 rounded-lg border border-border p-3">
                  <p className="font-medium break-all">{current.label}</p>
                  <p className="text-sm text-muted-foreground">
                    {labels.kind(current.kind)} · {labels.status[current.status]}
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {current.pinned ? <Badge variant="secondary">{labels.pinned}</Badge> : null}
                    {current.cached ? <Badge variant="outline">{labels.cached(formatTokenCount(current.cacheTokens, locale))}</Badge> : null}
                  </div>
                  {cost ? <p className="text-sm tabular-nums">{labels.cost(cost.formatted)}</p> : null}
                  <div className="flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11"
                      disabled={busyId === current.id}
                      onClick={() =>
                        void runAction(current, { ...current, pinned: !current.pinned }, () => onPinChange?.(current.id, !current.pinned), labels.pinFailed)
                      }
                    >
                      {current.pinned ? labels.unpin : labels.pin}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="min-h-11"
                      disabled={current.pinned || busyId === current.id}
                      onClick={() =>
                        void runAction(current, { ...current, status: "evicted" }, () => onEvictRequest?.(current.id), labels.evictFailed)
                      }
                    >
                      {current.pinned ? labels.evictPinned : labels.evict}
                    </Button>
                    <Button type="button" variant="ghost" className="min-h-11" onClick={() => select(null)}>
                      {labels.closeDetail}
                    </Button>
                  </div>
                </div>
              ) : null}
            </>
          )}
        </CardContent>
        <CardFooter className={cn("flex-wrap items-start justify-between gap-2", classNames?.footer)}>
          <Caption text={caption} reduced={reduced} />
          {cost ? <p className="shrink-0 text-xs text-muted-foreground tabular-nums">{labels.cost(cost.formatted)}</p> : null}
        </CardFooter>
      </Card>
      <div
        ref={tipRef}
        id={tipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute top-0 left-0 flex max-w-56 items-center gap-1.5 truncate rounded-md bg-foreground px-2.5 py-1 text-xs text-background opacity-0 shadow-md",
          reduced ? "" : "transition-opacity duration-150 motion-reduce:transition-none",
          classNames?.tooltip,
        )}
      >
        <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-primary" />
        <span className="truncate">{labels.tooltip(agent, tipLine)}</span>
      </div>
    </div>
  )
}

/**
 * Applies a stream of events. Pass a factory so a fresh iterator is created
 * if the effect restarts. The factory should stay referentially stable.
 */
export function useContextEventStream(
  source: (() => AsyncIterable<ContextEvent>) | null,
  initial: ContextWindowModel,
): ContextWindowModel {
  const [state, setState] = React.useState(initial)
  const initialRef = React.useRef(initial)
  React.useEffect(() => {
    initialRef.current = initial
  }, [initial])
  React.useEffect(() => {
    if (!source) return undefined
    let cancelled = false
    let current = initialRef.current
    setState(current)
    const run = async () => {
      for await (const event of source()) {
        if (cancelled) return
        current = applyContextEvent(current, event)
        if (!cancelled) setState(current)
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [source])
  return state
}
