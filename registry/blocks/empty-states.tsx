"use client"

/** Adapted from Arc UI (MIT). */

import { useEffect, useId, useRef, useState } from "react"
import type { KeyboardEvent } from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type EmptySceneId = "search" | "offline" | "inbox" | "map"

export type EmptyPhase = "idle" | "loading" | "done"

export type EmptyCopy = {
  title: string
  line: string
  action: string
}

export type EmptyScene = {
  id: string
  tab: string
  idle: EmptyCopy
  done: EmptyCopy
  loading: string
  /** Milliseconds the action spends in the loading phase. Zero toggles immediately. */
  wait: number
  art?: EmptySceneId
}

export type EmptyStatesClassNames = {
  root?: string
  tabs?: string
  tab?: string
  panel?: string
  art?: string
  title?: string
  line?: string
  action?: string
}

export type EmptyStatesProps = {
  scenes?: EmptyScene[]
  /** Replaces the wait on a scene id, useful when a host simulates the pause. */
  waits?: Partial<Record<string, number>>
  className?: string
  classNames?: EmptyStatesClassNames
  onSceneChange?: (id: string) => void
  onPhaseChange?: (id: string, phase: EmptyPhase) => void
}

export const emptyStateScenes: EmptyScene[] = [
  {
    id: "search",
    tab: "No results",
    idle: {
      title: "No results for “stoneware bowls”",
      line: "Two filters are on: clay is stoneware and status is archived.",
      action: "Clear filters",
    },
    done: {
      title: "12 results for “stoneware bowls”",
      line: "Filters cleared. Showing matches from every clay and status.",
      action: "Restore filters",
    },
    loading: "",
    wait: 0,
    art: "search",
  },
  {
    id: "offline",
    tab: "Offline",
    idle: {
      title: "You are offline",
      line: "Edits stay on this device and sync when the connection returns.",
      action: "Try again",
    },
    done: {
      title: "Back online",
      line: "Three shelf notes synced to the studio just now.",
      action: "Go offline",
    },
    loading: "Reaching the studio sync…",
    wait: 1400,
    art: "offline",
  },
  {
    id: "inbox",
    tab: "Caught up",
    idle: {
      title: "All caught up",
      line: "You have read every note in the studio inbox.",
      action: "Check for mail",
    },
    done: {
      title: "Still all caught up",
      line: "Checked just now. Nothing new since the morning firing.",
      action: "Check again",
    },
    loading: "Checking for new mail…",
    wait: 1100,
    art: "inbox",
  },
  {
    id: "map",
    tab: "Not found",
    idle: {
      title: "Page not found",
      line: "The link to /archive/atlas-2023 is broken, or the page has moved.",
      action: "Find the page",
    },
    done: {
      title: "Found it in Archive",
      line: "Atlas 2023 moved to /archive/atlas-2023 in March.",
      action: "Show broken link",
    },
    loading: "Searching the archive…",
    wait: 1200,
    art: "map",
  },
]

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
}

function SceneArt({ art, phase, label }: { art: EmptySceneId; phase: EmptyPhase; label: string }) {
  const done = phase === "done"
  const loading = phase === "loading"
  return (
    <svg data-slot="empty-states-art" viewBox="0 0 320 216" role="img" aria-label={label} className="size-full overflow-visible text-foreground">
      {art === "search" ? (
        <g>
          <rect x="58" y="36" width="204" height="144" rx="18" className="fill-muted stroke-foreground" strokeWidth="1.5" />
          {done ? (
            <g>
              <rect x="78" y="56" width="88" height="12" rx="6" className="fill-muted-foreground" />
              <rect x="78" y="100" width="140" height="12" rx="6" className="fill-border" />
              <rect x="78" y="124" width="108" height="12" rx="6" className="fill-border" />
              <circle cx="196" cy="62" r="10" {...stroke} />
              <path d="M203 69l10 10" {...stroke} />
            </g>
          ) : (
            <g>
              <rect x="78" y="64" width="132" height="20" rx="8" className="fill-background stroke-border" strokeWidth="1.5" />
              <rect x="78" y="96" width="132" height="20" rx="8" className="fill-background stroke-border" strokeWidth="1.5" />
              <rect x="78" y="128" width="132" height="20" rx="8" className="fill-background stroke-border" strokeWidth="1.5" />
              <circle cx="196" cy="118" r="28" className="fill-background" {...stroke} />
              <path d="M216 138l28 28" {...stroke} />
            </g>
          )}
        </g>
      ) : null}
      {art === "offline" ? (
        <g>
          <path d="M78 118a28 28 0 0 1 22-40 40 40 0 0 1 76-8 32 32 0 0 1 46 28 24 24 0 0 1-8 46H92a28 28 0 0 1-14-26z" className="fill-muted" {...stroke} />
          <rect x="134" y="156" width="52" height="34" rx="9" className={done ? "fill-primary/15 stroke-primary" : "fill-background stroke-foreground"} strokeWidth="1.5" />
          <path d={loading ? "M160 118v18" : done ? "M160 118v38" : "M160 118v16"} {...stroke} className={loading ? "text-primary" : undefined} />
          {done ? <path d="M150 172l8 8 16-16" {...stroke} className="text-primary" /> : loading ? null : <path d="M150 140l8-8M158 140l-8-8" {...stroke} className="text-destructive" />}
          {!done && !loading ? <path d="M160 150v6" {...stroke} /> : null}
        </g>
      ) : null}
      {art === "inbox" ? (
        <g>
          <rect x="112" y="64" width="96" height="36" rx="12" className="fill-muted stroke-muted-foreground" strokeWidth="1.5" />
          <rect x="96" y="84" width="128" height="36" rx="12" className="fill-background stroke-muted-foreground" strokeWidth="1.5" />
          <path d="M80 112h160v48a16 16 0 0 1-16 16H96a16 16 0 0 1-16-16z" className="fill-background" {...stroke} />
          <path d="M80 128l48 18 32-18 32 18 48-18" {...stroke} />
          <circle cx="220" cy="84" r="16" className={loading ? "fill-muted stroke-muted-foreground" : "fill-primary/15 stroke-primary"} strokeWidth="1.5" />
          {loading ? null : <path d="M212 84l5 5 11-12" {...stroke} className="text-primary" />}
        </g>
      ) : null}
      {art === "map" ? (
        <g>
          <path d="M70 70l54-16 54 16 54-16 18 16v96l-72 16-54-16-54 16-18-16z" className="fill-muted" {...stroke} />
          <path d="M124 54v128M178 70v128" {...stroke} className="text-muted-foreground" />
          {loading ? null : <path d={done ? "M90 150c28 8 48-8 70-28 16-14 36-18 52-8" : "M90 140c24-20 48-8 70-28 18-16 40-28 58-36"} {...stroke} className="text-primary" strokeDasharray="4 5" />}
          <circle cx="90" cy="146" r="4" className="fill-foreground" />
          {done ? (
            <g className="text-primary">
              <circle cx="206" cy="112" r="12" className="fill-primary/15" {...stroke} />
              <path d="M200 112l4 4 8-9" {...stroke} />
            </g>
          ) : loading ? null : (
            <path d="M200 72l12 12M212 72l-12 12" {...stroke} />
          )}
        </g>
      ) : null}
    </svg>
  )
}

function artLabel(art: EmptySceneId, phase: EmptyPhase) {
  if (art === "search") return phase === "done" ? "A results list with two matches" : "A magnifying glass over empty rows"
  if (art === "offline") return phase === "done" ? "A cloud joined to a device" : phase === "loading" ? "A connection reaching the cloud" : "A cloud split from a device"
  if (art === "inbox") return phase === "loading" ? "An inbox being checked" : "An inbox with a check mark"
  return phase === "done" ? "A map route that ends at a check" : phase === "loading" ? "A map while the route is searched" : "A map route that ends in an x"
}

type View = { scene: string; phase: EmptyPhase; from: EmptyPhase }

/**
 * Four empty scenes on one card. Tabs swap the drawing and the copy. The action clears filters,
 * retries a connection, checks mail, or finds a moved page, all on this device.
 */
export function EmptyStates({ scenes = emptyStateScenes, waits, className, classNames, onSceneChange, onPhaseChange }: EmptyStatesProps) {
  const uid = useId()
  const reduced = useReducedMotion() ?? false
  const [view, setView] = useState<View>({ scene: scenes[0]?.id ?? "search", phase: "idle", from: "idle" })
  const [announcement, setAnnouncement] = useState("")
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const timer = useRef(0)
  const scene = scenes.find((item) => item.id === view.scene) ?? scenes[0]

  useEffect(() => () => window.clearTimeout(timer.current), [])

  if (!scene) return null

  const waitFor = (id: string, fallback: number) => waits?.[id] ?? fallback
  const art = scene.art ?? (scene.id === "offline" || scene.id === "inbox" || scene.id === "map" || scene.id === "search" ? scene.id : "search")
  const copy: EmptyCopy = view.phase === "loading"
    ? { ...(view.from === "done" ? scene.done : scene.idle), line: scene.loading }
    : view.phase === "done" ? scene.done : scene.idle

  function choose(id: string) {
    if (id === view.scene) return
    window.clearTimeout(timer.current)
    setView({ scene: id, phase: "idle", from: "idle" })
    setAnnouncement("")
    onSceneChange?.(id)
    onPhaseChange?.(id, "idle")
  }

  function commit(id: string, phase: EmptyPhase, from: EmptyPhase, nextCopy: EmptyCopy) {
    setView({ scene: id, phase, from })
    setAnnouncement(`${nextCopy.title}. ${nextCopy.line}`)
    onPhaseChange?.(id, phase)
  }

  function act() {
    if (view.phase === "loading" || !scene) return
    const wait = waitFor(scene.id, scene.wait)
    const toggles = wait <= 0 || (view.phase === "done" && scene.id !== "inbox")
    if (toggles) {
      const next: EmptyPhase = view.phase === "idle" ? "done" : "idle"
      commit(scene.id, next, view.phase, next === "done" ? scene.done : scene.idle)
      return
    }
    setView({ scene: scene.id, phase: "loading", from: view.phase })
    setAnnouncement(scene.loading)
    onPhaseChange?.(scene.id, "loading")
    window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      setView((current) => (current.scene === scene.id && current.phase === "loading" ? { scene: scene.id, phase: "done", from: "loading" } : current))
      setAnnouncement(`${scene.done.title}. ${scene.done.line}`)
      onPhaseChange?.(scene.id, "done")
    }, wait)
  }

  function onTabKey(event: KeyboardEvent<HTMLDivElement>) {
    const index = scenes.findIndex((item) => item.id === view.scene)
    const next = event.key === "ArrowRight" ? (index + 1) % scenes.length : event.key === "ArrowLeft" ? (index + scenes.length - 1) % scenes.length : event.key === "Home" ? 0 : event.key === "End" ? scenes.length - 1 : -1
    if (next < 0) return
    event.preventDefault()
    choose(scenes[next].id)
    tabs.current[next]?.focus()
  }

  const swap = reduced
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 } }
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 }, exit: { opacity: 0, y: -6 } }

  return (
    <section data-slot="empty-states" aria-label="Empty states" className={cn("@container flex w-full min-w-0 justify-center text-foreground", className, classNames?.root)}>
      <div className="flex w-full min-w-0 max-w-xl flex-col items-center gap-6 rounded-xl border border-border bg-card p-4 sm:p-8">
        <div
          className={cn("grid w-full max-w-md grid-flow-col auto-cols-fr gap-0.5 overflow-x-auto rounded-lg border border-border bg-muted p-0.5", classNames?.tabs)}
          role="tablist"
          aria-label="Empty state"
          onKeyDown={onTabKey}
        >
          <LayoutGroup id={uid}>
            {scenes.map((item, index) => {
              const selected = item.id === view.scene
              return (
                <button
                  key={item.id}
                  ref={(node) => { tabs.current[index] = node }}
                  id={`${uid}-tab-${item.id}`}
                  type="button"
                  role="tab"
                  aria-selected={selected}
                  aria-controls={`${uid}-panel`}
                  tabIndex={selected ? 0 : -1}
                  className={cn("relative min-h-8 whitespace-nowrap rounded-md px-2 text-xs font-medium text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none aria-selected:text-foreground", classNames?.tab)}
                  onClick={() => choose(item.id)}
                >
                  {selected ? (
                    <motion.span
                      layoutId={`${uid}-highlight`}
                      className="absolute inset-0 -z-10 rounded-md border border-border bg-background"
                      transition={reduced ? { duration: 0 } : motionPresets.spring.morph}
                    />
                  ) : null}
                  <span className="relative">{item.tab}</span>
                </button>
              )
            })}
          </LayoutGroup>
        </div>

        <div className={cn("flex w-full min-w-0 max-w-md flex-col items-center gap-5", classNames?.panel)} role="tabpanel" id={`${uid}-panel`} aria-labelledby={`${uid}-tab-${view.scene}`}>
          <div className={cn("aspect-[320/216] w-full max-w-sm", classNames?.art)}>
            <SceneArt art={art} phase={view.phase} label={artLabel(art, view.phase)} />
          </div>
          <div className="flex w-full min-w-0 flex-col items-center gap-4 text-center">
            <div className="grid w-full min-w-0 gap-1.5">
              <h2 className={cn("text-lg font-medium text-balance break-words", classNames?.title)}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={copy.title} className="block" {...swap} transition={{ duration: reduced ? 0 : motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }}>
                    {copy.title}
                  </motion.span>
                </AnimatePresence>
              </h2>
              <p className={cn("mx-auto max-w-prose text-sm text-pretty break-words text-muted-foreground", classNames?.line)}>
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.span key={copy.line} className="block" {...swap} transition={{ duration: reduced ? 0 : motionPresets.duration.standard, delay: reduced ? 0 : motionPresets.stagger.word }}>
                    {copy.line}
                  </motion.span>
                </AnimatePresence>
              </p>
            </div>
            <Button type="button" size="sm" className={classNames?.action} aria-busy={view.phase === "loading" || undefined} disabled={view.phase === "loading"} onClick={act}>
              {copy.action}
            </Button>
          </div>
          <p className="sr-only" role="status" aria-live="polite">{announcement}</p>
        </div>
      </div>
    </section>
  )
}
