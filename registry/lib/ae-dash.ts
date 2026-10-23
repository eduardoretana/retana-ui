/**
 * Shared motion and surface helpers for the AE dashboard pieces.
 * Clean-room. Durations only, no colors or theme tokens.
 */
import type { Transition, Variants } from "motion/react"

import { motionPresets } from "@/registry/retana/lib/motion"

/** Parent of a staggered entrance. Children use `riseItem`. */
export const staggerParent: Variants = {
  hidden: {},
  shown: { transition: { staggerChildren: motionPresets.stagger.line, delayChildren: 0.04 } },
}

/** Fade and slide up. With reduced motion the caller passes `reduce` and gets a plain fade. */
export function riseItem(reduce: boolean): Variants {
  return reduce
    ? { hidden: { opacity: 0 }, shown: { opacity: 1, transition: { duration: motionPresets.duration.instant } } }
    : {
        hidden: { opacity: 0, y: 16 },
        shown: { opacity: 1, y: 0, transition: { duration: motionPresets.duration.considered, ease: [...motionPresets.ease.enter] } },
      }
}

/** Grow transition for bars and stroke draws. Zero when motion is reduced. */
export function growTransition(reduce: boolean, index = 0): Transition {
  return reduce ? { duration: 0 } : { duration: motionPresets.duration.considered * 1.5, ease: [...motionPresets.ease.enter], delay: 0.15 + index * motionPresets.stagger.item }
}

/** Hover lift for a card. Off when motion is reduced. */
export function liftOnHover(reduce: boolean) {
  return reduce ? undefined : { y: -3, transition: motionPresets.spring.gentle }
}

/** Base card surface: theme card color, very large radius, soft shadow. */
export const aeCard = "rounded-3xl border border-border/60 bg-card text-card-foreground shadow-sm"

/** Spanish compact number, e.g. 12 400 → "12.4 mil". */
export function compactEs(value: number) {
  return new Intl.NumberFormat("es-MX", { notation: "compact", maximumFractionDigits: 1 }).format(value)
}

/** Avatar fallback is muted on muted (about 4.3:1). This lifts it to foreground for AA. */
export const avatarContrast = { avatar: "[&_[data-slot=avatar-fallback]]:text-foreground", overflow: "text-foreground", count: "text-foreground" }

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}
