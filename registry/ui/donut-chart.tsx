"use client"

/** Adapted from Arc UI (MIT). */

import { useCallback, useEffect, useId, useImperativeHandle, useLayoutEffect, useRef, useState, useSyncExternalStore, type FocusEvent, type KeyboardEvent, type MouseEvent, type PointerEvent, type Ref } from "react"
import { animate, cancelFrame, frame, motion, motionValue, useInView, useReducedMotion, type MotionValue, type Transition } from "motion/react"

import { cn } from "@/lib/utils"
import { chartVar, type ChartTone } from "@/registry/retana/lib/chart-tone"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface DonutChartDatum {
  /** Stable identity. A segment whose key survives a data change keeps its place. */
  key: string
  label: string
  value: number
  /** CSS color. Segments default to the host chart tokens in data order. */
  color?: string
}

/** A few parts of one whole, when the share of each part matters more than precise comparison. */
export interface DonutChartProps {
  data: DonutChartDatum[]
  /** What the whole is. Names the chart for assistive technology. */
  label: string
  /** Unit after values. */
  unit?: string
  formatValue?: (value: number) => string
  /** Center label at rest, above the total. */
  totalLabel?: string
  /** Diameter in pixels. The chart scales down to fit narrower containers. */
  size?: number
  /** Ring thickness in pixels. */
  thickness?: number
  /** Segments below this share of the total join "Other". */
  groupBelow?: number
  /** The most segments drawn, counting "Other". */
  maxSegments?: number
  otherLabel?: string
  /** Controlled selected segment key. Hover and focus preview other segments without changing it. */
  activeKey?: string | null
  defaultActiveKey?: string | null
  onActiveChange?: (key: string | null) => void
  /** Controlled hidden segment keys. A hidden segment closes and the rest of the ring redistributes. */
  hiddenKeys?: string[]
  defaultHiddenKeys?: string[]
  onHiddenKeysChange?: (keys: string[]) => void
  /** What clicking a legend row does. */
  legendAction?: "toggle" | "select"
  /** The synced legend beside or below the ring. */
  legend?: boolean
  emptyLabel?: string
  ref?: Ref<HTMLElement>
  className?: string
  classNames?: DonutChartClassNames
}

export type DonutChartClassNames = {
  root?: string
  ring?: string
  center?: string
  legend?: string
  row?: string
}

type Slice = { key: string; label: string; value: number; color?: string; members?: DonutChartDatum[] }
type Arc = { start: number; end: number }
type Segment = { start: MotionValue<number>; end: MotionValue<number>; lift: MotionValue<number>; off: () => void }

const OTHER = "__other"
const TAU = Math.PI * 2

const physical = ({ visualDuration, bounce }: { visualDuration: number; bounce: number }, restDelta = 0.0005) => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring" as const, stiffness: root * root, damping: 2 * (1 - bounce) * root, restDelta, restSpeed: restDelta * 2 }
}

const reveal = physical({ visualDuration: motionPresets.duration.considered * 1.5, bounce: 0 })
const settle = physical({ visualDuration: motionPresets.duration.considered, bounce: 0 })
const pop = physical(motionPresets.spring.snappy, 0.002)
const LIFT = 4
const GROW = 2
const MARGIN = 7
const GAP = 3
const CORNER = 4
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 0 })
const shareText = (share: number) => (share > 0 && share < 0.01 ? "<1%" : percent.format(share))

function sliceColor(item: Slice, index: number) {
  if (item.color) return item.color
  return chartVar((((index % 5) + 1) as ChartTone))
}

function sliceData(data: DonutChartDatum[], groupBelow: number, maxSegments: number, otherLabel: string): Slice[] {
  const parts = data.filter((item) => item.value > 0)
  const total = parts.reduce((sum, item) => sum + item.value, 0)
  if (!total) return []
  const ranked = [...parts].sort((a, b) => b.value - a.value)
  const keep = new Set(ranked.filter((item, rank) => item.value / total >= groupBelow && rank < maxSegments - 1).map((item) => item.key))
  const rest = parts.filter((item) => !keep.has(item.key))
  if (rest.length < 2) return parts.map((item) => ({ ...item }))
  return [...parts.filter((item) => keep.has(item.key)).map((item) => ({ ...item })), { key: OTHER, label: otherLabel, value: rest.reduce((sum, item) => sum + item.value, 0), members: rest }]
}

function layout(slices: Slice[], hidden: Set<string>) {
  const total = slices.reduce((sum, item) => sum + (hidden.has(item.key) ? 0 : item.value), 0) || 1
  let at = 0
  return new Map(slices.map((item) => {
    const arc = { start: at, end: at + (hidden.has(item.key) ? 0 : item.value / total) }
    at = arc.end
    return [item.key, arc] as const
  }))
}

function breadth(R: number, t0: number, t1: number, gap: number) {
  const turns = t1 - t0
  if (turns >= 1 - 1e-6) return Infinity
  return Math.sin(Math.min(turns * Math.PI, Math.PI / 2)) * R - Math.min(gap / 2, ((1 - turns) * TAU * R) / 2)
}

const n2 = (value: number) => (Math.round(value * 100) / 100).toString()

function sector(c: number, R: number, r: number, t0: number, t1: number, gap: number, corner: number) {
  const turns = t1 - t0
  if (turns <= 1e-6) return ""
  const at = (radius: number, angle: number) => `${n2(c + radius * Math.cos(angle))} ${n2(c + radius * Math.sin(angle))}`
  if (turns >= 1 - 1e-6) return `M${at(R, -Math.PI / 2)}A${n2(R)} ${n2(R)} 0 1 1 ${at(R, Math.PI / 2)}A${n2(R)} ${n2(R)} 0 1 1 ${at(R, -Math.PI / 2)}ZM${at(r, -Math.PI / 2)}A${n2(r)} ${n2(r)} 0 1 0 ${at(r, Math.PI / 2)}A${n2(r)} ${n2(r)} 0 1 0 ${at(r, -Math.PI / 2)}Z`
  const p = Math.min(gap / 2, ((1 - turns) * TAU * R) / 2)
  const a0 = t0 * TAU - Math.PI / 2
  const a1 = t1 * TAU - Math.PI / 2
  const half = (a1 - a0) / 2
  const s = Math.sin(Math.min(half, Math.PI / 2))
  if (s * R <= p + 1e-6) return ""
  const side = (t: number, angle: number, sign: number) => `${n2(c + t * Math.cos(angle) - sign * p * Math.sin(angle))} ${n2(c + t * Math.sin(angle) + sign * p * Math.cos(angle))}`
  const band = (R - r) / 2
  const ro = Math.max(0, Math.min(corner, band, s >= 0.9999 ? Infinity : (s * R - p) / (1 + s)))
  const dO = Math.asin(Math.min(1, (p + ro) / (R - ro)))
  const tO = Math.sqrt(Math.max(0, (R - ro) ** 2 - (p + ro) ** 2))
  const bigO = a1 - a0 - 2 * dO > Math.PI ? 1 : 0
  let d = `M${side(tO, a0, 1)}`
  if (ro > 0.01) d += `A${n2(ro)} ${n2(ro)} 0 0 1 ${at(R, a0 + dO)}`
  d += `A${n2(R)} ${n2(R)} 0 ${bigO} 1 ${at(R, a1 - dO)}`
  if (ro > 0.01) d += `A${n2(ro)} ${n2(ro)} 0 0 1 ${side(tO, a1, -1)}`
  if (s * r > p + 1e-6 || s >= 0.9999) {
    const ri = Math.max(0, Math.min(corner, band, s >= 0.9999 ? Infinity : (s * r - p) / (1 - s)))
    const dI = Math.asin(Math.min(1, (p + ri) / (r + ri)))
    const tI = Math.sqrt(Math.max(0, (r + ri) ** 2 - (p + ri) ** 2))
    const bigI = a1 - a0 - 2 * dI > Math.PI ? 1 : 0
    d += `L${side(tI, a1, -1)}`
    if (ri > 0.01) d += `A${n2(ri)} ${n2(ri)} 0 0 1 ${at(r, a1 - dI)}`
    d += `A${n2(r)} ${n2(r)} 0 ${bigI} 0 ${at(r, a0 + dI)}`
    if (ri > 0.01) d += `A${n2(ri)} ${n2(ri)} 0 0 1 ${side(tI, a0, 1)}`
  } else d += `L${at(p / s, (a0 + a1) / 2)}`
  return `${d}Z`
}

function Count({ value, format, reduced }: { value: number; format: (value: number) => string; reduced: boolean }) {
  const node = useRef<HTMLSpanElement>(null)
  const [initial] = useState(() => format(value))
  const live = useRef<{ mv: MotionValue<number>; format: (value: number) => string; target: number } | null>(null)
  useLayoutEffect(() => {
    const el = node.current
    if (!el) return
    if (!live.current) {
      const state = { mv: motionValue(value), format, target: value }
      state.mv.on("change", (now) => {
        el.textContent = state.format(Number.isInteger(state.target) ? Math.round(now) : now)
      })
      live.current = state
    }
    const state = live.current
    state.format = format
    if (state.target === value && !reduced) {
      if (!state.mv.isAnimating()) el.textContent = format(value)
      return
    }
    state.target = value
    if (reduced) {
      state.mv.jump(value)
      el.textContent = format(value)
      return
    }
    animate(state.mv, value, physical({ visualDuration: motionPresets.duration.standard * 1.6, bounce: 0 }, Math.max(Math.abs(value - state.mv.get()) * 0.001, 1e-6)))
  }, [value, format, reduced])
  useEffect(() => () => {
    live.current?.mv.destroy()
    live.current = null
  }, [])
  return <span ref={node}>{initial}</span>
}

const drum = (place: number, reduced: boolean): { animate: { opacity: number; y: string }; transition: Transition } => ({
  animate: { opacity: place === 0 ? 1 : 0, y: `${0.45 * Math.sign(place)}em` },
  transition: reduced ? { duration: 0 } : place === 0 ? { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] } : { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
})

const subscribeNothing = () => () => {}

function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

export function DonutChart({ data, label, unit = "", formatValue = (value) => grouped.format(value), totalLabel = "Total", size = 208, thickness = 24, groupBelow = 0.04, maxSegments = 6, otherLabel = "Other", activeKey, defaultActiveKey = null, onActiveChange, hiddenKeys, defaultHiddenKeys, onHiddenKeysChange, legendAction = "toggle", legend = true, emptyLabel = "No data yet", ref, className, classNames }: DonutChartProps) {
  const reduced = useReducedMotionSafe()
  const figure = useRef<HTMLElement>(null)
  useImperativeHandle(ref, () => figure.current as HTMLElement)
  const inView = useInView(figure, { once: true, amount: 0.35 })
  const legendId = useId()
  const slices = sliceData(data, groupBelow, maxSegments, otherLabel)

  const [ownHidden, setOwnHidden] = useState<string[]>(defaultHiddenKeys ?? [])
  const hiddenList = hiddenKeys ?? ownHidden
  const hidden = new Set(hiddenList.filter((key) => slices.some((item) => item.key === key)))
  const visible = slices.filter((item) => !hidden.has(item.key))
  const total = visible.reduce((sum, item) => sum + item.value, 0)
  const signature = slices.map((item) => `${item.key}:${item.value}${hidden.has(item.key) ? "h" : ""}`).join("|")
  const suffix = unit ? ` ${unit}` : ""

  const [palette, setPalette] = useState(() => new Map(data.map((item, index) => [item.key, index])))
  if (data.some((item) => !palette.has(item.key))) {
    const next = new Map(palette)
    for (const item of data) if (!next.has(item.key)) next.set(item.key, next.size)
    setPalette(next)
  }
  const colorFor = (item: Slice) => sliceColor(item, item.key === OTHER ? 4 : palette.get(item.key) ?? 0)

  const [drawn, setDrawn] = useState<Slice[]>(slices)
  const [seenSignature, setSeenSignature] = useState(signature)
  if (seenSignature !== signature) {
    setSeenSignature(signature)
    const next = [...slices]
    drawn.forEach((item, index) => {
      if (next.some((slice) => slice.key === item.key)) return
      const before = drawn.slice(0, index).reverse().find((prior) => next.some((slice) => slice.key === prior.key))
      next.splice(before ? next.findIndex((slice) => slice.key === before.key) + 1 : 0, 0, { ...item, value: 0 })
    })
    setDrawn(next)
  }

  const [ownActive, setOwnActive] = useState<string | null>(defaultActiveKey)
  const selected = activeKey !== undefined ? activeKey : ownActive
  const [preview, setPreview] = useState<string | null>(null)
  const select = (key: string | null) => {
    if (activeKey === undefined) setOwnActive(key)
    onActiveChange?.(key)
  }
  const current = [preview, selected].find((key) => key && visible.some((item) => item.key === key)) ?? null
  const activeSlice = visible.find((item) => item.key === current) ?? null

  const [announcement, setAnnouncement] = useState("")
  const setHidden = (key: string) => {
    const isHidden = hidden.has(key)
    if (!isHidden && visible.length <= 1) return
    const next = isHidden ? hiddenList.filter((item) => item !== key) : [...hiddenList, key]
    if (hiddenKeys === undefined) setOwnHidden(next)
    onHiddenKeysChange?.(next)
    const item = slices.find((slice) => slice.key === key)
    const nextTotal = slices.reduce((sum, slice) => sum + (next.includes(slice.key) ? 0 : slice.value), 0)
    if (item) setAnnouncement(`${item.label} ${isHidden ? "shown" : "hidden"}. ${totalLabel} ${formatValue(nextTotal)}${suffix}.`)
  }

  const c = size / 2
  const outer = c - MARGIN
  const inner = Math.max(8, outer - thickness)
  const corner = Math.min(CORNER, thickness / 4)
  const geometry = useRef({ c, outer, inner, corner })
  const segments = useRef(new Map<string, Segment>())
  const paths = useRef(new Map<string, SVGPathElement>())
  const registerPath = useCallback((node: SVGPathElement | null) => {
    const key = node?.dataset.key
    if (!node || !key) return
    paths.current.set(key, node)
    return () => {
      if (paths.current.get(key) === node) paths.current.delete(key)
    }
  }, [])

  const paint = useCallback(() => {
    const box = geometry.current
    for (const [key, node] of paths.current) {
      const segment = segments.current.get(key)
      if (!segment) {
        node.setAttribute("d", "")
        continue
      }
      const start = segment.start.get()
      const end = segment.end.get()
      const lift = Math.max(0, segment.lift.get())
      const R = box.outer + lift * GROW
      node.setAttribute("d", sector(box.c, R, box.inner - lift * GROW * 0.5, start, end, GAP, box.corner))
      node.setAttribute("fill-opacity", n2(Math.min(1, Math.max(0, (breadth(R, start, end, GAP) - 1) / 3))))
      const middle = ((start + end) / 2) * TAU - Math.PI / 2
      const distance = lift * LIFT
      node.setAttribute("transform", `translate(${n2(Math.cos(middle) * distance)} ${n2(Math.sin(middle) * distance)})`)
    }
  }, [])
  const schedule = useCallback(() => {
    frame.render(paint)
  }, [paint])
  useLayoutEffect(() => {
    geometry.current = { c, outer, inner, corner }
    paint()
  })
  useEffect(() => () => {
    cancelFrame(paint)
    for (const segment of segments.current.values()) segment.off()
    segments.current.clear()
  }, [paint])

  const targets = useRef(new Map<string, Arc>())
  const latest = useRef({ drawn, slices })
  useLayoutEffect(() => {
    latest.current = { drawn, slices }
  })

  const shown = inView || reduced
  useEffect(() => {
    if (!shown) return
    const order = latest.current.drawn
    const now = latest.current.slices
    const goal = layout(now, hidden)
    targets.current = goal
    const first = segments.current.size === 0
    const place = (index: number) => {
      const before = order.slice(0, index).reverse().find((item) => goal.has(item.key))
      return before ? goal.get(before.key)!.end : 0
    }
    const drop = (key: string) => {
      if (latest.current.slices.some((item) => item.key === key)) return
      segments.current.get(key)?.off()
      segments.current.delete(key)
      setDrawn((list) => list.filter((item) => item.key !== key))
    }
    order.forEach((item, index) => {
      const leaving = !goal.has(item.key)
      const to = goal.get(item.key) ?? { start: place(index), end: place(index) }
      let segment = segments.current.get(item.key)
      if (!segment) {
        const prior = order.slice(0, index).reverse().map((entry) => segments.current.get(entry.key)).find(Boolean)
        const from = first ? 0 : prior ? prior.end.get() : 0
        const start = motionValue(from)
        const end = motionValue(from)
        const lift = motionValue(0)
        const offs = [start.on("change", schedule), end.on("change", schedule), lift.on("change", schedule)]
        segment = {
          start,
          end,
          lift,
          off: () => {
            offs.forEach((off) => off())
            start.destroy()
            end.destroy()
            lift.destroy()
          },
        }
        segments.current.set(item.key, segment)
      }
      if (reduced) {
        segment.start.jump(to.start)
        segment.end.jump(to.end)
        if (leaving) drop(item.key)
        return
      }
      if (first) {
        animate(segment.start, to.start, reveal)
        animate(segment.end, to.end, { ...reveal, delay: 0.04 + index * motionPresets.stagger.item })
        return
      }
      animate(segment.start, to.start, settle)
      animate(segment.end, to.end, { ...settle, onComplete: leaving ? () => drop(item.key) : undefined })
    })
    schedule()
  }, [shown, signature, reduced, schedule]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    for (const [key, segment] of segments.current) {
      const to = key === current ? 1 : 0
      if (reduced) segment.lift.jump(to)
      else if (segment.lift.get() !== to || segment.lift.isAnimating()) animate(segment.lift, to, pop)
    }
  }, [current, reduced, drawn, shown])

  const svg = useRef<SVGSVGElement>(null)
  const hit = (event: { clientX: number; clientY: number }) => {
    const box = svg.current?.getBoundingClientRect()
    if (!box || !box.width) return undefined
    const scale = size / box.width
    const x = (event.clientX - box.left) * scale - c
    const y = (event.clientY - box.top) * scale - c
    const radius = Math.hypot(x, y)
    if (radius < inner - 6 || radius > c) return null
    let turn = (Math.atan2(y, x) + Math.PI / 2) / TAU
    if (turn < 0) turn += 1
    for (const [key, arc] of targets.current) {
      if (arc.end > arc.start && turn >= arc.start && turn < arc.end && visible.some((item) => item.key === key)) return key
    }
    return undefined
  }
  const onRingMove = (event: PointerEvent<SVGSVGElement>) => {
    if (event.pointerType !== "mouse") return
    const key = hit(event)
    if (key !== undefined && key !== preview) setPreview(key)
  }
  const onRingClick = (event: MouseEvent<SVGSVGElement>) => {
    const key = hit(event)
    if (key) select(selected === key ? null : key)
  }

  const format = (value: number) => `${formatValue(value)}${suffix}`
  const describe = (item: Slice) => `${item.label}, ${format(item.value)}, ${shareText(item.value / (total || 1))}${item.members ? `. Includes ${item.members.map((member) => member.label).join(", ")}` : ""}`

  const rows = useRef<(HTMLButtonElement | null)[]>([])
  const step = (key: string, index: number, count: number) => ({ ArrowDown: index + 1, ArrowRight: index + 1, ArrowUp: index - 1, ArrowLeft: index - 1, Home: 0, End: count - 1 } as Record<string, number>)[key]
  const onLegendKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    if (event.key === "Escape" && selected) {
      event.preventDefault()
      select(null)
      return
    }
    const next = step(event.key, index, slices.length)
    if (next === undefined) return
    event.preventDefault()
    rows.current[(next + slices.length) % slices.length]?.focus()
  }
  const onRingKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (!visible.length) return
    if (event.key === "Escape") {
      event.preventDefault()
      setPreview(null)
      if (selected) select(null)
      return
    }
    if ((event.key === "Enter" || event.key === " ") && current) {
      event.preventDefault()
      select(selected === current ? null : current)
      return
    }
    const at = visible.findIndex((item) => item.key === current)
    const next = step(event.key, at < 0 ? (event.key.endsWith("Up") || event.key.endsWith("Left") ? 0 : -1) : at, visible.length)
    if (next === undefined) return
    event.preventDefault()
    const item = visible[(next + visible.length) % visible.length]
    setPreview(item.key)
    setAnnouncement(describe(item))
  }
  const onLegendBlur = (event: FocusEvent<HTMLButtonElement>) => {
    if (!(event.relatedTarget instanceof Node && event.currentTarget.closest("ul")?.contains(event.relatedTarget))) setPreview(null)
  }

  const identity = activeSlice ? activeSlice.key : total ? "__total" : "__empty"
  const readouts = [{ key: "__total", label: total ? totalLabel : emptyLabel, value: total, meta: null as Slice | null }, ...slices.map((item) => ({ key: item.key, label: item.label, value: item.value, meta: item as Slice | null }))]
  const activeIndex = Math.max(0, readouts.findIndex((item) => item.key === (identity === "__empty" ? "__total" : identity)))
  const summary = total ? `${label}. ${totalLabel} ${format(total)}. ${visible.map(describe).join(". ")}.` : `${label}. ${emptyLabel}.`
  const members = (item: Slice) => (item.members ? (item.members.length > 2 ? `${item.members.slice(0, 2).map((member) => member.label).join(", ")} and ${item.members.length - 2} more` : item.members.map((member) => member.label).join(" and ")) : null)
  const ringLabel = `${label}. Use the arrow keys to read each segment.`

  return (
    <figure ref={figure} data-slot="donut-chart" data-legend={legend || undefined} aria-label={label} className={cn("@container grid min-w-0 text-foreground", legend && "gap-6 @min-[460px]:grid-cols-[auto_minmax(0,1fr)] @min-[460px]:items-center @min-[460px]:gap-8", className, classNames?.root)}>
      <div
        data-slot="donut-chart-ring"
        className={cn("relative aspect-square w-full max-w-full justify-self-center outline-none focus-visible:ring-2 focus-visible:ring-ring", classNames?.ring)}
        style={{ width: size }}
        tabIndex={legend ? undefined : 0}
        role={legend ? undefined : "group"}
        aria-label={legend ? undefined : ringLabel}
        onKeyDown={legend ? undefined : onRingKey}
        onBlur={legend ? undefined : () => setPreview(null)}
      >
        <svg ref={svg} className={cn("block size-full overflow-visible", current !== null && "cursor-pointer")} viewBox={`0 0 ${size} ${size}`} aria-hidden="true" focusable="false" onPointerMove={onRingMove} onPointerLeave={() => setPreview(null)} onClick={onRingClick}>
          <circle className={cn("fill-none stroke-muted transition-opacity motion-reduce:transition-none", shown && total ? "opacity-0" : "opacity-100")} cx={c} cy={c} r={(outer + inner) / 2} strokeWidth={outer - inner} />
          {drawn.map((item) => {
            const arc = layout(slices, hidden).get(item.key)
            return (
              <path key={item.key} ref={registerPath} data-key={item.key} data-slot="donut-chart-segment" data-active={item.key === current || undefined} d={arc ? sector(c, outer, inner, arc.start, arc.end, GAP, corner) : ""} className={cn("transition-opacity motion-reduce:transition-none", current !== null && item.key !== current && "opacity-45")} fill={colorFor(item)} />
            )
          })}
        </svg>
        <div data-slot="donut-chart-center" className={cn("pointer-events-none absolute top-1/2 left-1/2 grid -translate-x-1/2 -translate-y-1/2", classNames?.center)} style={{ width: `calc(${(inner * 2) / size * 100}% - 16px)` }} aria-hidden="true">
          {readouts.map((item, index) => (
            <motion.span key={item.key} className="col-start-1 row-start-1 grid min-w-0 justify-items-center gap-0.5 text-center" initial={false} {...drum(index - activeIndex, reduced)}>
              <span className="block w-full truncate text-xs text-muted-foreground">{item.label}</span>
              <span className="block max-w-full truncate text-2xl font-medium tabular-nums">{item.value || item.meta ? <Count value={item.value} format={formatValue} reduced={reduced} /> : " "}</span>
              <span className="block w-full truncate text-xs text-muted-foreground tabular-nums">{item.meta ? <><Count value={total && !hidden.has(item.key) ? item.value / total : 0} format={shareText} reduced={reduced} /> of {totalLabel.toLowerCase()}</> : unit || " "}</span>
            </motion.span>
          ))}
        </div>
      </div>
      {legend && slices.length > 0 ? (
        <ul data-slot="donut-chart-legend" className={cn("m-0 grid min-w-0 list-none gap-0.5 p-0", classNames?.legend)} aria-label={`${label}, segments${legendAction === "toggle" ? ". Press a segment to show or hide it" : ""}`} id={legendId} onPointerLeave={() => setPreview(null)}>
          {slices.map((item, index) => {
            const off = hidden.has(item.key)
            const color = colorFor(item)
            return (
              <li key={item.key} className="min-w-0">
                <button
                  ref={(node) => { rows.current[index] = node }}
                  type="button"
                  data-slot="donut-chart-row"
                  className={cn("grid w-full min-w-0 grid-cols-[10px_minmax(0,1fr)_auto_3.25em] items-center gap-x-2.5 rounded-xl border-0 bg-transparent px-2.5 py-1.5 text-left text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring", (item.key === current || selected === item.key) && "bg-muted", classNames?.row)}
                  aria-pressed={legendAction === "toggle" ? !off : selected === item.key}
                  aria-label={off ? `${item.label}, hidden` : describe(item)}
                  onClick={() => (legendAction === "toggle" ? setHidden(item.key) : select(selected === item.key ? null : item.key))}
                  onPointerEnter={(event) => { if (event.pointerType === "mouse") setPreview(off ? null : item.key) }}
                  onFocus={(event) => { if (event.currentTarget.matches(":focus-visible")) setPreview(off ? null : item.key) }}
                  onBlur={onLegendBlur}
                  onKeyDown={(event) => onLegendKey(event, index)}
                >
                  <span aria-hidden="true" className={cn("size-2.5 rounded-full", off ? "border border-current bg-transparent" : "bg-current")} style={{ color }} />
                  <span className="grid min-w-0">
                    <span className={cn("truncate", off && "text-muted-foreground")}>{item.label}</span>
                    {item.members ? <span className="truncate text-xs text-muted-foreground">{members(item)}</span> : null}
                  </span>
                  <span className={cn("justify-self-end tabular-nums", off ? "text-muted-foreground" : "text-muted-foreground")} aria-hidden="true"><Count value={item.value} format={formatValue} reduced={reduced} /></span>
                  <span className={cn("justify-self-end font-medium tabular-nums", off && "text-muted-foreground")} aria-hidden="true"><Count value={off || !total ? 0 : item.value / total} format={shareText} reduced={reduced} /></span>
                </button>
              </li>
            )
          })}
        </ul>
      ) : null}
      <p className="sr-only">{summary}</p>
      <p className="sr-only" aria-live="polite" role="status">{announcement}</p>
      {total > 0 ? (
        <table className="sr-only">
          <caption>{label}</caption>
          <thead><tr><th scope="col">Segment</th><th scope="col">Value</th><th scope="col">Share</th></tr></thead>
          <tbody>
            {visible.flatMap((item) => (item.members ? item.members.map((member) => ({ key: member.key, label: `${member.label} (${otherLabel})`, value: member.value })) : [item])).map((item) => (
              <tr key={item.key}><th scope="row">{item.label}</th><td>{format(item.value)}</td><td>{shareText(item.value / total)}</td></tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </figure>
  )
}
