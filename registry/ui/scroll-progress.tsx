"use client"

/**
 * Reading bar bound to scroll progress. Clean-room. No Motion UI source.
 * The bar reports position. Reduced motion does not freeze it, and it does not tween on its own.
 */

import { useLayoutEffect, useState, type CSSProperties } from "react"
import { motion, useMotionValueEvent, useReducedMotion, useTransform } from "motion/react"

import { cn } from "@/lib/utils"
import { clampUnit, readingPercent, useScrollProgress, type UseScrollProgressOptions } from "@/registry/retana/hooks/use-scroll-progress"
import { useAnimationTimeline } from "@/registry/retana/lib/scroll-timeline"

export type ScrollProgressProps = UseScrollProgressOptions & {
  /** Accessible name. Default "Reading progress". */
  label?: string
  className?: string
  barClassName?: string
  /** Stick to the top of the nearest scrollport, or sit in normal flow. */
  placement?: "sticky" | "inline"
  /** Show the percent beside the bar. */
  showValue?: boolean
}

export type ScrollProgressDriver = "reduced" | "css" | "hook"

/**
 * CSS scroll(root) drives the bar when the browser can, the axis is vertical,
 * and the range is the scroller itself. The hook remains the fallback and the
 * source of aria-valuenow.
 */
export function scrollProgressDriver(options: {
  reduced: boolean
  supported: boolean
  overflow: number
  axis: "x" | "y"
  hasTarget: boolean
  hasOffset: boolean
}): ScrollProgressDriver {
  if (options.reduced) return "reduced"
  if (
    options.supported &&
    options.overflow > 1 &&
    options.axis === "y" &&
    !options.hasTarget &&
    !options.hasOffset
  ) {
    return "css"
  }
  return "hook"
}

/** Document scroll uses scroll(root). A nested scroller uses the nearest scrollport. */
export function scrollProgressTimeline(hasContainer: boolean) {
  return hasContainer ? "scroll(nearest)" : "scroll(root)"
}

export const SCROLL_PROGRESS_CSS = `
@keyframes retana-scroll-progress {
  from { transform: scaleX(0); }
  to { transform: scaleX(1); }
}
@supports (animation-timeline: scroll()) {
  [data-slot="scroll-progress-bar"][data-driver="css"] {
    animation-name: retana-scroll-progress;
    animation-duration: auto;
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-timeline: var(--scroll-progress-timeline, scroll(root));
    transform-origin: left center;
  }
  [dir="rtl"] [data-slot="scroll-progress-bar"][data-driver="css"] {
    transform-origin: right center;
  }
}
`

export function ScrollProgress({
  label = "Reading progress",
  className,
  barClassName,
  placement = "sticky",
  showValue = false,
  container,
  target,
  axis,
  offset,
  trackContentSize,
}: ScrollProgressProps) {
  const reduced = useReducedMotion() === true
  const cssTimeline = useAnimationTimeline("scroll()")
  const { progress } = useScrollProgress({ container, target, axis, offset, trackContentSize })
  const [value, setValue] = useState(() => clampUnit(progress.get()))
  const [overflow, setOverflow] = useState(0)
  useMotionValueEvent(progress, "change", (next) => setValue(clampUnit(next)))
  useLayoutEffect(() => {
    const element = target ? null : (container?.current ?? document.scrollingElement)
    if (!(element instanceof Element)) return
    const read = () => {
      const next = axis === "x" ? element.scrollWidth - element.clientWidth : element.scrollHeight - element.clientHeight
      setOverflow((prev) => (prev === next ? prev : next))
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(element)
    for (const child of element.children) observer.observe(child)
    return () => observer.disconnect()
  }, [axis, container, target])
  const tracked = target ? Number.POSITIVE_INFINITY : overflow
  const scaleX = useTransform(progress, (next) => clampUnit(next))
  const percent = readingPercent(value, tracked)
  const driver = scrollProgressDriver({
    reduced,
    supported: cssTimeline,
    overflow: tracked,
    axis: axis ?? "y",
    hasTarget: Boolean(target),
    hasOffset: offset != null,
  })
  const fill = tracked > 1 ? value : 0

  return (
    <div
      data-slot="scroll-progress"
      className={cn(
        "flex w-full min-w-0 items-center gap-3 bg-background",
        placement === "sticky" && "sticky top-0",
        className,
      )}
    >
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        aria-valuetext={`${percent} percent`}
        className="h-1 min-w-0 flex-1 overflow-hidden bg-muted"
      >
        <style>{SCROLL_PROGRESS_CSS}</style>
        {driver === "reduced" ? (
          <div
            data-slot="scroll-progress-bar"
            data-driver="reduced"
            data-reduced="true"
            className={cn("h-full origin-left bg-primary rtl:origin-right", barClassName)}
            style={{ transform: `scaleX(${fill})` }}
          />
        ) : driver === "css" ? (
          <div
            data-slot="scroll-progress-bar"
            data-driver="css"
            className={cn("h-full origin-left bg-primary rtl:origin-right", barClassName)}
            style={{ "--scroll-progress-timeline": scrollProgressTimeline(Boolean(container)) } as CSSProperties}
          />
        ) : (
          <motion.div
            data-slot="scroll-progress-bar"
            data-driver="hook"
            className={cn("h-full origin-left bg-primary rtl:origin-right", barClassName)}
            style={{ scaleX: tracked > 1 ? scaleX : 0 }}
          />
        )}
      </div>
      {showValue ? (
        <span className="shrink-0 pr-3 text-xs tabular-nums text-muted-foreground">{percent}%</span>
      ) : null}
    </div>
  )
}
