"use client"

/**
 * Vertical scroll drives a horizontal rail while the section is sticky.
 * The section is as tall as the pane plus the overflow of the track.
 * While pinned, the pane fills the viewport, so that travel can finish
 * even when the section is the last block on the page.
 * Clean-room. Reduced motion, and viewports under the breakpoint, use a native
 * horizontal scroller with scroll-snap instead. Focusable items scroll into view.
 */

import { Children, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import { useMotionValueEvent } from "motion/react"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useMinWidth } from "@/registry/retana/hooks/use-min-width"
import { clampUnit, useScrollProgress, type UseScrollProgressOptions } from "@/registry/retana/hooks/use-scroll-progress"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

export type RailRunway = {
  /** Horizontal overflow, in pixels. */
  distance: number
  /** Pane height plus that overflow. */
  height: number
}

/**
 * Scroll range for the sticky rail.
 * Progress is 0 when the section top meets the viewport top, and 1 when the
 * section end meets the bottom of the pane. A viewport-tall range would finish
 * early whenever the pane is shorter than the screen.
 */
export function railScrollOffset(paneHeight: number): NonNullable<UseScrollProgressOptions["offset"]> {
  const pane = Number.isFinite(paneHeight) ? Math.max(0, Math.round(paneHeight)) : 0
  if (pane <= 0) return ["start start", "end end"]
  return ["start start", `end ${pane}px`]
}

/** Section height for a sticky rail: the visible pane plus the track's overflow. */
export function railRunway(paneHeight: number, trackWidth: number, paneWidth: number): RailRunway {
  const pane = Number.isFinite(paneHeight) ? Math.max(0, paneHeight) : 0
  const track = Number.isFinite(trackWidth) ? trackWidth : 0
  const view = Number.isFinite(paneWidth) ? paneWidth : 0
  const distance = Math.max(0, track - view)
  return { distance, height: pane + distance }
}

type Edges = { start: boolean; end: boolean }

export type HorizontalScrollRailProps = {
  children: ReactNode
  label?: string
  previousLabel?: string
  nextLabel?: string
  className?: string
  paneClassName?: string
  trackClassName?: string
  itemClassName?: string
  /** Native scroller below this width. Default 768. */
  minWidth?: number
}

export function HorizontalScrollRail({
  children,
  label = "Horizontal scroller",
  previousLabel = "Previous",
  nextLabel = "Next",
  className,
  paneClassName,
  trackClassName,
  itemClassName,
  minWidth = 768,
}: HorizontalScrollRailProps) {
  const reduced = useMotionPreference()
  const wide = useMinWidth(minWidth)
  const sectionRef = useRef<HTMLDivElement>(null)
  const paneRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const distanceRef = useRef(0)
  const [runway, setRunway] = useState<RailRunway>({ distance: 0, height: 0 })
  const [paneHeight, setPaneHeight] = useState(0)
  const [edges, setEdges] = useState<Edges>({ start: true, end: true })
  const pinned = wide && !reduced && runway.distance > 1 && paneHeight > 0

  const { progress } = useScrollProgress({
    target: sectionRef,
    offset: railScrollOffset(paneHeight),
    trackContentSize: true,
  })

  function pinnedFraction() {
    const section = sectionRef.current
    const pane = paneRef.current
    if (!section || !pane) return 0
    const travel = Math.max(0, section.offsetHeight - pane.clientHeight)
    if (travel <= 1) return 0
    const start = window.scrollY + section.getBoundingClientRect().top
    return clampUnit((window.scrollY - start) / travel)
  }

  function publishEdges(current: number, max: number) {
    const next = { start: current <= 1, end: max <= 1 || current >= max - 1 }
    setEdges((prev) => (prev.start === next.start && prev.end === next.end ? prev : next))
  }

  useLayoutEffect(() => {
    const pane = paneRef.current
    const track = trackRef.current
    if (!pane || !track) return
    const measure = () => {
      const next = railRunway(pane.clientHeight, track.scrollWidth, pane.clientWidth)
      distanceRef.current = next.distance
      setPaneHeight((prev) => (prev === pane.clientHeight ? prev : pane.clientHeight))
      setRunway((prev) => (prev.distance === next.distance && prev.height === next.height ? prev : next))
      const fraction = wide && !reduced && pane.clientHeight > 0 ? pinnedFraction() : next.distance <= 0 ? 0 : pane.scrollLeft / next.distance
      const edgeCurrent = fraction * next.distance
      const edgeNext = { start: edgeCurrent <= 1, end: next.distance <= 1 || edgeCurrent >= next.distance - 1 }
      setEdges((prev) => (prev.start === edgeNext.start && prev.end === edgeNext.end ? prev : edgeNext))
      if (wide && !reduced && next.distance > 1 && pane.clientHeight > 0) {
        track.style.transform = `translate3d(${-fraction * next.distance}px, 0, 0)`
      } else {
        track.style.transform = ""
      }
    }
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(pane)
    observer.observe(track)
    return () => observer.disconnect()
  }, [children, wide, reduced, progress, paneHeight])

  useMotionValueEvent(progress, "change", () => {
    if (!(wide && !reduced) || distanceRef.current <= 1) return
    const current = pinnedFraction() * distanceRef.current
    const track = trackRef.current
    if (track) track.style.transform = `translate3d(${-current}px, 0, 0)`
    publishEdges(current, distanceRef.current)
  })

  function scrollToDistance(next: number) {
    const section = sectionRef.current
    const pane = paneRef.current
    if (!section || !pane) return
    const max = distanceRef.current
    const fraction = max <= 0 ? 0 : Math.min(1, Math.max(0, next / max))
    const travel = Math.max(0, section.offsetHeight - pane.clientHeight)
    const start = window.scrollY + section.getBoundingClientRect().top
    window.scrollTo({ top: start + fraction * travel, behavior: "auto" })
  }

  function step(direction: number) {
    const pane = paneRef.current
    if (!pane) return
    const amount = Math.max(160, pane.clientWidth * 0.8) * direction
    if (!pinned) {
      pane.scrollBy({ left: amount, behavior: reduced ? "auto" : "smooth" })
      return
    }
    const max = distanceRef.current
    const current = pinnedFraction() * max
    scrollToDistance(Math.min(max, Math.max(0, current + amount)))
  }

  function revealItem(item: HTMLElement) {
    const pane = paneRef.current
    const track = trackRef.current
    if (!pane || !track || item === pane) return
    if (!pinned) {
      item.scrollIntoView({ inline: "nearest", block: "nearest" })
      return
    }
    const max = distanceRef.current
    scrollToDistance(Math.min(max, Math.max(0, layoutLeft(item, track) - 24)))
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    const target = event.target
    if (target instanceof HTMLElement && target.closest("input, textarea, select, [contenteditable='true']")) return
    event.preventDefault()
    step(event.key === "ArrowRight" ? 1 : -1)
  }

  return (
    <div data-slot="horizontal-scroll-rail" data-mode={pinned ? "pinned" : "native"} className={cn("flex w-full min-w-0 flex-col gap-2", className)}>
      <div className="flex items-center justify-end gap-1">
        <Button type="button" variant="outline" size="icon-sm" aria-label={previousLabel} disabled={edges.start} onClick={() => step(-1)}>
          <ChevronLeft data-icon="inline-start" />
        </Button>
        <Button type="button" variant="outline" size="icon-sm" aria-label={nextLabel} disabled={edges.end} onClick={() => step(1)}>
          <ChevronRight data-icon="inline-start" />
        </Button>
      </div>
      <section ref={sectionRef} className="min-w-0 max-w-full" style={pinned ? { height: runway.height } : undefined}>
        <div
          ref={paneRef}
          role="region"
          aria-label={label}
          tabIndex={0}
          data-slot="horizontal-scroll-pane"
          onKeyDown={onKeyDown}
          onScroll={() => {
            if (pinned) return
            const pane = paneRef.current
            if (!pane) return
            publishEdges(pane.scrollLeft, distanceRef.current)
          }}
          onFocusCapture={(event) => {
            const item = event.target
            if (item instanceof HTMLElement) revealItem(item)
          }}
          className={cn(
            "h-72 min-w-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pinned ? "sticky top-0 flex items-center overflow-hidden" : "snap-x snap-mandatory overflow-x-auto",
            paneClassName,
          )}
          style={pinned ? { height: "100svh" } : undefined}
        >
          <div ref={trackRef} className={cn("flex w-max gap-4", trackClassName)}>
            {Children.map(children, (child) => (
              <div data-slot="horizontal-scroll-item" className={cn("w-64 shrink-0 snap-start", itemClassName)}>
                {child}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function layoutLeft(item: HTMLElement, track: HTMLElement) {
  let left = 0
  let node: HTMLElement | null = item
  while (node && node !== track) {
    left += node.offsetLeft
    const parent: Element | null = node.offsetParent
    node = parent instanceof HTMLElement ? parent : null
  }
  return left
}
