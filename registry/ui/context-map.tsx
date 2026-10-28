"use client"

/**
 * What fills one context window, as tiles. Clean-room reading of a public
 * behavior description: each part shows its kind and tokens, free space stays
 * visible, and a compaction can be compared before and after. No Affect
 * source, sample data, icons, or assets were copied. Tiles do not glide or shine.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const MAP_KINDS = ["system", "tools", "memory", "file", "chat", "result", "summary"] as const

export type MapKind = (typeof MAP_KINDS)[number]

export type MapView = "before" | "after"

export type ContextBlock<TMeta = unknown> = {
  id: string
  label: string
  kind: MapKind
  tokens: number
  detail?: string
  meta?: TMeta
}

export type MapUsage = {
  used: number
  free: number
  over: boolean
}

export type ContextMapLabels = {
  title: string
  kind: Record<MapKind, string>
  tokens: (count: number) => string
  used: (used: number, limit: number) => string
  over: string
  free: string
  freeNamed: (tokens: number) => string
  before: string
  after: string
  select: (label: string, kind: string, tokens: number) => string
  empty: string
  loading: string
  none: string
}

export type ContextMapClassNames = {
  root?: string
  tile?: string
}

export type ContextMapProps<TMeta = unknown> = {
  blocks?: readonly ContextBlock<TMeta>[]
  limit?: number
  /** When set, Before and After can be compared. The host owns which blocks are showing. */
  view?: MapView
  onView?: (view: MapView) => void
  compare?: boolean
  note?: string
  status?: string
  /** A block id, or null when the free space is the one open. */
  selectedId?: string | null
  loading?: boolean
  error?: string
  title?: string
  onSelect?: (id: string | null) => void
  className?: string
  classNames?: ContextMapClassNames
  labels?: Partial<ContextMapLabels>
}

const mapLabels: ContextMapLabels = {
  title: "Context",
  kind: {
    system: "System",
    tools: "Tools",
    memory: "Memory",
    file: "File",
    chat: "Chat",
    result: "Result",
    summary: "Summary",
  },
  tokens: (count) => `${count.toLocaleString("en-US")} tokens`,
  used: (used, limit) => `${used.toLocaleString("en-US")} of ${limit.toLocaleString("en-US")}`,
  over: "Over the window",
  free: "Free",
  freeNamed: (tokens) => `Free space, ${tokens.toLocaleString("en-US")} tokens`,
  before: "Before",
  after: "After",
  select: (label, kind, tokens) => `${label}, ${kind}, ${tokens.toLocaleString("en-US")} tokens`,
  empty: "Nothing is in the window.",
  loading: "Loading the context",
  none: "Not compacted yet",
}

const KIND_CLASS: Record<MapKind, string> = {
  system: "border-border bg-muted",
  tools: "border-chart-2 bg-chart-2/15",
  memory: "border-chart-4 bg-chart-4/20",
  file: "border-primary/40 bg-primary/10",
  chat: "border-border bg-card",
  result: "border-chart-2/60 bg-chart-2/10",
  summary: "border-primary bg-primary/15",
}

function resolveLabels(partial?: Partial<ContextMapLabels>): ContextMapLabels {
  return { ...mapLabels, ...partial, kind: { ...mapLabels.kind, ...partial?.kind } }
}

export function mapUsage(blocks: readonly Pick<ContextBlock, "id" | "tokens">[], limit: number): MapUsage {
  const used = blocks.reduce((sum, block) => sum + Math.max(0, block.tokens), 0)
  return { used, free: Math.max(0, limit - used), over: limit > 0 && used > limit }
}

export function ContextMap<TMeta = unknown>({
  blocks = [],
  limit = 0,
  view,
  onView,
  compare = false,
  note,
  status,
  selectedId,
  loading = false,
  error,
  title,
  onSelect,
  className,
  classNames,
  labels: labelOverrides,
}: ContextMapProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const usage = mapUsage(blocks, limit)
  const caption = note ?? (compare ? undefined : labels.none)

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
        <Badge variant="secondary">{labels.used(usage.used, limit)}</Badge>
        {usage.over ? <Badge variant="destructive">{labels.over}</Badge> : null}
        {status ? <Badge variant="outline">{status}</Badge> : null}
        {compare ? (
          <div role="group" aria-label={heading} className="ms-auto flex gap-1">
            {(["before", "after"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={view === option}
                className={cn(
                  "rounded-md px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  view === option ? "bg-foreground text-background" : "text-muted-foreground",
                )}
                onClick={() => onView?.(option)}
              >
                {option === "before" ? labels.before : labels.after}
              </button>
            ))}
          </div>
        ) : null}
      </header>
      {caption ? <p className="text-xs text-muted-foreground">{caption}</p> : null}
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-40 w-full motion-reduce:animate-none" />
        </div>
      ) : error && blocks.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : blocks.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <ul aria-label={heading} className="flex min-h-44 flex-wrap gap-1">
            {blocks.map((block) => {
              const open = selectedId === block.id
              return (
                <li key={block.id} className="min-w-32 flex-1" style={{ flexGrow: Math.max(block.tokens, 1) }}>
                  <button
                    type="button"
                    aria-pressed={open}
                    aria-label={labels.select(block.label, labels.kind[block.kind], block.tokens)}
                    className={cn(
                      "h-full w-full rounded-md border px-2 py-2 text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      KIND_CLASS[block.kind],
                      open && "ring-2 ring-ring",
                      classNames?.tile,
                    )}
                    onClick={() => onSelect?.(block.id)}
                  >
                    <span className="block font-medium">{block.label}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {labels.kind[block.kind]} · {labels.tokens(block.tokens)}
                    </span>
                    {open && block.detail ? <span className="mt-1 block text-xs">{block.detail}</span> : null}
                  </button>
                </li>
              )
            })}
            {usage.free > 0 ? (
              <li className="min-w-32 flex-1" style={{ flexGrow: usage.free }}>
                <button
                  type="button"
                  aria-pressed={selectedId === null}
                  aria-label={labels.freeNamed(usage.free)}
                  className="h-full w-full rounded-md border border-dashed border-border px-2 py-2 text-start text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => onSelect?.(null)}
                >
                  <span className="block font-medium">{labels.free}</span>
                  <span className="mt-1 block text-xs">{labels.tokens(usage.free)}</span>
                </button>
              </li>
            ) : null}
          </ul>
        </div>
      )}
    </section>
  )
}
