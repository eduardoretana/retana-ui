"use client"

import * as React from "react"
import { ArrowDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type MessageListProps = {
  children: React.ReactNode
  className?: string
  viewportClassName?: string
  /** Label for the control that appears after the reader scrolls away. */
  jumpLabel?: string
  /** Distance from the bottom, in pixels, that still counts as "following". */
  stickThreshold?: number
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

export function MessageList({
  children,
  className,
  viewportClassName,
  jumpLabel = "Jump to latest",
  stickThreshold = 72,
}: MessageListProps) {
  const viewportRef = React.useRef<HTMLDivElement>(null)
  const endRef = React.useRef<HTMLDivElement>(null)
  const stickRef = React.useRef(true)
  const [away, setAway] = React.useState(false)

  const pinToEnd = React.useCallback((behavior: ScrollBehavior) => {
    const viewport = viewportRef.current
    if (!viewport) return
    const reduced = prefersReducedMotion()
    const top = viewport.scrollHeight
    if (typeof viewport.scrollTo === "function") {
      viewport.scrollTo({ top, behavior: reduced ? "auto" : behavior })
    } else {
      viewport.scrollTop = top
    }
    stickRef.current = true
    setAway(false)
  }, [])

  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const follow = () => {
      if (!stickRef.current) return
      viewport.scrollTop = viewport.scrollHeight
    }

    follow()
    const observer = new MutationObserver(follow)
    observer.observe(viewport, { childList: true, subtree: true, characterData: true })
    const resize = new ResizeObserver(follow)
    resize.observe(viewport)
    return () => {
      observer.disconnect()
      resize.disconnect()
    }
  }, [])

  function onScroll() {
    const viewport = viewportRef.current
    if (!viewport) return
    const distance = viewport.scrollHeight - viewport.scrollTop - viewport.clientHeight
    const following = distance <= stickThreshold
    stickRef.current = following
    setAway(!following)
  }

  return (
    <div data-slot="message-list" className={cn("relative min-h-0 flex-1", className)}>
      <div
        ref={viewportRef}
        data-stuck={away ? "false" : "true"}
        onScroll={onScroll}
        className={cn("h-full overflow-y-auto overscroll-contain", viewportClassName)}
      >
        <div className="flex flex-col gap-3 p-3">{children}</div>
        <div ref={endRef} data-slot="message-list-end" />
      </div>
      {away ? (
        <div className="pointer-events-none absolute inset-x-0 bottom-3 flex justify-center">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="pointer-events-auto shadow-md"
            onClick={() => pinToEnd("smooth")}
          >
            <ArrowDown />
            {jumpLabel}
          </Button>
        </div>
      ) : null}
    </div>
  )
}
