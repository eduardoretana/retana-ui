"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
  type Variants,
} from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type AnimatedCounterClassNames = {
  root?: string
  label?: string
  value?: string
}

export type AnimatedCounterProps = {
  value: number
  label?: string
  prefix?: string
  suffix?: string
  decimals?: number
  /** Roll every digit up from zero the first time the counter scrolls into view. */
  animateOnView?: boolean
  /** Formatting locale. Fixed by default so server and client render the same digits. */
  locale?: string
  className?: string
  classNames?: AnimatedCounterClassNames
}

type Part = { key: string; digit: number; order: number } | { key: string; text: string }

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

const rise: Variants = {
  hidden: { opacity: 0, y: "0.3em", filter: `blur(${motionPresets.blur.soft}px)` },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] },
  },
  gone: {
    opacity: 0,
    y: "-0.3em",
    filter: `blur(${motionPresets.blur.subtle}px)`,
    transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
  },
}

const fade: Variants = {
  hidden: { opacity: 0, y: 0, filter: "blur(0px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.instant } },
  gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.instant } },
}

const reveal = { ...motionPresets.spring.smooth, visualDuration: motionPresets.duration.considered }

const presence = {
  initial: { width: 0, opacity: 0 },
  animate: { width: "auto", opacity: 1 },
  exit: { width: 0, opacity: 0 },
}

const wheelMask: React.CSSProperties = {
  maskImage:
    "linear-gradient(to bottom, transparent, black calc(var(--feather) * 1.5), black calc(100% - var(--feather) * 1.5), transparent)",
}

function partsFor(value: number, decimals: number, locale: string): Part[] {
  const parts = new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    numberingSystem: "latn",
  }).formatToParts(value)
  let place = parts.reduce((count, part) => count + (part.type === "integer" ? part.value.length : 0), 0)
  let fraction = 0
  let order = 0
  return parts.flatMap((part, index): Part[] => {
    if (part.type === "integer") {
      return [...part.value].map((char) => ({ key: `i${--place}`, digit: Number(char), order: order++ }))
    }
    if (part.type === "fraction") {
      return [...part.value].map((char) => ({ key: `f${fraction++}`, digit: Number(char), order: order++ }))
    }
    return [
      {
        key: part.type === "group" ? `g${place}` : part.type === "decimal" ? "d" : `${part.type}${index}`,
        text: part.value,
      },
    ]
  })
}

function Glyph({ position, digit }: { position: MotionValue<number>; digit: number }) {
  const offset = useTransform(position, (current) => ((((digit - current) % 10) + 15) % 10) - 5)
  const y = useTransform(offset, (current) => `${current}em`)
  const opacity = useTransform(offset, (current) => Math.max(0, 1 - Math.abs(current)))
  const visibility = useTransform(offset, (current) => (Math.abs(current) >= 1 ? "hidden" : "visible"))
  const filter = useTransform(offset, (current) =>
    Math.abs(current) < 0.02 || Math.abs(current) >= 1 ? "none" : `blur(${(Math.abs(current) * motionPresets.blur.subtle).toFixed(2)}px)`,
  )
  return (
    <motion.span className="absolute inset-(--feather) text-center" style={{ y, opacity, filter, visibility }} aria-hidden="true">
      {digit}
    </motion.span>
  )
}

function Column({
  digit,
  direction,
  armed,
  delay,
  reduceMotion,
}: {
  digit: number
  direction: number
  armed: boolean
  delay: number
  reduceMotion: boolean
}) {
  const position = useMotionValue(armed ? 0 : digit)
  const wheel = React.useRef({ digit: armed ? 0 : digit, target: armed ? 0 : digit, revealed: !armed })
  React.useEffect(() => {
    const state = wheel.current
    if (armed || state.digit === digit) {
      if (!armed) state.revealed = true
      return
    }
    state.target += direction < 0 && state.revealed ? -((state.digit - digit + 10) % 10) : (digit - state.digit + 10) % 10
    state.digit = digit
    if (reduceMotion) position.jump(state.target)
    else animate(position, state.target, state.revealed ? motionPresets.spring.smooth : { ...reveal, delay })
    state.revealed = true
  }, [armed, delay, digit, direction, position, reduceMotion])
  return (
    <motion.span
      className="relative inline-block overflow-hidden [--feather:0.16em] -my-(--feather) py-(--feather)"
      style={wheelMask}
      {...presence}
      transition={reduceMotion ? { duration: 0 } : motionPresets.spring.morph}
    >
      <span className="invisible" aria-hidden="true">
        0
      </span>
      {DIGITS.map((item) => (
        <Glyph key={item} position={position} digit={item} />
      ))}
    </motion.span>
  )
}

export function AnimatedCounter({
  value,
  label,
  prefix = "",
  suffix = "",
  decimals = 0,
  animateOnView = false,
  locale = "en-US",
  className,
  classNames,
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduceMotion = !!useReducedMotion()
  const [previous, setPrevious] = React.useState(value)
  const [direction, setDirection] = React.useState(1)
  if (value !== previous) {
    setPrevious(value)
    setDirection(value > previous ? 1 : -1)
  }
  const parts = partsFor(value, decimals, locale)
  const text = `${prefix}${parts.map((part) => ("text" in part ? part.text : part.digit)).join("")}${suffix}`
  const armed = animateOnView && !inView
  return (
    <span
      ref={ref}
      data-slot="animated-counter"
      className={cn(
        "relative inline-flex min-w-0 flex-col text-3xl leading-none font-medium text-foreground tabular-nums",
        className,
        classNames?.root,
      )}
    >
      {label ? (
        <span data-slot="animated-counter-label" className={cn("mb-2 block text-xs leading-normal font-normal text-muted-foreground", classNames?.label)}>
          <span className="relative block min-w-0">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.span
                key={label}
                className="block wrap-anywhere"
                variants={reduceMotion ? fade : rise}
                initial="hidden"
                animate="shown"
                exit="gone"
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
      ) : null}
      <span className="sr-only">{text}</span>
      <span data-slot="animated-counter-value" className={cn("inline-flex items-start whitespace-nowrap select-none", classNames?.value)} aria-hidden="true">
        {prefix ? <span className="inline-block overflow-x-clip">{prefix}</span> : null}
        <AnimatePresence initial={false}>
          {parts.map((part) =>
            "digit" in part ? (
              <Column
                key={part.key}
                digit={part.digit}
                direction={direction}
                armed={armed}
                delay={Math.min(part.order * motionPresets.stagger.item, 0.25)}
                reduceMotion={reduceMotion}
              />
            ) : (
              <motion.span
                key={part.key}
                className="inline-block overflow-x-clip"
                {...presence}
                transition={reduceMotion ? { duration: 0 } : motionPresets.spring.morph}
              >
                {part.text}
              </motion.span>
            ),
          )}
        </AnimatePresence>
        {suffix ? <span className="inline-block overflow-x-clip">{suffix}</span> : null}
      </span>
    </span>
  )
}
