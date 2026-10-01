"use client"

/** Adapted from Arc UI (MIT). */

import { useCallback, useEffect, useId, useMemo, useRef, useState, type FocusEvent, type FormEvent, type KeyboardEvent } from "react"
import { AnimatePresence, motion, useAnimate, useReducedMotion, type Transition, type Variants } from "motion/react"
import { ArrowRight, Bell, Check, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { CopyButton } from "@/registry/retana/ui/copy-button"
import {
  exampleEntries,
  exampleMonths,
  type ChangelogEntry,
  type ChangelogKind,
  type ChangelogMedia,
  type ChangelogMonth,
} from "./changelog-feed-data"

export type { ChangelogEntry, ChangelogKind, ChangelogMedia, ChangelogMonth }

export type ChangelogFeedClassNames = {
  root?: string
  header?: string
  toolbar?: string
  list?: string
}

export type ChangelogFeedProps = {
  /** Release notes, newest first. Each entry belongs to one of `months` by key. */
  entries?: ChangelogEntry[]
  /** Months shown in the month bar, newest first. */
  months?: ChangelogMonth[]
  title?: string
  /** One line under the title, such as the latest release. */
  subtitle?: string
  /** Closing line at the end of the list. */
  endNote?: string
  /** Entry ids open on first render. Defaults to the newest entry. */
  defaultOpen?: string[]
  className?: string
  classNames?: ChangelogFeedClassNames
}

const kinds: { id: ChangelogKind; label: string }[] = [
  { id: "new", label: "New" },
  { id: "improved", label: "Improved" },
  { id: "fixed", label: "Fixed" },
]

const blurSoft = `blur(${motionPresets.blur.soft}px)`
const blurSubtle = `blur(${motionPresets.blur.subtle}px)`
const none = "blur(0px)"
const instant: Transition = { duration: 0 }
const exitSpring: Transition = { type: "spring", visualDuration: 0.28, bounce: 0 }

const roll: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: `${direction * 55}%`, filter: blurSubtle }),
  center: { opacity: 1, y: "0%", filter: none },
  exit: (direction: number) => ({ opacity: 0, y: `${direction * -55}%`, filter: blurSubtle }),
}

const rise: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: direction * 14, filter: blurSoft }),
  center: { opacity: 1, y: 0, filter: none },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction * -14,
    filter: blurSoft,
    transition: { duration: motionPresets.duration.exit, ease: [...motionPresets.ease.standard] },
  }),
}

function RollingNumber({ value, reduce }: { value: number; reduce: boolean }) {
  const [state, setState] = useState({ value, direction: 1 })
  if (state.value !== value) setState({ value, direction: value > state.value ? 1 : -1 })
  return (
    <span className="relative inline-flex overflow-hidden tabular-nums">
      <AnimatePresence mode="popLayout" initial={false} custom={state.direction}>
        <motion.span
          key={value}
          custom={state.direction}
          variants={roll}
          initial="enter"
          animate="center"
          exit="exit"
          transition={reduce ? instant : motionPresets.spring.snappy}
        >
          {value}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
type SubscribeState = "idle" | "editing" | "done"

function SubscribeControl({ reduce }: { reduce: boolean }) {
  const inputId = useId()
  const [state, setState] = useState<SubscribeState>("idle")
  const [email, setEmail] = useState("")
  const [error, setError] = useState(false)
  const [width, setWidth] = useState<number | null>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const idleRef = useRef<HTMLButtonElement>(null)
  const undoRef = useRef<HTMLButtonElement>(null)
  const focusNext = useRef(false)
  const [shakeScope, animateShake] = useAnimate<HTMLDivElement>()

  useEffect(() => {
    const element = innerRef.current
    if (!element) return
    const observer = new ResizeObserver(() => setWidth(element.offsetWidth))
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    if (!focusNext.current) return
    focusNext.current = false
    const target = state === "editing" ? inputRef.current : state === "done" ? undoRef.current : idleRef.current
    target?.focus({ preventScroll: true })
  }, [state])

  function go(next: SubscribeState, focus = true) {
    focusNext.current = focus
    setState(next)
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!emailPattern.test(email.trim())) {
      setError(true)
      if (!reduce && shakeScope.current) void animateShake(shakeScope.current, { x: [0, -6, 5, -3, 2, 0] }, { duration: 0.4, ease: "easeOut" })
      inputRef.current?.focus()
      return
    }
    setError(false)
    go("done")
  }

  function onKeyDown(event: KeyboardEvent<HTMLFormElement>) {
    if (event.key === "Escape") {
      setError(false)
      go("idle")
    }
  }

  function onBlur(event: FocusEvent<HTMLFormElement>) {
    if (!event.currentTarget.contains(event.relatedTarget as Node | null) && !email.trim()) {
      setError(false)
      go("idle", false)
    }
  }

  const swapMotion: Transition = reduce
    ? { duration: motionPresets.duration.instant }
    : { opacity: { duration: 0.2, delay: 0.05 }, filter: { duration: 0.2, delay: 0.05 }, scale: { ...motionPresets.spring.morph, delay: 0.03 } }
  const leave = { opacity: 0, scale: 0.96, filter: blurSubtle, transition: { duration: motionPresets.duration.instant } }
  const note = error ? "Enter a valid email address" : state === "done" ? "Subscribed." : ""

  return (
    <div className="relative shrink-0 pt-0.5">
      <div ref={shakeScope}>
        <motion.div
          className={cn(
            "h-9 overflow-hidden rounded-full border border-foreground bg-foreground text-background",
            state === "editing" && "border-border bg-background text-foreground",
            state === "done" && "border-border bg-muted text-foreground",
            error && "border-destructive",
          )}
          data-state={state}
          initial={false}
          animate={{ width: width ?? "auto" }}
          transition={reduce ? instant : motionPresets.spring.morph}
        >
          <div ref={innerRef} className="relative flex h-full w-max">
            <AnimatePresence mode="popLayout" initial={false}>
              {state === "idle" ? (
                <motion.button
                  key="idle"
                  ref={idleRef}
                  type="button"
                  className="inline-flex h-full items-center gap-1.5 bg-transparent px-4 text-sm font-medium whitespace-nowrap focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  onClick={() => go("editing")}
                  initial={{ opacity: 0, scale: 0.96, filter: blurSubtle }}
                  animate={{ opacity: 1, scale: 1, filter: none }}
                  exit={leave}
                  transition={swapMotion}
                >
                  <Bell className="size-3.5" aria-hidden="true" />
                  Subscribe
                </motion.button>
              ) : null}
              {state === "editing" ? (
                <motion.form
                  key="form"
                  className="flex h-full items-center gap-1.5 pr-1 pl-4"
                  noValidate
                  onSubmit={submit}
                  onKeyDown={onKeyDown}
                  onBlur={onBlur}
                  initial={{ opacity: 0, scale: 0.96, filter: blurSubtle }}
                  animate={{ opacity: 1, scale: 1, filter: none }}
                  exit={leave}
                  transition={swapMotion}
                >
                  <label className="sr-only" htmlFor={inputId}>
                    Email address
                  </label>
                  <Input
                    ref={inputRef}
                    id={inputId}
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="hola@costa-atelier.example"
                    value={email}
                    aria-invalid={error || undefined}
                    className="h-8 w-44 border-0 bg-transparent px-0 shadow-none focus-visible:ring-0 @max-[640px]:w-40"
                    onChange={(event) => {
                      setEmail(event.target.value)
                      if (error) setError(false)
                    }}
                  />
                  <Button type="submit" size="icon-sm" className="rounded-full" aria-label="Subscribe to release notes">
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </motion.form>
              ) : null}
              {state === "done" ? (
                <motion.div
                  key="done"
                  className="inline-flex h-full items-center gap-1.5 pr-1 pl-3 text-sm font-medium whitespace-nowrap"
                  initial={{ opacity: 0, scale: 0.96, filter: blurSubtle }}
                  animate={{ opacity: 1, scale: 1, filter: none }}
                  exit={leave}
                  transition={swapMotion}
                >
                  <svg className="size-3.5 shrink-0 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <motion.path
                      d="M4 12.5l5 5L20 6.5"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={reduce ? instant : { duration: motionPresets.duration.considered, ease: [...motionPresets.ease.standard], delay: 0.12 }}
                    />
                  </svg>
                  <span>Subscribed</span>
                  <Button ref={undoRef} type="button" variant="ghost" size="xs" className="rounded-full" onClick={() => {
                    setEmail("")
                    go("idle")
                  }} aria-label={`Undo subscription for ${email.trim()}`}>
                    Undo
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
      <p className={cn("absolute top-full right-1 mt-1.5 text-xs whitespace-nowrap text-muted-foreground @max-[640px]:right-auto @max-[640px]:left-1", error && "text-destructive")} role="status" aria-live="polite">
        <AnimatePresence mode="popLayout" initial={false}>
          {note ? (
            <motion.span
              key={note}
              className="inline-block"
              initial={{ opacity: 0, y: -4, filter: blurSubtle }}
              animate={{ opacity: 1, y: 0, filter: none }}
              exit={{ opacity: 0, transition: { duration: motionPresets.duration.instant } }}
              transition={reduce ? instant : { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }}
            >
              {note}
            </motion.span>
          ) : null}
        </AnimatePresence>
      </p>
    </div>
  )
}

function EntryMedia({ media }: { media: ChangelogMedia }) {
  if (media.type === "photo") {
    return (
      <figure className="mt-4 max-w-xl">
        <div role="img" aria-label={media.alt} className="aspect-video overflow-hidden rounded-2xl bg-muted" />
        <figcaption className="mt-2 text-xs text-muted-foreground">{media.caption}</figcaption>
      </figure>
    )
  }
  return (
    <div className="mt-4 max-w-xl overflow-hidden rounded-2xl border border-border bg-muted">
      <div className="flex h-10 items-center justify-between gap-3 border-b border-border pr-1 pl-3 text-xs text-muted-foreground">
        <span className="truncate">{media.file}</span>
        <CopyButton value={media.code} label={`Copy ${media.file}`} iconOnly variant="plain" />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-xs leading-relaxed text-foreground">
        <code>{media.code}</code>
      </pre>
    </div>
  )
}

function EntryRow({ entry, open, onToggle, reduce }: { entry: ChangelogEntry; open: boolean; onToggle: () => void; reduce: boolean }) {
  const panelId = useId()
  const kind = kinds.find((item) => item.id === entry.kind)!
  const layout: Transition = reduce ? instant : motionPresets.spring.smooth
  return (
    <motion.li
      layout="position"
      data-slot="changelog-feed-entry"
      data-open={open || undefined}
      className="border-b border-border bg-card last:border-b-0"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduce ? { opacity: 0, transition: { duration: motionPresets.duration.instant } } : { opacity: 0, scale: 0.98, filter: blurSubtle, transition: { duration: motionPresets.duration.exit, ease: [...motionPresets.ease.standard] } }}
      transition={reduce ? { duration: 0, opacity: { duration: motionPresets.duration.instant } } : { ...motionPresets.spring.smooth, layout }}
    >
      <button
        type="button"
        className="grid w-full grid-cols-[6.5rem_minmax(0,1fr)_1.25rem] items-start gap-x-6 gap-y-2 px-7 py-5 text-left hover:bg-muted/60 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none @max-[640px]:grid-cols-[minmax(0,1fr)_1.25rem] @max-[640px]:px-5"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={onToggle}
      >
        <span className="grid justify-items-start gap-2 pt-px @max-[640px]:col-start-1 @max-[640px]:flex @max-[640px]:items-center @max-[640px]:gap-2.5">
          <time dateTime={entry.iso} className="text-sm text-muted-foreground tabular-nums">
            {entry.date}
          </time>
          <span className="rounded-md border border-border px-1.5 py-px font-mono text-[11px] text-muted-foreground">v{entry.version}</span>
        </span>
        <span className="grid min-w-0 gap-1.5 @max-[640px]:col-span-2">
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground" data-kind={entry.kind}>
            <i
              aria-hidden="true"
              className={cn("size-1.5 rounded-full bg-foreground", entry.kind === "new" && "bg-primary", entry.kind === "fixed" && "bg-primary", entry.kind === "improved" && "bg-muted-foreground")}
            />
            {kind.label}
          </span>
          <span className="text-base font-medium text-foreground">{entry.title}</span>
          <span className="max-w-prose text-sm text-muted-foreground">{entry.summary}</span>
        </span>
        <motion.span className="grid size-5 place-items-center text-muted-foreground @max-[640px]:col-start-2 @max-[640px]:row-start-1 @max-[640px]:justify-self-end" aria-hidden="true" initial={false} animate={{ rotate: open ? 180 : 0 }} transition={reduce ? instant : motionPresets.spring.snappy}>
          <ChevronDown className="size-4" />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            key="panel"
            id={panelId}
            className="overflow-hidden"
            initial={{ height: 0 }}
            animate={{ height: "auto" }}
            exit={{ height: 0, transition: reduce ? instant : exitSpring }}
            transition={reduce ? instant : motionPresets.spring.smooth}
          >
            <motion.div
              className="px-7 pb-7 pl-[9.75rem] @max-[640px]:px-5 @max-[640px]:pb-6"
              initial={{ opacity: 0, y: 8, filter: blurSoft }}
              animate={{ opacity: 1, y: 0, filter: none }}
              exit={{ opacity: 0, transition: { duration: motionPresets.duration.instant } }}
              transition={reduce ? { duration: 0 } : { y: { ...motionPresets.spring.smooth, delay: 0.06 }, opacity: { duration: 0.28, delay: 0.06 }, filter: { duration: 0.28, delay: 0.06 } }}
            >
              <ul className="grid max-w-prose gap-1.5">
                {entry.details.map((detail) => (
                  <li key={detail} className="relative pl-4 text-sm text-muted-foreground before:absolute before:top-2.5 before:left-0 before:h-px before:w-1.5 before:bg-muted-foreground">
                    {detail}
                  </li>
                ))}
              </ul>
              {entry.media ? <EntryMedia media={entry.media} /> : null}
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.li>
  )
}

export function ChangelogFeed({
  entries = exampleEntries,
  months = exampleMonths,
  title = "Changelog",
  subtitle = "Costa Atelier 4.12 shipped on September 18, 2026",
  endNote = "That is everything since Costa Atelier 4.5 in June.",
  defaultOpen,
  className,
  classNames,
}: ChangelogFeedProps = {}) {
  const uid = useId()
  const totalCount = entries.length
  const kindCounts = useMemo(
    () => kinds.reduce<Record<ChangelogKind, number>>((counts, kind) => ({ ...counts, [kind.id]: entries.filter((entry) => entry.kind === kind.id).length }), { new: 0, improved: 0, fixed: 0 }),
    [entries],
  )
  const monthOrder = useCallback((key: string) => months.findIndex((month) => month.key === key), [months])
  const reduce = useReducedMotion() ?? false
  const [filters, setFilters] = useState<ChangelogKind[]>([])
  const [open, setOpen] = useState<string[]>(() => defaultOpen ?? (entries[0] ? [entries[0].id] : []))
  const [active, setActive] = useState({ key: months[0]?.key ?? "", direction: 1 })
  const scrollRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const groupRefs = useRef(new Map<string, HTMLElement>())
  const frame = useRef(0)

  const visible = useMemo(() => entries.filter((entry) => filters.length === 0 || filters.includes(entry.kind)), [entries, filters])
  const groups = useMemo(
    () => months.map((month) => ({ ...month, items: visible.filter((entry) => entry.month === month.key) })).filter((group) => group.items.length > 0),
    [months, visible],
  )
  const current = groups.find((group) => group.key === active.key) ?? groups[0]

  const sync = useCallback(() => {
    const scroller = scrollRef.current
    if (!scroller || groups.length === 0) return
    const line = scroller.getBoundingClientRect().top + 28
    let key = groups[0].key
    for (const group of groups) {
      const element = groupRefs.current.get(group.key)
      if (element && element.getBoundingClientRect().top <= line) key = group.key
    }
    if (scroller.scrollTop > 0 && scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2) key = groups[groups.length - 1].key
    setActive((previous) => (previous.key === key ? previous : { key, direction: monthOrder(key) > monthOrder(previous.key) ? 1 : -1 }))
  }, [groups, monthOrder])

  const onScroll = useCallback(() => {
    if (frame.current) return
    frame.current = requestAnimationFrame(() => {
      frame.current = 0
      sync()
    })
  }, [sync])

  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const observer = new ResizeObserver(() => onScroll())
    observer.observe(list)
    return () => observer.disconnect()
  }, [onScroll])
  useEffect(() => () => cancelAnimationFrame(frame.current), [])

  function toggleFilter(kind: ChangelogKind) {
    setFilters((previous) => (previous.includes(kind) ? previous.filter((item) => item !== kind) : [...previous, kind]))
  }
  function toggleEntry(id: string) {
    setOpen((previous) => (previous.includes(id) ? previous.filter((item) => item !== id) : [...previous, id]))
  }
  function jumpTo(key: string) {
    const scroller = scrollRef.current
    const element = groupRefs.current.get(key)
    if (!scroller || !element) return
    const top = scroller.scrollTop + element.getBoundingClientRect().top - scroller.getBoundingClientRect().top
    if (typeof scroller.scrollTo === "function") scroller.scrollTo({ top: Math.max(0, top - 1), behavior: reduce ? "auto" : "smooth" })
  }

  const shownLabel = filters.length === 0 ? `${totalCount} updates` : `${visible.length} of ${totalCount} updates`
  const layout: Transition = reduce ? instant : motionPresets.spring.smooth
  const monthParts = current?.label.split(" ") ?? []

  return (
    <section
      data-slot="changelog-feed"
      className={cn("@container flex h-[44rem] max-h-[85vh] min-h-80 w-full min-w-0 max-w-4xl flex-col overflow-hidden rounded-xl bg-card text-card-foreground ring-1 ring-foreground/10", className, classNames?.root)}
      aria-labelledby={`${uid}-title`}
    >
      <header className={cn("flex items-start justify-between gap-6 px-7 pt-8 pb-5 @max-[640px]:flex-col @max-[640px]:px-5", classNames?.header)}>
        <div className="min-w-0">
          <h2 id={`${uid}-title`} className="text-3xl font-medium text-balance">
            {title}
          </h2>
          {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        <SubscribeControl reduce={reduce} />
      </header>

      <div className={cn("flex flex-wrap items-center justify-between gap-3 px-7 pb-5 @max-[640px]:px-5", classNames?.toolbar)}>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filter by type">
          {kinds.map((kind) => {
            const on = filters.includes(kind.id)
            return (
              <button
                key={kind.id}
                type="button"
                aria-pressed={on}
                aria-label={kind.label}
                data-kind={kind.id}
                className={cn(
                  "inline-flex h-8 items-center gap-2 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                  on && "border-foreground bg-foreground text-background",
                )}
                onClick={() => toggleFilter(kind.id)}
              >
                <motion.span
                  className={cn("grid shrink-0 place-items-center overflow-hidden rounded-full bg-muted-foreground", on && "bg-background", kind.id === "new" && !on && "bg-primary", kind.id === "fixed" && !on && "bg-primary")}
                  aria-hidden="true"
                  initial={false}
                  animate={{ width: on ? 16 : 7, height: on ? 16 : 7 }}
                  transition={reduce ? instant : motionPresets.spring.morph}
                >
                  <motion.span className={cn("grid place-items-center text-foreground", on && "text-foreground")} initial={false} animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 0.4 }} transition={reduce ? instant : { ...motionPresets.spring.snappy, delay: on ? 0.05 : 0 }}>
                    <Check className="size-2.5" />
                  </motion.span>
                </motion.span>
                <span>{kind.label}</span>
                <span className={cn("text-xs text-muted-foreground tabular-nums", on && "text-background/70")} aria-hidden="true">
                  {kindCounts[kind.id]}
                </span>
              </button>
            )
          })}
          <AnimatePresence initial={false}>
            {filters.length > 0 ? (
              <motion.button
                key="clear"
                type="button"
                className="h-8 rounded-full px-2 text-sm font-medium text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                onClick={() => setFilters([])}
                initial={{ opacity: 0, x: -6, filter: blurSubtle }}
                animate={{ opacity: 1, x: 0, filter: none }}
                exit={{ opacity: 0, x: -4, filter: blurSubtle, transition: { duration: motionPresets.duration.instant } }}
                transition={reduce ? instant : motionPresets.spring.snappy}
              >
                Show all
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>
        <p className="inline-flex items-baseline gap-1 text-sm text-muted-foreground tabular-nums @max-[480px]:hidden" aria-hidden="true">
          <RollingNumber value={visible.length} reduce={reduce} />
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={filters.length === 0 ? "all" : "some"}
              initial={{ opacity: 0, filter: blurSubtle }}
              animate={{ opacity: 1, filter: none }}
              exit={{ opacity: 0, transition: { duration: motionPresets.duration.instant } }}
              transition={reduce ? instant : { duration: motionPresets.duration.standard }}
            >
              {filters.length === 0 ? "updates" : `of ${totalCount} updates`}
            </motion.span>
          </AnimatePresence>
        </p>
        <p className="sr-only" role="status" aria-live="polite">
          {`Showing ${shownLabel}`}
        </p>
      </div>

      <div className="flex min-h-14 items-center justify-between gap-4 border-y border-border px-7 py-2.5 @max-[640px]:px-5">
        <div className="flex min-w-0 items-baseline gap-3" aria-hidden="true">
          <span className="relative inline-flex text-lg font-medium whitespace-nowrap">
            <AnimatePresence mode="popLayout" initial={false} custom={active.direction}>
              <motion.span key={current?.key ?? "none"} custom={active.direction} variants={rise} initial="enter" animate="center" exit="exit" transition={reduce ? instant : motionPresets.spring.morph}>
                {current ? (
                  <>
                    {monthParts[0]}
                    <span className="text-muted-foreground @max-[480px]:hidden"> {monthParts[1]}</span>
                  </>
                ) : (
                  "No updates"
                )}
              </motion.span>
            </AnimatePresence>
          </span>
          <span className="inline-flex items-baseline gap-1 text-sm whitespace-nowrap text-muted-foreground @max-[480px]:hidden">
            <RollingNumber value={current?.items.length ?? 0} reduce={reduce} />
            {current?.items.length === 1 ? "update" : "updates"}
          </span>
        </div>
        <nav className="flex shrink-0 gap-0.5 rounded-full bg-muted p-0.5" aria-label="Jump to month">
          {groups.map((group) => {
            const selected = group.key === current?.key
            return (
              <button
                key={group.key}
                type="button"
                aria-label={`Jump to ${group.label}`}
                aria-current={selected ? "true" : undefined}
                className={cn("relative h-7 min-w-10 rounded-full px-2.5 text-xs font-medium text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none", selected && "text-foreground")}
                onClick={() => jumpTo(group.key)}
              >
                {selected ? <motion.span layoutId={`${uid}-month`} className="absolute inset-0 rounded-full bg-background shadow-sm ring-1 ring-border" transition={reduce ? instant : motionPresets.spring.morph} /> : null}
                <span className="relative">{group.short}</span>
              </button>
            )
          })}
        </nav>
      </div>

      <motion.div layoutScroll ref={scrollRef} className={cn("min-h-0 flex-1 overflow-y-auto overscroll-contain outline-none", classNames?.list)} onScroll={onScroll} tabIndex={0} aria-label="Release notes">
        <div ref={listRef}>
          <AnimatePresence mode="popLayout" initial={false}>
            {groups.map((group, index) => (
              <motion.section
                key={group.key}
                layout="position"
                aria-labelledby={`${uid}-${group.key}`}
                ref={(element: HTMLElement | null) => {
                  if (element) groupRefs.current.set(group.key, element)
                  else groupRefs.current.delete(group.key)
                }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: motionPresets.duration.exit } }}
                transition={{ layout, opacity: { duration: reduce ? motionPresets.duration.instant : motionPresets.duration.standard } }}
              >
                <h3 id={`${uid}-${group.key}`} className={index === 0 ? "sr-only" : "border-b border-border px-7 py-4 text-sm font-medium text-muted-foreground @max-[640px]:px-5"}>
                  {group.label}
                </h3>
                <ul>
                  <AnimatePresence mode="popLayout" initial={false}>
                    {group.items.map((entry) => (
                      <EntryRow key={entry.id} entry={entry} open={open.includes(entry.id)} onToggle={() => toggleEntry(entry.id)} reduce={reduce} />
                    ))}
                  </AnimatePresence>
                </ul>
              </motion.section>
            ))}
          </AnimatePresence>
          <motion.p layout="position" transition={{ layout }} className="px-7 py-8 text-center text-sm text-muted-foreground">
            {endNote}
          </motion.p>
        </div>
      </motion.div>
    </section>
  )
}
