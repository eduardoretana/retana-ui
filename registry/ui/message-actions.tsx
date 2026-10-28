"use client"

/**
 * The bar under a finished assistant message. Clean-room reading of a public
 * behavior description. No Affect source, sample data, icons, or assets were
 * copied. Copy, speech, and the next version stay with the host. No timer.
 */

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export const MESSAGE_ACTIONS = ["copy", "regenerate", "feedback", "speak"] as const

export type MessageActionKey = (typeof MESSAGE_ACTIONS)[number]
export type MessageVote = "up" | "down" | null

export type MessageActionsLabels = {
  bar: string
  copy: string
  copied: string
  again: string
  againBusy: string
  up: string
  down: string
  why: string
  send: string
  other: string
  otherField: string
  speak: string
  stop: string
  reading: string
  version: (current: number, total: number) => string
  previous: string
  next: string
  thanks: string
  empty: string
  loading: string
  ready: string
}

const actionLabels: MessageActionsLabels = {
  bar: "Message actions",
  copy: "Copy",
  copied: "Copied",
  again: "Try again",
  againBusy: "Writing another version",
  up: "Good answer",
  down: "Poor answer",
  why: "Why",
  send: "Send the note",
  other: "Other",
  otherField: "Your own reason",
  speak: "Read aloud",
  stop: "Stop reading",
  reading: "Reading aloud",
  version: (current, total) => `Version ${current} of ${total}`,
  previous: "Previous version",
  next: "Next version",
  thanks: "Thanks, the note was saved",
  empty: "No message to act on.",
  loading: "Loading the message",
  ready: "Another version is ready",
}

function resolveLabels(partial?: Partial<MessageActionsLabels>): MessageActionsLabels {
  return { ...actionLabels, ...partial }
}

export function messageCount(versions: number | readonly string[] | undefined) {
  if (typeof versions === "number") return versions
  return versions?.length ?? 0
}

export function messageText(text: string, versions: number | readonly string[] | undefined, version: number) {
  if (Array.isArray(versions)) return versions[version] ?? text
  return text
}

export function MessageActions({
  text = "",
  versions = 1,
  version = 0,
  onVersionChange,
  actions = MESSAGE_ACTIONS,
  onCopy,
  onRegenerate,
  regenerating = false,
  feedback = null,
  onFeedback,
  reasons = ["The deposit is wrong", "It runs long", "It misses the kiln", "Other"],
  speaking = false,
  onSpeak,
  quiet = false,
  loading = false,
  error,
  className,
  labels: labelOverrides,
}: {
  text?: string
  versions?: number | readonly string[]
  version?: number
  onVersionChange?: (index: number) => void
  actions?: readonly MessageActionKey[]
  onCopy?: (text: string) => void
  onRegenerate?: () => void
  regenerating?: boolean
  feedback?: MessageVote
  onFeedback?: (kind: MessageVote, reason?: string) => void
  reasons?: readonly string[]
  speaking?: boolean
  onSpeak?: (playing: boolean) => void
  quiet?: boolean
  loading?: boolean
  error?: string
  className?: string
  labels?: Partial<MessageActionsLabels>
}) {
  const labels = resolveLabels(labelOverrides)
  const titleId = React.useId()
  const total = Math.max(messageCount(versions), text ? 1 : 0)
  const shown = messageText(text, versions, version)
  const [live, setLive] = React.useState("")
  const [reason, setReason] = React.useState(reasons[0] ?? "")
  const [custom, setCustom] = React.useState("")
  const other = reasons[reasons.length - 1] ?? ""
  const down = feedback === "down"

  function copy() {
    onCopy?.(shown)
    setLive(labels.copied)
  }

  function vote(kind: MessageVote) {
    const next = feedback === kind ? null : kind
    onFeedback?.(next)
    if (next !== "down") setLive(next === "up" ? labels.up : "")
  }

  function sendReason() {
    const note = reason === other ? custom.trim() || other : reason
    onFeedback?.("down", note)
    setLive(labels.thanks)
  }

  return (
    <section aria-labelledby={titleId} aria-busy={loading || undefined} className={cn("flex flex-col gap-3 rounded-xl border border-border bg-card p-3 text-sm text-card-foreground", className)}>
      <h2 id={titleId} className="sr-only">
        {labels.bar}
      </h2>
      <p className="sr-only" aria-live="polite">
        {live}
      </p>
      {loading ? (
        <div role="status">
          <span className="sr-only">{labels.loading}</span>
          <Skeleton className="h-16 w-full motion-reduce:animate-none" />
        </div>
      ) : error && !shown ? (
        <p role="alert" className="text-destructive">
          {error}
        </p>
      ) : !shown ? (
        <p className="text-muted-foreground">{labels.empty}</p>
      ) : (
        <div className="flex flex-col gap-3">
          {error ? (
            <p role="alert" className="text-destructive">
              {error}
            </p>
          ) : null}
          <p className="leading-6">{shown}</p>
          <div
            role="toolbar"
            aria-label={labels.bar}
            className={cn("flex flex-wrap items-center gap-1", quiet && "opacity-100 [@media(hover:hover)]:opacity-40 hover:opacity-100 focus-within:opacity-100")}
          >
            {actions.includes("copy") ? (
              <Button type="button" size="sm" variant="outline" onClick={copy}>
                {labels.copy}
              </Button>
            ) : null}
            {actions.includes("regenerate") ? (
              <Button type="button" size="sm" variant="outline" aria-busy={regenerating || undefined} onClick={() => onRegenerate?.()}>
                {regenerating ? <span className="size-3 animate-spin rounded-full border border-current border-t-transparent motion-reduce:animate-none" aria-hidden="true" /> : null}
                {regenerating ? labels.againBusy : labels.again}
              </Button>
            ) : null}
            {actions.includes("regenerate") && total > 1 ? (
              <span className="inline-flex items-center gap-1">
                <Button type="button" size="sm" variant="outline" aria-label={labels.previous} disabled={version <= 0} onClick={() => onVersionChange?.(version - 1)}>
                  ‹
                </Button>
                <span className="text-xs">{labels.version(version + 1, total)}</span>
                <Button type="button" size="sm" variant="outline" aria-label={labels.next} disabled={version >= total - 1} onClick={() => onVersionChange?.(version + 1)}>
                  ›
                </Button>
              </span>
            ) : null}
            {actions.includes("feedback") ? (
              <>
                <Button type="button" size="sm" variant={feedback === "up" ? "default" : "outline"} aria-pressed={feedback === "up"} onClick={() => vote("up")}>
                  {labels.up}
                </Button>
                <Button type="button" size="sm" variant={feedback === "down" ? "default" : "outline"} aria-pressed={feedback === "down"} aria-expanded={down} onClick={() => vote("down")}>
                  {labels.down}
                </Button>
              </>
            ) : null}
            {actions.includes("speak") ? (
              <Button type="button" size="sm" variant={speaking ? "default" : "outline"} aria-pressed={speaking} onClick={() => onSpeak?.(!speaking)}>
                {speaking ? (
                  <span aria-hidden="true" className="inline-flex items-end gap-0.5">
                    {Array.from({ length: 4 }, (_, index) => (
                      <span key={index} className="h-3 w-0.5 bg-chart-2 motion-safe:animate-pulse motion-reduce:animate-none" />
                    ))}
                  </span>
                ) : null}
                {speaking ? labels.stop : labels.speak}
              </Button>
            ) : null}
          </div>
          {speaking ? <p role="status">{labels.reading}</p> : null}
          {down ? (
            <div className="flex flex-col gap-2">
              <div role="group" aria-label={labels.why} className="flex flex-wrap gap-1">
                {reasons.map((item) => (
                  <button
                    key={item}
                    type="button"
                    aria-pressed={reason === item}
                    className={cn(
                      "rounded-md border px-2 py-1 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                      reason === item ? "border-ring bg-muted" : "border-border",
                    )}
                    onClick={() => setReason(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
              {reason === other ? (
                <Input aria-label={labels.otherField} value={custom} onChange={(event) => setCustom(event.target.value)} onKeyDown={(event) => event.key === "Enter" && sendReason()} />
              ) : null}
              <Button type="button" size="sm" className="self-start" onClick={sendReason}>
                {labels.send}
              </Button>
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
