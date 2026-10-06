"use client"

/**
 * CSS scroll-snap rail for sections or cards. Clean-room.
 * Alignment is native. Smooth scrolling is off when motion is reduced.
 */

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

export type SnapAxis = "x" | "y"
export type SnapStrictness = "mandatory" | "proximity"

export type ScrollSnapRailProps = {
  children: ReactNode
  axis?: SnapAxis
  snap?: SnapStrictness
  /** Accessible name for the scroll region. */
  label?: string
  className?: string
}

export type ScrollSnapPanelProps = {
  children: ReactNode
  className?: string
}

export function ScrollSnapRail({
  children,
  axis = "y",
  snap = "mandatory",
  label = "Snapping sections",
  className,
}: ScrollSnapRailProps) {
  const reduced = useMotionPreference()
  return (
    <div
      role="region"
      aria-label={label}
      tabIndex={0}
      data-slot="scroll-snap-rail"
      data-axis={axis}
      data-reduced={reduced ? "true" : "false"}
      className={cn(
        "min-h-0 min-w-0 max-w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        axis === "y" ? "snap-y overflow-y-auto" : "snap-x overflow-x-auto",
        snap === "proximity" ? "snap-proximity" : "snap-mandatory",
        reduced ? "scroll-auto" : "scroll-smooth",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ScrollSnapPanel({ children, className }: ScrollSnapPanelProps) {
  return (
    <div data-slot="scroll-snap-panel" className={cn("shrink-0 snap-start", className)}>
      {children}
    </div>
  )
}
