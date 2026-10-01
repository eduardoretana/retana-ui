"use client"

/** Adapted from Arc UI (MIT). */

import { useEffect, useId, useLayoutEffect, useMemo, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
  type HTMLMotionProps,
  type TargetAndTransition,
  type Transition,
  type Variants,
} from "motion/react"
import { Bell, Check, CheckCheck, CircleCheck, CircleDot, MessageCircle, TriangleAlert, X } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type NotificationItem = {
  id: string
  title: string
  description?: string
  time: string
  read?: boolean
  tone?: "info" | "success" | "warning"
  /** A portrait for person-generated updates. */
  actor?: { name: string; photo?: string }
}

export type NotificationCenterClassNames = {
  root?: string
  trigger?: string
  panel?: string
  list?: string
}

export type NotificationCenterProps = {
  notifications: NotificationItem[]
  label?: string
  onReadChange?: (notification: NotificationItem, read: boolean) => void
  onDismiss?: (notification: NotificationItem) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  avoidCollisions?: boolean
  className?: string
  classNames?: NotificationCenterClassNames
}

type View = "all" | "unread"

const enter: Transition = { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }
const exitFast: Transition = { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] }
const instant: Transition = { duration: 0 }
const textIn: TargetAndTransition = { opacity: 0, y: "0.3em", filter: `blur(${motionPresets.blur.soft}px)` }
const textOut: TargetAndTransition = { opacity: 0, y: "-0.3em", filter: `blur(${motionPresets.blur.subtle}px)`, transition: exitFast }
const iconIn: TargetAndTransition = { opacity: 0, scale: 0.6, filter: `blur(${motionPresets.blur.subtle}px)` }
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" }
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionPresets.duration.instant } }

const cascade = (index: number) => Math.min(index * motionPresets.stagger.item, 0.2)

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function Swap(props: HTMLMotionProps<"span">) {
  const present = useIsPresent()
  return <motion.span {...props} aria-hidden={present ? props["aria-hidden"] : true} />
}

function SwapText({ children, reduce }: { children: string; reduce: boolean | null }) {
  return (
    <span className="relative inline-block max-w-full align-top">
      <AnimatePresence mode="popLayout" initial={false}>
        <Swap
          key={children}
          className="block"
          initial={reduce ? { opacity: 0 } : textIn}
          animate={shown}
          exit={reduce ? fadeOut : textOut}
          transition={reduce ? instant : enter}
        >
          {children}
        </Swap>
      </AnimatePresence>
    </span>
  )
}

const rollVariants: Variants = {
  enter: (direction: number) => ({ opacity: 0, y: direction >= 0 ? "0.7em" : "-0.7em", filter: `blur(${motionPresets.blur.subtle}px)` }),
  center: { opacity: 1, y: "0em", filter: "blur(0px)" },
  exit: (direction: number) => ({
    opacity: 0,
    y: direction >= 0 ? "-0.7em" : "0.7em",
    filter: `blur(${motionPresets.blur.subtle}px)`,
    transition: exitFast,
  }),
}

function RollingCount({ value, display = String(value), reduce }: { value: number; display?: string; reduce: boolean | null }) {
  const [previous, setPrevious] = useState(value)
  const [direction, setDirection] = useState(0)
  if (value !== previous) {
    setDirection(value > previous ? 1 : -1)
    setPrevious(value)
  }
  return (
    <span className="inline-grid align-top">
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <Swap
          key={display}
          className="block"
          custom={direction}
          variants={reduce ? undefined : rollVariants}
          initial={reduce ? { opacity: 0 } : "enter"}
          animate={reduce ? { opacity: 1 } : "center"}
          exit={reduce ? fadeOut : "exit"}
          transition={reduce ? instant : { y: motionPresets.spring.snappy, opacity: exitFast, filter: exitFast }}
        >
          {display}
        </Swap>
      </AnimatePresence>
    </span>
  )
}

function MorphWidth({ reduce, morphKey, children }: { reduce: boolean | null; morphKey: string; children: ReactNode }) {
  const frame = useRef<HTMLSpanElement>(null)
  const content = useRef<HTMLSpanElement>(null)
  const width = useMotionValue<number | "auto">("auto")
  const changedAt = useRef(0)
  useLayoutEffect(() => {
    changedAt.current = performance.now()
  }, [morphKey])
  useEffect(() => {
    const node = content.current
    if (!node || typeof ResizeObserver === "undefined") return
    let last: number | undefined
    let controls: AnimationPlaybackControls | undefined
    const settle = () => {
      width.jump("auto")
      if (frame.current) frame.current.style.width = "auto"
    }
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth
      const current = width.get()
      const from = typeof current === "number" ? current : last
      last = next
      controls?.stop()
      if (reduce || from === undefined || from === next || performance.now() - changedAt.current > 120) return settle()
      if (frame.current) frame.current.style.width = `${from}px`
      controls = animate(width, [from, next], { ...motionPresets.spring.morph, onComplete: settle })
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
      controls?.stop()
    }
  }, [width, reduce])
  return (
    <motion.span ref={frame} className="block" style={{ width }}>
      <span ref={content} className="relative inline-flex w-max items-center gap-1">
        {children}
      </span>
    </motion.span>
  )
}

function NotificationVisual({ item }: { item: NotificationItem }) {
  if (item.actor) {
    return (
      <Avatar size="sm">
        {item.actor.photo ? <AvatarImage src={item.actor.photo} alt="" /> : null}
        <AvatarFallback>{initials(item.actor.name)}</AvatarFallback>
      </Avatar>
    )
  }
  const tone = item.tone ?? "info"
  return (
    <span
      className={cn(
        "grid h-9 w-6 shrink-0 place-items-center text-foreground",
        tone === "success" && "text-primary",
        tone === "warning" && "text-destructive",
      )}
      aria-hidden="true"
    >
      {tone === "warning" ? <TriangleAlert className="size-4" /> : tone === "success" ? <CircleCheck className="size-4" /> : <MessageCircle className="size-4" />}
    </span>
  )
}

export function NotificationCenter({
  notifications: initial,
  label = "Notifications",
  onReadChange,
  onDismiss,
  open,
  onOpenChange,
  avoidCollisions = true,
  className,
  classNames,
}: NotificationCenterProps) {
  const reduce = useReducedMotion()
  const layoutId = useId()
  const [internalOpen, setInternalOpen] = useState(false)
  const [items, setItems] = useState(initial)
  const [view, setView] = useState<View>("all")
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [bulk, setBulk] = useState(false)
  const itemRefs = useRef(new Map<string, HTMLButtonElement>())
  const allTabRef = useRef<HTMLButtonElement>(null)
  const unreadTabRef = useRef<HTMLButtonElement>(null)
  const isOpen = open ?? internalOpen
  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items])
  const readCount = items.length - unreadCount
  const visible = view === "unread" ? items.filter((item) => !item.read) : items
  const summary = unreadCount ? `${unreadCount} update${unreadCount === 1 ? "" : "s"} waiting for you` : "You're all caught up"

  function setOpen(next: boolean) {
    if (open === undefined) setInternalOpen(next)
    onOpenChange?.(next)
  }

  function toggleRead(item: NotificationItem) {
    const next = !item.read
    if (next && view === "unread") {
      const index = visible.findIndex((entry) => entry.id === item.id)
      const nextId = visible[index + 1]?.id ?? visible[index - 1]?.id
      requestAnimationFrame(() => (nextId ? itemRefs.current.get(nextId)?.focus() : unreadTabRef.current?.focus()))
    }
    setBulk(false)
    setItems((current) => current.map((entry) => (entry.id === item.id ? { ...entry, read: next } : entry)))
    if (next && view === "unread") setExpandedId(null)
    onReadChange?.(item, next)
  }

  function markAllRead() {
    items.filter((item) => !item.read).forEach((item) => onReadChange?.(item, true))
    setBulk(true)
    setItems((current) => current.map((item) => ({ ...item, read: true })))
    setExpandedId(null)
    requestAnimationFrame(() => (view === "unread" ? unreadTabRef : allTabRef).current?.focus())
  }

  function dismiss(item: NotificationItem) {
    const index = visible.findIndex((entry) => entry.id === item.id)
    const nextId = visible[index + 1]?.id ?? visible[index - 1]?.id
    requestAnimationFrame(() => (nextId ? itemRefs.current.get(nextId)?.focus() : unreadTabRef.current?.focus()))
    setBulk(false)
    setItems((current) => current.filter((entry) => entry.id !== item.id))
    if (expandedId === item.id) setExpandedId(null)
    onDismiss?.(item)
  }

  function clearRead() {
    items.filter((item) => item.read).forEach((item) => onDismiss?.(item))
    setBulk(true)
    setItems((current) => current.filter((item) => !item.read))
    requestAnimationFrame(() => allTabRef.current?.focus())
  }

  function onViewKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft" && event.key !== "Home" && event.key !== "End") return
    event.preventDefault()
    const next: View = event.key === "End" || event.key === "ArrowRight" ? "unread" : "all"
    setBulk(false)
    setView(next)
    setExpandedId(null)
    const tab = next === "unread" ? unreadTabRef : allTabRef
    tab.current?.focus()
  }

  const height: Transition = reduce ? instant : { height: motionPresets.spring.smooth, opacity: enter }

  return (
    <div data-slot="notification-center" className={cn("inline-flex", className, classNames?.root)}>
      <Popover open={isOpen} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className={cn("relative", classNames?.trigger)}
            aria-label={`${label}${unreadCount ? `, ${unreadCount} unread` : ""}`}
          >
            <motion.span className="grid place-items-center" animate={{ rotate: isOpen && !reduce ? -12 : 0 }} transition={reduce ? instant : motionPresets.spring.snappy}>
              <Bell aria-hidden="true" />
            </motion.span>
            <AnimatePresence initial={false}>
              {unreadCount > 0 ? (
                <motion.span
                  key="badge"
                  className="absolute -top-1.5 -right-1.5 grid h-5 min-w-5 place-items-center overflow-hidden rounded-full border-2 border-background bg-foreground px-1 text-[10px] font-medium text-background tabular-nums"
                  aria-hidden="true"
                  initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={reduce ? fadeOut : { opacity: 0, scale: 0.6, transition: exitFast }}
                  transition={reduce ? instant : motionPresets.spring.snappy}
                >
                  <RollingCount value={unreadCount} display={unreadCount > 9 ? "9+" : String(unreadCount)} reduce={reduce} />
                </motion.span>
              ) : null}
            </AnimatePresence>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          align="end"
          side="bottom"
          sideOffset={12}
          collisionPadding={12}
          avoidCollisions={avoidCollisions}
          aria-label={label}
          className={cn(
            "@container w-[min(26rem,calc(100vw-1.5rem))] max-h-[min(36rem,calc(100dvh-1.5rem))] gap-0 overflow-hidden p-0",
            classNames?.panel,
          )}
        >
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 @max-[380px]:px-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-medium">{label}</h2>
                <span className="grid h-5 min-w-5 place-items-center overflow-hidden rounded-md bg-muted px-1 text-[11px] text-muted-foreground tabular-nums">
                  <RollingCount value={unreadCount} reduce={reduce} />
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground" aria-live="polite">
                <SwapText reduce={reduce}>{summary}</SwapText>
              </p>
            </div>
            <Button type="button" variant="ghost" size="icon-sm" aria-label="Close notifications" onClick={() => setOpen(false)}>
              <X aria-hidden="true" />
            </Button>
          </div>

          <div className="flex min-h-12 items-center justify-between gap-3 border-b border-border px-4 pb-3">
            <div className="inline-flex items-center gap-1" role="group" aria-label="Show notifications" onKeyDown={onViewKeyDown}>
              {(["all", "unread"] as const).map((next) => (
                <button
                  key={next}
                  ref={next === "unread" ? unreadTabRef : allTabRef}
                  type="button"
                  className={cn(
                    "relative isolate h-8 min-w-14 rounded-lg px-2.5 text-xs text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none",
                    view === next && "text-foreground",
                  )}
                  aria-pressed={view === next}
                  onClick={() => {
                    setBulk(false)
                    setView(next)
                    setExpandedId(null)
                  }}
                >
                  {view === next ? (
                    <motion.span
                      className="absolute inset-0 -z-10 rounded-lg bg-muted"
                      layoutId={`${layoutId}-view`}
                      transition={reduce ? instant : motionPresets.spring.morph}
                    />
                  ) : null}
                  <span className="relative">{next === "all" ? "All" : "Unread"}</span>
                </button>
              ))}
            </div>
            <AnimatePresence initial={false}>
              {unreadCount > 0 ? (
                <motion.button
                  key="mark-all"
                  type="button"
                  className="inline-flex items-center gap-1.5 px-1 py-1 text-xs text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  onClick={markAllRead}
                  initial={reduce ? { opacity: 0 } : { opacity: 0, filter: `blur(${motionPresets.blur.subtle}px)` }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={reduce ? fadeOut : { opacity: 0, filter: `blur(${motionPresets.blur.subtle}px)`, transition: exitFast }}
                  transition={reduce ? instant : enter}
                >
                  <CheckCheck className="size-3.5" aria-hidden="true" />
                  <span className="@max-[380px]:sr-only">Mark all read</span>
                </motion.button>
              ) : null}
            </AnimatePresence>
          </div>

          <div className={cn("min-h-0 overflow-y-auto overscroll-contain px-2 py-2", classNames?.list)} role="list" aria-label={view === "all" ? "All notifications" : "Unread notifications"}>
            <AnimatePresence initial={false} custom={bulk}>
              {visible.map((item, index) => (
                <motion.div
                  key={item.id}
                  role="listitem"
                  className="overflow-hidden"
                  custom={bulk}
                  variants={{
                    exit: (isBulk: boolean) =>
                      reduce
                        ? fadeOut
                        : {
                            height: 0,
                            opacity: 0,
                            transition: {
                              height: { ...motionPresets.spring.smooth, delay: isBulk ? cascade(index) : 0 },
                              opacity: { ...exitFast, delay: isBulk ? cascade(index) : 0 },
                            },
                          },
                  }}
                  initial={reduce ? { opacity: 0 } : { height: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit="exit"
                  transition={height}
                >
                  <article
                    data-slot="notification-center-item"
                    className={cn("rounded-xl p-2.5", expandedId === item.id && "bg-muted", item.read && "text-muted-foreground")}
                  >
                    <div className="flex min-w-0 items-start gap-2.5">
                      <NotificationVisual item={item} />
                      <button
                        ref={(node) => {
                          if (node) itemRefs.current.set(item.id, node)
                          else itemRefs.current.delete(item.id)
                        }}
                        type="button"
                        className="grid min-w-0 flex-1 gap-1 pt-0.5 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        aria-expanded={expandedId === item.id}
                        aria-label={`${item.title}${item.read ? "" : ", unread"}. ${expandedId === item.id ? "Hide details" : "Show details"}`}
                        onClick={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                      >
                        <span className="flex min-h-4 min-w-0 items-center gap-1.5">
                          <strong className="truncate text-sm font-medium text-foreground">{item.title}</strong>
                          <AnimatePresence initial={false} custom={bulk}>
                            {!item.read ? (
                              <motion.span
                                key="dot"
                                className="size-1.5 shrink-0 rounded-full bg-foreground"
                                aria-hidden="true"
                                custom={bulk}
                                variants={{
                                  exit: (isBulk: boolean) =>
                                    reduce ? fadeOut : { opacity: 0, scale: 0.3, transition: { ...exitFast, delay: isBulk ? cascade(index) : 0 } },
                                }}
                                initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.3 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit="exit"
                                transition={reduce ? instant : motionPresets.spring.snappy}
                              />
                            ) : null}
                          </AnimatePresence>
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {item.description ?? (item.actor ? `From ${item.actor.name}` : "View update details")}
                        </span>
                      </button>
                      <time className="shrink-0 pt-0.5 text-[11px] text-muted-foreground tabular-nums">{item.time}</time>
                    </div>
                    <AnimatePresence initial={false}>
                      {expandedId === item.id ? (
                        <motion.div
                          className="overflow-hidden pl-8"
                          initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={reduce ? fadeOut : { height: 0, opacity: 0, transition: { height: motionPresets.spring.smooth, opacity: exitFast } }}
                          transition={height}
                        >
                          <p className="my-3 text-xs leading-relaxed text-muted-foreground">
                            {item.description ?? (item.actor ? `${item.actor.name} shared an update with you.` : "This update is ready to review.")}
                          </p>
                          <div className="flex flex-wrap gap-1.5 pb-1">
                            <Button type="button" variant="outline" size="xs" onClick={() => toggleRead(item)}>
                              <MorphWidth reduce={reduce} morphKey={item.read ? "read" : "unread"}>
                                <span className="grid place-items-center">
                                  <AnimatePresence mode="popLayout" initial={false}>
                                    <Swap
                                      key={item.read ? "unread" : "read"}
                                      className="grid place-items-center"
                                      initial={reduce ? { opacity: 0 } : iconIn}
                                      animate={shown}
                                      exit={reduce ? fadeOut : { ...iconIn, transition: exitFast }}
                                      transition={reduce ? instant : motionPresets.spring.snappy}
                                    >
                                      {item.read ? <CircleDot className="size-3.5" aria-hidden="true" /> : <Check className="size-3.5" aria-hidden="true" />}
                                    </Swap>
                                  </AnimatePresence>
                                </span>
                                <SwapText reduce={reduce}>{item.read ? "Mark unread" : "Mark read"}</SwapText>
                              </MorphWidth>
                            </Button>
                            <Button type="button" variant="outline" size="xs" onClick={() => dismiss(item)}>
                              <X aria-hidden="true" />
                              Dismiss
                            </Button>
                          </div>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </article>
                </motion.div>
              ))}
              {visible.length === 0 ? (
                <motion.div
                  key="empty"
                  className="overflow-hidden"
                  initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={reduce ? fadeOut : { height: 0, opacity: 0, transition: { height: motionPresets.spring.smooth, opacity: exitFast } }}
                  transition={reduce ? instant : { height: motionPresets.spring.smooth, opacity: { ...enter, delay: motionPresets.duration.fast } }}
                >
                  <div className="grid min-h-44 justify-items-center content-center px-3 py-6 text-center">
                    <CircleCheck className="mb-3 size-6 text-muted-foreground" aria-hidden="true" />
                    <strong className="text-sm font-medium">
                      <SwapText reduce={reduce}>{view === "unread" ? "Nothing unread" : "All clear"}</SwapText>
                    </strong>
                    <p className="mt-1 text-xs text-muted-foreground">
                      <SwapText reduce={reduce}>{view === "unread" ? "You've seen every update." : "New updates will appear here."}</SwapText>
                    </p>
                    {view === "unread" && items.length > 0 ? (
                      <button
                        type="button"
                        className="mt-4 text-xs text-foreground underline underline-offset-4 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                        onClick={() => {
                          setBulk(false)
                          setView("all")
                        }}
                      >
                        View all updates
                      </button>
                    ) : null}
                  </div>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          <AnimatePresence initial={false}>
            {readCount > 0 ? (
              <motion.div
                key="footer"
                className="overflow-hidden"
                initial={reduce ? { opacity: 0 } : { height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={reduce ? fadeOut : { height: 0, opacity: 0, transition: { height: motionPresets.spring.smooth, opacity: exitFast } }}
                transition={height}
              >
                <div className="flex min-h-11 items-center justify-between gap-3 border-t border-border px-5 text-[11px] text-muted-foreground">
                  <span>
                    <RollingCount value={readCount} reduce={reduce} /> read
                  </span>
                  <button
                    type="button"
                    className="py-1 text-muted-foreground hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                    onClick={clearRead}
                  >
                    Clear read
                  </button>
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </PopoverContent>
      </Popover>
    </div>
  )
}
