"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/devtools/event-log-viewer/event-log-viewer.tsx

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export type EventLogEntry = {
  id: string
  time: string | number | Date
  type: string
  message: string
  payload?: unknown
}

export type EventLogProps = {
  entries: EventLogEntry[]
  paused?: boolean
  onPausedChange?: (paused: boolean) => void
  onClear?: () => void
  maxVisible?: number
  className?: string
}

function chartFor(namespace: string, namespaces: string[]) {
  const index = Math.max(0, namespaces.indexOf(namespace))
  return `var(--chart-${(index % 5) + 1})`
}

function relative(time: string | number | Date) {
  const ms = time instanceof Date ? time.getTime() : typeof time === "number" ? time : Date.parse(time)
  if (!Number.isFinite(ms)) return ""
  const delta = Math.round((Date.now() - ms) / 1000)
  if (Math.abs(delta) < 5) return "just now"
  if (delta >= 0 && delta < 60) return `${delta}s ago`
  if (delta >= 60 && delta < 3600) return `${Math.floor(delta / 60)}m ago`
  return new Intl.DateTimeFormat("en", { hour: "numeric", minute: "2-digit" }).format(ms)
}

export function EventLog({ entries, paused = false, onPausedChange, onClear, maxVisible = 50, className }: EventLogProps) {
  const [query, setQuery] = React.useState("")
  const [namespace, setNamespace] = React.useState<string | null>(null)
  const [open, setOpen] = React.useState<string | null>(null)
  const [shown, setShown] = React.useState(maxVisible)
  const namespaces = [...new Set(entries.map((entry) => entry.type.split(":")[0]))]
  const filtered = entries.filter((entry) => {
    const space = entry.type.split(":")[0]
    if (namespace && space !== namespace) return false
    if (!query.trim()) return true
    return `${entry.type} ${entry.message}`.toLowerCase().includes(query.trim().toLowerCase())
  })
  const visible = filtered.slice(0, shown)

  return (
    <section className={cn("flex min-w-0 flex-col gap-2 rounded-lg border border-border bg-card p-3", className)}>
      <div className="flex flex-wrap items-center gap-2">
        <Input aria-label="Filter log" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Filter" className="h-8 max-w-xs" />
        <Button type="button" size="sm" variant="outline" aria-pressed={paused} onClick={() => onPausedChange?.(!paused)}>
          {paused ? "Resume" : "Pause"}
        </Button>
        {onClear ? (
          <Button type="button" size="sm" variant="ghost" onClick={onClear}>
            Clear
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap gap-1">
        {namespaces.map((item) => (
          <button
            key={item}
            type="button"
            aria-pressed={namespace === item}
            className="rounded-full border border-border px-2 py-0.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            style={{ color: chartFor(item, namespaces) }}
            onClick={() => setNamespace((current) => (current === item ? null : item))}
          >
            {item}
          </button>
        ))}
      </div>
      <ul role="log" aria-live={paused ? "off" : "polite"} className="flex max-h-80 flex-col gap-1 overflow-auto">
        {visible.map((entry) => {
          const space = entry.type.split(":")[0]
          const when = entry.time instanceof Date ? entry.time : new Date(entry.time)
          return (
            <li key={entry.id} className="rounded-md px-1 py-1 text-sm">
              <button
                type="button"
                className="flex w-full min-w-0 items-baseline gap-2 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                aria-expanded={open === entry.id}
                onClick={() => setOpen((current) => (current === entry.id ? null : entry.id))}
              >
                <time dateTime={Number.isNaN(when.getTime()) ? undefined : when.toISOString()} title={Number.isNaN(when.getTime()) ? undefined : when.toISOString()} className="shrink-0 font-mono text-xs text-muted-foreground">
                  {relative(entry.time)}
                </time>
                <span className="shrink-0 rounded-full px-1.5 text-xs" style={{ backgroundColor: `color-mix(in oklab, ${chartFor(space, namespaces)} 18%, var(--background))` }}>
                  {entry.type}
                </span>
                <span className="min-w-0 truncate text-foreground">{entry.message}</span>
              </button>
              {open === entry.id && entry.payload !== undefined ? (
                <pre className="mt-1 max-h-32 overflow-auto rounded-md bg-muted p-2 font-mono text-xs">{JSON.stringify(entry.payload, null, 2)}</pre>
              ) : null}
            </li>
          )
        })}
      </ul>
      {filtered.length > shown ? (
        <Button type="button" size="sm" variant="ghost" onClick={() => setShown((count) => count + maxVisible)}>
          Show more
        </Button>
      ) : null}
    </section>
  )
}
