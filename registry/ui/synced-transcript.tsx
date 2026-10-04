"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/audio/synced-transcript-viewer/synced-transcript-viewer.tsx

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TranscriptWord = { text: string; start: number; end: number }
export type TranscriptSegment = { speaker?: string; words: TranscriptWord[] }

export type SyncedTranscriptProps = {
  words?: TranscriptWord[]
  segments?: TranscriptSegment[]
  currentTime?: number
  onSeek?: (seconds: number) => void
  seekable?: boolean
  className?: string
}

export function activeWordIndex(words: TranscriptWord[], time: number) {
  let low = 0
  let high = words.length - 1
  let found = -1
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (words[mid].start <= time) {
      found = mid
      low = mid + 1
    } else high = mid - 1
  }
  if (found >= 0 && time > words[found].end && found < words.length - 1 && words[found + 1].start > time) return found
  return found
}

export function SyncedTranscript({ words, segments, currentTime = 0, onSeek, seekable = true, className }: SyncedTranscriptProps) {
  const groups = segments ?? (words ? [{ words }] : [])
  const flat = groups.flatMap((group) => group.words)
  const active = activeWordIndex(flat, currentTime)
  const scroller = React.useRef<HTMLDivElement>(null)
  const userScrolled = React.useRef(0)
  const [paused, setPaused] = React.useState(false)

  React.useEffect(() => {
    if (paused || active < 0) return
    const node = scroller.current?.querySelector<HTMLElement>(`[data-word="${active}"]`)
    node?.scrollIntoView({ block: "nearest", behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "auto" })
  }, [active, paused])

  return (
    <div className={cn("relative flex max-h-64 flex-col gap-2", className)}>
      <div
        ref={scroller}
        aria-label="Transcript"
        className="flex flex-col gap-3 overflow-auto"
        onScroll={() => {
          userScrolled.current = Date.now()
          setPaused(true)
          window.setTimeout(() => {
            if (Date.now() - userScrolled.current >= 3000) setPaused(false)
          }, 3000)
        }}
      >
        {groups.map((group, groupIndex) => (
          <p key={groupIndex} className="text-sm leading-6">
            {group.speaker ? <span className="mr-2 font-medium text-foreground">{group.speaker}</span> : null}
            {group.words.map((word) => {
              const index = flat.indexOf(word)
              const state = index < active ? "past" : index === active ? "active" : "future"
              const className = cn(
                "rounded px-0.5",
                state === "active" && "bg-primary/15 text-foreground",
                state === "past" && "text-foreground",
                state === "future" && "text-muted-foreground",
              )
              if (!seekable) return <span key={`${word.start}-${word.text}`} data-word={index} className={className}>{word.text} </span>
              return (
                <button
                  key={`${word.start}-${word.text}`}
                  type="button"
                  data-word={index}
                  className={cn(className, "focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none")}
                  onClick={() => onSeek?.(word.start)}
                >
                  {word.text}{" "}
                </button>
              )
            })}
          </p>
        ))}
      </div>
      {paused ? (
        <Button type="button" size="sm" variant="outline" className="self-center" onClick={() => setPaused(false)}>
          Resume follow
        </Button>
      ) : null}
    </div>
  )
}
