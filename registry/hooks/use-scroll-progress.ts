"use client"

/**
 * Scroll position as a unit interval. Clean-room. No Motion UI source.
 * Window scroll is the default. Pass a container, a target, or both.
 */

import { useScroll, type MotionValue } from "motion/react"
import type { RefObject } from "react"

export type ScrollAxis = "x" | "y"

type ScrollOptions = NonNullable<Parameters<typeof useScroll>[0]>

export type UseScrollProgressOptions = {
  /** Element that scrolls. Omit to track the window. */
  container?: RefObject<HTMLElement | null>
  /** Element whose travel defines 0–1. Omit to track the container's own scroll. */
  target?: RefObject<HTMLElement | null>
  axis?: ScrollAxis
  offset?: ScrollOptions["offset"]
  /** Recalculate when the scrolling content changes size. */
  trackContentSize?: boolean
}

/** Clamp a fraction into 0–1. Non-finite values become 0. */
export function clampUnit(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(1, Math.max(0, value))
}

/**
 * `progress` is 0 at the start of the range and 1 at the end.
 * `scroll` is the pixel offset on the chosen axis.
 */
export function useScrollProgress(options: UseScrollProgressOptions = {}) {
  const axis = options.axis ?? "y"
  const { scrollX, scrollY, scrollXProgress, scrollYProgress } = useScroll({
    container: options.container,
    target: options.target,
    axis,
    offset: options.offset,
    trackContentSize: options.trackContentSize,
  })
  const progress: MotionValue<number> = axis === "x" ? scrollXProgress : scrollYProgress
  const scroll: MotionValue<number> = axis === "x" ? scrollX : scrollY
  return { progress, scroll }
}
