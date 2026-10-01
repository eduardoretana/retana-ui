"use client"

/** Adapted from Arc UI (MIT). */

import { Children, isValidElement, useEffect, useEffectEvent, useId, useLayoutEffect, useMemo, useRef, useState, useSyncExternalStore } from "react"
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode, Ref } from "react"
import { AnimatePresence, animate, motion, motionValue, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import type { AnimationPlaybackControls, MotionValue, TargetAndTransition } from "motion/react"
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

/**
 * A row of slides people browse by dragging, flicking, a trackpad swipe, the arrow keys, or the controls below it. Use it for a short,
 * ordered set of peers such as products or case studies, where the neighbours stay in view as a hint that there is more.
 * The active slide sits in the center, its neighbours shrink and dim with distance, and the page indicator stretches into a pill that
 * travels with the slides frame by frame.
 */
export interface CarouselProps {
  /** Names the carousel for assistive technology, for example "From the Harbour suites". */
  label: string
  /** One child per slide. */
  children: ReactNode
  /** Controlled active slide. Pair with `onIndexChange`. */
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /** Width of one slide as a CSS length. Use `cqw` for a share of the carousel width. */
  slideSize?: string
  /** Names each slide and its indicator. Defaults to "2 of 5". */
  slideLabel?: (index: number, count: number) => string
  /** Milliseconds per slide. Adds a play control that rotates through the slides; rotation pauses on hover, keyboard focus, and drag, and is unavailable with reduced motion. */
  interval?: number
  /** Starts rotating on mount. Off by default, so motion begins with the viewer. */
  autoplay?: boolean
  className?: string
  classNames?: CarouselClassNames
}

export type CarouselClassNames = {
  root?: string
  viewport?: string
  track?: string
  slide?: string
  controls?: string
  tab?: string
  arrow?: string
}

type Drag = { pointer: number; startX: number; startY: number; origin: number; from: number; locked: "x" | "y" | null; caught: boolean; samples: [number, number][] }

const SLOP = 6
const FLICK = 360
const DOT = 6
const PILL = 22
const SCALE = 0.9
const DIM = 0.5
const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const project = (velocity: number, rate = 0.995) => (velocity / 1000) * (rate / (1 - rate))
const rubber = (overshoot: number, dimension: number) => (overshoot * dimension * 0.55) / (dimension + 0.55 * overshoot)
const unrubber = (distance: number, dimension: number) => (distance * dimension) / (0.55 * Math.max(1, dimension - distance))
const defaultSlideLabel = (index: number, count: number) => `${index + 1} of ${count}`
const subscribeNothing = () => () => {}

const iconIn: TargetAndTransition = { opacity: 0, scale: 0.6, filter: `blur(${motionPresets.blur.subtle}px)` }
const iconRest: TargetAndTransition = { opacity: 1, scale: 1, filter: "blur(0px)" }
const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] } }
const iconEnter = { ...motionPresets.spring.snappy, opacity: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] }, filter: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] } } as const

function velocityOf(samples: [number, number][], now: number) {
  const recent = samples.filter(([time]) => now - time <= 90)
  if (recent.length < 2 || now - recent[recent.length - 1][0] > 50) return 0
  const [firstTime, firstX] = recent[0]
  const [lastTime, lastX] = recent[recent.length - 1]
  return lastTime > firstTime ? (lastX - firstX) / ((lastTime - firstTime) / 1000) : 0
}

export function Carousel({ label, children, index: controlledIndex, defaultIndex = 0, onIndexChange, slideSize = "min(80cqw, 340px)", slideLabel = defaultSlideLabel, interval, autoplay = false, className, classNames }: CarouselProps) {
  const slides = Children.toArray(children)
  const count = slides.length
  const last = Math.max(0, count - 1)
  const id = useId()
  const reduced = useReducedMotion() ?? false
  const hydrated = useSyncExternalStore(subscribeNothing, () => true, () => false)
  const [ownIndex, setOwnIndex] = useState(() => clamp(defaultIndex, 0, last))
  const index = clamp(controlledIndex ?? ownIndex, 0, last)
  const [startIndex] = useState(index)
  const [playing, setPlaying] = useState(autoplay)
  const [hovered, setHovered] = useState(false)
  const [focusPaused, setFocusPaused] = useState(false)
  const [dragging, setDragging] = useState(false)
  const [inView, setInView] = useState(true)
  const [pageVisible, setPageVisible] = useState(true)
  const [announcement, setAnnouncement] = useState("")
  const x = useMotionValue(0)
  const progress = useMotionValue(index)
  const drains = useMemo(() => Array.from({ length: count }, () => motionValue(0)), [count])
  const rootRef = useRef<HTMLElement>(null)
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<HTMLButtonElement>(null)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const metrics = useRef({ step: 0, width: 0 })
  const target = useRef(index)
  const travel = useRef<AnimationPlaybackControls | null>(null)
  const drag = useRef<Drag | null>(null)
  const wheel = useRef({ active: false, raw: 0, timer: 0 })
  const swallowClick = useRef(false)
  const canRotate = Boolean(interval) && count > 1 && !(hydrated && reduced)
  const running = canRotate && playing && !hovered && !focusPaused && !dragging && inView && pageVisible

  const bounds = () => ({ min: -last * metrics.current.step, max: 0 })
  const band = (raw: number) => {
    const { min, max } = bounds()
    const size = metrics.current.width || 1
    return raw > max ? max + rubber(raw - max, size) : raw < min ? min - rubber(min - raw, size) : raw
  }
  const unband = (shown: number) => {
    const { min, max } = bounds()
    const size = metrics.current.width || 1
    return shown > max ? max + unrubber(shown - max, size) : shown < min ? min - unrubber(min - shown, size) : shown
  }

  function glide(to: number, velocity = 0) {
    const { step } = metrics.current
    travel.current?.stop()
    travel.current = null
    if (!step) return
    if (reduced) {
      x.jump(-to * step)
      return
    }
    travel.current = animate(x, -to * step, { ...motionPresets.spring.smooth, velocity })
  }

  function select(to: number, { velocity = 0, announce = true }: { velocity?: number; announce?: boolean } = {}) {
    const next = clamp(to, 0, last)
    target.current = next
    glide(next, velocity)
    if (next === index) return
    if (controlledIndex === undefined) setOwnIndex(next)
    onIndexChange?.(next)
    if (announce) setAnnouncement(slideLabel(next, count))
  }

  const measure = useEffectEvent(() => {
    const track = trackRef.current
    const viewport = viewportRef.current
    const [first, second] = Array.from(track?.children ?? []) as HTMLElement[]
    if (!track || !viewport || !first) return
    const center = (node: HTMLElement) => {
      const rect = node.getBoundingClientRect()
      return rect.left + rect.width / 2
    }
    const step = second ? center(second) - center(first) : first.offsetWidth
    const changed = step !== metrics.current.step
    metrics.current = { step, width: viewport.clientWidth }
    track.dataset.measured = ""
    if (changed && !drag.current) {
      travel.current?.stop()
      travel.current = null
      x.jump(-target.current * step)
      progress.set(target.current)
    }
  })

  useLayoutEffect(() => {
    measure()
    const viewport = viewportRef.current
    if (!viewport || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => measure())
    observer.observe(viewport)
    return () => observer.disconnect()
  }, [])

  useEffect(() => x.on("change", (value) => {
    const { step } = metrics.current
    if (!step) return
    const position = -value / step
    progress.set(position)
    drains.forEach((drain, i) => {
      if (i !== target.current && Math.abs(position - i) >= 1 && drain.get() !== 0) drain.jump(0)
    })
  }), [x, progress, drains])

  const followIndexProp = useEffectEvent((next: number) => {
    if (target.current !== next) {
      target.current = next
      glide(next)
    }
  })
  useEffect(() => {
    followIndexProp(index)
  }, [index])

  const advance = useEffectEvent(() => select(index >= last ? 0 : index + 1, { announce: false }))
  useEffect(() => {
    if (!running || !interval) return
    const drain = drains[index]
    if (!drain) return
    const controls = animate(drain, 1, { duration: (1 - drain.get()) * interval / 1000, ease: "linear", onComplete: () => advance() })
    return () => controls.stop()
  }, [running, index, interval, drains])

  useEffect(() => {
    const root = rootRef.current
    if (!interval || !root) return
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => setInView(entry.isIntersecting))
    observer?.observe(root)
    const onVisibility = () => setPageVisible(document.visibilityState !== "hidden")
    document.addEventListener("visibilitychange", onVisibility)
    return () => {
      observer?.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [interval])

  const onWheel = useEffectEvent((event: WheelEvent) => {
    const state = wheel.current
    if (count < 2 || drag.current || !metrics.current.step) return
    if (!state.active && Math.abs(event.deltaX) <= Math.abs(event.deltaY)) return
    event.preventDefault()
    if (!state.active) {
      state.active = true
      travel.current?.stop()
      travel.current = null
      state.raw = unband(x.get())
    }
    state.raw -= event.deltaX * (event.deltaMode === 1 ? 16 : 1)
    x.set(band(state.raw))
    window.clearTimeout(state.timer)
    state.timer = window.setTimeout(() => {
      state.active = false
      select(Math.round(-x.get() / metrics.current.step), { velocity: x.getVelocity() })
    }, 120)
  })
  useEffect(() => {
    const viewport = viewportRef.current
    const state = wheel.current
    if (!viewport) return
    const listener = (event: WheelEvent) => onWheel(event)
    viewport.addEventListener("wheel", listener, { passive: false })
    return () => {
      viewport.removeEventListener("wheel", listener)
      window.clearTimeout(state.timer)
    }
  }, [])

  function slideAt(clientX: number) {
    const nodes = Array.from(trackRef.current?.children ?? [])
    const hit = nodes.findIndex((node) => {
      const rect = node.getBoundingClientRect()
      return clientX >= rect.left && clientX <= rect.right
    })
    return hit < 0 ? null : hit
  }

  function onPointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    if (count < 2 || drag.current || !metrics.current.step || (event.pointerType === "mouse" && event.button !== 0)) return
    swallowClick.current = false
    const caught = travel.current !== null && x.isAnimating() && Math.abs(x.get() + target.current * metrics.current.step) > 12
    if (caught) {
      travel.current?.stop()
      travel.current = null
    }
    drag.current = { pointer: event.pointerId, startX: event.clientX, startY: event.clientY, origin: 0, from: target.current, locked: null, caught, samples: [] }
  }

  function onPointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (!current || current.pointer !== event.pointerId) return
    if (!current.locked) {
      const dx = event.clientX - current.startX
      const dy = event.clientY - current.startY
      if (Math.abs(dx) < SLOP && Math.abs(dy) < SLOP) return
      if (Math.abs(dy) > Math.abs(dx)) {
        current.locked = "y"
        return
      }
      current.locked = "x"
      travel.current?.stop()
      travel.current = null
      current.startX = event.clientX
      current.origin = unband(x.get())
      event.currentTarget.setPointerCapture(event.pointerId)
      setDragging(true)
    }
    if (current.locked !== "x") return
    x.set(band(current.origin + event.clientX - current.startX))
    current.samples.push([event.timeStamp, event.clientX])
    if (current.samples.length > 16) current.samples.shift()
  }

  function finish(event: ReactPointerEvent<HTMLDivElement>, cancelled: boolean) {
    const current = drag.current
    if (!current || current.pointer !== event.pointerId) return
    drag.current = null
    const { step } = metrics.current
    if (current.locked === "x") {
      swallowClick.current = true
      setDragging(false)
      const velocity = cancelled ? 0 : velocityOf(current.samples, event.timeStamp)
      let to = Math.round(-(x.get() + project(velocity)) / step)
      if (Math.abs(velocity) > FLICK) {
        const direction = velocity < 0 ? 1 : -1
        if ((to - current.from) * direction < 1) to = current.from + direction
      }
      const { min, max } = bounds()
      const shown = x.get()
      select(to, { velocity: shown >= min && shown <= max ? velocity : x.getVelocity() })
    } else if (current.caught) {
      swallowClick.current = true
      select(Math.round(-x.get() / step))
    } else if (!cancelled && current.locked === null) {
      const hit = slideAt(event.clientX)
      if (hit !== null && hit !== target.current) {
        swallowClick.current = true
        select(hit)
      }
    } else if (cancelled) select(target.current)
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || count < 2) return
    const node = event.target as HTMLElement
    if (node.closest("input, textarea, select, [contenteditable]")) return
    const from = target.current
    const to = event.key === "ArrowLeft" ? from - 1 : event.key === "ArrowRight" ? from + 1 : event.key === "Home" ? 0 : event.key === "End" ? last : null
    if (to === null) return
    event.preventDefault()
    const next = clamp(to, 0, last)
    select(next)
    if (node.getAttribute("role") === "tab") tabRefs.current[next]?.focus({ preventScroll: true })
    else if (trackRef.current?.contains(node)) viewportRef.current?.focus({ preventScroll: true })
  }

  function toggleRotation() {
    const drain = drains[index]
    if (!playing) {
      setPlaying(true)
      return
    }
    setPlaying(false)
    if (drain) {
      if (reduced) drain.jump(0)
      else animate(drain, 0, { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.standard] })
    }
  }

  const rootStyle = { "--carousel-slide": slideSize, "--carousel-start": startIndex } as CSSProperties
  const controlClass = "size-8 rounded-full border border-border bg-card text-foreground aria-disabled:cursor-default aria-disabled:opacity-50"

  return (
    <section
      ref={rootRef}
      data-slot="carousel"
      className={cn("@container grid w-full min-w-0 grid-cols-1 gap-4", className, classNames?.root)}
      style={rootStyle}
      aria-roledescription="carousel"
      aria-label={label}
      onKeyDown={onKeyDown}
      onFocus={(event) => setFocusPaused(event.target !== playRef.current && event.target.matches(":focus-visible"))}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusPaused(false)
      }}
    >
      <div
        ref={viewportRef}
        data-slot="carousel-viewport"
        role="group"
        aria-label="Slides"
        tabIndex={0}
        data-dragging={dragging || undefined}
        className={cn("relative min-w-0 cursor-grab overflow-x-clip overflow-y-visible rounded-xl touch-pan-y outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-offset-4 data-[dragging]:cursor-grabbing", classNames?.viewport)}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={(event) => finish(event, false)}
        onPointerCancel={(event) => finish(event, true)}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") setHovered(true)
        }}
        onPointerLeave={() => setHovered(false)}
        onClickCapture={(event) => {
          if (swallowClick.current) {
            event.preventDefault()
            event.stopPropagation()
            swallowClick.current = false
          }
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        <motion.div ref={trackRef} data-slot="carousel-track" className={cn("flex gap-4 px-[calc((100cqw-var(--carousel-slide))/2)] select-none [&:not([data-measured])]:translate-x-[calc(var(--carousel-start)*-1*(var(--carousel-slide)+1rem))]", classNames?.track)} style={{ x }}>
          {slides.map((slide, i) => (
            <Slide key={isValidElement(slide) && slide.key != null ? slide.key : i} id={`${id}-slide-${i}`} index={i} progress={progress} active={i === index} label={slideLabel(i, count)} className={classNames?.slide}>{slide}</Slide>
          ))}
        </motion.div>
      </div>
      {count > 1 ? (
        <div data-slot="carousel-controls" className={cn("flex min-w-0 items-center gap-2 px-[calc((100cqw-var(--carousel-slide))/2)] @max-[340px]:gap-1", classNames?.controls)}>
          {canRotate ? (
            <Button ref={playRef} type="button" variant="outline" size="icon" className={controlClass} aria-label={playing ? "Pause slide rotation" : "Start slide rotation"} onClick={toggleRotation}>
              <span className="grid size-4 place-items-center">
                <AnimatePresence initial={false}>
                  <motion.span key={playing ? "pause" : "play"} className="col-start-1 row-start-1 grid place-items-center" initial={reduced ? { opacity: 0 } : iconIn} animate={iconRest} exit={reduced ? { opacity: 0, transition: { duration: motionPresets.duration.instant } } : iconOut} transition={reduced ? { duration: motionPresets.duration.instant } : iconEnter}>
                    {playing ? <Pause size={15} strokeWidth={1.75} fill="currentColor" aria-hidden="true" /> : <Play size={15} strokeWidth={1.75} fill="currentColor" aria-hidden="true" />}
                  </motion.span>
                </AnimatePresence>
              </span>
            </Button>
          ) : null}
          <div className="flex min-w-0 items-center" role="tablist" aria-label="Choose a slide">
            {slides.map((_, i) => (
              <Dot key={i} index={i} last={last} progress={progress} drain={drains[i]} selected={i === index} label={slideLabel(i, count)} controls={`${id}-slide-${i}`} className={classNames?.tab} tabRef={(node) => { tabRefs.current[i] = node }} onSelect={() => select(i)} />
            ))}
          </div>
          <div className="ml-auto flex shrink-0 gap-2">
            <Button type="button" variant="outline" size="icon" className={cn(controlClass, classNames?.arrow)} aria-label="Previous slide" aria-disabled={index === 0} onClick={() => { if (target.current > 0) select(target.current - 1) }}>
              <ChevronLeft size={18} strokeWidth={1.75} aria-hidden="true" />
            </Button>
            <Button type="button" variant="outline" size="icon" className={cn(controlClass, classNames?.arrow)} aria-label="Next slide" aria-disabled={index === last} onClick={() => { if (target.current < last) select(target.current + 1) }}>
              <ChevronRight size={18} strokeWidth={1.75} aria-hidden="true" />
            </Button>
          </div>
        </div>
      ) : null}
      <span className="sr-only" aria-live="polite" aria-atomic="true">{announcement}</span>
    </section>
  )
}

function Slide({ id, index, progress, active, label, className, children }: { id: string; index: number; progress: MotionValue<number>; active: boolean; label: string; className?: string; children: ReactNode }) {
  const scale = useTransform(progress, [index - 1, index, index + 1], [SCALE, 1, SCALE])
  const opacity = useTransform(progress, [index - 1, index, index + 1], [DIM, 1, DIM])
  return (
    <motion.div id={id} data-slot="carousel-slide" data-index={index} role="tabpanel" aria-roledescription="slide" aria-label={label} inert={!active} className={cn("min-w-0 shrink-0 grow-0 basis-(--carousel-slide) origin-center will-change-transform [&_img]:[-webkit-user-drag:none]", className)} style={{ scale, opacity }}>
      {children}
    </motion.div>
  )
}

function Dot({ index, last, progress, drain, selected, label, controls, tabRef, onSelect, className }: { index: number; last: number; progress: MotionValue<number>; drain: MotionValue<number>; selected: boolean; label: string; controls: string; tabRef: Ref<HTMLButtonElement>; onSelect: () => void; className?: string }) {
  const emphasis = useTransform(progress, (value) => Math.max(0, 1 - Math.abs(clamp(value, 0, last) - index)))
  const width = useTransform(emphasis, (value) => DOT + (PILL - DOT) * value)
  return (
    <button ref={tabRef} type="button" role="tab" data-slot="carousel-tab" className={cn("grid h-8 shrink-0 cursor-pointer place-items-center rounded-full border-0 bg-transparent px-1.5 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none", className)} aria-selected={selected} aria-controls={controls} aria-label={label} tabIndex={selected ? 0 : -1} onClick={onSelect}>
      <motion.span className="relative block h-1.5 overflow-hidden rounded-full bg-border" style={{ width }} aria-hidden="true">
        <motion.span className="absolute inset-0 bg-foreground" style={{ opacity: emphasis }} />
        <motion.span className="absolute inset-0 origin-right bg-border" style={{ scaleX: drain }} />
      </motion.span>
    </button>
  )
}
