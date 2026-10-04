"use client"

import * as React from "react"
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, ReactNode } from "react"
import { Bell, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/**
 * Depth stack of notices. Dismiss the front card and the next one steps forward.
 * Visual inspiration only: Design & Code With AV, Facebook reel "Notification Stack UI Upgrade".
 * No code from that reel was used.
 * toast-stack is for short results at the edge. notification-center keeps read state.
 * card-stack is a left-or-right triage deck.
 */

const REDUCE_QUERY = "(prefers-reduced-motion: reduce)"
const PEEK = 14
const MAX_BEHIND = 3
const DISMISS_DISTANCE = 88

export type NotificationTone = "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5" | "primary"

export type NotificationStackItem = {
  id: string
  title: string
  body?: string
  time?: string
  dateTime?: string
  tone?: NotificationTone
  icon?: ReactNode
}

export type NotificationStackClassNames = {
  root?: string
  card?: string
  icon?: string
  title?: string
  body?: string
  time?: string
  dismiss?: string
  badge?: string
  depth?: string
  empty?: string
}

export type NotificationStackProps = {
  items?: NotificationStackItem[]
  defaultItems?: NotificationStackItem[]
  onDismiss?: (id: string) => void
  onEmpty?: () => void
  onItemClick?: (item: NotificationStackItem) => void
  renderAction?: (item: NotificationStackItem) => ReactNode
  empty?: ReactNode
  emptyLabel?: string
  label?: string
  dismissLabel?: (item: NotificationStackItem) => string
  expandLabel?: string
  collapseLabel?: string
  expandable?: boolean
  /** Escape dismisses the focused card. Default true. */
  dismissOnEscape?: boolean
  className?: string
  classNames?: NotificationStackClassNames
}

const toneStyle: Record<NotificationTone, { background: string; color: string }> = {
  "chart-1": {
    background: "color-mix(in oklch, var(--chart-1) 18%, var(--background))",
    color: "var(--chart-1)",
  },
  "chart-2": {
    background: "color-mix(in oklch, var(--chart-2) 18%, var(--background))",
    color: "var(--chart-2)",
  },
  "chart-3": {
    background: "color-mix(in oklch, var(--chart-3) 18%, var(--background))",
    color: "var(--chart-3)",
  },
  "chart-4": {
    background: "color-mix(in oklch, var(--chart-4) 18%, var(--background))",
    color: "var(--chart-4)",
  },
  "chart-5": {
    background: "color-mix(in oklch, var(--chart-5) 18%, var(--background))",
    color: "var(--chart-5)",
  },
  primary: {
    background: "color-mix(in oklch, var(--primary) 18%, var(--background))",
    color: "var(--primary)",
  },
}

const stackCss = `
  [data-slot="notification-count"] {
    animation: retana-notice-pop 280ms ease-out;
  }
  [data-slot="notification-leaving"] {
    animation: retana-notice-leave 300ms ease-out forwards;
  }
  [data-expanded="true"] [data-slot="notification-row"] {
    animation: retana-notice-in 280ms ease both;
  }
  @keyframes retana-notice-pop {
    0% { transform: scale(0.86); }
    60% { transform: scale(1.08); }
    100% { transform: scale(1); }
  }
  @keyframes retana-notice-leave {
    to { transform: translateX(110%); opacity: 0; }
  }
  @keyframes retana-notice-in {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: none; }
  }
  @media (prefers-reduced-motion: reduce) {
    [data-slot="notification-count"],
    [data-slot="notification-leaving"],
    [data-expanded="true"] [data-slot="notification-row"] {
      animation: none;
    }
  }
`

function subscribeReduced(onChange: () => void) {
  const query = window.matchMedia(REDUCE_QUERY)
  query.addEventListener("change", onChange)
  return () => query.removeEventListener("change", onChange)
}

function usePrefersReducedMotion() {
  return React.useSyncExternalStore(
    subscribeReduced,
    () => window.matchMedia(REDUCE_QUERY).matches,
    () => false,
  )
}

function defaultDismissLabel(item: NotificationStackItem) {
  return `Mark ${item.title} as done`
}

function Depth({ remaining, className }: { remaining: number; className?: string }) {
  return (
    <div data-slot="notification-depth" className={cn("flex flex-wrap items-center gap-1.5", className)} aria-hidden>
      <span className="h-1 w-6 rounded-full bg-primary" />
      {Array.from({ length: remaining }, (_, index) => (
        <span key={`depth-${index}`} className="size-1.5 rounded-full bg-muted-foreground/45" />
      ))}
    </div>
  )
}

function StackCard({
  item,
  dismissLabel,
  onDismiss,
  onOpen,
  action,
  depth,
  muted = false,
  classNames,
}: {
  item: NotificationStackItem
  dismissLabel: string
  onDismiss?: () => void
  onOpen?: () => void
  action?: ReactNode
  depth?: number
  muted?: boolean
  classNames?: NotificationStackClassNames
}) {
  const tone = toneStyle[item.tone ?? "primary"]
  return (
    <div
      data-slot="notification-card"
      className={cn(
        "flex min-w-0 flex-col gap-3 rounded-2xl border border-border p-3 shadow-lg",
        muted ? "bg-card/60 shadow-sm backdrop-blur-md" : "bg-card",
        classNames?.card,
      )}
    >
      <div className="flex min-w-0 items-start gap-3">
        <span
          data-slot="notification-icon"
          className={cn("grid size-10 shrink-0 place-items-center rounded-full", classNames?.icon)}
          style={tone}
        >
          {item.icon ?? <Bell className="size-4" aria-hidden />}
        </span>
        <div className="min-w-0 flex-1">
          {onOpen ? (
            <button type="button" className="block w-full min-w-0 text-left" onClick={onOpen}>
              <CardCopy item={item} classNames={classNames} />
            </button>
          ) : (
            <CardCopy item={item} classNames={classNames} />
          )}
          {action ? <div className="mt-2">{action}</div> : null}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          {item.time ? (
            <time
              dateTime={item.dateTime}
              className={cn("text-xs whitespace-nowrap text-muted-foreground tabular-nums", classNames?.time)}
            >
              {item.time}
            </time>
          ) : null}
          {onDismiss ? (
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              data-slot="notification-dismiss"
              className={cn("rounded-full bg-muted", classNames?.dismiss)}
              aria-label={dismissLabel}
              onClick={onDismiss}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <Check />
            </Button>
          ) : null}
        </div>
      </div>
      {depth !== undefined ? <Depth remaining={depth} className={classNames?.depth} /> : null}
    </div>
  )
}

function CardCopy({
  item,
  classNames,
}: {
  item: NotificationStackItem
  classNames?: NotificationStackClassNames
}) {
  return (
    <>
      <p className={cn("text-sm font-semibold break-words", classNames?.title)}>{item.title}</p>
      {item.body ? (
        <p className={cn("line-clamp-2 text-sm break-words text-muted-foreground", classNames?.body)}>{item.body}</p>
      ) : null}
    </>
  )
}

export function NotificationStack({
  items,
  defaultItems = [],
  onDismiss,
  onEmpty,
  onItemClick,
  renderAction,
  empty,
  emptyLabel = "You're all caught up",
  label = "Notifications",
  dismissLabel = defaultDismissLabel,
  expandLabel = "Show all",
  collapseLabel = "Stack",
  expandable = true,
  dismissOnEscape = true,
  className,
  classNames,
}: NotificationStackProps) {
  const reduced = usePrefersReducedMotion()
  const controlled = items !== undefined
  const [internal, setInternal] = React.useState(defaultItems)
  const [expanded, setExpanded] = React.useState(false)
  const [live, setLive] = React.useState("")
  const [leaving, setLeaving] = React.useState<NotificationStackItem | null>(null)
  const [dragX, setDragX] = React.useState(0)
  const displayed = controlled ? items : internal
  const rootRef = React.useRef<HTMLDivElement>(null)
  const dragRef = React.useRef<{ id: string; startX: number; pointerId: number; moved: number } | null>(null)
  const previousRef = React.useRef<NotificationStackItem[] | null>(null)

  React.useEffect(() => {
    const previous = previousRef.current
    previousRef.current = displayed
    if (!previous || reduced || expanded) return
    const removed = previous.find((item) => !displayed.some((next) => next.id === item.id))
    if (!removed) return
    setLeaving(removed)
  }, [displayed, expanded, reduced])

  React.useEffect(() => {
    if (!leaving) return
    const id = window.setTimeout(() => setLeaving(null), 300)
    return () => window.clearTimeout(id)
  }, [leaving])

  function dismiss(id: string) {
    const next = displayed.filter((item) => item.id !== id)
    if (next.length === displayed.length) return
    onDismiss?.(id)
    if (!controlled) setInternal(next)
    if (next.length === 0) onEmpty?.()
    setLive(`Notification dismissed, ${next.length} remaining`)
    setDragX(0)
    dragRef.current = null
    const shouldFocus = rootRef.current?.contains(document.activeElement) ?? false
    if (shouldFocus) {
      queueMicrotask(() => {
        const nextFront = rootRef.current?.querySelector<HTMLElement>("[data-slot='notification-front']")
        nextFront?.focus()
      })
    }
  }

  function onKeyDown(event: ReactKeyboardEvent<HTMLElement>, id: string) {
    const dismissKey =
      event.key === "Delete" || event.key === "Backspace" || (dismissOnEscape && event.key === "Escape")
    if (!dismissKey) return
    event.preventDefault()
    dismiss(id)
  }

  function onPointerDown(event: ReactPointerEvent<HTMLElement>, id: string) {
    if (event.button !== 0) return
    const target = event.target
    if (target instanceof Element && target.closest("[data-slot='notification-dismiss'], a, button")) return
    dragRef.current = { id, startX: event.clientX, pointerId: event.pointerId, moved: 0 }
    if (!reduced) event.currentTarget.setPointerCapture(event.pointerId)
  }

  function onPointerMove(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    const delta = Math.max(0, event.clientX - drag.startX)
    drag.moved = delta
    if (!reduced) setDragX(delta)
  }

  function onPointerUp(event: ReactPointerEvent<HTMLElement>) {
    const drag = dragRef.current
    if (!drag || drag.pointerId !== event.pointerId) return
    dragRef.current = null
    if (drag.moved >= DISMISS_DISTANCE) dismiss(drag.id)
    else setDragX(0)
  }

  const queued = Math.max(0, displayed.length - 1)
  const behind = displayed.slice(1, 1 + MAX_BEHIND)
  const front = displayed[0]

  return (
    <div
      ref={rootRef}
      data-slot="notification-stack"
      data-motion={reduced ? "reduce" : "ok"}
      data-expanded={expanded ? "true" : "false"}
      role="region"
      aria-label={label}
      className={cn("flex w-full min-w-0 max-w-md flex-col", className, classNames?.root)}
    >
      <style>{stackCss}</style>
      {displayed.length === 0 ? (
        <div
          data-slot="notification-empty"
          className={cn(
            "rounded-2xl border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground",
            classNames?.empty,
          )}
        >
          {empty ?? emptyLabel}
        </div>
      ) : expanded ? (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {displayed.map((item, index) => (
            <li key={item.id} data-slot="notification-row" className="min-w-0" style={{ animationDelay: `${index * 40}ms` }}>
              <article
                tabIndex={0}
                data-slot="notification-front"
                aria-setsize={displayed.length}
                aria-posinset={index + 1}
                className="rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                onKeyDown={(event) => onKeyDown(event, item.id)}
              >
                <StackCard
                  item={item}
                  dismissLabel={dismissLabel(item)}
                  onDismiss={() => dismiss(item.id)}
                  onOpen={onItemClick ? () => onItemClick(item) : undefined}
                  action={renderAction?.(item)}
                  classNames={classNames}
                />
              </article>
            </li>
          ))}
        </ul>
      ) : (
        <div className="relative overflow-x-clip">
          <ul className="relative m-0 list-none p-0" style={{ paddingTop: behind.length * PEEK }}>
            {[...behind].reverse().map((item, index) => {
              const tier = behind.length - index
              const scale = reduced ? 1 : 1 - tier * 0.05
              return (
                <li
                  key={item.id}
                  data-slot="notification-tier"
                  data-tier={tier}
                  aria-hidden
                  inert
                  className="absolute inset-x-0"
                  style={{
                    top: (behind.length - tier) * PEEK,
                    zIndex: index + 1,
                    opacity: 1 - tier * 0.18,
                    transform: `scale(${scale})`,
                    transformOrigin: "top center",
                  }}
                >
                  <StackCard item={item} dismissLabel={dismissLabel(item)} muted classNames={classNames} />
                </li>
              )
            })}
            {leaving ? (
              <li
                key={leaving.id}
                aria-hidden
                data-slot="notification-leaving"
                className="pointer-events-none absolute inset-x-0 z-20"
                style={{ top: behind.length * PEEK }}
              >
                <StackCard item={leaving} dismissLabel={dismissLabel(leaving)} muted classNames={classNames} />
              </li>
            ) : null}
            {front ? (
              <li
                className="relative z-10"
                style={
                  dragX > 0 && !reduced
                    ? { transform: `translateX(${dragX}px)`, opacity: Math.max(0.45, 1 - dragX / 280) }
                    : undefined
                }
              >
                <article
                  tabIndex={0}
                  data-slot="notification-front"
                  aria-setsize={displayed.length}
                  aria-posinset={1}
                  className="rounded-2xl outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  onKeyDown={(event) => onKeyDown(event, front.id)}
                  onPointerDown={(event) => onPointerDown(event, front.id)}
                  onPointerMove={onPointerMove}
                  onPointerUp={onPointerUp}
                  onPointerCancel={onPointerUp}
                >
                  <StackCard
                    item={front}
                    dismissLabel={dismissLabel(front)}
                    onDismiss={() => dismiss(front.id)}
                    onOpen={onItemClick ? () => onItemClick(front) : undefined}
                    action={renderAction?.(front)}
                    depth={queued}
                    classNames={classNames}
                  />
                </article>
              </li>
            ) : null}
          </ul>
          {queued > 0 ? (
            <span
              key={queued}
              data-slot="notification-count"
              data-count={queued}
              className={cn(
                "absolute top-0 right-0 z-30 inline-flex min-w-8 translate-x-1 -translate-y-1/2 items-center justify-center rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground shadow-sm",
                classNames?.badge,
              )}
            >
              +{queued}
            </span>
          ) : null}
        </div>
      )}

      {expandable && displayed.length > 1 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-3 self-start"
          aria-expanded={expanded}
          onClick={() => setExpanded((current) => !current)}
        >
          {expanded ? collapseLabel : expandLabel}
        </Button>
      ) : null}

      <p className="sr-only" aria-live="polite" data-slot="notification-live">
        {live}
      </p>
    </div>
  )
}
