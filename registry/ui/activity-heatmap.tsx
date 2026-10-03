"use client"

/** Adapted from Arc UI (MIT). */

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import type { FocusEvent, KeyboardEvent, PointerEvent, ReactNode } from "react"
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion } from "motion/react"
import type { Variants } from "motion/react"

import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface ActivityDay {
  /** Calendar day as YYYY-MM-DD. */
  date: string
  count: number
}

/**
 * A contribution style calendar: one square per day, weeks as columns, with four accent tints for how busy a day was.
 * Use it when rhythm, streaks, and quiet weeks matter more than exact comparisons; use a bar chart when the exact
 * comparison is the point. Cells wave in once on view, a tooltip glides between cells on hover or keyboard focus, and a
 * new range recolors the grid in a sweep instead of redrawing it. Arrow keys move by day and week, Enter selects.
 */
export interface ActivityHeatmapProps {
  /** One entry per day, oldest first. Days missing inside the range count as zero. */
  days: ActivityDay[]
  /** Accessible name for the grid, such as "Contributions in 2025". */
  label: string
  /** Finishes the summary line: "1,284 contributions in {period}". */
  period: string
  /** Nouns for the count. */
  unit?: { one: string; other: string }
  /** Upper bounds for levels one to three; anything above the last is level four. Defaults to quarters of the busiest day. */
  thresholds?: [number, number, number]
  weekStartsOn?: 0 | 1
  selectedDate?: string | null
  onSelectDate?: (date: string) => void
  /** Controls beside the summary, such as a range switch. */
  actions?: ReactNode
  /** Formatting locale. Fixed by default so server and client render the same labels. */
  locale?: string
  className?: string
  classNames?: ActivityHeatmapClassNames
}

export type ActivityHeatmapClassNames = {
  root?: string
  header?: string
  grid?: string
  legend?: string
  tooltip?: string
}

type Model = {
  start: number
  length: number
  lead: number
  weeks: number
  total: number
  counts: number[]
  levels: number[]
  thresholds: [number, number, number]
  months: { month: number; col: number; label: string }[]
  perLevel: number[]
}
type Tip = { key: string; primary: string; secondary: string; value: number; anchor: HTMLElement }
type Change = 1 | -1 | 0 | "instant"

const DAY = 86_400_000
const LEVELS = [0, 1, 2, 3, 4] as const
const CELL = 12
const GAP = 3
const STEP = CELL + GAP
const levelFill = ["var(--muted)", "var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-5)"]
const enter = [...motionPresets.ease.enter] as [number, number, number, number]
const standard = [...motionPresets.ease.standard] as [number, number, number, number]
const WAVE = 420
const toUtc = (iso: string) => Date.parse(`${iso}T00:00:00Z`)
const toIso = (time: number) => new Date(time).toISOString().slice(0, 10)

function buildModel(days: ActivityDay[], weekStartsOn: 0 | 1, thresholds: [number, number, number] | undefined, locale: string): Model {
  const dates = days.map((day) => toUtc(day.date)).filter(Number.isFinite)
  const start = dates.length ? Math.min(...dates) : toUtc("2025-01-01")
  const length = dates.length ? Math.round((Math.max(...dates) - start) / DAY) + 1 : 0
  const counts = new Array<number>(length).fill(0)
  days.forEach((day) => {
    const index = Math.round((toUtc(day.date) - start) / DAY)
    if (index >= 0 && index < length) counts[index] += Math.max(0, day.count)
  })
  const max = counts.reduce((a, b) => Math.max(a, b), 0)
  const bounds = thresholds ?? ([Math.max(1, Math.ceil(max * 0.25)), Math.max(2, Math.ceil(max * 0.5)), Math.max(3, Math.ceil(max * 0.75))] as [number, number, number])
  const levels = counts.map((count) => (count <= 0 ? 0 : count <= bounds[0] ? 1 : count <= bounds[1] ? 2 : count <= bounds[2] ? 3 : 4))
  const lead = (new Date(start).getUTCDay() - weekStartsOn + 7) % 7
  const weeks = Math.ceil((lead + length) / 7)
  const monthName = new Intl.DateTimeFormat(locale, { month: "short", timeZone: "UTC" })
  const months: Model["months"] = []
  for (let index = 0; index < length; index++) {
    const date = new Date(start + index * DAY)
    if (index === 0 || date.getUTCDate() === 1) months.push({ month: date.getUTCFullYear() * 12 + date.getUTCMonth(), col: Math.floor((lead + index) / 7), label: monthName.format(date) })
  }
  if (months.length > 1 && months[1].col - months[0].col < 3) months.shift()
  const perLevel = [0, 0, 0, 0, 0]
  levels.forEach((level) => perLevel[level]++)
  return { start, length, lead, weeks, total: counts.reduce((a, b) => a + b, 0), counts, levels, thresholds: bounds, months, perLevel }
}

const CONTRIBUTIONS = { one: "contribution", other: "contributions" }
const noun = (count: number, unit: { one: string; other: string }) => (count === 1 ? unit.one : unit.other)
const noopSubscribe = () => () => {}

function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const reduced = useReducedMotion()
  return hydrated && !!reduced
}

const tipText = (reduced: boolean): Variants => ({
  from: (change: Change) => (change === "instant" ? { opacity: 1, y: "0em", filter: "blur(0px)" } : reduced ? { opacity: 0 } : { opacity: 0, y: `${0.3 * (change || 1)}em`, filter: `blur(${change ? motionPresets.blur.soft : motionPresets.blur.subtle}px)` }),
  to: { opacity: 1, y: "0em", filter: "blur(0px)" },
  gone: (change: Change) => (change === "instant" || reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: `${-0.3 * (change || 1)}em`, filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: 0.12, ease: standard } }),
})

function RollingNumber({ value, locale, reduced }: { value: number; locale: string; reduced: boolean }) {
  const [state, setState] = useState({ value, direction: 1 })
  if (state.value !== value) setState({ value, direction: value > state.value ? 1 : -1 })
  const inner = useRef<HTMLSpanElement>(null)
  const width = useMotionValue<number | "auto">("auto")
  const armedUntil = useRef(0)
  const lastValue = useRef(value)
  useLayoutEffect(() => {
    if (lastValue.current === value) return
    lastValue.current = value
    armedUntil.current = performance.now() + 600
  }, [value])
  useEffect(() => {
    const node = inner.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      const next = node.getBoundingClientRect().width
      if (reduced || width.get() === "auto" || performance.now() > armedUntil.current) width.jump(next)
      else animate(width, next, motionPresets.spring.morph)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced, width])
  const chars = [...new Intl.NumberFormat(locale).format(value)]
  const variants: Variants = {
    from: (direction: number) => (reduced ? { opacity: 0 } : { opacity: 0, y: `${0.3 * direction}em`, filter: `blur(${motionPresets.blur.soft}px)` }),
    to: { opacity: 1, y: "0em", filter: "blur(0px)" },
    gone: (direction: number) => (reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: `${-0.3 * direction}em`, filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: 0.14, ease: standard } }),
  }
  return (
    <motion.span className="inline-flex justify-end overflow-clip" style={{ width }} aria-hidden="true">
      <span ref={inner} className="inline-flex shrink-0">
        {chars.map((char, index) => {
          const place = chars.length - index
          return (
            <span key={place} className="relative inline-flex overflow-clip">
              <AnimatePresence mode="popLayout" initial={false} custom={state.direction}>
                <motion.span key={char} className="inline-block" custom={state.direction} variants={variants} initial="from" animate="to" exit="gone" transition={reduced ? { duration: 0.15 } : { duration: 0.22, ease: enter, delay: Math.min(place * 0.018, 0.09) }}>
                  {char}
                </motion.span>
              </AnimatePresence>
            </span>
          )
        })}
      </span>
    </motion.span>
  )
}

function RiseText({ text, reduced, children }: { text: string; reduced: boolean; children?: ReactNode }) {
  return (
    <span className="relative inline-flex" aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={text}
          className="inline-block"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.3em", filter: `blur(${motionPresets.blur.soft}px)` }}
          animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
          exit={reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: "-0.3em", filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: 0.14, ease: standard } }}
          transition={{ duration: reduced ? 0.15 : 0.22, ease: enter }}
        >
          {children ?? text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

export function ActivityHeatmap({ days, label, period, unit: unitProp = CONTRIBUTIONS, thresholds, weekStartsOn = 0, selectedDate = null, onSelectDate, actions, locale = "en-US", className, classNames }: ActivityHeatmapProps) {
  const reduced = useReducedMotionSafe()
  const id = useId()
  const unit = useMemo(() => ({ one: unitProp.one, other: unitProp.other }), [unitProp.one, unitProp.other])
  const rootRef = useRef<HTMLDivElement>(null)
  const plotRef = useRef<HTMLDivElement>(null)
  const gridRef = useRef<SVGSVGElement>(null)
  const scrollerRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<SVGRectElement>(null)
  const measureRef = useRef<HTMLSpanElement>(null)
  const inView = useInView(plotRef, { once: true, amount: 0.35 })

  const model = useMemo(() => buildModel(days, weekStartsOn, thresholds, locale), [days, weekStartsOn, thresholds, locale])
  const formats = useMemo(() => ({
    long: new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }),
    short: new Intl.DateTimeFormat(locale, { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }),
    weekday: new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" }),
    number: new Intl.NumberFormat(locale),
  }), [locale])

  const [range, setRange] = useState({ start: model.start, direction: 1 })
  if (range.start !== model.start) setRange({ start: model.start, direction: model.start > range.start ? 1 : -1 })

  const [reveal, setReveal] = useState<"hidden" | "revealing" | "done">("hidden")
  useEffect(() => {
    if (reveal !== "hidden" || !(inView || reduced)) return
    const frame = requestAnimationFrame(() => setReveal(reduced ? "done" : "revealing"))
    return () => cancelAnimationFrame(frame)
  }, [inView, reduced, reveal])
  useEffect(() => {
    if (reveal !== "revealing") return
    const timer = window.setTimeout(() => setReveal("done"), WAVE + 700)
    return () => window.clearTimeout(timer)
  }, [reveal])

  const selectedIndex = selectedDate ? Math.round((toUtc(selectedDate) - model.start) / DAY) : -1
  const hasSelection = selectedIndex >= 0 && selectedIndex < model.length
  const [focusIndex, setFocusIndex] = useState<number | null>(null)
  const tabIndexDay = focusIndex !== null && focusIndex < model.length ? focusIndex : hasSelection ? selectedIndex : model.length - 1

  const [preview, setPreview] = useState<number | null>(null)
  const [pinned, setPinned] = useState<number | null>(null)
  const [legendFocus, setLegendFocus] = useState(0)
  const previewTimer = useRef(0)
  const highlight = preview ?? pinned
  const previewLevel = (level: number | null) => {
    window.clearTimeout(previewTimer.current)
    if (level !== null) setPreview(level)
    else previewTimer.current = window.setTimeout(() => setPreview(null), 90)
  }
  useEffect(() => () => window.clearTimeout(previewTimer.current), [])

  const [tip, setTip] = useState<Tip | null>(null)
  const [open, setOpen] = useState(false)
  const [change, setChange] = useState<Change>("instant")
  const openRef = useRef(false)
  const hideTimer = useRef(0)
  const tipX = useMotionValue(0)
  const tipY = useMotionValue(0)
  const tipWidth = useMotionValue<number | "auto">("auto")

  function contentFor(index: number, anchor: HTMLElement): Tip {
    const count = model.counts[index]
    const date = new Date(model.start + index * DAY)
    return { key: `day-${toIso(date.getTime())}`, primary: count ? `${formats.number.format(count)} ${noun(count, unit)}` : `No ${unit.other}`, secondary: formats.short.format(date), value: count, anchor }
  }
  const [a, b, c] = model.thresholds
  const ranges = [`no ${unit.other}`, a === 1 ? `1 ${unit.one}` : `1 to ${a} ${unit.other}`, `${a + 1} to ${b} ${unit.other}`, `${b + 1} to ${c} ${unit.other}`, `${c + 1} or more ${unit.other}`]
  const shortRanges = [`no ${unit.other}`, a === 1 ? `1 ${unit.one}` : `1–${a} ${unit.other}`, `${a + 1}–${b} ${unit.other}`, `${b + 1}–${c} ${unit.other}`, `${c + 1}+ ${unit.other}`]
  const dayCount = highlight === null ? "" : `${formats.number.format(model.perLevel[highlight])} ${model.perLevel[highlight] === 1 ? "day" : "days"}`
  const caption = highlight === null ? "" : `${dayCount} with ${shortRanges[highlight]}`
  function show(next: Tip) {
    window.clearTimeout(hideTimer.current)
    setChange(tip && openRef.current ? (Math.sign(next.value - tip.value) as Change) : "instant")
    setTip(next)
    setOpen(true)
  }
  function hideSoon(delay = 110) {
    window.clearTimeout(hideTimer.current)
    hideTimer.current = window.setTimeout(() => setOpen(false), delay)
  }
  useEffect(() => () => window.clearTimeout(hideTimer.current), [])

  useLayoutEffect(() => {
    const root = rootRef.current
    const measure = measureRef.current
    if (!tip || !root || !measure) return
    const place = (glide: boolean) => {
      const box = root.getBoundingClientRect()
      const cell = tip.anchor.getBoundingClientRect()
      const width = Math.ceil(measure.getBoundingClientRect().width)
      const half = width / 2 + 13
      const x = Math.min(Math.max(cell.left - box.left + cell.width / 2, half + 2), box.width - half - 2)
      const y = cell.top - box.top
      if (glide) {
        animate(tipX, x, motionPresets.spring.snappy)
        animate(tipY, y, motionPresets.spring.snappy)
        animate(tipWidth, width, motionPresets.spring.morph)
      } else {
        tipX.jump(x)
        tipY.jump(y)
        tipWidth.jump(width)
      }
    }
    place(open && openRef.current && !reduced)
    openRef.current = open
    if (!open) return
    const scroller = scrollerRef.current?.querySelector("[data-slot=scroll-area-viewport]")
    const follow = () => place(false)
    scroller?.addEventListener("scroll", follow, { passive: true })
    return () => scroller?.removeEventListener("scroll", follow)
  }, [tip, open, reduced, tipX, tipY, tipWidth])

  const indexOf = (element: Element | null) => {
    const cell = element?.closest<HTMLElement>("[data-index]")
    return cell && gridRef.current?.contains(cell) ? { cell, index: Number(cell.dataset.index) } : null
  }
  const focusDay = (index: number) => gridRef.current?.querySelector<HTMLElement>(`[data-index="${index}"]`)?.focus()

  function onGridPointerOver(event: PointerEvent<SVGSVGElement>) {
    const hit = indexOf(event.target as Element)
    if (hit) show(contentFor(hit.index, hit.cell))
  }
  function onGridPointerLeave(event: PointerEvent<SVGSVGElement>) {
    const focused = indexOf(document.activeElement)
    if (focused?.cell.matches(":focus-visible")) show(contentFor(focused.index, focused.cell))
    else hideSoon(event.pointerType === "touch" ? 2400 : 110)
  }
  function onGridFocus(event: FocusEvent<SVGSVGElement>) {
    const hit = indexOf(event.target)
    if (!hit) return
    setFocusIndex(hit.index)
    show(contentFor(hit.index, hit.cell))
  }
  function onGridBlur(event: FocusEvent<SVGSVGElement>) {
    if (!gridRef.current?.contains(event.relatedTarget as Node | null)) hideSoon(0)
  }
  function onGridKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    const hit = indexOf(event.target as Element)
    if (!hit) return
    const moves: Record<string, number> = { ArrowUp: hit.index - 1, ArrowDown: hit.index + 1, ArrowLeft: hit.index - 7, ArrowRight: hit.index + 7, Home: 0, End: model.length - 1 }
    if (event.key in moves) {
      event.preventDefault()
      focusDay(Math.min(Math.max(moves[event.key], 0), model.length - 1))
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault()
      onSelectDate?.(toIso(model.start + hit.index * DAY))
    } else if (event.key === "Escape" && open) {
      event.preventDefault()
      setOpen(false)
    }
  }

  function onLegendKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const moves: Record<string, number> = { ArrowLeft: legendFocus - 1, ArrowRight: legendFocus + 1, Home: 0, End: 4 }
    if (event.key === "Escape") {
      previewLevel(null)
      return
    }
    if (!(event.key in moves)) return
    event.preventDefault()
    const next = Math.min(Math.max(moves[event.key], 0), 4)
    rootRef.current?.querySelector<HTMLElement>(`[data-level-key="${next}"]`)?.focus()
  }

  const ringShown = hasSelection && reveal !== "hidden"
  const ringWasShown = useRef(ringShown)
  useLayoutEffect(() => {
    const ring = ringRef.current
    if (ring && ringShown && !ringWasShown.current) {
      ring.style.transitionProperty = "opacity"
      void ring.getBoundingClientRect()
      ring.style.transitionProperty = ""
    }
    ringWasShown.current = ringShown
  }, [ringShown])

  const maxDiagonal = Math.max(1, model.weeks - 1 + 6)
  const stepDelay = Math.min(12, WAVE / maxDiagonal)
  const cells = useMemo(() => {
    const nodes: ReactNode[] = []
    for (let row = 0; row < 7; row++) {
      for (let col = 0; col < model.weeks; col++) {
        const index = col * 7 + row - model.lead
        const inRange = index >= 0 && index < model.length
        const delay = range.direction < 0 ? Math.round((maxDiagonal - col - row) * stepDelay) : Math.round((col + row) * stepDelay)
        const x = col * STEP
        const y = row * STEP
        if (!inRange) {
          nodes.push(<rect key={`${row}-${col}`} x={x} y={y} width={CELL} height={CELL} rx={3} fill={levelFill[0]} opacity={0} aria-hidden="true" />)
          continue
        }
        const level = model.levels[index]
        const count = model.counts[index]
        const date = new Date(model.start + index * DAY)
        const dimmed = highlight !== null && level !== highlight
        const hidden = reveal === "hidden"
        nodes.push(
          <rect
            key={`${row}-${col}`}
            role="gridcell"
            data-index={index}
            data-level={level}
            x={x}
            y={y}
            width={CELL}
            height={CELL}
            rx={3}
            tabIndex={index === tabIndexDay ? 0 : -1}
            aria-selected={onSelectDate ? index === selectedIndex : undefined}
            aria-label={`${count ? formats.number.format(count) : "No"} ${noun(count, unit)}, ${formats.long.format(date)}`}
            fill={levelFill[level]}
            className="cursor-default outline-none focus-visible:stroke-ring focus-visible:[stroke-width:2]"
            style={{
              opacity: hidden ? 0 : dimmed ? 0.2 : 1,
              transformBox: "fill-box",
              transformOrigin: "center",
              transform: hidden && !reduced ? "scale(0.5)" : "scale(1)",
              transition: reduced ? "opacity 150ms linear" : reveal === "revealing" ? `opacity 360ms cubic-bezier(0.16, 1, 0.3, 1) ${delay}ms, transform 420ms cubic-bezier(0.22, 1, 0.36, 1) ${delay}ms` : "opacity 320ms cubic-bezier(0.22, 1, 0.36, 1), transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
            }}
            onClick={() => onSelectDate?.(toIso(date.getTime()))}
          />,
        )
      }
    }
    return nodes
  }, [model, stepDelay, maxDiagonal, tabIndexDay, selectedIndex, formats, unit, onSelectDate, highlight, reveal, range.direction, reduced])

  const weekdayLabels = useMemo(() => Array.from({ length: 7 }, (_, row) => {
    const weekday = (row + weekStartsOn) % 7
    return weekday % 2 === 1 ? formats.weekday.format(new Date((3 + weekday) * DAY)) : ""
  }), [formats, weekStartsOn])

  const selectedCol = hasSelection ? Math.floor((selectedIndex + model.lead) / 7) : 0
  const selectedRow = hasSelection ? (selectedIndex + model.lead) % 7 : 0
  const summary = `${formats.number.format(model.total)} ${noun(model.total, unit)} in ${period}`
  const plotWidth = Math.max(model.weeks, 1) * STEP
  const plotHeight = 7 * STEP

  return (
    <div ref={rootRef} data-slot="activity-heatmap" className={cn("@container relative grid min-w-0 gap-4 text-foreground", className, classNames?.root)}>
      <div data-slot="activity-heatmap-header" className={cn("flex min-w-0 flex-wrap items-center justify-between gap-3", classNames?.header)}>
        <p className="m-0 flex min-w-0 flex-wrap items-baseline gap-x-[0.3em] text-sm text-muted-foreground tabular-nums">
          <span className="font-medium whitespace-nowrap text-foreground">
            <RollingNumber value={model.total} locale={locale} reduced={reduced} /> {noun(model.total, unit)}
          </span>{" "}
          <span className="whitespace-nowrap">in <RiseText text={period} reduced={reduced} /></span>
          <span className="sr-only" role="status">{summary}</span>
        </p>
        {actions ? <div className="flex shrink-0 items-center">{actions}</div> : null}
      </div>

      <div ref={scrollerRef}>
      <ScrollArea className="w-full">
        <div className="grid w-max grid-cols-[30px_auto] gap-x-[3px] gap-y-2">
          <div className="sticky left-0 z-10 col-start-1 row-span-2 row-start-1 grid content-end grid-rows-7 gap-[3px] bg-background text-xs text-muted-foreground" aria-hidden="true">
            {weekdayLabels.map((text, row) => <span key={row} className="flex h-3 items-center leading-none whitespace-nowrap">{text}</span>)}
          </div>
          <div className="relative col-start-2 row-start-1 h-4 text-xs text-muted-foreground" aria-hidden="true">
            {model.months.map((month, order) => (
              <span key={`${month.month}-${order}`} className="absolute top-0 left-0 whitespace-nowrap transition-transform" style={{ transform: `translateX(${month.col * STEP}px)` }}>{month.label}</span>
            ))}
          </div>
          <div ref={plotRef} className="relative col-start-2 row-start-2">
            <svg
              ref={gridRef}
              data-slot="activity-heatmap-grid"
              role="grid"
              aria-label={label}
              aria-readonly="true"
              aria-describedby={`${id}-legend`}
              width={plotWidth}
              height={plotHeight}
              className={cn("block outline-none", classNames?.grid)}
              onPointerOver={onGridPointerOver}
              onPointerLeave={onGridPointerLeave}
              onFocus={onGridFocus}
              onBlur={onGridBlur}
              onKeyDown={onGridKeyDown}
            >
              {cells}
              <rect
                ref={ringRef}
                fill="none"
                className="pointer-events-none stroke-foreground"
                strokeWidth={1.5}
                x={-3}
                y={-3}
                width={CELL + 6}
                height={CELL + 6}
                rx={5}
                aria-hidden="true"
                style={{
                  transform: `translate(${selectedCol * STEP}px, ${selectedRow * STEP}px)`,
                  opacity: ringShown ? 1 : 0,
                  transition: reduced ? "opacity 150ms linear" : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1), opacity 160ms",
                }}
              />
            </svg>
          </div>
        </div>
      </ScrollArea>
      </div>

      <div data-slot="activity-heatmap-legend" className={cn("flex min-w-0 items-center justify-between gap-3 text-xs text-muted-foreground", classNames?.legend)}>
        <span id={`${id}-legend`} className="sr-only">Darker squares mean more {unit.other}. Levels: {ranges.join(", ")}.</span>
        <span className="min-w-0 truncate text-muted-foreground tabular-nums" aria-live="polite">
          <RiseText text={caption} reduced={reduced}>
            {caption ? (
              <>
                <span className="@max-[440px]:hidden">{caption}</span>
                <span className="hidden @max-[440px]:inline">{dayCount}</span>
              </>
            ) : null}
          </RiseText>
          <span className="sr-only">{caption}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <span aria-hidden="true">Less</span>
          <div className="flex" role="group" aria-label="Highlight days by level" onKeyDown={onLegendKeyDown}>
            {LEVELS.map((level) => (
              <button
                key={level}
                type="button"
                className="grid h-5 w-[15px] cursor-pointer place-items-center rounded border-0 bg-transparent p-0 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-pressed:ring-1 aria-pressed:ring-foreground"
                data-level-key={level}
                tabIndex={level === legendFocus ? 0 : -1}
                aria-pressed={pinned === level}
                aria-label={`Highlight days with ${ranges[level]}`}
                onClick={() => setPinned((current) => (current === level ? null : level))}
                onPointerEnter={() => previewLevel(level)}
                onPointerLeave={() => previewLevel(null)}
                onFocus={() => {
                  setLegendFocus(level)
                  previewLevel(level)
                }}
                onBlur={() => previewLevel(null)}
              >
                <svg width="11" height="11" aria-hidden="true">
                  <rect width="11" height="11" rx="3" fill={levelFill[level]} />
                </svg>
              </button>
            ))}
          </div>
          <span aria-hidden="true">More</span>
        </span>
      </div>

      <motion.div data-slot="activity-heatmap-tooltip" className={cn("pointer-events-none absolute top-0 left-0 z-10 size-0", classNames?.tooltip)} style={{ x: tipX, y: tipY }} aria-hidden="true">
        <motion.div
          className="absolute bottom-2 left-0 block origin-bottom rounded-lg border border-foreground/15 bg-foreground px-3 py-1.5 text-background shadow-md"
          style={{ x: "-50%" }}
          initial={false}
          animate={open && tip ? { opacity: 1, scale: 1 } : { opacity: 0, scale: reduced ? 1 : 0.96 }}
          transition={reduced ? { duration: open ? 0.15 : 0.1 } : open ? { ...motionPresets.spring.snappy, opacity: { duration: motionPresets.duration.fast, ease: enter } } : { duration: 0.12, ease: standard }}
        >
          <motion.span className="relative block overflow-clip" style={{ width: tipWidth }}>
            <span ref={measureRef} className="absolute top-0 left-0 grid w-max invisible">
              <span className="text-sm font-medium whitespace-nowrap">{tip?.primary}</span>
              <span className="text-xs whitespace-nowrap text-background/70">{tip?.secondary}</span>
            </span>
            <AnimatePresence mode="popLayout" initial={false} custom={change}>
              {tip ? (
                <motion.span key={tip.key} className="grid w-max" custom={change} variants={tipText(reduced)} initial="from" animate="to" exit="gone" transition={{ duration: reduced ? 0.15 : 0.22, ease: enter }}>
                  <span className="text-sm font-medium whitespace-nowrap tabular-nums">{tip.primary}</span>
                  <span className="text-xs whitespace-nowrap text-background/70">{tip.secondary}</span>
                </motion.span>
              ) : null}
            </AnimatePresence>
          </motion.span>
        </motion.div>
      </motion.div>
    </div>
  )
}
