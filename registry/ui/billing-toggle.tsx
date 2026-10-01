"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue, type Transition, type Variants } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type BillingToggleOption = {
  value: string
  label: string
  /** Short savings note, e.g. "Save 20%". */
  badge?: string
  /** Badge text once this option is selected, e.g. "You save $48". Defaults to `badge`. */
  activeBadge?: string
}

export type BillingToggleClassNames = {
  root?: string
  option?: string
  thumb?: string
  badge?: string
  label?: string
}

export type BillingToggleProps = {
  value: string
  onValueChange: (value: string) => void
  options?: BillingToggleOption[]
  /** Accessible name of the group. */
  label?: string
  size?: "md" | "lg"
  className?: string
  classNames?: BillingToggleClassNames
}

export type BillingPriceClassNames = {
  root?: string
  amount?: string
  period?: string
}

export type BillingPriceProps = {
  amount: number
  currency?: string
  /** Period after the price, e.g. "per month". Swaps in place when it changes. */
  period?: string
  /** Previous price, shown struck through when it is higher than `amount`. */
  was?: number
  decimals?: number
  className?: string
  classNames?: BillingPriceClassNames
}

const glide: Transition = { type: "spring", visualDuration: 0.34, bounce: 0 }
const clip: Transition = { type: "spring", visualDuration: 0.36, bounce: 0 }

const DEFAULT_OPTIONS: BillingToggleOption[] = [
  { value: "monthly", label: "Monthly" },
  { value: "yearly", label: "Yearly", badge: "Save 20%" },
]

const swap: Variants = {
  hidden: { opacity: 0, y: "0.45em", filter: `blur(${motionPresets.blur.subtle}px)` },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] } },
  gone: {
    opacity: 0,
    y: "-0.45em",
    filter: `blur(${motionPresets.blur.subtle}px)`,
    transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
  },
}

const still: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: motionPresets.duration.fast } },
  gone: { opacity: 0, transition: { duration: 0 } },
}

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

type Part = { key: string; digit: number; order: number } | { key: string; text: string }

function partsFor(value: number, decimals: number): Part[] {
  const parts = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    numberingSystem: "latn",
  }).formatToParts(value)
  let place = parts.reduce((sum, part) => sum + (part.type === "integer" ? part.value.length : 0), 0)
  let fraction = 0
  let order = 0
  return parts.flatMap((part, index): Part[] => {
    if (part.type === "integer") return [...part.value].map((char) => ({ key: `i${--place}`, digit: Number(char), order: order++ }))
    if (part.type === "fraction") return [...part.value].map((char) => ({ key: `f${fraction++}`, digit: Number(char), order: order++ }))
    return [{ key: part.type === "group" ? `g${place}` : part.type === "decimal" ? "d" : `${part.type}${index}`, text: part.value }]
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
    <motion.span className="absolute inset-0 text-center" style={{ y, opacity, filter, visibility }}>
      {digit}
    </motion.span>
  )
}

function Column({ digit, direction, delay, reduceMotion }: { digit: number; direction: number; delay: number; reduceMotion: boolean }) {
  const position = useMotionValue(digit)
  const wheel = React.useRef({ digit, target: digit, revealed: true })
  React.useEffect(() => {
    const state = wheel.current
    if (state.digit === digit) return
    state.target += direction < 0 && state.revealed ? -((state.digit - digit + 10) % 10) : (digit - state.digit + 10) % 10
    state.digit = digit
    if (reduceMotion) position.jump(state.target)
    else animate(position, state.target, { ...motionPresets.spring.smooth, delay })
  }, [delay, digit, direction, position, reduceMotion])
  return (
    <motion.span
      className="relative inline-block overflow-hidden"
      initial={{ width: 0, opacity: 0 }}
      animate={{ width: "auto", opacity: 1 }}
      exit={{ width: 0, opacity: 0 }}
      transition={reduceMotion ? { duration: 0 } : motionPresets.spring.morph}
    >
      <span className="invisible">0</span>
      {DIGITS.map((item) => (
        <Glyph key={item} position={position} digit={item} />
      ))}
    </motion.span>
  )
}

function PriceCounter({ value, decimals }: { value: number; decimals: number }) {
  const reduceMotion = !!useReducedMotion()
  const [previous, setPrevious] = React.useState(value)
  const [direction, setDirection] = React.useState(1)
  if (value !== previous) {
    setPrevious(value)
    setDirection(value > previous ? 1 : -1)
  }
  const parts = partsFor(value, decimals)
  const text = parts.map((part) => ("text" in part ? part.text : part.digit)).join("")
  return (
    <span className="relative inline-flex">
      <span className="sr-only">{text}</span>
      <span className="inline-flex items-start whitespace-nowrap tabular-nums" aria-hidden="true">
        <AnimatePresence initial={false}>
          {parts.map((part) =>
            "digit" in part ? (
              <Column
                key={part.key}
                digit={part.digit}
                direction={direction}
                delay={Math.min(part.order * motionPresets.stagger.item, 0.25)}
                reduceMotion={reduceMotion}
              />
            ) : (
              <motion.span
                key={part.key}
                className="inline-block overflow-x-clip"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: "auto", opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={reduceMotion ? { duration: 0 } : motionPresets.spring.morph}
              >
                {part.text}
              </motion.span>
            ),
          )}
        </AnimatePresence>
      </span>
    </span>
  )
}

function StableSwap({ text, candidates, reduced, className }: { text: string; candidates: string[]; reduced: boolean; className?: string }) {
  return (
    <span className={cn("relative inline-grid justify-items-center overflow-y-clip", className)}>
      {[...new Set(candidates)].map((candidate) => (
        <span key={candidate} className="col-start-1 row-start-1 invisible" aria-hidden="true">
          {candidate}
        </span>
      ))}
      <AnimatePresence initial={false}>
        <motion.span
          key={text}
          className="col-start-1 row-start-1 inline-block"
          variants={reduced ? still : swap}
          initial="hidden"
          animate="shown"
          exit="gone"
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

type Thumb = { x: number; width: number }

export function BillingToggle({
  value,
  onValueChange,
  options = DEFAULT_OPTIONS,
  label = "Billing period",
  size = "md",
  className,
  classNames,
}: BillingToggleProps) {
  const reduced = !!useReducedMotion()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const refs = React.useRef<Array<HTMLButtonElement | null>>([])
  const [thumb, setThumb] = React.useState<Thumb | null>(null)
  const selectedIndex = Math.max(0, options.findIndex((option) => option.value === value))

  const measure = React.useCallback(() => {
    const node = refs.current[selectedIndex]
    if (!node) return
    setThumb((current) =>
      current && current.x === node.offsetLeft && current.width === node.offsetWidth
        ? current
        : { x: node.offsetLeft, width: node.offsetWidth },
    )
  }, [selectedIndex])

  React.useLayoutEffect(() => {
    measure()
    const root = rootRef.current
    if (!root || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(root)
    return () => observer.disconnect()
  }, [measure])

  const onKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0
    const target =
      event.key === "Home" ? 0 : event.key === "End" ? options.length - 1 : step ? (index + step + options.length) % options.length : -1
    if (target < 0) return
    event.preventDefault()
    onValueChange(options[target].value)
    refs.current[target]?.focus()
  }

  return (
    <div
      ref={rootRef}
      role="radiogroup"
      aria-label={label}
      data-slot="billing-toggle"
      data-size={size}
      className={cn(
        "relative isolate inline-flex max-w-full items-center rounded-full border border-border bg-muted p-0.5 text-sm",
        size === "lg" && "p-1 text-base",
        className,
        classNames?.root,
      )}
    >
      {thumb ? (
        <motion.span
          data-slot="billing-toggle-thumb"
          className={cn(
            "pointer-events-none absolute top-0.5 bottom-0.5 left-0 z-0 rounded-full border border-border bg-background shadow-sm",
            size === "lg" && "top-1 bottom-1",
            classNames?.thumb,
          )}
          aria-hidden="true"
          initial={false}
          animate={{ x: thumb.x, width: thumb.width }}
          transition={reduced ? { duration: 0 } : glide}
        />
      ) : null}
      {options.map((option, index) => {
        const selected = index === selectedIndex
        const badgeText = selected ? (option.activeBadge ?? option.badge) : option.badge
        const candidates = [option.badge, option.activeBadge].filter((text): text is string => !!text)
        return (
          <button
            key={option.value}
            ref={(node) => {
              refs.current[index] = node
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            tabIndex={selected ? 0 : -1}
            data-slot="billing-toggle-option"
            data-selected={selected || undefined}
            className={cn(
              "relative inline-flex h-8 min-w-0 max-w-full cursor-pointer items-center rounded-full border-0 bg-transparent px-3.5 text-sm font-medium whitespace-normal text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[selected]:cursor-default data-[selected]:text-foreground",
              size === "lg" && "h-10 px-4 text-base",
              option.badge && "pr-1",
              classNames?.option,
            )}
            onClick={() => onValueChange(option.value)}
            onKeyDown={(event) => onKeyDown(event, index)}
          >
            {selected && !thumb ? <span className="absolute inset-0 -z-10 rounded-full border border-border bg-background shadow-sm" aria-hidden="true" /> : null}
            <span className="relative inline-flex min-w-0 items-center gap-2">
              <span data-slot="billing-toggle-label" className={cn("font-medium break-all", classNames?.label)}>
                {option.label}
              </span>
              {badgeText ? (
                <span
                  data-slot="billing-toggle-badge"
                  data-active={selected || undefined}
                  className={cn(
                    "inline-flex h-5 max-w-full items-center rounded-full bg-muted px-2 text-xs font-medium text-muted-foreground tabular-nums",
                    selected && "bg-primary/15 text-primary",
                    classNames?.badge,
                  )}
                >
                  <StableSwap text={badgeText} candidates={candidates} reduced={reduced} className="max-w-full break-all" />
                </span>
              ) : null}
            </span>
          </button>
        )
      })}
    </div>
  )
}

export function BillingPrice({ amount, currency = "$", period, was, decimals = 0, className, classNames }: BillingPriceProps) {
  const reduced = !!useReducedMotion()
  const showWas = was !== undefined && was > amount
  const periodRef = React.useRef<HTMLSpanElement>(null)
  const [periodWidth, setPeriodWidth] = React.useState<number | null>(null)

  React.useLayoutEffect(() => {
    const sizer = periodRef.current
    if (sizer) setPeriodWidth(sizer.offsetWidth)
  }, [period])

  return (
    <span data-slot="billing-price" className={cn("inline-flex min-w-0 max-w-full flex-wrap items-end gap-x-2.5 gap-y-1", className, classNames?.root)}>
      <span className={cn("inline-flex items-start text-3xl leading-none text-foreground tabular-nums", classNames?.amount)}>
        <span className="mt-[0.12em] mr-[0.04em] text-[0.55em] text-muted-foreground">{currency}</span>
        <PriceCounter value={amount} decimals={decimals} />
      </span>
      <span className="inline-flex items-baseline pb-[0.3em] text-sm whitespace-nowrap text-muted-foreground">
        <AnimatePresence initial={false}>
          {showWas ? (
            <motion.span
              key="was"
              className="inline-block overflow-x-clip"
              initial={reduced ? { opacity: 0 } : { opacity: 0, width: 0 }}
              animate={{ opacity: 1, width: "auto" }}
              exit={
                reduced
                  ? { opacity: 0, transition: { duration: 0 } }
                  : { opacity: 0, width: 0, transition: { ...clip, opacity: { duration: motionPresets.duration.fast } } }
              }
              transition={
                reduced
                  ? { duration: motionPresets.duration.fast }
                  : { ...clip, opacity: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] } }
              }
            >
              <del className="inline-block pr-1.5 text-muted-foreground tabular-nums">
                {currency}
                {was.toFixed(decimals)}
              </del>
            </motion.span>
          ) : null}
        </AnimatePresence>
        {period ? (
          <motion.span
            className={cn("relative inline-block overflow-x-clip", classNames?.period)}
            initial={false}
            animate={periodWidth === null ? undefined : { width: periodWidth }}
            transition={reduced ? { duration: 0 } : clip}
          >
            <span ref={periodRef} className="invisible inline-block" aria-hidden="true">
              {period}
            </span>
            <AnimatePresence initial={false}>
              <motion.span
                key={period}
                className="absolute top-0 left-0 inline-block"
                variants={reduced ? still : swap}
                initial="hidden"
                animate="shown"
                exit="gone"
              >
                {period}
              </motion.span>
            </AnimatePresence>
          </motion.span>
        ) : null}
      </span>
    </span>
  )
}
