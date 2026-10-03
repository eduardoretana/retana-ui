"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useIsPresent, useMotionValue, useReducedMotion, useTransform } from "motion/react"
import type { AnimationPlaybackControls, MotionValue } from "motion/react"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export interface SwipeAction {
  label: string
  icon: React.ReactNode
  /** Fill of the revealed action. Pair `danger` with a label that names the destructive result. */
  tone?: "neutral" | "accent" | "danger"
  /** Runs for a full swipe, a tap on the revealed action, or the More actions menu. Remove the item here unless `keepRow` is set. */
  onSelect: () => void
  /** The row springs home after the action instead of sliding away and collapsing. */
  keepRow?: boolean
}

export type SwipeActionsClassNames = {
  root?: string
  list?: string
}

/**
 * A list whose rows reveal actions on a horizontal swipe. Only one row stays open at a time.
 * Every row also has a More actions menu with the same actions.
 */
export interface SwipeActionsProps {
  label: string
  children: React.ReactNode
  className?: string
  classNames?: SwipeActionsClassNames
}

export type SwipeActionsRowClassNames = {
  row?: string
  content?: string
  action?: string
  menu?: string
}

/** One row. `leading` actions sit under the left edge and `trailing` actions under the right. The outermost action on each side commits on a full swipe. */
export interface SwipeActionsRowProps {
  /** Names the row in its menu button, for example the message subject. */
  label: string
  leading?: SwipeAction[]
  trailing?: SwipeAction[]
  /** Lets a long swipe commit the outermost action without a tap. On by default. */
  fullSwipe?: boolean
  children: React.ReactNode
  className?: string
  classNames?: SwipeActionsRowClassNames
}

type Side = "leading" | "trailing"
type Group = { openId: string | null; setOpenId: React.Dispatch<React.SetStateAction<string | null>>; rows: Map<string, HTMLElement> }
type Drag = { pointer: number; type: string; startX: number; startY: number; origin: number; locked: "x" | "y" | null; samples: [number, number][] }

/** Width of one action while a row rests open. */
const ACTION = 76
/** Movement before a press is read as a swipe or handed to the page as a scroll. */
const SLOP = 8
/** Seconds of travel projected from the release velocity. */
const PROJECTION = 0.1
/** Release speed in px/s that counts as a flick. */
const FLICK = 900
const clamp01 = (value: number) => Math.min(1, Math.max(0, value))
/** Past its last stop the row still follows, but every pixel costs more. */
const rubberBand = (overshoot: number, dimension: number) => (1 - 1 / (overshoot * 0.55 / dimension + 1)) * dimension
const sideOf = (value: number): Side | null => (value > 0 ? "leading" : value < 0 ? "trailing" : null)

const GroupContext = React.createContext<Group>({ openId: null, setOpenId: () => {}, rows: new Map() })

export function SwipeActions({ label, children, className, classNames }: SwipeActionsProps) {
  const [openId, setOpenId] = React.useState<string | null>(null)
  const [rows] = React.useState(() => new Map<string, HTMLElement>())
  React.useEffect(() => {
    if (!openId) return
    const onPointerDown = (event: PointerEvent) => {
      const row = rows.get(openId)
      if (row && event.target instanceof Node && row.contains(event.target)) return
      setOpenId(null)
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpenId(null)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true)
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [openId, rows])
  const group = React.useMemo(() => ({ openId, setOpenId, rows }), [openId, rows])
  return (
    <GroupContext.Provider value={group}>
      <div
        data-slot="swipe-actions"
        className={cn(
          "overflow-hidden rounded-lg border border-border bg-card text-card-foreground transition-colors",
          "not-has-[>ul>li:not([data-removing])]:border-transparent not-has-[>ul>li:not([data-removing])]:bg-transparent",
          "has-[>ul:empty]:hidden",
          className,
          classNames?.root,
        )}
      >
        <ul
          role="list"
          aria-label={label}
          tabIndex={-1}
          data-slot="swipe-actions-list"
          className={cn("m-0 -mb-px list-none p-0 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring", classNames?.list)}
        >
          <AnimatePresence initial={false}>{children}</AnimatePresence>
        </ul>
      </div>
    </GroupContext.Provider>
  )
}

function velocityOf(samples: [number, number][]) {
  const last = samples[samples.length - 1]
  const first = samples.find((sample) => last[0] - sample[0] <= 80) ?? last
  const elapsed = (last[0] - first[0]) / 1000
  return elapsed > 0 ? (last[1] - first[1]) / elapsed : 0
}

export function SwipeActionsRow({
  label,
  leading = [],
  trailing = [],
  fullSwipe = true,
  children,
  className,
  classNames,
}: SwipeActionsRowProps) {
  const { openId, setOpenId, rows } = React.useContext(GroupContext)
  const id = React.useId()
  const reduced = useReducedMotion() ?? false
  const present = useIsPresent()
  const rowRef = React.useRef<HTMLLIElement>(null)
  const x = useMotionValue(0)
  const cover = useMotionValue(0)
  const [covering, setCovering] = React.useState<{ side: Side; index: number } | null>(null)
  const [menuOpen, setMenuOpen] = React.useState(false)
  const width = React.useRef(0)
  const drag = React.useRef<Drag | null>(null)
  const travel = React.useRef<AnimationPlaybackControls | null>(null)
  const stretch = React.useRef<AnimationPlaybackControls | null>(null)
  const armed = React.useRef(false)
  const leaving = React.useRef(false)
  const swallowClick = React.useRef(false)
  const focusNeighbour = React.useRef(false)
  const restoreTimer = React.useRef(0)

  const actionsOf = (side: Side) => (side === "leading" ? leading : trailing)
  const openWidth = (side: Side) => actionsOf(side).length * ACTION
  const outermost = (side: Side) => (side === "leading" ? 0 : trailing.length - 1)
  const canCommit = (side: Side) => fullSwipe && actionsOf(side).length > 0
  const threshold = (side: Side) => Math.max(openWidth(side) + 48, width.current * 0.56)

  function stretchTo(value: number) {
    stretch.current?.stop()
    if (reduced) {
      cover.jump(value)
      return
    }
    stretch.current = animate(cover, value, motionPresets.spring.morph)
  }

  /** Springs the row to a stop, carrying the release velocity. Travel snaps instantly with reduced motion. */
  function settle(target: number, velocity = 0) {
    if (armed.current || (target !== 0 && cover.get() !== 0)) stretchTo(0)
    armed.current = false
    const from = x.get()
    const home = () => {
      if (target === 0) {
        stretch.current?.stop()
        cover.jump(0)
      }
    }
    if (reduced) {
      x.jump(target)
      home()
    } else {
      const toward = target === 0 && Math.sign(velocity) === -Math.sign(from)
      const launch = toward ? Math.sign(velocity) * Math.min(Math.abs(velocity), Math.abs(from) * 12) : velocity
      travel.current = animate(x, target, {
        ...(target === 0 ? motionPresets.spring.smooth : motionPresets.spring.snappy),
        velocity: launch,
        onComplete: home,
      })
    }
    if (target === 0) setOpenId((current) => (current === id ? null : current))
    else setOpenId(id)
  }

  /** The chosen action stretches over the whole row while the row leaves in its direction. */
  function commit(side: Side, index: number, velocity = 0) {
    const action = actionsOf(side)[index]
    if (!action || leaving.current) return
    const direction = side === "leading" ? 1 : -1
    armed.current = false
    setCovering({ side, index })
    stretchTo(1)
    if (action.keepRow) {
      action.onSelect()
      settle(0, velocity)
      return
    }
    leaving.current = true
    const row = rowRef.current
    if (row) row.dataset.removing = ""
    travel.current?.stop()
    const end = direction * (width.current + 2)
    if (reduced) x.jump(end)
    else travel.current = animate(x, end, { ...motionPresets.spring.smooth, velocity: Math.sign(velocity) === direction ? velocity : 0 })
    setOpenId((current) => (current === id ? null : current))
    action.onSelect()
    window.clearTimeout(restoreTimer.current)
    restoreTimer.current = window.setTimeout(() => {
      if (!leaving.current) return
      leaving.current = false
      if (row) delete row.dataset.removing
      settle(0)
    }, 1400)
  }

  function arm(value: number, pointerType: string) {
    const side = sideOf(value)
    const limit = side ? threshold(side) : Infinity
    const next = !!side && canCommit(side) && Math.abs(value) > (armed.current ? limit - 20 : limit)
    if (next === armed.current || !side) {
      if (!side && armed.current) {
        armed.current = false
        stretchTo(0)
      }
      return
    }
    armed.current = next
    if (next) {
      setCovering({ side, index: outermost(side) })
      if (pointerType === "touch") navigator.vibrate?.(8)
    }
    stretchTo(next ? 1 : 0)
  }

  function constrain(raw: number) {
    const side = sideOf(raw)
    if (!side) return 0
    const dimension = width.current || 320
    const limit = actionsOf(side).length === 0 ? 0 : canCommit(side) ? dimension : openWidth(side)
    const distance = Math.abs(raw)
    return Math.sign(raw) * (distance <= limit ? distance : limit + rubberBand(distance - limit, dimension))
  }

  function release(velocity: number) {
    const value = x.get()
    const side = sideOf(value)
    if (!side || actionsOf(side).length === 0) {
      settle(0, velocity)
      return
    }
    const direction = side === "leading" ? 1 : -1
    const distance = Math.abs(value)
    const outward = velocity * direction
    const open = openWidth(side)
    const projected = distance + outward * PROJECTION
    const flung = distance > open && outward > FLICK && projected > threshold(side)
    if (canCommit(side) && ((armed.current && outward > -FLICK) || flung)) {
      commit(side, outermost(side), velocity)
      return
    }
    settle(projected > open / 2 ? direction * open : 0, velocity)
  }

  function onPointerDown(event: React.PointerEvent<HTMLDivElement>) {
    swallowClick.current = false
    if (leaving.current || !event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return
    travel.current?.stop()
    drag.current = {
      pointer: event.pointerId,
      type: event.pointerType,
      startX: event.clientX,
      startY: event.clientY,
      origin: x.get(),
      locked: null,
      samples: [[event.timeStamp, event.clientX]],
    }
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (!current || current.pointer !== event.pointerId || current.locked === "y") return
    if (!current.locked) {
      const dx = event.clientX - current.startX
      const dy = event.clientY - current.startY
      if (Math.hypot(dx, dy) < SLOP) return
      if (Math.abs(dy) > Math.abs(dx)) {
        current.locked = "y"
        return
      }
      current.locked = "x"
      current.startX = event.clientX
      event.currentTarget.setPointerCapture(event.pointerId)
      if (rowRef.current) rowRef.current.dataset.dragging = ""
      setOpenId(id)
    }
    const value = constrain(current.origin + event.clientX - current.startX)
    x.set(value)
    current.samples.push([event.timeStamp, event.clientX])
    if (current.samples.length > 12) current.samples.shift()
    arm(value, current.type)
  }

  function onPointerEnd(event: React.PointerEvent<HTMLDivElement>) {
    const current = drag.current
    if (!current || current.pointer !== event.pointerId) return
    drag.current = null
    if (current.locked === "x") {
      swallowClick.current = true
      if (rowRef.current) delete rowRef.current.dataset.dragging
      current.samples.push([event.timeStamp, event.clientX])
      release(event.type === "pointercancel" ? 0 : velocityOf(current.samples))
      return
    }
    if (current.locked === null && Math.abs(x.get()) > 0.5) {
      swallowClick.current = true
      settle(0)
    }
  }

  function onClickCapture(event: React.MouseEvent<HTMLDivElement>) {
    if (!swallowClick.current) return
    swallowClick.current = false
    event.preventDefault()
    event.stopPropagation()
  }

  function moveFocusToNeighbour() {
    const row = rowRef.current
    if (!row) return
    const staying = (step: "nextElementSibling" | "previousElementSibling") => {
      let node = row[step]
      while (node instanceof HTMLElement && "removing" in node.dataset) node = node[step]
      return node
    }
    const neighbour = staying("nextElementSibling") ?? staying("previousElementSibling")
    ;(neighbour?.querySelector<HTMLElement>("[data-swipe-more]") ?? row.parentElement)?.focus({ preventScroll: true })
  }

  React.useEffect(() => {
    const row = rowRef.current
    if (!row) return
    rows.set(id, row)
    width.current = row.offsetWidth
    const observer = new ResizeObserver(([entry]) => {
      width.current = entry.contentRect.width
    })
    observer.observe(row)
    return () => {
      observer.disconnect()
      rows.delete(id)
      window.clearTimeout(restoreTimer.current)
      setOpenId((current) => (current === id ? null : current))
    }
  }, [id, rows, setOpenId])

  const closeForOthers = React.useEffectEvent(() => {
    if (openId !== id && !leaving.current && drag.current?.locked !== "x" && x.get() !== 0) settle(0)
  })
  React.useEffect(() => {
    closeForOthers()
  }, [openId])

  const returnHome = React.useEffectEvent(() => {
    if (!leaving.current) return
    leaving.current = false
    window.clearTimeout(restoreTimer.current)
    if (rowRef.current) delete rowRef.current.dataset.removing
    settle(0)
  })
  React.useEffect(() => {
    if (present) returnHome()
  }, [present])

  const menuItems = [
    ...leading.map((action, index) => ({ action, side: "leading" as const, index })),
    ...trailing.map((action, index) => ({ action, side: "trailing" as const, index })),
  ]
  const collapse = reduced
    ? { opacity: 0, transition: { duration: 0.15 } }
    : {
        height: 0,
        opacity: 0,
        transition: {
          height: { ...motionPresets.spring.smooth, delay: 0.12 },
          opacity: { duration: motionPresets.duration.instant, delay: 0.34 },
        },
      }

  return (
    <motion.li
      ref={rowRef}
      data-slot="swipe-actions-row"
      className={cn("group/row relative isolate overflow-hidden", className, classNames?.row)}
      style={{ "--swipe-action-width": `${ACTION}px` } as React.CSSProperties}
      initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }}
      animate={{ height: "auto", opacity: 1 }}
      exit={collapse}
      transition={
        reduced
          ? { duration: 0.15 }
          : { height: motionPresets.spring.smooth, opacity: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] } }
      }
    >
      {(["leading", "trailing"] as const).map((side) =>
        actionsOf(side).map((action, index) => {
          const count = actionsOf(side).length
          const rank = side === "leading" ? count - 1 - index : index
          const coverRank = covering?.side === side ? (side === "leading" ? count - 1 - covering.index : covering.index) : null
          return (
            <ActionLayer
              key={`${side}-${index}`}
              action={action}
              side={side}
              rank={rank}
              count={count}
              coverRank={coverRank}
              x={x}
              cover={cover}
              className={classNames?.action}
              onPress={() => commit(side, index)}
            />
          )
        }),
      )}
      <motion.div
        data-slot="swipe-actions-content"
        className={cn(
          "relative z-10 flex min-h-16 min-w-0 touch-pan-y items-center gap-2 bg-card py-3 pr-2 pl-4 select-none",
          "after:pointer-events-none after:absolute after:inset-x-4 after:bottom-0 after:h-px after:bg-border",
          "[@media(hover:hover)_and_(pointer:fine)]:cursor-grab group-data-[dragging]/row:cursor-grabbing",
          classNames?.content,
        )}
        style={{ x }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClickCapture={onClickCapture}
      >
        <div className="min-w-0 flex-1">{children}</div>
        {menuItems.length > 0 ? (
          <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                data-swipe-more=""
                data-slot="swipe-actions-more"
                className="shrink-0 text-muted-foreground group-data-[dragging]/row:bg-transparent group-data-[dragging]/row:text-muted-foreground"
                aria-label={`More actions for ${label}`}
                onPointerDown={(event) => event.preventDefault()}
                onClick={(event) => {
                  if (event.detail > 0) setMenuOpen((open) => !open)
                }}
              >
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              data-slot="swipe-actions-menu"
              align="end"
              sideOffset={6}
              collisionPadding={12}
              loop
              className={cn("min-w-44", classNames?.menu)}
              onCloseAutoFocus={(event) => {
                if (!focusNeighbour.current) return
                focusNeighbour.current = false
                event.preventDefault()
                moveFocusToNeighbour()
              }}
            >
              {menuItems.map(({ action, side, index }) => (
                <DropdownMenuItem
                  key={`${side}-${index}`}
                  variant={action.tone === "danger" ? "destructive" : "default"}
                  className={cn(action.tone === "accent" && "text-primary")}
                  onSelect={() => {
                    focusNeighbour.current = !action.keepRow
                    commit(side, index)
                  }}
                >
                  <span className="inline-flex size-4 text-muted-foreground [&_svg]:size-4" aria-hidden="true">
                    {action.icon}
                  </span>
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        ) : null}
      </motion.div>
    </motion.li>
  )
}

type LayerProps = {
  action: SwipeAction
  side: Side
  rank: number
  count: number
  coverRank: number | null
  x: MotionValue<number>
  cover: MotionValue<number>
  className?: string
  onPress: () => void
}

function ActionLayer({ action, side, rank, count, coverRank, x, cover, className, onPress }: LayerProps) {
  const direction = side === "leading" ? 1 : -1
  const segment = useTransform(x, (value) => Math.max(0, value * direction) / count)
  const inset = useTransform([x, cover], (latest: number[]) => {
    const value = latest[0] ?? 0
    const progress = latest[1] ?? 0
    const revealed = Math.max(0, value * direction)
    const base = ((count - rank) * revealed) / count
    if (coverRank === rank) return base + progress * (revealed - base)
    if (coverRank !== null && rank > coverRank) return base * (1 - progress)
    return base
  })
  const shift = useTransform(inset, (value) => direction * value)
  const glyphX = useTransform([segment, cover], (latest: number[]) => {
    const share = latest[0] ?? 0
    const progress = latest[1] ?? 0
    return -direction * (coverRank === rank ? share / 2 + progress * (ACTION / 2 - share / 2) : share / 2)
  })
  const iconReveal = useTransform([segment, cover], (latest: number[]) => {
    const share = latest[0] ?? 0
    const progress = latest[1] ?? 0
    const own = clamp01((share - ACTION * 0.25) / (ACTION * 0.55))
    if (coverRank === rank) return Math.max(own, progress)
    return coverRank === null ? own : own * (1 - progress)
  })
  const labelReveal = useTransform([segment, cover], (latest: number[]) => {
    const share = latest[0] ?? 0
    const progress = latest[1] ?? 0
    const own = clamp01((share - ACTION * 0.72) / (ACTION * 0.24))
    if (coverRank === rank) return Math.max(own, progress)
    return coverRank === null ? own : own * (1 - progress)
  })
  const iconScale = useTransform(iconReveal, (value) => 0.6 + 0.4 * value)
  return (
    <motion.button
      type="button"
      tabIndex={-1}
      aria-hidden="true"
      data-slot="swipe-actions-layer"
      data-side={side}
      data-tone={action.tone ?? "neutral"}
      className={cn(
        "group/layer absolute inset-y-0 w-full cursor-pointer border-0 p-0 text-foreground",
        "data-[side=leading]:right-full data-[side=trailing]:left-full",
        "data-[tone=neutral]:bg-muted data-[tone=accent]:bg-primary data-[tone=accent]:text-primary-foreground",
        "data-[tone=danger]:bg-destructive data-[tone=danger]:text-background",
        className,
      )}
      style={{ x: shift, zIndex: rank + 1 }}
      onClick={onPress}
    >
      <motion.span className="absolute inset-y-0 w-0 group-data-[side=leading]/layer:right-0 group-data-[side=trailing]/layer:left-0" style={{ x: glyphX }}>
        <span className="absolute inset-y-0 left-[calc(var(--swipe-action-width)/-2)] flex w-(--swipe-action-width) flex-col items-center justify-center gap-0.5">
          <motion.span className="grid place-items-center [&_svg]:size-5" style={{ opacity: iconReveal, scale: iconScale }}>
            {action.icon}
          </motion.span>
          <motion.span className="text-xs leading-tight font-medium whitespace-nowrap" style={{ opacity: labelReveal }}>
            {action.label}
          </motion.span>
        </span>
      </motion.span>
    </motion.button>
  )
}
