"use client"

/** Clean-room discovery panel. Lists, quotes, and a scrubbable waveform. */

import * as React from "react"
import { AlertTriangle, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { AudioPlayer, type AudioPlayerHandle } from "@/registry/retana/ui/audio-player"

export type DiscoveryNote = {
  id: string
  text: string
  /** Seconds into the recording. */
  at?: number
}

export type DiscoveryColumn = {
  id: string
  title: string
  items: readonly DiscoveryNote[]
}

export type DiscoveryUnknown = {
  id: string
  text: string
  badge: string
}

export type DiscoveryQuote = {
  id: string
  speaker: string
  text: string
  at: number
}

export type ProposalDiscoveryProps = {
  columns: readonly DiscoveryColumn[]
  unknownsTitle?: string
  unknowns: readonly DiscoveryUnknown[]
  quotesTitle?: string
  quotes: readonly DiscoveryQuote[]
  playLabel?: string
  conflictTitle?: string
  conflictBody?: string
  clarifyLabel?: string
  onClarify?: () => void
  audioLabel?: string
  peaks?: number[]
  /** Recording length in seconds, used when the player has no file yet. */
  duration?: number
  onSeek?: (seconds: number) => void
  className?: string
}

function clock(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  const rest = total % 60
  return `${minutes}:${rest.toString().padStart(2, "0")}`
}

export function ProposalDiscovery({
  columns,
  unknownsTitle = "Still open",
  unknowns,
  quotesTitle = "Quotes",
  quotes,
  playLabel = "Play",
  conflictTitle,
  conflictBody,
  clarifyLabel = "Clarify",
  onClarify,
  audioLabel = "Call recording",
  peaks,
  duration,
  onSeek,
  className,
}: ProposalDiscoveryProps) {
  const player = React.useRef<AudioPlayerHandle>(null)

  const seek = (seconds: number) => {
    player.current?.seek(seconds)
    onSeek?.(seconds)
  }

  return (
    <div data-slot="proposal-discovery" className={cn("grid min-w-0 gap-4", className)}>
      <div className="rounded-xl border border-border bg-card p-3">
        <p className="mb-2 text-sm font-medium">{audioLabel}</p>
        <AudioPlayer ref={player} peaks={peaks} duration={duration} onTimeUpdate={onSeek} />
      </div>
      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {columns.map((column) => (
          <section key={column.id} className="min-w-0 rounded-xl border border-border bg-card p-3" aria-label={column.title}>
            <h2 className="text-sm font-medium">{column.title}</h2>
            <ul className="mt-2 flex flex-col gap-2">
              {column.items.map((item) => (
                <li key={item.id} className="text-sm text-muted-foreground">
                  <span className="text-foreground">{item.text}</span>
                  {item.at !== undefined ? (
                    <button
                      type="button"
                      className="ms-2 text-xs text-primary underline-offset-2 hover:underline"
                      onClick={() => seek(item.at ?? 0)}
                    >
                      {clock(item.at)}
                    </button>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      {unknowns.length > 0 ? (
        <section className="rounded-xl border border-border bg-muted/40 p-3">
          <h2 className="text-sm font-medium">{unknownsTitle}</h2>
          <ul className="mt-2 flex flex-col gap-2">
            {unknowns.map((item) => (
              <li key={item.id} className="flex flex-wrap items-center gap-2 text-sm">
                <span className="min-w-0 flex-1">{item.text}</span>
                <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">{item.badge}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
      {quotes.length > 0 ? (
        <section aria-label={quotesTitle} className="grid gap-2">
          <h2 className="text-sm font-medium">{quotesTitle}</h2>
          {quotes.map((quote) => (
            <blockquote key={quote.id} className="flex min-w-0 items-start gap-2 rounded-xl border border-border p-3">
              <Button
                type="button"
                size="icon-sm"
                variant="secondary"
                aria-label={`${playLabel} ${clock(quote.at)}`}
                onClick={() => seek(quote.at)}
              >
                <Play />
              </Button>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">
                  {quote.speaker} · {clock(quote.at)}
                </p>
                <p className="text-sm wrap-break-word">“{quote.text}”</p>
              </div>
            </blockquote>
          ))}
        </section>
      ) : null}
      {conflictTitle ? (
        <div role="alert" className="flex gap-2 rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-sm">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-destructive" />
          <div className="min-w-0">
            <p className="font-medium">{conflictTitle}</p>
            {conflictBody ? <p className="text-muted-foreground">{conflictBody}</p> : null}
          </div>
        </div>
      ) : null}
      <div>
        <Button type="button" onClick={onClarify}>
          {clarifyLabel}
        </Button>
      </div>
    </div>
  )
}
