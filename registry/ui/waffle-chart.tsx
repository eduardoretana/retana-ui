"use client"

/** Adapted from Arc UI (MIT). */

import { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent, type Ref } from "react"
import { animate, motion, useInView, useMotionValue, useReducedMotion, useSpring, useTransform } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface WaffleCategory {
  /** Stable identity. Cells keep following their category when the data changes. */
  key: string
  /** Name in the legend, the tooltip, and the data table. */
  label: string
  /** Raw amount. Shares are computed from the total. Negatives count as zero. */
  value: number
  /** Optional color. Defaults to chart tokens in category order. */
  color?: string
}

/** A unit chart: every cell is one share of the whole. */
export interface WaffleChartProps {
  /** Categories in fill order. The first fills from the bottom-left corner, column by column. */
  data: WaffleCategory[]
  /** What the whole is. Names the chart for assistive technology. */
  label: string
  /** Unit after each raw value in the tooltip and table. */
  unit?: string
  formatValue?: (value: number, category: WaffleCategory) => string
  /** Grid rows. rows × columns cells make the whole. 10 × 10 means one cell per percent. */
  rows?: number
  columns?: number
  /** The category painted in the accent. Pass null to keep every category neutral. Defaults to the first category. */
  accentKey?: string | null
  /** Controlled focused category. Others dim while one is focused. */
  activeKey?: string | null
  defaultActiveKey?: string | null
  onActiveChange?: (key: string | null) => void
  /** Category list with shares that roll to their new value. */
  legend?: boolean
  /** Decimal places for shares. */
  decimals?: number
  emptyLabel?: string
  ref?: Ref<HTMLElement>
  className?: string
  classNames?: WaffleChartClassNames
}

export type WaffleChartClassNames = {
  root?: string
  grid?: string
  cell?: string
  legend?: string
  item?: string
  tooltip?: string
  message?: string
}

type Cell = { id: number; key: string | null; slot: number }
type Pointer = { key: string; slot: number } | null

const GAP = 3
const CHARTS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
const SHAPES = ["square", "round", "framed"] as const
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })

const subscribeNothing = () => () => {}
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

function allocate(data: WaffleCategory[], total: number, cells: number): number[] {
  if (total <= 0) return data.map(() => 0)
  const exact = data.map((item) => (Math.max(0, item.value) / total) * cells)
  const counts = exact.map(Math.floor)
  let left = cells - counts.reduce((sum, count) => sum + count, 0)
  const order = exact.map((value, index) => ({ index, rest: value - Math.floor(value) })).sort((a, b) => b.rest - a.rest)
  for (let k = 0; left > 0 && k < order.length; k++, left--) counts[order[k].index]++
  return counts
}

function reassign(previous: Cell[], data: WaffleCategory[], counts: number[]): Cell[] {
  const bySlot = [...previous].sort((a, b) => a.slot - b.slot)
  const kept = new Map<string, Cell[]>()
  const pool: Cell[] = []
  const want = new Map(data.map((item, index) => [item.key, counts[index]]))
  for (const cell of bySlot) {
    const list = cell.key !== null ? (kept.get(cell.key) ?? []) : []
    if (cell.key !== null && list.length < (want.get(cell.key) ?? 0)) {
      list.push(cell)
      kept.set(cell.key, list)
    } else pool.push(cell)
  }
  const next: Cell[] = []
  let slot = 0
  data.forEach((item, index) => {
    const own = kept.get(item.key) ?? []
    while (own.length < counts[index] && pool.length) own.push(pool.shift()!)
    own.sort((a, b) => a.slot - b.slot).forEach((cell) => next.push({ id: cell.id, key: item.key, slot: slot++ }))
  })
  pool.forEach((cell) => next.push({ id: cell.id, key: null, slot: slot++ }))
  return next.sort((a, b) => a.id - b.id)
}

function Rolling({ value, decimals, reduced }: { value: number; decimals: number; reduced: boolean }) {
  const shown = useMotionValue(value)
  const text = useTransform(shown, (current) => `${current.toFixed(decimals)}%`)
  useEffect(() => {
    if (reduced) {
      shown.jump(value)
      return
    }
    const controls = animate(shown, value, motionPresets.spring.smooth)
    return () => controls.stop()
  }, [reduced, shown, value])
  return <motion.span>{text}</motion.span>
}

export function WaffleChart({
  data,
  label,
  unit = "",
  formatValue,
  rows = 10,
  columns = 10,
  accentKey,
  activeKey,
  defaultActiveKey = null,
  onActiveChange,
  legend = true,
  decimals = 0,
  emptyLabel = "No data",
  ref,
  className,
  classNames,
}: WaffleChartProps) {
  const reduced = useReducedMotionSafe()
  const figure = useRef<HTMLElement>(null)
  const grid = useRef<HTMLDivElement>(null)
  const tip = useRef<HTMLDivElement>(null)
  useImperativeHandle(ref, () => figure.current as HTMLElement)
  const inView = useInView(figure, { once: true, amount: 0.35 })
  const count = Math.max(1, rows * columns)
  const total = data.reduce((sum, item) => sum + Math.max(0, item.value), 0)
  const empty = !data.length || total <= 0
  const accent = accentKey === undefined ? (data[0]?.key ?? null) : accentKey

  const signature = `${count}|${data.map((item) => `${item.key}:${item.value}`).join(",")}`
  const counts = useMemo(() => allocate(data, total, count), [data, total, count])
  const [layout, setLayout] = useState(() => ({
    cells: reassign(
      Array.from({ length: count }, (_, id) => ({ id, key: null, slot: id })),
      data,
      counts,
    ),
    moved: new Set<number>(),
    version: 0,
  }))
  const [seen, setSeen] = useState(signature)
  if (seen !== signature) {
    setSeen(signature)
    const base = Array.from({ length: count }, (_, id) => layout.cells[id] ?? { id, key: null, slot: id })
    const next = reassign(base, data, counts)
    setLayout({
      cells: next,
      moved: new Set(next.filter((cell) => base[cell.id].slot !== cell.slot || base[cell.id].key !== cell.key).map((cell) => cell.id)),
      version: layout.version + 1,
    })
  }
  const { cells, moved, version } = layout

  const [ownActive, setOwnActive] = useState<string | null>(defaultActiveKey)
  const pinned = activeKey !== undefined ? activeKey : ownActive
  const setPinned = (key: string | null) => {
    if (activeKey === undefined) setOwnActive(key)
    onActiveChange?.(key)
  }
  const [pointer, setPointer] = useState<Pointer>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const focusKey = pointer?.key ?? preview ?? pinned
  const active = focusKey && data.some((item) => item.key === focusKey) ? focusKey : null

  const [side, setSide] = useState(0)
  useLayoutEffect(() => {
    const node = grid.current
    if (!node) return
    const read = () => setSide(node.clientWidth)
    read()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(read)
    observer.observe(node)
    return () => observer.disconnect()
  }, [])
  const size = side ? (side - GAP * (columns - 1)) / columns : 0
  const height = size ? size * rows + GAP * (rows - 1) : 0
  const place = (slot: number) => ({ x: Math.floor(slot / rows) * (size + GAP), y: (rows - 1 - (slot % rows)) * (size + GAP) })

  const colorOf = (key: string | null) => {
    if (key === null) return "currentColor"
    const index = data.findIndex((item) => item.key === key)
    const item = data[index]
    if (!item) return "currentColor"
    if (item.color) return item.color
    if (key === accent) return CHARTS[0]
    const rank = data.filter((entry) => entry.key !== accent).findIndex((entry) => entry.key === key)
    return CHARTS[(Math.max(0, rank) + 1) % CHARTS.length]
  }

  const shapeOf = (key: string | null) => {
    if (key === null || key === accent) return "square" as const
    const rank = data.filter((entry) => entry.key !== accent).findIndex((entry) => entry.key === key)
    return rank < 0 ? "square" : SHAPES[rank % SHAPES.length]
  }

  const tipX = useMotionValue(0)
  const tipY = useMotionValue(0)
  const follow = { stiffness: 520, damping: 44, restDelta: 0.01 }
  const glideX = useSpring(tipX, follow)
  const glideY = useSpring(tipY, follow)
  const wasShown = useRef(false)
  useLayoutEffect(() => {
    const bubble = tip.current
    const host = figure.current
    const board = grid.current
    if (!pointer || !bubble || !host || !board || !size) {
      wasShown.current = false
      return
    }
    const hostBox = host.getBoundingClientRect()
    const boardBox = board.getBoundingClientRect()
    const { x, y } = place(pointer.slot)
    const cx = boardBox.left - hostBox.left + x + size / 2
    const cy = boardBox.top - hostBox.top + y
    const tw = bubble.offsetWidth
    const th = bubble.offsetHeight
    let top = cy - th - 10
    if (top < 0) top = cy + size + 10
    const left = clamp(cx - tw / 2, 0, Math.max(0, hostBox.width - tw))
    tipX.set(left)
    tipY.set(clamp(top, 0, Math.max(0, hostBox.height - th)))
    if (!wasShown.current || reduced) {
      glideX.jump(tipX.get())
      glideY.jump(tipY.get())
    }
    wasShown.current = true
  })

  const slotAt = (clientX: number, clientY: number) => {
    const box = grid.current?.getBoundingClientRect()
    if (!box || !size) return null
    const col = clamp(Math.floor((clientX - box.left) / (size + GAP)), 0, columns - 1)
    const row = clamp(Math.floor((clientY - box.top) / (size + GAP)), 0, rows - 1)
    return col * rows + (rows - 1 - row)
  }
  const pointAt = (slot: number | null): Pointer => {
    if (slot === null) return null
    const cell = cells.find((item) => item.slot === slot)
    return cell?.key ? { key: cell.key, slot } : null
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" || event.buttons) setPointer(pointAt(slotAt(event.clientX, event.clientY)))
  }
  const onPointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") event.currentTarget.setPointerCapture?.(event.pointerId)
    setPointer(pointAt(slotAt(event.clientX, event.clientY)))
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (empty) return
    if (event.key === "Escape" && pointer) {
      event.preventDefault()
      setPointer(null)
      return
    }
    const filled = cells.filter((cell) => cell.key !== null).length
    const at = pointer?.slot ?? 0
    const col = Math.floor(at / rows)
    const row = at % rows
    const blocks = counts
      .map((blockSize, index) => ({ start: counts.slice(0, index).reduce((sum, value) => sum + value, 0), size: blockSize }))
      .filter((block) => block.size > 0)
    const block = Math.max(0, blocks.findIndex((item) => at >= item.start && at < item.start + item.size))
    const moves: Record<string, () => number> = {
      ArrowUp: () => col * rows + Math.min(rows - 1, row + 1),
      ArrowDown: () => col * rows + Math.max(0, row - 1),
      ArrowRight: () => Math.min(columns - 1, col + 1) * rows + row,
      ArrowLeft: () => Math.max(0, col - 1) * rows + row,
      PageDown: () => blocks[Math.min(blocks.length - 1, block + 1)].start,
      PageUp: () => (at > blocks[block].start ? blocks[block].start : blocks[Math.max(0, block - 1)].start),
      Home: () => 0,
      End: () => filled - 1,
    }
    const move = moves[event.key]
    if (!move) return
    event.preventDefault()
    setPointer(pointAt(clamp(pointer ? move() : 0, 0, Math.max(0, filled - 1))))
  }

  const format = (value: number, item: WaffleCategory) => `${formatValue ? formatValue(value, item) : grouped.format(value)}${unit ? ` ${unit}` : ""}`
  const share = (item: WaffleCategory) => (total > 0 ? (Math.max(0, item.value) / total) * 100 : 0)
  const reading = pointer ? (data.find((item) => item.key === pointer.key) ?? null) : null
  const announce = reading ? `${reading.label}, ${share(reading).toFixed(decimals)}%, ${format(reading.value, reading)}` : ""
  const summary = empty ? `${label}. ${emptyLabel}.` : `${label}. ${data.map((item) => `${item.label} ${share(item).toFixed(decimals)}%`).join(", ")}.`
  const shownX = reduced ? tipX : glideX
  const shownY = reduced ? tipY : glideY
  const settle = reduced ? { duration: 0 } : motionPresets.spring.morph

  const shapeClass = (shape: (typeof SHAPES)[number] | "square") =>
    shape === "round" ? "rounded-full" : shape === "framed" ? "rounded-[22%] bg-background shadow-[inset_0_0_0_2.5px_var(--cell)]" : "rounded-[22%]"

  return (
    <figure
      ref={figure}
      data-slot="waffle-chart"
      className={cn("@container relative m-0 min-w-0 text-foreground", className, classNames?.root)}
      aria-label={label}
      data-legend={legend ? "true" : undefined}
    >
      <div className={cn("grid min-w-0 items-center gap-6", legend && "@min-[420px]:grid-cols-[minmax(0,232px)_minmax(0,1fr)]")}>
        <div className="relative min-w-0">
          <div
            ref={grid}
            data-slot="waffle-chart-grid"
            className={cn(
              "group/grid relative mx-auto w-full max-w-[300px] touch-pan-y outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              classNames?.grid,
            )}
            style={{ height: height || undefined, aspectRatio: height ? undefined : `${columns} / ${rows}` }}
            data-active={active ? "true" : undefined}
            role="group"
            tabIndex={empty ? -1 : 0}
            aria-roledescription="waffle chart"
            aria-label={`${label}. ${count} cells. Use arrow keys to move between cells, Page Up and Page Down to jump between categories.`}
            onPointerMove={onPointerMove}
            onPointerDown={onPointerDown}
            onPointerUp={(event) => {
              if (event.pointerType !== "mouse") setPointer(null)
            }}
            onPointerCancel={() => setPointer(null)}
            onPointerLeave={(event) => {
              if (event.pointerType === "mouse") setPointer(null)
            }}
            onKeyDown={onKeyDown}
            onBlur={() => setPointer(null)}
            onFocus={(event) => {
              if (event.currentTarget.matches(":focus-visible") && !empty) setPointer((current) => current ?? pointAt(0))
            }}
          >
            {size > 0
              ? cells.map((cell) => {
                  const { x, y } = place(cell.slot)
                  const travel = moved.has(cell.id) && !reduced
                  const delay = reduced ? 0 : (cell.slot / count) * 0.32
                  const on = cell.key !== null && cell.key === active
                  const shown = inView || reduced
                  const dip = travel ? [1, 0.62 + (version % 2) * 0.001, 1] : 1
                  const shape = shapeOf(cell.key)
                  return (
                    <motion.span
                      key={cell.id}
                      data-slot="waffle-chart-cell"
                      aria-hidden="true"
                      data-on={on ? "true" : undefined}
                      data-cursor={pointer?.slot === cell.slot ? "true" : undefined}
                      data-empty={cell.key === null ? "true" : undefined}
                      data-shape={shape}
                      className={cn(
                        "absolute top-0 left-0 will-change-transform group-data-[active=true]/grid:not-data-[on=true]:not-data-[empty=true]:!opacity-25 data-[cursor=true]:ring-2 data-[cursor=true]:ring-foreground data-[cursor=true]:ring-offset-2 data-[cursor=true]:ring-offset-background",
                        shape === "framed" ? shapeClass(shape) : cn(shapeClass(shape), "bg-[var(--cell)]"),
                        classNames?.cell,
                      )}
                      style={{ width: size, height: size, "--cell": colorOf(cell.key), "--delay": `${delay}s` } as CSSProperties}
                      initial={reduced ? false : { x, y, scale: 0.4, opacity: 0 }}
                      animate={shown ? { x, y, scale: dip, opacity: cell.key === null ? 0 : 1 } : { x, y, scale: 0.4, opacity: 0 }}
                      transition={
                        reduced
                          ? { duration: 0 }
                          : {
                              x: { ...settle, delay },
                              y: { ...settle, delay },
                              scale: travel ? { duration: 0.62, times: [0, 0.42, 1], ease: "easeInOut", delay } : { ...motionPresets.spring.snappy, delay: delay * 0.6 },
                              opacity: { duration: 0.24, delay: delay * 0.6 },
                            }
                      }
                    />
                  )
                })
              : null}
          </div>
          {!empty ? (
            <motion.div
              ref={tip}
              data-slot="waffle-chart-tooltip"
              data-shown={pointer ? "true" : undefined}
              className={cn(
                "pointer-events-none absolute top-0 left-0 z-20 grid w-max max-w-full gap-0.5 rounded-xl border border-border bg-popover p-2.5 text-popover-foreground opacity-0 shadow-md scale-95 transition-[opacity,scale] duration-150 data-[shown=true]:scale-100 data-[shown=true]:opacity-100 motion-reduce:transition-none",
                classNames?.tooltip,
              )}
              style={{ x: shownX, y: shownY }}
              aria-hidden="true"
            >
              <p className="m-0 flex min-w-0 items-center gap-2 text-sm">
                <span
                  className={cn("size-2.5 shrink-0", shapeOf(reading?.key ?? null) === "framed" ? "bg-background shadow-[inset_0_0_0_2px_var(--cell)]" : "bg-[var(--cell)]", shapeClass(shapeOf(reading?.key ?? null)))}
                  style={{ "--cell": colorOf(reading?.key ?? null) } as CSSProperties}
                />
                <span className="min-w-0 flex-1 truncate text-muted-foreground">{reading?.label ?? ""}</span>
                <span className="shrink-0 font-medium tabular-nums">{reading ? `${share(reading).toFixed(decimals)}%` : ""}</span>
              </p>
              <p className="m-0 ml-[18px] text-xs whitespace-nowrap text-muted-foreground tabular-nums">{reading ? format(reading.value, reading) : ""}</p>
            </motion.div>
          ) : null}
          {empty ? (
            <p data-slot="waffle-chart-message" className={cn("m-0 grid min-h-40 place-items-center text-sm text-muted-foreground", classNames?.message)}>
              {emptyLabel}
            </p>
          ) : null}
        </div>
        {legend && !empty ? (
          <ul data-slot="waffle-chart-legend" className={cn("m-0 grid min-w-0 list-none grid-cols-1 gap-0.5 p-0", classNames?.legend)} aria-label={`${label} categories`} onPointerLeave={() => setPreview(null)}>
            {data.map((item) => (
              <li key={item.key}>
                <button
                  type="button"
                  data-slot="waffle-chart-item"
                  className={cn(
                    "grid min-h-9 w-full grid-cols-[10px_minmax(0,1fr)_auto] items-center gap-2.5 rounded-xl px-2.5 py-1 text-left text-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.98] motion-reduce:active:scale-100 data-[dim=true]:opacity-50 data-[on=true]:bg-muted data-[on=true]:text-foreground",
                    classNames?.item,
                  )}
                  aria-pressed={pinned === item.key}
                  data-on={active === item.key ? "true" : undefined}
                  data-dim={active !== null && active !== item.key ? "true" : undefined}
                  onClick={() => setPinned(pinned === item.key ? null : item.key)}
                  onPointerEnter={(event) => {
                    if (event.pointerType === "mouse") setPreview(item.key)
                  }}
                  onFocus={(event) => {
                    if (event.currentTarget.matches(":focus-visible")) setPreview(item.key)
                  }}
                  onBlur={() => setPreview(null)}
                >
                  <span
                    className={cn("size-2.5", shapeOf(item.key) === "framed" ? "bg-background shadow-[inset_0_0_0_2px_var(--cell)]" : "bg-[var(--cell)]", shapeClass(shapeOf(item.key)))}
                    style={{ "--cell": colorOf(item.key) } as CSSProperties}
                    aria-hidden="true"
                  />
                  <span className="min-w-0 truncate">{item.label}</span>
                  <span className="min-w-[3.2em] text-right text-base font-medium text-foreground tabular-nums">
                    <Rolling value={share(item)} decimals={decimals} reduced={reduced} />
                  </span>
                </button>
              </li>
            ))}
          </ul>
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
                <th scope="col">Category</th>
                <th scope="col">Value</th>
                <th scope="col">Share</th>
                <th scope="col">Cells</th>
              </tr>
            </thead>
            <tbody>
              {data.map((item, index) => (
                <tr key={item.key}>
                  <th scope="row">{item.label}</th>
                  <td>{format(item.value, item)}</td>
                  <td>{share(item).toFixed(decimals)}%</td>
                  <td>{counts[index]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </figure>
  )
}
