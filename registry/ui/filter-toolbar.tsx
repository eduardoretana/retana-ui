"use client"

/** Adapted from Arc UI (MIT). */

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import type { FocusEvent, KeyboardEvent, MouseEvent, ReactNode, RefObject } from "react"
import { Check, ChevronLeft, ChevronRight, Plus, X } from "lucide-react"
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, useTransform, type HTMLMotionProps, type MotionValue, type Variants } from "motion/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface FilterChip {
  id: string
  label: string
  value?: string
}
/** One value a field can take. `hint` sits at the end of the row, for example a count. */
export interface FilterOption {
  value: string
  label?: string
  hint?: string | number
  icon?: ReactNode
}
export interface FilterField {
  id: string
  label: string
  icon?: ReactNode
  options: (string | FilterOption)[]
}
export interface FilterMenuProps {
  fields: FilterField[]
  /** Receives a chip whose id is the field id, so a second pick for a field replaces the first. */
  onSelect: (filter: FilterChip, field: FilterField) => void
  /** Applied filters. Each field shows its current value and the value step marks it. */
  active?: FilterChip[]
  label?: string
  /** The trigger edge the panel lines up with. It flips or shifts when the viewport, or a clipping ancestor, has no room. */
  align?: "start" | "end"
  className?: string
  classNames?: FilterMenuClassNames
}
export interface FilterToolbarProps {
  filters: FilterChip[]
  onRemove: (id: string) => void
  onClearAll?: () => void
  children?: ReactNode
  /** Replaces the chip row. Use it for a count-tab bar. */
  leading?: ReactNode
  /** Outer shape. panel is the default bordered card. */
  variant?: "panel" | "pill"
  emptyLabel?: string
  label?: string
  /** Adds an Add filter trigger that morphs into a two step field and value menu. */
  addFilter?: { fields: FilterField[]; onAdd: (filter: FilterChip, field: FilterField) => void; label?: string; align?: "start" | "end" }
  className?: string
  classNames?: FilterToolbarClassNames
}

export type FilterMenuClassNames = {
  root?: string
  trigger?: string
  panel?: string
  item?: string
}

export type FilterToolbarClassNames = {
  root?: string
  frame?: string
  chips?: string
  chip?: string
  actions?: string
  clear?: string
  menu?: string
}

const enter = { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] as const }
const leave = { duration: motionPresets.duration.instant, ease: [...motionPresets.ease.standard] as const }
const still = { duration: 0 }
const fade = { duration: motionPresets.duration.instant, ease: "linear" as const }
const blur = (px: number) => `blur(${px}px)`
const clamp = (value: number) => Math.min(1, Math.max(0, value))
const toOption = (entry: string | FilterOption): FilterOption => (typeof entry === "string" ? { value: entry } : entry)
const optionText = (entry: FilterOption) => entry.label ?? entry.value
const textMotion = (reduced: boolean) => ({
  initial: reduced ? { opacity: 0 } : { opacity: 0, y: "0.3em", filter: blur(motionPresets.blur.soft) },
  animate: { opacity: 1, y: 0, filter: blur(0) },
  exit: reduced ? { opacity: 0, transition: still } : { opacity: 0, y: "-0.3em", filter: blur(motionPresets.blur.subtle), transition: leave },
  transition: reduced ? fade : enter,
})

function MorphText({ text }: { text: string }) {
  const reduced = useReducedMotion() ?? false
  const measure = useRef<HTMLSpanElement>(null)
  const width = useMotionValue<number | "auto">("auto")
  useLayoutEffect(() => {
    const node = measure.current
    if (!node || typeof ResizeObserver === "undefined") return
    let last: string | null = null
    const observer = new ResizeObserver(([entry]) => {
      const next = Math.ceil(entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth)
      const changed = last !== null && last !== node.textContent
      last = node.textContent
      if (changed && !reduced) animate(width as MotionValue<number>, next, motionPresets.spring.morph)
      else width.jump(next)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [reduced, width])
  return (
    <motion.span className="relative inline-flex overflow-x-clip overflow-y-visible align-bottom whitespace-nowrap" style={{ width }}>
      <span ref={measure} className="pointer-events-none absolute top-0 left-0 whitespace-nowrap invisible" aria-hidden="true">{text}</span>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span key={text} className="inline-block shrink-0 whitespace-nowrap" {...textMotion(reduced)}>{text}</motion.span>
      </AnimatePresence>
    </motion.span>
  )
}

function useFollowHeight(list: RefObject<HTMLElement | null>, armed: RefObject<number>, reduced: boolean) {
  const height = useMotionValue<number | "auto">("auto")
  useLayoutEffect(() => {
    const node = list.current
    if (!node || typeof ResizeObserver === "undefined") return
    let known = false
    const observer = new ResizeObserver(() => {
      const next = node.offsetHeight
      if (!known || reduced || performance.now() > armed.current) {
        known = true
        height.jump(next)
        return
      }
      animate(height as MotionValue<number>, next, motionPresets.spring.smooth)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [armed, height, list, reduced])
  return height
}

function useReflowGlide(list: RefObject<HTMLElement | null>, armed: RefObject<number>, reduced: boolean) {
  useLayoutEffect(() => {
    const node = list.current
    if (!node || typeof ResizeObserver === "undefined") return
    type Track = { x: number; y: number; dx: number; dy: number; stop?: () => void }
    const tracks = new Map<Element, Track>()
    const check = () => {
      const now = performance.now()
      for (const child of Array.from(node.children) as HTMLElement[]) {
        const x = child.offsetLeft
        const y = child.offsetTop
        const track = tracks.get(child)
        if (!track) {
          tracks.set(child, { x, y, dx: 0, dy: 0 })
          continue
        }
        const jx = track.x - x
        const jy = track.y - y
        track.x = x
        track.y = y
        if (reduced || now > armed.current || (Math.abs(jy) < 1 && Math.abs(jx) < 40)) continue
        track.stop?.()
        const fromX = track.dx + jx
        const fromY = track.dy + jy
        const apply = (progress: number) => {
          track.dx = fromX * (1 - progress)
          track.dy = fromY * (1 - progress)
          child.style.translate = progress >= 1 ? "" : `${track.dx}px ${track.dy}px`
        }
        apply(0)
        track.stop = animate(0, 1, { ...motionPresets.spring.smooth, onUpdate: apply, onComplete: () => apply(1) }).stop
      }
      for (const child of tracks.keys()) if (child.parentElement !== node) tracks.delete(child)
    }
    const observer = new ResizeObserver(check)
    const watch = () => {
      for (const child of Array.from(node.children)) observer.observe(child)
    }
    const mutations = new MutationObserver(() => {
      watch()
      check()
    })
    observer.observe(node)
    watch()
    mutations.observe(node, { childList: true })
    return () => {
      observer.disconnect()
      mutations.disconnect()
      for (const track of tracks.values()) track.stop?.()
    }
  }, [armed, list, reduced])
}

function describeChange(before: FilterChip[], after: FilterChip[]) {
  const text = (filter: FilterChip) => (filter.value ? `${filter.label}: ${filter.value}` : filter.label)
  const removed = before.filter((old) => !after.some((filter) => filter.id === old.id))
  if (!after.length && removed.length > 1) return "All filters cleared"
  const added = after.filter((filter) => !before.some((old) => old.id === filter.id))
  const changed = after.filter((filter) => before.some((old) => old.id === filter.id && old.value !== filter.value))
  return [...added.map((filter) => `Added ${text(filter)}`), ...changed.map((filter) => `${filter.label} changed to ${filter.value ?? "any"}`), ...removed.map((filter) => `Removed ${text(filter)}`)].join(". ")
}

type Row = { key: string; label: string; icon?: ReactNode; meta?: ReactNode; checked?: boolean; drill?: boolean }
type FocusRequest = "first" | "last" | "checked" | "panel" | { key: string }

function MenuList({ rows, labelledBy, onChoose, onBack, onLeave, radio, className }: { rows: Row[]; labelledBy: string; onChoose: (row: Row, keyboard: boolean) => void; onBack?: (keyboard: boolean) => void; onLeave: () => void; radio?: boolean; className?: string }) {
  const reduced = useReducedMotion() ?? false
  const present = useIsPresent()
  const list = useRef<HTMLDivElement>(null)
  const pointer = useRef(false)
  const typed = useRef({ text: "", at: 0 })
  const [current, setCurrent] = useState(() => Math.max(0, rows.findIndex((row) => row.checked)))
  const [highlight, setHighlight] = useState<{ top: number; height: number; glide: boolean; ring: boolean; shown: boolean } | null>(null)
  const items = () => Array.from(list.current?.querySelectorAll<HTMLElement>("[data-row]") ?? [])
  const move = (item: HTMLElement | undefined) => {
    const node = list.current
    if (!item || !node) return
    item.focus({ preventScroll: true })
    if (item.offsetTop < node.scrollTop) node.scrollTop = item.offsetTop
    else if (item.offsetTop + item.offsetHeight > node.scrollTop + node.clientHeight) node.scrollTop = item.offsetTop + item.offsetHeight - node.clientHeight
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const all = items()
    const index = all.indexOf(document.activeElement as HTMLElement)
    const go = (next: number) => {
      event.preventDefault()
      pointer.current = false
      move(all[next])
    }
    if (event.key === "ArrowDown") return go(index < 0 ? 0 : (index + 1) % all.length)
    if (event.key === "ArrowUp") return go(index < 0 ? all.length - 1 : (index - 1 + all.length) % all.length)
    if (event.key === "Home") return go(0)
    if (event.key === "End") return go(all.length - 1)
    if (event.key === "ArrowRight" && index >= 0 && rows[index]?.drill) {
      event.preventDefault()
      onChoose(rows[index], true)
      return
    }
    if (event.key === "ArrowLeft" && onBack) {
      event.preventDefault()
      onBack(true)
      return
    }
    if (event.key.length === 1 && /\S/.test(event.key) && !event.metaKey && !event.ctrlKey && !event.altKey) {
      const now = performance.now()
      typed.current = { text: now - typed.current.at < 700 ? typed.current.text + event.key.toLowerCase() : event.key.toLowerCase(), at: now }
      const order = [...all.slice(index + (typed.current.text.length > 1 ? 0 : 1)), ...all.slice(0, index + (typed.current.text.length > 1 ? 0 : 1))]
      const match = order.find((item) => (item.dataset.text ?? "").toLowerCase().startsWith(typed.current.text))
      if (match) go(all.indexOf(match))
    }
  }
  function onFocus(event: FocusEvent<HTMLDivElement>) {
    const item = (event.target as HTMLElement).closest<HTMLElement>("[data-row]")
    if (!item) return
    setCurrent(items().indexOf(item))
    const glide = pointer.current && !reduced
    const ring = !pointer.current && item.matches(":focus-visible")
    setHighlight((previous) => ({ top: item.offsetTop, height: item.offsetHeight, glide: glide && !!previous?.shown, ring, shown: true }))
  }
  function onBlur(event: FocusEvent<HTMLDivElement>) {
    if (!list.current?.contains(event.relatedTarget as Node | null)) setHighlight((previous) => previous && { ...previous, glide: false, ring: false, shown: false })
  }
  return (
    <div
      ref={list}
      data-slot="filter-menu-list"
      className="relative grid max-h-[min(20rem,55vh)] overflow-y-auto overscroll-contain"
      role="menu"
      aria-labelledby={labelledBy}
      data-current={present ? "" : undefined}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
      onPointerLeave={() => {
        if (pointer.current && list.current?.contains(document.activeElement)) onLeave()
      }}
    >
      <motion.span
        className="pointer-events-none absolute inset-x-0 top-0 rounded-md bg-foreground/5 data-[ring]:ring-2 data-[ring]:ring-ring data-[ring]:outline-none"
        data-ring={highlight?.ring || undefined}
        aria-hidden="true"
        initial={false}
        animate={highlight ? { y: highlight.top, height: highlight.height, opacity: highlight.shown ? 1 : 0 } : { opacity: 0 }}
        transition={{ default: highlight?.glide ? motionPresets.spring.snappy : still, opacity: { duration: reduced ? 0 : 0.08 } }}
      />
      {rows.map((row, index) => (
        <button
          key={row.key}
          type="button"
          data-slot="filter-menu-item"
          className={cn("relative flex min-h-8 min-w-0 cursor-pointer items-center gap-2.5 rounded-md border-0 bg-transparent px-2.5 text-left text-sm text-foreground outline-none focus-visible:outline-none", className)}
          role={radio ? "menuitemradio" : "menuitem"}
          aria-checked={radio ? !!row.checked : undefined}
          tabIndex={index === current ? 0 : -1}
          data-row={row.key}
          data-text={row.label}
          onPointerMove={(event) => {
            pointer.current = true
            if (document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true })
          }}
          onClick={(event: MouseEvent<HTMLButtonElement>) => onChoose(row, event.detail === 0)}
        >
          {row.icon ? <span className="inline-flex min-w-4 shrink-0 items-center justify-center text-muted-foreground" aria-hidden="true">{row.icon}</span> : null}
          <span className="min-w-0 flex-1 truncate">{row.label}</span>
          {row.meta ? <span className="inline-flex max-w-[50%] min-w-0 shrink-0 items-center gap-1.5 text-xs text-muted-foreground tabular-nums">{row.meta}</span> : null}
        </button>
      ))}
    </div>
  )
}

type Phase = "closed" | "open" | "closing"

function roomFor(node: HTMLElement) {
  const room = { left: 0, top: 0, right: document.documentElement.clientWidth, bottom: window.innerHeight }
  for (let parent = node.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
    const style = getComputedStyle(parent)
    if (style.overflowX === "visible" && style.overflowY === "visible") continue
    const box = parent.getBoundingClientRect()
    if (style.overflowX !== "visible") {
      room.left = Math.max(room.left, box.left)
      room.right = Math.min(room.right, box.right)
    }
    if (style.overflowY !== "visible") {
      room.top = Math.max(room.top, box.top)
      room.bottom = Math.min(room.bottom, box.bottom)
    }
  }
  return room
}

/** An Add filter button that grows into its own menu: pick a field, then a value. The shape springs between the
 *  button and the panel, and the panel renders in place, so keep its ancestors free of overflow clipping. */
export function FilterMenu({ fields, onSelect, active = [], label = "Add filter", align = "end", className, classNames }: FilterMenuProps) {
  const reduced = useReducedMotion() ?? false
  const id = useId()
  const panelId = `${id}panel`
  const titleId = `${id}title`
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const phaseRef = useRef<Phase>("closed")
  const run = useRef(0)
  const focusNext = useRef<FocusRequest | null>(null)
  const [phase, setPhase] = useState<Phase>("closed")
  const [fieldId, setFieldId] = useState<string | null>(null)
  const [direction, setDirection] = useState(1)
  const [up, setUp] = useState(false)
  const [origin, setOrigin] = useState("100% 0")
  const width = useMotionValue<number | string>("100%")
  const height = useMotionValue<number | string>("100%")
  const left = useMotionValue(0)
  const target = useMotionValue(0)
  const panelX = useTransform(() => target.get() - left.get())
  const from = useMotionValue(0)
  const to = useMotionValue(0)
  const progress = useTransform(() => {
    const now = width.get()
    const start = from.get()
    const end = to.get()
    return typeof now !== "number" ? 0 : end > start ? clamp((now - start) / (end - start)) : 1
  })
  const faceOut = useTransform(() => clamp(progress.get() / 0.35))
  const contentIn = useTransform(() => clamp((progress.get() - 0.4) / 0.5))
  const faceStyle = {
    opacity: useTransform(() => 1 - faceOut.get()),
    scale: useTransform(() => 1 - faceOut.get() * 0.04),
    filter: useTransform(() => (faceOut.get() ? blur(faceOut.get() * motionPresets.blur.subtle) : "none")),
  }
  const contentStyle = {
    opacity: contentIn,
    transformOrigin: origin,
    scale: useTransform(() => 0.96 + contentIn.get() * 0.04),
    y: useTransform(() => (1 - contentIn.get()) * (up ? -6 : 6)),
    filter: useTransform(() => (contentIn.get() === 1 ? "none" : blur((1 - contentIn.get()) * motionPresets.blur.soft))),
  }
  const open = phase === "open"
  const field = fields.find((entry) => entry.id === fieldId) ?? null

  const openMenu = useCallback((focus: FocusRequest) => {
    const button = trigger.current
    const content = panel.current
    if (!button || !content) return
    const rect = button.getBoundingClientRect()
    const panelWidth = content.offsetWidth + 2
    const panelHeight = content.offsetHeight + 2
    const room = roomFor(root.current ?? button)
    const gutter = 16
    const min = room.left + gutter - rect.left
    const max = room.right - gutter - rect.left - panelWidth
    const end = rect.width - panelWidth
    let x = align === "end" ? (end >= min ? end : 0 <= max ? 0 : end) : 0 <= max ? 0 : end >= min ? end : 0
    x = Math.round(Math.min(Math.max(x, min), Math.max(min, max)))
    const below = room.bottom - rect.top
    const above = rect.bottom - room.top
    const nextUp = below < panelHeight + gutter && above > below
    if (phaseRef.current === "closed") {
      width.jump(rect.width)
      height.jump(rect.height)
      left.jump(0)
    }
    target.jump(x)
    from.jump(rect.width)
    to.jump(panelWidth)
    phaseRef.current = "open"
    run.current += 1
    focusNext.current = focus
    setPhase("open")
    setUp(nextUp)
    setFieldId(null)
    setDirection(-1)
    setOrigin(`${Math.round(rect.width / 2 - x)}px ${nextUp ? "100%" : "0"}`)
    const transition = reduced ? still : motionPresets.spring.morph
    animate(left, x, transition)
    animate(width as MotionValue<number>, panelWidth, transition)
    animate(height as MotionValue<number>, panelHeight, transition)
  }, [align, from, height, left, reduced, target, to, width])

  const closeMenu = useCallback((restore: false | "keyboard" | "pointer") => {
    const button = trigger.current
    if (phaseRef.current !== "open" || !button) return
    phaseRef.current = "closing"
    const token = (run.current += 1)
    setPhase("closing")
    if (restore) button.focus({ preventScroll: true, focusVisible: restore === "keyboard" } as FocusOptions)
    const transition = reduced ? still : motionPresets.spring.snappy
    animate(left, 0, transition)
    const rect = button.getBoundingClientRect()
    animate(height as MotionValue<number>, rect.height, transition)
    animate(width as MotionValue<number>, rect.width, {
      ...transition,
      onComplete: () => {
        if (token !== run.current) return
        phaseRef.current = "closed"
        width.jump("100%")
        height.jump("100%")
        setPhase("closed")
        setFieldId(null)
      },
    })
  }, [height, left, reduced, width])

  useLayoutEffect(() => {
    const content = panel.current
    if (!content || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      if (phaseRef.current !== "open") return
      animate(height as MotionValue<number>, content.offsetHeight + 2, reduced ? still : motionPresets.spring.smooth)
    })
    observer.observe(content)
    return () => observer.disconnect()
  }, [height, reduced])

  useLayoutEffect(() => {
    const request = focusNext.current
    const content = panel.current
    if (!request || !content || phase !== "open") return
    focusNext.current = null
    if (request === "panel") {
      content.focus({ preventScroll: true })
      return
    }
    const items = Array.from(content.querySelectorAll<HTMLElement>("[data-current] [data-row]"))
    const next = request === "first" ? items[0] : request === "last" ? items.at(-1) : request === "checked" ? items.find((item) => item.getAttribute("aria-checked") === "true") ?? items[0] : items.find((item) => item.dataset.row === request.key) ?? items[0]
    next?.focus({ preventScroll: true })
  }, [phase, fieldId])

  useEffect(() => {
    if (phase !== "open") return
    const onPointerDown = (event: PointerEvent) => {
      const node = root.current
      const hit = event.target as Element | null
      if (!node || (hit && node.contains(hit))) return
      closeMenu(false)
      if (!hit?.closest?.("button, a[href], input, select, textarea, [tabindex], [contenteditable]")) {
        window.setTimeout(() => {
          const focused = document.activeElement
          if (!focused || focused === document.body || node.contains(focused)) trigger.current?.focus({ preventScroll: true, focusVisible: false } as FocusOptions)
        }, 0)
      }
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [closeMenu, phase])

  function onPanelKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.defaultPrevented) return
    const items = Array.from(panel.current?.querySelectorAll<HTMLElement>("[data-current] [data-row]") ?? [])
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault()
      ;(event.key === "ArrowDown" ? items[0] : items.at(-1))?.focus({ preventScroll: true })
    }
    if (event.key === "ArrowLeft" && field) {
      event.preventDefault()
      goBack(true)
    }
  }
  function goBack(keyboard: boolean) {
    if (!field) return
    focusNext.current = keyboard ? { key: field.id } : "panel"
    setDirection(-1)
    setFieldId(null)
  }
  function chooseField(row: Row, keyboard: boolean) {
    focusNext.current = keyboard ? "checked" : "panel"
    setDirection(1)
    setFieldId(row.key)
  }
  function chooseValue(row: Row, keyboard: boolean) {
    if (!field) return
    onSelect({ id: field.id, label: field.label, value: row.label }, field)
    closeMenu(keyboard ? "keyboard" : "pointer")
  }

  const current = (entry: FilterField) => active.find((filter) => filter.id === entry.id)?.value
  const fieldRows: Row[] = fields.map((entry) => ({
    key: entry.id,
    label: entry.label,
    icon: entry.icon,
    drill: true,
    meta: (
      <>
        {current(entry) ? <span className="truncate">{current(entry)}</span> : null}
        <ChevronRight size={15} strokeWidth={1.8} aria-hidden="true" />
      </>
    ),
  }))
  const valueRows: Row[] = field
    ? field.options.map(toOption).map((entry) => {
        const text = optionText(entry)
        const checked = current(field) === text
        return {
          key: entry.value,
          label: text,
          icon: entry.icon,
          checked,
          meta: entry.hint != null || checked ? (
            <>
              {entry.hint != null ? <span className="min-w-[2ch] text-right">{entry.hint}</span> : null}
              <span className={cn("inline-flex w-[15px] text-foreground", checked ? "opacity-100" : "opacity-0")}><Check size={15} strokeWidth={2} aria-hidden="true" /></span>
            </>
          ) : null,
        }
      })
    : []
  const step: Variants = {
    enter: (dir: number) => (reduced ? { opacity: 0 } : { opacity: 0, x: dir * 18, filter: blur(motionPresets.blur.soft) }),
    center: { opacity: 1, x: 0, filter: blur(0), transition: reduced ? fade : { ...enter, x: motionPresets.spring.smooth } },
    exit: (dir: number) => (reduced ? { opacity: 0, transition: still } : { opacity: 0, x: dir * -18, filter: blur(motionPresets.blur.subtle), transition: leave }),
  }

  return (
    <div
      ref={root}
      data-slot="filter-menu"
      data-state={phase}
      data-y={up ? "up" : "down"}
      className={cn("group/menu relative isolate inline-flex shrink-0 data-[state=closing]:z-30 data-[state=open]:z-30", className, classNames?.root)}
      onKeyDown={(event) => {
        if (event.key === "Escape" && phaseRef.current === "open") {
          event.preventDefault()
          event.stopPropagation()
          closeMenu("keyboard")
        }
      }}
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null
        if (phaseRef.current === "open" && next && !root.current?.contains(next)) closeMenu(false)
      }}
    >
      <button
        ref={trigger}
        type="button"
        data-slot="filter-menu-trigger"
        data-filter-trigger=""
        className={cn("peer relative z-10 inline-flex min-h-8 cursor-pointer items-center border border-transparent bg-transparent px-3 text-sm font-medium whitespace-nowrap text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none group-data-[state=open]/menu:pointer-events-none", classNames?.trigger)}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls={panelId}
        tabIndex={open ? -1 : undefined}
        onClick={(event) => {
          if (phaseRef.current !== "open") openMenu(event.detail === 0 ? "first" : "panel")
        }}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault()
            openMenu(event.key === "ArrowDown" ? "first" : "last")
          }
        }}
      >
        <motion.span className="inline-flex items-center gap-2" style={faceStyle}>
          <Plus size={15} strokeWidth={1.8} aria-hidden="true" />
          {label}
        </motion.span>
      </button>
      <motion.div className="absolute top-0 z-0 box-border overflow-clip rounded-lg border border-border bg-card group-data-[state=closed]/menu:peer-hover:bg-muted group-data-[state=open]/menu:rounded-xl group-data-[state=open]/menu:bg-popover group-data-[state=open]/menu:shadow-lg group-data-[y=up]/menu:top-auto group-data-[y=up]/menu:bottom-0" style={{ left, width, height }}>
        <motion.div
          ref={panel}
          id={panelId}
          data-slot="filter-menu-panel"
          role="dialog"
          aria-labelledby={titleId}
          tabIndex={-1}
          inert={!open}
          className={cn("absolute top-0 left-0 w-[min(16rem,calc(100vw-2rem))] px-1.5 pt-0.5 pb-1.5 outline-none group-data-[state=closed]/menu:invisible group-data-[y=up]/menu:top-auto group-data-[y=up]/menu:bottom-0", classNames?.panel)}
          style={{ x: panelX }}
          onKeyDown={onPanelKeyDown}
        >
          <motion.div style={contentStyle}>
            <div className="flex h-8 items-center px-2 group-data-[y=up]/menu:mt-1">
              <AnimatePresence initial={false}>
                {field ? (
                  <motion.button
                    key="back"
                    type="button"
                    className="mr-0.5 -ml-1.5 grid size-7 shrink-0 place-items-center rounded-full border-0 bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                    aria-label="Back to fields"
                    onClick={(event) => goBack(event.detail === 0)}
                    initial={reduced ? { opacity: 0, width: 28, marginRight: 2 } : { opacity: 0, width: 0, marginRight: 0, scale: 0.6 }}
                    animate={{ opacity: 1, width: 28, marginRight: 2, scale: 1 }}
                    exit={reduced ? { opacity: 0, transition: still } : { opacity: 0, width: 0, marginRight: 0, scale: 0.6, transition: { ...motionPresets.spring.snappy, opacity: leave } }}
                    transition={reduced ? fade : { ...motionPresets.spring.snappy, opacity: enter }}
                  >
                    <ChevronLeft size={16} strokeWidth={1.8} aria-hidden="true" />
                  </motion.button>
                ) : null}
              </AnimatePresence>
              <span className="relative flex min-w-0 text-sm font-medium whitespace-nowrap text-foreground" id={titleId}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={field?.id ?? "fields"} className="block" {...textMotion(reduced)}>{field ? field.label : label}</motion.span>
                </AnimatePresence>
              </span>
            </div>
            <div className="relative mt-0.5">
              <AnimatePresence mode="popLayout" initial={false} custom={direction}>
                <motion.div key={field?.id ?? "fields"} className="w-full" custom={direction} variants={step} initial="enter" animate="center" exit="exit">
                  {field ? (
                    <MenuList rows={valueRows} labelledBy={titleId} radio className={classNames?.item} onChoose={chooseValue} onBack={goBack} onLeave={() => panel.current?.focus({ preventScroll: true })} />
                  ) : (
                    <MenuList rows={fieldRows} labelledBy={titleId} className={classNames?.item} onChoose={chooseField} onLeave={() => panel.current?.focus({ preventScroll: true })} />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}

export function FilterToolbar({ filters, onRemove, onClearAll, children, leading, variant = "panel", emptyLabel = "No filters applied", label = "Active filters", addFilter, className, classNames }: FilterToolbarProps) {
  const reduced = useReducedMotion() ?? false
  const root = useRef<HTMLDivElement>(null)
  const list = useRef<HTMLDivElement>(null)
  const armed = useRef(0)
  const pendingFocus = useRef<number | null>(null)
  const [seen, setSeen] = useState(filters)
  const [message, setMessage] = useState("")
  if (seen !== filters) {
    setSeen(filters)
    const next = describeChange(seen, filters)
    if (next) setMessage(next)
  }
  const signature = filters.map((filter) => `${filter.id}:${filter.value ?? ""}`).join("|")
  useLayoutEffect(() => {
    armed.current = performance.now() + 900
  }, [signature])
  const frameHeight = useFollowHeight(list, armed, reduced)
  useReflowGlide(list, armed, reduced)
  useLayoutEffect(() => {
    const index = pendingFocus.current
    const node = root.current
    if (index === null || !node) return
    pendingFocus.current = null
    const next = filters[Math.min(index, filters.length - 1)]
    const target = next ? node.querySelector<HTMLElement>(`[data-chip-remove="${CSS.escape(next.id)}"]`) : node.querySelector<HTMLElement>("[data-filter-trigger]")
    target?.focus({ preventScroll: true })
  }, [filters])
  const slot = (gap: number): HTMLMotionProps<"span"> => ({
    initial: reduced ? false : { width: 0, marginRight: -gap, overflow: "clip", "--slot-moving": 1 },
    animate: { width: "auto", marginRight: 0, transitionEnd: { overflow: "visible", "--slot-moving": 0 } },
    exit: reduced ? { opacity: 0, transition: still } : { width: 0, marginRight: -gap, overflow: "clip", "--slot-moving": 1, pointerEvents: "none", transition: { ...motionPresets.spring.smooth, "--slot-moving": still } },
    transition: reduced ? still : motionPresets.spring.smooth,
  })
  const chip = {
    initial: reduced ? false as const : { opacity: 0, scale: 0.9, filter: blur(motionPresets.blur.soft) },
    animate: { opacity: 1, scale: 1, filter: blur(0) },
    exit: reduced ? { opacity: 0, transition: still } : { opacity: 0, scale: 0.9, filter: blur(motionPresets.blur.subtle), transition: leave },
    transition: reduced ? still : { ...enter, scale: motionPresets.spring.snappy },
  }
  const text = reduced ? { ...textMotion(true), initial: false as const } : textMotion(false)
  const emptyText = reduced ? text : { ...text, transition: { ...enter, delay: motionPresets.duration.instant * 0.75 } }
  return (
    <div ref={root} data-slot="filter-toolbar" data-variant={variant} role="group" aria-label={label} className={cn("relative flex min-h-10 min-w-0 items-start justify-between gap-4 bg-card max-[520px]:flex-col max-[520px]:items-stretch", variant === "pill" ? "rounded-full px-2 py-1.5" : "rounded-xl border border-border p-3", className, classNames?.root)}>
      <motion.div data-slot="filter-toolbar-frame" className={cn("min-w-0 flex-1 max-[520px]:flex-none", classNames?.frame)} style={{ height: frameHeight }}>
        <div ref={list} data-slot="filter-toolbar-chips" className={cn("relative flex min-h-8 min-w-0 flex-wrap items-center gap-2", classNames?.chips)}>
          {leading}
          <AnimatePresence initial={false}>
            {filters.map((filter, index) => (
              <motion.span key={filter.id} className="inline-flex max-w-full min-w-0 shrink-0 rounded-full" {...slot(8)}>
                <motion.span data-slot="filter-toolbar-chip" className={cn("inline-flex max-w-[calc(100%+var(--slot-moving,0)*100vw)] min-h-8 shrink-0 items-center gap-2 rounded-full border border-border bg-muted py-0 pr-1 pl-3 text-xs text-muted-foreground", classNames?.chip)} {...chip}>
                  <span className="truncate">
                    {filter.label}
                    {filter.value ? (
                      <span className="font-medium text-foreground">
                        <span className="font-normal text-muted-foreground"> · </span>
                        <MorphText text={filter.value} />
                      </span>
                    ) : null}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    data-chip-remove={filter.id}
                    className="size-6 rounded-full text-muted-foreground"
                    aria-label={`Remove ${filter.label}${filter.value ? `: ${filter.value}` : ""}`}
                    onClick={(event) => {
                      if (document.activeElement === event.currentTarget) pendingFocus.current = index
                      onRemove(filter.id)
                    }}
                  >
                    <X size={14} strokeWidth={1.8} aria-hidden="true" />
                  </Button>
                </motion.span>
              </motion.span>
            ))}
          </AnimatePresence>
          <AnimatePresence initial={false}>
            {filters.length || leading || !emptyLabel ? null : (
              <motion.span key="empty" className="pointer-events-none absolute inset-y-0 left-0 flex max-w-full items-center overflow-hidden text-sm whitespace-nowrap text-muted-foreground" {...emptyText}>
                {emptyLabel}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
      <div data-slot="filter-toolbar-actions" className={cn("inline-flex shrink-0 items-center gap-3 max-[520px]:justify-end", classNames?.actions)}>
        {addFilter ? <FilterMenu fields={addFilter.fields} onSelect={addFilter.onAdd} active={filters} label={addFilter.label} align={addFilter.align} className={classNames?.menu} /> : null}
        {children}
        <AnimatePresence initial={false}>
          {filters.length > 0 ? (
            <motion.span key="clear" className="inline-flex shrink-0" {...slot(12)}>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn("text-xs text-muted-foreground", classNames?.clear)}
                onClick={() => {
                  pendingFocus.current = -1
                  onClearAll?.()
                }}
              >
                <motion.span className="block" {...text}>Clear all</motion.span>
              </Button>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </div>
      <span className="sr-only" role="status">{message}</span>
    </div>
  )
}
