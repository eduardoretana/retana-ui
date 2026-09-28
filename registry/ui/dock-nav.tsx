"use client"

import * as React from "react"
import { X } from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type DockNavItem = {
  value: string
  label: string
  icon: React.ReactNode
  href?: string
  /** Single element, such as a Next.js link. The icon is rendered inside it. */
  asChild?: React.ReactElement
  badge?: string
  disabled?: boolean
  /** Adjacent items with a different group are split by a separator. */
  group?: string
  kind?: "item" | "search"
}

export type DockNavSearch = {
  placeholder?: string
  onSearch?: (query: string) => void
  onOpenChange?: (open: boolean) => void
  open?: boolean
  defaultOpen?: boolean
  label?: string
  closeLabel?: string
}

export type DockNavPosition = "inline" | "top" | "bottom"

export type DockNavProps = {
  items: readonly DockNavItem[]
  value?: string
  defaultValue?: string
  onValueChange?: (value: string) => void
  search?: DockNavSearch
  position?: DockNavPosition
  /** Accessible name of the navigation landmark. */
  label?: string
  /** Resting icon size in pixels. Defaults to 44, or 40 below 640px. */
  itemSize?: number
  className?: string
  barClassName?: string
  itemClassName?: string
  panelClassName?: string
  tooltipClassName?: string
}

type Box = { x: number; y: number; w: number; h: number }

const PANEL_HEIGHT = 44
const PANEL_GAP = 16

export function dockScaleForDistance(distance: number, itemSize: number) {
  const sigma = itemSize * (46 / 44)
  const influence = Math.exp(-(distance * distance) / (2 * sigma * sigma))
  return 1 + influence * 0.55
}

function stepSpring(current: number, velocity: number, target: number, dt: number) {
  const omega = 22
  const zeta = 0.9
  const accel = omega * omega * (target - current) - 2 * zeta * omega * velocity
  const nextVelocity = velocity + accel * dt
  let next = current + nextVelocity * dt
  let vel = nextVelocity
  if (next < 1) {
    next = 1
    vel = 0
  } else if (next > 1.68) {
    next = 1.68
    vel = 0
  }
  return [next, vel] as const
}

function easeOut(t: number) {
  return 1 - (1 - t) ** 3
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t
}

function boxAt(from: Box, to: Box, t: number): Box {
  if (t < 0.42) {
    const p = easeOut(t / 0.42)
    return {
      x: lerp(from.x, to.x + (to.w - from.w) / 2, p),
      y: lerp(from.y, to.y, p),
      w: from.w,
      h: from.h,
    }
  }
  const p = easeOut((t - 0.42) / 0.58)
  const w = lerp(from.w, to.w, p)
  const h = lerp(from.h, to.h, p)
  return {
    x: to.x + (to.w - w) / 2,
    y: to.y,
    w,
    h,
  }
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia(query)
    const update = () => setMatches(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [query])
  return matches
}

function ItemControl({
  asChild,
  href,
  disabled,
  children,
  ...props
}: {
  asChild?: React.ReactElement
  href?: string
  disabled?: boolean
  children: React.ReactNode
} & Omit<React.ComponentProps<"button">, "children">) {
  if (asChild) {
    return (
      <Slot.Root {...props} aria-disabled={disabled || undefined}>
        {React.cloneElement(asChild, undefined, children)}
      </Slot.Root>
    )
  }
  if (href) {
    return (
      <a
        href={disabled ? undefined : href}
        aria-disabled={disabled || undefined}
        {...(props as React.ComponentProps<"a">)}
      >
        {children}
      </a>
    )
  }
  return (
    <button type="button" disabled={disabled} {...props}>
      {children}
    </button>
  )
}

export function DockNav({
  items,
  value,
  defaultValue,
  onValueChange,
  search,
  position = "inline",
  label = "Primary",
  itemSize,
  className,
  barClassName,
  itemClassName,
  panelClassName,
  tooltipClassName,
}: DockNavProps) {
  const narrow = useMediaQuery("(max-width: 639px)")
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)")
  const reducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)")
  const base = itemSize ?? (narrow ? 40 : 44)
  const baseRef = React.useRef(base)
  const fineRef = React.useRef(finePointer)
  const reducedRef = React.useRef(reducedMotion)
  const disabledRef = React.useRef<boolean[]>([])

  const [uncontrolledValue, setUncontrolledValue] = React.useState(
    defaultValue ?? items.find((item) => item.kind !== "search" && !item.disabled)?.value,
  )
  const selected = value !== undefined ? value : uncontrolledValue
  const searchControlled = search?.open !== undefined
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(search?.defaultOpen ?? false)
  const open = searchControlled ? Boolean(search?.open) : uncontrolledOpen
  const [present, setPresent] = React.useState(open)
  const [trackedOpen, setTrackedOpen] = React.useState(open)
  if (open !== trackedOpen) {
    setTrackedOpen(open)
    if (open) setPresent(true)
  }
  const [query, setQuery] = React.useState("")
  const [cursor, setCursor] = React.useState(() => {
    const current = items.findIndex(
      (item) => item.value === (value ?? defaultValue) && !item.disabled && item.kind !== "search",
    )
    if (current >= 0) return current
    const first = items.findIndex((item) => !item.disabled)
    return first >= 0 ? first : 0
  })

  const rootRef = React.useRef<HTMLDivElement>(null)
  const columnRef = React.useRef<HTMLDivElement>(null)
  const stageRef = React.useRef<HTMLDivElement>(null)
  const barRef = React.useRef<HTMLDivElement>(null)
  const panelRef = React.useRef<HTMLFormElement>(null)
  const fieldRef = React.useRef<HTMLDivElement>(null)
  const iconRef = React.useRef<HTMLSpanElement>(null)
  const inputRef = React.useRef<HTMLInputElement>(null)
  const itemRefs = React.useRef<(HTMLDivElement | null)[]>([])
  const controlRefs = React.useRef<(HTMLElement | null)[]>([])
  const slotRef = React.useRef<HTMLElement | null>(null)
  const animRef = React.useRef(0)
  const wasOpen = React.useRef(false)
  /** Search that is already open on the first paint must not move focus. */
  const focusWhenOpened = React.useRef(!open)
  /** true restores the search trigger, false leaves focus alone, null decides from where focus is. */
  const restoreFocusRef = React.useRef<boolean | null>(null)
  const startRef = React.useRef<() => void>(() => {})
  const motionRef = React.useRef({
    scales: items.map(() => 1),
    velocities: items.map(() => 0),
    pointerX: null as number | null,
    hovering: false,
    frame: 0,
    running: false,
    last: 0,
  })

  const panelId = React.useId()
  const inputId = React.useId()
  const searchItem = items.find((item) => item.kind === "search")
  const stageHeight = Math.ceil(base * 1.65 + 18)

  React.useLayoutEffect(() => {
    baseRef.current = base
    fineRef.current = finePointer
    reducedRef.current = reducedMotion
    disabledRef.current = items.map((item) => Boolean(item.disabled))
  }, [base, finePointer, items, reducedMotion])

  const applySize = React.useCallback((index: number, scale: number) => {
    const node = itemRefs.current[index]
    if (!node) return
    const size = `${scale * baseRef.current}px`
    node.style.width = size
    node.style.height = size
  }, [])

  React.useLayoutEffect(() => {
    const motion = motionRef.current
    if (motion.scales.length !== items.length) {
      motion.scales = Array.from({ length: items.length }, () => 1)
      motion.velocities = Array.from({ length: items.length }, () => 0)
    }
    for (let index = 0; index < items.length; index += 1) {
      applySize(index, motion.scales[index] ?? 1)
    }
  }, [applySize, base, items.length])

  React.useEffect(() => {
    const motion = motionRef.current
    function tick(now: number) {
      const dt = Math.min(0.032, motion.last ? (now - motion.last) / 1000 : 0.016)
      motion.last = now
      const magnify = motion.hovering && fineRef.current && !reducedRef.current && motion.pointerX != null
      const pointerX = motion.pointerX ?? 0
      const centers: Array<number | null> = []
      for (let index = 0; index < motion.scales.length; index += 1) {
        const node = itemRefs.current[index]
        if (!magnify || !node || disabledRef.current[index]) {
          centers.push(null)
          continue
        }
        const rect = node.getBoundingClientRect()
        centers.push(rect.left + rect.width / 2)
      }
      let resting = !magnify
      for (let index = 0; index < motion.scales.length; index += 1) {
        const center = centers[index]
        const target = center == null ? 1 : dockScaleForDistance(Math.abs(pointerX - center), baseRef.current)
        const [next, velocity] = stepSpring(motion.scales[index] ?? 1, motion.velocities[index] ?? 0, target, dt)
        motion.scales[index] = next
        motion.velocities[index] = velocity
        applySize(index, next)
        if (Math.abs(next - 1) > 0.004 || Math.abs(velocity) > 0.004) resting = false
      }
      if (resting) {
        motion.running = false
        motion.scales = motion.scales.map(() => 1)
        motion.velocities = motion.velocities.map(() => 0)
        motion.scales.forEach((_, index) => applySize(index, 1))
        return
      }
      motion.frame = window.requestAnimationFrame(tick)
    }
    function start() {
      if (motion.running) return
      motion.running = true
      motion.last = 0
      motion.frame = window.requestAnimationFrame(tick)
    }
    startRef.current = start
    return () => {
      motion.running = false
      window.cancelAnimationFrame(motion.frame)
    }
  }, [applySize, items.length])

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    if (event.pointerType && event.pointerType !== "mouse") return
    if (!fineRef.current || reducedRef.current) return
    motionRef.current.pointerX = event.clientX
    motionRef.current.hovering = true
    startRef.current()
  }

  function onPointerLeave() {
    motionRef.current.hovering = false
    motionRef.current.pointerX = null
    startRef.current()
  }

  function commitValue(next: string) {
    if (value === undefined) setUncontrolledValue(next)
    onValueChange?.(next)
  }

  function commitOpen(next: boolean, restoreFocus: boolean | null = null) {
    if (!next) restoreFocusRef.current = restoreFocus
    if (next) setPresent(true)
    if (!searchControlled) setUncontrolledOpen(next)
    search?.onOpenChange?.(next)
  }

  function activate(item: DockNavItem, index: number) {
    if (item.disabled) return
    setCursor(index)
    if (item.kind === "search") {
      commitOpen(!open, true)
      return
    }
    commitValue(item.value)
  }

  const measure = React.useCallback((target: "slot" | "panel"): Box | null => {
    const column = columnRef.current
    const slot = slotRef.current
    const bar = barRef.current
    const stage = stageRef.current
    if (!column || !slot || !bar || !stage) return null
    const columnRect = column.getBoundingClientRect()
    if (columnRect.width < 8) return null
    if (target === "slot") {
      const slotRect = slot.getBoundingClientRect()
      if (slotRect.width < 2) return null
      return {
        x: slotRect.left - columnRect.left,
        y: slotRect.top - columnRect.top,
        w: slotRect.width,
        h: slotRect.height,
      }
    }
    const barRect = bar.getBoundingClientRect()
    const width = Math.min(32 * 16, Math.max(barRect.width, 280), window.innerWidth - 32)
    return {
      x: (columnRect.width - width) / 2,
      y: stage.getBoundingClientRect().height + PANEL_GAP,
      w: width,
      h: PANEL_HEIGHT,
    }
  }, [])

  const applyBox = React.useCallback((box: Box) => {
    const panel = panelRef.current
    if (!panel) return
    panel.style.position = "absolute"
    panel.style.marginTop = "0"
    panel.style.left = `${box.x}px`
    panel.style.top = `${box.y}px`
    panel.style.width = `${box.w}px`
    panel.style.height = `${box.h}px`
  }, [])

  const placeIcon = React.useCallback((box: Box, from: Box, expand: number) => {
    const icon = iconRef.current
    if (!icon) return
    const centered = (Math.max(box.w, from.w) - 20) / 2
    const left = box.w <= from.w + 1 ? (box.w - 20) / 2 : lerp(Math.min(centered, (from.w - 20) / 2), 14, expand)
    icon.style.left = `${left}px`
  }, [])

  const runMorph = React.useCallback((direction: "open" | "close") => {
    const panel = panelRef.current
    const id = animRef.current + 1
    animRef.current = id
    const from = measure("slot")
    const to = measure("panel")
    const field = fieldRef.current
    if (!panel || !from || !to) {
      if (panel) {
        panel.style.position = ""
        panel.style.left = ""
        panel.style.top = ""
        panel.style.width = ""
        panel.style.height = ""
        panel.style.opacity = "1"
      }
      if (field) field.style.opacity = "1"
      if (direction === "close") {
        window.queueMicrotask(() => {
          if (animRef.current === id) setPresent(false)
        })
      }
      return
    }
    if (reducedRef.current) {
      if (direction === "open") {
        applyBox(to)
        panel.style.opacity = "0"
        if (field) field.style.opacity = "1"
        panel.style.transition = "opacity 120ms linear"
        panel.style.opacity = "1"
        placeIcon(to, from, 1)
      } else {
        panel.style.transition = "opacity 120ms linear"
        panel.style.opacity = "0"
        window.setTimeout(() => {
          if (animRef.current === id) setPresent(false)
        }, 120)
      }
      return
    }
    const start = performance.now()
    const duration = 280
    if (direction === "open") {
      applyBox(from)
      panel.style.opacity = "1"
      if (field) field.style.opacity = "0"
      placeIcon(from, from, 0)
    }
    const fromBox = from
    const toBox = to
    const panelEl = panel
    function frame(now: number) {
      if (animRef.current !== id) return
      const raw = Math.min(1, (now - start) / duration)
      const t = direction === "open" ? raw : 1 - raw
      const box = boxAt(fromBox, toBox, t)
      applyBox(box)
      const expand = t < 0.42 ? 0 : (t - 0.42) / 0.58
      if (fieldRef.current) fieldRef.current.style.opacity = String(expand)
      placeIcon(box, fromBox, expand)
      panelEl.style.opacity = "1"
      if (raw < 1) {
        window.requestAnimationFrame(frame)
        return
      }
      if (direction === "close") setPresent(false)
      else placeIcon(toBox, fromBox, 1)
    }
    window.requestAnimationFrame(frame)
  }, [applyBox, measure, placeIcon])

  React.useLayoutEffect(() => {
    if (!present) return
    runMorph(open ? "open" : "close")
    if (open) {
      wasOpen.current = true
      restoreFocusRef.current = null
      if (focusWhenOpened.current) inputRef.current?.focus()
      focusWhenOpened.current = false
      return
    }
    focusWhenOpened.current = true
    if (!wasOpen.current) return
    const choice = restoreFocusRef.current
    restoreFocusRef.current = null
    const active = document.activeElement
    const inside = active instanceof Node && Boolean(rootRef.current?.contains(active))
    const shouldRestore = choice === true || (choice == null && (inside || active == null || active === document.body))
    if (shouldRestore) slotRef.current?.focus()
  }, [open, present, runMorph])

  const onSearchOpenChange = search?.onOpenChange
  React.useEffect(() => {
    if (!open) return
    function onPointerDown(event: PointerEvent) {
      if (!(event.target instanceof Node)) return
      if (rootRef.current?.contains(event.target)) return
      restoreFocusRef.current = false
      if (!searchControlled) setUncontrolledOpen(false)
      onSearchOpenChange?.(false)
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [onSearchOpenChange, open, searchControlled])

  React.useEffect(() => {
    if (!open) return
    const column = columnRef.current
    if (!column) return
    const observer = new ResizeObserver(() => {
      const to = measure("panel")
      if (to) applyBox(to)
    })
    observer.observe(column)
    return () => observer.disconnect()
  }, [applyBox, measure, open])

  function onNavKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) return
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
    const enabled = items.flatMap((item, index) => (item.disabled ? [] : [index]))
    if (!enabled.length) return
    const activeIndex = enabled.find((index) => controlRefs.current[index] === document.activeElement)
    let positionIndex = activeIndex === undefined ? 0 : enabled.indexOf(activeIndex)
    if (event.key === "ArrowRight") positionIndex = (positionIndex + 1) % enabled.length
    if (event.key === "ArrowLeft") positionIndex = (positionIndex - 1 + enabled.length) % enabled.length
    if (event.key === "Home") positionIndex = 0
    if (event.key === "End") positionIndex = enabled.length - 1
    event.preventDefault()
    const next = enabled[positionIndex]
    if (next === undefined) return
    setCursor(next)
    controlRefs.current[next]?.focus()
  }

  function emitSearch(next: string) {
    search?.onSearch?.(next)
  }

  const groups: { key: string; entries: { item: DockNavItem; index: number }[] }[] = []
  items.forEach((item, index) => {
    const key = item.group ?? ""
    const last = groups[groups.length - 1]
    if (!last || last.key !== key) groups.push({ key, entries: [{ item, index }] })
    else last.entries.push({ item, index })
  })

  const searchLabel = search?.label ?? searchItem?.label ?? "Search"
  const closeLabel = search?.closeLabel ?? "Close search"
  const placeholder = search?.placeholder ?? "Search"

  return (
    <TooltipProvider delayDuration={80}>
      <div
        ref={rootRef}
        data-slot="dock-nav"
        data-position={position}
        data-magnify={finePointer && !reducedMotion ? "true" : "false"}
        data-motion={reducedMotion ? "reduce" : "ok"}
        onKeyDown={(event) => {
          if (event.key !== "Escape" || !open) return
          event.preventDefault()
          event.stopPropagation()
          commitOpen(false, true)
        }}
        className={cn(
          "flex justify-center",
          position === "inline" && "relative w-full",
          position === "top" && "fixed inset-x-0 top-3 z-40 px-4",
          position === "bottom" && "fixed inset-x-0 bottom-3 z-40 px-4",
          className,
        )}
      >
        <div ref={columnRef} className="relative flex w-full max-w-full flex-col items-center">
          <div ref={stageRef} className="relative w-full" style={{ height: stageHeight }}>
            <div className="absolute inset-x-0 bottom-0 flex justify-center">
              <div
                ref={barRef}
                onPointerMove={onPointerMove}
                onPointerLeave={onPointerLeave}
                className={cn(
                  "inline-flex items-end rounded-full border border-border bg-background/70 px-1.5 pt-1.5 pb-2 shadow-lg backdrop-blur-xl dark:bg-background/60",
                  barClassName,
                )}
              >
                <nav aria-label={label} onKeyDown={onNavKeyDown}>
                  <ul className="flex items-end gap-1.5">
                    {groups.map((group, groupIndex) => (
                      <React.Fragment key={`${group.key}-${groupIndex}`}>
                        {groupIndex > 0 ? (
                          <li aria-hidden="true" className="flex items-center self-center px-0.5">
                            <Separator orientation="vertical" className="h-6" />
                          </li>
                        ) : null}
                        {group.entries.map(({ item, index }) => {
                          const active = item.kind !== "search" && item.value === selected
                          const isSearch = item.kind === "search"
                          const ghost = isSearch && (open || present)
                          const tabIndex = item.disabled ? -1 : index === cursor ? 0 : -1
                          return (
                            <li key={item.value} className="flex shrink-0 flex-col items-center">
                              <div
                                ref={(node) => {
                                  itemRefs.current[index] = node
                                }}
                                className="size-11 shrink-0"
                              >
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <ItemControl
                                      asChild={item.asChild}
                                      href={item.href}
                                      disabled={item.disabled}
                                      ref={(node) => {
                                        controlRefs.current[index] = node
                                        if (isSearch) slotRef.current = node
                                      }}
                                      tabIndex={tabIndex}
                                      aria-label={item.label}
                                      aria-current={active ? "page" : undefined}
                                      aria-expanded={isSearch ? open : undefined}
                                      aria-controls={isSearch ? panelId : undefined}
                                      data-value={item.value}
                                      data-active={active ? "true" : "false"}
                                      data-kind={item.kind ?? "item"}
                                      onClick={() => activate(item, index)}
                                      onFocus={() => {
                                        if (!item.disabled) setCursor(index)
                                      }}
                                      onKeyDown={(event) => {
                                        if (event.key === " " && (item.href || item.asChild)) {
                                          event.preventDefault()
                                          event.currentTarget.click()
                                        }
                                      }}
                                      className={cn(
                                        "relative flex size-full items-center justify-center rounded-xl border border-border bg-card text-foreground shadow-sm outline-none",
                                        "focus-visible:ring-2 focus-visible:ring-ring",
                                        "active:scale-95 motion-reduce:active:scale-100",
                                        active && "ring-2 ring-ring/30",
                                        item.disabled && "pointer-events-none opacity-40",
                                        ghost && "border-dashed bg-transparent shadow-none",
                                        itemClassName,
                                      )}
                                    >
                                      <span
                                        className={cn(
                                          "grid place-items-center transition-opacity duration-150 motion-reduce:transition-none [&_svg]:size-5",
                                          ghost && "opacity-0",
                                        )}
                                      >
                                        {item.icon}
                                      </span>
                                      {ghost ? (
                                        <span className="absolute size-1 rounded-full bg-muted-foreground" />
                                      ) : null}
                                    </ItemControl>
                                  </TooltipTrigger>
                                  <TooltipContent
                                    side="top"
                                    sideOffset={10}
                                    className={cn("pointer-events-none rounded-full", tooltipClassName)}
                                  >
                                    <span>{item.label}</span>
                                    {item.badge ? (
                                      <Badge
                                        variant="secondary"
                                        className="h-4 border-transparent bg-background/20 px-1.5 text-[10px] text-background"
                                      >
                                        {item.badge}
                                      </Badge>
                                    ) : null}
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                              <span
                                aria-hidden="true"
                                className={cn(
                                  "mt-1 size-1 rounded-full bg-primary transition-opacity duration-200 motion-reduce:transition-none",
                                  active ? "opacity-100" : "opacity-0",
                                )}
                              />
                            </li>
                          )
                        })}
                      </React.Fragment>
                    ))}
                  </ul>
                </nav>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="w-full transition-[height] duration-300 ease-out motion-reduce:transition-none"
            style={{ height: open ? PANEL_HEIGHT + PANEL_GAP : 0 }}
          />
          {present && searchItem ? (
            <form
              ref={panelRef}
              id={panelId}
              role="search"
              data-slot="dock-nav-search"
              onSubmit={(event) => {
                event.preventDefault()
                emitSearch(query)
              }}
              className={cn(
                "relative z-10 mt-4 flex h-11 w-[min(32rem,calc(100vw-2rem))] max-w-full items-center overflow-hidden rounded-full border border-border bg-background/80 shadow-lg backdrop-blur-xl dark:bg-background/60",
                panelClassName,
              )}
            >
              <span
                ref={iconRef}
                className="pointer-events-none absolute top-1/2 left-3.5 flex size-5 -translate-y-1/2 items-center justify-center text-foreground [&_svg]:size-4"
              >
                {searchItem.icon}
              </span>
              <div ref={fieldRef} className="flex min-w-0 flex-1 items-center">
                <label htmlFor={inputId} className="sr-only">
                  {searchLabel}
                </label>
                <Input
                  ref={inputRef}
                  id={inputId}
                  type="text"
                  role="searchbox"
                  value={query}
                  placeholder={placeholder}
                  autoComplete="off"
                  onChange={(event) => {
                    const next = event.target.value
                    setQuery(next)
                    emitSearch(next)
                  }}
                  className="h-11 border-0 bg-transparent pr-11 pl-10 shadow-none focus-visible:ring-0 dark:bg-transparent"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute top-1/2 right-1 -translate-y-1/2"
                  aria-label={closeLabel}
                  onClick={() => commitOpen(false, true)}
                >
                  <X />
                </Button>
              </div>
            </form>
          ) : null}
        </div>
      </div>
    </TooltipProvider>
  )
}
