"use client"

/**
 * A finished prose rewrite, word by word. Each change is accepted or rejected.
 * Clean-room reading of a public behavior description. No Affect source, sample
 * data, icons, or assets were copied. Pending words stay the original ones.
 */

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type DiffDecision = "accept" | "reject"

export type DiffSegment =
  | { type: "same"; text: string }
  | { type: "change"; id: string; remove: string; insert: string }

export type InlineDiffLabels = {
  label: string
  suggestion: (index: number, total: number, remove: string, insert: string) => string
  accept: string
  reject: string
  acceptAll: string
  rejectAll: string
  undo: string
  previous: string
  next: string
  done: string
  empty: string
  loading: string
  accepted: (left: number) => string
  rejected: (left: number) => string
}

const diffLabels: InlineDiffLabels = {
  label: "Suggested edit",
  suggestion: (index, total, remove, insert) => {
    const from = remove.trim() || "nothing"
    const to = insert.trim() || "nothing"
    return `Suggestion ${index} of ${total}: replace “${from}” with “${to}”. Press Y to accept, N to reject`
  },
  accept: "Accept",
  reject: "Reject",
  acceptAll: "Accept all",
  rejectAll: "Reject all",
  undo: "Undo",
  previous: "Previous change",
  next: "Next change",
  done: "All changes reviewed",
  empty: "Nothing to review.",
  loading: "Loading the suggestion",
  accepted: (left) => (left === 0 ? "Accepted. None left" : `Accepted. ${left} left`),
  rejected: (left) => (left === 0 ? "Rejected. None left" : `Rejected. ${left} left`),
}

function resolveLabels(partial?: Partial<InlineDiffLabels>): InlineDiffLabels {
  return { ...diffLabels, ...partial }
}

function tokens(value: string) {
  return value.match(/\s+|[^\s]+/g) ?? []
}

export function diffWords(original: string, suggested: string): DiffSegment[] {
  const left = tokens(original)
  const right = tokens(suggested)
  const rows = left.length
  const cols = right.length
  const scores: number[][] = Array.from({ length: rows + 1 }, () => Array(cols + 1).fill(0))
  for (let row = rows - 1; row >= 0; row -= 1) {
    for (let col = cols - 1; col >= 0; col -= 1) {
      scores[row]![col] = left[row] === right[col] ? (scores[row + 1]![col + 1] ?? 0) + 1 : Math.max(scores[row + 1]![col] ?? 0, scores[row]![col + 1] ?? 0)
    }
  }
  const raw: Array<{ type: "same" | "remove" | "insert"; text: string }> = []
  let row = 0
  let col = 0
  while (row < rows && col < cols) {
    if (left[row] === right[col]) {
      raw.push({ type: "same", text: left[row]! })
      row += 1
      col += 1
    } else if ((scores[row + 1]![col] ?? 0) >= (scores[row]![col + 1] ?? 0)) {
      raw.push({ type: "remove", text: left[row]! })
      row += 1
    } else {
      raw.push({ type: "insert", text: right[col]! })
      col += 1
    }
  }
  while (row < rows) {
    raw.push({ type: "remove", text: left[row]! })
    row += 1
  }
  while (col < cols) {
    raw.push({ type: "insert", text: right[col]! })
    col += 1
  }
  const segments: DiffSegment[] = []
  let change = 0
  for (let cursor = 0; cursor < raw.length; ) {
    if (raw[cursor]?.type === "same") {
      let text = ""
      while (raw[cursor]?.type === "same") {
        text += raw[cursor]!.text
        cursor += 1
      }
      segments.push({ type: "same", text })
      continue
    }
    let remove = ""
    let insert = ""
    while (cursor < raw.length && raw[cursor]?.type !== "same") {
      if (raw[cursor]?.type === "remove") remove += raw[cursor]!.text
      else insert += raw[cursor]!.text
      cursor += 1
    }
    segments.push({ type: "change", id: `c${change}`, remove, insert })
    change += 1
  }
  return segments
}

export function diffText(segments: readonly DiffSegment[], decisions: Readonly<Record<string, DiffDecision>> = {}) {
  return segments
    .map((segment) => {
      if (segment.type === "same") return segment.text
      return decisions[segment.id] === "accept" ? segment.insert : segment.remove
    })
    .join("")
}

export function InlineDiff({
  original = "",
  suggested = "",
  changes,
  decisions = {},
  label,
  loading = false,
  error,
  onDecide,
  onDecideAll,
  onUndo,
  className,
  labels: labelOverrides,
}: {
  original?: string
  suggested?: string
  changes?: readonly DiffSegment[]
  decisions?: Readonly<Record<string, DiffDecision>>
  label?: string
  loading?: boolean
  error?: string
  onDecide?: (id: string, decision: DiffDecision | "undo") => void
  onDecideAll?: (decision: DiffDecision) => void
  onUndo?: () => void
  className?: string
  labels?: Partial<InlineDiffLabels>
}) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const segments = changes ?? diffWords(original, suggested)
  const edits = segments.filter((segment): segment is Extract<DiffSegment, { type: "change" }> => segment.type === "change")
  const pending = edits.filter((segment) => !decisions[segment.id])
  const [hot, setHot] = React.useState<string | null>(pending[0]?.id ?? null)
  const active = pending.find((segment) => segment.id === hot) ?? pending[0] ?? null
  const [live, setLive] = React.useState("")
  const refs = React.useRef(new Map<string, HTMLButtonElement>())

  function focusId(id: string | null) {
    if (!id) return
    requestAnimationFrame(() => refs.current.get(id)?.focus())
  }

  function decide(id: string, decision: DiffDecision) {
    onDecide?.(id, decision)
    const left = pending.filter((segment) => segment.id !== id)
    setLive((decision === "accept" ? labels.accepted : labels.rejected)(left.length))
    const next = left[0]?.id ?? null
    setHot(next)
    focusId(next)
  }

  function step(direction: number) {
    if (pending.length === 0) return
    const index = Math.max(0, pending.findIndex((segment) => segment.id === active?.id))
    const next = pending[(index + direction + pending.length) % pending.length]
    if (!next) return
    setHot(next.id)
    focusId(next.id)
  }

  return (
    <section aria-labelledby={titleId} aria-busy={loading || undefined} className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className)}>
      <h2 id={titleId} className="text-xs font-medium text-muted-foreground">
        {label ?? labels.label}
      </h2>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-24 w-full motion-reduce:animate-none" />
        </div>
      ) : error && edits.length === 0 && !original ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : edits.length === 0 ? (
        <p className="text-muted-foreground">{error || labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <p className="leading-7">
            {segments.map((segment, index) => {
              if (segment.type === "same") return <span key={`same-${index}`}>{segment.text}</span>
              const decision = decisions[segment.id]
              if (decision === "accept") return <span key={segment.id}>{segment.insert}</span>
              if (decision === "reject") return <span key={segment.id}>{segment.remove}</span>
              const place = edits.findIndex((edit) => edit.id === segment.id) + 1
              return (
                <button
                  key={segment.id}
                  type="button"
                  ref={(node) => {
                    if (node) refs.current.set(segment.id, node)
                    else refs.current.delete(segment.id)
                  }}
                  tabIndex={segment.id === active?.id ? 0 : -1}
                  aria-label={labels.suggestion(place, edits.length, segment.remove, segment.insert)}
                  className="mx-0.5 rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => setHot(segment.id)}
                  onKeyDown={(event) => {
                    const key = event.key.toLowerCase()
                    if (key === "y" || event.key === "Enter") {
                      event.preventDefault()
                      decide(segment.id, "accept")
                    } else if (key === "n" || event.key === "Backspace") {
                      event.preventDefault()
                      decide(segment.id, "reject")
                    } else if (event.key === "Escape") {
                      event.preventDefault()
                      setHot(null)
                    }
                  }}
                >
                  {segment.remove ? <del className="rounded-sm bg-destructive/10 text-destructive no-underline line-through">{segment.remove}</del> : null}
                  {segment.insert ? <ins className="rounded-sm bg-primary/10 text-foreground no-underline">{segment.insert}</ins> : null}
                </button>
              )
            })}
          </p>
          {pending.length === 0 ? (
            <p role="status">{labels.done}</p>
          ) : active ? (
            <p className="text-xs text-muted-foreground">{labels.suggestion(edits.findIndex((edit) => edit.id === active.id) + 1, edits.length, active.remove, active.insert)}</p>
          ) : null}
          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" variant="outline" aria-label={labels.previous} onClick={() => step(-1)} disabled={pending.length === 0}>
              {labels.previous}
            </Button>
            <Button type="button" size="sm" variant="outline" aria-label={labels.next} onClick={() => step(1)} disabled={pending.length === 0}>
              {labels.next}
            </Button>
            <Button type="button" size="sm" onClick={() => active && decide(active.id, "accept")} disabled={!active}>
              {labels.accept}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => active && decide(active.id, "reject")} disabled={!active}>
              {labels.reject}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => onDecideAll?.("accept")} disabled={pending.length === 0}>
              {labels.acceptAll}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => onDecideAll?.("reject")} disabled={pending.length === 0}>
              {labels.rejectAll}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={() => onUndo?.()} disabled={Object.keys(decisions).length === 0}>
              {labels.undo}
            </Button>
          </div>
        </div>
      )}
    </section>
  )
}
