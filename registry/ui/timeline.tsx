"use client"

/** Adapted from Arc UI (MIT). */

import { createContext, useCallback, useContext, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react"
import type { CSSProperties, KeyboardEvent, ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { Transition } from "motion/react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface TimelineEvent {
  id: string
  /** When it happened, as an ISO string or epoch milliseconds. */
  at: string | number
  /** Who did it, shown first in the foreground color. */
  actor?: string
  /** What happened, completing the actor: "merged Checkout redesign into main". */
  title: string
  /** Short context under the title, such as a pull request or a build. */
  meta?: string
  /** Revealed in place when the row is expanded. Rows without detail are not interactive. */
  detail?: ReactNode
  /** Portrait for an event by a person. */
  avatar?: string
  /** Icon for a system event, used when there is no avatar. */
  icon?: ReactNode
  /** Status of a system event. Always say the outcome in the title too, so it never rests on color. */
  tone?: "neutral" | "success" | "danger"
}

/**
 * A vertical activity feed grouped by day, for project history, audit logs, and deploy streams. Use it when order and
 * recency matter; use a table when people need to sort or compare. Day labels stay pinned while their updates scroll,
 * the connecting line draws itself as rows come into view, rows expand in place, and new updates slide in at the top
 * while the rest glide down. Arrow keys move between rows, Enter or Space expands one.
 */
export interface TimelineProps {
  /** Updates in any order; the newest shows first. */
  events: TimelineEvent[]
  /** Reference time for relative labels and day groups, in epoch milliseconds. Pass a ticking clock to keep labels fresh. */
  now: number
  /** Accessible name for the feed. */
  label: string
  /** Time zone for day groups and clock times. Fixed by default so server and client agree. */
  timeZone?: string
  locale?: string
  /** Height of the scrolling area. Without it the feed grows with the page and reveals on page scroll. */
  maxHeight?: number | string
  /** Scroll back to the top when a new update arrives while the feed is scrolled down. */
  scrollToNew?: boolean
  defaultExpanded?: string[]
  /** Heading level for the day labels. */
  headingLevel?: 2 | 3 | 4 | 5 | 6
  className?: string
  classNames?: TimelineClassNames
}

export type TimelineClassNames = {
  root?: string
  scroller?: string
  day?: string
  item?: string
  title?: string
  detail?: string
}

type Row = TimelineEvent & { time: number; day: string }
type Group = { day: string; label: string; rows: Row[] }

const HOUR = 3_600_000
const enter = [...motionPresets.ease.enter] as [number, number, number, number]
const standard = [...motionPresets.ease.standard] as [number, number, number, number]
const STEP = 0.09
const noopSubscribe = () => () => {}

function useReducedMotionSafe() {
  const hydrated = useSyncExternalStore(noopSubscribe, () => true, () => false)
  const reduced = useReducedMotion()
  return hydrated && !!reduced
}

type Clock = { schedule: () => number; reduced: boolean; fresh: Set<string> }
const RevealClock = createContext<Clock | null>(null)

function RiseText({ text, reduced, direction = 1 }: { text: string; reduced: boolean; direction?: number }) {
  return (
    <span className="relative inline-flex" aria-hidden="true">
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.span
          key={text}
          className="inline-block whitespace-nowrap"
          custom={direction}
          variants={{
            from: (dir: number) => (reduced ? { opacity: 0 } : { opacity: 0, y: `${0.3 * dir}em`, filter: `blur(${motionPresets.blur.soft}px)` }),
            to: { opacity: 1, y: "0em", filter: "blur(0px)" },
            gone: (dir: number) => (reduced ? { opacity: 0, transition: { duration: 0 } } : { opacity: 0, y: `${-0.3 * dir}em`, filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: 0.14, ease: standard } }),
          }}
          initial="from"
          animate="to"
          exit="gone"
          transition={{ duration: reduced ? 0.15 : 0.22, ease: enter }}
        >
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

function RollingCount({ value, reduced }: { value: number; reduced: boolean }) {
  const [state, setState] = useState({ value, direction: 1 })
  if (state.value !== value) setState({ value, direction: value > state.value ? 1 : -1 })
  const chars = [...String(value)]
  return (
    <span className="inline-flex" aria-hidden="true">
      {chars.map((char, index) => (
        <span key={chars.length - index} className="relative inline-flex overflow-clip">
          <RiseText text={char} reduced={reduced} direction={state.direction} />
        </span>
      ))}
    </span>
  )
}

function dayKey(time: number, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).formatToParts(new Date(time))
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? ""
  return `${get("year")}-${get("month")}-${get("day")}`
}

function relative(time: number, now: number) {
  const minutes = Math.max(0, Math.floor((now - time) / 60_000))
  if (minutes < 1) return { short: "Now", long: "just now" }
  if (minutes < 60) return { short: `${minutes}m`, long: `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago` }
  const hours = Math.floor(minutes / 60)
  return { short: `${hours}h`, long: `${hours} ${hours === 1 ? "hour" : "hours"} ago` }
}

function DaySection({ id, fresh, reduced, children }: { id: string; fresh: boolean; reduced: boolean; children: ReactNode }) {
  const [entering, setEntering] = useState(fresh)
  return (
    <motion.section
      className="relative data-[entering]:overflow-clip"
      aria-labelledby={id}
      data-entering={entering || undefined}
      initial={fresh ? { height: 0, opacity: 0 } : false}
      animate={{ height: "auto", opacity: 1 }}
      exit={{ height: 0, opacity: 0, transition: { duration: reduced ? 0.1 : 0.2, ease: standard } }}
      transition={reduced ? { duration: 0.15 } : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.standard, ease: enter } }}
      onAnimationComplete={() => setEntering(false)}
    >
      {children}
    </motion.section>
  )
}

const toneClass = {
  neutral: "bg-muted text-muted-foreground",
  success: "bg-primary/15 text-primary",
  danger: "bg-destructive/15 text-destructive",
}

function TimelineRow({ row, last, expanded, onToggle, timeLabel, timeFull, classNames }: { row: Row; last: boolean; expanded: boolean; onToggle: () => void; timeLabel: string; timeFull: string; classNames?: TimelineClassNames }) {
  const clock = useContext(RevealClock)!
  const { reduced } = clock
  const detailId = useId()
  const [revealDelay, setRevealDelay] = useState<number | null>(null)
  const fresh = clock.fresh.has(row.id)
  const [entering, setEntering] = useState(fresh)
  const shown = revealDelay !== null
  const delay = (revealDelay ?? 0) + (fresh ? 0.12 : 0)
  const pop: Transition = reduced ? { duration: 0, opacity: { duration: 0.15 } } : { ...motionPresets.spring.morph, visualDuration: 0.36, bounce: 0.32, delay, opacity: { duration: motionPresets.duration.fast, ease: enter, delay } }
  const draw: Transition = reduced ? { duration: 0 } : { ...motionPresets.spring.smooth, visualDuration: 0.34, delay: delay + 0.1 }
  const tone = row.avatar ? undefined : row.tone ?? "neutral"
  const Trigger = row.detail ? "button" : "div"

  return (
    <motion.li
      data-slot="timeline-item"
      className={cn("relative pl-10 data-[entering]:overflow-clip", classNames?.item)}
      data-entering={entering || undefined}
      initial={fresh ? { height: 0 } : false}
      animate={{ height: "auto" }}
      exit={{ height: 0, opacity: 0, transition: reduced ? { duration: 0.1 } : { height: { ...motionPresets.spring.smooth, visualDuration: 0.3 }, opacity: { duration: 0.12 } } }}
      transition={reduced ? { duration: 0 } : motionPresets.spring.smooth}
      onAnimationComplete={() => setEntering(false)}
      onViewportEnter={() => setRevealDelay((current) => current ?? clock.schedule())}
      viewport={{ once: true, amount: 0.2 }}
    >
      <motion.span
        data-slot="timeline-marker"
        data-tone={tone}
        aria-hidden="true"
        className={cn("absolute top-2 left-0 z-10 grid size-7 place-items-center rounded-full text-muted-foreground ring-1 ring-foreground/10 [&_img]:size-full [&_img]:rounded-[inherit] [&_img]:object-cover [&_svg]:size-3.5", tone && toneClass[tone])}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={shown ? { scale: 1, opacity: 1 } : undefined}
        transition={pop}
      >
        {row.avatar ? (
          // Registry pieces stay free of the Next image runtime.
          // eslint-disable-next-line @next/next/no-img-element
          <img src={row.avatar} alt="" width={28} height={28} decoding="async" />
        ) : row.icon}
      </motion.span>
      {!last ? <motion.span className="absolute top-10 bottom-0 left-[13px] w-px origin-top bg-border" aria-hidden="true" initial={{ scaleY: 0 }} animate={shown ? { scaleY: 1 } : undefined} transition={draw} /> : null}
      <motion.div
        className="min-w-0"
        initial={fresh ? (reduced ? { opacity: 0 } : { opacity: 0, y: -10, filter: `blur(${motionPresets.blur.soft}px)` }) : false}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={reduced ? { duration: 0.15 } : { y: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.standard, ease: enter, delay: 0.05 }, filter: { duration: motionPresets.duration.standard, ease: enter, delay: 0.05 } }}
      >
        <Trigger
          className={cn("m-0 grid w-full grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 rounded-lg bg-transparent p-3 text-left text-inherit max-[420px]:gap-x-2 max-[420px]:px-2", row.detail && "grid-cols-[minmax(0,1fr)_auto_1rem] cursor-pointer hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none")}
          {...(row.detail ? { type: "button" as const, "data-timeline-trigger": "", "aria-expanded": expanded, "aria-controls": expanded ? detailId : undefined, onClick: onToggle } : {})}
        >
          <span className="grid min-w-0 gap-0.5">
            <span data-slot="timeline-title" className={cn("text-sm leading-5 text-muted-foreground", classNames?.title)}>
              {row.actor ? <span className="font-medium text-foreground">{row.actor}</span> : null}
              {row.actor ? " " : ""}
              {row.title}
            </span>
            {row.meta ? <span className="text-xs leading-snug text-muted-foreground">{row.meta}</span> : null}
          </span>
          <time className="flex min-w-11 justify-end text-xs leading-5 whitespace-nowrap text-muted-foreground tabular-nums" dateTime={new Date(row.time).toISOString()} title={timeFull}>
            <RiseText text={timeLabel} reduced={reduced} />
            <span className="sr-only">{timeFull}</span>
          </time>
          {row.detail ? (
            <motion.span className="grid h-5 place-items-center text-muted-foreground" aria-hidden="true" initial={false} animate={{ rotate: expanded ? 180 : 0 }} transition={reduced ? { duration: 0 } : motionPresets.spring.snappy}>
              <ChevronDown size={16} strokeWidth={1.75} />
            </motion.span>
          ) : null}
        </Trigger>
        <AnimatePresence initial={false}>
          {expanded && row.detail ? (
            <motion.div
              key="detail"
              id={detailId}
              data-slot="timeline-detail"
              className={cn("overflow-clip", classNames?.detail)}
              initial={{ height: 0 }}
              animate={{ height: "auto" }}
              exit={{ height: 0, transition: reduced ? { duration: 0 } : { ...motionPresets.spring.smooth, visualDuration: 0.28 } }}
              transition={reduced ? { duration: 0 } : motionPresets.spring.smooth}
            >
              <motion.div
                className="px-3 pb-4 text-sm leading-snug text-muted-foreground max-[420px]:px-2"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -4, filter: `blur(${motionPresets.blur.soft}px)` }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, transition: { duration: 0.1, ease: standard } }}
                transition={reduced ? { duration: 0.15 } : { duration: motionPresets.duration.standard, ease: enter, delay: 0.06 }}
              >
                {row.detail}
              </motion.div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.li>
  )
}

export function Timeline({ events, now, label, timeZone = "UTC", locale = "en-US", maxHeight, scrollToNew = true, defaultExpanded = [], headingLevel = 3, className, classNames }: TimelineProps) {
  const reduced = useReducedMotionSafe()
  const id = useId()
  const scrollerRef = useRef<HTMLDivElement>(null)
  const [expanded, setExpanded] = useState(() => new Set(defaultExpanded))
  const ids = events.map((event) => event.id).join("|")
  const [known, setKnown] = useState(() => ({ ids, set: new Set(events.map((event) => event.id)), fresh: new Set<string>(), announcement: "" }))
  if (known.ids !== ids) {
    const added = events.filter((event) => !known.set.has(event.id))
    setKnown({
      ids,
      set: new Set(events.map((event) => event.id)),
      fresh: new Set([...known.fresh, ...added.map((event) => event.id)]),
      announcement: added.length ? `New update: ${added.map((event) => [event.actor, event.title].filter(Boolean).join(" ")).join(". ")}` : known.announcement,
    })
  }
  const trackRef = useRef<HTMLDivElement>(null)
  const scrolls = maxHeight !== undefined
  const [more, setMore] = useState(false)
  useEffect(() => {
    const scroller = scrollerRef.current
    const track = trackRef.current
    if (!scrolls || !scroller || !track || typeof ResizeObserver === "undefined") return
    const update = () => setMore(scroller.scrollHeight - scroller.clientHeight - scroller.scrollTop > 2)
    update()
    scroller.addEventListener("scroll", update, { passive: true })
    const observer = new ResizeObserver(update)
    observer.observe(scroller)
    observer.observe(track)
    return () => {
      scroller.removeEventListener("scroll", update)
      observer.disconnect()
    }
  }, [scrolls])

  const newestId = events.reduce<TimelineEvent | null>((latest, event) => (!latest || new Date(event.at).getTime() > new Date(latest.at).getTime() ? event : latest), null)?.id
  useEffect(() => {
    const scroller = scrollerRef.current
    if (!scrollToNew || !scroller || scroller.scrollTop < 1) return
    scroller.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" })
  }, [newestId, scrollToNew, reduced])

  const [initialDays] = useState(() => new Set(events.map((event) => dayKey(new Date(event.at).getTime(), timeZone))))
  const groups = useMemo<Group[]>(() => {
    const today = dayKey(now, timeZone)
    const yesterday = dayKey(now - 24 * HOUR, timeZone)
    const heading = new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", timeZone })
    const byDay = new Map<string, Row[]>()
    ;[...events]
      .map((event) => ({ ...event, time: new Date(event.at).getTime() }))
      .sort((a, b) => b.time - a.time)
      .forEach((event) => {
        const day = dayKey(event.time, timeZone)
        byDay.set(day, [...(byDay.get(day) ?? []), { ...event, day }])
      })
    return [...byDay].map(([day, rows]) => ({ day, rows, label: day === today ? "Today" : day === yesterday ? "Yesterday" : heading.format(new Date(rows[0].time)) }))
  }, [events, now, timeZone, locale])
  const formats = useMemo(() => ({
    clock: new Intl.DateTimeFormat(locale, { hour: "numeric", minute: "2-digit", timeZone }),
    full: new Intl.DateTimeFormat(locale, { weekday: "long", month: "long", day: "numeric", hour: "numeric", minute: "2-digit", timeZone }),
  }), [locale, timeZone])

  const nextReveal = useRef(0)
  const schedule = useCallback(() => {
    if (reduced) return 0
    const current = performance.now() / 1000
    const start = Math.min(Math.max(current, nextReveal.current), current + 0.45)
    nextReveal.current = start + STEP
    return start - current
  }, [reduced])
  const clock = useMemo<Clock>(() => ({ schedule, reduced, fresh: known.fresh }), [schedule, reduced, known.fresh])

  function toggle(rowId: string) {
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(rowId)) next.delete(rowId)
      else next.add(rowId)
      return next
    })
  }
  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
    const triggers = [...(scrollerRef.current?.querySelectorAll<HTMLElement>("[data-timeline-trigger]") ?? [])]
    const index = triggers.indexOf(document.activeElement as HTMLElement)
    if (index < 0) return
    event.preventDefault()
    const next = event.key === "Home" ? 0 : event.key === "End" ? triggers.length - 1 : Math.min(Math.max(index + (event.key === "ArrowDown" ? 1 : -1), 0), triggers.length - 1)
    triggers[next]?.focus()
  }

  const height = typeof maxHeight === "number" ? `${maxHeight}px` : maxHeight

  return (
    <RevealClock.Provider value={clock}>
      <div data-slot="timeline" role="region" aria-label={label} className={cn("relative grid min-w-0 text-foreground", className, classNames?.root)}>
        <div
          ref={scrollerRef}
          data-slot="timeline-scroller"
          data-scrolls={scrolls || undefined}
          data-more={more || undefined}
          className={cn("relative min-w-0 [overflow-anchor:none]", scrolls && "max-h-(--timeline-height) overflow-y-auto overscroll-contain", classNames?.scroller)}
          style={scrolls ? ({ "--timeline-height": height } as CSSProperties) : undefined}
          onKeyDown={onKeyDown}
        >
          <div ref={trackRef}>
            <AnimatePresence>
              {groups.map((group) => (
                <DaySection key={group.day} id={`${id}-${group.day}`} fresh={!initialDays.has(group.day)} reduced={reduced}>
                  <div data-slot="timeline-day" role="heading" aria-level={headingLevel} id={`${id}-${group.day}`} className={cn("sticky top-0 z-20 flex items-baseline justify-between gap-3 bg-background py-2 pr-3 text-sm font-medium", classNames?.day)}>
                    <span>{group.label}</span>
                    <span className="text-xs font-normal text-muted-foreground tabular-nums" aria-hidden="true">
                      <RollingCount value={group.rows.length} reduced={reduced} /> {group.rows.length === 1 ? "update" : "updates"}
                    </span>
                    <span className="sr-only">{`, ${group.rows.length} ${group.rows.length === 1 ? "update" : "updates"}`}</span>
                  </div>
                  <ol className="m-0 mb-3 list-none p-0">
                    <AnimatePresence>
                      {group.rows.map((row, index) => {
                        const today = group.label === "Today" && now - row.time < 12 * HOUR
                        const time = today ? relative(row.time, now) : { short: formats.clock.format(new Date(row.time)), long: "" }
                        return (
                          <TimelineRow
                            key={row.id}
                            row={row}
                            last={index === group.rows.length - 1}
                            expanded={expanded.has(row.id)}
                            onToggle={() => toggle(row.id)}
                            timeLabel={time.short}
                            timeFull={today ? `${time.long}, ${formats.full.format(new Date(row.time))}` : formats.full.format(new Date(row.time))}
                            classNames={classNames}
                          />
                        )
                      })}
                    </AnimatePresence>
                  </ol>
                </DaySection>
              ))}
            </AnimatePresence>
          </div>
        </div>
        {scrolls && more ? <div className="pointer-events-none absolute inset-x-0 bottom-0 h-9 bg-gradient-to-b from-transparent to-background" aria-hidden="true" /> : null}
        <span className="sr-only" role="status">{known.announcement}</span>
      </div>
    </RevealClock.Provider>
  )
}
