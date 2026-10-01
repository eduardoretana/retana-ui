"use client"

/** Adapted from Arc UI (MIT). */

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent } from "react"
import { AnimatePresence, animate, cancelFrame, frame, motion, useInView, useMotionValue, usePresence, useReducedMotion, useTransform, type MotionValue, type Variants } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface BarChartDatum {
  /** Stable identity, such as an ISO date. A bar whose key survives a data change keeps its place. */
  key: string
  /** Full label for the headline and screen readers. */
  label: string
  /** Short label under the bar. Leave it out to keep the axis quiet. */
  axisLabel?: string
  value: number
}

/** One measure across a run of days, weeks, or months. */
export interface BarChartProps {
  data: BarChartDatum[]
  /** What is measured. Names the chart for assistive technology. */
  label: string
  /** The range on show. It rests under the headline. */
  period: string
  /** Unit after each value, such as "min". */
  unit?: string
  /** Headline label at rest, above the average. */
  averageLabel?: string
  /** Headline label while a bar is scrubbed. */
  valueLabel?: string
  /** Header of the first column in the data table read by screen readers. */
  categoryLabel?: string
  /** Draws the average as a reference line that springs to each new range. */
  showAverage?: boolean
  /** Plot height in pixels. */
  height?: number
  formatValue?: (value: number) => string
  className?: string
  classNames?: BarChartClassNames
}

export type BarChartClassNames = {
  root?: string
  header?: string
  kind?: string
  value?: string
  period?: string
  plot?: string
  axis?: string
  scrubber?: string
}

const physical = ({ visualDuration, bounce }: { visualDuration: number; bounce: number }, restDelta = 0.01) => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring" as const, stiffness: root * root, damping: 2 * (1 - bounce) * root, restDelta, restSpeed: restDelta * 2 }
}

const settle = physical(motionPresets.spring.smooth)
const grow = physical(motionPresets.spring.morph)
const glide = physical(motionPresets.spring.snappy)
const zoom = physical(motionPresets.spring.smooth, 0.00001)
const collapse = physical({ visualDuration: motionPresets.duration.standard, bounce: 0 })
const fadeFast = { duration: motionPresets.duration.instant, ease: [...motionPresets.ease.standard] } as const

function soon(start: () => { stop: () => void }) {
  let controls: { stop: () => void } | null = null
  const run = () => {
    controls = start()
  }
  frame.update(run)
  return () => {
    cancelFrame(run)
    controls?.stop()
  }
}

const TOP = 12
const FILL = 0.58
const MAX_BAR = 28
const RADIUS = 4
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 })
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

function scaleFor(max: number) {
  const safe = Math.max(max, 1)
  const magnitude = 10 ** Math.floor(Math.log10(safe / 4))
  for (const factor of [1, 2, 3, 5, 10]) {
    const step = factor * magnitude
    const rows = Math.ceil(safe / step)
    if (rows <= 4) return { top: rows * step, ticks: Array.from({ length: rows + 1 }, (_, row) => row * step) }
  }
  return { top: safe, ticks: [0, safe] }
}

function barPath(x: number, w: number, h: number, base: number) {
  if (w <= 0 || h <= 0.01) return `M${x.toFixed(2)} ${base}H${(x + Math.max(w, 0)).toFixed(2)}Z`
  const r = Math.min(RADIUS, w / 2, h)
  const top = base - h
  const f = (value: number) => value.toFixed(2)
  return `M${f(x)} ${base}V${f(top + r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + r)} ${f(top)}H${f(x + w - r)}A${f(r)} ${f(r)} 0 0 1 ${f(x + w)} ${f(top + r)}V${base}Z`
}

function usePlace(place: number, reduced: boolean) {
  const value = useMotionValue(place)
  useEffect(() => {
    if (value.get() === place) return
    if (reduced) {
      value.jump(place)
      return
    }
    return soon(() => animate(value, place, settle))
  }, [place, reduced, value])
  return value
}

type Frame = { width: MotionValue<number>; unit: MotionValue<number> }
const centerOf = ({ width, unit }: Frame, place: number) => width.get() - (place + 0.5) * width.get() * unit.get()

function Bar({ id, place, value, delay, shown, active, scrubbing, frame, scale, height, reduced }: { id: string; place: number; value: number; delay: number; shown: boolean; active: boolean; scrubbing: boolean; frame: Frame; scale: MotionValue<number>; height: number; reduced: boolean }) {
  const [isPresent, safeToRemove] = usePresence()
  const amount = useMotionValue(0)
  const slot = usePlace(place, reduced)
  const [firstDelay] = useState(delay)
  const grown = useRef(false)
  const remove = useRef(safeToRemove)
  useEffect(() => {
    remove.current = safeToRemove
  }, [safeToRemove])

  useEffect(() => {
    if (!isPresent) return
    if (reduced) {
      amount.jump(value)
      grown.current = true
      return
    }
    if (!shown) return
    const first = !grown.current
    grown.current = true
    return soon(() => animate(amount, value, first ? { ...grow, delay: firstDelay } : settle))
  }, [amount, firstDelay, isPresent, reduced, shown, value])

  useEffect(() => {
    if (isPresent) return
    if (reduced) {
      remove.current?.()
      return
    }
    return soon(() => animate(amount, 0, { ...collapse, onComplete: () => remove.current?.() }))
  }, [amount, isPresent, reduced])

  const d = useTransform(() => {
    const w = frame.width.get() * frame.unit.get()
    const size = Math.min(w * FILL, MAX_BAR)
    const center = centerOf(frame, slot.get())
    return barPath(center - size / 2, size, (amount.get() / scale.get()) * (height - TOP), height)
  })
  return (
    <motion.path
      data-slot="bar-chart-bar"
      data-key={id}
      data-active={active || undefined}
      className={cn("fill-chart-1 motion-reduce:transition-none", active && "fill-primary", scrubbing && !active && "opacity-35")}
      d={d}
    />
  )
}

function useRowY(value: number, scale: MotionValue<number>, height: number) {
  return useTransform(() => Math.round(height - (value / scale.get()) * (height - TOP)) + 0.5)
}

function Gridline({ value, scale, height }: { value: number; scale: MotionValue<number>; height: number }) {
  const y = useRowY(value, scale, height)
  if (value === 0) return null
  return (
    <motion.line
      className="stroke-border"
      strokeWidth={1}
      shapeRendering="crispEdges"
      x1={0}
      x2="100%"
      y1={y}
      y2={y}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: fadeFast }}
      transition={{ duration: motionPresets.duration.standard, ease: [...motionPresets.ease.standard] }}
    />
  )
}

function TickLabel({ value, scale, height, avoid, format }: { value: number; scale: MotionValue<number>; height: number; avoid: MotionValue<number> | null; format: (value: number) => string }) {
  const y = useRowY(value, scale, height)
  const opacity = useTransform(() => (avoid ? clamp((Math.abs(y.get() - avoid.get()) - 10) / 6, 0, 1) : 1))
  return (
    <motion.span className="pointer-events-none absolute top-0 left-2.5 block h-0 whitespace-nowrap" style={{ y }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: fadeFast }} transition={{ duration: motionPresets.duration.standard, ease: [...motionPresets.ease.standard] }}>
      <motion.span className="block -translate-y-1/2 text-xs text-muted-foreground tabular-nums" style={{ opacity }}>{format(value)}</motion.span>
    </motion.span>
  )
}

function AxisLabel({ text, size, shift, place, frame, reduced }: { text: string; size: number; shift: number; place: number; frame: Frame; reduced: boolean }) {
  const slot = usePlace(place, reduced)
  const x = useTransform(() => centerOf(frame, slot.get()) - size / 2 + shift)
  return (
    <motion.span className="absolute top-2 left-0 text-xs whitespace-nowrap text-muted-foreground tabular-nums" style={{ x }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, transition: fadeFast }} transition={{ duration: motionPresets.duration.standard, ease: [...motionPresets.ease.standard] }}>
      {text}
    </motion.span>
  )
}

function fittingLabels(data: BarChartDatum[], width: number, sizes: Record<string, number>) {
  const fitting = new Map<string, number>()
  if (!width) return fitting
  const count = Math.max(1, data.length)
  const labels = data.flatMap((item, index) => {
    const size = item.axisLabel ? sizes[item.axisLabel] : undefined
    if (size === undefined) return []
    const natural = width - (data.length - 1 - index + 0.5) * (width / count) - size / 2
    return [{ key: item.key, size, natural, left: clamp(natural, 0, Math.max(0, width - size)) }]
  }).reverse()
  for (let stride = 1; stride <= labels.length; stride++) {
    const picked = labels.filter((_, rank) => rank % stride === 0)
    if (stride === labels.length || picked.every((label, rank) => rank === 0 || label.left + label.size + 10 <= picked[rank - 1].left)) {
      picked.forEach((label) => fitting.set(label.key, label.left - label.natural))
      break
    }
  }
  return fitting
}

const rise: Variants = {
  hidden: (direction: number) => ({ opacity: 0, y: `${0.3 * direction}em`, filter: `blur(${motionPresets.blur.soft}px)` }),
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] } },
  gone: (direction: number) => ({ opacity: 0, y: `${-0.3 * direction}em`, filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] } }),
}
const fade: Variants = {
  hidden: { opacity: 0, y: 0, filter: "blur(0px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.instant } },
  gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.instant } },
}

function Swap({ text, direction, reduced, className }: { text: string; direction: number; reduced: boolean; className?: string }) {
  return (
    <span className={cn("relative block min-w-0", className)}>
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.span key={text} className="block truncate" custom={direction} variants={reduced ? fade : rise} initial="hidden" animate="shown" exit="gone">{text}</motion.span>
      </AnimatePresence>
    </span>
  )
}

function Roll({ text, direction, reduced }: { text: string; direction: number; reduced: boolean }) {
  const sizer = useRef<HTMLSpanElement>(null)
  const width = useMotionValue<number | "auto">("auto")
  useLayoutEffect(() => {
    const node = sizer.current
    if (!node || typeof ResizeObserver === "undefined") return
    let measured: string | null = null
    const observer = new ResizeObserver(() => {
      const next = node.offsetWidth
      if (measured !== null && measured !== node.textContent && !reduced) animate(width, next, grow)
      else width.jump(next)
      measured = node.textContent
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced, width])
  const chars = [...text]
  const variants = reduced ? fade : rise
  return (
    <motion.span className="relative inline-flex justify-end overflow-x-clip whitespace-pre" style={{ width }}>
      <span ref={sizer} className="pointer-events-none absolute top-0 left-0 whitespace-pre invisible" aria-hidden="true">{text}</span>
      <span className="relative inline-flex flex-none">
        <AnimatePresence mode="popLayout" initial={false} custom={direction} anchorX="right">
          {chars.map((char, index) => (
            <motion.span key={`p${chars.length - index}`} className="relative inline-block whitespace-pre" custom={direction} variants={variants} initial="hidden" animate="shown" exit="gone">
              <AnimatePresence mode="popLayout" initial={false} custom={direction} anchorX="right">
                <motion.span key={char} className="relative inline-block whitespace-pre" custom={direction} variants={variants} initial="hidden" animate="shown" exit="gone">{char}</motion.span>
              </AnimatePresence>
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </motion.span>
  )
}

const subscribeNothing = () => () => {}

function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

export function BarChart({ data, label, period, unit = "", averageLabel = "Daily average", valueLabel = "Total", categoryLabel = "Day", showAverage = true, height = 176, formatValue = (value) => grouped.format(value), className, classNames }: BarChartProps) {
  const reduced = useReducedMotionSafe()
  const figure = useRef<HTMLElement>(null)
  const plot = useRef<HTMLDivElement>(null)
  const inView = useInView(figure, { once: true, amount: 0.35 })
  const titleId = useId()
  const count = Math.max(data.length, 1)
  const last = data.length - 1
  const average = data.length ? data.reduce((sum, item) => sum + item.value, 0) / data.length : 0
  const peak = data.reduce((max, item) => Math.max(max, item.value), 0)
  const { top, ticks } = useMemo(() => scaleFor(peak), [peak])
  const signature = data.map((item) => item.key).join("|")
  const suffix = unit ? ` ${unit}` : ""

  const [known, setKnown] = useState(() => ({ signature, keys: new Set(data.map((item) => item.key)), fresh: new Map<string, number>(), changes: 0 }))
  const [active, setActive] = useState<number | null>(null)
  if (known.signature !== signature) {
    const incoming = data.map((item, index) => ({ key: item.key, place: last - index })).filter((item) => !known.keys.has(item.key)).sort((a, b) => a.place - b.place)
    const step = Math.min(motionPresets.stagger.item, 0.32 / Math.max(1, incoming.length))
    setKnown({ signature, keys: new Set(data.map((item) => item.key)), fresh: new Map(incoming.map((item, rank) => [item.key, rank * step])), changes: known.changes + 1 })
    setActive(null)
  }
  const revealStep = Math.min(motionPresets.stagger.item, 0.36 / count)
  const index = active === null ? null : Math.min(active, last)
  const scrubbing = index !== null && last >= 0
  const shownValue = scrubbing ? data[index].value : average
  const [trend, setTrend] = useState({ value: shownValue, index, valueWay: 1, indexWay: 1 })
  if (trend.value !== shownValue || trend.index !== index) {
    setTrend({
      value: shownValue,
      index,
      valueWay: shownValue === trend.value ? trend.valueWay : shownValue > trend.value ? 1 : -1,
      indexWay: index === null || trend.index === null ? 1 : Math.sign(index - trend.index) || 1,
    })
  }

  const width = useMotionValue(0)
  const unitShare = useMotionValue(1 / count)
  const scale = useMotionValue(top)
  const mean = useMotionValue(0)
  const cursor = useMotionValue(0)
  const frameMotion = useMemo(() => ({ width, unit: unitShare }), [width, unitShare])

  const [plotWidth, setPlotWidth] = useState(0)
  const [labelSizes, setLabelSizes] = useState<Record<string, number>>({})
  const measure = useRef<HTMLSpanElement>(null)
  const labelTexts = [...new Set(data.map((item) => item.axisLabel).filter((text): text is string => !!text))].join("\n")
  useLayoutEffect(() => {
    const node = plot.current
    const ruler = measure.current
    ;(globalThis as { __barMeasure?: unknown }).__barMeasure = [Boolean(node), node?.clientWidth ?? -1, Boolean(ruler)]
    if (!node || !ruler) return
    const read = () => {
      width.set(node.clientWidth)
      setPlotWidth(node.clientWidth)
      const sizes: Record<string, number> = {}
      ruler.querySelectorAll<HTMLElement>("[data-text]").forEach((item) => {
        sizes[item.dataset.text ?? ""] = item.offsetWidth
      })
      setLabelSizes((current) => (Object.keys(sizes).every((text) => current[text] === sizes[text]) ? current : sizes))
    }
    read()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(read)
    observer.observe(node)
    observer.observe(ruler)
    return () => observer.disconnect()
  }, [labelTexts, width])
  const shownLabels = useMemo(() => fittingLabels(data, plotWidth, labelSizes), [data, plotWidth, labelSizes])

  useEffect(() => {
    if (reduced) {
      unitShare.jump(1 / count)
      scale.jump(top)
      return
    }
    return soon(() => {
      const controls = [animate(unitShare, 1 / count, zoom), animate(scale, top, settle)]
      return { stop: () => controls.forEach((control) => control.stop()) }
    })
  }, [count, reduced, scale, top, unitShare])

  const meanStarted = useRef(false)
  useEffect(() => {
    if (reduced) {
      mean.jump(average)
      return
    }
    if (!inView) return
    const first = !meanStarted.current
    meanStarted.current = true
    return soon(() => animate(mean, average, first ? { ...settle, delay: 0.12 } : settle))
  }, [average, inView, mean, reduced])

  const wasScrubbing = useRef(false)
  useEffect(() => {
    if (index === null) {
      wasScrubbing.current = false
      return
    }
    const place = last - index
    if (reduced || !wasScrubbing.current) cursor.jump(place)
    wasScrubbing.current = true
    if (reduced) return
    const controls = animate(cursor, place, glide)
    return () => controls.stop()
  }, [cursor, index, last, reduced])

  const cursorX = useTransform(() => Math.round(centerOf(frameMotion, cursor.get())) + 0.5)
  const meanY = useTransform(() => Math.round(height - (mean.get() / scale.get()) * (height - TOP)) + 0.5)
  const meanText = useTransform(() => `Avg ${formatValue(Math.round(mean.get()))}`)

  const pointAt = (clientX: number) => {
    const rect = plot.current?.getBoundingClientRect()
    if (!rect?.width) return last
    const place = Math.floor(((rect.right - clientX) / rect.width) * count)
    return clamp(last - place, 0, last)
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && scrubbing) {
      event.preventDefault()
      setActive(null)
      return
    }
    const from = index ?? last + 1
    const page = Math.min(7, count)
    const next = ({ ArrowLeft: from - 1, ArrowDown: from - 1, ArrowRight: index === null ? last : from + 1, ArrowUp: index === null ? last : from + 1, PageDown: from - page, PageUp: from + page, Home: 0, End: last } as Record<string, number>)[event.key]
    if (next === undefined || last < 0) return
    event.preventDefault()
    setActive(clamp(next, 0, last))
  }
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") event.currentTarget.setPointerCapture?.(event.pointerId)
    setActive(pointAt(event.clientX))
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || event.buttons) setActive(pointAt(event.clientX))
  }
  const release = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") setActive(null)
  }

  const scrubbed = scrubbing ? data[index] : null
  const reading = scrubbed ?? data[last]
  const valueText = reading ? `${reading.label}: ${formatValue(reading.value)}${suffix}` : "No data"
  const highest = data.reduce<BarChartDatum | null>((best, item) => (!best || item.value > best.value ? item : best), null)
  const lowest = data.reduce<BarChartDatum | null>((best, item) => (!best || item.value < best.value ? item : best), null)
  const summary = `${label}, ${period}. ${averageLabel} ${formatValue(Math.round(average))}${suffix}.${highest ? ` Highest ${highest.label}, ${formatValue(highest.value)}${suffix}.` : ""}${lowest && lowest !== highest ? ` Lowest ${lowest.label}, ${formatValue(lowest.value)}${suffix}.` : ""}`
  const shown = inView || reduced
  const avoid = showAverage ? meanY : null

  return (
    <figure ref={figure} data-slot="bar-chart" aria-labelledby={titleId} className={cn("grid min-w-0 gap-4 text-foreground", className, classNames?.root)}>
      <figcaption id={titleId} className="sr-only">{label}, {period}</figcaption>
      <div data-slot="bar-chart-header" className={cn("grid min-w-0 gap-0.5", classNames?.header)} aria-hidden="true">
        <span className={cn("block min-h-[1.25em] text-sm text-muted-foreground", classNames?.kind)}>
          <Swap text={scrubbing ? valueLabel : averageLabel} direction={1} reduced={reduced} />
        </span>
        <span className={cn("flex min-w-0 items-baseline gap-1.5 text-3xl font-medium tracking-tight tabular-nums", classNames?.value)}>
          <Roll text={formatValue(scrubbing ? data[index].value : Math.round(average))} direction={trend.valueWay} reduced={reduced} />
          {unit ? <span className="text-base font-normal text-muted-foreground">{unit}</span> : null}
        </span>
        <span className={cn("block min-h-[1.25em] min-w-0 text-sm text-muted-foreground", classNames?.period)}>
          <Swap text={scrubbed ? scrubbed.label : period} direction={scrubbing ? trend.indexWay : 1} reduced={reduced} />
        </span>
      </div>
      <div className="relative grid min-w-0 grid-cols-[minmax(0,1fr)_52px] grid-rows-[auto_26px]" data-scrubbing={scrubbing || undefined}>
        <div ref={plot} data-slot="bar-chart-plot" className={cn("relative col-start-1 row-start-1 min-w-0", classNames?.plot)} style={{ height }}>
          <svg className="block overflow-hidden" width="100%" height={height} role="img" aria-label={summary}>
            <AnimatePresence initial={false}>{ticks.map((value) => <Gridline key={value} value={value} scale={scale} height={height} />)}</AnimatePresence>
            <motion.line className="stroke-foreground/40" strokeWidth={1} shapeRendering="crispEdges" x1={cursorX} x2={cursorX} y1={TOP} y2={height} initial={false} animate={{ opacity: scrubbing ? 1 : 0 }} transition={reduced ? { duration: 0 } : fadeFast} />
            <AnimatePresence initial={false}>
              {data.map((item, at) => (
                <Bar key={item.key} id={item.key} place={last - at} value={item.value} delay={known.fresh.get(item.key) ?? at * revealStep} shown={shown} active={index === at} scrubbing={scrubbing} frame={frameMotion} scale={scale} height={height} reduced={reduced} />
              ))}
            </AnimatePresence>
            <line className="stroke-border" strokeWidth={1} shapeRendering="crispEdges" x1={0} x2="100%" y1={height - 0.5} y2={height - 0.5} />
            {showAverage ? <motion.line className="stroke-muted-foreground" strokeWidth={1} strokeDasharray="3 3" shapeRendering="crispEdges" x1={0} x2="100%" y1={meanY} y2={meanY} initial={false} animate={{ opacity: shown ? 1 : 0 }} transition={reduced ? { duration: 0 } : { duration: motionPresets.duration.standard, delay: 0.12 }} /> : null}
          </svg>
        </div>
        <div className="relative col-start-2 row-start-1 min-w-0" aria-hidden="true">
          <AnimatePresence initial={false}>{ticks.map((value) => <TickLabel key={value} value={value} scale={scale} height={height} avoid={avoid} format={formatValue} />)}</AnimatePresence>
          {showAverage ? (
            <motion.span className="pointer-events-none absolute top-0 left-2.5 block h-0 whitespace-nowrap" style={{ y: meanY }} initial={false} animate={{ opacity: shown ? 1 : 0 }} transition={reduced ? { duration: 0 } : { duration: motionPresets.duration.standard, delay: 0.12 }}>
              <motion.span className="block -translate-y-1/2 text-xs font-medium text-foreground tabular-nums">{meanText}</motion.span>
            </motion.span>
          ) : null}
        </div>
        <div data-slot="bar-chart-axis" className={cn("relative col-start-1 row-start-2 min-w-0 overflow-hidden", classNames?.axis)} aria-hidden="true">
          <AnimatePresence initial={false}>
            {data.map((item, at) => (item.axisLabel && shownLabels.has(item.key) ? <AxisLabel key={`${item.key}:${item.axisLabel}`} text={item.axisLabel} size={labelSizes[item.axisLabel] ?? 0} shift={shownLabels.get(item.key) ?? 0} place={last - at} frame={frameMotion} reduced={reduced} /> : null))}
          </AnimatePresence>
          <span ref={measure} className="pointer-events-none absolute top-0 left-0 flex invisible">
            {labelTexts.split("\n").filter(Boolean).map((text) => <span key={text} data-text={text} className="flex-none text-xs leading-none whitespace-nowrap tabular-nums">{text}</span>)}
          </span>
        </div>
        <div
          data-slot="bar-chart-scrubber"
          className={cn("absolute inset-0 rounded-md outline-none select-none touch-pan-y focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-offset-4", classNames?.scrubber)}
          role="slider"
          tabIndex={0}
          aria-label={`${label}, explore by ${categoryLabel.toLowerCase()}`}
          aria-orientation="horizontal"
          aria-valuemin={1}
          aria-valuemax={Math.max(1, data.length)}
          aria-valuenow={(index ?? last) + 1}
          aria-valuetext={valueText}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={release}
          onPointerCancel={() => setActive(null)}
          onPointerLeave={(event) => {
            if (event.pointerType === "mouse") setActive(null)
          }}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          onFocus={(event) => {
            if (event.currentTarget.matches(":focus-visible") && last >= 0) setActive((current) => current ?? last)
          }}
        />
      </div>
      <table className="sr-only">
        <caption>{label}, {period}</caption>
        <thead><tr><th scope="col">{categoryLabel}</th><th scope="col">{label}</th></tr></thead>
        <tbody>{data.map((item) => <tr key={item.key}><th scope="row">{item.label}</th><td>{formatValue(item.value)}{suffix}</td></tr>)}</tbody>
      </table>
      <p className="sr-only" aria-live="polite" aria-atomic="true">{known.changes ? `${period}. ${averageLabel} ${formatValue(Math.round(average))}${suffix}.` : ""}</p>
    </figure>
  )
}
