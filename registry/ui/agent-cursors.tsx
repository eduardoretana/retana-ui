"use client"

/**
 * Agents on one note, the way teammates share a page. Clean-room reading of a
 * public behavior description: each agent has a pointer and a name, and a
 * suggestion stays put until someone accepts it. Positions are owned by the
 * host. Nothing types itself out. No Affect source, sample data, icons, or
 * assets were copied.
 */

import * as React from "react"
import { Check, MousePointer2 } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type CursorParagraph = {
  id: string
  text: string
}

export type CursorMark<TMeta = unknown> = {
  id: string
  name: string
  /** 0 to 100 across the note. */
  x: number
  /** 0 to 100 down the note. */
  y: number
  note?: string
  away?: boolean
  meta?: TMeta
}

export type CursorSuggestion<TMeta = unknown> = {
  id: string
  cursorId: string
  text: string
  accepted?: boolean
  meta?: TMeta
}

export type AgentCursorsLabels = {
  title: string
  present: (count: number) => string
  away: string
  here: string
  pointer: (name: string, note?: string) => string
  suggestions: string
  accept: string
  acceptNamed: (name: string) => string
  accepted: string
  acceptedLive: (text: string) => string
  emptyPointers: string
  emptyNote: string
  loading: string
}

export type AgentCursorsClassNames = {
  root?: string
  note?: string
  pointer?: string
}

export type AgentCursorsProps<TMeta = unknown> = {
  paragraphs?: readonly CursorParagraph[]
  cursors?: readonly CursorMark<TMeta>[]
  suggestions?: readonly CursorSuggestion<TMeta>[]
  loading?: boolean
  error?: string
  title?: string
  onFocus?: (id: string) => void
  onAccept?: (id: string) => void
  className?: string
  classNames?: AgentCursorsClassNames
  labels?: Partial<AgentCursorsLabels>
}

const cursorLabels: AgentCursorsLabels = {
  title: "On the note",
  present: (count) => (count === 1 ? "1 here" : `${count} here`),
  away: "Away",
  here: "Here",
  pointer: (name, note) => (note ? `${name}, ${note}` : name),
  suggestions: "Suggestions",
  accept: "Accept",
  acceptNamed: (name) => `Accept ${name}'s suggestion`,
  accepted: "Accepted",
  acceptedLive: (text) => `Accepted “${text}”`,
  emptyPointers: "Nobody else is on this note.",
  emptyNote: "The note is blank.",
  loading: "Loading the note",
}

function resolveLabels(partial?: Partial<AgentCursorsLabels>): AgentCursorsLabels {
  return { ...cursorLabels, ...partial }
}

export function cursorsPresent(cursors: readonly Pick<CursorMark, "id" | "away">[]) {
  return cursors.filter((cursor) => !cursor.away).length
}

const RINGS = ["text-primary", "text-chart-2", "text-chart-4"] as const

export function AgentCursors<TMeta = unknown>({
  paragraphs = [],
  cursors = [],
  suggestions = [],
  loading = false,
  error,
  title,
  onFocus,
  onAccept,
  className,
  classNames,
  labels: labelOverrides,
}: AgentCursorsProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const [live, setLive] = React.useState("")
  const names = new Map(cursors.map((cursor) => [cursor.id, cursor.name]))

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
        <Badge variant="secondary">{labels.present(cursorsPresent(cursors))}</Badge>
      </header>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-40 w-full motion-reduce:animate-none" />
        </div>
      ) : error && paragraphs.length === 0 && cursors.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <div className={cn("relative min-h-48 rounded-lg border border-border p-3", classNames?.note)}>
            {paragraphs.length === 0 ? (
              <p className="text-muted-foreground">{labels.emptyNote}</p>
            ) : (
              paragraphs.map((paragraph) => (
                <p key={paragraph.id} id={paragraph.id} className="mb-2 last:mb-0">
                  {paragraph.text}
                </p>
              ))
            )}
            {cursors.map((cursor, index) => (
              <button
                key={cursor.id}
                type="button"
                className={cn(
                  "absolute z-10 flex max-w-40 items-start gap-1 rounded-md bg-card/90 px-1 py-0.5 text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  cursor.away && "opacity-60",
                  RINGS[index % RINGS.length],
                  classNames?.pointer,
                )}
                style={{ left: `${Math.min(88, Math.max(4, cursor.x))}%`, top: `${Math.min(82, Math.max(4, cursor.y))}%` }}
                aria-label={labels.pointer(cursor.name, cursor.note)}
                onClick={() => onFocus?.(cursor.id)}
              >
                <MousePointer2 aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                <span className="min-w-0 text-xs text-card-foreground">
                  <span className="block truncate font-medium">{cursor.name}</span>
                  <span className="block truncate text-muted-foreground">{cursor.away ? labels.away : (cursor.note ?? labels.here)}</span>
                </span>
              </button>
            ))}
          </div>
          {cursors.length === 0 ? <p className="text-xs text-muted-foreground">{labels.emptyPointers}</p> : null}
          {suggestions.length > 0 ? (
            <div>
              <h3 className="text-xs font-medium text-muted-foreground">{labels.suggestions}</h3>
              <ul className="mt-2 flex flex-col gap-2">
                {suggestions.map((suggestion) => {
                  const name = names.get(suggestion.cursorId) ?? suggestion.cursorId
                  return (
                    <li key={suggestion.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2">
                      <p className="min-w-0 flex-1">
                        <span className="text-xs text-muted-foreground">{name}</span>
                        <span className="mt-0.5 block">{suggestion.text}</span>
                      </p>
                      {suggestion.accepted ? (
                        <Badge variant="secondary">
                          <Check aria-hidden="true" />
                          {labels.accepted}
                        </Badge>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          aria-label={labels.acceptNamed(name)}
                          onClick={() => {
                            onAccept?.(suggestion.id)
                            setLive(labels.acceptedLive(suggestion.text))
                          }}
                        >
                          {labels.accept}
                        </Button>
                      )}
                    </li>
                  )
                })}
              </ul>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
