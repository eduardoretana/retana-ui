"use client"

/** Adapted from Arc UI (MIT). */

import { useImperativeHandle, useLayoutEffect, useRef, useState, useSyncExternalStore, type KeyboardEvent, type PointerEvent, type Ref } from "react"
import { AnimatePresence, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface SlopeItem {
  /** Stable identity. An item keeps its line across datasets. */
  key: string
  /** Name beside the start value, in the tooltip, and in the table. */
  label: string
  /** Value in the first period. */
  start: number
  /** Value in the second period. */
  end: number
}

/** How several items changed between exactly two moments, and how their order changed. */
export interface SlopeChartProps {
  data: SlopeItem[]
  /** What is measured. Names the chart for assistive technology. */
  label: string
  /** Heading of the first column, such as "Before". */
  startLabel: string
  /** Heading of the second column, such as "After". */
  endLabel: string
  formatValue?: (value: number) => string
  /** Formats the change in the tooltip. Defaults to the signed difference. */
  formatChange?: (change: number, item: SlopeItem) => string
  /** Plot height in pixels. Defaults to 44 pixels per item. */
  height?: number
  /** The item drawn in the accent. */
  highlightKey?: string | null
  /** Controlled item in focus. The others fade while one is in focus. */
  activeKey?: string | null
  onActiveChange?: (key: string | null) => void
  /** Rank movement beside each end value. */
  ranks?: boolean
  emptyLabel?: string
  ref?: Ref<HTMLElement>
  className?: string
  classNames?: SlopeChartClassNames
}

export type SlopeChartClassNames = {
  root?: string
  stage?: string
  plot?: string
  item?: string
  label?: string
  tooltip?: string
  message?: string
}

type Row = { item: SlopeItem; y0: number; y1: number; l0: number; l1: number; rank0: number; rank1: number; order: number }

const follow = { stiffness: 480, damping: 42, restDelta: 0.01 }
const LABEL_GAP = 20
const PAD = 14
const HEAD = 28
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })

const subscribeNothing = () => () => {}
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

function spread(wanted: number[], gap: number, low: number, high: number): number[] {
  const order = wanted.map((y, index) => ({ y, index })).sort((a, b) => a.y - b.y)
  let groups = order.map((entry) => ({ members: [entry], top: entry.y }))
  for (let changed = true; changed; ) {
    changed = false
    const next: typeof groups = []
    for (const group of groups) {
      const prev = next[next.length - 1]
      if (prev && prev.top + prev.members.length * gap > group.top) {
        const members = [...prev.members, ...group.members]
        next[next.length - 1] = { members, top: members.reduce((sum, member, k) => sum + member.y - k * gap, 0) / members.length }
        changed = true
      } else next.push(group)
    }
    groups = next.map((group) => ({ ...group, top: clamp(group.top, low, Math.max(low, high - (group.members.length - 1) * gap)) }))
  }
  const out = new Array<number>(wanted.length)
  groups.forEach((group) => group.members.forEach((member, k) => { out[member.index] = group.top + k * gap }))
  return out
}

function Rank({ move, reduced }: { move: number; reduced: boolean }) {
  const text = move === 0 ? "=" : `${Math.abs(move)}`
  return (
    <span className="inline-flex min-w-[30px] items-center gap-0.5 text-xs text-muted-foreground tabular-nums data-[move=up]:text-foreground" data-move={move > 0 ? "up" : move < 0 ? "down" : "level"} aria-hidden="true">
      {move !== 0 ? (
        <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
          <path d={move > 0 ? "M4 7V1M1.5 3.5 4 1l2.5 2.5" : "M4 1v6M1.5 4.5 4 7l2.5-2.5"} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
      <span className="relative inline-flex overflow-hidden">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: move >= 0 ? 6 : -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: move >= 0 ? -6 : 6 }}
            transition={reduced ? { duration: 0 } : motionPresets.spring.snappy}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </span>
    </span>
  )
}

export function SlopeChart({
  data,
  label,
  startLabel,
  endLabel,
  formatValue,
  formatChange,
  height,
  highlightKey = null,
  activeKey,
  onActiveChange,
  ranks = true,
  emptyLabel = "No data",
  ref,
  className,
  classNames,
}: SlopeChartProps) {
  const reduced = useReducedMotionSafe()
  const figure = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const tip = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => figure.current as HTMLElement)
  const inView = useInView(figure, { once: true, amount: 0.3 })
  const empty = data.length === 0
  const plotHeight = height ?? Math.max(200, data.length * 44)

  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const node = stage.current
    if (!node) return
    const read = () => setWidth(node.clientWidth)
    read()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const narrow = width < 440
  const leftRoom = narrow ? (width < 300 ? 116 : 132) : 168
  const rightRoom = ranks ? (narrow ? 76 : 96) : narrow ? 52 : 64
  const x0 = leftRoom
  const x1 = Math.max(x0 + 40, width - rightRoom)

  const values = data.flatMap((item) => [item.start, item.end])
  let lo = Math.min(...values)
  let hi = Math.max(...values)
  if (!Number.isFinite(lo)) {
    lo = 0
    hi = 1
  }
  if (hi - lo < 1e-9) {
    lo -= 1
    hi += 1
  }
  const yOf = (value: number) => PAD + (1 - (value - lo) / (hi - lo)) * (plotHeight - PAD * 2)
  const rankOf = (field: "start" | "end") => {
    const sorted = [...data].sort((a, b) => b[field] - a[field])
    return (item: SlopeItem) => sorted.indexOf(item) + 1
  }
  const r0 = rankOf("start")
  const r1 = rankOf("end")
  const l0 = spread(data.map((item) => yOf(item.start)), LABEL_GAP, 8, plotHeight - 8)
  const l1 = spread(data.map((item) => yOf(item.end)), LABEL_GAP, 8, plotHeight - 8)
  const rows: Row[] = data.map((item, index) => ({ item, y0: yOf(item.start), y1: yOf(item.end), l0: l0[index], l1: l1[index], rank0: r0(item), rank1: r1(item), order: 0 }))
  const byEnd = [...rows].sort((a, b) => a.rank1 - b.rank1)
  byEnd.forEach((row, index) => {
    row.order = index
  })

  const [ownActive, setOwnActive] = useState<string | null>(null)
  const wanted = activeKey !== undefined ? activeKey : ownActive
  const active = wanted && data.some((item) => item.key === wanted) ? wanted : null
  const setActive = (key: string | null) => {
    if (activeKey === undefined) setOwnActive(key)
    if (key !== active) onActiveChange?.(key)
  }

  const tipX = useMotionValue(0)
  const tipY = useMotionValue(0)
  const tipSpringX = useSpring(tipX, follow)
  const tipSpringY = useSpring(tipY, follow)
  const wasShown = useRef(false)
  const activeRow = rows.find((row) => row.item.key === active) ?? null
  useLayoutEffect(() => {
    const bubble = tip.current
    if (!activeRow || !bubble || !width) {
      wasShown.current = false
      return
    }
    const tw = bubble.offsetWidth
    const th = bubble.offsetHeight
    const mid = (activeRow.y0 + activeRow.y1) / 2
    const cx = (x0 + x1) / 2
    const above = mid - th - 16 >= 0
    const left = clamp(cx - tw / 2, 0, Math.max(0, width - tw))
    const top = clamp(HEAD + (above ? mid - th - 16 : mid + 16), 0, Math.max(0, plotHeight + HEAD - th))
    tipX.set(left)
    tipY.set(top)
    if (!wasShown.current || reduced) {
      tipSpringX.jump(left)
      tipSpringY.jump(top)
    }
    wasShown.current = true
  })

  const nearest = (clientX: number, clientY: number) => {
    const rect = stage.current?.getBoundingClientRect()
    if (!rect || empty) return null
    const x = clamp(clientX - rect.left, x0, x1)
    const y = clientY - rect.top - HEAD
    const t = (x - x0) / Math.max(1, x1 - x0)
    let best: Row | null = null
    let distance = Infinity
    for (const row of rows) {
      const inLine = Math.abs(row.y0 + (row.y1 - row.y0) * t - y)
      const onLabel = clientX - rect.left < x0 ? Math.abs(row.l0 - y) : clientX - rect.left > x1 ? Math.abs(row.l1 - y) : Infinity
      const next = Math.min(inLine, onLabel)
      if (next < distance) {
        distance = next
        best = row
      }
    }
    return distance <= 22 ? (best?.item.key ?? null) : null
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || event.buttons) setActive(nearest(event.clientX, event.clientY))
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (empty) return
    if (event.key === "Escape" && active) {
      event.preventDefault()
      setActive(null)
      return
    }
    const at = activeRow ? activeRow.order : -1
    const moves: Record<string, number> = { ArrowDown: at + 1, ArrowRight: at + 1, ArrowUp: at < 0 ? 0 : at - 1, ArrowLeft: at < 0 ? 0 : at - 1, Home: 0, End: byEnd.length - 1 }
    if (!(event.key in moves)) return
    event.preventDefault()
    setActive(byEnd[clamp(moves[event.key], 0, byEnd.length - 1)].item.key)
  }

  const format = (value: number) => (formatValue ? formatValue(value) : grouped.format(value))
  const change = (item: SlopeItem) => (formatChange ? formatChange(item.end - item.start, item) : `${item.end >= item.start ? "+" : "−"}${format(Math.abs(item.end - item.start))}`)
  const rankText = (row: Row) => (row.rank0 === row.rank1 ? "same rank" : row.rank1 < row.rank0 ? `up ${row.rank0 - row.rank1} to rank ${row.rank1}` : `down ${row.rank1 - row.rank0} to rank ${row.rank1}`)
  const announce = activeRow ? `${activeRow.item.label}, ${startLabel} ${format(activeRow.item.start)}, ${endLabel} ${format(activeRow.item.end)}, ${change(activeRow.item)}, ${rankText(activeRow)}` : ""
  const summary = empty ? `${label}. ${emptyLabel}.` : `${label}, ${startLabel} to ${endLabel}. ${byEnd.map((row) => `${row.item.label} ${format(row.item.start)} to ${format(row.item.end)}`).join(", ")}.`
  const settle = reduced ? { duration: 0 } : motionPresets.spring.morph
  const drawn = inView || reduced

  return (
    <figure ref={figure} data-slot="slope-chart" aria-label={label} className={cn("relative m-0 grid min-w-0 text-foreground", className, classNames?.root)}>
      <div
        ref={stage}
        data-slot="slope-chart-stage"
        className={cn("group relative min-w-0 touch-pan-y outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", classNames?.stage)}
        data-narrow={narrow ? "true" : undefined}
        data-active={active ? "true" : undefined}
        role="group"
        tabIndex={empty ? -1 : 0}
        aria-roledescription="slope chart"
        aria-label={`${label}. Use up and down arrows to move between items in ${endLabel} order.`}
        onPointerMove={onPointerMove}
        onPointerDown={(event) => {
          if (event.pointerType !== "mouse") {
            event.currentTarget.setPointerCapture?.(event.pointerId)
            setActive(nearest(event.clientX, event.clientY))
          }
        }}
        onPointerUp={(event) => {
          if (event.pointerType !== "mouse") setActive(null)
        }}
        onPointerCancel={() => setActive(null)}
        onPointerLeave={(event) => {
          if (event.pointerType === "mouse") setActive(null)
        }}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        onFocus={(event) => {
          if (event.currentTarget.matches(":focus-visible") && !empty && !active) setActive(byEnd[0].item.key)
        }}
      >
        {width > 0 ? (
          <>
            <div className="relative h-7" aria-hidden="true">
              <span data-slot="slope-chart-column" className="absolute top-0 max-w-[45%] -translate-x-1/2 truncate text-sm whitespace-nowrap text-muted-foreground" style={{ left: x0 }}>
                {startLabel}
              </span>
              <span data-slot="slope-chart-column" className="absolute top-0 max-w-[45%] -translate-x-1/2 truncate text-sm whitespace-nowrap text-muted-foreground" style={{ left: x1 }}>
                {endLabel}
              </span>
            </div>
            <div data-slot="slope-chart-plot" className={cn("relative", classNames?.plot)} style={{ height: plotHeight }}>
              <svg className="block overflow-visible" width={width} height={plotHeight} aria-hidden="true" focusable="false">
                <line className="stroke-border" strokeWidth={1} x1={x0} x2={x0} y1={0} y2={plotHeight} />
                <line className="stroke-border" strokeWidth={1} x1={x1} x2={x1} y1={0} y2={plotHeight} />
                {rows.map((row, index) => {
                  const key = row.item.key
                  const on = active === key
                  const accent = highlightKey === key
                  const delay = reduced ? 0 : index * 0.05
                  return (
                    <g
                      key={key}
                      data-slot="slope-chart-item"
                      className={cn(
                        "text-muted-foreground transition-opacity duration-200 motion-reduce:transition-none data-[accent=true]:text-[color:var(--chart-1)] data-[dim=true]:opacity-20 data-[on=true]:not-data-[accent=true]:text-foreground",
                        classNames?.item,
                      )}
                      data-on={on ? "true" : undefined}
                      data-accent={accent ? "true" : undefined}
                      data-dim={active !== null && !on ? "true" : undefined}
                    >
                      <motion.path className="fill-none stroke-border" strokeWidth={1} initial={false} animate={{ d: `M${x0 - 6},${row.l0}L${x0 - 1},${row.y0}` }} transition={settle} />
                      <motion.path className="fill-none stroke-border" strokeWidth={1} initial={false} animate={{ d: `M${x1 + 6},${row.l1}L${x1 + 1},${row.y1}` }} transition={settle} />
                      <motion.line
                        className="fill-none stroke-current [stroke-linecap:round]"
                        strokeWidth={2}
                        x1={x0}
                        x2={x1}
                        initial={reduced ? false : { y1: row.y0, y2: row.y1, pathLength: 0 }}
                        animate={{ y1: row.y0, y2: row.y1, pathLength: drawn ? 1 : 0 }}
                        transition={{
                          y1: settle,
                          y2: settle,
                          pathLength: reduced ? { duration: 0 } : { duration: motionPresets.duration.considered + 0.22, ease: [...motionPresets.ease.inOut], delay: 0.1 + delay },
                        }}
                      />
                      <motion.circle className="fill-current stroke-background" strokeWidth={2} cx={x0} r={4} initial={reduced ? false : { cy: row.y0, scale: 0 }} animate={{ cy: row.y0, scale: drawn ? 1 : 0 }} transition={{ cy: settle, scale: reduced ? { duration: 0 } : { ...motionPresets.spring.snappy, delay } }} />
                      <motion.circle className="fill-current stroke-background" strokeWidth={2} cx={x1} r={4} initial={reduced ? false : { cy: row.y1, scale: 0 }} animate={{ cy: row.y1, scale: drawn ? 1 : 0 }} transition={{ cy: settle, scale: reduced ? { duration: 0 } : { ...motionPresets.spring.snappy, delay: 0.7 + delay } }} />
                    </g>
                  )
                })}
              </svg>
              {rows.map((row, index) => {
                const key = row.item.key
                const on = active === key
                const accent = highlightKey === key
                const delay = reduced ? 0 : index * 0.05
                return (
                  <div
                    key={key}
                    data-slot="slope-chart-label"
                    className={cn("pointer-events-none transition-opacity duration-200 motion-reduce:transition-none data-[dim=true]:opacity-30", classNames?.label)}
                    data-on={on ? "true" : undefined}
                    data-accent={accent ? "true" : undefined}
                    data-dim={active !== null && !on ? "true" : undefined}
                    aria-hidden="true"
                  >
                    <motion.span
                      className={cn("absolute top-0 flex h-5 items-center justify-end gap-2 overflow-hidden text-sm whitespace-nowrap", narrow && "gap-1.5 text-xs")}
                      style={{ right: width - x0 + 10, maxWidth: x0 - 10, marginTop: -10 }}
                      initial={reduced ? false : { y: row.l0, opacity: 0 }}
                      animate={{ y: row.l0, opacity: drawn ? 1 : 0 }}
                      transition={{ y: settle, opacity: { duration: 0.3, delay } }}
                    >
                      <span className={cn("min-w-0 truncate text-muted-foreground", (on || accent) && "text-foreground")}>{row.item.label}</span>
                      <span className={cn("shrink-0 text-foreground tabular-nums", (on || accent) && "font-medium")}>{format(row.item.start)}</span>
                    </motion.span>
                    <motion.span
                      className={cn("absolute top-0 flex h-5 max-w-full items-center gap-2 overflow-hidden text-sm whitespace-nowrap", narrow && "gap-1.5 text-xs")}
                      style={{ left: x1 + 10, marginTop: -10, maxWidth: Math.max(48, width - x1 - 12) }}
                      initial={reduced ? false : { y: row.l1, opacity: 0 }}
                      animate={{ y: row.l1, opacity: drawn ? 1 : 0 }}
                      transition={{ y: settle, opacity: { duration: 0.3, delay: 0.7 + delay } }}
                    >
                      <span className={cn("text-foreground tabular-nums", (on || accent) && "font-medium")}>{format(row.item.end)}</span>
                      {ranks ? <Rank move={row.rank0 - row.rank1} reduced={reduced} /> : null}
                    </motion.span>
                  </div>
                )
              })}
            </div>
          </>
        ) : null}
        <motion.div
          ref={tip}
          data-slot="slope-chart-tooltip"
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-20 grid w-max max-w-full gap-0.5 rounded-xl border border-border bg-popover p-2.5 text-popover-foreground opacity-0 shadow-md scale-95 transition-[opacity,scale] duration-150 group-data-[active=true]:scale-100 group-data-[active=true]:opacity-100 motion-reduce:transition-none",
            classNames?.tooltip,
          )}
          style={{ x: reduced ? tipX : tipSpringX, y: reduced ? tipY : tipSpringY }}
          aria-hidden="true"
        >
          <p className="m-0 mb-0.5 truncate text-sm font-medium">{activeRow?.item.label ?? ""}</p>
          <p className="m-0 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{startLabel}</span>
            <span className="font-medium tabular-nums">{activeRow ? format(activeRow.item.start) : ""}</span>
          </p>
          <p className="m-0 flex items-center justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{endLabel}</span>
            <span className="font-medium tabular-nums">{activeRow ? format(activeRow.item.end) : ""}</span>
          </p>
          <p className="m-0 mt-0.5 text-xs text-muted-foreground tabular-nums">{activeRow ? `${change(activeRow.item)}, ${rankText(activeRow)}` : ""}</p>
        </motion.div>
        {empty ? (
          <p data-slot="slope-chart-message" className={cn("m-0 grid min-h-40 place-items-center text-sm text-muted-foreground", classNames?.message)}>
            {emptyLabel}
          </p>
        ) : null}
      </div>
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {announce}
      </p>
      <p className="sr-only">{summary}</p>
      {!empty ? (
        <div className="sr-only">
          <table>
            <caption>{label}</caption>
            <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">{startLabel}</th>
                <th scope="col">{endLabel}</th>
                <th scope="col">Change</th>
                <th scope="col">Rank</th>
              </tr>
            </thead>
            <tbody>
              {byEnd.map((row) => (
                <tr key={row.item.key}>
                  <th scope="row">{row.item.label}</th>
                  <td>{format(row.item.start)}</td>
                  <td>{format(row.item.end)}</td>
                  <td>{change(row.item)}</td>
                  <td>
                    {row.rank0} to {row.rank1}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </figure>
  )
}
