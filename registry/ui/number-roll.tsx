"use client"

/** Clean-room reel. Transform and opacity only. See NOTICE. */

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotionConfig, useTransform, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] as const

const rollEase = [...motionPresets.ease.enter]
const enterEase = [...motionPresets.ease.exit]

export type NumberRollClassNames = {
  root?: string
  integer?: string
  fraction?: string
  prefix?: string
  suffix?: string
}

export type NumberRollProps = {
  value: number
  decimals?: number
  /** BCP 47. es-MX and en-US are the catalog pair. */
  locale?: string
  prefix?: string
  suffix?: string
  /** Draw the fraction smaller and lighter than the integer. */
  hierarchy?: boolean
  /** Expose the formatted value to assistive tech. Turn off when a parent already does. */
  announce?: boolean
  className?: string
  classNames?: NumberRollClassNames
}

type RollSide = "integer" | "fraction"

export type RollToken =
  | { kind: "digit"; key: string; digit: number; side: RollSide }
  | { kind: "text"; key: string; text: string; side: RollSide }

function finite(value: number) {
  return Number.isFinite(value) ? value : 0
}

function places(decimals: number) {
  if (!Number.isFinite(decimals)) return 0
  return Math.min(8, Math.max(0, Math.trunc(decimals)))
}

export function formatNumberRoll(value: number, decimals = 0, locale = "en-US") {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: places(decimals),
    maximumFractionDigits: places(decimals),
    numberingSystem: "latn",
  }).format(finite(value))
}

/** Signed step on a 0–9 wheel. Positive rolls forward. */
export function digitStep(from: number, to: number, direction: 1 | -1) {
  const forward = (((to - from) % 10) + 10) % 10
  if (forward === 0) return 0
  return direction < 0 ? forward - 10 : forward
}

/** Distance from a glyph to the wheel position, wrapping every ten. */
export function nearestDigitOffset(digit: number, position: number) {
  const turn = Math.round((position - digit) / 10)
  return digit + turn * 10 - position
}

export function rollTokens(value: number, decimals = 0, locale = "en-US"): RollToken[] {
  const parts = new Intl.NumberFormat(locale, {
    minimumFractionDigits: places(decimals),
    maximumFractionDigits: places(decimals),
    numberingSystem: "latn",
  }).formatToParts(finite(value))
  let place = parts.reduce((count, part) => count + (part.type === "integer" ? part.value.length : 0), 0)
  let fraction = 0
  const tokens: RollToken[] = []
  parts.forEach((part, index) => {
    if (part.type === "integer") {
      for (const char of part.value) {
        place -= 1
        tokens.push({ kind: "digit", key: `i${place}`, digit: Number(char), side: "integer" })
      }
      return
    }
    if (part.type === "fraction") {
      for (const char of part.value) {
        tokens.push({ kind: "digit", key: `f${fraction}`, digit: Number(char), side: "fraction" })
        fraction += 1
      }
      return
    }
    if (part.type === "decimal") {
      tokens.push({ kind: "text", key: "decimal", text: part.value, side: "fraction" })
      return
    }
    const key = part.type === "group" ? `g${place}` : part.type === "minusSign" ? "sign" : `${part.type}${index}`
    tokens.push({ kind: "text", key, text: part.value, side: "integer" })
  })
  return tokens
}

function Glyph({ position, digit }: { position: MotionValue<number>; digit: number }) {
  const offset = useTransform(position, (current) => nearestDigitOffset(digit, current))
  const y = useTransform(offset, (current) => `${current}em`)
  const opacity = useTransform(offset, (current) => {
    const distance = Math.abs(current)
    return distance >= 1 ? 0 : 1 - distance
  })
  return (
    <motion.span className="absolute inset-x-0 top-0 h-[1em] text-center" style={{ y, opacity }} aria-hidden="true">
      {digit}
    </motion.span>
  )
}

function DigitColumn({ digit, direction, reduced }: { digit: number; direction: 1 | -1; reduced: boolean }) {
  const position = useMotionValue(digit)
  const state = React.useRef({ digit, at: digit })
  React.useEffect(() => {
    const step = digitStep(state.current.digit, digit, direction)
    state.current.digit = digit
    if (step === 0) {
      if (reduced) position.set(state.current.at)
      return
    }
    const next = state.current.at + step
    state.current.at = next
    if (reduced) {
      position.set(next)
      return
    }
    const controls = animate(position, next, { duration: motionPresets.duration.considered, ease: rollEase })
    return () => controls.stop()
  }, [digit, direction, position, reduced])
  return (
    <span data-slot="number-roll-digit" className="relative inline-block h-[1em] overflow-hidden">
      <span className="invisible" aria-hidden="true">
        0
      </span>
      <span className="pointer-events-none absolute inset-0">
        {DIGITS.map((item) => (
          <Glyph key={item} position={position} digit={item} />
        ))}
      </span>
    </span>
  )
}

function Side({
  tokens,
  direction,
  reduced,
  className,
  slot,
}: {
  tokens: RollToken[]
  direction: 1 | -1
  reduced: boolean
  className?: string
  slot: string
}) {
  if (!tokens.length) return null
  return (
    <span data-slot={slot} className={cn("inline-flex items-baseline", className)}>
      <AnimatePresence initial={false}>
        {tokens.map((token) => (
          <motion.span
            key={token.key}
            className="inline-block"
            initial={reduced ? false : { opacity: 0, y: "0.4em" }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0, y: 0 } : { opacity: 0, y: "-0.35em" }}
            transition={{ duration: reduced ? 0 : motionPresets.duration.fast, ease: enterEase }}
          >
            {token.kind === "digit" ? <DigitColumn digit={token.digit} direction={direction} reduced={reduced} /> : token.text}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}

export function NumberRoll({
  value,
  decimals = 0,
  locale = "en-US",
  prefix = "",
  suffix = "",
  hierarchy = false,
  announce = true,
  className,
  classNames,
}: NumberRollProps) {
  const reduced = useReducedMotionConfig() === true
  const safe = finite(value)
  const [previous, setPrevious] = React.useState(safe)
  const [direction, setDirection] = React.useState<1 | -1>(1)
  if (safe !== previous) {
    setPrevious(safe)
    setDirection(safe > previous ? 1 : -1)
  }
  const tokens = rollTokens(safe, decimals, locale)
  const text = `${prefix}${formatNumberRoll(safe, decimals, locale)}${suffix}`
  const integer = tokens.filter((token) => token.side === "integer")
  const fraction = tokens.filter((token) => token.side === "fraction")
  return (
    <span
      data-slot="number-roll"
      data-motion={reduced ? "reduced" : "full"}
      className={cn("inline-flex min-w-0 flex-col text-foreground tabular-nums leading-none", className, classNames?.root)}
    >
      {announce ? <span className="sr-only">{text}</span> : null}
      <span aria-hidden="true" className="inline-flex items-baseline whitespace-nowrap">
        {prefix ? (
          <span data-slot="number-roll-prefix" className={cn(hierarchy && "font-medium", classNames?.prefix)}>
            {prefix}
          </span>
        ) : null}
        <Side
          slot="number-roll-integer"
          tokens={integer}
          direction={direction}
          reduced={reduced}
          className={cn(hierarchy && "font-medium", classNames?.integer)}
        />
        <Side
          slot="number-roll-fraction"
          tokens={fraction}
          direction={direction}
          reduced={reduced}
          className={cn(hierarchy && "text-[0.65em] font-normal text-muted-foreground", classNames?.fraction)}
        />
        {suffix ? (
          <span data-slot="number-roll-suffix" className={cn(classNames?.suffix)}>
            {suffix}
          </span>
        ) : null}
      </span>
    </span>
  )
}
