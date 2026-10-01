"use client"

/** Adapted from Arc UI (MIT). */

import { useEffect, useId, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type Ref } from "react"
import { animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useSpring } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface BrushChartDatum {
  /** A point in time, as a Date or epoch milliseconds. Points must be in ascending order. */
  date: Date | number
  value: number
}

export interface BrushChartAnnotation {
  date: Date | number
  /** Short label printed beside the marker. */
  label: string
  /** Longer note for the tooltip and screen readers. */
  description?: string
}

/** A long, dense time series: the whole history, and a close look at any stretch of it. */
export interface BrushChartProps {
  data: BrushChartDatum[]
  /** What is measured. Names the chart for assistive technology. */
  label: string
  /** Unit after each value. */
  unit?: string
  formatValue?: (value: number) => string
  /** Formats the value axis. Defaults to a compact number. */
  formatTick?: (value: number) => string
  /** Formats a date in the tooltip and announcements. */
  formatDate?: (date: Date) => string
  /** Events drawn as markers on both charts. */
  annotations?: BrushChartAnnotation[]
  /** Controlled window as [start, end] epoch milliseconds. A new value glides the window there. */
  range?: [number, number]
  /** Initial window when uncontrolled. Defaults to the whole series. */
  defaultRange?: [number, number]
  /** Called while the window is dragged, resized, stepped, or reset. */
  onRangeChange?: (range: [number, number]) => void
  /** Smallest window in milliseconds. Defaults to seven days. */
  minSpan?: number
  /** Main plot height in pixels. */
  height?: number
  /** Overview strip height in pixels. */
  overviewHeight?: number
  emptyLabel?: string
  ref?: Ref<HTMLElement>
  className?: string
  classNames?: BrushChartClassNames
}

export type BrushChartClassNames = {
  root?: string
  plot?: string
  tooltip?: string
  axis?: string
  overview?: string
  window?: string
}

type Point = { t: number; value: number }
type Drag = { mode: "start" | "end" | "pan" | "new"; pointerX: number; from: [number, number]; anchor: number; moved: boolean }

const DAY = 86_400_000

const physical = ({ visualDuration, bounce }: { visualDuration: number; bounce: number }, restDelta = 0.001) => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring" as const, stiffness: root * root, damping: 2 * (1 - bounce) * root, restDelta, restSpeed: restDelta * 2 }
}

const settle = physical(motionPresets.spring.smooth)
const glide = physical(motionPresets.spring.snappy, 0.01)
const follow = { stiffness: glide.stiffness, damping: glide.damping, restDelta: 0.01 }
const draw = physical({ visualDuration: motionPresets.duration.considered * 1.8, bounce: 0 })
const TOP = 28
const GAP = 14
const GRIP = 14
const compact = new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 })
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })
const utc = (options: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-US", { timeZone: "UTC", ...options })
const fullDate = utc({ weekday: "short", month: "short", day: "numeric", year: "numeric" })
const dayTick = utc({ month: "short", day: "numeric" })
const monthTick = utc({ month: "short" })
const yearTick = utc({ year: "numeric" })
const shortDate = utc({ month: "short", day: "numeric", year: "numeric" })
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
const timeOf = (date: Date | number) => (typeof date === "number" ? date : date.getTime())
const clean = (value: number) => Number(value.toPrecision(12))

function niceTop(high: number) {
  const hi = Math.max(high, 1)
  const magnitude = 10 ** Math.floor(Math.log10(hi / 4))
  for (const factor of [1, 2, 2.5, 5, 10]) {
    const step = factor * magnitude
    const top = Math.ceil(hi / step) * step
    if (top / step <= 4 + 1e-9) return { top: clean(top), step: clean(step) }
  }
  return { top: hi, step: hi / 4 }
}

function timeTicks(start: number, end: number, width: number) {
  const room = Math.max(2, Math.floor(width / 76))
  const span = end - start
  for (const days of [1, 2, 7, 14]) {
    if (span / (days * DAY) > room) continue
    const ticks: { t: number; label: string }[] = []
    let t = Math.ceil(start / DAY) * DAY
    if (days >= 7) while (new Date(t).getUTCDay() !== 1) t += DAY
    for (; t <= end; t += days * DAY) ticks.push({ t, label: dayTick.format(t) })
    return ticks
  }
  for (const months of [1, 2, 3, 6, 12]) {
    if (span / (months * 30.44 * DAY) > room) continue
    const ticks: { t: number; label: string }[] = []
    const first = new Date(start)
    let y = first.getUTCFullYear()
    let m = first.getUTCMonth() + (first.getUTCDate() > 1 || first.getUTCHours() > 0 ? 1 : 0)
    for (;;) {
      y += Math.floor(m / 12)
      m %= 12
      const t = Date.UTC(y, m, 1)
      if (t > end) break
      if (m % months === 0) ticks.push({ t, label: m === 0 ? yearTick.format(t) : monthTick.format(t) })
      m += 1
    }
    return ticks
  }
  const ticks: { t: number; label: string }[] = []
  for (let y = new Date(start).getUTCFullYear() + 1; Date.UTC(y, 0, 1) <= end; y++) ticks.push({ t: Date.UTC(y, 0, 1), label: String(y) })
  return ticks
}

function lowerBound(points: Point[], t: number) {
  let low = 0
  let high = points.length
  while (low < high) {
    const middle = (low + high) >> 1
    if (points[middle].t < t) low = middle + 1
    else high = middle
  }
  return low
}

function linePath(points: Point[], from: number, to: number, x: (t: number) => number, y: (value: number) => number, width: number) {
  const slice = points.slice(Math.max(0, from), Math.min(points.length, to))
  if (!slice.length) return ""
  const parts: string[] = []
  if (slice.length <= width * 2) {
    for (const point of slice) parts.push(`${x(point.t).toFixed(1)},${y(point.value).toFixed(1)}`)
  } else {
    let column = -1
    let low: Point | null = null
    let high: Point | null = null
    const flush = () => {
      if (!low || !high) return
      const pair = low.t < high.t ? [low, high] : [high, low]
      for (const point of pair) parts.push(`${x(point.t).toFixed(1)},${y(point.value).toFixed(1)}`)
    }
    for (const point of slice) {
      const at = Math.floor(x(point.t))
      if (at !== column) {
        flush()
        column = at
        low = high = point
        continue
      }
      if (point.value < low!.value) low = point
      if (point.value > high!.value) high = point
    }
    flush()
  }
  return `M${parts.join("L")}`
}

const subscribeNothing = () => () => {}

function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

function useWidth<T extends HTMLElement>(fallback = 640) {
  const node = useRef<T>(null)
  const [width, setWidth] = useState(fallback)
  useLayoutEffect(() => {
    const element = node.current
    if (!element) return
    const apply = () => {
      const next = element.clientWidth
      if (next) setWidth(next)
    }
    apply()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(apply)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])
  return [node, width] as const
}

export function BrushChart({ data, label, unit = "", formatValue = (value) => grouped.format(value), formatTick = (value) => compact.format(value), formatDate = (date) => fullDate.format(date), annotations = [], range, defaultRange, onRangeChange, minSpan = 7 * DAY, height = 240, overviewHeight = 52, emptyLabel = "No data yet", ref, className, classNames }: BrushChartProps) {
  const reduced = useReducedMotionSafe()
  const uid = `brush${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const figure = useRef<HTMLElement>(null)
  const tip = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => figure.current as HTMLElement)
  const inView = useInView(figure, { once: true, amount: 0.3 })
  const [plot, width] = useWidth<HTMLDivElement>()
  const [strip, stripWidth] = useWidth<HTMLDivElement>()

  const points = useMemo(() => data.map((item) => ({ t: timeOf(item.date), value: item.value })), [data])
  const smooth = useMemo(() => {
    const around = (index: number, read: (at: number) => number[]) => {
      const out: number[][] = []
      for (let at = Math.max(0, index - 3); at <= Math.min(points.length - 1, index + 3); at++) out.push(read(at))
      return out
    }
    const raw = points.map((_, index) => {
      const values = around(index, (at) => [points[at].value]).map(([value]) => value)
      return { value: values.reduce((sum, value) => sum + value, 0) / values.length, low: Math.min(...values), high: Math.max(...values) }
    })
    return points.map((point, index) => {
      const near = around(index, (at) => [raw[at].low, raw[at].high])
      return { t: point.t, value: raw[index].value, low: near.reduce((sum, [low]) => sum + low, 0) / near.length, high: near.reduce((sum, [, high]) => sum + high, 0) / near.length }
    })
  }, [points])
  const events = useMemo(() => annotations.map((item) => ({ ...item, t: timeOf(item.date) })).sort((a, b) => a.t - b.t), [annotations])
  const empty = points.length < 2
  const first = points[0]?.t ?? 0
  const lastT = points[points.length - 1]?.t ?? 1
  const whole: [number, number] = [first, lastT]
  const fit = ([start, end]: [number, number]): [number, number] => {
    const span = clamp(end - start, Math.min(minSpan, lastT - first), lastT - first)
    const s = clamp(start, first, lastT - span)
    return [s, s + span]
  }

  const [view, setView] = useState<[number, number]>(() => range ?? defaultRange ?? whole)
  const viewRef = useRef(view)
  const flight = useRef<{ stop: () => void } | null>(null)
  const place = (next: [number, number]) => {
    viewRef.current = next
    setView(next)
  }
  const glideTo = (next: [number, number]) => {
    flight.current?.stop()
    const from = viewRef.current
    if (reduced) {
      place(next)
      return
    }
    flight.current = animate(0, 1, { ...settle, onUpdate: (t) => place([from[0] + (next[0] - from[0]) * t, from[1] + (next[1] - from[1]) * t]) })
  }
  const commit = (next: [number, number], smoothMove: boolean) => {
    const target = fit(next)
    if (smoothMove) glideTo(target)
    else {
      flight.current?.stop()
      place(target)
    }
    onRangeChange?.(target)
  }
  const rangeKey = range ? `${range[0]}:${range[1]}` : ""
  useEffect(() => {
    if (!range || empty) return
    const target = fit(range)
    const now = viewRef.current
    if (Math.abs(target[0] - now[0]) + Math.abs(target[1] - now[1]) > 1000) glideTo(target)
  }, [rangeKey, empty]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!empty) {
      const target = fit(viewRef.current)
      if (target[0] !== viewRef.current[0] || target[1] !== viewRef.current[1]) place(target)
    }
  }, [first, lastT]) // eslint-disable-line react-hooks/exhaustive-deps

  const [start, end] = view
  const span = Math.max(1, end - start)
  const from = Math.max(0, lowerBound(points, start) - 1)
  const to = Math.min(points.length, lowerBound(points, end) + 1)
  let peak = 0
  for (let index = from; index < to; index++) peak = Math.max(peak, points[index].value)
  const scale = niceTop(peak * 1.04)

  const [top, setTop] = useState(scale.top)
  const topFlight = useRef<{ stop: () => void } | null>(null)
  const aimed = useRef(scale.top)
  useEffect(() => {
    if (aimed.current === scale.top) return
    aimed.current = scale.top
    topFlight.current?.stop()
    if (reduced) return
    topFlight.current = animate(top, scale.top, { ...settle, onUpdate: setTop })
  }, [reduced, scale.top]) // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => {
    flight.current?.stop()
    topFlight.current?.stop()
  }, [])

  const plotH = height
  const x = (t: number) => ((t - start) / span) * width
  const topNow = reduced ? scale.top : top
  const y = (value: number) => TOP + (1 - value / (topNow || 1)) * (plotH - TOP)
  const line = width && !empty ? linePath(points, from, to, x, y, width) : ""
  const area = line ? `${line}L${x(points[to - 1].t).toFixed(1)},${plotH}L${x(points[from].t).toFixed(1)},${plotH}Z` : ""
  const trend = width && !empty ? linePath(smooth, from, to, x, y, width * 4) : ""
  const band = trend ? `${linePath(smooth.map((point) => ({ t: point.t, value: point.high })), from, to, x, y, width * 4)}L${linePath(smooth.map((point) => ({ t: point.t, value: point.low })), from, to, x, y, width * 4).slice(1).split("L").reverse().join("L")}Z` : ""
  const pxPerPoint = empty ? width : (width * (lastT - first)) / (points.length - 1) / span
  const detail = clamp((pxPerPoint - 2.75) / 1.5, 0, 1)
  const ticks = scale.top > 0 ? Array.from({ length: Math.round(scale.top / scale.step) + 1 }, (_, index) => clean(index * scale.step)) : []
  const xTicks = width && !empty ? timeTicks(start, end, width) : []

  const ox = (t: number) => ((t - first) / (lastT - first || 1)) * stripWidth
  const overview = useMemo(() => {
    if (!stripWidth || empty) return { line: "", area: "", marks: [] as { t: number; x: number; y: number }[] }
    const max = niceTop(smooth.reduce((m, point) => Math.max(m, point.value), 0)).top || 1
    const oy = (value: number) => 4 + (1 - value / max) * (overviewHeight - 4)
    const path = linePath(smooth, 0, smooth.length, ox, oy, stripWidth * 4)
    const marks = events.map((event) => {
      const at = clamp(lowerBound(smooth, event.t), 0, smooth.length - 1)
      return { t: event.t, x: ox(event.t), y: oy(smooth[at].value) }
    })
    return { line: path, area: `${path}L${stripWidth},${overviewHeight}L0,${overviewHeight}Z`, marks }
  }, [smooth, events, stripWidth, overviewHeight, empty]) // eslint-disable-line react-hooks/exhaustive-deps
  const wx0 = ox(start)
  const wx1 = ox(end)

  const drawn = useMotionValue(1)
  const [reveal, setReveal] = useState(1)
  const played = useRef(false)
  useMotionValueEvent(drawn, "change", setReveal)
  useLayoutEffect(() => {
    if (empty) return
    if (reduced) {
      drawn.jump(1)
      return
    }
    if (!inView || played.current) return
    played.current = true
    drawn.jump(0)
    const controls = animate(drawn, 1, draw)
    return () => controls.stop()
  }, [drawn, empty, inView, reduced])

  const [active, setActive] = useState<number | null>(null)
  const [hoverEvent, setHoverEvent] = useState<number | null>(null)
  const index = active !== null && active >= from && active < to ? active : null
  const nearest = (clientX: number) => {
    const rect = plot.current?.getBoundingClientRect()
    if (!rect?.width || empty) return null
    const t = start + ((clientX - rect.left) / rect.width) * span
    const at = clamp(lowerBound(points, t), 1, points.length - 1)
    return clamp(t - points[at - 1].t < points[at].t - t ? at - 1 : at, Math.max(0, from), to - 1)
  }
  const cx = index === null ? 0 : x(points[index].t)
  const cy = index === null ? 0 : y(smooth[index].value + (points[index].value - smooth[index].value) * detail)
  const eventAt = index === null ? null : events.find((event) => Math.abs(event.t - points[index].t) < DAY / 2) ?? null
  const shownEvent = hoverEvent !== null ? events[hoverEvent] : null
  const tipX = useMotionValue(0)
  const tipY = useMotionValue(0)
  const tipSpringX = useSpring(tipX, follow)
  const tipSpringY = useSpring(tipY, follow)
  const tipOn = index !== null || shownEvent !== null
  const wasOn = useRef(false)
  useLayoutEffect(() => {
    const bubble = tip.current
    if (!tipOn || !bubble || !width) {
      wasOn.current = false
      return
    }
    const ax = shownEvent ? x(shownEvent.t) : cx
    const ay = shownEvent ? TOP : cy
    const tw = bubble.offsetWidth
    const th = bubble.offsetHeight
    let left = ax + GAP
    if (left + tw > width) left = ax - GAP - tw
    let topY = ay - th - GAP
    if (topY < 0) topY = ay + GAP
    tipX.set(clamp(left, 0, Math.max(0, width - tw)))
    tipY.set(clamp(topY, 0, Math.max(0, plotH - th)))
    if (!wasOn.current || reduced) {
      tipSpringX.jump(tipX.get())
      tipSpringY.jump(tipY.get())
    }
    wasOn.current = true
  })

  const onPlotMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || event.buttons) setActive(nearest(event.clientX))
  }
  const onPlotKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (empty) return
    if (event.key === "Escape" && index !== null) {
      event.preventDefault()
      setActive(null)
      return
    }
    const current = index ?? to - 1
    const page = Math.max(1, Math.round((to - from) / 8))
    const next = ({ ArrowLeft: current - 1, ArrowRight: index === null ? to - 1 : current + 1, PageDown: current - page, PageUp: current + page, Home: from, End: to - 1 } as Record<string, number>)[event.key]
    if (next === undefined) return
    event.preventDefault()
    setActive(clamp(next, Math.max(0, from), to - 1))
  }

  const drag = useRef<Drag | null>(null)
  const toTime = (clientX: number) => {
    const rect = strip.current?.getBoundingClientRect()
    return rect?.width ? first + clamp((clientX - rect.left) / rect.width, 0, 1) * (lastT - first) : first
  }
  const onStripDown = (event: PointerEvent<HTMLDivElement>) => {
    if (empty || event.button > 0) return
    const rect = strip.current!.getBoundingClientRect()
    const px = event.clientX - rect.left
    const mode: Drag["mode"] = Math.abs(px - wx0) <= GRIP && px <= (wx0 + wx1) / 2 ? "start" : Math.abs(px - wx1) <= GRIP ? "end" : px > wx0 && px < wx1 ? "pan" : "new"
    drag.current = { mode, pointerX: event.clientX, from: viewRef.current, anchor: toTime(event.clientX), moved: false }
    event.currentTarget.setPointerCapture?.(event.pointerId)
    flight.current?.stop()
  }
  const onStripMove = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current
    if (!current) return
    if (!current.moved && Math.abs(event.clientX - current.pointerX) < 3) return
    current.moved = true
    const t = toTime(event.clientX)
    const shift = t - current.anchor
    const [s, e] = current.from
    const least = Math.min(minSpan, lastT - first)
    const next: [number, number] = current.mode === "pan" ? [s + shift, e + shift]
      : current.mode === "start" ? [clamp(t, first, e - least), e]
      : current.mode === "end" ? [s, clamp(t, s + least, lastT)]
      : [Math.min(current.anchor, t), Math.max(current.anchor, t)]
    if (current.mode === "new" && next[1] - next[0] < least) {
      if (t >= current.anchor) next[1] = next[0] + least
      else next[0] = next[1] - least
    }
    commit(next, false)
  }
  const onStripUp = () => {
    const current = drag.current
    drag.current = null
    if (!current || current.moved || current.mode !== "new") return
    const half = (viewRef.current[1] - viewRef.current[0]) / 2
    commit([current.anchor - half, current.anchor + half], true)
  }
  const reset = () => commit(whole, true)

  const stepSize = Math.max(DAY, (lastT - first) / Math.max(1, points.length - 1))
  const onHandleKey = (event: KeyboardEvent<HTMLDivElement>, edge: "start" | "end" | "window") => {
    const [s, e] = viewRef.current
    const win = e - s
    const big = event.shiftKey || event.key.startsWith("Page")
    const delta = ({ ArrowLeft: -1, ArrowDown: -1, PageDown: -1, ArrowRight: 1, ArrowUp: 1, PageUp: 1 } as Record<string, number>)[event.key]
    let next: [number, number] | null = null
    if (event.key === "Escape" || event.key === "0") next = whole
    else if (edge === "window" && (event.key === "+" || event.key === "=")) next = [s + win / 4, e - win / 4]
    else if (edge === "window" && (event.key === "-" || event.key === "_")) next = [s - win / 2, e + win / 2]
    else if (event.key === "Home") next = edge === "end" ? [s, s + Math.min(minSpan, lastT - first)] : [first, edge === "window" ? first + win : e]
    else if (event.key === "End") next = edge === "start" ? [e - Math.min(minSpan, lastT - first), e] : [edge === "window" ? lastT - win : s, lastT]
    else if (delta) {
      const move = delta * (edge === "window" ? win * (big ? 0.5 : 0.1) : stepSize * (big ? 10 : 1))
      next = edge === "window" ? [s + move, e + move] : edge === "start" ? [Math.min(s + move, e - minSpan), e] : [s, Math.max(e + move, s + minSpan)]
    }
    if (!next) return
    event.preventDefault()
    commit(next, false)
  }

  const format = (value: number) => `${formatValue(value)}${unit ? ` ${unit}` : ""}`
  const reading = index === null ? null : points[index]
  const previous = index !== null && index >= 7 ? points[index - 7] : null
  const change = reading && previous && previous.value ? (reading.value - previous.value) / previous.value : null
  const windowText = `${shortDate.format(start)} to ${shortDate.format(end)}`
  const inWindow = events.filter((event) => event.t >= start && event.t <= end)
  const labelled = new Map<number, boolean>()
  let edge = -Infinity
  inWindow.forEach((event, at) => {
    const px = x(event.t)
    const w = event.label.length * 6.2 + 4
    const next = at + 1 < inWindow.length ? x(inWindow[at + 1].t) - 10 : width
    if (px + 14 >= edge && px + 14 + w <= next) {
      labelled.set(event.t, false)
      edge = px + 14 + w + 8
      return
    }
    if (px - 14 - w >= Math.max(0, edge) && (at === 0 || px - 14 - w >= x(inWindow[at - 1].t) + 12)) {
      labelled.set(event.t, true)
      edge = px + 12
      return
    }
    edge = Math.max(edge, px + 12)
  })
  const announce = reading ? `${formatDate(new Date(reading.t))}, ${format(reading.value)}${eventAt ? `. ${eventAt.label}` : ""}` : ""
  const summary = empty ? `${label}. ${emptyLabel}.` : `${label}, ${shortDate.format(first)} to ${shortDate.format(lastT)}. Showing ${windowText}.`

  return (
    <figure ref={figure} data-slot="brush-chart" aria-label={label} className={cn("grid min-w-0 text-foreground", className, classNames?.root)}>
      <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)_44px] grid-rows-[auto_28px_auto]" data-active={tipOn || undefined}>
        <div
          ref={plot}
          data-slot="brush-chart-plot"
          className={cn("relative col-start-1 row-start-1 min-w-0 cursor-crosshair outline-none select-none touch-pan-y focus-visible:ring-2 focus-visible:ring-ring", classNames?.plot)}
          style={{ height: plotH }}
          role="group"
          tabIndex={empty ? -1 : 0}
          aria-roledescription="chart"
          aria-label={`${label}, ${windowText}. Use left and right arrows to read values.`}
          onPointerMove={onPlotMove}
          onPointerDown={(event) => {
            if (event.pointerType !== "mouse") {
              event.currentTarget.setPointerCapture?.(event.pointerId)
              setActive(nearest(event.clientX))
            }
          }}
          onPointerUp={(event) => { if (event.pointerType !== "mouse") setActive(null) }}
          onPointerCancel={() => setActive(null)}
          onPointerLeave={(event) => { if (event.pointerType === "mouse") setActive(null) }}
          onKeyDown={onPlotKey}
          onBlur={() => setActive(null)}
          onDoubleClick={reset}
          onFocus={(event) => { if (event.currentTarget.matches(":focus-visible") && !empty) setActive((current) => current ?? to - 1) }}
        >
          <svg className="block h-auto w-full overflow-visible" width="100%" height={plotH} viewBox={`0 0 ${Math.max(width, 1)} ${plotH}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs><clipPath id={`${uid}-plot`}><rect x={0} y={-8} width={Math.max(0, width * (reduced ? 1 : reveal))} height={plotH + 16} /></clipPath></defs>
            {ticks.slice(1).map((value) => <line key={value} className="stroke-border" strokeWidth={1} shapeRendering="crispEdges" x1={0} x2="100%" y1={Math.round(y(value)) + 0.5} y2={Math.round(y(value)) + 0.5} />)}
            <line className="stroke-border" strokeWidth={1} shapeRendering="crispEdges" x1={0} x2="100%" y1={plotH - 0.5} y2={plotH - 0.5} />
            {inWindow.map((event) => <line key={event.t} className={cn("transition-[stroke] motion-reduce:transition-none", shownEvent?.t === event.t || eventAt?.t === event.t ? "stroke-chart-2" : "stroke-border")} strokeWidth={1} shapeRendering="crispEdges" x1={Math.round(x(event.t)) + 0.5} x2={Math.round(x(event.t)) + 0.5} y1={TOP - 10} y2={plotH} />)}
            <g clipPath={`url(#${uid}-plot)`}>
              <path className="fill-chart-1" fillOpacity={0.14 * (1 - detail)} d={band} />
              <path className="fill-chart-1" fillOpacity={0.1 * detail} d={area} />
              <path className="fill-none stroke-chart-1 [stroke-linecap:round] [stroke-linejoin:round]" strokeWidth={1.75} d={trend} opacity={1 - detail} />
              <path data-slot="brush-chart-line" className="fill-none stroke-chart-1 [stroke-linecap:round] [stroke-linejoin:round]" strokeWidth={1.75} d={line} opacity={detail} />
            </g>
            <line className={cn("pointer-events-none stroke-foreground/45 transition-opacity motion-reduce:transition-none", tipOn ? "opacity-100" : "opacity-0")} strokeWidth={1} shapeRendering="crispEdges" x1={Math.round(cx) + 0.5} x2={Math.round(cx) + 0.5} y1={TOP - 10} y2={plotH} />
            <circle className={cn("pointer-events-none fill-chart-1 stroke-background transition-opacity motion-reduce:transition-none", tipOn ? "opacity-100" : "opacity-0")} strokeWidth={2} cx={cx} cy={cy} r={4} />
          </svg>
          {inWindow.map((event) => {
            const px = x(event.t)
            const i = events.indexOf(event)
            const flipped = labelled.get(event.t)
            const marked = shownEvent?.t === event.t || eventAt?.t === event.t
            return (
              <span key={event.t} className={cn("absolute top-1.5 flex min-h-6 items-center gap-1.5 text-xs whitespace-nowrap text-muted-foreground", flipped && "flex-row-reverse")} style={{ left: px, marginLeft: flipped ? 0 : -12, translate: flipped ? "calc(-100% + 12px) 0" : undefined }} aria-hidden="true" onPointerEnter={() => setHoverEvent(i)} onPointerLeave={() => setHoverEvent(null)} onPointerDown={(press) => press.stopPropagation()}>
                <span className="grid size-6 place-items-center"><span className={cn("size-1.5 rounded-full bg-chart-2 ring-2 ring-background transition-transform motion-reduce:transition-none", marked && "scale-125")} /></span>
                <span className={cn("transition-opacity motion-reduce:transition-none", labelled.has(event.t) ? "opacity-100" : "opacity-0", marked && "text-foreground")}>{event.label}</span>
              </span>
            )
          })}
          <motion.div ref={tip} data-slot="brush-chart-tooltip" className={cn("pointer-events-none absolute top-0 left-0 z-20 grid min-w-[8.25rem] max-w-full gap-0.5 rounded-xl border border-border bg-card p-2.5 shadow-md transition motion-reduce:transition-none", tipOn ? "scale-100 opacity-100" : "scale-95 opacity-0", classNames?.tooltip)} style={{ x: reduced ? tipX : tipSpringX, y: reduced ? tipY : tipSpringY }} aria-hidden="true">
            {shownEvent ? (
              <>
                <p className="m-0 mb-0.5 truncate text-xs text-muted-foreground tabular-nums">{formatDate(new Date(shownEvent.t))}</p>
                <p className="m-0 font-medium text-foreground">{shownEvent.label}</p>
                {shownEvent.description ? <p className="m-0 text-xs text-muted-foreground">{shownEvent.description}</p> : null}
              </>
            ) : reading ? (
              <>
                <p className="m-0 mb-0.5 truncate text-xs text-muted-foreground tabular-nums">{formatDate(new Date(reading.t))}</p>
                <p className="m-0 font-medium text-foreground tabular-nums">{format(reading.value)}</p>
                {detail < 1 && index !== null ? <p className="m-0 text-xs text-muted-foreground tabular-nums">{`${formatValue(Math.round(smooth[index].value))} seven day average`}</p> : null}
                {change !== null ? <p className="m-0 text-xs text-muted-foreground tabular-nums">{`${change >= 0 ? "+" : "\u2212"}${Math.abs(change * 100).toFixed(1)}% vs a week earlier`}</p> : null}
                {eventAt ? <p className="m-0 mt-1 flex items-center gap-1.5 text-xs text-foreground"><span className="size-1.5 rounded-full bg-chart-2" />{eventAt.label}</p> : null}
              </>
            ) : null}
          </motion.div>
          {empty ? <p className="pointer-events-none absolute inset-0 m-0 grid place-items-center text-sm text-muted-foreground">{emptyLabel}</p> : null}
        </div>
        <div className="relative col-start-2 row-start-1 min-w-0" aria-hidden="true">
          {ticks.map((value) => <span key={value} className="pointer-events-none absolute left-2.5 -translate-y-1/2 text-xs whitespace-nowrap text-muted-foreground tabular-nums" style={{ top: y(value) }}>{formatTick(value)}</span>)}
        </div>
        <div data-slot="brush-chart-axis" className={cn("relative col-start-1 row-start-2 min-w-0", classNames?.axis)} aria-hidden="true">
          {xTicks.map((tick) => {
            const px = x(tick.t)
            return <span key={tick.t} className="absolute top-2 text-xs whitespace-nowrap text-muted-foreground tabular-nums" style={{ left: px, translate: `${px < 24 ? 0 : px > width - 24 ? -100 : -50}% 0` }}>{tick.label}</span>
          })}
        </div>
        <div ref={strip} data-slot="brush-chart-overview" className={cn("relative col-start-1 row-start-3 mt-2 min-w-0 cursor-crosshair rounded-lg bg-muted/40 select-none touch-pan-y", classNames?.overview)} style={{ height: overviewHeight }} onPointerDown={onStripDown} onPointerMove={onStripMove} onPointerUp={onStripUp} onPointerCancel={() => { drag.current = null }} onDoubleClick={reset}>
          <svg className="block h-auto w-full overflow-visible" width="100%" height={overviewHeight} viewBox={`0 0 ${Math.max(stripWidth, 1)} ${overviewHeight}`} preserveAspectRatio="none" aria-hidden="true" focusable="false">
            <defs><clipPath id={`${uid}-window`}><rect x={wx0} y={-2} width={Math.max(0, wx1 - wx0)} height={overviewHeight + 4} /></clipPath></defs>
            <path className="fill-foreground/5" d={overview.area} />
            <path className="fill-none stroke-muted-foreground" strokeWidth={1} strokeLinejoin="round" d={overview.line} />
            <g clipPath={`url(#${uid}-window)`}>
              <path className="fill-chart-1/15" d={overview.area} />
              <path className="fill-none stroke-chart-1" strokeWidth={1} strokeLinejoin="round" d={overview.line} />
            </g>
            {overview.marks.map((mark) => <circle key={mark.t} className="fill-chart-2 stroke-background" strokeWidth={1.5} cx={mark.x} cy={mark.y} r={2.5} />)}
          </svg>
          {!empty ? (
            <>
              <div className="pointer-events-none absolute top-0 bottom-0 bg-background/50" style={{ left: 0, width: Math.max(0, wx0) }} />
              <div className="pointer-events-none absolute top-0 right-0 bottom-0 bg-background/50" style={{ left: wx1 }} />
              <div data-slot="brush-chart-window" className={cn("absolute top-0 bottom-0 cursor-grab rounded-lg ring-1 ring-chart-1 ring-inset outline-none focus-visible:ring-2 focus-visible:ring-ring active:cursor-grabbing", classNames?.window)} style={{ left: wx0, width: Math.max(0, wx1 - wx0) }} role="slider" tabIndex={0} aria-label={`${label} window`} aria-roledescription="range window" aria-valuemin={first} aria-valuemax={lastT} aria-valuenow={Math.round(start)} aria-valuetext={windowText} onKeyDown={(event) => onHandleKey(event, "window")} />
              <div className="absolute top-1/2 grid h-11 w-7 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring" style={{ left: wx0 }} role="slider" tabIndex={0} aria-label="Window start" aria-valuemin={first} aria-valuemax={Math.round(end)} aria-valuenow={Math.round(start)} aria-valuetext={shortDate.format(start)} onKeyDown={(event) => onHandleKey(event, "start")}><span className="h-5 w-1.5 rounded-full border border-border bg-card" /></div>
              <div className="absolute top-1/2 grid h-11 w-7 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize place-items-center outline-none touch-none focus-visible:ring-2 focus-visible:ring-ring" style={{ left: wx1 }} role="slider" tabIndex={0} aria-label="Window end" aria-valuemin={Math.round(start)} aria-valuemax={lastT} aria-valuenow={Math.round(end)} aria-valuetext={shortDate.format(end)} onKeyDown={(event) => onHandleKey(event, "end")}><span className="h-5 w-1.5 rounded-full border border-border bg-card" /></div>
            </>
          ) : null}
        </div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true" role="status">{announce}</p>
      <p className="sr-only">{summary}</p>
      {!empty ? (
        <div className="sr-only">
          <table>
            <caption>{`${label}, ${windowText}`}</caption>
            <thead><tr><th scope="col">Date</th><th scope="col">{label}</th><th scope="col">Event</th></tr></thead>
            <tbody>
              {points.slice(lowerBound(points, start), lowerBound(points, end + 1)).map((point) => {
                const event = events.find((item) => Math.abs(item.t - point.t) < DAY / 2)
                return <tr key={point.t}><th scope="row">{shortDate.format(point.t)}</th><td>{format(point.value)}</td><td>{event ? `${event.label}${event.description ? `. ${event.description}` : ""}` : ""}</td></tr>
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </figure>
  )
}
