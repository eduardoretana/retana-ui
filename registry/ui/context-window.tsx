"use client"

/**
 * The same window as a field of cells plus the list under it. Clean-room
 * reading of a public behavior description: a person can drop a file and
 * compact the conversation. The field is decorative. No Affect source, sample
 * data, icons, or assets were copied. Cells do not shimmer.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const WINDOW_PRESSURES = ["room", "tight", "full"] as const

export type WindowPressure = (typeof WINDOW_PRESSURES)[number]

export type WindowItem<TMeta = unknown> = {
  id: string
  label: string
  tokens: number
  meta?: TMeta
}

export type WindowPart<TMeta = unknown> = {
  id: string
  label: string
  tokens?: number
  items?: readonly WindowItem<TMeta>[]
  locked?: boolean
  compactable?: boolean
  compact?: boolean
  meta?: TMeta
}

export type ContextWindowLabels = {
  title: string
  summary: (used: number, limit: number, percent: number) => string
  tokens: (count: number) => string
  pressure: Record<WindowPressure, string>
  left: (count: number) => string
  open: (label: string) => string
  remove: string
  removeNamed: (label: string) => string
  compact: string
  compactNamed: (label: string) => string
  compacted: string
  removed: (label: string) => string
  compacting: (label: string) => string
  empty: string
  loading: string
}

export type ContextWindowClassNames = {
  root?: string
  part?: string
}

export type ContextWindowProps<TMeta = unknown> = {
  parts?: readonly WindowPart<TMeta>[]
  limit?: number
  note?: string
  loading?: boolean
  error?: string
  title?: string
  onRemove?: (partId: string, itemId: string) => void
  onCompact?: (partId: string) => void
  className?: string
  classNames?: ContextWindowClassNames
  labels?: Partial<ContextWindowLabels>
}

const COLUMNS = 12
const CELLS = 48

const TONES = ["bg-muted", "bg-chart-2/70", "bg-primary/40", "bg-chart-4/70", "bg-foreground/25"] as const

const windowLabels: ContextWindowLabels = {
  title: "Context window",
  summary: (used, limit, percent) => `${used.toLocaleString("en-US")} of ${limit.toLocaleString("en-US")} tokens, ${percent}%`,
  tokens: (count) => `${count.toLocaleString("en-US")} tokens`,
  pressure: { room: "Room left", tight: "Getting full", full: "The window is full" },
  left: (count) => `${count.toLocaleString("en-US")} tokens left`,
  open: (label) => `Open “${label}”`,
  remove: "Remove",
  removeNamed: (label) => `Remove “${label}”`,
  compact: "Compact",
  compactNamed: (label) => `Compact “${label}”`,
  compacted: "Compacted",
  removed: (label) => `Removed “${label}”`,
  compacting: (label) => `Compacting “${label}”`,
  empty: "Nothing is in this window.",
  loading: "Loading the window",
}

function resolveLabels(partial?: Partial<ContextWindowLabels>): ContextWindowLabels {
  return { ...windowLabels, ...partial, pressure: { ...windowLabels.pressure, ...partial?.pressure } }
}

export function windowTokens(part: Pick<WindowPart, "id" | "tokens" | "items">) {
  if (part.items && part.items.length > 0) return part.items.reduce((sum, item) => sum + Math.max(0, item.tokens), 0)
  return Math.max(0, part.tokens ?? 0)
}

export function windowUsed(parts: readonly Pick<WindowPart, "id" | "tokens" | "items">[]) {
  return parts.reduce((sum, part) => sum + windowTokens(part), 0)
}

export function windowPressure(used: number, limit: number): WindowPressure {
  if (limit <= 0) return "room"
  const ratio = used / limit
  if (ratio >= 0.95) return "full"
  if (ratio >= 0.8) return "tight"
  return "room"
}

function cellOwners(parts: readonly WindowPart[], limit: number) {
  const used = windowUsed(parts)
  const budget = Math.max(limit, used, 1)
  const counts = parts.map((part) => {
    const tokens = windowTokens(part)
    if (tokens <= 0) return 0
    return Math.max(1, Math.round((tokens / budget) * CELLS))
  })
  let total = counts.reduce((sum, count) => sum + count, 0)
  while (total > CELLS) {
    let index = 0
    for (let cursor = 1; cursor < counts.length; cursor += 1) {
      if ((counts[cursor] ?? 0) > (counts[index] ?? 0)) index = cursor
    }
    if ((counts[index] ?? 0) <= 1) break
    counts[index] = (counts[index] ?? 1) - 1
    total -= 1
  }
  const cells: Array<{ id: string; tone: string } | null> = []
  parts.forEach((part, index) => {
    const tone = TONES[index % TONES.length] ?? "bg-muted"
    for (let cursor = 0; cursor < (counts[index] ?? 0) && cells.length < CELLS; cursor += 1) cells.push({ id: part.id, tone })
  })
  while (cells.length < CELLS) cells.push(null)
  return cells
}

export function ContextWindow<TMeta = unknown>({
  parts = [],
  limit = 0,
  note,
  loading = false,
  error,
  title,
  onRemove,
  onCompact,
  className,
  classNames,
  labels: labelOverrides,
}: ContextWindowProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const used = windowUsed(parts)
  const percent = limit > 0 ? Math.round((used / limit) * 100) : 0
  const pressure = windowPressure(used, limit)
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [hotId, setHotId] = React.useState<string | null>(null)
  const [live, setLive] = React.useState("")
  const cells = cellOwners(parts, limit)

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className, classNames?.root)}
    >
      <header className="flex flex-wrap items-center gap-2">
        <h2 id={titleId} className="font-medium">
          {heading}
        </h2>
        {note ? <Badge variant="outline">{note}</Badge> : null}
        <Badge variant={pressure === "room" ? "secondary" : pressure === "tight" ? "outline" : "destructive"}>{labels.pressure[pressure]}</Badge>
      </header>
      <p>{labels.summary(used, limit, percent)}</p>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-28 w-full motion-reduce:animate-none" />
        </div>
      ) : error && parts.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : parts.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <div aria-hidden="true" className="grid gap-0.5" style={{ gridTemplateColumns: `repeat(${COLUMNS}, minmax(0, 1fr))` }}>
            {cells.map((cell, index) => (
              <span
                key={index}
                className={cn("h-2 rounded-sm", cell ? cell.tone : "border border-dashed border-border", hotId && cell?.id === hotId && "ring-1 ring-ring")}
              />
            ))}
          </div>
          <ul className="flex flex-col gap-2">
            {parts.map((part) => {
              const tokens = windowTokens(part)
              const open = openId === part.id
              return (
                <li
                  key={part.id}
                  className={cn("rounded-lg border border-border px-3 py-2", classNames?.part)}
                  onMouseEnter={() => setHotId(part.id)}
                  onMouseLeave={() => setHotId(null)}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    {part.items ? (
                      <button
                        type="button"
                        aria-expanded={open}
                        aria-label={labels.open(part.label)}
                        className="font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                        onClick={() => setOpenId(open ? null : part.id)}
                        onFocus={() => setHotId(part.id)}
                      >
                        {part.label}
                      </button>
                    ) : (
                      <h3 className="font-medium">{part.label}</h3>
                    )}
                    <span className="text-xs text-muted-foreground">{labels.tokens(tokens)}</span>
                    {part.compact ? <Badge variant="secondary">{labels.compacted}</Badge> : null}
                    {part.compactable && !part.compact ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        className="ms-auto"
                        aria-label={labels.compactNamed(part.label)}
                        onClick={() => {
                          onCompact?.(part.id)
                          setLive(labels.compacting(part.label))
                        }}
                      >
                        {labels.compact}
                      </Button>
                    ) : null}
                  </div>
                  {open && part.items ? (
                    <ul className="mt-2 flex flex-col gap-1">
                      {part.items.map((item) => (
                        <li key={item.id} className="flex flex-wrap items-center gap-2">
                          <span>{item.label}</span>
                          <span className="text-xs text-muted-foreground">{labels.tokens(item.tokens)}</span>
                          {part.locked ? null : (
                            <Button
                              type="button"
                              size="sm"
                              variant="outline"
                              className="ms-auto"
                              aria-label={labels.removeNamed(item.label)}
                              onClick={() => {
                                onRemove?.(part.id, item.id)
                                setLive(labels.removed(item.label))
                              }}
                            >
                              {labels.remove}
                            </Button>
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </li>
              )
            })}
          </ul>
          {pressure !== "room" ? <p className="text-xs text-muted-foreground">{labels.left(Math.max(0, limit - used))}</p> : null}
        </div>
      )}
    </section>
  )
}
