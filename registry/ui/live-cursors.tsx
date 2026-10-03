"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import {
  presenceColor,
  readPresenceInfo,
  useOthers,
  useUpdateMyPresence,
  type PresenceInfo,
} from "@/registry/retana/lib/presence"

export type CursorPoint = { x: number; y: number }

export type CursorPresence = {
  cursor?: CursorPoint | null
}

function useReducedMotion() {
  const [reduced, setReduced] = React.useState(false)
  React.useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setReduced(media.matches)
    update()
    media.addEventListener("change", update)
    return () => media.removeEventListener("change", update)
  }, [])
  return reduced
}

function readCursor(presence: unknown): CursorPoint | null {
  if (!presence || typeof presence !== "object" || !("cursor" in presence)) return null
  const cursor = (presence as CursorPresence).cursor
  if (!cursor || typeof cursor.x !== "number" || typeof cursor.y !== "number") return null
  return cursor
}

export function useContainerCursor(containerRef: React.RefObject<HTMLElement | null>) {
  const update = useUpdateMyPresence<CursorPresence>()
  React.useEffect(() => {
    const element = containerRef.current
    if (!element) return
    let frame = 0
    let pending: CursorPoint | null = null
    const flush = () => {
      frame = 0
      if (pending) update({ cursor: pending })
    }
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect()
      pending = { x: event.clientX - rect.left, y: event.clientY - rect.top }
      if (!frame) frame = window.requestAnimationFrame(flush)
    }
    const onLeave = () => {
      pending = null
      if (frame) window.cancelAnimationFrame(frame)
      frame = 0
      update({ cursor: null })
    }
    element.addEventListener("pointermove", onMove)
    element.addEventListener("pointerleave", onLeave)
    return () => {
      if (frame) window.cancelAnimationFrame(frame)
      element.removeEventListener("pointermove", onMove)
      element.removeEventListener("pointerleave", onLeave)
    }
  }, [containerRef, update])
}

function SmoothCursor({
  target,
  reduced,
  color,
  name,
  cursorClassName,
  labelClassName,
}: {
  target: CursorPoint
  reduced: boolean
  color: string
  name: string
  cursorClassName?: string
  labelClassName?: string
}) {
  const [smoothed, setSmoothed] = React.useState(target)
  const pointRef = React.useRef(target)
  const point = reduced ? target : smoothed
  React.useEffect(() => {
    if (reduced) return
    let frame = 0
    const step = () => {
      const current = pointRef.current
      const next = {
        x: current.x + (target.x - current.x) * 0.35,
        y: current.y + (target.y - current.y) * 0.35,
      }
      pointRef.current = next
      setSmoothed(next)
      if (Math.abs(next.x - target.x) > 0.5 || Math.abs(next.y - target.y) > 0.5) {
        frame = window.requestAnimationFrame(step)
      }
    }
    frame = window.requestAnimationFrame(step)
    return () => window.cancelAnimationFrame(frame)
  }, [reduced, target])

  return (
    <div
      className={cn("pointer-events-none absolute start-0 top-0", cursorClassName)}
      style={{ transform: `translate3d(${point.x}px, ${point.y}px, 0)`, color }}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden className="fill-current">
        <path d="M2 1.5 13.2 7.1 7.6 8.4 5.8 14.2 2 1.5Z" />
      </svg>
      <span
        className={cn(
          "ms-3 inline-block max-w-32 truncate rounded-md bg-foreground px-1.5 py-0.5 text-xs text-background",
          labelClassName,
        )}
      >
        {name}
      </span>
    </div>
  )
}

export type LiveCursorsProps = {
  className?: string
  cursorClassName?: string
  labelClassName?: string
}

export function LiveCursors({ className, cursorClassName, labelClassName }: LiveCursorsProps) {
  const others = useOthers<CursorPresence, PresenceInfo>()
  const reduced = useReducedMotion()
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)} aria-hidden>
      {others.map((user) => {
        const cursor = readCursor(user.presence)
        if (!cursor) return null
        const info = readPresenceInfo(user.info)
        return (
          <SmoothCursor
            key={user.connectionId}
            target={cursor}
            reduced={reduced}
            color={presenceColor(user.userId, info.color)}
            name={info.name}
            cursorClassName={cursorClassName}
            labelClassName={labelClassName}
          />
        )
      })}
    </div>
  )
}
