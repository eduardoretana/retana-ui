"use client"

/**
 * Stagger direct StaggerItem children when the group enters the viewport.
 * Clean-room. Reduced motion shows every child at once.
 */

import { Children, cloneElement, createContext, isValidElement, useContext, useRef, type ReactElement, type ReactNode, type Ref, type RefObject } from "react"
import { motion, useInView } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets, staggerDelaySeconds } from "@/registry/retana/lib/motion"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

const enter = [...motionPresets.ease.enter] as [number, number, number, number]
const StaggerStep = createContext(motionPresets.stagger.item)

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
  /** Position in the group. StaggerReveal writes this. */
  index?: number
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
  const stamped = Children.map(children, (child, index) => {
    if (!isValidElement(child) || child.type !== StaggerItem) return child
    return cloneElement(child as ReactElement<StaggerItemProps>, { index })
  })

  return (
    <StaggerStep.Provider value={stagger}>
      <Tag
        ref={ref as Ref<HTMLDivElement>}
        data-slot="stagger-reveal"
        data-state={visible ? "shown" : "hidden"}
        data-reduced={reduced ? "true" : "false"}
        className={cn("min-w-0 max-w-full", className)}
        initial={false}
        animate={visible ? "show" : "hide"}
        variants={{ hide: {}, show: {} }}
      >
        {stamped}
      </Tag>
    </StaggerStep.Provider>
  )
}

export function StaggerItem({ children, className, as = "div", index = 0 }: StaggerItemProps) {
  const reduced = useMotionPreference()
  const step = useContext(StaggerStep)
  const delay = reduced ? 0 : staggerDelaySeconds(index, { step })
  const Tag = motion[as]
  return (
    <Tag
      data-slot="stagger-item"
      data-delay={delay}
      className={cn("min-w-0 max-w-full", className)}
      variants={{
        hide: reduced ? { opacity: 0 } : { opacity: 0, y: 8 },
        show: reduced
          ? { opacity: 1, y: 0, transition: { duration: motionPresets.duration.instant } }
          : { opacity: 1, y: 0, transition: { duration: motionPresets.duration.standard, ease: enter, delay } },
      }}
    >
      {children}
    </Tag>
  )
}
