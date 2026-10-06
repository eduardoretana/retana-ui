"use client"

/**
 * Stagger direct StaggerItem children when the group enters the viewport.
 * Clean-room. Reduced motion shows every child at once.
 */

import { useRef, type ReactNode, type Ref, type RefObject } from "react"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

const enter = [...motionPresets.ease.enter] as [number, number, number, number]

type GroupTag = "div" | "ul" | "ol"
type ItemTag = "div" | "li"

export type StaggerRevealProps = {
  children: ReactNode
  className?: string
  as?: GroupTag
  once?: boolean
  amount?: number
  /** Seconds between children. Default is the shared item stagger. */
  stagger?: number
  root?: RefObject<Element | null>
}

export type StaggerItemProps = {
  children: ReactNode
  className?: string
  as?: ItemTag
}

export function StaggerReveal({
  children,
  className,
  as = "div",
  once = true,
  amount = 0.2,
  stagger = motionPresets.stagger.item,
  root,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useMotionPreference()
  const inView = useInView(ref, { once, amount, root, initial: reduced })
  const visible = reduced || inView
  const Tag = motion[as] as typeof motion.div

  return (
    <Tag
      ref={ref as Ref<HTMLDivElement>}
      data-slot="stagger-reveal"
      data-state={visible ? "shown" : "hidden"}
      data-reduced={reduced ? "true" : "false"}
      className={cn("min-w-0 max-w-full", className)}
      initial={false}
      animate={visible ? "show" : "hide"}
      variants={{
        hide: {},
        show: {
          transition: {
            staggerChildren: reduced ? 0 : stagger,
            delayChildren: reduced ? 0 : 0.04,
          },
        },
      }}
    >
      {children}
    </Tag>
  )
}

export function StaggerItem({ children, className, as = "div" }: StaggerItemProps) {
  const reduced = useMotionPreference()
  const Tag = motion[as]
  return (
    <Tag
      data-slot="stagger-item"
      className={cn("min-w-0 max-w-full", className)}
      variants={{
        hide: { opacity: 0, y: 12 },
        show: {
          opacity: 1,
          y: 0,
          transition: reduced
            ? { duration: 0 }
            : { duration: motionPresets.duration.considered, ease: enter },
        },
      }}
    >
      {children}
    </Tag>
  )
}
