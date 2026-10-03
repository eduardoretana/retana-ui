"use client"

/** Adapted from Arc UI (MIT). */

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import type { CSSProperties, FocusEvent, KeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, WheelEvent } from "react"
import { Dialog } from "radix-ui"
import { AnimatePresence, animate, motion, useMotionValue, usePresence, useReducedMotion, useTransform } from "motion/react"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

/**
 * A sheet that rises from the bottom and rests at one or more heights.
 * It opens on a peek and can drag to full height. It is not the side drawer.
 */
export interface BottomSheetProps {
  /** The control that opens the sheet, usually a button. Focus returns to it when the sheet closes. */
  trigger?: ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  title: string
  description?: string
  /** Resting heights as fractions of the viewport. The sheet opens at `initialDetent` and never grows past the largest. */
  detents?: number[]
  /** Index into the sorted detents the sheet opens at. Defaults to the smallest. */
  initialDetent?: number
  onDetentChange?: (index: number) => void
  closeLabel?: string
  className?: string
  classNames?: BottomSheetClassNames
  children: ReactNode
}

export type BottomSheetClassNames = {
  root?: string
  overlay?: string
  header?: string
  grabber?: string
  title?: string
  description?: string
  close?: string
  body?: string
}

type Stop = number | "closed"
type Drag = { startY: number; origin: number; from: number; moved: boolean; samples: { t: number; y: number }[] }

/** Extra surface below the viewport so an upward stretch never shows a gap under the sheet. */
const EXTENSION = 160
/** Enough travel below the edge to hide the floating shadow as well as the sheet. */
const CLOSED_GAP = 40
/** How far a release coasts, in seconds of its velocity, before the nearest detent is chosen. */
const PROJECTION = 0.2
/** A release faster than this (px/s) always moves at least one detent in its direction. */
const FLICK = 320
/** The limit an upward stretch approaches past the tallest detent. */
const STRETCH = 120
/** How much of the full dim remains at the smallest detent. */
const LOW_DIM = 0.78

const settle = motionPresets.spring.smooth
const leave = { ...motionPresets.spring.smooth, visualDuration: 0.3 }
const fade = { duration: motionPresets.duration.fast, ease: "linear" } as const

const rubber = (distance: number) => (1 - 1 / ((distance * 0.55) / STRETCH + 1)) * STRETCH
const unrubber = (stretch: number) => (1 / (1 - Math.min(stretch, STRETCH - 1) / STRETCH) - 1) * (STRETCH / 0.55)
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

function velocityOf(samples: Drag["samples"], now: number) {
  const recent = samples.filter((sample) => now - sample.t <= 80)
  const first = recent[0]
  const last = recent[recent.length - 1]
  if (!first || !last || last === first || now - last.t > 60) return 0
  return (last.y - first.y) / ((last.t - first.t) / 1000)
}

export function BottomSheet({ trigger, open: openProp, defaultOpen = false, onOpenChange, ...props }: BottomSheetProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultOpen)
  const open = openProp ?? uncontrolled
  const setOpen = useCallback((next: boolean) => {
    if (openProp === undefined) setUncontrolled(next)
    onOpenChange?.(next)
  }, [onOpenChange, openProp])
  const dismiss = useCallback(() => setOpen(false), [setOpen])

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      {trigger ? <Dialog.Trigger asChild>{trigger}</Dialog.Trigger> : null}
      <AnimatePresence>
        {open ? (
          <Dialog.Portal key="sheet" forceMount>
            <Sheet {...props} onDismiss={dismiss} />
          </Dialog.Portal>
        ) : null}
      </AnimatePresence>
    </Dialog.Root>
  )
}

function Sheet({
  title,
  description,
  detents = [0.45, 0.92],
  initialDetent = 0,
  onDetentChange,
  closeLabel = "Close",
  className,
  classNames,
  children,
  onDismiss,
}: Omit<BottomSheetProps, "trigger" | "open" | "defaultOpen" | "onOpenChange"> & { onDismiss: () => void }) {
  const [isPresent, safeToRemove] = usePresence()
  const reduced = useReducedMotion() ?? false
  const detentKey = detents.join(",")
  const stops = useMemo(() => {
    const parsed = detentKey.split(",").map(Number).filter((stop) => stop > 0).sort((a, b) => a - b)
    return parsed.length > 0 ? parsed : [0.92]
  }, [detentKey])
  const top = stops.length - 1
  const [detent, setDetent] = useState(() => clamp(Math.round(initialDetent), 0, top))
  const [announcement, setAnnouncement] = useState("")
  const sheetRef = useRef<HTMLDivElement>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue(4000)
  const height = useMotionValue(0)
  const presence = useMotionValue(1)
  const detentRef = useRef(detent)
  const aim = useRef<Stop>(detent)
  const drag = useRef<Drag | null>(null)
  const arrive = useRef<(() => void) | undefined>(undefined)
  const suppressClick = useRef(false)
  const mounted = useRef(false)
  const presenceChange = useRef({ present: isPresent, at: 0 })

  useLayoutEffect(() => {
    presenceChange.current = { present: isPresent, at: performance.now() }
  }, [isPresent])

  const offset = useCallback((stop: Stop) => {
    const full = height.get()
    return stop === "closed" ? full + CLOSED_GAP : full * (1 - stops[stop] / stops[top])
  }, [height, stops, top])

  const backdrop = useTransform([y, height, presence], (latest: number[]) => {
    const offsetY = latest[0] ?? 0
    const full = latest[1] ?? 0
    const shown = latest[2] ?? 0
    if (!full) return 0
    const low = full * (1 - stops[0] / stops[top])
    const closed = full + CLOSED_GAP
    const dim = offsetY <= low ? 1 - (1 - LOW_DIM) * (low ? offsetY / low : 0) : LOW_DIM * (1 - (offsetY - low) / (closed - low))
    return clamp(dim, 0, 1) * shown
  })

  const go = useCallback((stop: Stop, velocity?: number, onArrive?: () => void) => {
    aim.current = stop
    arrive.current = onArrive
    const target = offset(stop)
    const done = () => {
      const callback = arrive.current
      arrive.current = undefined
      callback?.()
    }
    if (reduced) {
      y.jump(target)
      done()
      return
    }
    animate(y, target, { ...(stop === "closed" ? leave : settle), ...(velocity === undefined ? {} : { velocity }), onComplete: done })
  }, [offset, reduced, y])

  const rest = useCallback((stop: number, velocity?: number) => {
    if (stop !== detentRef.current) {
      detentRef.current = stop
      setDetent(stop)
      onDetentChange?.(stop)
      setAnnouncement(stop === top ? "Sheet expanded" : stop === 0 ? "Sheet collapsed" : `Sheet at ${Math.round(stops[stop] * 100)} percent height`)
    }
    const body = bodyRef.current
    if (stop !== top && body && body.scrollTop > 0) body.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
    go(stop, velocity)
  }, [go, onDetentChange, reduced, stops, top])

  useLayoutEffect(() => {
    const sheet = sheetRef.current
    if (!sheet) return
    if (!mounted.current) {
      mounted.current = true
      height.set(sheet.offsetHeight - EXTENSION)
      y.jump(offset("closed"))
      if (reduced) {
        y.jump(offset(detentRef.current))
        presence.jump(0)
      }
    }
    if (isPresent) {
      if (reduced) {
        y.jump(offset(detentRef.current))
        animate(presence, 1, fade)
        return
      }
      presence.jump(1)
      go(detentRef.current)
      return
    }
    if (reduced) {
      animate(presence, 0, { ...fade, onComplete: () => safeToRemove?.() })
      return
    }
    if (aim.current === "closed" && y.isAnimating()) arrive.current = () => safeToRemove?.()
    else go("closed", undefined, () => safeToRemove?.())
  }, [go, height, isPresent, offset, presence, reduced, safeToRemove, y])

  useEffect(() => {
    const sheet = sheetRef.current
    if (!sheet || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      const next = sheet.offsetHeight - EXTENSION
      if (next === height.get()) return
      height.set(next)
      const stop = aim.current
      if (drag.current || stop === "closed") return
      if (y.isAnimating()) go(stop)
      else y.jump(offset(stop))
    })
    observer.observe(sheet)
    return () => observer.disconnect()
  }, [go, height, offset, y])

  const beginDrag = useCallback((clientY: number, time: number) => {
    y.stop()
    const current = y.get()
    drag.current = {
      startY: clientY,
      origin: current < 0 ? -unrubber(-current) : current,
      from: detentRef.current,
      moved: false,
      samples: [{ t: time, y: clientY }],
    }
  }, [y])

  const moveDrag = useCallback((clientY: number, time: number) => {
    const state = drag.current
    if (!state) return
    const delta = clientY - state.startY
    if (!state.moved) {
      if (Math.abs(delta) < 3) return
      state.moved = true
      sheetRef.current?.setAttribute("data-dragging", "")
    }
    const raw = state.origin + delta
    y.set(raw < 0 ? -rubber(-raw) : raw)
    state.samples.push({ t: time, y: clientY })
    if (state.samples.length > 12) state.samples.shift()
  }, [y])

  const endDrag = useCallback((time: number) => {
    const state = drag.current
    drag.current = null
    sheetRef.current?.removeAttribute("data-dragging")
    if (!state) return
    if (!state.moved) {
      const stop = aim.current
      if (stop !== "closed") go(stop)
      return
    }
    suppressClick.current = true
    const current = y.get()
    const velocity = current < 0 ? 0 : velocityOf(state.samples, time)
    const projected = current + velocity * PROJECTION
    const candidates: Stop[] = [...stops.map((_, index) => index), "closed"]
    let target = candidates.reduce((best, stop) => Math.abs(offset(stop) - projected) < Math.abs(offset(best) - projected) ? stop : best)
    if (Math.abs(velocity) > FLICK && target === state.from) {
      target = velocity < 0 ? Math.min(state.from + 1, top) : state.from === 0 ? "closed" : state.from - 1
    }
    if (target === "closed") {
      if (!reduced) go("closed", velocity)
      onDismiss()
      return
    }
    rest(target, velocity)
  }, [go, offset, onDismiss, reduced, rest, stops, top, y])

  useEffect(() => {
    const body = bodyRef.current
    if (!body) return
    let gesture: { x: number; y: number; mode: "pending" | "sheet" | "native" } | null = null
    const start = (event: TouchEvent) => {
      const touch = event.touches[0]
      gesture = event.touches.length === 1 && touch ? { x: touch.clientX, y: touch.clientY, mode: "pending" } : null
    }
    const move = (event: TouchEvent) => {
      const touch = event.touches[0]
      if (!gesture || !touch || event.touches.length !== 1) return
      const dx = touch.clientX - gesture.x
      const dy = touch.clientY - gesture.y
      if (gesture.mode === "pending") {
        const expanded = detentRef.current === top
        if (expanded) {
          const scrollable = body.scrollHeight > body.clientHeight + 1
          gesture.mode = Math.abs(dy) >= Math.abs(dx) && (!scrollable || (body.scrollTop <= 0 && dy > 0)) ? "sheet" : "native"
        } else {
          if (Math.hypot(dx, dy) < 4) return
          gesture.mode = Math.abs(dy) >= Math.abs(dx) ? "sheet" : "native"
        }
        if (gesture.mode === "sheet") beginDrag(touch.clientY, event.timeStamp)
      }
      if (gesture.mode !== "sheet") return
      if (event.cancelable) event.preventDefault()
      moveDrag(touch.clientY, event.timeStamp)
    }
    const end = (event: TouchEvent) => {
      if (gesture?.mode === "sheet") endDrag(event.timeStamp)
      gesture = null
    }
    body.addEventListener("touchstart", start, { passive: true })
    body.addEventListener("touchmove", move, { passive: false })
    body.addEventListener("touchend", end)
    body.addEventListener("touchcancel", end)
    return () => {
      body.removeEventListener("touchstart", start)
      body.removeEventListener("touchmove", move)
      body.removeEventListener("touchend", end)
      body.removeEventListener("touchcancel", end)
    }
  }, [beginDrag, endDrag, moveDrag, top])

  useEffect(() => {
    const body = bodyRef.current
    const sheet = sheetRef.current
    if (!body || !sheet) return
    const update = () => sheet.toggleAttribute("data-scrolled", body.scrollTop > 1)
    body.addEventListener("scroll", update, { passive: true })
    return () => body.removeEventListener("scroll", update)
  }, [])

  function headerDown(event: ReactPointerEvent<HTMLDivElement>) {
    const target = event.target instanceof Element ? event.target : null
    if (event.button !== 0 || !event.isPrimary) return
    if (target?.closest("button, a, input, select, textarea, [role='button']") && !target.closest("[data-grabber]")) return
    beginDrag(event.clientY, event.timeStamp)
    const header = event.currentTarget
    const id = event.pointerId
    const outside = (next: PointerEvent) => next.pointerId === id && !(next.target instanceof Node && header.contains(next.target))
    const move = (next: PointerEvent) => {
      if (!outside(next) || !drag.current) return
      moveDrag(next.clientY, next.timeStamp)
      if (drag.current?.moved && !header.hasPointerCapture(id)) {
        try {
          header.setPointerCapture(id)
        } catch {
          /* The pointer is already gone. */
        }
      }
    }
    const up = (next: PointerEvent) => {
      if (next.pointerId !== id) return
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", up)
      window.removeEventListener("pointercancel", up)
      if (outside(next)) endDrag(next.timeStamp)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", up)
    window.addEventListener("pointercancel", up)
  }

  function headerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!drag.current) return
    if (event.pointerType === "mouse" && event.buttons === 0) {
      endDrag(event.timeStamp)
      return
    }
    moveDrag(event.clientY, event.timeStamp)
    if (drag.current.moved && !event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.setPointerCapture(event.pointerId)
  }

  function headerUp(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId)
    endDrag(event.timeStamp)
  }

  function grabberClick() {
    if (suppressClick.current) {
      suppressClick.current = false
      return
    }
    rest(detentRef.current === top ? 0 : top)
  }

  function grabberKey(event: KeyboardEvent<HTMLButtonElement>) {
    const current = detentRef.current
    const next = event.key === "ArrowUp" ? Math.min(current + 1, top) : event.key === "ArrowDown" ? Math.max(current - 1, 0) : event.key === "Home" ? top : event.key === "End" ? 0 : null
    if (next === null) return
    event.preventDefault()
    rest(next)
  }

  function bodyWheel(event: WheelEvent<HTMLDivElement>) {
    if (detentRef.current !== top && event.deltaY > 4 && !drag.current) rest(top)
  }

  function bodyFocus(event: FocusEvent<HTMLDivElement>) {
    if (detentRef.current === top || !(event.target instanceof Element)) return
    if (event.target.getBoundingClientRect().bottom > window.innerHeight - 8) rest(top)
  }

  function sheetKey(event: KeyboardEvent<HTMLDivElement>) {
    const body = bodyRef.current
    if (!body || (event.target !== event.currentTarget && event.target !== body)) return
    const down = event.key === "ArrowDown" || event.key === "PageDown" || (event.key === " " && !event.shiftKey)
    const up = event.key === "ArrowUp" || event.key === "PageUp" || (event.key === " " && event.shiftKey)
    if (!down && !up) return
    event.preventDefault()
    if (down && detentRef.current !== top) {
      rest(top)
      return
    }
    const step = event.key.startsWith("Arrow") ? 48 : body.clientHeight * 0.85
    body.scrollBy({ top: down ? step : -step, behavior: reduced ? "auto" : "smooth" })
  }

  const expanded = detent === top
  const style = {
    y,
    opacity: presence,
    "--sheet-max": stops[top],
    "--sheet-extension": `${EXTENSION}px`,
  } as unknown as CSSProperties

  return (
    <>
      <Dialog.Overlay asChild forceMount>
        <motion.div
          data-slot="bottom-sheet-overlay"
          className={cn("fixed inset-0 z-50 bg-foreground/40 data-[state=closed]:!pointer-events-none dark:bg-background/80", classNames?.overlay)}
          style={{ opacity: backdrop }}
        />
      </Dialog.Overlay>
      <Dialog.Content
        asChild
        forceMount
        {...(description ? {} : { "aria-describedby": undefined })}
        onOpenAutoFocus={(event) => {
          event.preventDefault()
          sheetRef.current?.focus({ preventScroll: true })
        }}
        onPointerDownOutside={(event) => {
          const { present, at } = presenceChange.current
          if (!present || event.detail.originalEvent.timeStamp < at) event.preventDefault()
        }}
      >
        <motion.div
          ref={sheetRef}
          tabIndex={-1}
          data-slot="bottom-sheet"
          data-expanded={expanded ? "" : undefined}
          style={style}
          onKeyDown={sheetKey}
          className={cn(
            "group/sheet fixed inset-x-0 z-[51] mx-auto flex w-full max-w-xl touch-none flex-col overflow-hidden rounded-t-xl border border-b-0 border-border bg-popover text-popover-foreground shadow-lg outline-none will-change-transform",
            "bottom-[calc(var(--sheet-extension)*-1)] h-[calc(var(--sheet-max)*100dvh+var(--sheet-extension))] pb-[calc(var(--sheet-extension)+env(safe-area-inset-bottom,0px))]",
            "data-[state=closed]:!pointer-events-none",
            className,
            classNames?.root,
          )}
        >
          <div
            data-slot="bottom-sheet-header"
            className={cn(
              "relative shrink-0 cursor-grab touch-none px-4 pt-2 pb-4 select-none sm:px-5",
              "after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-border after:opacity-0 after:transition-opacity group-data-[scrolled]/sheet:after:opacity-100 motion-reduce:after:transition-none",
              "group-data-[dragging]/sheet:cursor-grabbing",
              classNames?.header,
            )}
            onPointerDown={headerDown}
            onPointerMove={headerMove}
            onPointerUp={headerUp}
            onPointerCancel={headerUp}
          >
            <button
              type="button"
              data-slot="bottom-sheet-grabber"
              data-grabber=""
              aria-label={expanded ? "Collapse sheet" : "Expand sheet"}
              aria-expanded={expanded}
              className={cn(
                "group/grabber mx-auto mb-1 flex h-5 w-14 items-center justify-center rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                classNames?.grabber,
              )}
              onClick={grabberClick}
              onKeyDown={grabberKey}
            >
              <span className="h-[5px] w-9 rounded-full bg-border transition-colors group-data-[dragging]/sheet:bg-muted-foreground group-hover/grabber:bg-muted-foreground motion-reduce:transition-none" aria-hidden="true" />
            </button>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <Dialog.Title data-slot="bottom-sheet-title" className={cn("truncate text-lg font-medium", classNames?.title)}>
                  {title}
                </Dialog.Title>
                {description ? (
                  <Dialog.Description data-slot="bottom-sheet-description" className={cn("mt-0.5 text-sm text-muted-foreground", classNames?.description)}>
                    {description}
                  </Dialog.Description>
                ) : null}
              </div>
              <Dialog.Close asChild>
                <Button type="button" variant="outline" size="icon-sm" data-slot="bottom-sheet-close" aria-label={closeLabel} className={cn("shrink-0 rounded-full", classNames?.close)}>
                  <X aria-hidden="true" />
                </Button>
              </Dialog.Close>
            </div>
          </div>
          <div
            ref={bodyRef}
            data-slot="bottom-sheet-body"
            className={cn(
              "min-h-0 flex-1 touch-none overflow-hidden px-4 pt-1 pb-6 text-sm overscroll-contain group-data-[expanded]/sheet:touch-pan-y group-data-[expanded]/sheet:overflow-y-auto sm:px-5",
              classNames?.body,
            )}
            onWheel={bodyWheel}
            onFocus={bodyFocus}
          >
            {children}
          </div>
          <span className="sr-only" role="status" aria-live="polite">{announcement}</span>
        </motion.div>
      </Dialog.Content>
    </>
  )
}

export const BottomSheetClose = Dialog.Close
