"use client"

/**
 * One waiting item at a time, highest risk first, with the shaky spans marked.
 * Clean-room reading of a public behavior description. No Affect source, sample
 * data, icons, or assets were copied. The host owns the clock and the queue.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

export const REVIEW_RISKS = ["high", "medium", "low"] as const
export const REVIEW_FILTERS = ["all", "high", "unsure"] as const

export type ReviewRisk = (typeof REVIEW_RISKS)[number]
export type ReviewFilter = (typeof REVIEW_FILTERS)[number]
export type ReviewDecision = "approve" | "reject"

export type ReviewSpan = { text: string; note?: string }

export type ReviewLine = { kind: "same" | "add" | "remove"; text: string; number?: number }

export type ReviewFile<TMeta = unknown> = {
  path: string
  added?: number
  removed?: number
  lines?: readonly ReviewLine[]
  meta?: TMeta
}

export type ReviewItem<TMeta = unknown> = {
  id: string
  title: string
  agent: string
  type: string
  risk: ReviewRisk
  confidence: number
  waiting: string
  late?: boolean
  skipped?: boolean
  reasoning?: string
  body?: readonly ReviewSpan[]
  files?: readonly ReviewFile<TMeta>[]
  meta?: TMeta
}

export type ReviewCenterLabels = {
  title: string
  progress: (done: number, total: number) => string
  filter: string
  filters: Record<ReviewFilter, string>
  risk: Record<ReviewRisk, string>
  confidence: (percent: number) => string
  unsure: string
  row: (title: string, type: string, risk: string, percent: number, waiting: string) => string
  why: string
  flags: (count: number) => string
  files: string
  approve: string
  edit: string
  save: string
  cancel: string
  reject: string
  skip: string
  undo: string
  undoOffer: (title: string) => string
  reasons: string
  skipped: string
  empty: string
  emptyFilter: string
  loading: string
  approved: (title: string) => string
  rejected: (title: string) => string
  skippedNamed: (title: string) => string
  undone: (title: string) => string
  draft: string
}

export type ReviewResult = { decision: ReviewDecision; reason?: string; text?: string }

const RISK_RANK: Record<ReviewRisk, number> = { high: 0, medium: 1, low: 2 }

const reviewLabels: ReviewCenterLabels = {
  title: "Review",
  progress: (done, total) => `${done} of ${total} reviewed`,
  filter: "Queue",
  filters: { all: "All", high: "High risk", unsure: "Unsure" },
  risk: { high: "High risk", medium: "Medium risk", low: "Low risk" },
  confidence: (percent) => `${percent}% sure`,
  unsure: "Unsure",
  row: (title, type, risk, percent, waiting) => `${title}, ${type}, ${risk}, ${percent}% sure, waiting ${waiting}`,
  why: "Why",
  flags: (count) => (count === 1 ? "1 flagged span" : `${count} flagged spans`),
  files: "Files",
  approve: "Approve",
  edit: "Edit",
  save: "Save and approve",
  cancel: "Cancel",
  reject: "Reject",
  skip: "Skip",
  undo: "Undo",
  undoOffer: (title) => `Last step, “${title}”`,
  reasons: "Why not",
  skipped: "Skipped",
  empty: "Nothing is waiting for review.",
  emptyFilter: "Nothing in this queue matches.",
  loading: "Loading the queue",
  approved: (title) => `Approved “${title}”`,
  rejected: (title) => `Rejected “${title}”`,
  skippedNamed: (title) => `Skipped “${title}”`,
  undone: (title) => `Brought “${title}” back`,
  draft: "Edited text",
}

function resolveLabels(partial?: Partial<ReviewCenterLabels>): ReviewCenterLabels {
  return {
    ...reviewLabels,
    ...partial,
    filters: { ...reviewLabels.filters, ...partial?.filters },
    risk: { ...reviewLabels.risk, ...partial?.risk },
  }
}

export function reviewQueue<T extends Pick<ReviewItem, "id" | "risk" | "confidence">>(
  items: readonly T[],
  filter: ReviewFilter = "all",
  lowConfidence = 0.7,
) {
  return items
    .filter((item) => {
      if (filter === "high") return item.risk === "high"
      if (filter === "unsure") return item.confidence < lowConfidence
      return true
    })
    .slice()
    .sort((a, b) => RISK_RANK[a.risk] - RISK_RANK[b.risk])
}

function percentOf(confidence: number) {
  return Math.round(Math.min(1, Math.max(0, confidence)) * 100)
}

function plainText(body: readonly ReviewSpan[] | undefined) {
  return (body ?? []).map((span) => span.text).join("")
}

export function ReviewCenter<TMeta = unknown>({
  items = [],
  reviewed = 0,
  total,
  filter: filterProp,
  defaultFilter = "all",
  onFilterChange,
  selectedId,
  onSelect,
  lowConfidence = 0.7,
  reasons = ["The deposit does not match", "The tone is off", "It should not go out yet", "Another reason"],
  undo,
  loading = false,
  error,
  title,
  onDecide,
  onSkip,
  onUndo,
  className,
  labels: labelOverrides,
}: {
  items?: readonly ReviewItem<TMeta>[]
  reviewed?: number
  total?: number
  filter?: ReviewFilter
  defaultFilter?: ReviewFilter
  onFilterChange?: (filter: ReviewFilter) => void
  selectedId?: string | null
  onSelect?: (id: string) => void
  lowConfidence?: number
  reasons?: readonly string[]
  undo?: { title: string } | null
  loading?: boolean
  error?: string
  title?: string
  onDecide?: (id: string, result: ReviewResult) => void
  onSkip?: (id: string) => void
  onUndo?: () => void
  className?: string
  labels?: Partial<ReviewCenterLabels>
}) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const heading = title ?? labels.title
  const [localFilter, setLocalFilter] = React.useState(defaultFilter)
  const filter = filterProp ?? localFilter
  const queue = reviewQueue(items, filter, lowConfidence)
  const active = queue.find((item) => item.id === selectedId) ?? queue[0] ?? null
  const [rejecting, setRejecting] = React.useState(false)
  const [editing, setEditing] = React.useState(false)
  const [draft, setDraft] = React.useState("")
  const [noteId, setNoteId] = React.useState<number | null>(null)
  const [live, setLive] = React.useState("")
  const count = total ?? reviewed + items.length
  const flagIndexes = (active?.body ?? []).flatMap((span, index) => (span.note ? [index] : []))

  function chooseFilter(next: ReviewFilter) {
    if (filterProp == null) setLocalFilter(next)
    onFilterChange?.(next)
    setRejecting(false)
    setEditing(false)
  }

  function choose(id: string) {
    onSelect?.(id)
    setRejecting(false)
    setEditing(false)
    setNoteId(null)
  }

  function move(step: number) {
    if (!active) return
    const index = queue.findIndex((item) => item.id === active.id)
    const next = queue[index + step]
    if (next) choose(next.id)
  }

  function approve(text?: string) {
    if (!active) return
    onDecide?.(active.id, { decision: "approve", text })
    setLive(labels.approved(active.title))
    setEditing(false)
    setRejecting(false)
  }

  function reject(reason: string) {
    if (!active) return
    onDecide?.(active.id, { decision: "reject", reason })
    setLive(labels.rejected(active.title))
    setRejecting(false)
  }

  function skip() {
    if (!active) return
    onSkip?.(active.id)
    setLive(labels.skippedNamed(active.title))
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    const target = event.target as HTMLElement
    if (target.closest("textarea, input")) {
      if (event.key === "Escape") {
        event.preventDefault()
        setEditing(false)
      }
      if (event.key === "Enter" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        approve(draft)
      }
      return
    }
    if (event.key === "Escape") {
      event.preventDefault()
      setRejecting(false)
      setEditing(false)
      setNoteId(null)
      return
    }
    if (rejecting && /^[1-9]$/.test(event.key)) {
      const reason = reasons[Number(event.key) - 1]
      if (reason) {
        event.preventDefault()
        reject(reason)
      }
      return
    }
    const key = event.key.toLowerCase()
    if (key === "a") {
      event.preventDefault()
      approve(editing ? draft : undefined)
    } else if (key === "e") {
      event.preventDefault()
      setDraft(plainText(active?.body))
      setEditing(true)
      setRejecting(false)
    } else if (key === "r") {
      event.preventDefault()
      setRejecting(true)
      setEditing(false)
    } else if (key === "s") {
      event.preventDefault()
      skip()
    } else if (key === "z") {
      event.preventDefault()
      onUndo?.()
      if (undo) setLive(labels.undone(undo.title))
    } else if (key === "j" || event.key === "ArrowDown") {
      event.preventDefault()
      move(1)
    } else if (key === "k" || event.key === "ArrowUp") {
      event.preventDefault()
      move(-1)
    } else if (key === "f" && flagIndexes.length > 0) {
      event.preventDefault()
      setNoteId((current) => {
        const place = flagIndexes.indexOf(current ?? -1)
        return flagIndexes[(place + 1) % flagIndexes.length] ?? null
      })
    }
  }

  return (
    <section
      aria-labelledby={titleId}
      aria-busy={loading || undefined}
      onKeyDown={onKeyDown}
      className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className)}
    >
      <header className="flex flex-wrap items-center gap-2">
        <h2 id={titleId} className="font-medium">
          {heading}
        </h2>
        <Badge variant="secondary">{labels.progress(reviewed, count)}</Badge>
      </header>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-40 w-full motion-reduce:animate-none" />
        </div>
      ) : error && items.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : items.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <div role="radiogroup" aria-label={labels.filter} className="flex flex-wrap gap-1">
            {REVIEW_FILTERS.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={filter === option}
                className={cn(
                  "rounded-md px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  filter === option ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
                )}
                onClick={() => chooseFilter(option)}
              >
                {labels.filters[option]}
              </button>
            ))}
          </div>
          {queue.length === 0 ? (
            <p className="text-muted-foreground">{labels.emptyFilter}</p>
          ) : (
            <div className="flex flex-col gap-3 md:flex-row">
              <ul aria-label={heading} className="flex max-h-48 flex-col gap-1 overflow-auto md:w-60 md:max-h-80">
                {queue.map((item) => {
                  const percent = percentOf(item.confidence)
                  const current = item.id === active?.id
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-current={current ? "true" : undefined}
                        aria-label={labels.row(item.title, item.type, labels.risk[item.risk], percent, item.waiting)}
                        className={cn(
                          "flex w-full flex-col gap-1 rounded-md border px-2 py-2 text-start focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                          current ? "border-ring bg-muted" : "border-border",
                        )}
                        onClick={() => choose(item.id)}
                      >
                        <span className="font-medium">{item.title}</span>
                        <span className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
                          <span>{item.type}</span>
                          <span className={item.late ? "text-destructive" : undefined}>{item.waiting}</span>
                          {item.skipped ? <Badge variant="outline">{labels.skipped}</Badge> : null}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>
              {active ? (
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{active.agent}</p>
                    <Badge variant={active.risk === "high" ? "destructive" : "outline"}>{labels.risk[active.risk]}</Badge>
                    {active.confidence < lowConfidence ? <Badge variant="outline">{labels.unsure}</Badge> : null}
                    <span className="text-xs text-muted-foreground">{labels.confidence(percentOf(active.confidence))}</span>
                  </div>
                  {active.reasoning ? (
                    <p>
                      <span className="text-muted-foreground">{labels.why}. </span>
                      {active.reasoning}
                    </p>
                  ) : null}
                  {flagIndexes.length > 0 ? <p className="text-xs text-muted-foreground">{labels.flags(flagIndexes.length)}</p> : null}
                  {editing ? (
                    <Textarea aria-label={labels.draft} value={draft} onChange={(event) => setDraft(event.target.value)} />
                  ) : active.body && active.body.length > 0 ? (
                    <p className="leading-6">
                      {active.body.map((span, index) =>
                        span.note ? (
                          <React.Fragment key={`${span.text}-${index}`}>
                            <button
                              type="button"
                              className="rounded-sm bg-chart-4/20 underline decoration-chart-4 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                              aria-describedby={`${titleId}-note-${index}`}
                              onClick={() => setNoteId(noteId === index ? null : index)}
                            >
                              {span.text}
                            </button>
                            <span id={`${titleId}-note-${index}`} className={noteId === index ? "mt-1 block text-xs" : "sr-only"}>
                              {span.note}
                            </span>
                          </React.Fragment>
                        ) : (
                          <span key={`${span.text}-${index}`}>{span.text}</span>
                        ),
                      )}
                    </p>
                  ) : null}
                  {active.files && active.files.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      <h3 className="text-xs font-medium text-muted-foreground">{labels.files}</h3>
                      <ul className="flex flex-col gap-2">
                        {active.files.map((file) => (
                          <li key={file.path} className="min-w-0">
                            <p className="flex flex-wrap gap-2 text-xs">
                              <span className="font-medium">{file.path}</span>
                              <span className="text-primary">+{file.added ?? 0}</span>
                              <span className="text-destructive">−{file.removed ?? 0}</span>
                            </p>
                            {file.lines ? (
                              <pre className="mt-1 overflow-x-auto rounded-md border border-border p-2 text-xs">
                                {file.lines.map((line, index) => (
                                  <div
                                    key={`${line.kind}-${index}`}
                                    className={cn(
                                      "flex gap-2",
                                      line.kind === "add" && "bg-primary/10",
                                      line.kind === "remove" && "bg-destructive/10",
                                    )}
                                  >
                                    <span className="w-6 shrink-0 text-end text-muted-foreground">{line.number ?? ""}</span>
                                    <span>
                                      {line.kind === "add" ? "+" : line.kind === "remove" ? "−" : " "} {line.text}
                                    </span>
                                  </div>
                                ))}
                              </pre>
                            ) : null}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                  {rejecting ? (
                    <div role="group" aria-label={labels.reasons} className="flex flex-wrap gap-1">
                      {reasons.map((reason, index) => (
                        <Button key={reason} type="button" size="sm" variant="outline" className="h-auto whitespace-normal" onClick={() => reject(reason)}>
                          {index + 1}. {reason}
                        </Button>
                      ))}
                    </div>
                  ) : null}
                  <div className="flex flex-wrap gap-2">
                    {editing ? (
                      <Button type="button" size="sm" aria-keyshortcuts="Control+Enter" onClick={() => approve(draft)}>
                        {labels.save}
                      </Button>
                    ) : (
                      <Button type="button" size="sm" aria-keyshortcuts="A" onClick={() => approve()}>
                        {labels.approve}
                      </Button>
                    )}
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      aria-keyshortcuts="E"
                      onClick={() => {
                        setDraft(plainText(active.body))
                        setEditing((value) => !value)
                        setRejecting(false)
                      }}
                    >
                      {editing ? labels.cancel : labels.edit}
                    </Button>
                    <Button type="button" size="sm" variant="outline" aria-keyshortcuts="R" aria-expanded={rejecting} onClick={() => setRejecting((value) => !value)}>
                      {labels.reject}
                    </Button>
                    <Button type="button" size="sm" variant="outline" aria-keyshortcuts="S" onClick={skip}>
                      {labels.skip}
                    </Button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
          {undo ? (
            <div className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2">
              <p className="text-xs">{labels.undoOffer(undo.title)}</p>
              <Button type="button" size="sm" variant="outline" className="ms-auto" aria-keyshortcuts="Control+Z" onClick={() => onUndo?.()}>
                {labels.undo}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
