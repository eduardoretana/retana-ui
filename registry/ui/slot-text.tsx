"use client"

/** Adapted from Arc UI (MIT). */

import { useLayoutEffect, useRef, useState, useSyncExternalStore, type CSSProperties } from "react"
import { AnimatePresence, animate, motion, useMotionValue, usePresence, useReducedMotion, useTransform, useVelocity } from "motion/react"

import { cn } from "@/lib/utils"

export type SlotTextProps = {
  value: string | number
  format?: (value: number) => string
  duration?: number
  stagger?: number
  spins?: number
  align?: "start" | "end"
  announce?: boolean
  className?: string
  style?: CSSProperties
}

const DIGITS = "0123456789"
const LOWER = "abcdefghijklmnopqrstuvwxyz"
const UPPER = LOWER.toUpperCase()
const LANDING = [0.12, 0.8, 0.16, 1] as const
const subscribe = () => () => {}
const CELL = 1.6

function useReducedFlag() {
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

const classOf = (char: string) =>
  DIGITS.includes(char) ? DIGITS : LOWER.includes(char) ? LOWER : UPPER.includes(char) ? UPPER : null

function seeded(seed: number) {
  let state = seed >>> 0 || 1
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function buildStrip(from: string, to: string, spins: number, rising: boolean, seed: number) {
  if (from === to) return [to]
  const set = classOf(to)
  if (!set) return [from, to]
  if (set === DIGITS && classOf(from) === DIGITS) {
    const a = Number(from)
    const b = Number(to)
    const steps = spins * 10 + (rising ? (b - a + 10) % 10 : (a - b + 10) % 10)
    return Array.from({ length: steps + 1 }, (_, i) => String((a + (rising ? i : -i) + 100) % 10))
  }
  const random = seeded(seed)
  const fillers = Array.from({ length: Math.max(2, spins * 5 + 2) }, () => set[Math.floor(random() * set.length)])
  return [from, ...fillers, to]
}

function Reel({
  char,
  order,
  entering,
  rising,
  duration,
  stagger,
  spins,
  reduced,
}: {
  char: string
  order: number
  entering: boolean
  rising: boolean
  duration: number
  stagger: number
  spins: number
  reduced: boolean
}) {
  const pos = useMotionValue(0)
  const width = useMotionValue<number | "auto">("auto")
  const sizer = useRef<HTMLSpanElement>(null)
  const [isPresent, safeToRemove] = usePresence()
  const [reel, setReel] = useState(() => ({
    char,
    strip: entering && !reduced ? buildStrip("", char, spins, rising, char.charCodeAt(0) + order) : [char],
    from: 0,
    grow: entering,
    time: duration + order * stagger,
  }))

  if (reel.char !== char) {
    const current = pos.get()
    const index = Math.max(0, Math.min(reel.strip.length - 1, Math.round(current)))
    const visible = reel.strip[index]
    setReel({
      char,
      strip: reduced
        ? [char]
        : buildStrip(visible, char, spins, rising, char.charCodeAt(0) * 31 + visible.charCodeAt(0) * 7 + order + reel.strip.length),
      from: reduced ? 0 : current - index,
      grow: false,
      time: duration + order * stagger,
    })
  }

  const blur = useTransform(useVelocity(pos), (velocity) => {
    const amount = Math.min(Math.abs(velocity) * 0.05, 2.4)
    return amount < 0.15 ? "none" : `blur(${amount.toFixed(2)}px)`
  })
  const y = useTransform(pos, (value) => `translate3d(0, ${(-value * CELL).toFixed(4)}em, 0)`)

  useLayoutEffect(() => {
    const measured = sizer.current?.getBoundingClientRect().width ?? 0
    const last = reel.strip.length - 1
    if (reduced) {
      pos.jump(last)
      width.jump(measured)
      return
    }
    pos.jump(reel.from)
    const spin = animate(pos, last, { duration: last === 0 ? 0.2 : reel.time, ease: [...LANDING] })
    if (reel.grow) width.jump(0)
    if (width.get() === "auto") {
      width.jump(measured)
      return () => spin.stop()
    }
    const size = animate(width, measured, { type: "spring", visualDuration: Math.min(reel.time, 0.6), bounce: 0 })
    return () => {
      spin.stop()
      size.stop()
    }
  }, [reel, pos, width, reduced])

  useLayoutEffect(() => {
    if (isPresent) return
    if (reduced) {
      safeToRemove()
      return
    }
    const exit = animate(width, 0, { type: "spring", visualDuration: 0.35, bounce: 0, onComplete: safeToRemove })
    return () => exit.stop()
  }, [isPresent, safeToRemove, width, reduced])

  return (
    <motion.span data-slot="slot-text-reel" className="relative inline-block overflow-hidden" style={{ width }} data-exiting={isPresent ? undefined : ""}>
      <span ref={sizer} className="invisible absolute">
        {char === " " ? "\u00a0" : char}
      </span>
      <span className="block h-[1.6em] overflow-hidden leading-[1.6em]">
        <motion.span className="flex flex-col" style={{ transform: y, filter: blur }}>
          {reel.strip.map((cell, i) => (
            <span key={i} className="block h-[1.6em] leading-[1.6em]">
              {cell === " " ? "\u00a0" : cell}
            </span>
          ))}
        </motion.span>
      </span>
    </motion.span>
  )
}

export function SlotText({
  value,
  format,
  duration = 0.9,
  stagger = 0.07,
  spins = 1,
  align,
  announce = false,
  className,
  style,
}: SlotTextProps) {
  const reduced = useReducedFlag()
  const text = typeof value === "number" ? (format ? format(value) : value.toLocaleString("en-US")) : value
  const fromEnd = (align ?? (typeof value === "number" ? "end" : "start")) === "end"
  const chars = Array.from(text)
  const lead = fromEnd ? chars.findIndex((char) => /[\p{L}\p{N}]/u.test(char)) : 0
  const prefix = lead < 0 ? chars.length : lead
  const keyOf = (i: number) => (i < prefix ? `p${i}` : fromEnd ? `e${chars.length - 1 - i}` : `s${i}`)
  const [initialKeys] = useState(() => new Set(chars.map((_, i) => keyOf(i))))
  const [trend, setTrend] = useState<{ value: string | number; rising: boolean }>({ value, rising: true })
  if (trend.value !== value) {
    setTrend({
      value,
      rising: typeof value === "number" && typeof trend.value === "number" ? value >= trend.value : true,
    })
  }

  return (
    <span data-slot="slot-text" className={cn("inline-flex max-w-full", className)} style={style}>
      <span className="sr-only" aria-live={announce ? "polite" : undefined}>
        {text}
      </span>
      <span className="inline-flex" aria-hidden="true">
        <AnimatePresence initial={false}>
          {chars.map((char, i) => (
            <Reel
              key={keyOf(i)}
              char={char}
              order={i}
              entering={!initialKeys.has(keyOf(i))}
              rising={trend.rising}
              duration={duration}
              stagger={stagger}
              spins={spins}
              reduced={reduced}
            />
          ))}
        </AnimatePresence>
      </span>
    </span>
  )
}
