"use client"

/** Adapted from Arc UI (MIT). */

import { useEffect, useImperativeHandle, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type KeyboardEvent, type PointerEvent, type Ref } from "react"
import { AnimatePresence, animate, motion, useInView, useMotionValue, useReducedMotion, useSpring } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface TreemapNode {
  /** Stable identity, unique in the tree. A tile that survives a data change morphs to its new size. */
  id: string
  label: string
  /** Leaf size. A branch size is the sum of its children. */
  value?: number
  /** Optional second measure for shading, such as growth. A branch uses the size-weighted mean of its children. */
  color?: number
  children?: TreemapNode[]
}

/** A hierarchy of parts, such as revenue by region, when sizes matter more than exact comparisons. */
export interface TreemapProps {
  /** The root. Its label names the whole in the first breadcrumb. */
  data: TreemapNode
  /** What the whole is. Names the chart for assistive technology. */
  label: string
  formatValue?: (value: number) => string
  /** Names the shading measure in the tooltip and scale. Leave it out to draw every tile at one depth. */
  colorLabel?: string
  formatColor?: (value: number) => string
  /** Range of the color measure. Defaults to the range of the leaves. */
  colorDomain?: [number, number]
  /** Controlled id of the node that fills the view. */
  focus?: string
  defaultFocus?: string
  onFocusChange?: (id: string) => void
  /** Height of the tiles in pixels. */
  height?: number
  emptyLabel?: string
  ref?: Ref<HTMLElement>
  className?: string
  classNames?: TreemapClassNames
}

export type TreemapClassNames = {
  root?: string
  bar?: string
  crumbs?: string
  stage?: string
  tile?: string
  tooltip?: string
  scale?: string
  message?: string
}

type Rect = { x: number; y: number; w: number; h: number }
type Flat = { id: string; label: string; value: number; color: number | null; depth: number; parent: string | null; children: string[]; path: string[] }
type Drawn = Rect & { o: number }

const physical = ({ visualDuration, bounce }: { visualDuration: number; bounce: number }, restDelta = 0.0005) => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring" as const, stiffness: root * root, damping: 2 * (1 - bounce) * root, restDelta, restSpeed: restDelta * 2 }
}
const zoom = physical({ visualDuration: 0.62, bounce: 0.06 })
const reveal = physical({ visualDuration: 0.9, bounce: 0 })
const glide = physical({ visualDuration: motionPresets.spring.snappy.visualDuration, bounce: motionPresets.spring.snappy.bounce }, 0.01)
const follow = { stiffness: glide.stiffness, damping: glide.damping, restDelta: 0.01 }
const CHARTS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"]
const hueOf = (index: number) => (index < 0 ? CHARTS[0] : index < CHARTS.length ? CHARTS[index] : "currentColor")
const GAP = 2
const PAD = 3
const HEADER = 22
const TIP = 14
const STEPS = 5
const grouped = new Intl.NumberFormat("en-US", { maximumFractionDigits: 1 })
const percent = new Intl.NumberFormat("en-US", { style: "percent", maximumFractionDigits: 1 })
const clamp = (value: number, low: number, high: number) => Math.min(high, Math.max(low, value))
const mix = (a: number, b: number, t: number) => a + (b - a) * t
const inset = (rect: Rect, top: number, side: number): Rect => ({ x: rect.x + side, y: rect.y + top, w: Math.max(0, rect.w - side * 2), h: Math.max(0, rect.h - top - side) })

function flatten(root: TreemapNode) {
  const flat = new Map<string, Flat>()
  const visit = (node: TreemapNode, depth: number, parent: string | null, path: string[]): { value: number; weighted: number; colored: number } => {
    const kids = node.children ?? []
    let value = 0
    let weighted = 0
    let colored = 0
    if (kids.length) {
      for (const kid of kids) {
        const result = visit(kid, depth + 1, node.id, depth === 0 ? [] : [...path, node.label])
        value += result.value
        weighted += result.weighted
        colored += result.colored
      }
    } else {
      value = Math.max(0, node.value ?? 0)
      if (node.color !== undefined && Number.isFinite(node.color)) {
        weighted = node.color * value
        colored = value
      }
    }
    flat.set(node.id, {
      id: node.id,
      label: node.label,
      value,
      color: colored ? weighted / colored : null,
      depth,
      parent,
      children: kids.map((kid) => kid.id),
      path: depth === 0 ? [node.label] : [...path, node.label],
    })
    return { value, weighted, colored }
  }
  visit(root, 0, null, [])
  return flat
}

function squarify(items: { id: string; value: number }[], rect: Rect, out: Map<string, Rect>) {
  const list = items.filter((item) => item.value > 0).sort((a, b) => b.value - a.value)
  const total = list.reduce((sum, item) => sum + item.value, 0)
  if (!total || rect.w <= 0 || rect.h <= 0) {
    for (const item of items) out.set(item.id, { x: rect.x, y: rect.y, w: 0, h: 0 })
    return
  }
  const scale = (rect.w * rect.h) / total
  let { x, y, w, h } = rect
  let i = 0
  const worst = (row: number[], side: number) => {
    const sum = row.reduce((a, b) => a + b, 0)
    const max = Math.max(...row)
    const min = Math.min(...row)
    return Math.max((side * side * max) / (sum * sum), (sum * sum) / (side * side * min))
  }
  while (i < list.length) {
    const side = Math.min(w, h)
    const row: number[] = [list[i].value * scale]
    let j = i + 1
    while (j < list.length) {
      const next = [...row, list[j].value * scale]
      if (worst(next, side) > worst(row, side)) break
      row.push(list[j].value * scale)
      j++
    }
    const sum = row.reduce((a, b) => a + b, 0)
    if (w >= h) {
      const column = sum / h
      let cy = y
      for (let k = i; k < j; k++) {
        const tile = (list[k].value * scale) / column
        out.set(list[k].id, { x, y: cy, w: column, h: tile })
        cy += tile
      }
      x += column
      w -= column
    } else {
      const rowHeight = sum / w
      let cx = x
      for (let k = i; k < j; k++) {
        const tile = (list[k].value * scale) / rowHeight
        out.set(list[k].id, { x: cx, y, w: tile, h: rowHeight })
        cx += tile
      }
      y += rowHeight
      h -= rowHeight
    }
    i = j
  }
  for (const item of items) if (!out.has(item.id)) out.set(item.id, { x: rect.x, y: rect.y, w: 0, h: 0 })
}

function layoutFrom(flat: Map<string, Flat>, focus: string, view: Rect) {
  const out = new Map<string, Rect>()
  const nest = (id: string, rect: Rect, top: boolean) => {
    const node = flat.get(id)!
    if (!node.children.length) return
    const room = top ? rect : inset(rect, rect.h > 48 && rect.w > 64 ? HEADER : PAD, PAD)
    const placed = new Map<string, Rect>()
    squarify(
      node.children.map((child) => ({ id: child, value: flat.get(child)!.value })),
      room,
      placed,
    )
    for (const [child, placedRect] of placed) {
      const gapped = { x: placedRect.x + GAP / 2, y: placedRect.y + GAP / 2, w: Math.max(0, placedRect.w - GAP), h: Math.max(0, placedRect.h - GAP) }
      out.set(child, gapped)
      nest(child, gapped, false)
    }
  }
  nest(focus, view, true)
  return out
}

const carry = (rect: Rect, from: Rect, to: Rect): Rect => {
  const sx = to.w / (from.w || 1)
  const sy = to.h / (from.h || 1)
  return { x: to.x + (rect.x - from.x) * sx, y: to.y + (rect.y - from.y) * sy, w: rect.w * sx, h: rect.h * sy }
}

const subscribeNothing = () => () => {}
function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false)
  return !!useReducedMotion() && hydrated
}

export function Treemap({
  data,
  label,
  formatValue = (value) => grouped.format(value),
  colorLabel,
  formatColor = (value) => grouped.format(value),
  colorDomain,
  focus,
  defaultFocus,
  onFocusChange,
  height = 420,
  emptyLabel = "No data yet",
  ref,
  className,
  classNames,
}: TreemapProps) {
  const reduced = useReducedMotionSafe()
  const figure = useRef<HTMLElement>(null)
  const stage = useRef<HTMLDivElement>(null)
  const tip = useRef<HTMLDivElement>(null)
  const tiles = useRef(new Map<string, HTMLDivElement>())
  useImperativeHandle(ref, () => figure.current as HTMLElement)
  const inView = useInView(figure, { once: true, amount: 0.25 })

  const flat = useMemo(() => flatten(data), [data])
  const root = flat.get(data.id)!
  const nodes = useMemo(() => [...flat.values()].filter((node) => node.depth > 0), [flat])
  const [ownFocus, setOwnFocus] = useState(defaultFocus ?? data.id)
  const wanted = flat.get(focus ?? ownFocus)
  const center = wanted && wanted.children.length ? wanted : root
  const zoomTo = (id: string) => {
    if (focus === undefined) setOwnFocus(id)
    onFocusChange?.(id)
  }
  const [active, setActive] = useState<string | null>(null)
  const [pointer, setPointer] = useState<{ x: number; y: number } | null>(null)

  const [width, setWidth] = useState(0)
  useLayoutEffect(() => {
    const node = stage.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => setWidth(node.clientWidth))
    observer.observe(node)
    setWidth(node.clientWidth)
    return () => observer.disconnect()
  }, [])
  const view = useMemo<Rect>(() => ({ x: 0, y: 0, w: width, h: height }), [width, height])
  const target = useMemo(() => layoutFrom(flat, center.id, view), [flat, center.id, view])
  const levelOf = (node: Flat) => node.depth - center.depth

  const leaves = nodes.filter((node) => !node.children.length && node.color !== null)
  const [lo, hi] = colorDomain ?? (leaves.length ? [Math.min(...leaves.map((node) => node.color!)), Math.max(...leaves.map((node) => node.color!))] : [0, 1])
  const colored = colorLabel !== undefined && leaves.length > 0
  const shade = (value: number | null) => {
    if (!colored || value === null) return 0.34
    const t = clamp((value - lo) / (hi - lo || 1), 0, 1)
    return 0.14 + (Math.round(t * (STEPS - 1)) / (STEPS - 1)) * 0.44
  }
  const branchOf = useMemo(() => {
    const map = new Map<string, number>()
    root.children.forEach((id, index) => {
      const walk = (at: string) => {
        map.set(at, index)
        flat.get(at)?.children.forEach(walk)
      }
      walk(id)
    })
    return map
  }, [flat, root])

  const drawn = useRef(new Map<string, Drawn>())
  const levels = useRef(new Map<string, number>())
  const lastFocus = useRef<{ id: string; layout: Map<string, Rect> } | null>(null)
  const paint = () => {
    for (const node of nodes) {
      const el = tiles.current.get(node.id)
      const drawnRect = drawn.current.get(node.id)
      if (!el) continue
      if (!drawnRect || drawnRect.o < 0.01 || drawnRect.w < 0.5 || drawnRect.h < 0.5) {
        el.style.visibility = "hidden"
        el.style.pointerEvents = "none"
        continue
      }
      el.style.visibility = "visible"
      el.style.transform = `translate3d(${drawnRect.x.toFixed(2)}px, ${drawnRect.y.toFixed(2)}px, 0)`
      el.style.width = `${drawnRect.w.toFixed(2)}px`
      el.style.height = `${drawnRect.h.toFixed(2)}px`
      el.style.opacity = drawnRect.o.toFixed(3)
      el.style.pointerEvents = drawnRect.o > 0.6 ? "auto" : "none"
      const level = levels.current.get(node.id) ?? 0
      el.dataset.level = String(level)
      const room = drawnRect.w > 64 && drawnRect.h > 38 ? (drawnRect.h > 54 ? "full" : "name") : "none"
      el.dataset.room = room
      const labelEl = el.querySelector<HTMLElement>("[data-part=label]")
      const valueEl = el.querySelector<HTMLElement>("[data-part=value]")
      const branch = node.children.length > 0 && level === 1
      if (labelEl) labelEl.style.opacity = room === "none" ? "0" : "1"
      if (valueEl) valueEl.style.opacity = room === "full" || (branch && room === "name") ? (branch ? "0.6" : "0.72") : "0"
      el.style.filter = el.dataset.dim === "true" ? "opacity(0.5)" : ""
    }
  }
  const paintRef = useRef(paint)
  useLayoutEffect(() => {
    paintRef.current = paint
  })

  const shown = (inView || reduced) && width > 0
  useEffect(() => {
    if (!shown) return
    const prev = lastFocus.current
    const isUnder = (id: string, ancestor: string) => {
      for (let at: Flat | undefined = flat.get(id); at; at = at.parent ? flat.get(at.parent) : undefined) if (at.id === ancestor) return true
      return false
    }
    const visible = (node: Flat) => {
      const level = node.depth - center.depth
      return level >= 1 && level <= 2 && isUnder(node.id, center.id)
    }
    const nextVisible = new Set(nodes.filter(visible).map((node) => node.id))
    const before = new Map(drawn.current)
    const wasVisible = new Set([...before].filter(([, rect]) => rect.o > 0.5).map(([id]) => id))
    let toOld: ((rect: Rect) => Rect) | null = null
    let toNew: ((rect: Rect) => Rect) | null = null
    if (prev && prev.id !== center.id && before.size) {
      if (isUnder(center.id, prev.id)) {
        const inOld = prev.layout.get(center.id)
        if (inOld) {
          toOld = (rect) => carry(rect, view, inOld)
          toNew = (rect) => carry(rect, inOld, view)
        }
      } else if (isUnder(prev.id, center.id)) {
        const inNew = target.get(prev.id)
        if (inNew) {
          toOld = (rect) => carry(rect, inNew, view)
          toNew = (rect) => carry(rect, view, inNew)
        }
      }
    }
    const from = new Map<string, Drawn>()
    const to = new Map<string, Drawn>()
    const first = !before.size
    for (const node of nodes) {
      const goal = target.get(node.id)
      const now = before.get(node.id)
      const inNext = nextVisible.has(node.id)
      const inPrev = wasVisible.has(node.id)
      if (inNext && goal) {
        to.set(node.id, { ...goal, o: 1 })
        if (inPrev && now) from.set(node.id, now)
        else if (first) from.set(node.id, { x: goal.x + goal.w / 2, y: goal.y + goal.h / 2, w: 0, h: 0, o: 0 })
        else from.set(node.id, { ...(toOld ? toOld(goal) : goal), o: 0 })
        levels.current.set(node.id, node.depth - center.depth)
      } else if (inPrev && now) {
        from.set(node.id, now)
        to.set(node.id, { ...(toNew ? toNew(now) : now), o: 0 })
      }
    }
    for (const node of nodes) if (!from.has(node.id)) drawn.current.set(node.id, { x: 0, y: 0, w: 0, h: 0, o: 0 })
    lastFocus.current = { id: center.id, layout: target }
    const finish = () => {
      for (const [id, rect] of to) drawn.current.set(id, rect)
      paintRef.current()
    }
    if (reduced) {
      finish()
      return
    }
    const controls = animate(0, 1, {
      ...(first ? reveal : zoom),
      onUpdate: (t) => {
        for (const [id, start] of from) {
          const end = to.get(id)!
          const local = first ? clamp((t - Math.min(0.3, (1 - (end.w * end.h) / (view.w * view.h || 1)) * 0.3)) / 0.7, 0, 1) : t
          drawn.current.set(id, { x: mix(start.x, end.x, local), y: mix(start.y, end.y, local), w: mix(start.w, end.w, local), h: mix(start.h, end.h, local), o: mix(start.o, end.o, local) })
        }
        paintRef.current()
      },
      onComplete: finish,
    })
    return () => controls.stop()
  }, [shown, target, reduced, flat, center, nodes, view])
  useLayoutEffect(() => {
    paintRef.current()
  })

  const activeNode = active ? (flat.get(active) ?? null) : null
  const parentOf = (node: Flat) => (node.parent ? flat.get(node.parent)! : node)
  const share = (node: Flat, of: Flat) => (of.value ? node.value / of.value : 0)

  const tipX = useMotionValue(0)
  const tipY = useMotionValue(0)
  const tipSpringX = useSpring(tipX, follow)
  const tipSpringY = useSpring(tipY, follow)
  const wasOn = useRef(false)
  useLayoutEffect(() => {
    const bubble = tip.current
    if (!bubble || !activeNode || !width) {
      wasOn.current = false
      return
    }
    const rect = target.get(activeNode.id)
    const ax = pointer?.x ?? (rect ? rect.x + rect.w / 2 : 0)
    const ay = pointer?.y ?? (rect ? rect.y + Math.min(rect.h / 2, 28) : 0)
    const tw = bubble.offsetWidth
    const th = bubble.offsetHeight
    let left = ax + TIP
    if (left + tw > width) left = ax - TIP - tw
    let top = ay + TIP
    if (top + th > height) top = ay - TIP - th
    tipX.set(clamp(left, 0, Math.max(0, width - tw)))
    tipY.set(clamp(top, 0, Math.max(0, height - th)))
    if (!wasOn.current || reduced) {
      tipSpringX.jump(tipX.get())
      tipSpringY.jump(tipY.get())
    }
    wasOn.current = true
  })

  const topTiles = center.children.map((id) => flat.get(id)!).filter((node) => node.value > 0)
  const topOf = (node: Flat | null) => {
    let at = node
    while (at && at.parent && at.parent !== center.id) at = flat.get(at.parent) ?? null
    return at && at.parent === center.id ? at : null
  }
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const current = topOf(activeNode)
    const dirs: Record<string, [number, number]> = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }
    if (event.key in dirs) {
      event.preventDefault()
      setPointer(null)
      if (!current) {
        setActive(topTiles[0]?.id ?? null)
        return
      }
      const [dx, dy] = dirs[event.key]
      const origin = target.get(current.id)!
      const ox = origin.x + origin.w / 2
      const oy = origin.y + origin.h / 2
      let best: Flat | null = null
      let score = Infinity
      for (const node of topTiles) {
        if (node.id === current.id) continue
        const rect = target.get(node.id)
        if (!rect) continue
        const vx = rect.x + rect.w / 2 - ox
        const vy = rect.y + rect.h / 2 - oy
        const along = vx * dx + vy * dy
        const across = Math.abs(vx * dy - vy * dx)
        if (along <= 1) continue
        const next = along + across * 1.5
        if (next < score) {
          score = next
          best = node
        }
      }
      if (best) setActive(best.id)
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault()
      setPointer(null)
      setActive((event.key === "Home" ? topTiles[0] : topTiles[topTiles.length - 1])?.id ?? null)
    } else if (event.key === "Enter" || event.key === " ") {
      if (current?.children.length) {
        event.preventDefault()
        zoomTo(current.id)
        setActive(current.children[0])
      }
    } else if (event.key === "Escape" || event.key === "Backspace") {
      if (center.parent) {
        event.preventDefault()
        zoomTo(center.parent)
        setActive(center.id)
      } else if (active) {
        event.preventDefault()
        setActive(null)
      }
    }
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>, id: string) => {
    if (event.pointerType !== "mouse") return
    const rect = stage.current?.getBoundingClientRect()
    if (rect) setPointer({ x: event.clientX - rect.left, y: event.clientY - rect.top })
    setActive(id)
  }
  const onTileClick = (node: Flat) => {
    const top = topOf(node)
    if (top?.children.length) zoomTo(top.id)
    else if (!activeNode || activeNode.id !== node.id) setActive(node.id)
  }

  const trail: Flat[] = []
  for (let at: Flat | undefined = center; at; at = at.parent ? flat.get(at.parent) : undefined) trail.unshift(at)
  const empty = !root.value
  const describe = (node: Flat) => `${node.path.join(", ")}, ${formatValue(node.value)}, ${percent.format(share(node, parentOf(node)))} of ${parentOf(node).label}${colored && node.color !== null ? `, ${colorLabel} ${formatColor(node.color)}` : ""}`
  const focusTop = topOf(activeNode)

  return (
    <figure ref={figure} data-slot="treemap" aria-label={label} className={cn("relative m-0 grid min-w-0 gap-3 text-foreground", className, classNames?.root)}>
      <div data-slot="treemap-bar" className={cn("flex min-w-0 items-center justify-between gap-3", classNames?.bar)}>
        <nav data-slot="treemap-crumbs" className={cn("min-w-0", classNames?.crumbs)} aria-label={`${label} path`}>
          <ol className="m-0 flex min-h-8 min-w-0 list-none flex-wrap items-center p-0">
            <AnimatePresence initial={false} mode="popLayout">
              {trail.map((node, index) => (
                <motion.li
                  key={node.id}
                  className="inline-flex min-w-0 items-center"
                  layout={reduced ? false : "position"}
                  initial={{ opacity: 0, x: reduced ? 0 : -6, filter: reduced ? "none" : `blur(${motionPresets.blur.subtle}px)` }}
                  animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, x: reduced ? 0 : -6, transition: { duration: motionPresets.duration.instant } }}
                  transition={{ ...motionPresets.spring.smooth }}
                >
                  {index > 0 ? (
                    <span className="px-1 text-sm text-muted-foreground" aria-hidden="true">
                      /
                    </span>
                  ) : null}
                  {index < trail.length - 1 ? (
                    <button
                      type="button"
                      className="max-w-full min-h-8 min-w-0 truncate rounded-md px-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none active:scale-[0.97] motion-reduce:active:scale-100"
                      onClick={() => {
                        zoomTo(node.id)
                        setActive(null)
                      }}
                    >
                      {node.label}
                    </button>
                  ) : (
                    <span className="max-w-full min-w-0 truncate px-1 text-sm font-medium" aria-current="location">
                      {node.label}
                    </span>
                  )}
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>
        </nav>
        <p className="relative m-0 shrink-0 overflow-hidden text-sm font-medium tabular-nums">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={formatValue(center.value)}
              className="block"
              initial={{ opacity: 0, y: reduced ? 0 : 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: reduced ? 0 : -6 }}
              transition={{ duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }}
            >
              {formatValue(center.value)}
            </motion.span>
          </AnimatePresence>
        </p>
      </div>
      <div
        ref={stage}
        data-slot="treemap-stage"
        className={cn("group/stage relative min-w-0 overflow-hidden rounded-xl outline-none select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", classNames?.stage)}
        style={{ height }}
        data-active={activeNode ? "true" : undefined}
        role="group"
        tabIndex={empty ? -1 : 0}
        aria-roledescription="treemap"
        aria-label={`${label}, ${center.label}. Arrow keys move between tiles, Enter zooms in, Escape zooms out.`}
        onKeyDown={onKeyDown}
        onBlur={() => setActive(null)}
        onPointerLeave={() => {
          setActive(null)
          setPointer(null)
        }}
      >
        {nodes.map((node) => {
          const top = topOf(node)
          const hue = hueOf(branchOf.get(node.id) ?? -1)
          const branch = node.children.length > 0
          const level = levelOf(node)
          return (
            <div
              key={node.id}
              ref={(element) => {
                if (element) tiles.current.set(node.id, element)
                else tiles.current.delete(node.id)
              }}
              data-slot="treemap-tile"
              className={cn(
                "absolute top-0 left-0 flex cursor-pointer flex-col gap-px overflow-hidden rounded-md p-1.5 text-foreground",
                branch && level === 1 && "cursor-zoom-in flex-row items-baseline justify-between gap-2 rounded-lg px-2 py-0.5",
                level === 2 && "p-1",
                classNames?.tile,
              )}
              data-branch={branch ? "true" : undefined}
              data-level={String(Math.max(0, level))}
              data-active={active === node.id ? "true" : undefined}
              data-lineage={focusTop?.id === node.id && active !== node.id ? "true" : undefined}
              data-dim={focusTop !== null && top !== null && focusTop.id !== top.id ? "true" : undefined}
              style={
                {
                  zIndex: node.depth,
                  "--hue": hue,
                  boxShadow: active === node.id ? "inset 0 0 0 2px currentColor" : focusTop?.id === node.id && active !== node.id ? "inset 0 0 0 1px var(--hue)" : undefined,
                } as CSSProperties
              }
              onPointerMove={(event) => {
                event.stopPropagation()
                onPointerMove(event, node.id)
              }}
              onClick={(event) => {
                event.stopPropagation()
                onTileClick(node)
              }}
            >
              <span aria-hidden="true" className="pointer-events-none absolute inset-0 rounded-[inherit]" style={{ backgroundColor: hue, opacity: branch && level === 1 ? 0.12 : shade(node.color) }} />
              <span data-part="label" className="relative min-w-0 truncate text-xs font-medium opacity-0">
                {node.label}
              </span>
              <span data-part="value" className="relative min-w-0 shrink-0 truncate text-xs text-muted-foreground tabular-nums opacity-0">
                {formatValue(node.value)}
              </span>
            </div>
          )
        })}
        {empty ? (
          <p data-slot="treemap-message" className={cn("pointer-events-none absolute inset-0 m-0 grid place-items-center text-sm text-muted-foreground", classNames?.message)}>
            {emptyLabel}
          </p>
        ) : null}
        <motion.div
          ref={tip}
          data-slot="treemap-tooltip"
          className={cn(
            "pointer-events-none absolute top-0 left-0 z-50 grid w-max max-w-full gap-0.5 rounded-xl border border-border bg-popover p-2.5 text-popover-foreground opacity-0 shadow-md scale-95 transition-[opacity,scale] duration-150 group-data-[active=true]/stage:scale-100 group-data-[active=true]/stage:opacity-100 motion-reduce:transition-none",
            classNames?.tooltip,
          )}
          style={{ x: reduced ? tipX : tipSpringX, y: reduced ? tipY : tipSpringY }}
          aria-hidden="true"
        >
          {activeNode ? (
            <>
              <p className="m-0 truncate text-xs text-muted-foreground">{activeNode.path.slice(0, -1).join(" / ") || root.label}</p>
              <p className="m-0 flex items-baseline justify-between gap-3 text-sm">
                <span className="min-w-0 truncate">{activeNode.label}</span>
                <span className="shrink-0 font-medium tabular-nums">{formatValue(activeNode.value)}</span>
              </p>
              <p className="m-0 text-xs text-muted-foreground tabular-nums">
                {percent.format(share(activeNode, parentOf(activeNode)))} of {parentOf(activeNode).label}
              </p>
              {colored && activeNode.color !== null ? (
                <p className="m-0 text-xs text-muted-foreground tabular-nums">
                  {colorLabel} {formatColor(activeNode.color)}
                </p>
              ) : null}
            </>
          ) : null}
        </motion.div>
      </div>
      {colored ? (
        <div data-slot="treemap-scale" className={cn("flex min-w-0 flex-wrap items-center gap-2 text-xs text-muted-foreground tabular-nums", classNames?.scale)} aria-hidden="true">
          <span className="mr-1 text-foreground">{colorLabel}</span>
          <span>{formatColor(lo)}</span>
          <span className="inline-flex gap-0.5">
            {Array.from({ length: STEPS }, (_, index) => (
              <span
                key={index}
                className="h-2.5 w-4 rounded-sm"
                style={{ backgroundColor: center.depth === 0 ? "currentColor" : hueOf(branchOf.get(center.id) ?? -1), opacity: 0.14 + (index / (STEPS - 1)) * 0.44 }}
              />
            ))}
          </span>
          <span>{formatColor(hi)}</span>
        </div>
      ) : null}
      <p className="sr-only" aria-live="polite" aria-atomic="true">
        {activeNode ? describe(activeNode) : `${center.label}, ${formatValue(center.value)}`}
      </p>
      {!empty ? (
        <div className="sr-only">
          <table>
            <caption>{label}</caption>
            <thead>
              <tr>
                <th scope="col">Path</th>
                <th scope="col">Value</th>
                <th scope="col">Share of parent</th>
                {colored ? <th scope="col">{colorLabel}</th> : null}
              </tr>
            </thead>
            <tbody>
              {nodes.map((node) => (
                <tr key={node.id}>
                  <th scope="row">{node.path.join(" / ")}</th>
                  <td>{formatValue(node.value)}</td>
                  <td>{percent.format(share(node, parentOf(node)))}</td>
                  {colored ? <td>{node.color === null ? "" : formatColor(node.color)}</td> : null}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </figure>
  )
}
