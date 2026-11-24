"use client"

/**
 * Text scramble: a one-time decode reveal for a hero line or a page title.
 *
 * Idea from Emil Kowalski's "Decoding interfaces" demo (x.com/emilkowalski/status/2124903277036745191,
 * 2026-11-23). No source was published; this is a clean-room build. Only the text part is
 * adapted. The per-character image color of the demo is left out on purpose (see the registry docs).
 *
 * How it stays cheap and calm:
 * - Each word keeps its final glyphs in the flow. The noise sits on top in an absolute span,
 *   so the line box never changes size: no layout shift and no re-wrapping.
 * - One requestAnimationFrame loop, throttled to one write per SCRAMBLE_TICK_MS. It only writes
 *   textContent and one data attribute per word. It never reads layout and never sets React state.
 * - Progress comes from the clock, so a dropped frame shows the next glyph, never a slower decode.
 * - Plays once. Reduced motion, empty copy and copy over SCRAMBLE_MAX_CHARS show the final text at once.
 * - Screen readers get the sentence once from an sr-only span. The visual layer is aria-hidden.
 *   There is no live region: the copy is page content, not a status.
 */

import { useEffect, useRef, useState, type ReactNode } from "react"

import { cn } from "@/lib/utils"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

export type TextScrambleTrigger = "mount" | "visible"

export type TextScrambleProps = {
  text: string
  /** Element. Default span. Use h1 for a hero title. */
  as?: "h1" | "h2" | "h3" | "p" | "span"
  /** mount plays after hydration. visible waits until the text enters the viewport. Default visible. */
  trigger?: TextScrambleTrigger
  /** Total decode time in ms, clamped to 300–1200. Default 600. */
  duration?: number
  /** Wait in ms before the decode starts, for a second line. Default 0. */
  delay?: number
  /** Glyphs used for the noise. Default SCRAMBLE_GLYPHS. */
  charset?: string
  /** Called once when the final text is in place, including when the effect is skipped. */
  onDecoded?: () => void
  className?: string
  id?: string
}

/**
 * ASCII only, so any font has them and the noise never falls back to another typeface.
 * Digits first, then capitals without G, I, O and Q (they read as 6, 1 and 0 at small sizes),
 * then a few terminal symbols.
 */
export const SCRAMBLE_GLYPHS = "0123456789ABCDEFHJKLMNPRSTUVWXYZ@#$%&+=?"
/** One write every 50 ms: at most 20 glyph changes per second per character. */
export const SCRAMBLE_TICK_MS = 50
/** Longer copy is body text. It shows at once. */
export const SCRAMBLE_MAX_CHARS = 120

const DEFAULT_DURATION = 600
const MIN_DURATION = 300
const MAX_DURATION = 1200
/** Share of the timeline where every glyph is still noise, so the start reads as one block. */
const HOLD = 0.22
/** Largest random offset added to a glyph's lock time. */
const JITTER = 0.1
/** Safety net when JavaScript never runs: the final words show after this delay. */
const FAILSAFE_MS = 1200

export function scrambleDuration(ms?: number) {
  if (ms == null || !Number.isFinite(ms)) return DEFAULT_DURATION
  return Math.min(MAX_DURATION, Math.max(MIN_DURATION, Math.round(ms)))
}

function hash(a: number, b: number) {
  let h = (Math.imul(a ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(b + 0x632be5ab, 0xc2b2ae35)) >>> 0
  h ^= h >>> 15
  h = Math.imul(h, 0x2c1b3c6d) >>> 0
  h ^= h >>> 12
  return h >>> 0
}

function seedOf(text: string) {
  let seed = 7
  for (const char of text) seed = hash(seed, char.codePointAt(0) ?? 0)
  return seed
}

const isBlank = (char: string) => /\s/u.test(char)

/**
 * Lock time in [0, 1] for each character of `text`.
 * Reading order with uneven gaps: the gaps shrink toward the end and each glyph gets a small
 * deterministic jitter. Whitespace is 0 because it never scrambles.
 */
export function scrambleSchedule(text: string) {
  const chars = Array.from(text)
  const glyphs = chars.filter((char) => !isBlank(char)).length
  const seed = seedOf(text)
  let order = 0
  return chars.map((char, i) => {
    if (isBlank(char)) return 0
    const position = glyphs <= 1 ? 1 : order / (glyphs - 1)
    order += 1
    const jitter = ((hash(seed, i) % 1000) / 1000) * JITTER
    const base = HOLD + (1 - HOLD - JITTER) * Math.pow(position, 0.8)
    return Math.min(1, Number((base + jitter).toFixed(4)))
  })
}

/** The visible string at `progress` (0–1). Locked glyphs show their final character. */
export function scrambleFrame(text: string, progress: number, schedule: readonly number[], tick: number, charset = SCRAMBLE_GLYPHS) {
  const glyphs = Array.from(charset.length > 0 ? charset : SCRAMBLE_GLYPHS)
  const seed = seedOf(text)
  return Array.from(text)
    .map((char, i) => {
      if (isBlank(char) || progress >= 1 || progress >= (schedule[i] ?? 0)) return char
      return glyphs[hash(seed + tick, i) % glyphs.length]
    })
    .join("")
}

type Word = { text: string; start: number }

function splitWords(text: string) {
  const parts: (Word | string)[] = []
  let index = 0
  for (const match of text.matchAll(/(\s+)|(\S+)/gu)) {
    const length = Array.from(match[0]).length
    parts.push(match[1] ? match[0] : { text: match[0], start: index })
    index += length
  }
  return parts
}

/**
 * Before hydration, a mount trigger hides the final words so the reader does not see
 * text, then noise, then text again. If JavaScript never runs, the failsafe shows them.
 * Reduced motion never hides anything.
 */
export const TEXT_SCRAMBLE_CSS = `
@keyframes retana-text-scramble-failsafe {
  from { visibility: hidden; }
  to { visibility: visible; }
}
@media (scripting: enabled) and (prefers-reduced-motion: no-preference) {
  [data-slot="text-scramble"][data-trigger="mount"][data-state="idle"] [data-slot="text-scramble-final"] {
    animation: retana-text-scramble-failsafe 0s linear ${FAILSAFE_MS}ms both;
  }
}
[data-slot="text-scramble"][data-state="running"] [data-slot="text-scramble-word"]:not([data-locked]) [data-slot="text-scramble-final"] {
  visibility: hidden;
}
@media (prefers-reduced-motion: reduce) {
  [data-slot="text-scramble-final"] { animation: none; visibility: visible; }
  [data-slot="text-scramble-noise"] { display: none; }
}
`

type Phase = "idle" | "running" | "done"

export function TextScramble({
  text,
  as = "span",
  trigger = "visible",
  duration,
  delay = 0,
  charset,
  onDecoded,
  className,
  id,
}: TextScrambleProps): ReactNode {
  const Tag = as
  const reduced = useMotionPreference()
  const rootRef = useRef<HTMLElement | null>(null)
  const noiseRefs = useRef<(HTMLSpanElement | null)[]>([])
  const wordRefs = useRef<(HTMLSpanElement | null)[]>([])
  const played = useRef(false)
  const decodedRef = useRef(onDecoded)
  const textRef = useRef(text)
  const [phase, setPhase] = useState<Phase>("idle")

  const count = Array.from(text).length
  const blank = text.trim().length === 0
  const skipped = blank ? "empty" : count > SCRAMBLE_MAX_CHARS ? "length" : null
  const parts = splitWords(text)
  const total = scrambleDuration(duration)
  const wait = Number.isFinite(delay) ? Math.max(0, delay) : 0

  useEffect(() => {
    decodedRef.current = onDecoded
    textRef.current = text
  }, [onDecoded, text])

  // Entry only: the effect runs for the first text. Later texts render final (played is true).
  useEffect(() => {
    if (played.current) return
    const node = rootRef.current
    if (!node) return
    let frame = 0
    let observer: IntersectionObserver | null = null
    let cancelled = false

    const finish = () => {
      for (const noise of noiseRefs.current) if (noise) noise.textContent = ""
      setPhase("done")
      decodedRef.current?.()
    }

    if (reduced || skipped) {
      played.current = true
      finish()
      return
    }

    const schedule = scrambleSchedule(text)
    const words = parts.filter((part): part is Word => typeof part !== "string")

    const write = (progress: number, tick: number) => {
      const frameText = Array.from(scrambleFrame(text, progress, schedule, tick, charset))
      words.forEach((word, w) => {
        const length = Array.from(word.text).length
        const locked = schedule.slice(word.start, word.start + length).every((at) => progress >= at)
        const noise = noiseRefs.current[w]
        const holder = wordRefs.current[w]
        if (locked) {
          if (holder && !holder.hasAttribute("data-locked")) holder.setAttribute("data-locked", "")
          if (noise && noise.textContent !== "") noise.textContent = ""
          return
        }
        if (noise) noise.textContent = frameText.slice(word.start, word.start + length).join("")
      })
    }

    const begin = () => {
      if (cancelled || played.current) return
      played.current = true
      observer?.disconnect()
      setPhase("running")
      write(0, 0)
      const origin = performance.now() + wait
      let last = 0
      const step = (now: number) => {
        const elapsed = now - origin
        // New copy mid-decode: stop and show it as is.
        if (elapsed >= total || textRef.current !== text) {
          frame = 0
          finish()
          return
        }
        const tick = elapsed < 0 ? 0 : Math.floor(elapsed / SCRAMBLE_TICK_MS)
        if (tick !== last) {
          last = tick
          write(elapsed / total, tick)
        }
        frame = requestAnimationFrame(step)
      } // end step
      frame = requestAnimationFrame(step)
    }

    if (trigger === "mount" || typeof IntersectionObserver === "undefined") {
      begin()
    } else {
      // A quarter in view, so the reader sees the start instead of a line that already moved.
      observer = new IntersectionObserver(
        (entries) => {
          if (entries.some((entry) => entry.isIntersecting)) begin()
        },
        { threshold: 0.25 },
      )
      observer.observe(node)
    }

    return () => {
      cancelled = true
      observer?.disconnect()
      if (frame) cancelAnimationFrame(frame)
      frame = 0
    }
    // The decode belongs to the first text only; see `played`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, skipped])

  let w = 0

  return (
    <Tag
      ref={(element: HTMLElement | null) => {
        rootRef.current = element
      }}
      id={id}
      data-slot="text-scramble"
      data-trigger={trigger}
      data-state={phase}
      data-reduced={reduced ? "true" : "false"}
      data-skipped={skipped ?? undefined}
      className={cn("max-w-full", className)}
    >
      <style>{TEXT_SCRAMBLE_CSS}</style>
      <span className="sr-only">{text}</span>
      <span data-slot="text-scramble-visual" aria-hidden="true">
        {parts.map((part, index) => {
          if (typeof part === "string") return part
          const slot = w++
          return (
            <span
              key={`${part.start}-${part.text}`}
              ref={(element) => {
                wordRefs.current[slot] = element
              }}
              data-slot="text-scramble-word"
              className="relative inline-block"
            >
              <span data-slot="text-scramble-final">{part.text}</span>
              <span
                ref={(element) => {
                  noiseRefs.current[slot] = element
                }}
                data-slot="text-scramble-noise"
                data-index={index}
                className="pointer-events-none absolute inset-0 overflow-hidden whitespace-nowrap text-muted-foreground select-none [contain:layout_paint]"
              />
            </span>
          )
        })}
      </span>
    </Tag>
  )
}
