"use client"

/**
 * A finished answer wired to its sources. Clean-room reading of a public
 * behavior description: a citation marks the sentence it supports, and opening
 * it shows the passage that was actually used. No Affect source, sample data,
 * icons, or assets were copied. Unknown source ids are skipped.
 */

import * as React from "react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type CitedSegment = {
  id: string
  text: string
  cite?: readonly string[]
  paragraph?: boolean
}

export type CitedSource<TMeta = unknown> = {
  id: string
  title: string
  site: string
  quote?: string
  date?: string
  meta?: TMeta
}

export type CitedAnswerLabels = {
  title: string
  sources: (count: number) => string
  pages: (count: number) => string
  marker: (number: number, title: string) => string
  chip: (number: number, title: string) => string
  quote: string
  noQuote: string
  open: string
  empty: string
  loading: string
  opened: (title: string) => string
}

export type CitedAnswerClassNames = {
  root?: string
  segment?: string
}

export type CitedAnswerProps<TMeta = unknown> = {
  segments?: readonly CitedSegment[]
  sources?: readonly CitedSource<TMeta>[]
  pagesRead?: number
  openId?: string | null
  loading?: boolean
  error?: string
  title?: string
  onOpen?: (id: string | null) => void
  onOpenSource?: (id: string) => void
  className?: string
  classNames?: CitedAnswerClassNames
  labels?: Partial<CitedAnswerLabels>
}

const answerLabels: CitedAnswerLabels = {
  title: "Answer",
  sources: (count) => (count === 1 ? "1 source" : `${count} sources`),
  pages: (count) => (count === 1 ? "1 page read" : `${count} pages read`),
  marker: (number, title) => `Source ${number}: ${title}`,
  chip: (number, title) => `Source ${number}: ${title}`,
  quote: "Passage used",
  noQuote: "This source has no passage attached.",
  open: "Open source",
  empty: "No answer to check yet.",
  loading: "Loading the answer",
  opened: (title) => `Opened “${title}”`,
}

function resolveLabels(partial?: Partial<CitedAnswerLabels>): CitedAnswerLabels {
  return { ...answerLabels, ...partial }
}

export function citedNumbers(sources: readonly Pick<CitedSource, "id">[]) {
  return new Map(sources.map((source, index) => [source.id, index + 1]))
}

export function visibleCites(cite: readonly string[] | undefined, sources: readonly Pick<CitedSource, "id">[]) {
  if (!cite) return []
  const known = new Set(sources.map((source) => source.id))
  return cite.filter((id) => known.has(id))
}

function paragraphsOf(segments: readonly CitedSegment[]) {
  const paragraphs: CitedSegment[][] = []
  for (const segment of segments) {
    const current = paragraphs[paragraphs.length - 1]
    if (segment.paragraph || !current) paragraphs.push([segment])
    else current.push(segment)
  }
  return paragraphs
}

export function CitedAnswer<TMeta = unknown>({
  segments = [],
  sources = [],
  pagesRead,
  openId,
  loading = false,
  error,
  title,
  onOpen,
  onOpenSource,
  className,
  classNames,
  labels: labelOverrides,
}: CitedAnswerProps<TMeta>) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const previewId = React.useId()
  const heading = title ?? labels.title
  const numbers = citedNumbers(sources)
  const byId = new Map(sources.map((source) => [source.id, source]))
  const open = openId ? byId.get(openId) : undefined
  const [hotId, setHotId] = React.useState<string | null>(null)
  const [live, setLive] = React.useState("")
  const paragraphs = paragraphsOf(segments)
  const lit = hotId ?? openId ?? null

  function toggle(id: string) {
    const next = openId === id ? null : id
    onOpen?.(next)
    const source = byId.get(id)
    if (next && source) setLive(labels.opened(source.title))
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
        <Badge variant="secondary">{labels.sources(sources.length)}</Badge>
        {typeof pagesRead === "number" ? <Badge variant="outline">{labels.pages(pagesRead)}</Badge> : null}
      </header>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-28 w-full motion-reduce:animate-none" />
        </div>
      ) : error && segments.length === 0 ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : segments.length === 0 ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <div className="flex flex-col gap-3 leading-6">
            {paragraphs.map((paragraph, index) => (
              <p key={paragraph[0]?.id ?? index}>
                {paragraph.map((segment) => {
                  const cites = visibleCites(segment.cite, sources)
                  const active = lit != null && cites.includes(lit)
                  return (
                    <span key={segment.id} className={cn(active && "bg-primary/10", classNames?.segment)}>
                      {segment.text}{" "}
                      {cites.map((id) => {
                        const source = byId.get(id)
                        const number = numbers.get(id)
                        if (!source || !number) return null
                        return (
                          <button
                            key={id}
                            type="button"
                            aria-expanded={openId === id}
                            aria-controls={previewId}
                            aria-label={labels.marker(number, source.title)}
                            className="mx-0.5 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-muted px-1 align-super text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                            onClick={() => toggle(id)}
                            onFocus={() => setHotId(id)}
                            onBlur={() => setHotId(null)}
                            onMouseEnter={() => setHotId(id)}
                            onMouseLeave={() => setHotId(null)}
                          >
                            {number}
                          </button>
                        )
                      })}
                    </span>
                  )
                })}
              </p>
            ))}
          </div>
          {sources.length > 0 ? (
            <ul className="flex flex-wrap gap-1">
              {sources.map((source) => {
                const number = numbers.get(source.id) ?? 0
                return (
                  <li key={source.id}>
                    <button
                      type="button"
                      aria-expanded={openId === source.id}
                      aria-controls={previewId}
                      aria-label={labels.chip(number, source.title)}
                      className={cn(
                        "rounded-full border border-border px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                        (openId === source.id || hotId === source.id) && "border-primary bg-primary/10",
                      )}
                      onClick={() => toggle(source.id)}
                      onFocus={() => setHotId(source.id)}
                      onBlur={() => setHotId(null)}
                      onMouseEnter={() => setHotId(source.id)}
                      onMouseLeave={() => setHotId(null)}
                    >
                      {number}. {source.title}
                    </button>
                  </li>
                )
              })}
            </ul>
          ) : null}
          <div id={previewId} role="region" aria-label={open ? labels.marker(numbers.get(open.id) ?? 0, open.title) : labels.quote} hidden={!open}>
            {open ? (
              <div className="rounded-lg border border-border px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  {labels.quote} · {open.site}
                  {open.date ? ` · ${open.date}` : ""}
                </p>
                <p className="mt-1">{open.quote ?? labels.noQuote}</p>
                <Button type="button" size="sm" variant="outline" className="mt-2" onClick={() => onOpenSource?.(open.id)}>
                  {labels.open}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  )
}
