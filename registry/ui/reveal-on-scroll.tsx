"use client"

/**
 * Fade, slide, or scale in when the element enters the viewport. Clean-room.
 * Plays once by default. Reduced motion shows the content immediately.
 */

import { useRef, type ReactNode, type RefObject } from "react"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

const enter = [...motionPresets.ease.enter] as [number, number, number, number]
const distance = 16

export type RevealVariant = "fade" | "slide" | "scale"
export type RevealFrom = "up" | "down" | "left" | "right"

export type RevealOnScrollProps = {
  children: ReactNode
  variant?: RevealVariant
  /** Slide direction. Ignored by fade. Scale keeps a slight rise when from is up. */
  from?: RevealFrom
  /** Reveal a single time. Default true. */
  once?: boolean
  /** How much of the element must be visible, from 0 to 1. Default 0.3. */
  amount?: number
  delay?: number
  className?: string
  /** Scroll root. Defaults to the viewport. */
  root?: RefObject<Element | null>
}

function hiddenOf(variant: RevealVariant, from: RevealFrom) {
  const slide = {
    up: { y: distance, x: 0 },
    down: { y: -distance, x: 0 },
    left: { x: distance, y: 0 },
    right: { x: -distance, y: 0 },
  }[from]
  if (variant === "fade") return { opacity: 0, x: 0, y: 0, scale: 1 }
  if (variant === "scale") return { opacity: 0, x: 0, y: distance / 2, scale: 0.96 }
  return { opacity: 0, scale: 1, ...slide }
}

const shown = { opacity: 1, x: 0, y: 0, scale: 1 }

export function RevealOnScroll({
  children,
  variant = "slide",
  from = "up",
  once = true,
  amount = 0.3,
  delay = 0,
  className,
  root,
}: RevealOnScrollProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useMotionPreference()
  const inView = useInView(ref, { once, amount, root, initial: reduced })
  const visible = reduced || inView

  return (
    <motion.div
      ref={ref}
      data-slot="reveal-on-scroll"
      data-variant={variant}
      data-state={visible ? "shown" : "hidden"}
      data-reduced={reduced ? "true" : "false"}
      className={cn("min-w-0 max-w-full", className)}
      initial={false}
      animate={visible ? shown : hiddenOf(variant, from)}
      transition={
        reduced
          ? { duration: 0 }
          : { duration: motionPresets.duration.considered, delay, ease: enter }
      }
    >
      {children}
    </motion.div>
  )
}
