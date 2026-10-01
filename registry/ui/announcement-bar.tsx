"use client"

/** Adapted from Arc UI (MIT). */

import { forwardRef, useCallback, useEffect, useId, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react"
import type { CSSProperties, ReactNode } from "react"
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import type { AnimationPlaybackControls, Transition, Variants } from "motion/react"
import { ArrowRight, ChevronDown, ChevronUp, Pause, Play, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface AnnouncementAction {
  label: string
  href?: string
  onClick?: () => void
}

export interface Announcement {
  /** Stable id, reported to callbacks. */
  id: string
  message: ReactNode
  action?: AnnouncementAction
  /** Counts down to a moment, for example the end of a sale. */
  countdown?: { to: Date | string | number; label?: string }
}

/**
 * A slim bar for the top of a page. It can rotate several messages, each rising in from below while the bar springs to
 * the new height; rotation pauses on hover, focus, or a hidden tab, and `controls` adds previous, next, and a pause ring. Messages can carry a
 * call to action and a live countdown. Dismissing collapses the height smoothly so the page below eases up, and with an
 * `id` the dismissal is remembered in `localStorage`.
 */
export interface AnnouncementBarProps {
  messages: Announcement[]
  /** Remembers dismissal under this id. Change the id to show a new campaign to everyone again. */
  id?: string
  /** Whether the bar is shown. Leave it out to let the component manage it. */
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Index of the visible message. */
  index?: number
  defaultIndex?: number
  onIndexChange?: (index: number) => void
  /** Milliseconds each message stays before the next one. Defaults to 6000. */
  interval?: number
  /** Rotate automatically. Pauses on hover, focus, or a hidden tab, and is turned off when the visitor prefers reduced motion. Defaults to true. */
  autoPlay?: boolean
  /** Show previous, next, and pause controls when there are several messages. Defaults to false: only the close button shows. */
  controls?: boolean
  dismissible?: boolean
  tone?: "neutral" | "inverted"
  onAction?: (announcement: Announcement) => void
  onCountdownEnd?: (announcement: Announcement) => void
  /** Accessible name of the region. */
  label?: string
  className?: string
  classNames?: AnnouncementBarClassNames
}

export type AnnouncementBarClassNames = {
  root?: string
  bar?: string
  message?: string
  controls?: string
  dismiss?: string
}

const storageKey = (id: string) => `arc-announcement:${id}`
const subscribeDismissal = () => () => {}

/** Forgets a remembered dismissal so the bar with this id shows again. */
export function clearAnnouncementDismissal(id: string) {
  try {
    window.localStorage.removeItem(storageKey(id))
  } catch {
    /* Storage can be blocked. */
  }
}

type Bezier = [number, number, number, number]
const enter = [...motionPresets.ease.enter] as Bezier
const standard = [...motionPresets.ease.standard] as Bezier
const physical = (visualDuration: number, bounce: number): Transition => {
  const root = (2 * Math.PI) / (visualDuration * 1.2)
  return { type: "spring", stiffness: root * root, damping: 2 * (1 - bounce) * root, mass: 1 }
}
const RISE = physical(0.46, 0.1)
const HEIGHT = physical(0.42, 0)
const COLLAPSE = physical(0.44, 0)

const faceVariants: Variants = {
  hidden: (direction: number) => ({ opacity: 0, y: `${direction * 70}%`, filter: `blur(${motionPresets.blur.soft}px)` }),
  shown: { opacity: 1, y: "0%", filter: "blur(0px)", transition: { y: RISE, opacity: { duration: 0.24, ease: enter }, filter: { duration: 0.28, ease: enter } } },
  gone: (direction: number) => ({ opacity: 0, y: `${direction * -60}%`, filter: `blur(${motionPresets.blur.soft}px)`, transition: { y: RISE, opacity: { duration: 0.16, ease: standard }, filter: { duration: 0.16, ease: standard } } }),
}
const fadeVariants: Variants = { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: 0.2 } }, gone: { opacity: 0, transition: { duration: 0.12 } } }

function parts(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000))
  return { d: Math.floor(total / 86400), h: Math.floor((total % 86400) / 3600), m: Math.floor((total % 3600) / 60), s: total % 60 }
}
const pad = (value: number) => String(value).padStart(2, "0")

function Digit({ char, reduced }: { char: string; reduced: boolean }) {
  return (
    <span className="relative inline-block overflow-clip text-center">
      <span className="invisible" aria-hidden="true">0</span>
      <AnimatePresence initial={false}>
        <motion.span
          key={char}
          className="absolute inset-0 block"
          initial={reduced ? { opacity: 0 } : { y: "-70%", opacity: 0 }}
          animate={{ y: "0%", opacity: 1 }}
          exit={reduced ? { opacity: 0 } : { y: "70%", opacity: 0 }}
          transition={reduced ? { duration: 0.12 } : { y: physical(0.32, 0.08), opacity: { duration: 0.16 } }}
        >
          {char}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function Countdown({ to, label, reduced, onEnd, inverted }: { to: Date | string | number; label?: string; reduced: boolean; onEnd?: () => void; inverted?: boolean }) {
  const target = new Date(to).getTime()
  const [now, setNow] = useState<number | null>(null)
  const ended = useRef(false)
  const endRef = useRef(onEnd)
  useEffect(() => {
    endRef.current = onEnd
  }, [onEnd])
  useEffect(() => {
    let timer = 0
    const tick = () => {
      const current = Date.now()
      setNow(current)
      if (current >= target) {
        if (!ended.current) {
          ended.current = true
          endRef.current?.()
        }
        return
      }
      timer = window.setTimeout(tick, 1000 - (current % 1000) + 8)
    }
    timer = window.setTimeout(tick, 0)
    return () => window.clearTimeout(timer)
  }, [target])
  const { d, h, m, s } = parts(now === null ? 0 : target - now)
  const pending = now === null
  const spoken = pending ? "" : `${d ? `${d} days ` : ""}${h} hours ${m} minutes`
  const digits = (value: string, key: string) => value.split("").map((char, index) => <Digit key={`${key}${value.length - index}`} char={pending ? "0" : char} reduced={reduced} />)
  return (
    <span className={cn("inline-flex items-baseline gap-1.5 whitespace-nowrap", inverted ? "text-background/70" : "text-muted-foreground")}>
      {label ? <span>{label}</span> : null}
      <span role="timer" aria-live="off" aria-label={spoken} className={cn("inline-flex items-baseline font-medium tabular-nums", inverted ? "text-background" : "text-foreground", pending && "opacity-0")}>
        {d ? (
          <>
            <span className="inline-flex items-baseline">
              {digits(String(d), "d")}
              <span className={cn("ml-px font-normal", inverted ? "text-background/70" : "text-muted-foreground")} aria-hidden="true">d</span>
            </span>
            <span className="inline-block w-[0.4em]" aria-hidden="true" />
          </>
        ) : null}
        {digits(pad(h), "h")}
        <span className={cn("inline-block px-px font-normal", inverted ? "text-background/70" : "text-muted-foreground")} aria-hidden="true">:</span>
        {digits(pad(m), "m")}
        <span className={cn("inline-block px-px font-normal", inverted ? "text-background/70" : "text-muted-foreground")} aria-hidden="true">:</span>
        {digits(pad(s), "s")}
      </span>
    </span>
  )
}

function Face({ announcement, direction, reduced, position, total, inverted, onSize, onAction, onCountdownEnd, className }: { announcement: Announcement; direction: number; reduced: boolean; position: number; total: number; inverted?: boolean; onSize: (height: number) => void; onAction?: (announcement: Announcement) => void; onCountdownEnd?: (announcement: Announcement) => void; className?: string }) {
  const ref = useRef<HTMLDivElement>(null)
  const present = useIsPresent()
  useLayoutEffect(() => {
    const node = ref.current
    if (!node || !present) return
    const report = () => onSize(node.offsetHeight)
    report()
    if (typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(report)
    observer.observe(node)
    return () => observer.disconnect()
  }, [onSize, present])
  const { action, countdown } = announcement
  const cta = action ? (
    action.href ? (
      <a className="inline-flex items-center gap-1 bg-transparent font-medium whitespace-nowrap text-inherit no-underline [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5" href={action.href} onClick={() => { action.onClick?.(); onAction?.(announcement) }}>
        {action.label}
        <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
      </a>
    ) : (
      <button type="button" className="inline-flex cursor-pointer items-center gap-1 border-0 bg-transparent font-medium whitespace-nowrap text-inherit [&_svg]:transition-transform hover:[&_svg]:translate-x-0.5" onClick={() => { action.onClick?.(); onAction?.(announcement) }}>
        {action.label}
        <ArrowRight size={14} strokeWidth={1.75} aria-hidden="true" />
      </button>
    )
  ) : null
  return (
    <motion.div
      ref={ref}
      className="absolute inset-x-0 top-0 flex min-h-8 items-center justify-center @max-[560px]:justify-start"
      custom={direction}
      variants={reduced ? fadeVariants : faceVariants}
      initial="hidden"
      animate="shown"
      exit="gone"
      role={total > 1 ? "group" : undefined}
      aria-roledescription={total > 1 ? "slide" : undefined}
      aria-label={total > 1 ? `${position} of ${total}` : undefined}
      inert={!present || undefined}
    >
      <p className={cn("m-0 flex flex-wrap items-baseline justify-center gap-x-3 gap-y-0.5 px-0 py-1.5 text-center text-sm leading-snug text-balance @max-[560px]:justify-start @max-[560px]:text-left", className)}>
        <span className="min-w-0">{announcement.message}</span>
        {countdown ? <Countdown to={countdown.to} label={countdown.label} reduced={reduced} inverted={inverted} onEnd={() => onCountdownEnd?.(announcement)} /> : null}
        {cta}
      </p>
    </motion.div>
  )
}

const RING = 2 * Math.PI * 8

export const AnnouncementBar = forwardRef<HTMLElement, AnnouncementBarProps>(function AnnouncementBar({
  messages,
  id,
  open: openProp,
  defaultOpen = true,
  onOpenChange,
  index: indexProp,
  defaultIndex = 0,
  onIndexChange,
  interval = 6000,
  autoPlay = true,
  controls = false,
  dismissible = true,
  tone = "neutral",
  onAction,
  onCountdownEnd,
  label = "Announcements",
  className,
  classNames,
}, ref) {
  const reduced = !!useReducedMotion()
  const uid = useId()
  const total = messages.length
  const [openInternal, setOpenInternal] = useState(defaultOpen)
  const remembered = useSyncExternalStore(
    subscribeDismissal,
    () => {
      if (!id || openProp !== undefined) return false
      try {
        return window.localStorage.getItem(storageKey(id)) === "dismissed"
      } catch {
        return false
      }
    },
    () => false,
  )
  const open = openProp ?? (openInternal && !remembered)

  const dismiss = () => {
    if (id) {
      try {
        window.localStorage.setItem(storageKey(id), "dismissed")
      } catch {
        /* Storage can be blocked. */
      }
    }
    if (openProp === undefined) setOpenInternal(false)
    onOpenChange?.(false)
  }

  const [indexInternal, setIndexInternal] = useState(defaultIndex)
  const current = total ? ((indexProp ?? indexInternal) % total + total) % total : 0
  const [direction, setDirection] = useState(1)
  const go = useCallback((step: number) => {
    if (total < 2) return
    const next = ((current + step) % total + total) % total
    setDirection(step > 0 ? 1 : -1)
    if (indexProp === undefined) setIndexInternal(next)
    onIndexChange?.(next)
  }, [current, indexProp, onIndexChange, total])

  const [userPaused, setUserPaused] = useState(false)
  const [hovered, setHovered] = useState(false)
  const [focused, setFocused] = useState(false)
  const [hidden, setHidden] = useState(false)
  useEffect(() => {
    const read = () => setHidden(document.visibilityState === "hidden")
    document.addEventListener("visibilitychange", read)
    return () => document.removeEventListener("visibilitychange", read)
  }, [])
  const rotating = autoPlay && !reduced && total > 1
  const running = rotating && open && !userPaused && !hovered && !focused && !hidden

  const progress = useMotionValue(0)
  const dash = useTransform(progress, (value) => RING * (1 - value))
  const goRef = useRef(go)
  useEffect(() => {
    goRef.current = go
  }, [go])
  useEffect(() => {
    progress.jump(0)
  }, [current, progress])
  useEffect(() => {
    if (!running) return
    let playback: AnimationPlaybackControls | null = animate(progress, 1, {
      duration: (interval / 1000) * (1 - progress.get()),
      ease: "linear",
      onComplete: () => {
        playback = null
        goRef.current(1)
      },
    })
    return () => playback?.stop()
  }, [running, current, interval, progress])

  const height = useMotionValue<number | "auto">("auto")
  const measured = useRef(0)
  const onSize = useCallback((next: number) => {
    if (Math.abs(next - measured.current) < 0.5) return
    const first = measured.current === 0
    measured.current = next
    if (first || reduced) height.jump(next)
    else animate(height, next, HEIGHT)
  }, [height, reduced])

  const announcement = messages[current]
  if (!announcement) return null
  const navigable = controls && total > 1
  const controlCount = (navigable ? 2 + (rotating ? 1 : 0) : 0) + (dismissible ? 1 : 0)
  const inverted = tone === "inverted"
  const iconButton = cn("size-8 rounded-full", inverted ? "text-background/70 hover:bg-background/10 hover:text-background" : "text-muted-foreground hover:text-foreground")

  return (
    <AnimatePresence initial={false}>
      {open ? (
        <motion.section
          key="bar"
          ref={ref}
          data-slot="announcement-bar"
          className={cn("@container overflow-hidden", className, classNames?.root)}
          aria-label={label}
          aria-roledescription={total > 1 ? "carousel" : undefined}
          initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={reduced ? { opacity: 0, transition: { duration: 0.16 } } : { height: 0, opacity: 0, transition: { height: COLLAPSE, opacity: { duration: 0.2, ease: standard } } }}
          transition={reduced ? { duration: 0.16 } : { height: COLLAPSE, opacity: { duration: 0.24, ease: enter } }}
          onPointerEnter={(event) => {
            if (event.pointerType === "mouse") setHovered(true)
          }}
          onPointerLeave={() => setHovered(false)}
          onFocus={() => setFocused(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocused(false)
          }}
        >
          <div
            data-slot="announcement-bar-bar"
            data-tone={tone}
            className={cn("grid grid-cols-[calc(var(--controls)*2rem+max(var(--controls)-1,0)*2px)_minmax(0,1fr)_auto] items-center gap-3 border-b border-border bg-muted py-1.5 pr-2 pl-4 text-foreground @max-[560px]:grid-cols-[0_minmax(0,1fr)_auto] @max-[560px]:gap-x-2 @max-[560px]:pl-3.5", inverted && "border-transparent bg-foreground text-background", classNames?.bar)}
            style={{ "--controls": controlCount } as CSSProperties}
          >
            <div className="min-w-0" aria-hidden="true" />
            <motion.div data-slot="announcement-bar-viewport" className="relative min-h-8 overflow-hidden" style={{ height }} id={`${uid}-slides`} aria-live={running ? "off" : "polite"} aria-atomic="false">
              <AnimatePresence initial={false} custom={direction}>
                <Face key={announcement.id} announcement={announcement} direction={direction} reduced={reduced} position={current + 1} total={total} inverted={inverted} onSize={onSize} onAction={onAction} onCountdownEnd={onCountdownEnd} className={classNames?.message} />
              </AnimatePresence>
            </motion.div>
            <div data-slot="announcement-bar-controls" className={cn("flex items-center gap-0.5", classNames?.controls)}>
              {navigable ? (
                <>
                  <Button type="button" variant="ghost" size="icon" className={iconButton} aria-label="Previous announcement" aria-controls={`${uid}-slides`} onClick={() => go(-1)}>
                    <ChevronUp size={16} strokeWidth={1.75} aria-hidden="true" />
                  </Button>
                  {rotating ? (
                    <Button type="button" variant="ghost" size="icon" className={cn(iconButton, "relative")} aria-label={userPaused ? "Resume announcements" : "Pause announcements"} aria-pressed={userPaused} onClick={() => setUserPaused((paused) => !paused)}>
                      <svg viewBox="0 0 20 20" className="size-5 overflow-visible -rotate-90" aria-hidden="true">
                        <circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeOpacity={0.22} strokeWidth={1.75} />
                        <motion.circle cx="10" cy="10" r="8" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth={1.75} strokeDasharray={RING} style={{ strokeDashoffset: dash }} />
                      </svg>
                      <span className="absolute inset-0 grid place-items-center">{userPaused ? <Play size={9} strokeWidth={2.4} aria-hidden="true" className="fill-current" /> : <Pause size={9} strokeWidth={2.4} aria-hidden="true" className="fill-current" />}</span>
                    </Button>
                  ) : null}
                  <Button type="button" variant="ghost" size="icon" className={iconButton} aria-label="Next announcement" aria-controls={`${uid}-slides`} onClick={() => go(1)}>
                    <ChevronDown size={16} strokeWidth={1.75} aria-hidden="true" />
                  </Button>
                </>
              ) : null}
              {dismissible ? (
                <Button type="button" variant="ghost" size="icon" className={cn(iconButton, classNames?.dismiss)} aria-label="Dismiss" onClick={dismiss}>
                  <X size={16} strokeWidth={1.75} aria-hidden="true" />
                </Button>
              ) : null}
            </div>
          </div>
        </motion.section>
      ) : null}
    </AnimatePresence>
  )
})
