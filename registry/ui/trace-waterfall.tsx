"use client"

/**
 * Where a run spent its time. Clean-room reading of a public behavior
 * description: each call is a bar on one clock, the slowest is marked, and a
 * branch can fold into its parent. No Affect source, sample data, icons, or
 * assets were copied.
 */

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const TRACE_KINDS = ["run", "note", "tool"] as const
export const TRACE_STATUSES = ["ok", "slow", "error", "running"] as const

export type TraceKind = (typeof TRACE_KINDS)[number]
export type TraceStatus = (typeof TRACE_STATUSES)[number]

export type TraceSpan<TMeta = unknown> = {
  id: string
  parentId?: string
  title: string
  agent: string
  kind: TraceKind
  startMs: number
  durationMs: number
  tokens?: number
  /** Centavos MXN. */
  costCents?: number
  status: TraceStatus
  meta?: TMeta
}

export type TraceTotals = {
  durationMs: number
  tokens: number
  costCents: number
  slowestId: string | null
  errors: number
}

export type TraceWaterfallLabels = {
  title: string
  duration: (seconds: string) => string
  tokens: (count: number) => string
  cost: (cents: number) => string
  errors: (count: number) => string
  kind: Record<TraceKind, string>
  status: Record<TraceStatus, string>
  slowest: string
  fold: (title: string, open: boolean) => string
  open: (title: string) => string
  empty: string
  loading: string
  axis: (seconds: string) => string
}

export type TraceWaterfallClassNames = {
  root?: string
  span?: string
}

export type TraceWaterfallProps<TMeta = unknown> = {
  spans?: readonly TraceSpan<TMeta>[]
  collapsed?: readonly string[]
  onCollapsedChange?: (ids: string[]) => void
  loading?: boolean
  error?: string
  title?: string
  onOpen?: (id: string) => void
  className?: string
  classNames?: TraceWaterfallClassNames
  labels?: Partial<TraceWaterfallLabels>
}

const traceLabels: TraceWaterfallLabels = {
  title: "Run trace",
  duration: (seconds) => `${seconds} s`,
  tokens: (count) => `${count} tokens`,
  cost: (cents) => {
    const sign = cents < 0 ? "-" : ""
    const abs = Math.abs(Math.round(cents))
    return `${sign}$${Math.floor(abs / 100)}.${(abs % 100).toString().padStart(2, "0")} MXN`
  },
  errors: (count) => (count === 1 ? "1 error" : `${count} errors`),
  kind: { run: "Run", note: "Note", tool: "Tool" },
  status: { ok: "Ok", slow: "Slow", error: "Error", running: "In progress" },
  slowest: "Slowest step",
  fold: (title, open) => (open ? `Fold “${title}”` : `Unfold “${title}”`),
  open: (title) => `Open “${title}”`,
  empty: "This run has no spans yet.",
  loading: "Loading the trace",
  axis: (seconds) => seconds,
}

function resolveLabels(partial?: Partial<TraceWaterfallLabels>): TraceWaterfallLabels {
  return {
    ...traceLabels,
    ...partial,
    kind: { ...traceLabels.kind, ...partial?.kind },
    status: { ...traceLabels.status, ...partial?.status },
  }
}

export function formatTraceSeconds(ms: number) {
  return (Math.max(0, ms) / 1000).toFixed(1)
}

export function traceTotals(spans: readonly Pick<TraceSpan, "id" | "parentId" | "startMs" | "durationMs" | "tokens" | "costCents" | "status">[]): TraceTotals {
  const parents = new Set(spans.flatMap((span) => (span.parentId ? [span.parentId] : [])))
  const leaves = spans.filter((span) => !parents.has(span.id))
  const pool = leaves.length > 0 ? leaves : spans
  let slowestId: string | null = null
  let slowest = -1
  for (const span of pool) {
    if (span.durationMs > slowest) {
      slowest = span.durationMs
      slowestId = span.id
    }
  }
  let tokens = 0
  let costCents = 0
  let errors = 0
  let end = 0
  for (const span of spans) {
    tokens += span.tokens ?? 0
    costCents += span.costCents ?? 0
    if (span.status === "error") errors += 1
    end = Math.max(end, span.startMs + span.durationMs)
  }
  return { durationMs: end, tokens, costCents, slowestId, errors }
}

function childrenOf(spans: readonly TraceSpan[], id: string) {
  return spans.filter((span) => span.parentId === id)
}

function hiddenBy(spans: readonly TraceSpan[], collapsed: readonly string[]) {
  const hidden = new Set<string>()
  const walk = (id: string) => {
    for (const child of spans) {
      if (child.parentId !== id || hidden.has(child.id)) continue
      hidden.add(child.id)
      walk(child.id)
    }
  }
  for (const id of collapsed) walk(id)
  return hidden
}

function depthOf(spans: readonly TraceSpan[], id: string) {
  let depth = 0
  let current = spans.find((span) => span.id === id)
  const seen = new Set<string>()
  while (current?.parentId && !seen.has(current.id)) {
    seen.add(current.id)
    depth += 1
    current = spans.find((span) => span.id === current?.parentId)
  }
  return depth
}

const BAR: Record<TraceStatus, string> = {
  ok: "bg-primary/70",
  slow: "bg-chart-4",
  error: "bg-destructive",
  running: "bg-chart-2",
}

export function TraceWaterfall<TMeta = unknown>({
  spans = [],
  collapsed: collapsedProp,
  onCollapsedChange,
  loading = false,
  error,
  title,
  onOpen,
  className,
  classNames,
  labels: labelOverrides,
}: TraceWaterfallProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const [collapsedState, setCollapsedState] = React.useState<string[]>([])
  const collapsed = collapsedProp ?? collapsedState
  const totals = traceTotals(spans)
  const hidden = hiddenBy(spans, collapsed)
  const windowMs = Math.max(totals.durationMs, 1)
  const rootsFirst = [...spans].sort((a, b) => a.startMs - b.startMs || a.title.localeCompare(b.title))

  function toggle(id: string) {
    const next = collapsed.includes(id) ? collapsed.filter((item) => item !== id) : [...collapsed, id]
    if (collapsedProp === undefined) setCollapsedState(next)
    onCollapsedChange?.(next)
  }

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
        <Badge variant="secondary">{labels.duration(formatTraceSeconds(totals.durationMs))}</Badge>
        <Badge variant="outline">{labels.tokens(totals.tokens)}</Badge>
        <Badge variant="outline">{labels.cost(totals.costCents)}</Badge>
        {totals.errors > 0 ? <Badge variant="destructive">{labels.errors(totals.errors)}</Badge> : null}
      </header>
      {loading ? (
        <div role="status" className="flex flex-col gap-2">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-10 w-full motion-reduce:animate-none" />
          <Skeleton className="h-10 w-full motion-reduce:animate-none" />
        </div>
      ) : error && spans.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : spans.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-2">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex justify-between text-xs text-muted-foreground" aria-hidden="true">
            <span>{labels.axis("0.0")}</span>
            <span>{labels.axis(formatTraceSeconds(windowMs / 2))}</span>
            <span>{labels.axis(formatTraceSeconds(windowMs))}</span>
          </div>
          <ul className="flex flex-col gap-1.5">
            {rootsFirst.map((span) => {
              if (hidden.has(span.id)) return null
              const kids = childrenOf(spans, span.id)
              const open = !collapsed.includes(span.id)
              const depth = depthOf(spans, span.id)
              const left = ((span.startMs / windowMs) * 100).toFixed(2)
              const width = Math.max(1.5, (span.durationMs / windowMs) * 100).toFixed(2)
              const slowest = span.id === totals.slowestId
              return (
                <li key={span.id} className={cn("flex flex-col gap-1", classNames?.span)} style={{ paddingInlineStart: `${depth * 0.75}rem` }}>
                  <div className="flex flex-wrap items-center gap-2">
                    {kids.length > 0 ? (
                      <Button type="button" size="sm" variant="ghost" aria-expanded={open} aria-label={labels.fold(span.title, open)} onClick={() => toggle(span.id)}>
                        <ChevronDown aria-hidden="true" className={cn("transition-transform motion-reduce:transition-none", open && "rotate-180")} />
                      </Button>
                    ) : (
                      <span className="size-8" aria-hidden="true" />
                    )}
                    <button
                      type="button"
                      className="min-w-0 flex-1 rounded-md text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                      aria-label={labels.open(span.title)}
                      onClick={() => onOpen?.(span.id)}
                    >
                      <span className="flex flex-wrap items-center gap-2">
                        <span className="font-medium">{span.title}</span>
                        <Badge variant="outline">{labels.kind[span.kind]}</Badge>
                        <Badge variant={span.status === "error" ? "destructive" : "secondary"}>{labels.status[span.status]}</Badge>
                        {slowest ? <Badge variant="outline">{labels.slowest}</Badge> : null}
                        <span className="text-xs text-muted-foreground">{span.agent}</span>
                        <span className="ms-auto text-xs text-muted-foreground">
                          {labels.duration(formatTraceSeconds(span.durationMs))}
                          {span.costCents ? ` · ${labels.cost(span.costCents)}` : ""}
                        </span>
                      </span>
                    </button>
                  </div>
                  <div className="relative h-2 rounded-full bg-muted" aria-hidden="true">
                    <span className={cn("absolute top-0 h-full rounded-full", BAR[span.status])} style={{ left: `${left}%`, width: `${width}%` }} />
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}
