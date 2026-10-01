"use client"

/** Adapted from Arc UI (MIT). */

import { useCallback, useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type Ref } from "react"
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react"

import { cn } from "@/lib/utils"
import { chartVar, type ChartTone } from "@/registry/retana/lib/chart-tone"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface StreamgraphSeries {
  /** Stable identity. A layer keeps its place and color across data changes. */
  key: string
  /** Name in the legend, the direct label, the tooltip, and the data table. */
  label: string
  /** CSS color. Defaults to the host chart tokens in layer order. */
  color?: string
}

export interface StreamgraphDatum {
  /** Stable identity, such as an ISO week. */
  key: string
  /** Full label for the tooltip and screen readers. */
  label: string
  /** Short label on the time axis. Leave it out to keep the axis quiet at that point. */
  axisLabel?: string
  /** One value per series key. Missing values and negatives count as zero. */
  values: Record<string, number | undefined>
}

/** How the mix of several parts changes over time, when the overall shape matters more than exact values. */
export interface StreamgraphProps {
  data: StreamgraphDatum[]
  /** Layers from the centre out: the first runs through the middle, the rest alternate above and below it. */
  series: StreamgraphSeries[]
  /** What is measured. Names the chart for assistive technology. */
  label: string
  /** Unit after each value. */
  unit?: string
  /** Plot height in pixels. The width follows the container. */
  height?: number
  /** "wiggle" minimises layer slopes, "silhouette" centres the stack, "zero" stacks from a flat baseline. */
  offset?: "wiggle" | "silhouette" | "zero"
  formatValue?: (value: number, series: StreamgraphSeries) => string
  /** Controlled hidden layer keys. A hidden layer thins to nothing and the rest reflow. */
  hiddenSeries?: string[]
  defaultHiddenSeries?: string[]
  onHiddenSeriesChange?: (hidden: string[]) => void
  /** Called as the reading moves, and with nulls when it leaves. */
  onActiveChange?: (index: number | null, seriesKey: string | null) => void
  /** Layer toggles above the plot. */
  legend?: boolean
  /** Names each layer inside its widest stretch when it is thick enough to hold the text. */
  directLabels?: boolean
  /** Header of the first column in the screen reader table. */
  categoryLabel?: string
  emptyLabel?: string
  ref?: Ref<HTMLElement>
  className?: string
  classNames?: StreamgraphClassNames
}

export type StreamgraphClassNames = {
  root?: string
  legend?: string
  plot?: string
  tooltip?: string
  axis?: string
  message?: string
}

type Hover = { index: number; key: string | null; y: number | null }
type Frame = { lower: number[][]; upper: number[][]; toY: (value: number) => number; center: number[] }

const physical = ({ visualDuration, bounce }: { visualDuration: number; bounce: number }, restDelta = 0.0005) => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring" as const, stiffness: root * root, damping: 2 * (1 - bounce) * root, restDelta, restSpeed: restDelta * 2 }
}

const settle = physical(motionPresets.spring.smooth)
const swell = physical({ visualDuration: motionPresets.duration.considered * 1.8, bounce: 0 })
const glide = physical(motionPresets.spring.snappy, 0.01)
const follow = { stiffness: glide.stiffness, damping: glide.damping, restDelta: 0.01 }

const N = 161
const PAD = 10
const GAP = 14
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))

function seriesColor(color: string | undefined, index: number) {
  if (color) return color
  return chartVar((((index % 5) + 1) as ChartTone))
}

function stackOrder(count: number, mode: StreamgraphProps["offset"]) {
  const order = Array.from({ length: count }, (_, index) => index)
  if (mode === "zero") return order
  return order.reduce<number[]>((list, index) => (index === 0 ? [0] : index % 2 ? [...list, index] : [index, ...list]), [])
}

function resample(raw: number[]): number[] {
  const values = raw.map((value) => Math.max(0, value || 0))
  const out = new Array<number>(N)
  if (!values.length) return out.fill(0)
  if (values.length === 1) return out.fill(values[0])
  const last = values.length - 1
  const slopes = values.slice(1).map((value, index) => value - values[index])
  const tangents = values.map((_, index) => (index === 0 || index === last ? 0 : (Math.sign(slopes[index - 1]) + Math.sign(slopes[index])) * Math.min(Math.abs(slopes[index - 1]), Math.abs(slopes[index]), Math.abs(slopes[index - 1] + slopes[index]) / 4) || 0))
  if (last > 1) {
    tangents[0] = (3 * slopes[0] - tangents[1]) / 2
    tangents[last] = (3 * slopes[last - 1] - tangents[last - 1]) / 2
  } else tangents[0] = tangents[1] = slopes[0]
  for (let k = 0; k < N; k++) {
    const at = (k / (N - 1)) * last
    const seg = Math.min(last - 1, Math.floor(at))
    const t = at - seg
    const t2 = t * t
    const t3 = t2 * t
    const a = values[seg]
    const b = values[seg + 1]
    const value = (2 * t3 - 3 * t2 + 1) * a + (t3 - 2 * t2 + t) * tangents[seg] + (3 * t2 - 2 * t3) * b + (t3 - t2) * tangents[seg + 1]
    out[k] = clamp(value, Math.min(a, b), Math.max(a, b))
  }
  return out
}

function baseline(layers: number[][], mode: StreamgraphProps["offset"]): number[] {
  const g = new Array<number>(N).fill(0)
  const totals = g.map((_, j) => layers.reduce((sum, layer) => sum + layer[j], 0))
  if (mode === "zero" || !layers.length) return g
  if (mode === "silhouette") return totals.map((total) => -total / 2)
  for (let j = 1; j < N; j++) {
    let s1 = 0
    let s2 = 0
    let below = 0
    for (const layer of layers) {
      const change = layer[j] - layer[j - 1]
      s1 += layer[j]
      s2 += (below + change / 2) * layer[j]
      below += change
    }
    g[j] = g[j - 1] - (s1 ? s2 / s1 : 0)
  }
  const centers = g.map((value, j) => value + totals[j] / 2)
  const mx = (N - 1) / 2
  const my = centers.reduce((sum, value) => sum + value, 0) / N
  let num = 0
  let den = 0
  centers.forEach((value, j) => {
    num += (j - mx) * (value - my)
    den += (j - mx) ** 2
  })
  const slope = den ? num / den : 0
  return g.map((value, j) => value - (my + slope * (j - mx)))
}

const subscribeNothing = () => () => {}

function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

function axisPicks(data: StreamgraphDatum[], width: number) {
  const labeled = data.flatMap((item, index) => (item.axisLabel ? [index] : []))
  if (!width || !labeled.length) return []
  const stride = Math.ceil(labeled.length / Math.max(2, Math.floor(width / 72)))
  return labeled.reverse().filter((_, rank) => rank % stride === 0).reverse()
}

function textLength(node: SVGTextElement) {
  try {
    return node.getComputedTextLength?.() || 60
  } catch {
    return 60
  }
}

export function Streamgraph({ data, series, label, unit = "", height = 260, offset = "wiggle", formatValue, hiddenSeries, defaultHiddenSeries, onHiddenSeriesChange, onActiveChange, legend = true, directLabels = true, categoryLabel = "Date", emptyLabel = "No data for this range", ref, className, classNames }: StreamgraphProps) {
  const reduced = useReducedMotionSafe()
  const figure = useRef<HTMLElement>(null)
  const plot = useRef<HTMLDivElement>(null)
  const tip = useRef<HTMLDivElement>(null)
  const paths = useRef(new Map<string, SVGPathElement>())
  const labels = useRef(new Map<string, SVGTextElement>())
  useImperativeHandle(ref, () => figure.current as HTMLElement)
  const inView = useInView(figure, { once: true, amount: 0.3 })
  const last = data.length - 1
  const empty = data.length === 0

  const [ownHidden, setOwnHidden] = useState<string[]>(defaultHiddenSeries ?? [])
  const hidden = hiddenSeries ?? ownHidden
  const toggle = (key: string) => {
    const next = hidden.includes(key) ? hidden.filter((item) => item !== key) : [...hidden, key]
    if (hiddenSeries === undefined) setOwnHidden(next)
    onHiddenSeriesChange?.(next)
  }
  const visible = series.filter((item) => !hidden.includes(item.key))

  const signature = `${series.map((item) => item.key).join(",")}|${data.map((item) => series.map((line) => item.values[line.key] ?? 0).join(",")).join(";")}`
  const targets = useMemo(() => new Map(series.map((line) => [line.key, resample(data.map((item) => item.values[line.key] ?? 0))])), [signature]) // eslint-disable-line react-hooks/exhaustive-deps

  const [hover, setHover] = useState<Hover | null>(null)
  const [seenSignature, setSeenSignature] = useState(signature)
  if (seenSignature !== signature) {
    setSeenSignature(signature)
    setHover(null)
  }
  const index = hover && !empty ? Math.min(hover.index, last) : null
  const [legendKey, setLegendKey] = useState<string | null>(null)
  const wanted = hover?.key ?? legendKey
  const activeKey = wanted && visible.some((item) => item.key === wanted) ? wanted : null

  const width = useRef(0)
  const [plotWidth, setPlotWidth] = useState(0)
  const shapes = useRef(new Map<string, number[]>())
  const presence = useRef(new Map<string, { value: number; stop: (() => void) | null }>())
  const frame = useRef<Frame | null>(null)
  const spots = useRef(new Map<string, number>())
  const grow = useMotionValue(0)
  const live = useRef({ series, offset })
  useLayoutEffect(() => {
    live.current = { series, offset }
  })

  const paint = useCallback(() => {
    const w = width.current
    if (!w) return
    const order = live.current.series
    const mode = live.current.offset
    const layers = order.map((line) => {
      const shape = shapes.current.get(line.key)
      const p = presence.current.get(line.key)?.value ?? 1
      return shape ? shape.map((value) => value * p) : new Array<number>(N).fill(0)
    })
    const stack = stackOrder(order.length, mode)
    const g = baseline(stack.map((i) => layers[i]), mode)
    const lower: number[][] = new Array(order.length)
    const upper: number[][] = new Array(order.length)
    let running = g.slice()
    for (const i of stack) {
      lower[i] = running
      running = running.map((value, j) => value + layers[i][j])
      upper[i] = running
    }
    let lo = Infinity
    let hi = -Infinity
    for (let j = 0; j < N; j++) {
      lo = Math.min(lo, g[j])
      hi = Math.max(hi, running[j])
    }
    if (!Number.isFinite(lo) || hi - lo < 1e-9) {
      lo = -1
      hi = 1
    }
    const span = hi - lo
    const s = grow.get()
    const center = g.map((value, j) => (value + running[j]) / 2)
    const toY = (value: number) => PAD + (1 - (value - lo) / span) * (height - PAD * 2)
    const yAt = (value: number, j: number) => toY(center[j] + (value - center[j]) * s)
    frame.current = { lower, upper, toY, center }
    const xs = Array.from({ length: N }, (_, j) => (j / (N - 1)) * w)
    order.forEach((line, i) => {
      const node = paths.current.get(line.key)
      if (node) {
        let d = ""
        for (let j = 0; j < N; j++) d += `${j ? "L" : "M"}${xs[j].toFixed(1)},${yAt(upper[i][j], j).toFixed(1)}`
        for (let j = N - 1; j >= 0; j--) d += `L${xs[j].toFixed(1)},${yAt(lower[i][j], j).toFixed(1)}`
        node.setAttribute("d", `${d}Z`)
      }
      const text = labels.current.get(line.key)
      if (!text) return
      let best = 4
      for (let j = 4; j < N - 4; j++) if (upper[i][j] - lower[i][j] > upper[i][best] - lower[i][best]) best = j
      const held = spots.current.get(line.key)
      const j = held !== undefined && upper[i][held] - lower[i][held] >= (upper[i][best] - lower[i][best]) * 0.8 ? held : best
      spots.current.set(line.key, j)
      const thickness = ((upper[i][j] - lower[i][j]) / span) * (height - PAD * 2) * s
      const room = textLength(text)
      const x = clamp(xs[j], room / 2 + 6, w - room / 2 - 6)
      text.setAttribute("x", x.toFixed(1))
      text.setAttribute("y", yAt((upper[i][j] + lower[i][j]) / 2, j).toFixed(1))
      text.style.opacity = thickness >= 19 && room + 16 < w ? "1" : "0"
    })
  }, [grow, height])

  useLayoutEffect(() => {
    const node = plot.current
    if (!node) return
    const read = () => {
      width.current = node.clientWidth
      setPlotWidth(node.clientWidth)
      paint()
    }
    read()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [paint])

  const morph = useRef<{ stop: () => void } | null>(null)
  useEffect(() => {
    const moves: { key: string; from: number[]; to: number[] }[] = []
    for (const [key, to] of targets) {
      const from = shapes.current.get(key)
      if (!from || reduced) {
        shapes.current.set(key, to)
        continue
      }
      moves.push({ key, from, to })
    }
    for (const key of [...shapes.current.keys()]) if (!targets.has(key)) shapes.current.delete(key)
    morph.current?.stop()
    if (!moves.length) {
      paint()
      return
    }
    morph.current = animate(0, 1, {
      ...settle,
      onUpdate: (t) => {
        for (const move of moves) shapes.current.set(move.key, move.from.map((value, j) => value + (move.to[j] - value) * t))
        paint()
      },
      onComplete: () => {
        for (const move of moves) shapes.current.set(move.key, move.to)
        paint()
      },
    })
    return () => morph.current?.stop()
  }, [paint, reduced, targets])

  const hiddenKey = hidden.join("|")
  useEffect(() => {
    for (const line of series) {
      const to = hidden.includes(line.key) ? 0 : 1
      const track = presence.current.get(line.key)
      if (!track) {
        presence.current.set(line.key, { value: to, stop: null })
        continue
      }
      if (track.value === to) continue
      track.stop?.()
      if (reduced) {
        track.value = to
        track.stop = null
        continue
      }
      const controls = animate(track.value, to, {
        ...settle,
        onUpdate: (value) => {
          track.value = value
          paint()
        },
      })
      track.stop = () => controls.stop()
    }
    paint()
  }, [hiddenKey, paint, reduced, series.length]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (empty) return
    if (reduced) {
      grow.jump(1)
      paint()
      return
    }
    if (!inView || grow.get() >= 1) return
    const controls = animate(grow, 1, { ...swell, onUpdate: paint })
    return () => controls.stop()
  }, [empty, grow, inView, paint, reduced])

  const cursor = useMotionValue(0)
  const cursorSpring = useSpring(cursor, follow)
  const tipX = useMotionValue(0)
  const tipY = useMotionValue(0)
  const tipSpringX = useSpring(tipX, follow)
  const tipSpringY = useSpring(tipY, follow)
  const wasActive = useRef(false)
  useLayoutEffect(() => {
    const bubble = tip.current
    const w = width.current
    if (index === null || !bubble || !w) {
      wasActive.current = false
      return
    }
    const x = last > 0 ? (index / last) * w : w / 2
    let y = hover?.y ?? null
    const f = frame.current
    if (y === null && f && activeKey) {
      const i = series.findIndex((line) => line.key === activeKey)
      const j = Math.round((x / w) * (N - 1))
      if (i >= 0) y = f.toY((f.upper[i][j] + f.lower[i][j]) / 2)
    }
    const tw = bubble.offsetWidth
    const th = bubble.offsetHeight
    let left = x + GAP
    if (left + tw > w) left = x - GAP - tw
    const top = clamp((y ?? height / 2) - th / 2, 0, Math.max(0, height - th))
    const instant = !wasActive.current || reduced
    cursor.set(x)
    tipX.set(clamp(left, 0, Math.max(0, w - tw)))
    tipY.set(top)
    if (instant) {
      cursorSpring.jump(x)
      tipSpringX.jump(tipX.get())
      tipSpringY.jump(top)
    }
    wasActive.current = true
  })

  const onActive = useRef(onActiveChange)
  useLayoutEffect(() => {
    onActive.current = onActiveChange
  })
  useEffect(() => {
    onActive.current?.(index, activeKey)
  }, [index, activeKey])

  const read = (clientX: number, clientY: number): Hover | null => {
    const rect = plot.current?.getBoundingClientRect()
    const f = frame.current
    if (!rect?.width || empty) return null
    const share = clamp((clientX - rect.left) / rect.width, 0, 1)
    const y = clientY - rect.top
    const at = last > 0 ? Math.round(share * last) : 0
    const j = Math.round(share * (N - 1))
    let key: string | null = null
    if (f) {
      series.forEach((line, i) => {
        if (hidden.includes(line.key)) return
        const top = f.toY(f.upper[i][j])
        const bottom = f.toY(f.lower[i][j])
        if (y >= top - 1 && y <= bottom + 1) key = line.key
      })
    }
    return { index: at, key, y }
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || event.buttons) setHover(read(event.clientX, event.clientY))
  }
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") event.currentTarget.setPointerCapture?.(event.pointerId)
    setHover(read(event.clientX, event.clientY))
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (empty) return
    if (event.key === "Escape" && hover) {
      event.preventDefault()
      setHover(null)
      return
    }
    const from = index ?? last
    const keys = visible.map((line) => line.key)
    const at = activeKey ? keys.indexOf(activeKey) : -1
    const page = Math.max(1, Math.round(data.length / 6))
    const moves: Record<string, () => Hover> = {
      ArrowLeft: () => ({ index: clamp(from - 1, 0, last), key: activeKey, y: null }),
      ArrowRight: () => ({ index: clamp(index === null ? last : from + 1, 0, last), key: activeKey, y: null }),
      PageDown: () => ({ index: clamp(from - page, 0, last), key: activeKey, y: null }),
      PageUp: () => ({ index: clamp(from + page, 0, last), key: activeKey, y: null }),
      Home: () => ({ index: 0, key: activeKey, y: null }),
      End: () => ({ index: last, key: activeKey, y: null }),
      ArrowUp: () => ({ index: from, key: keys[at < 0 ? keys.length - 1 : Math.min(keys.length - 1, at + 1)] ?? null, y: null }),
      ArrowDown: () => ({ index: from, key: keys[at < 0 ? 0 : Math.max(0, at - 1)] ?? null, y: null }),
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    setHover(move())
  }

  const format = (value: number, line: StreamgraphSeries) => `${formatValue ? formatValue(value, line) : grouped.format(value)}${unit ? ` ${unit}` : ""}`
  const reading = index === null ? null : data[index]
  const total = (datum: StreamgraphDatum) => visible.reduce((sum, line) => sum + Math.max(0, datum.values[line.key] ?? 0), 0)
  const announce = reading ? `${reading.label}. ${activeKey ? `${series.find((line) => line.key === activeKey)?.label} ${format(reading.values[activeKey] ?? 0, series.find((line) => line.key === activeKey)!)}, ` : ""}${visible.length} layers, ${grouped.format(total(reading))}${unit ? ` ${unit}` : ""} in total` : ""
  const summary = empty ? `${label}. ${emptyLabel}.` : `${label}, ${data[0].label} to ${data[last].label}. ${visible.map((line) => `${line.label}, latest ${format(data[last].values[line.key] ?? 0, line)}`).join(". ")}.`
  const picks = axisPicks(data, plotWidth)
  const tipLeft = reduced ? tipX : tipSpringX
  const tipTop = reduced ? tipY : tipSpringY
  const active = index !== null

  return (
    <figure ref={figure} data-slot="streamgraph" aria-label={label} className={cn("grid min-w-0 gap-4 text-foreground", className, classNames?.root)}>
      {legend && series.length > 1 ? (
        <div data-slot="streamgraph-legend" className={cn("flex min-w-0 flex-wrap gap-1", classNames?.legend)} role="group" aria-label={`${label} layers`} onPointerLeave={() => setLegendKey(null)}>
          {series.map((line, at) => {
            const color = seriesColor(line.color, at)
            const pressed = !hidden.includes(line.key)
            return (
              <button
                key={line.key}
                type="button"
                className={cn("inline-flex min-h-8 min-w-0 items-center gap-2 rounded-full px-2.5 text-sm transition-opacity motion-reduce:transition-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", pressed ? "text-foreground" : "text-muted-foreground", activeKey && activeKey !== line.key && "opacity-60", activeKey === line.key && "bg-muted")}
                aria-pressed={pressed}
                onClick={() => toggle(line.key)}
                onPointerEnter={(event) => { if (event.pointerType === "mouse") setLegendKey(line.key) }}
                onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setLegendKey(line.key) }}
                onBlur={() => setLegendKey(null)}
              >
                <span aria-hidden="true" className={cn("size-2.5 shrink-0 rounded-sm bg-current", !pressed && "scale-75 opacity-40")} style={{ color }} />
                <span className={cn("truncate", !pressed && "line-through opacity-70")}>{line.label}</span>
              </button>
            )
          })}
        </div>
      ) : null}
      <div className="grid min-w-0 grid-rows-[auto_26px]" data-active={active || undefined}>
        <div
          ref={plot}
          data-slot="streamgraph-plot"
          className={cn("relative min-w-0 cursor-crosshair outline-none select-none touch-pan-y focus-visible:ring-2 focus-visible:ring-ring", classNames?.plot)}
          style={{ height }}
          role="group"
          tabIndex={empty ? -1 : 0}
          aria-roledescription="stream graph"
          aria-label={`${label}. Use left and right arrows to move through time, up and down to change layer.`}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onPointerUp={(event) => { if (event.pointerType !== "mouse") setHover(null) }}
          onPointerCancel={() => setHover(null)}
          onPointerLeave={(event) => { if (event.pointerType === "mouse") setHover(null) }}
          onKeyDown={onKeyDown}
          onBlur={() => setHover(null)}
          onFocus={(event) => { if (event.currentTarget.matches(":focus-visible") && !empty) setHover((current) => current ?? { index: last, key: null, y: null }) }}
        >
          <svg className="block overflow-visible" width="100%" height={height} aria-hidden="true" focusable="false">
            {series.map((line, at) => (
              <path
                key={line.key}
                data-slot="streamgraph-layer"
                data-series={line.key}
                ref={(node) => {
                  if (node) paths.current.set(line.key, node)
                  else paths.current.delete(line.key)
                }}
                className={cn("stroke-background transition-opacity motion-reduce:transition-none", activeKey && activeKey !== line.key && "opacity-35")}
                fill={seriesColor(line.color, at)}
                strokeWidth={2}
                strokeLinejoin="round"
              />
            ))}
            <motion.line className={cn("pointer-events-none stroke-foreground/50 transition-opacity motion-reduce:transition-none", active ? "opacity-100" : "opacity-0")} strokeWidth={1} shapeRendering="crispEdges" x1={0} x2={0} y1={0} y2={height} style={{ x: reduced ? cursor : cursorSpring }} />
            {directLabels ? series.map((line) => (
              <text
                key={line.key}
                ref={(node) => {
                  if (node) labels.current.set(line.key, node)
                  else labels.current.delete(line.key)
                }}
                className={cn("pointer-events-none fill-foreground stroke-background text-xs font-medium transition-opacity motion-reduce:transition-none", (hidden.includes(line.key) || (activeKey !== null && activeKey !== line.key)) && "opacity-0")}
                strokeWidth={3}
                textAnchor="middle"
                dominantBaseline="central"
              >
                {line.label}
              </text>
            )) : null}
          </svg>
          <motion.div ref={tip} data-slot="streamgraph-tooltip" className={cn("pointer-events-none absolute top-0 left-0 z-10 grid min-w-[9.75rem] max-w-full gap-1 rounded-xl border border-border bg-card p-2.5 shadow-md transition motion-reduce:transition-none", active ? "scale-100 opacity-100" : "scale-95 opacity-0", classNames?.tooltip)} style={{ x: tipLeft, y: tipTop }} aria-hidden="true">
            <p className="m-0 mb-0.5 truncate text-xs text-muted-foreground tabular-nums">{reading?.label ?? ""}</p>
            {stackOrder(series.length, offset).reverse().map((at) => series[at]).filter((line) => !hidden.includes(line.key)).map((line) => (
              <p key={line.key} className={cn("m-0 flex min-w-0 items-center gap-2 text-sm transition-opacity motion-reduce:transition-none", activeKey && activeKey !== line.key && "opacity-50")}>
                <span className="h-0.5 w-2.5 shrink-0 rounded-full bg-current" style={{ color: seriesColor(line.color, series.indexOf(line)) }} />
                <span className={cn("min-w-0 flex-1 truncate", activeKey === line.key ? "text-foreground" : "text-muted-foreground")}>{line.label}</span>
                <span className="shrink-0 font-medium text-foreground tabular-nums">{reading ? format(reading.values[line.key] ?? 0, line) : ""}</span>
              </p>
            ))}
          </motion.div>
          {(empty || visible.length === 0) ? <p data-slot="streamgraph-message" className={cn("pointer-events-none absolute inset-0 m-0 grid place-items-center text-sm text-muted-foreground", classNames?.message)}>{empty ? emptyLabel : "Choose a layer to show"}</p> : null}
        </div>
        <div data-slot="streamgraph-axis" className={cn("relative min-w-0", classNames?.axis)} aria-hidden="true">
          {picks.map((at) => {
            const share = last > 0 ? at / last : 0.5
            return <span key={data[at].key} className="absolute top-2 text-xs whitespace-nowrap text-muted-foreground tabular-nums" style={{ left: `${share * 100}%`, translate: `${-share * 100}% 0` }}>{data[at].axisLabel}</span>
          })}
        </div>
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true" role="status">{announce}</p>
      <p className="sr-only">{summary}</p>
      {!empty ? (
        <div className="sr-only">
          <table>
            <caption>{label}</caption>
            <thead><tr><th scope="col">{categoryLabel}</th>{series.map((line) => <th key={line.key} scope="col">{line.label}</th>)}</tr></thead>
            <tbody>{data.map((item) => <tr key={item.key}><th scope="row">{item.label}</th>{series.map((line) => <td key={line.key}>{format(item.values[line.key] ?? 0, line)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      ) : null}
    </figure>
  )
}
