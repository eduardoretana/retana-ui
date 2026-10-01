"use client"

/** Adapted from Arc UI (MIT). */

import { Fragment, useEffect, useId, useRef, useState, type FocusEvent, type ReactNode, type UIEvent } from "react"
import { AnimatePresence, motion, useReducedMotion, type Transition, type Variants } from "motion/react"
import { Archive, ArchiveRestore, Bell, BellOff, BellRing, CalendarDays, Check, Circle, CircleAlert, CircleCheck, CircleDashed, Ellipsis, Link2, Megaphone, Plus } from "lucide-react"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator } from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { AnimatedCounter } from "@/registry/retana/ui/animated-counter"
import { AvatarGroup, type AvatarGroupMember } from "@/registry/retana/ui/avatar-group"
import {
  DONE_AT_START,
  PROJECT_URL,
  activity,
  draftIssues,
  draftUpdates,
  milestones,
  pageFiles,
  pagePeople,
  startingIssues,
  startingUpdates,
  type PageFile,
  type PageIssue,
  type PagePerson,
  type PageUpdate,
} from "./page-header-data"

export type { PageFile, PageIssue, PagePerson, PageUpdate }

export type PageHeaderClassNames = {
  root?: string
  header?: string
  tabs?: string
  panel?: string
  toast?: string
}

export type PageHeaderProps = {
  title?: string
  description?: string
  crumbs?: string[]
  members?: AvatarGroupMember[]
  lead?: string
  issues?: PageIssue[]
  updates?: PageUpdate[]
  files?: PageFile[]
  className?: string
  classNames?: PageHeaderClassNames
}

type Section = "overview" | "issues" | "updates" | "files"
type Notice = { key: number; text: string; tone: "success" | "error" | "neutral" }
type MenuAction = { key: string; label: string; icon: ReactNode; onSelect: () => void; disabled?: boolean; separatorBefore?: boolean }

const CONDENSE_AT = 16
const EXPAND_AT = 4
const LEAD_MIN = 240
const LEAD_RETURN = 272

const sections: { value: Section; label: string }[] = [
  { value: "overview", label: "Overview" },
  { value: "issues", label: "Issues" },
  { value: "updates", label: "Updates" },
  { value: "files", label: "Files" },
]

const order = (section: Section) => sections.findIndex((item) => item.value === section)
const still: Transition = { duration: 0 }
const quick: Transition = { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] }
const blur = (px: number) => `blur(${px}px)`

const panelSlide: Variants = {
  enter: (direction: number) => ({ opacity: 0, x: direction * 12 }),
  center: { opacity: 1, x: 0, transition: { x: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] } } },
  exit: (direction: number) => ({ opacity: 0, x: direction * -8, transition: { duration: motionPresets.duration.instant, ease: [...motionPresets.ease.standard] } }),
}
const panelFade: Variants = {
  enter: { opacity: 0, x: 0 },
  center: { opacity: 1, x: 0, transition: { duration: motionPresets.duration.instant } },
  exit: { opacity: 0, x: 0, transition: { duration: 0.1 } },
}

function rowMotion(reduce: boolean) {
  return reduce
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, transition: { duration: motionPresets.duration.instant } }
    : {
        initial: { opacity: 0, height: 0 },
        animate: { opacity: 1, height: "auto" },
        exit: { opacity: 0, height: 0 },
        transition: { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.standard] } },
      }
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function PersonAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "default" }) {
  return (
    <Avatar size={size}>
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  )
}

function personById(id: string) {
  return pagePeople.find((person) => person.id === id) ?? pagePeople[0]
}

function StatusDot() {
  return <span className="size-1.5 rounded-full bg-current" />
}

function OverflowMenu({ actions, reduce }: { actions: MenuAction[]; reduce: boolean }) {
  const [highlight, setHighlight] = useState<{ top: number; height: number; glide: boolean } | null>(null)
  const pointer = useRef(false)
  const clearTimer = useRef(0)
  useEffect(() => () => window.clearTimeout(clearTimer.current), [])
  function onFocus(event: FocusEvent<HTMLDivElement>) {
    const item = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[role="menuitem"]') : null
    window.clearTimeout(clearTimer.current)
    if (!item) {
      clearTimer.current = window.setTimeout(() => setHighlight(null), pointer.current ? 70 : 0)
      return
    }
    const glide = pointer.current
    setHighlight((current) => ({ top: item.offsetTop, height: item.offsetHeight, glide: glide && current !== null }))
  }
  return (
    <DropdownMenu
      onOpenChange={(open) => {
        if (open) {
          window.clearTimeout(clearTimer.current)
          setHighlight(null)
        }
      }}
    >
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon-sm" aria-label="More actions">
          <Ellipsis aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" sideOffset={6} className="relative w-56 min-w-56" onFocus={onFocus} onPointerMoveCapture={() => { pointer.current = true }} onKeyDownCapture={() => { pointer.current = false }}>
        <motion.span
          className="pointer-events-none absolute right-1 left-1 rounded-md bg-muted"
          aria-hidden="true"
          initial={false}
          animate={highlight ? { y: highlight.top, height: highlight.height, opacity: 1 } : { opacity: 0 }}
          transition={{ default: highlight?.glide && !reduce ? motionPresets.spring.snappy : still, opacity: { duration: reduce ? 0 : 0.08 } }}
        />
        {actions.map((action) => (
          <Fragment key={action.key}>
            {action.separatorBefore ? <DropdownMenuSeparator /> : null}
            <DropdownMenuItem disabled={action.disabled} onSelect={action.onSelect}>
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function OverviewPanel({ done, open }: { done: number; open: number }) {
  const total = Math.max(done + open, 1)
  const width = `${Math.round((done / total) * 100)}%`
  return (
    <div className="grid gap-9">
      <div className="max-w-md">
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          <span>{done} of {total} issues done</span>
        </div>
        <div role="progressbar" aria-valuenow={done} aria-valuemin={0} aria-valuemax={total} aria-label={`${done} of ${total} issues done`} className="h-2 overflow-hidden rounded-full bg-muted">
          <div className="h-full rounded-full bg-primary motion-reduce:transition-none" style={{ width }} />
        </div>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Milestones</h3>
        <ol>
          {milestones.map((item) => {
            const Icon = item.state === "done" ? CircleCheck : item.state === "active" ? CircleDashed : Circle
            return (
              <li key={item.name} data-state={item.state} className="grid min-h-12 grid-cols-[1rem_minmax(0,1fr)_auto] items-center gap-x-3 border-b border-border last:border-b-0 @max-[560px]:grid-cols-[1rem_minmax(0,1fr)] @max-[560px]:py-2.5">
                <Icon className={cn("size-4 text-muted-foreground", item.state === "done" && "text-primary", item.state === "active" && "text-foreground")} aria-hidden="true" />
                <span>{item.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums @max-[560px]:col-start-2">{item.note}</span>
              </li>
            )
          })}
        </ol>
      </div>
      <div>
        <h3 className="mb-2 text-sm font-medium">Recent activity</h3>
        <ul>
          {activity.map((item) => {
            const who = personById(item.who)
            return (
              <li key={`${item.who}-${item.text}`} className="grid min-h-13 grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 border-b border-border last:border-b-0 @max-[560px]:grid-cols-[auto_minmax(0,1fr)] @max-[560px]:py-2.5">
                <PersonAvatar name={who.name} />
                <p className="text-muted-foreground">
                  <strong className="font-medium text-foreground">{who.name}</strong> {item.text}
                </p>
                <span className="text-xs text-muted-foreground tabular-nums @max-[560px]:col-start-2">{item.time}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function IssuesPanel({
  issues,
  closing,
  reduce,
  onComplete,
  onReset,
  register,
}: {
  issues: PageIssue[]
  closing: string[]
  reduce: boolean
  onComplete: (issue: PageIssue) => void
  onReset: () => void
  register: (id: string, node: HTMLButtonElement | null) => void
}) {
  const row = rowMotion(reduce)
  return (
    <>
      <ul aria-label="Open issues">
        <AnimatePresence initial={false}>
          {issues.map((issue) => {
            const isClosing = closing.includes(issue.id)
            const owner = personById(issue.owner)
            return (
              <motion.li key={issue.id} className="overflow-hidden border-b border-border last:border-transparent" data-fresh={issue.fresh || undefined} data-closing={isClosing || undefined} {...row}>
                <div className="grid min-h-13 grid-cols-[2rem_minmax(0,1fr)_auto_auto] items-center gap-3 py-1 @max-[560px]:grid-cols-[2rem_minmax(0,1fr)_auto] @max-[560px]:items-start @max-[560px]:py-2.5">
                  <button
                    ref={(node) => register(issue.id, node)}
                    type="button"
                    className={cn("grid size-8 place-items-center rounded-full text-muted-foreground focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none", isClosing && "text-primary")}
                    aria-label={`Mark ${issue.id} done`}
                    aria-disabled={isClosing || undefined}
                    onClick={() => onComplete(issue)}
                  >
                    <AnimatePresence initial={false} mode="popLayout">
                      <motion.span key={isClosing ? "done" : "open"} className="grid place-items-center" initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: reduce ? 1 : 0.5, transition: quick }} transition={reduce ? still : motionPresets.spring.snappy}>
                        {isClosing ? <CircleCheck className="size-4" aria-hidden="true" /> : <Circle className="size-4" aria-hidden="true" />}
                      </motion.span>
                    </AnimatePresence>
                  </button>
                  <span className="flex min-w-0 items-baseline gap-3 @max-[560px]:grid @max-[560px]:gap-0.5">
                    <span className="shrink-0 text-xs text-muted-foreground">{issue.id}</span>
                    <span className={cn("min-w-0 truncate @max-[560px]:overflow-visible @max-[560px]:whitespace-normal", isClosing && "text-muted-foreground line-through")}>{issue.title}</span>
                  </span>
                  <span className="text-xs text-muted-foreground @max-[560px]:hidden">{issue.label}</span>
                  <PersonAvatar name={owner.name} />
                </div>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
      {issues.length === 0 ? (
        <motion.div className="grid justify-items-center gap-1 px-4 py-16 text-center" initial={{ opacity: 0, y: reduce ? 0 : 6 }} animate={{ opacity: 1, y: 0 }} transition={reduce ? { duration: motionPresets.duration.instant } : motionPresets.spring.smooth}>
          <CircleCheck className="mb-2 size-6 text-primary" aria-hidden="true" />
          <p className="font-medium">No open issues</p>
          <span className="text-sm text-muted-foreground">Everything in this project is done.</span>
          <Button variant="outline" size="sm" className="mt-3" onClick={onReset}>
            Restore sample issues
          </Button>
        </motion.div>
      ) : null}
    </>
  )
}

function UpdatesPanel({ updates, reduce }: { updates: PageUpdate[]; reduce: boolean }) {
  const row = rowMotion(reduce)
  return (
    <ol aria-label="Project updates">
      <AnimatePresence initial={false}>
        {updates.map((update) => {
          const author = personById(update.author)
          return (
            <motion.li key={update.id} className="overflow-hidden border-b border-border last:border-transparent" data-fresh={update.fresh || undefined} {...row}>
              <article className="grid grid-cols-[auto_minmax(0,1fr)] gap-3.5 py-4">
                <PersonAvatar name={author.name} size="default" />
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="font-medium">{author.name}</span>
                    <span className="text-xs text-muted-foreground tabular-nums">{update.date}</span>
                    <Badge variant={update.tone === "warning" ? "destructive" : "secondary"}>
                      <StatusDot />
                      {update.status}
                    </Badge>
                  </div>
                  <p className="mt-1.5 max-w-prose text-pretty text-muted-foreground">{update.body}</p>
                </div>
              </article>
            </motion.li>
          )
        })}
      </AnimatePresence>
    </ol>
  )
}

function FilesPanel({ files }: { files: PageFile[] }) {
  return (
    <ul aria-label="Project files">
      {files.map((file) => {
        const Icon = file.icon
        const owner = personById(file.owner)
        return (
          <li key={file.name} className="grid min-h-14 grid-cols-[1rem_minmax(0,1fr)_auto_3.25rem] items-center gap-3.5 border-b border-border last:border-b-0 @max-[560px]:grid-cols-[1rem_minmax(0,1fr)_auto]">
            <Icon className="size-4 text-muted-foreground" aria-hidden="true" />
            <span className="grid min-w-0">
              <span className="truncate">{file.name}</span>
              <span className="text-xs text-muted-foreground">{file.kind}, {file.size}</span>
            </span>
            <PersonAvatar name={owner.name} />
            <span className="text-right text-xs text-muted-foreground whitespace-nowrap @max-[560px]:hidden">{file.date}</span>
          </li>
        )
      })}
    </ul>
  )
}

export function PageHeader({
  title = "Kiln 2 rebuild",
  description = "Rebuilding the stoneware schedule around saved glazes and a single review step, then opening the gallery in stages from October 14.",
  crumbs = ["Costa Atelier", "Projects"],
  members,
  lead = "Inés Calderón",
  issues: initialIssues = startingIssues,
  updates: initialUpdates = startingUpdates,
  files = pageFiles,
  className,
  classNames,
}: PageHeaderProps) {
  const id = useId()
  const reduce = useReducedMotion() ?? false
  const bar = useRef<HTMLDivElement>(null)
  const secondary = useRef<HTMLDivElement>(null)
  const trailing = useRef<HTMLDivElement>(null)
  const scroller = useRef<HTMLDivElement>(null)
  const tabList = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const toggles = useRef(new Map<string, HTMLButtonElement>())
  const timers = useRef(new Set<number>())
  const counters = useRef({ issue: 0, update: 0, notice: 0 })
  const [view, setView] = useState<{ section: Section; direction: number }>({ section: "overview", direction: 1 })
  const [condensed, setCondensed] = useState(false)
  const [layout, setLayout] = useState({ measured: false, collapsed: false, animate: false })
  const [following, setFollowing] = useState(false)
  const [archived, setArchived] = useState(false)
  const [sharing, setSharing] = useState<"idle" | "sending" | "sent">("idle")
  const [issues, setIssues] = useState(initialIssues)
  const [closing, setClosing] = useState<string[]>([])
  const [done, setDone] = useState(initialIssues === startingIssues ? DONE_AT_START : 0)
  const [updates, setUpdates] = useState(initialUpdates)
  const [notice, setNotice] = useState<Notice | null>(null)
  const groupMembers: AvatarGroupMember[] = members ?? pagePeople.map((person) => ({ name: person.name }))

  useEffect(() => {
    const row = bar.current
    const folded = secondary.current
    const fixed = trailing.current
    if (!row || !folded || !fixed || typeof ResizeObserver === "undefined") return
    const measure = () => {
      const room = row.clientWidth - folded.offsetWidth - fixed.offsetWidth - 16
      setLayout((current) => {
        const collapsed = current.measured && current.collapsed ? room < LEAD_RETURN : room < LEAD_MIN
        return current.measured && current.collapsed === collapsed ? current : { measured: true, collapsed, animate: current.measured }
      })
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(row)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const pending = timers.current
    return () => pending.forEach((handle) => window.clearTimeout(handle))
  }, [])

  useEffect(() => {
    if (!notice) return
    const handle = window.setTimeout(() => setNotice(null), 3200)
    return () => window.clearTimeout(handle)
  }, [notice])

  useEffect(() => {
    const list = tabList.current
    const tab = list?.querySelector<HTMLElement>('[role="tab"][data-state="active"]')
    if (!list || !tab || typeof list.scrollTo !== "function") return
    const start = tab.offsetLeft - 12
    const end = tab.offsetLeft + tab.offsetWidth + 12 - list.clientWidth
    const behavior = reduce ? "auto" : "smooth"
    if (list.scrollLeft > start) list.scrollTo({ left: start, behavior })
    else if (list.scrollLeft < end) list.scrollTo({ left: end, behavior })
  }, [view.section, reduce])

  function later(run: () => void, delay: number) {
    const handle = window.setTimeout(() => {
      timers.current.delete(handle)
      run()
    }, delay)
    timers.current.add(handle)
  }

  function notify(text: string, tone: Notice["tone"] = "success") {
    counters.current.notice += 1
    setNotice({ key: counters.current.notice, text, tone })
  }

  function selectSection(next: Section, reveal = false) {
    setView((current) => (current.section === next ? current : { section: next, direction: order(next) > order(current.section) ? 1 : -1 }))
    const node = scroller.current
    if (node && (reveal || next !== view.section) && node.scrollTop > CONDENSE_AT + 1) node.scrollTop = CONDENSE_AT + 1
  }

  function onScroll(event: UIEvent<HTMLDivElement>) {
    const top = event.currentTarget.scrollTop
    setCondensed((current) => (current ? top > EXPAND_AT : top > CONDENSE_AT))
  }

  function backToTop() {
    scroller.current?.scrollTo?.({ top: 0, behavior: reduce ? "auto" : "smooth" })
    titleRef.current?.focus({ preventScroll: true })
  }

  function toggleFollow() {
    const next = !following
    setFollowing(next)
    notify(next ? `Following ${title}` : `Stopped following ${title}`, next ? "success" : "neutral")
  }

  function shareUpdate() {
    if (archived || sharing !== "idle") return
    setSharing("sending")
    later(() => {
      const index = counters.current.update++
      const key = `draft-${index}`
      setUpdates((list) => [{ id: key, author: "ines", date: "Just now", tone: "success", status: "On track", body: draftUpdates[index % draftUpdates.length], fresh: true }, ...list])
      setSharing("sent")
      selectSection("updates", true)
      notify("Update shared with the studio")
      later(() => setSharing("idle"), 1800)
      later(() => setUpdates((list) => list.map((item) => (item.id === key ? { ...item, fresh: false } : item))), 1800)
    }, 700)
  }

  function createIssue() {
    if (archived) return
    const index = counters.current.issue++
    const issue: PageIssue = { id: `CA-${139 + index}`, title: draftIssues[index % draftIssues.length], owner: "ines", label: "Triage", fresh: true }
    setIssues((list) => [issue, ...list])
    selectSection("issues", true)
    notify(`${issue.id} created and assigned to you`)
    later(() => setIssues((list) => list.map((item) => (item.id === issue.id ? { ...item, fresh: false } : item))), 1800)
  }

  function completeIssue(issue: PageIssue) {
    if (closing.includes(issue.id)) return
    const index = issues.findIndex((item) => item.id === issue.id)
    const remaining = issues.filter((item) => item.id !== issue.id && !closing.includes(item.id))
    const neighbor = remaining[Math.min(index, remaining.length - 1)]
    setClosing((list) => [...list, issue.id])
    later(() => {
      const hadFocus = document.activeElement === toggles.current.get(issue.id)
      setIssues((list) => list.filter((item) => item.id !== issue.id))
      setClosing((list) => list.filter((item) => item !== issue.id))
      setDone((count) => count + 1)
      notify(`${issue.id} marked done`)
      if (hadFocus) (neighbor ? toggles.current.get(neighbor.id) : scroller.current?.querySelector<HTMLElement>('[role="tabpanel"]'))?.focus()
    }, 380)
  }

  function resetIssues() {
    setIssues(startingIssues)
    setDone(DONE_AT_START)
    notify("Sample issues restored", "neutral")
  }

  function toggleArchive() {
    const next = !archived
    setArchived(next)
    notify(next ? "Project archived. New issues and updates are paused." : "Project restored", "neutral")
  }

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(PROJECT_URL)
      notify("Link copied")
    } catch {
      notify("Couldn't copy the link. Try again from the address bar.", "error")
    }
  }

  function openCrumb(label: string) {
    notify(`${label} would open here.`, "neutral")
  }

  const status = archived ? { tone: "secondary" as const, label: "Archived" } : { tone: "secondary" as const, label: "On track" }
  const icon = "size-4 shrink-0"
  const menuActions: MenuAction[] = [
    ...(layout.collapsed
      ? [
          { key: "follow", label: following ? "Unfollow" : "Follow", icon: following ? <BellOff className={icon} aria-hidden="true" /> : <Bell className={icon} aria-hidden="true" />, onSelect: toggleFollow },
          { key: "share", label: "Share update", icon: <Megaphone className={icon} aria-hidden="true" />, onSelect: shareUpdate, disabled: archived || sharing !== "idle" },
        ]
      : []),
    { key: "copy", label: "Copy link", icon: <Link2 className={icon} aria-hidden="true" />, onSelect: copyLink, separatorBefore: layout.collapsed },
    { key: "archive", label: archived ? "Restore project" : "Archive project", icon: archived ? <ArchiveRestore className={icon} aria-hidden="true" /> : <Archive className={icon} aria-hidden="true" />, onSelect: toggleArchive },
  ]
  const swap = (entering: boolean): Transition =>
    reduce
      ? still
      : {
          ...motionPresets.spring.smooth,
          opacity: { duration: entering ? motionPresets.duration.standard : motionPresets.duration.fast, ease: [...motionPresets.ease.standard], delay: entering ? 0.05 : 0 },
          filter: { duration: entering ? motionPresets.duration.standard : motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
        }
  const shown = { opacity: 1, y: 0, scale: 1, filter: blur(0) }

  return (
    <Tabs value={view.section} onValueChange={(value) => selectSection(value as Section)} className={cn("@container relative flex h-[40rem] max-h-[calc(100dvh-2rem)] min-h-80 w-full min-w-0 max-w-5xl flex-col gap-0 overflow-hidden rounded-xl bg-card text-sm text-card-foreground ring-1 ring-foreground/10", className, classNames?.root)} data-slot="page-header">
      <header className={cn("relative z-10 shrink-0 border-b border-border bg-card px-7 pt-4 @max-[560px]:px-4", classNames?.header)}>
        <div ref={bar} className="grid min-h-8 grid-cols-[minmax(0,1fr)_auto] items-center gap-4">
          <div className="grid min-w-0 items-center">
            <motion.div className="col-start-1 row-start-1 min-w-0" inert={condensed || undefined} initial={false} animate={condensed ? { opacity: 0, y: -8, filter: blur(motionPresets.blur.subtle) } : shown} transition={swap(!condensed)}>
              <Breadcrumb>
                <BreadcrumbList className="flex-nowrap">
                  {crumbs.map((crumb, index) => (
                    <Fragment key={crumb}>
                      <BreadcrumbItem className={cn("shrink-0", index === 0 && "@max-[560px]:hidden")}>
                        <BreadcrumbLink asChild>
                          <button type="button" className="rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none" onClick={() => openCrumb(crumb)}>
                            {crumb}
                          </button>
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                      <BreadcrumbSeparator className={index === 0 ? "@max-[560px]:hidden" : undefined} />
                    </Fragment>
                  ))}
                  <BreadcrumbItem className="min-w-0">
                    <BreadcrumbPage className="truncate">{title}</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </motion.div>
            <motion.button
              type="button"
              className="col-start-1 row-start-1 inline-flex max-w-full min-w-0 items-center gap-2.5 justify-self-start rounded-lg px-2 py-1 text-left focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
              inert={!condensed || undefined}
              aria-label={`${title}, back to top`}
              onClick={backToTop}
              initial={false}
              animate={condensed ? shown : { opacity: 0, y: 14, filter: blur(motionPresets.blur.soft) }}
              transition={swap(condensed)}
            >
              <span className="truncate font-medium">{title}</span>
              <Badge variant={status.tone} className="@max-[560px]:hidden">
                <StatusDot />
                {status.label}
              </Badge>
            </motion.button>
          </div>
          <div className="flex items-center justify-end">
            <motion.div
              className={cn("flex shrink-0", !layout.measured && "@max-[719px]:pointer-events-none @max-[719px]:w-0 @max-[719px]:overflow-hidden @max-[719px]:opacity-0")}
              inert={layout.collapsed || undefined}
              initial={false}
              animate={layout.measured ? (layout.collapsed ? { width: 0, opacity: 0 } : { width: "auto", opacity: 1 }) : undefined}
              transition={layout.animate && !reduce ? { width: motionPresets.spring.smooth, opacity: { duration: layout.collapsed ? motionPresets.duration.fast : motionPresets.duration.standard, ease: [...motionPresets.ease.standard] } } : still}
            >
              <div ref={secondary} className="flex shrink-0 gap-2 pr-2">
                <Button variant="outline" size="sm" onClick={toggleFollow}>
                  {following ? <BellRing data-icon="inline-start" aria-hidden="true" /> : <Bell data-icon="inline-start" aria-hidden="true" />}
                  {following ? "Following" : "Follow"}
                </Button>
                <Button variant="outline" size="sm" disabled={archived || sharing === "sending"} aria-busy={sharing === "sending" || undefined} onClick={shareUpdate}>
                  {sharing === "sent" ? <Check data-icon="inline-start" aria-hidden="true" /> : <Megaphone data-icon="inline-start" aria-hidden="true" />}
                  {sharing === "sending" ? "Sharing" : sharing === "sent" ? "Shared" : "Share update"}
                </Button>
              </div>
            </motion.div>
            <div ref={trailing} className="flex shrink-0 items-center gap-2">
              <OverflowMenu actions={menuActions} reduce={reduce} />
              <Button size="sm" aria-label="New issue" disabled={archived} onClick={createIssue}>
                <Plus data-icon="inline-start" aria-hidden="true" />
                <span className="@max-[28rem]:sr-only">New issue</span>
              </Button>
            </div>
          </div>
        </div>
        <motion.div className="overflow-clip" initial={false} animate={{ height: condensed ? 0 : "auto" }} transition={reduce ? still : motionPresets.spring.smooth}>
          <div className="grid justify-items-start gap-2.5 py-5">
            <motion.div className="flex origin-top-left flex-wrap items-center gap-3" initial={false} animate={condensed ? { opacity: 0, y: -10, scale: 0.62, filter: blur(motionPresets.blur.subtle) } : shown} transition={swap(!condensed)}>
              <h2 ref={titleRef} id={`${id}-title`} tabIndex={-1} className="text-2xl font-medium outline-none @min-[560px]:text-3xl">
                {title}
              </h2>
              <Badge variant={archived ? "outline" : "secondary"}>
                <StatusDot />
                {status.label}
              </Badge>
            </motion.div>
            <motion.div className="grid justify-items-start gap-3.5" initial={false} animate={condensed ? { opacity: 0, y: -6 } : { opacity: 1, y: 0 }} transition={swap(!condensed)}>
              <p className="max-w-prose text-pretty text-muted-foreground">{description}</p>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
                <AvatarGroup members={groupMembers} max={4} size="sm" label="Project members" />
                <span>
                  Led by <strong className="font-medium text-foreground">{lead}</strong>
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  Target Oct 14
                </span>
              </div>
            </motion.div>
          </div>
        </motion.div>
        <TabsList ref={tabList} variant="line" aria-label="Project sections" className={cn("h-11 w-[calc(100%+3.5rem)] -mx-7 justify-start overflow-x-auto bg-transparent px-5 @max-[560px]:w-[calc(100%+2rem)] @max-[560px]:-mx-4", classNames?.tabs)}>
          {sections.map((item) => {
            const count = item.value === "issues" ? issues.length : item.value === "updates" ? updates.length : item.value === "files" ? files.length : null
            return (
              <TabsTrigger key={item.value} value={item.value} className="h-11 flex-none px-2.5">
                {item.label}
                {count !== null ? <AnimatedCounter value={count} className="text-sm font-medium text-muted-foreground" /> : null}
              </TabsTrigger>
            )
          })}
        </TabsList>
      </header>
      <div ref={scroller} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-7 pt-7 pb-20 @max-[560px]:px-4" onScroll={onScroll}>
        <AnimatePresence initial={false} mode="popLayout" custom={view.direction}>
          <TabsContent key={view.section} value={view.section} className={cn("min-h-[28rem] outline-none", classNames?.panel)} asChild>
            <motion.div custom={view.direction} variants={reduce ? panelFade : panelSlide} initial="enter" animate="center" exit="exit">
              {view.section === "overview" ? <OverviewPanel done={done} open={issues.length} /> : null}
              {view.section === "issues" ? (
                <IssuesPanel
                  issues={issues}
                  closing={closing}
                  reduce={reduce}
                  onComplete={completeIssue}
                  onReset={resetIssues}
                  register={(key, node) => {
                    if (node) toggles.current.set(key, node)
                    else toggles.current.delete(key)
                  }}
                />
              ) : null}
              {view.section === "updates" ? <UpdatesPanel updates={updates} reduce={reduce} /> : null}
              {view.section === "files" ? <FilesPanel files={files} /> : null}
            </motion.div>
          </TabsContent>
        </AnimatePresence>
      </div>
      <div className="pointer-events-none absolute inset-x-4 bottom-4 z-20 flex justify-center" aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          {notice ? (
            <motion.div
              key={notice.key}
              data-tone={notice.tone}
              className={cn("inline-flex max-w-full items-center gap-2 rounded-lg border border-border bg-popover px-3.5 py-2 text-sm text-popover-foreground shadow-md", classNames?.toast)}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: 14, filter: blur(motionPresets.blur.soft) }}
              animate={{ opacity: 1, y: 0, filter: blur(0) }}
              exit={reduce ? { opacity: 0, transition: still } : { opacity: 0, y: 8, filter: blur(motionPresets.blur.subtle), transition: quick }}
              transition={reduce ? { duration: motionPresets.duration.instant } : { ...motionPresets.spring.snappy, opacity: { duration: 0.2 }, filter: { duration: 0.2 } }}
            >
              {notice.tone === "success" ? <Check className="size-4 shrink-0 text-primary" aria-hidden="true" /> : notice.tone === "error" ? <CircleAlert className="size-4 shrink-0 text-destructive" aria-hidden="true" /> : null}
              <span>{notice.text}</span>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
      <p className="sr-only" role="status" aria-live="polite">
        {notice?.text}
      </p>
    </Tabs>
  )
}
