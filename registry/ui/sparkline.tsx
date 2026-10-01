"use client"

/** Adapted from Arc UI (MIT). */

import { useCallback, useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react"
import { AnimatePresence, animate, motion, useInView, useMotionValue, useMotionValueEvent, useReducedMotion, useTransform, type Variants } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface SparklineProps {
  data: number[]
  label: string
  value?: string
  change?: string
  tone?: "accent" | "success" | "warning" | "danger"
  width?: number
  height?: number
  /** One label per point, such as a date. It replaces the change while that point is scrubbed. */
  labels?: string[]
  /** Formats a scrubbed point for the headline. Defaults to a grouped number. */
  formatValue?: (value: number, index: number) => string
  /** A quiet neutral fill under the line. */
  area?: boolean
  /** Pointer and keyboard scrubbing through the points. */
  interactive?: boolean
  className?: string
  classNames?: SparklineClassNames
}

export type SparklineClassNames = {
  root?: string
  caption?: string
  label?: string
  value?: string
  change?: string
  plot?: string
}

const toneClass = {
  accent: "text-primary",
  success: "text-[color:var(--chart-2)]",
  warning: "text-[color:var(--chart-4)]",
  danger: "text-destructive",
} as const

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
const amountIn = (text: string) => Number(text.replace(/,/g, "").replace(/−/g, "-").match(/-?\d+(?:\.\d+)?/)?.[0] ?? NaN)
const grouped = new Intl.NumberFormat("en-US")
const draw = { duration: motionPresets.duration.considered * 1.75, ease: [...motionPresets.ease.inOut] } as const
const quick = { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] } as const

type Chunk = { slot: string; key: string; text: string }

function chunksOf(text: string, whole: boolean): Chunk[] {
  if (!text) return []
  if (whole) return [{ slot: "all", key: text, text }]
  if (!/\p{L}/u.test(text)) return [...text].map((char, index, all) => ({ slot: `n${all.length - index}`, key: char, text: char }))
  const words = text.split(/(?<=\s)/)
  return words.map((word, index) => ({ slot: `w${index}`, key: words.slice(0, index + 1).join(""), text: word }))
}

function Roll({ text, direction, whole = false, morph = false, className }: { text: string; direction?: number; whole?: boolean; morph?: boolean; className?: string }) {
  const reduceMotion = !!useReducedMotion()
  const sizer = useRef<HTMLSpanElement>(null)
  const width = useMotionValue<number | "auto">("auto")
  const [shown, setShown] = useState({ text, direction: 1 })
  if (shown.text !== text) setShown({ text, direction: direction ?? (amountIn(text) < amountIn(shown.text) ? -1 : 1) })
  useEffect(() => {
    const node = sizer.current
    if (!node || typeof ResizeObserver === "undefined") return
    let measured: string | null = null
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth
      if (measured !== null && measured !== node.textContent && !reduceMotion) animate(width, next, motionPresets.spring.morph)
      else width.jump(next)
      measured = node.textContent
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [morph, reduceMotion, width])
  const numeric = !whole && !/\p{L}/u.test(text)
  const variants = reduceMotion ? fade : rise
  const anchor = numeric ? "right" : "left"
  return (
    <motion.span className={cn("relative inline-flex max-w-full overflow-x-clip align-top whitespace-pre", numeric && "justify-end", className)} style={morph ? { width } : undefined}>
      {morph ? <span ref={sizer} className="pointer-events-none absolute top-0 left-0 whitespace-pre invisible" aria-hidden="true">{text}</span> : null}
      <span className="relative inline-block whitespace-pre">
        <AnimatePresence mode="popLayout" initial={false} custom={shown.direction} anchorX={anchor}>
          {chunksOf(text, whole).map((chunk) => (
            <motion.span key={chunk.slot} className={cn("relative inline-block whitespace-pre", whole && "max-w-full overflow-hidden text-ellipsis align-top")} custom={shown.direction} variants={variants} initial="hidden" animate="shown" exit="gone">
              <AnimatePresence mode="popLayout" initial={false} custom={shown.direction} anchorX={anchor}>
                <motion.span key={chunk.key} className={cn("relative inline-block whitespace-pre", whole && "max-w-full overflow-hidden text-ellipsis align-top")} custom={shown.direction} variants={variants} initial="hidden" animate="shown" exit="gone">{chunk.text}</motion.span>
              </AnimatePresence>
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </motion.span>
  )
}

type Point = [number, number]
const inset = 5
const cap = 1.25
const grid = Array.from({ length: 161 }, (_, index) => index / 160)

function curveFor(data: number[]): Point[] {
  const min = Math.min(...data)
  const span = Math.max(...data) - min
  const ys = data.map((value) => (span ? (value - min) / span : 0.5))
  const last = ys.length - 1
  const step = 1 / last
  const slopes = ys.slice(1).map((y, index) => (y - ys[index]) / step)
  const tangents = ys.map((_, index) => (index === 0 || index === last ? slopes[0] : (Math.sign(slopes[index - 1]) + Math.sign(slopes[index])) * Math.min(Math.abs(slopes[index - 1]), Math.abs(slopes[index]), Math.abs(slopes[index - 1] + slopes[index]) / 4) || 0))
  if (last > 1) {
    tangents[0] = (3 * slopes[0] - tangents[1]) / 2
    tangents[last] = (3 * slopes[last - 1] - tangents[last - 1]) / 2
  }
  const samples = Math.max(1, Math.min(16, Math.round(128 / last)))
  const points: Point[] = []
  for (let index = 0; index < last; index++) {
    for (let sample = 0; sample < samples; sample++) {
      const t = sample / samples
      const t2 = t * t
      const t3 = t2 * t
      const y = (2 * t3 - 3 * t2 + 1) * ys[index] + (t3 - 2 * t2 + t) * step * tangents[index] + (3 * t2 - 2 * t3) * ys[index + 1] + (t3 - t2) * step * tangents[index + 1]
      points.push([(index + t) * step, Math.min(1, Math.max(0, y))])
    }
  }
  points.push([1, ys[last]])
  return points
}

function heightAt(shape: Point[], x: number) {
  let low = 0
  let high = shape.length - 1
  if (x <= shape[low][0]) return shape[low][1]
  if (x >= shape[high][0]) return shape[high][1]
  while (high - low > 1) {
    const middle = (low + high) >> 1
    if (shape[middle][0] < x) low = middle
    else high = middle
  }
  const [x0, y0] = shape[low]
  const [x1, y1] = shape[high]
  return x1 === x0 ? y1 : y0 + ((y1 - y0) * (x - x0)) / (x1 - x0)
}

function geometryOf(shape: Point[], w: number, h: number, at: number) {
  const toY = (y: number) => inset + (1 - y) * (h - inset * 2)
  const points = shape.map(([x, y]): Point => [x * w, toY(y)])
  const pairs = points.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
  const cx = at * w
  const cy = toY(heightAt(shape, at))
  return { points, line: pairs.join(" "), trail: `M${pairs.join("L")}`, fill: `M${pairs.join("L")}L${w},${h}L0,${h}Z`, dot: `${cx},${cy} ${cx},${cy}`, cx }
}

function tipAt(points: Point[], progress: number) {
  const steps = points.slice(1).map(([x, y], index) => Math.hypot(x - points[index][0], y - points[index][1]))
  let left = progress * steps.reduce((sum, step) => sum + step, 0)
  for (let index = 0; index < steps.length; index++) {
    if (left <= steps[index]) return points[index][0] + (points[index + 1][0] - points[index][0]) * (steps[index] ? left / steps[index] : 1)
    left -= steps[index]
  }
  return points[points.length - 1][0]
}

export function Sparkline({ data, label, value, change, tone = "accent", width = 160, height = 52, labels, formatValue, area = true, interactive = true, className, classNames }: SparklineProps) {
  const safeData = data.length > 1 ? data : [data[0] ?? 0, data[0] ?? 0]
  const last = safeData.length - 1
  const key = safeData.join(",")
  const target = useMemo(() => curveFor(key.split(",").map(Number)), [key])
  const description = `${label}: ${value ?? safeData[last]}. ${change ?? ""}`.trim()
  const uid = `sparkline${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`
  const ref = useRef<HTMLElement>(null)
  const plot = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduceMotion = !!useReducedMotion()
  const [box, setBox] = useState({ w: width, h: height })
  const [active, setActive] = useState<number | null>(null)
  const [landed, setLanded] = useState(false)
  const index = active === null ? null : Math.min(active, last)
  const [moved, setMoved] = useState({ index, direction: 1 })
  if (moved.index !== index) setMoved({ index, direction: index === null || moved.index === null ? 1 : Math.sign(index - moved.index) || 1 })

  const [first] = useState(() => geometryOf(target, width, height, 1))
  const shape = useRef(target)
  const size = useRef(box)
  const drawn = useMotionValue(0)
  const cursor = useMotionValue(1)
  const line = useMotionValue(first.line)
  const trail = useMotionValue(first.trail)
  const fill = useMotionValue(first.fill)
  const dot = useMotionValue(first.dot)
  const cursorX = useMotionValue(first.cx)
  const lit = useMotionValue(first.cx + cap + 16)
  const dim = useMotionValue(first.cx + cap)
  const reveal = useMotionValue(0)
  const lineOpacity = useTransform(drawn, (progress) => (progress > 0.001 ? 1 : 0))
  const stroke = toneClass[tone]

  const paint = useCallback(() => {
    const { w, h } = size.current
    const progress = drawn.get()
    const next = geometryOf(shape.current, w, h, cursor.get())
    line.set(next.line)
    trail.set(next.trail)
    fill.set(next.fill)
    dot.set(next.dot)
    cursorX.set(next.cx)
    lit.set(next.cx + cap + 16)
    dim.set(next.cx + cap)
    reveal.set(progress >= 1 ? w + 32 : tipAt(next.points, progress) + 16)
  }, [cursor, cursorX, dim, dot, drawn, fill, line, lit, reveal, trail])
  useMotionValueEvent(cursor, "change", paint)
  useMotionValueEvent(drawn, "change", paint)

  useLayoutEffect(() => {
    const node = plot.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      const w = node.clientWidth
      if (w) setBox((current) => (Math.abs(current.w - w) < 0.5 ? current : { w, h: (w * height) / width }))
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [height, width])
  useLayoutEffect(() => {
    size.current = box
    paint()
  }, [box, paint])

  useEffect(() => {
    if (reduceMotion) {
      drawn.jump(1)
      const frame = requestAnimationFrame(() => setLanded(true))
      return () => cancelAnimationFrame(frame)
    }
    if (!inView) return
    const controls = animate(drawn, 1, { ...draw, onComplete: () => setLanded(true) })
    return () => controls.stop()
  }, [drawn, inView, reduceMotion])

  useEffect(() => {
    const from = shape.current
    if (from === target) return
    if (reduceMotion) {
      shape.current = target
      paint()
      return
    }
    const xs = [...new Set([...grid, ...target.map(([x]) => x)])].sort((a, b) => a - b)
    const start = xs.map((x) => heightAt(from, x))
    const goal = xs.map((x) => heightAt(target, x))
    const controls = animate(0, 1, {
      ...motionPresets.spring.smooth,
      onUpdate: (progress) => {
        shape.current = xs.map((x, at): Point => [x, start[at] + (goal[at] - start[at]) * progress])
        paint()
      },
      onComplete: () => {
        shape.current = target
        paint()
      },
    })
    return () => controls.stop()
  }, [paint, reduceMotion, target])

  useEffect(() => {
    const to = index === null ? 1 : index / last
    if (reduceMotion) {
      cursor.jump(to)
      return
    }
    const controls = animate(cursor, to, motionPresets.spring.snappy)
    return () => controls.stop()
  }, [cursor, index, last, reduceMotion])

  const scrubbing = index !== null
  const format = (at: number) => (formatValue ? formatValue(safeData[at], at) : grouped.format(safeData[at]))
  const point = format(index ?? last)
  const when = labels?.[index ?? last]
  const headline = value === undefined ? undefined : scrubbing ? point : value
  const aside = index === null ? change ?? "" : value === undefined ? [point, when].filter(Boolean).join(" · ") : when ?? `${index + 1} of ${last + 1}`
  const pointAt = (clientX: number) => {
    const rect = plot.current?.getBoundingClientRect()
    return rect?.width ? Math.max(0, Math.min(last, Math.round(((clientX - rect.left) / rect.width) * last))) : last
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape" && scrubbing) {
      event.preventDefault()
      setActive(null)
      return
    }
    const from = index ?? last
    const page = Math.max(1, Math.round((last + 1) / 6))
    const next = ({ ArrowLeft: from - 1, ArrowDown: from - 1, ArrowRight: from + 1, ArrowUp: from + 1, PageDown: from - page, PageUp: from + page, Home: 0, End: last } as Record<string, number>)[event.key]
    if (next === undefined) return
    event.preventDefault()
    setActive(Math.max(0, Math.min(last, next)))
  }
  const scrub = interactive
    ? {
        role: "slider" as const,
        tabIndex: 0,
        "aria-label": `${label}, explore values`,
        "aria-valuemin": 1,
        "aria-valuemax": last + 1,
        "aria-valuenow": (index ?? last) + 1,
        "aria-valuetext": `${when ?? (index === null ? "Latest" : `Point ${index + 1} of ${last + 1}`)}: ${point}`,
        onPointerDown: (event: PointerEvent<HTMLDivElement>) => setActive(pointAt(event.clientX)),
        onPointerMove: (event: PointerEvent<HTMLDivElement>) => {
          if (event.pointerType === "mouse" || event.buttons) setActive(pointAt(event.clientX))
        },
        onPointerUp: (event: PointerEvent<HTMLDivElement>) => {
          if (event.pointerType !== "mouse") setActive(null)
        },
        onPointerLeave: () => setActive(null),
        onPointerCancel: () => setActive(null),
        onBlur: () => setActive(null),
        onKeyDown,
      }
    : {}

  return (
    <figure ref={ref} data-slot="sparkline" aria-label={description} className={cn("grid min-w-0 gap-3 text-foreground", className, classNames?.root)}>
      <figcaption data-slot="sparkline-caption" className={cn("flex min-w-0 items-baseline gap-2 text-sm text-muted-foreground", classNames?.caption)}>
        <span data-slot="sparkline-label" className={cn("min-w-0 overflow-hidden whitespace-nowrap", classNames?.label)}>
          <Roll text={label} whole />
        </span>
        {headline !== undefined ? (
          <strong data-slot="sparkline-value" className={cn("ml-auto text-lg font-medium text-foreground tabular-nums", classNames?.value)}>
            <Roll text={headline} morph />
          </strong>
        ) : null}
        <small data-slot="sparkline-change" className={cn("shrink-0 text-xs font-medium tabular-nums transition-colors", stroke, scrubbing && "text-muted-foreground", classNames?.change)}>
          <Roll text={aside} direction={scrubbing ? moved.direction : undefined} morph />
        </small>
      </figcaption>
      <div
        ref={plot}
        data-slot="sparkline-plot"
        data-interactive={interactive || undefined}
        className={cn("relative min-w-0 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-offset-8", interactive && "cursor-default touch-pan-y select-none", classNames?.plot)}
        {...scrub}
      >
        <svg data-slot="sparkline-chart" className="block h-auto w-full overflow-visible" viewBox={`0 0 ${box.w} ${box.h}`} aria-hidden="true" focusable="false">
          <defs>
            <clipPath id={`${uid}-lit`} clipPathUnits="userSpaceOnUse"><motion.rect x={-16} y={-16} width={lit} height={box.h + 32} /></clipPath>
            <clipPath id={`${uid}-dim`} clipPathUnits="userSpaceOnUse"><motion.rect x={dim} y={-16} width={box.w + 32} height={box.h + 32} /></clipPath>
            <clipPath id={`${uid}-fill`} clipPathUnits="userSpaceOnUse"><motion.rect x={-16} y={-16} width={reveal} height={box.h + 32} /></clipPath>
          </defs>
          {area ? <motion.path className={cn("fill-current stroke-none opacity-10", stroke)} d={fill} clipPath={`url(#${uid}-fill)`} /> : null}
          <line className="stroke-border" strokeWidth={1} x1="0" y1={box.h - 0.5} x2={box.w} y2={box.h - 0.5} />
          <motion.path className="fill-none stroke-border stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]" d={trail} clipPath={`url(#${uid}-dim)`} initial={false} animate={{ opacity: scrubbing && landed ? 1 : 0 }} transition={reduceMotion ? { duration: 0 } : quick} />
          <motion.polyline className={cn("fill-none stroke-current stroke-[2.5] [stroke-linecap:round] [stroke-linejoin:round]", stroke)} points={line} clipPath={`url(#${uid}-lit)`} style={{ pathLength: drawn, opacity: lineOpacity }} />
          <motion.line className="stroke-border" strokeWidth={1} x1={cursorX} x2={cursorX} y1={0} y2={box.h} initial={false} animate={{ opacity: scrubbing ? 1 : 0 }} transition={reduceMotion ? { duration: 0 } : quick} />
          <motion.polyline className={cn("fill-none stroke-current", stroke)} points={dot} initial={false} animate={{ opacity: landed ? 1 : 0, strokeWidth: landed ? (scrubbing ? 10 : 7) : 0 }} transition={reduceMotion ? { duration: 0 } : { opacity: quick, strokeWidth: motionPresets.spring.snappy }} strokeLinecap="round" />
        </svg>
      </div>
    </figure>
  )
}
