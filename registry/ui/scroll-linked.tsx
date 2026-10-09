"use client"

/**
 * Maps scroll progress onto a fade, rise, scale, or rotate.
 * CSS scroll-driven animations run first. use-scroll-progress is the fallback.
 * Reduced motion shows the finished state. Clean-room. Transform and opacity only.
 */

import { useRef, type CSSProperties, type ReactNode, type RefObject } from "react"
import { motion, useTransform, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"
import { clampUnit, useScrollProgress } from "@/registry/retana/hooks/use-scroll-progress"
import { useAnimationTimeline } from "@/registry/retana/lib/scroll-timeline"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

export const SCROLL_LINKED_PRESETS = ["fade", "rise", "scale", "rotate"] as const

export type ScrollLinkedPreset = (typeof SCROLL_LINKED_PRESETS)[number]
export type ScrollLinkedTimeline = "view" | "scroll"

export type ScrollLinkedProps = {
  children: ReactNode
  /** Default rise. */
  preset?: ScrollLinkedPreset
  /**
   * Progress window, from 0 to 1, on the chosen timeline.
   * The effect starts at the first number and finishes at the second. Default [0, 1].
   */
  range?: readonly [number, number]
  /** view() follows this element. scroll() follows the scrollport. Default view. */
  timeline?: ScrollLinkedTimeline
  /** Scrollport. Omit to use the window. */
  container?: RefObject<HTMLElement | null>
  className?: string
}

export function unitRange(range: readonly [number, number] | undefined): [number, number] {
  const start = range && Number.isFinite(range[0]) ? range[0] : 0
  const end = range && Number.isFinite(range[1]) ? range[1] : 1
  if (start === end) return [start, start]
  return start < end ? [start, end] : [end, start]
}

/** CSS animation-range for the same window the hook uses. */
export function scrollLinkedAnimationRange(range: readonly [number, number], timeline: ScrollLinkedTimeline) {
  const [start, end] = unitRange(range)
  const from = Math.round(clampUnit(start) * 100)
  const to = Math.round(clampUnit(end) * 100)
  if (timeline === "scroll") return `${from}% ${to}%`
  return `cover ${from}% cover ${to}%`
}

export function scrollLinkedTimelineName(timeline: ScrollLinkedTimeline, hasContainer: boolean) {
  if (timeline === "view") return "view()"
  return hasContainer ? "scroll(nearest)" : "scroll(root)"
}

export function scrollLinkedDriver(reduced: boolean, supported: boolean) {
  if (reduced) return "reduced" as const
  if (supported) return "css" as const
  return "hook" as const
}

/** Progress inside a window. Non-finite input stays at the start of the effect. */
export function rangeProgress(progress: number, range: readonly [number, number]) {
  const [start, end] = unitRange(range)
  if (!Number.isFinite(progress) || start === end) return 0
  return clampUnit((progress - start) / (end - start))
}

export const SCROLL_LINKED_CSS = `
@keyframes retana-scroll-linked-fade {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes retana-scroll-linked-rise {
  from { opacity: 0; transform: translateY(1rem); }
  to { opacity: 1; transform: none; }
}
@keyframes retana-scroll-linked-scale {
  from { opacity: 0; transform: scale(0.96); }
  to { opacity: 1; transform: none; }
}
@keyframes retana-scroll-linked-rotate {
  from { transform: rotate(-8deg); }
  to { transform: none; }
}
@supports ((animation-timeline: view()) or (animation-timeline: scroll())) {
  [data-slot="scroll-linked"][data-driver="css"] {
    animation-name: var(--scroll-linked-animation);
    animation-duration: auto;
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-timeline: var(--scroll-linked-timeline, view());
    animation-range: var(--scroll-linked-range, cover 0% cover 100%);
  }
}
`

const FINAL: CSSProperties = { opacity: 1, transform: "none" }

export function ScrollLinked({
  children,
  preset = "rise",
  range,
  timeline = "view",
  container,
  className,
}: ScrollLinkedProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useMotionPreference()
  const kind = timeline === "view" ? "view()" : "scroll()"
  const supported = useAnimationTimeline(kind)
  const driver = scrollLinkedDriver(reduced, supported)
  const windowRange = unitRange(range)
  const { progress } = useScrollProgress({
    container,
    target: timeline === "view" ? ref : undefined,
    offset: timeline === "view" ? ["start end", "end start"] : undefined,
  })

  if (driver === "reduced") {
    return (
      <div
        ref={ref}
        data-slot="scroll-linked"
        data-preset={preset}
        data-driver="reduced"
        data-reduced="true"
        data-state="final"
        className={cn("min-w-0 max-w-full", className)}
        style={FINAL}
      >
        {children}
      </div>
    )
  }

  if (driver === "css") {
    const style = {
      "--scroll-linked-animation": `retana-scroll-linked-${preset}`,
      "--scroll-linked-timeline": scrollLinkedTimelineName(timeline, Boolean(container)),
      "--scroll-linked-range": scrollLinkedAnimationRange(windowRange, timeline),
    } as CSSProperties
    return (
      <div
        ref={ref}
        data-slot="scroll-linked"
        data-preset={preset}
        data-driver="css"
        data-timeline={timeline}
        data-reduced="false"
        className={cn("min-w-0 max-w-full", className)}
        style={style}
      >
        <style>{SCROLL_LINKED_CSS}</style>
        {children}
      </div>
    )
  }

  return (
    <ScrollLinkedMotion
      ref={ref}
      preset={preset}
      progress={progress}
      range={windowRange}
      className={className}
    >
      {children}
    </ScrollLinkedMotion>
  )
}

function ScrollLinkedMotion({
  ref,
  preset,
  progress,
  range,
  className,
  children,
}: {
  ref: RefObject<HTMLDivElement | null>
  preset: ScrollLinkedPreset
  progress: MotionValue<number>
  range: readonly [number, number]
  className?: string
  children: ReactNode
}) {
  const input = [range[0], range[1]] as [number, number]
  const opacity = useTransform(progress, input, [preset === "rotate" ? 1 : 0, 1])
  const y = useTransform(progress, input, [preset === "rise" ? 16 : 0, 0])
  const scale = useTransform(progress, input, [preset === "scale" ? 0.96 : 1, 1])
  const rotate = useTransform(progress, input, [preset === "rotate" ? -8 : 0, 0])

  return (
    <motion.div
      ref={ref}
      data-slot="scroll-linked"
      data-preset={preset}
      data-driver="hook"
      data-reduced="false"
      className={cn("min-w-0 max-w-full", className)}
      style={{ opacity, y, scale, rotate }}
    >
      <style>{SCROLL_LINKED_CSS}</style>
      {children}
    </motion.div>
  )
}
