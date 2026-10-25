"use client"

/**
 * Clean-room collaboration thread.
 * Bubbles, a calendar block, and a voice note share one log.
 * The waveform is drawn from `peaks`. Playback is a local clock; onPlay tells the host.
 * The host appends messages. Spanish chrome is the default. `meta` is never read.
 */

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"
import { CalendarDays, Pause, Play, Send } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Skeleton } from "@/components/ui/skeleton"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import {
  formatChatStamp,
  formatEventWhen,
  orderEntries,
  voiceClock,
  waveformLevels,
  withChatLabels,
  type ActivityChatEntry,
  type ActivityChatLabels,
  type ActivityChatPerson,
} from "@/registry/retana/lib/activity-chat"

export type ActivityChatClassNames = {
  log?: string
  bubble?: string
  event?: string
  voice?: string
  composer?: string
}

export type ActivityChatProps<TMeta = Record<string, unknown>> = {
  messages: readonly ActivityChatEntry<TMeta>[]
  people?: readonly ActivityChatPerson[]
  currentUserId?: string
  onSend?: (body: string) => void
  onPlay?: (id: string) => void
  locale?: string
  timeZone?: string
  labels?: Partial<ActivityChatLabels>
  loading?: boolean
  error?: string | null
  onRetry?: () => void
  disabled?: boolean
  className?: string
  classNames?: ActivityChatClassNames
}

const subscribe = () => () => {}
const BARS = 28

function useReducedFlag() {
  const hydrated = React.useSyncExternalStore(subscribe, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return `${first}${last}`.toLocaleUpperCase("es-MX")
}

export function ActivityChat<TMeta = Record<string, unknown>>({
  messages,
  people = [],
  currentUserId,
  onSend,
  onPlay,
  locale = "es-MX",
  timeZone = "America/Mexico_City",
  labels,
  loading = false,
  error = null,
  onRetry,
  disabled = false,
  className,
  classNames,
}: ActivityChatProps<TMeta>) {
  const copy = withChatLabels(labels)
  const reduced = useReducedFlag()
  const [draft, setDraft] = React.useState("")
  const [playingId, setPlayingId] = React.useState<string | null>(null)
  const [progress, setProgress] = React.useState(0)
  const logRef = React.useRef<HTMLDivElement>(null)
  const peopleById = React.useMemo(() => new Map(people.map((person) => [person.id, person])), [people])
  const ordered = React.useMemo(() => orderEntries(messages), [messages])

  React.useEffect(() => {
    const node = logRef.current
    if (!node) return
    if (typeof node.scrollTo === "function") {
      node.scrollTo({ top: node.scrollHeight, behavior: reduced ? "auto" : "smooth" })
    } else {
      node.scrollTop = node.scrollHeight
    }
  }, [ordered, reduced])

  const duration = Math.max(400, ordered.find((item) => item.id === playingId)?.voice?.durationMs ?? 1000)

  React.useEffect(() => {
    if (!playingId) return
    const started = performance.now()
    const timer = window.setInterval(() => {
      const next = Math.min(1, (performance.now() - started) / duration)
      setProgress(next)
      if (next >= 1) {
        window.clearInterval(timer)
        setPlayingId(null)
        setProgress(0)
      }
    }, 80)
    return () => window.clearInterval(timer)
  }, [playingId, duration])

  function authorName(authorId: string) {
    if (authorId === currentUserId) return copy.you
    return peopleById.get(authorId)?.name ?? copy.unknownAuthor
  }

  function toggleVoice(id: string) {
    if (disabled) return
    if (playingId === id) {
      setPlayingId(null)
      setProgress(0)
      return
    }
    setProgress(0)
    setPlayingId(id)
    onPlay?.(id)
  }

  function send() {
    const body = draft.trim()
    if (!body || disabled || !onSend) return
    onSend(body)
    setDraft("")
  }

  return (
    <section
      data-slot="activity-chat"
      data-disabled={disabled ? "true" : "false"}
      data-reduced-motion={reduced ? "true" : "false"}
      aria-label={copy.heading}
      className={cn("flex h-full min-h-0 min-w-0 flex-col gap-3 text-foreground", className)}
    >
      {disabled ? <p className="text-xs text-muted-foreground">{copy.disabledNote}</p> : null}
      {error ? (
        <div role="alert" className="flex flex-col items-start gap-2 rounded-lg border border-border p-3">
          <p className="text-sm font-medium">{copy.errorTitle}</p>
          <p className="text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">{error}</p>
          {onRetry ? (
            <Button type="button" size="sm" variant="outline" onClick={onRetry}>
              {copy.retry}
            </Button>
          ) : null}
        </div>
      ) : null}
      <div
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-busy={loading || undefined}
        className={cn("flex min-h-48 flex-1 flex-col gap-3 overflow-y-auto rounded-lg border border-border bg-background p-3", classNames?.log)}
      >
        {loading ? (
          <div className="flex flex-col gap-2">
            <span className="sr-only">{copy.loading}</span>
            <Skeleton className="h-12 w-2/3" />
            <Skeleton className="ml-auto h-12 w-1/2" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : ordered.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>{copy.emptyTitle}</EmptyTitle>
              <EmptyDescription>{copy.emptyHint}</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          ordered.map((entry) => {
            const mine = entry.authorId === currentUserId
            const name = authorName(entry.authorId)
            const when = formatChatStamp(entry.createdAt, locale, timeZone)
            return (
              <motion.article
                key={entry.id}
                data-kind={entry.kind}
                data-own={mine ? "true" : "false"}
                initial={reduced ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: reduced ? 0 : motionPresets.duration.fast, ease: motionPresets.ease.enter }}
                aria-label={copy.messageFrom(name, when)}
                className={cn("flex min-w-0 gap-2", mine && entry.kind === "message" && "flex-row-reverse")}
              >
                {entry.kind === "event" ? null : (
                  <Avatar size="sm">
                    <AvatarFallback>{initials(name)}</AvatarFallback>
                  </Avatar>
                )}
                <div className={cn("flex min-w-0 flex-col gap-1", mine && entry.kind === "message" ? "items-end" : "items-start", entry.kind === "event" && "w-full items-stretch")}>
                  <p className="text-xs text-muted-foreground">
                    <span>{name}</span>
                    <span aria-hidden="true"> · </span>
                    <time dateTime={entry.createdAt}>{when}</time>
                  </p>
                  {entry.kind === "event" && entry.event ? (
                    <div className={cn("flex w-full min-w-0 flex-col gap-1 rounded-lg border border-border bg-card p-3 shadow-sm", classNames?.event)}>
                      <p className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                        <CalendarDays aria-hidden="true" className="size-3.5" />
                        {copy.event}
                      </p>
                      <h3 className="text-sm font-medium break-words [overflow-wrap:anywhere]">{entry.event.title}</h3>
                      <p className="text-sm tabular-nums">{formatEventWhen(entry.event, locale, timeZone)}</p>
                      {entry.event.location ? <p className="text-sm text-muted-foreground break-words [overflow-wrap:anywhere]">{entry.event.location}</p> : null}
                    </div>
                  ) : null}
                  {entry.kind === "voice" && entry.voice ? (
                    <div className={cn("flex w-full max-w-sm min-w-0 items-center gap-2 rounded-lg bg-muted px-2 py-2 text-foreground", classNames?.voice)}>
                      <button
                        type="button"
                        disabled={disabled}
                        aria-pressed={playingId === entry.id}
                        aria-label={playingId === entry.id ? copy.pauseVoice(name) : copy.playVoice(name)}
                        className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground outline-none focus-visible:ring-3 focus-visible:ring-ring"
                        onClick={() => toggleVoice(entry.id)}
                      >
                        {playingId === entry.id ? <Pause aria-hidden="true" className="size-3.5" /> : <Play aria-hidden="true" className="size-3.5" />}
                      </button>
                      <div className="flex h-8 min-w-0 flex-1 items-center gap-0.5" aria-hidden="true">
                        {waveformLevels(entry.voice.peaks, BARS).map((level, index) => {
                          const played = playingId === entry.id && index / BARS < progress
                          return (
                            <span
                              key={`${entry.id}-${index}`}
                              className={cn("w-0.5 rounded-full", played ? "bg-primary" : "bg-foreground/35")}
                              style={{ height: `${Math.round(level * 100)}%` }}
                            />
                          )
                        })}
                      </div>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {voiceClock(playingId === entry.id ? progress * entry.voice.durationMs : entry.voice.durationMs)}
                      </span>
                      <span className="sr-only">{copy.voiceNote}</span>
                    </div>
                  ) : null}
                  {entry.kind === "message" ? (
                    <p
                      className={cn(
                        "max-w-[85%] rounded-lg px-3 py-2 text-sm break-words [overflow-wrap:anywhere]",
                        mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
                        classNames?.bubble,
                      )}
                    >
                      {entry.body}
                    </p>
                  ) : null}
                  {entry.kind === "voice" && entry.voice?.transcript ? (
                    <p className="max-w-sm text-xs text-muted-foreground break-words [overflow-wrap:anywhere]">{entry.voice.transcript}</p>
                  ) : null}
                </div>
              </motion.article>
            )
          })
        )}
      </div>
      <form
        className={cn("flex items-end gap-2", classNames?.composer)}
        onSubmit={(event) => {
          event.preventDefault()
          send()
        }}
      >
        <Textarea
          value={draft}
          disabled={disabled || !onSend}
          aria-label={copy.composer}
          placeholder={copy.composerPlaceholder}
          rows={2}
          className="min-h-16 min-w-0 flex-1"
          onChange={(event) => setDraft(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey) {
              event.preventDefault()
              send()
            }
          }}
        />
        <Button type="submit" disabled={disabled || !onSend || draft.trim().length === 0}>
          <Send aria-hidden="true" data-icon="inline-start" />
          {copy.send}
        </Button>
      </form>
    </section>
  )
}
