"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import type { Transition, Variants } from "motion/react"
import { CalendarDays, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

/** An inclusive range of whole days. */
export type DateRange = {
  start: Date
  end: Date
}

/** A shortcut in the preset rail. `range` receives the viewer's local today. */
export type DateRangePreset = {
  label: string
  range: (today: Date) => DateRange
}

export type DateRangePickerClassNames = {
  root?: string
  trigger?: string
  surface?: string
  panel?: string
  preset?: string
  day?: string
  footer?: string
}

/**
 * A range picker whose trigger grows into the panel it opens. The panel shows two months beside a preset rail, or one
 * month with a scrolling preset row when space is tight. Arrow keys move between days, Home and End span the week,
 * and PageUp and PageDown change month (Shift jumps a year). Apply commits the range.
 */
export type DateRangePickerProps = {
  /** Controlled value. Pass `null` for no selection. */
  value?: DateRange | null
  /** Uncontrolled starting value. */
  defaultValue?: DateRange | null
  /** Called with the applied range. */
  onChange?: (range: DateRange) => void
  /** Accessible name of the trigger and the dialog. Defaults to "Date range". */
  label?: string
  placeholder?: string
  presets?: DateRangePreset[]
  minDate?: Date
  maxDate?: Date
  /** 0 is Sunday, 1 is Monday. Defaults to 0. */
  weekStartsOn?: 0 | 1
  locale?: string
  /** Force one or two months. `auto` picks two when the boundary is wide enough. */
  months?: "auto" | 1 | 2
  /** The element the panel should stay inside. Defaults to the viewport, also clamped to the parent when it is narrower. */
  boundary?: () => HTMLElement | null
  className?: string
  classNames?: DateRangePickerClassNames
}

type Size = { w: number; h: number }
type Bezier = [number, number, number, number]

const DAY = 864e5
const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate())
const monthStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), 1)
const monthEnd = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0)
const addDays = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth(), date.getDate() + amount)
const addMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, 1)
const shiftMonths = (date: Date, amount: number) => new Date(date.getFullYear(), date.getMonth() + amount, Math.min(date.getDate(), new Date(date.getFullYear(), date.getMonth() + amount + 1, 0).getDate()))
const dayDiff = (a: Date, b: Date) => Math.round((startOfDay(a).getTime() - startOfDay(b).getTime()) / DAY)
const monthDiff = (a: Date, b: Date) => (a.getFullYear() - b.getFullYear()) * 12 + a.getMonth() - b.getMonth()
const sameDay = (a?: Date | null, b?: Date | null) => Boolean(a && b && dayDiff(a, b) === 0)
const keyOf = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
const fromKey = (key: string) => {
  const [year, month, day] = key.split("-").map(Number)
  return new Date(year, month - 1, day)
}
const ordered = (a: Date, b: Date): DateRange => (dayDiff(a, b) <= 0 ? { start: a, end: b } : { start: b, end: a })
const sameRange = (a?: DateRange | null, b?: DateRange | null) => Boolean(a && b && sameDay(a.start, b.start) && sameDay(a.end, b.end))
const clampDate = (date: Date, min?: Date, max?: Date) => (min && dayDiff(date, min) < 0 ? startOfDay(min) : max && dayDiff(date, max) > 0 ? startOfDay(max) : date)

export const defaultDateRangePresets: DateRangePreset[] = [
  { label: "Today", range: (today) => ({ start: today, end: today }) },
  { label: "Yesterday", range: (today) => ({ start: addDays(today, -1), end: addDays(today, -1) }) },
  { label: "Last 7 days", range: (today) => ({ start: addDays(today, -6), end: today }) },
  { label: "Last 30 days", range: (today) => ({ start: addDays(today, -29), end: today }) },
  { label: "This month", range: (today) => ({ start: monthStart(today), end: today }) },
  { label: "Last month", range: (today) => ({ start: addMonths(today, -1), end: monthEnd(addMonths(today, -1)) }) },
  { label: "This quarter", range: (today) => ({ start: new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1), end: today }) },
  { label: "Year to date", range: (today) => ({ start: new Date(today.getFullYear(), 0, 1), end: today }) },
]

const subscribeToday = (notify: () => void) => {
  let timer = 0
  const schedule = () => {
    const now = new Date()
    timer = window.setTimeout(() => {
      notify()
      schedule()
    }, addDays(now, 1).getTime() - now.getTime() + 1000)
  }
  const onVisible = () => {
    if (document.visibilityState === "visible") notify()
  }
  schedule()
  document.addEventListener("visibilitychange", onVisible)
  return () => {
    window.clearTimeout(timer)
    document.removeEventListener("visibilitychange", onVisible)
  }
}
const readToday = () => keyOf(new Date())
const serverToday = () => ""

/** The viewer's local date, or undefined during server render and hydration. */
export function useToday() {
  const key = React.useSyncExternalStore(subscribeToday, readToday, serverToday)
  return React.useMemo(() => (key ? fromKey(key) : undefined), [key])
}

const noop = () => () => {}
function useReducedFlag() {
  const hydrated = React.useSyncExternalStore(noop, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

const { blur } = motionPresets
const enterEase = [...motionPresets.ease.enter] as Bezier
const standardEase = [...motionPresets.ease.standard] as Bezier
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 }
}
const GROW = physical(0.48, 0.12)
const SHRINK = physical(0.38, 0)
const STRETCH = physical(0.3, 0.04)
const GLIDE = physical(0.3, 0.1)
const SLIDE = physical(0.4, 0.06)
const TRIGGER_RADIUS = 18
const PANEL_RADIUS = 26
const WIDE_CELL = 36
const WIDE_MIN = 712
const EDGE = 8

const roll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 0.45}em`, filter: `blur(${blur.subtle}px)` }),
  center: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { duration: 0.26, ease: enterEase } },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -0.45}em`, filter: `blur(${blur.subtle}px)`, transition: { duration: 0.14, ease: standardEase } }),
}
const fade: Variants = {
  enter: { opacity: 0 },
  center: { opacity: 1, y: "0em", filter: "blur(0px)", transition: { duration: 0.12 } },
  exit: { opacity: 0, transition: { duration: 0.08 } },
}
const faceIn: Variants = {
  hidden: { opacity: 0, y: -4, filter: `blur(${blur.soft}px)` },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.26, ease: enterEase, delay: 0.07 } },
  gone: { opacity: 0, y: -2, filter: `blur(${blur.soft}px)`, transition: { duration: 0.12, ease: standardEase } },
}
const faceFade: Variants = {
  hidden: { opacity: 0 },
  shown: { opacity: 1, transition: { duration: 0.12 } },
  gone: { opacity: 0, transition: { duration: 0.08 } },
}
const slide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 48, filter: `blur(${blur.soft}px)` }),
  center: { opacity: 1, x: 0, filter: "blur(0px)", transition: { x: SLIDE, opacity: { duration: 0.22, ease: enterEase }, filter: { duration: 0.24, ease: enterEase } } },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction * -36,
    filter: `blur(${blur.soft}px)`,
    transition: { x: SLIDE, opacity: { duration: 0.14, ease: standardEase }, filter: { duration: 0.14, ease: standardEase } },
  }),
}

function Rolling({ text, direction, reduced }: { text: string; direction: number; reduced: boolean }) {
  const words = text.split(/\s+/).filter(Boolean)
  return (
    <span className="inline-flex gap-[0.28em] whitespace-nowrap" aria-hidden="true">
      {words.map((word, index) => (
        <span key={index} className="relative inline-block">
          <AnimatePresence initial={false} mode="popLayout" custom={direction}>
            <motion.span key={word} className="inline-block" custom={direction} variants={reduced ? fade : roll} initial="enter" animate="center" exit="exit">
              {word}
            </motion.span>
          </AnimatePresence>
        </span>
      ))}
    </span>
  )
}

function useDirection(range: DateRange | null) {
  const time = range ? range.start.getTime() * 2 + range.end.getTime() : null
  const [previous, setPrevious] = React.useState(time)
  const [direction, setDirection] = React.useState(1)
  if (time !== previous) {
    setPrevious(time)
    setDirection(time === null || previous === null || time >= previous ? 1 : -1)
  }
  return direction
}

type Segment = { left: number; width: number } | null
const cellIn = (date: Date, first: Date) => {
  const index = dayDiff(date, first)
  return { row: Math.floor(index / 7), col: index % 7 }
}

function Bar({ row, segment, reduced }: { row: number; segment: Segment; reduced: boolean }) {
  const left = useMotionValue(segment?.left ?? 0)
  const width = useMotionValue(segment?.width ?? 0)
  const opacity = useMotionValue(segment ? 1 : 0)
  const leftPct = useTransform(left, (value) => `${value}%`)
  const widthPct = useTransform(width, (value) => `${value}%`)
  const wasEmpty = React.useRef(!segment)
  React.useLayoutEffect(() => {
    if (!segment) {
      wasEmpty.current = true
      animate(opacity, 0, { duration: reduced ? 0 : 0.14 })
      return
    }
    if (wasEmpty.current || reduced) {
      left.jump(segment.left)
      width.jump(segment.width)
    } else {
      animate(left, segment.left, STRETCH)
      animate(width, segment.width, STRETCH)
    }
    wasEmpty.current = false
    animate(opacity, 1, { duration: reduced ? 0 : 0.16 })
  }, [left, opacity, reduced, segment, width])
  return (
    <motion.span
      className="absolute h-[calc(var(--cell)-6px)] rounded-full bg-accent"
      style={{ left: leftPct, width: widthPct, opacity, top: `calc(${row} * var(--cell) + 3px)` }}
    />
  )
}

function Thumb({ cell, reduced }: { cell: { row: number; col: number } | null; reduced: boolean }) {
  const x = useMotionValue(cell?.col ?? 0)
  const y = useMotionValue(cell?.row ?? 0)
  const opacity = useMotionValue(cell ? 1 : 0)
  const scale = useMotionValue(cell ? 1 : 0.8)
  const transform = useTransform(() => `translate(${x.get() * 100}%, ${y.get() * 100}%) scale(${scale.get()})`)
  const hidden = React.useRef(!cell)
  React.useLayoutEffect(() => {
    if (!cell) {
      hidden.current = true
      animate(opacity, 0, { duration: reduced ? 0 : 0.12 })
      animate(scale, 0.8, { duration: reduced ? 0 : 0.12 })
      return
    }
    if (hidden.current || reduced) {
      x.jump(cell.col)
      y.jump(cell.row)
    } else {
      animate(x, cell.col, GLIDE)
      animate(y, cell.row, GLIDE)
    }
    hidden.current = false
    animate(opacity, 1, { duration: reduced ? 0 : 0.16 })
    animate(scale, 1, reduced ? { duration: 0 } : GLIDE)
  }, [cell, opacity, reduced, scale, x, y])
  return (
    <motion.span className="absolute top-0 left-0 size-[var(--cell)]" style={{ transform, opacity }}>
      <span className="absolute inset-[3px] rounded-full bg-primary" />
    </motion.span>
  )
}

type MonthProps = {
  month: Date
  range: DateRange | null
  tabbable: string
  today?: Date
  minDate?: Date
  maxDate?: Date
  weekStartsOn: 0 | 1
  reduced: boolean
  formatters: { title: Intl.DateTimeFormat; day: Intl.DateTimeFormat; weekday: Intl.DateTimeFormat; weekdayLong: Intl.DateTimeFormat }
  onPick: (date: Date) => void
  onHover: (date: Date) => void
  onKey: (event: React.KeyboardEvent<HTMLButtonElement>, date: Date) => void
  onFocusDay: (date: Date) => void
  idBase: string
  dayClassName?: string
}

function Month({ month, range, tabbable, today, minDate, maxDate, weekStartsOn, reduced, formatters, onPick, onHover, onKey, onFocusDay, idBase, dayClassName }: MonthProps) {
  const first = React.useMemo(() => addDays(month, -((month.getDay() - weekStartsOn + 7) % 7)), [month, weekStartsOn])
  const rows = React.useMemo(() => Array.from({ length: 6 }, (_, row) => Array.from({ length: 7 }, (_, col) => addDays(first, row * 7 + col))), [first])
  const titleId = `${idBase}-${keyOf(month)}`
  const inMonth = (date: Date) => monthDiff(date, month) === 0
  const lo = range?.start
  const hi = range?.end
  const loKey = lo ? keyOf(lo) : ""
  const hiKey = hi ? keyOf(hi) : ""
  const segments = React.useMemo<Segment[]>(() => {
    if (!loKey || !hiKey) return rows.map(() => null)
    const start = fromKey(loKey)
    const end = fromKey(hiKey)
    const unit = 100 / 7
    const colOf = (date: Date) => dayDiff(date, first) % 7
    return rows.map((row) => {
      const days = row.filter((date) => monthDiff(date, month) === 0)
      if (!days.length) return null
      const rowFirst = days[0]
      const rowLast = days[days.length - 1]
      const from = dayDiff(start, rowFirst) > 0 ? start : rowFirst
      const to = dayDiff(end, rowLast) < 0 ? end : rowLast
      if (dayDiff(from, to) <= 0) {
        const a = colOf(from)
        const b = colOf(to)
        return { left: a * unit, width: (b - a + 1) * unit }
      }
      if (dayDiff(rowLast, start) < 0) return { left: (colOf(rowLast) + 1) * unit, width: 0 }
      return { left: colOf(rowFirst) * unit, width: 0 }
    })
  }, [first, hiKey, loKey, month, rows])
  const startCell = React.useMemo(() => (loKey && monthDiff(fromKey(loKey), month) === 0 ? cellIn(fromKey(loKey), first) : null), [loKey, month, first])
  const endCell = React.useMemo(() => (hiKey && hiKey !== loKey && monthDiff(fromKey(hiKey), month) === 0 ? cellIn(fromKey(hiKey), first) : null), [hiKey, loKey, month, first])

  return (
    <div className="w-[calc(var(--cell)*7)]">
      <p id={titleId} className="m-0 h-8 text-center leading-8 font-medium whitespace-nowrap text-foreground">{formatters.title.format(month)}</p>
      <div role="grid" aria-labelledby={titleId} className="grid">
        <div role="row" className="grid h-7 items-center text-center text-xs text-muted-foreground" style={{ gridTemplateColumns: "repeat(7, var(--cell))" }}>
          {rows[0].map((date) => (
            <span key={date.getDay()} role="columnheader" aria-label={formatters.weekdayLong.format(date)}>
              {formatters.weekday.format(date).slice(0, 2)}
            </span>
          ))}
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute inset-0" aria-hidden="true">
            {segments.map((segment, row) => (
              <Bar key={row} row={row} segment={segment} reduced={reduced} />
            ))}
            <Thumb cell={startCell} reduced={reduced} />
            <Thumb cell={endCell} reduced={reduced} />
          </span>
          {rows.map((row, index) => (
            <div key={index} role="row" className="grid h-[var(--cell)]" style={{ gridTemplateColumns: "repeat(7, var(--cell))" }}>
              {row.map((date) => {
                if (!inMonth(date)) return <span key={keyOf(date)} role="gridcell" className="relative block" />
                const key = keyOf(date)
                const disabled = Boolean((minDate && dayDiff(date, minDate) < 0) || (maxDate && dayDiff(date, maxDate) > 0))
                const inRange = Boolean(lo && hi && dayDiff(date, lo) >= 0 && dayDiff(date, hi) <= 0)
                const edge = sameDay(date, lo) || sameDay(date, hi)
                const isToday = sameDay(date, today)
                return (
                  <span key={key} role="gridcell" aria-selected={inRange} className="relative block">
                    <button
                      type="button"
                      className={cn(
                        "relative z-1 grid size-full place-items-center rounded-full bg-transparent p-0 text-foreground tabular-nums",
                        "focus-visible:outline-none",
                        edge && "font-medium text-primary-foreground",
                        disabled && "cursor-default text-muted-foreground opacity-50",
                        dayClassName,
                      )}
                      data-date={key}
                      data-edge={edge || undefined}
                      data-range={inRange || undefined}
                      data-today={isToday || undefined}
                      tabIndex={key === tabbable ? 0 : -1}
                      disabled={disabled}
                      aria-current={isToday ? "date" : undefined}
                      aria-label={formatters.day.format(date)}
                      onClick={() => onPick(date)}
                      onPointerEnter={() => {
                        if (!disabled) onHover(date)
                      }}
                      onFocus={() => onFocusDay(date)}
                      onKeyDown={(event) => onKey(event, date)}
                    >
                      <span className={cn("grid size-[calc(100%-6px)] place-items-center rounded-full", !edge && "hover:bg-muted focus-visible:bg-muted")}>{date.getDate()}</span>
                      {isToday ? <span className={cn("absolute bottom-1 left-1/2 size-1 -translate-x-1/2 rounded-full", edge ? "bg-primary-foreground" : "bg-primary")} /> : null}
                    </button>
                  </span>
                )
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Months({ children, direction, reduced }: { children: React.ReactNode; direction: number; reduced: boolean }) {
  const present = useIsPresent()
  return (
    <motion.div
      className="flex gap-6"
      data-current={present || undefined}
      inert={!present || undefined}
      custom={direction}
      variants={reduced ? fade : slide}
      initial="enter"
      animate="center"
      exit="exit"
    >
      {children}
    </motion.div>
  )
}

export function DateRangePicker({
  value,
  defaultValue = null,
  onChange,
  label = "Date range",
  placeholder = "Select dates",
  presets = defaultDateRangePresets,
  minDate,
  maxDate,
  weekStartsOn = 0,
  locale = "en-US",
  months = "auto",
  boundary,
  className,
  classNames,
}: DateRangePickerProps) {
  const reduced = useReducedFlag()
  const today = useToday()
  const uid = React.useId()
  const [inner, setInner] = React.useState<DateRange | null>(defaultValue)
  const committed = value !== undefined ? value : inner
  const [open, setOpen] = React.useState(false)
  const [compact, setCompact] = React.useState(false)
  const [panelWidth, setPanelWidth] = React.useState(0)
  const [view, setView] = React.useState<Date>(() => monthStart(committed?.end ?? new Date(2000, 0, 1)))
  const [direction, setDirection] = React.useState(1)
  const [draft, setDraft] = React.useState<DateRange | null>(committed)
  const [anchor, setAnchor] = React.useState<Date | null>(null)
  const [hover, setHover] = React.useState<Date | null>(null)
  const [focusKey, setFocusKey] = React.useState("")

  const formatters = React.useMemo(() => ({
    label: new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }),
    title: new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }),
    day: new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric" }),
    weekday: new Intl.DateTimeFormat(locale, { weekday: "short" }),
    weekdayLong: new Intl.DateTimeFormat(locale, { weekday: "long" }),
  }), [locale])

  const format = React.useCallback((range: DateRange | null) => {
    if (!range) return placeholder
    if (sameDay(range.start, range.end)) return formatters.label.format(range.start)
    const formatter = formatters.label as Intl.DateTimeFormat & { formatRange?: (start: Date, end: Date) => string }
    if (typeof formatter.formatRange === "function") return formatter.formatRange(range.start, range.end)
    return `${formatters.label.format(range.start)} – ${formatters.label.format(range.end)}`
  }, [formatters, placeholder])

  const count = compact ? 1 : 2
  const visible = React.useMemo(() => Array.from({ length: count }, (_, index) => addMonths(view, index)), [count, view])
  const shown = anchor ? ordered(anchor, hover ?? anchor) : draft
  const activePreset = today && !anchor ? presets.findIndex((preset) => sameRange(preset.range(today), draft)) : -1
  const days = shown ? dayDiff(shown.end, shown.start) + 1 : 0
  const committedDirection = useDirection(committed)
  const shownDirection = useDirection(shown)

  const rootRef = React.useRef<HTMLDivElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const panelRef = React.useRef<HTMLDivElement>(null)
  const railRef = React.useRef<HTMLDivElement>(null)
  const pendingFocus = React.useRef<"trigger" | "day" | null>(null)

  const width = useMotionValue<number | string>("100%")
  const height = useMotionValue<number | string>("100%")
  const radius = useMotionValue(TRIGGER_RADIUS)
  const x = useMotionValue(0)
  const rootWidth = useMotionValue<number | string>("auto")
  const sizes = React.useRef<{ trigger: Size; panel: Size | null }>({ trigger: { w: 0, h: 0 }, panel: null })
  const live = React.useRef({ open: false, reduced: false, ready: false })
  const queued = React.useRef(false)
  const boundaryRef = React.useRef(boundary)
  React.useLayoutEffect(() => {
    boundaryRef.current = boundary
  }, [boundary])

  const bounds = React.useCallback(() => {
    const element = boundaryRef.current?.()
    const viewport = { left: 0, right: document.documentElement.clientWidth || window.innerWidth || 320 }
    let left = viewport.left
    let right = viewport.right
    if (element) {
      const rect = element.getBoundingClientRect()
      left = Math.max(left, rect.left)
      right = Math.min(right, rect.right)
    }
    const parent = rootRef.current?.parentElement
    if (parent) {
      const rect = parent.getBoundingClientRect()
      if (rect.width > 0) {
        left = Math.max(left, rect.left)
        right = Math.min(right, rect.right)
      }
    }
    if (right <= left) right = left + 320
    return { left, right }
  }, [])

  const update = React.useCallback(() => {
    queued.current = false
    const { trigger, panel } = sizes.current
    const state = live.current
    if (!trigger.w) return
    const openPanel = state.open && panel ? panel : null
    const target = openPanel ?? trigger
    let offset = 0
    if (openPanel && rootRef.current) {
      const rect = rootRef.current.getBoundingClientRect()
      const box = bounds()
      offset = Math.min(0, box.right - EDGE - (rect.left + openPanel.w))
      offset = Math.max(offset, box.left + EDGE - rect.left)
    }
    const r = openPanel ? PANEL_RADIUS : TRIGGER_RADIUS
    if (!state.ready || state.reduced) {
      width.jump(target.w)
      height.jump(target.h)
      radius.jump(r)
      x.jump(offset)
      rootWidth.jump(trigger.w)
      state.ready = true
      return
    }
    const spring = openPanel ? GROW : SHRINK
    animate(width, target.w, spring)
    animate(height, target.h, spring)
    animate(radius, r, spring)
    animate(x, offset, spring)
    animate(rootWidth, trigger.w, motionPresets.spring.morph)
  }, [bounds, height, radius, rootWidth, width, x])

  const schedule = React.useCallback(() => {
    if (queued.current) return
    queued.current = true
    queueMicrotask(update)
  }, [update])

  React.useLayoutEffect(() => {
    live.current.open = open
    live.current.reduced = reduced
    if (!open) sizes.current.panel = null
    schedule()
  }, [open, reduced, schedule])

  React.useLayoutEffect(() => {
    const node = triggerRef.current
    if (!node) return
    const read = () => {
      sizes.current.trigger = { w: node.offsetWidth, h: node.offsetHeight }
      schedule()
    }
    read()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [schedule])

  React.useLayoutEffect(() => {
    const node = panelRef.current
    if (!open || !node) return
    const read = () => {
      sizes.current.panel = { w: node.offsetWidth, h: node.offsetHeight }
      schedule()
    }
    read()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [open, schedule])

  const measureLayout = React.useCallback(() => {
    const box = bounds()
    const available = Math.max(0, box.right - box.left - EDGE * 2)
    const single = months === 1 || (months === "auto" && available < WIDE_MIN)
    return { single, width: Math.min(352, Math.max(available, 280)) }
  }, [bounds, months])

  React.useEffect(() => {
    if (!open) return
    const onResize = () => {
      const next = measureLayout()
      setCompact(next.single)
      setPanelWidth(next.width)
      schedule()
    }
    window.addEventListener("resize", onResize)
    return () => window.removeEventListener("resize", onResize)
  }, [measureLayout, open, schedule])

  const viewFor = (range: DateRange | null, single: boolean, fallback: Date) => {
    const end = monthStart(range?.end ?? fallback)
    return single ? end : addMonths(end, -1)
  }

  const openPanel = () => {
    if (!today) return
    const layout = measureLayout()
    setCompact(layout.single)
    setPanelWidth(layout.width)
    setDraft(committed)
    setAnchor(null)
    setHover(null)
    setView(viewFor(committed, layout.single, today))
    setDirection(0)
    setFocusKey(keyOf(committed?.start ?? today))
    pendingFocus.current = "day"
    setOpen(true)
  }

  const close = React.useCallback((focus: boolean) => {
    if (focus) pendingFocus.current = "trigger"
    setDirection(0)
    setOpen(false)
    setAnchor(null)
    setHover(null)
  }, [])

  const apply = () => {
    const next = anchor ? { start: anchor, end: anchor } : draft
    if (!next) return
    if (value === undefined) setInner(next)
    onChange?.(next)
    close(true)
  }

  React.useLayoutEffect(() => {
    const target = pendingFocus.current
    if (!target) return
    if (target === "trigger" && !open) {
      pendingFocus.current = null
      triggerRef.current?.focus({ preventScroll: true })
      return
    }
    if (target === "day" && open) {
      const node = panelRef.current?.querySelector<HTMLButtonElement>(`[data-current] [data-date="${focusKey}"]`)
      if (node) {
        pendingFocus.current = null
        node.focus({ preventScroll: true })
      }
    }
  }, [focusKey, open, view, compact])

  React.useEffect(() => {
    if (!open) return
    const down = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) close(false)
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      event.preventDefault()
      close(true)
    }
    document.addEventListener("pointerdown", down)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", down)
      document.removeEventListener("keydown", onKey)
    }
  }, [close, open])

  const onRootKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && open) {
      event.preventDefault()
      event.stopPropagation()
      close(true)
    }
  }
  const onRootBlur = (event: React.FocusEvent<HTMLDivElement>) => {
    const next = event.relatedTarget as Node | null
    if (open && next && !event.currentTarget.contains(next)) close(false)
  }

  const goTo = (next: Date) => {
    const delta = monthDiff(next, view)
    if (!delta) return
    setDirection(Math.sign(delta))
    setView(next)
  }

  const reveal = (range: DateRange) => {
    const first = view
    const last = addMonths(view, count - 1)
    if (monthDiff(range.start, first) >= 0 && monthDiff(range.end, last) <= 0) return
    goTo(viewFor(range, compact, range.end))
  }

  const pick = (date: Date) => {
    setFocusKey(keyOf(date))
    if (!anchor) {
      setAnchor(date)
      setHover(date)
      return
    }
    setDraft(ordered(anchor, date))
    setAnchor(null)
    setHover(null)
  }

  const choosePreset = (preset: DateRangePreset) => {
    if (!today) return
    const range = preset.range(today)
    setDraft(range)
    setAnchor(null)
    setHover(null)
    setFocusKey(keyOf(range.start))
    reveal(range)
  }

  const onDayKey = (event: React.KeyboardEvent<HTMLButtonElement>, date: Date) => {
    const weekday = (date.getDay() - weekStartsOn + 7) % 7
    const moves: Record<string, () => Date> = {
      ArrowLeft: () => addDays(date, -1),
      ArrowRight: () => addDays(date, 1),
      ArrowUp: () => addDays(date, -7),
      ArrowDown: () => addDays(date, 7),
      Home: () => addDays(date, -weekday),
      End: () => addDays(date, 6 - weekday),
      PageUp: () => shiftMonths(date, event.shiftKey ? -12 : -1),
      PageDown: () => shiftMonths(date, event.shiftKey ? 12 : 1),
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    const next = clampDate(move(), minDate, maxDate)
    setFocusKey(keyOf(next))
    if (anchor) setHover(next)
    pendingFocus.current = "day"
    const first = view
    const last = addMonths(view, count - 1)
    if (monthDiff(next, first) < 0) goTo(monthStart(next))
    else if (monthDiff(next, last) > 0) goTo(addMonths(monthStart(next), -(count - 1)))
  }

  const onRailKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const keys = compact ? ["ArrowLeft", "ArrowRight"] : ["ArrowUp", "ArrowDown"]
    if (!keys.includes(event.key)) return
    const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>("[data-preset]"))
    const at = buttons.indexOf(document.activeElement as HTMLButtonElement)
    if (at < 0) return
    event.preventDefault()
    buttons[(at + (event.key === keys[1] ? 1 : -1) + buttons.length) % buttons.length]?.focus()
  }

  const tabbable = React.useMemo(() => {
    const onScreen = (date: Date) => visible.some((month) => monthDiff(date, month) === 0)
    if (focusKey && onScreen(fromKey(focusKey))) return focusKey
    if (shown && onScreen(shown.start)) return keyOf(shown.start)
    return keyOf(visible[0])
  }, [focusKey, shown, visible])

  const gx = useMotionValue(0)
  const gy = useMotionValue(0)
  const gw = useMotionValue(0)
  const gh = useMotionValue(0)
  const go = useMotionValue(0)
  React.useLayoutEffect(() => {
    const rail = railRef.current
    const node = activePreset < 0 ? null : rail?.querySelector<HTMLElement>(`[data-preset="${activePreset}"]`)
    if (!rail || !node) {
      animate(go, 0, { duration: reduced ? 0 : 0.14 })
      return
    }
    const place = [node.offsetLeft, node.offsetTop, node.offsetWidth, node.offsetHeight]
    if (go.get() < 0.05 || reduced) {
      gx.jump(place[0])
      gy.jump(place[1])
      gw.jump(place[2])
      gh.jump(place[3])
    } else {
      animate(gx, place[0], GLIDE)
      animate(gy, place[1], GLIDE)
      animate(gw, place[2], GLIDE)
      animate(gh, place[3], GLIDE)
    }
    animate(go, 1, { duration: reduced ? 0 : 0.16 })
    if (compact && (node.offsetLeft < rail.scrollLeft || node.offsetLeft + node.offsetWidth > rail.scrollLeft + rail.clientWidth)) {
      rail.scrollTo({ left: node.offsetLeft - 12, behavior: reduced ? "auto" : "smooth" })
    }
  }, [activePreset, compact, go, gh, gw, gx, gy, open, reduced])

  const committedText = format(committed)
  const shownText = shown ? format(shown) : "No dates"
  const countText = shown ? `${days} ${days === 1 ? "day" : "days"}` : ""
  const status = !open ? "" : anchor ? `Start ${formatters.label.format(anchor)}. Choose an end date.` : shown ? `${shownText}, ${countText}` : ""
  const layoutId = reduced ? undefined : `${uid}-value`
  const cellSize = compact && panelWidth ? Math.max(32, Math.min(42, Math.floor((panelWidth - 24) / 7))) : WIDE_CELL
  const quiet = open ? (reduced ? { opacity: 0 } : { opacity: 0, filter: `blur(${blur.subtle}px)` }) : { opacity: 1, filter: "blur(0px)" }
  const quietTransition = open ? { duration: 0.12, ease: standardEase } : { duration: 0.22, ease: enterEase, delay: reduced ? 0 : 0.1 }

  return (
    <motion.div
      ref={rootRef}
      data-slot="date-range-picker"
      className={cn("relative inline-block h-9 max-w-full align-top text-sm text-foreground", open ? "z-30" : "z-0", className, classNames?.root)}
      style={{ width: rootWidth }}
      data-open={open || undefined}
      onKeyDown={onRootKey}
      onBlur={onRootBlur}
    >
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          "relative z-1 inline-flex h-9 w-max max-w-full items-center gap-2.5 bg-transparent px-3.5 pe-3 font-medium whitespace-nowrap text-foreground",
          classNames?.trigger,
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={open ? `${uid}-panel` : undefined}
        aria-label={`${label}: ${committedText}`}
        disabled={!today}
        inert={open || undefined}
        onClick={openPanel}
      >
        <motion.span className="grid shrink-0 place-items-center text-muted-foreground" initial={false} animate={quiet} transition={quietTransition}>
          <CalendarDays className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </motion.span>
        {open || !layoutId ? (
          <motion.span
            key="resting"
            className={cn("inline-flex min-w-0 truncate tabular-nums", !committed && "font-normal text-muted-foreground")}
            initial={false}
            animate={open ? { opacity: 0 } : { opacity: 1 }}
            transition={quietTransition}
          >
            <Rolling text={committedText} direction={committedDirection} reduced={reduced} />
          </motion.span>
        ) : (
          <motion.span
            key="shared"
            layoutId={layoutId}
            layout="position"
            className={cn("inline-flex min-w-0 truncate tabular-nums", !committed && "font-normal text-muted-foreground")}
            transition={SHRINK}
          >
            <Rolling text={committedText} direction={committedDirection} reduced={reduced} />
          </motion.span>
        )}
        <motion.span className="grid shrink-0 place-items-center text-muted-foreground" initial={false} animate={quiet} transition={quietTransition}>
          <ChevronDown className="size-4" strokeWidth={1.75} aria-hidden="true" />
        </motion.span>
      </button>

      <motion.div className={cn("absolute top-0 left-0 z-2 overflow-clip bg-popover shadow-md", classNames?.surface)} style={{ width, height, borderRadius: radius, x }}>
        <span className="pointer-events-none absolute inset-0 rounded-[inherit] border border-border" />
        <AnimatePresence>
          {open && today ? (
            <motion.div
              key="panel"
              ref={panelRef}
              id={`${uid}-panel`}
              role="dialog"
              aria-label={label}
              data-compact={compact || undefined}
              className={cn("absolute top-0 left-0 w-max max-w-full p-2.5", compact && "p-2", classNames?.panel)}
              style={{ ["--cell" as string]: `${cellSize}px`, width: compact && panelWidth ? panelWidth : undefined }}
              exit={{ opacity: 1, transition: { duration: 0.14 } }}
            >
              <motion.div className={cn("flex gap-2.5", compact && "flex-col gap-2")} variants={reduced ? faceFade : faceIn} initial="hidden" animate="shown" exit="gone">
                <div
                  ref={railRef}
                  role="group"
                  aria-label="Presets"
                  className={cn(
                    "relative flex w-[9.25rem] shrink-0 flex-col gap-0.5 border-e border-border pe-2.5",
                    compact && "w-auto flex-row overflow-x-auto border-e-0 border-b pe-0 pb-2",
                  )}
                  onKeyDown={onRailKey}
                >
                  <motion.span className="pointer-events-none absolute top-0 left-0 rounded-xl bg-accent" style={{ x: gx, y: gy, width: gw, height: gh, opacity: go }} aria-hidden="true" />
                  {presets.map((preset, index) => (
                    <button
                      key={preset.label}
                      type="button"
                      data-preset={index}
                      aria-pressed={index === activePreset}
                      className={cn(
                        "relative flex h-8 shrink-0 items-center rounded-xl bg-transparent px-3 text-left whitespace-nowrap text-muted-foreground",
                        "hover:bg-muted hover:text-foreground focus-visible:bg-muted focus-visible:text-foreground focus-visible:outline-none",
                        index === activePreset && "font-medium text-foreground",
                        classNames?.preset,
                      )}
                      onClick={() => choosePreset(preset)}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
                <div
                  className={cn("relative px-0.5", compact && "self-center")}
                  onPointerLeave={() => {
                    if (anchor) setHover(null)
                  }}
                >
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 left-0.5 z-2 size-8 rounded-full"
                    aria-label="Previous month"
                    onClick={() => goTo(addMonths(view, -1))}
                    disabled={Boolean(minDate && monthDiff(view, minDate) <= 0)}
                  >
                    <ChevronLeft className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute top-0 right-0.5 z-2 size-8 rounded-full"
                    aria-label="Next month"
                    onClick={() => goTo(addMonths(view, 1))}
                    disabled={Boolean(maxDate && monthDiff(addMonths(view, count - 1), maxDate) >= 0)}
                  >
                    <ChevronRight className="size-4" strokeWidth={1.75} aria-hidden="true" />
                  </Button>
                  <div className="relative overflow-clip">
                    <AnimatePresence initial={false} mode="popLayout" custom={direction}>
                      <Months key={`${keyOf(view)}-${count}`} direction={direction} reduced={reduced}>
                        {visible.map((month) => (
                          <Month
                            key={keyOf(month)}
                            month={month}
                            range={shown}
                            tabbable={tabbable}
                            today={today}
                            minDate={minDate}
                            maxDate={maxDate}
                            weekStartsOn={weekStartsOn}
                            reduced={reduced}
                            formatters={formatters}
                            idBase={uid}
                            dayClassName={classNames?.day}
                            onPick={pick}
                            onHover={(date) => {
                              if (anchor) setHover(date)
                            }}
                            onKey={onDayKey}
                            onFocusDay={(date) => setFocusKey(keyOf(date))}
                          />
                        ))}
                      </Months>
                    </AnimatePresence>
                  </div>
                </div>
              </motion.div>
              <div className={cn("mt-2.5 flex items-center justify-between gap-3 border-t border-border pt-2.5", compact && "mt-1.5 flex-wrap", classNames?.footer)}>
                <div className="grid min-w-0 gap-px">
                  <motion.span
                    layoutId={layoutId}
                    layout={layoutId ? "position" : undefined}
                    className="inline-flex w-max font-medium tabular-nums"
                    transition={GROW}
                    variants={layoutId ? undefined : faceFade}
                    initial={layoutId ? undefined : "hidden"}
                    animate={layoutId ? undefined : "shown"}
                    exit={layoutId ? undefined : "gone"}
                  >
                    <Rolling text={shownText} direction={shownDirection} reduced={reduced} />
                  </motion.span>
                  <motion.span className="inline-flex min-h-[1.4em] text-xs text-muted-foreground tabular-nums" variants={reduced ? faceFade : faceIn} initial="hidden" animate="shown" exit="gone">
                    {countText ? <Rolling text={anchor && sameDay(anchor, hover) ? "Pick an end date" : countText} direction={shownDirection} reduced={reduced} /> : null}
                  </motion.span>
                </div>
                <motion.div className="flex shrink-0 items-center gap-1.5" variants={reduced ? faceFade : faceIn} initial="hidden" animate="shown" exit="gone">
                  <Button type="button" variant="ghost" size="sm" onClick={() => close(true)}>Cancel</Button>
                  <Button type="button" size="sm" className="min-w-[4.75rem]" onClick={apply} disabled={!shown}>Apply</Button>
                </motion.div>
              </div>
              <p className="sr-only" aria-live="polite">{status}</p>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  )
}
