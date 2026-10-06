"use client"

/**
 * Reading bar bound to scroll progress. Clean-room. No Motion UI source.
 * The bar reports position. Reduced motion does not freeze it, and it does not tween on its own.
 */

import { useLayoutEffect, useState } from "react"
import { motion, useMotionValueEvent, useTransform } from "motion/react"

import { cn } from "@/lib/utils"
import { clampUnit, readingPercent, useScrollProgress, type UseScrollProgressOptions } from "@/registry/retana/hooks/use-scroll-progress"

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
        <motion.div
          data-slot="scroll-progress-bar"
          className={cn("h-full origin-left bg-primary rtl:origin-right", barClassName)}
          style={{ scaleX: tracked > 1 ? scaleX : 0 }}
        />
      </div>
      {showValue ? (
        <span className="shrink-0 pr-3 text-xs tabular-nums text-muted-foreground">{percent}%</span>
      ) : null}
    </div>
  )
}
