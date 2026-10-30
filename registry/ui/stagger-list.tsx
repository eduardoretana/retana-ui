"use client"

/** Clean-room list. Transform and opacity only. See NOTICE. */

import type { ReactNode } from "react"
import { AnimatePresence, motion, useReducedMotionConfig, type Variants } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

/** Cap on the last item's delay, in seconds. */
export const STAGGER_LIST_MAX = 0.4

const enterEase = [motionPresets.ease.enter[0], motionPresets.ease.enter[1], motionPresets.ease.enter[2], motionPresets.ease.enter[3]] as [number, number, number, number]
const exitEase = [motionPresets.ease.exit[0], motionPresets.ease.exit[1], motionPresets.ease.exit[2], motionPresets.ease.exit[3]] as [number, number, number, number]

/** Delay for `index` so the last item never waits longer than `maxTotal`. */
export function staggerDelay(index: number, count: number, step = motionPresets.stagger.item, maxTotal = STAGGER_LIST_MAX) {
  if (count <= 1 || index <= 0) return 0
  const last = count - 1
  const total = Math.min(Math.max(0, maxTotal), Math.max(0, step) * last)
  return (Math.min(index, last) / last) * total
}

export type StaggerListProps<T extends { id: string }> = {
  items: readonly T[]
  children: (item: T, index: number) => ReactNode
  /** Seconds between neighbors before the cap. */
  stagger?: number
  /** Longest delay any item may wait. */
  maxStagger?: number
  label?: string
  empty?: ReactNode
  pending?: boolean
  className?: string
  itemClassName?: string
}

function variants(reduced: boolean): Variants {
  return {
    hidden: { opacity: 0, y: reduced ? 0 : "0.7em" },
    shown: (delay: number) => ({
      opacity: 1,
      y: 0,
      transition: reduced
        ? { duration: 0, delay: 0 }
        : { duration: motionPresets.duration.standard, ease: enterEase, delay },
    }),
    gone: (delay: number) => ({
      opacity: 0,
      y: reduced ? 0 : "-0.55em",
      transition: reduced
        ? { duration: 0, delay: 0 }
        : { duration: motionPresets.duration.exit, ease: exitEase, delay },
    }),
  }
}

export function StaggerList<T extends { id: string }>({
  items,
  children,
  stagger = motionPresets.stagger.item,
  maxStagger = STAGGER_LIST_MAX,
  label,
  empty,
  pending = false,
  className,
  itemClassName,
}: StaggerListProps<T>) {
  const reduced = useReducedMotionConfig() === true
  const motionVariants = variants(reduced)
  return (
    <ul
      data-slot="stagger-list"
      data-motion={reduced ? "reduced" : "full"}
      role="list"
      aria-label={label}
      aria-busy={pending || undefined}
      className={cn("m-0 flex min-w-0 list-none flex-col gap-2 p-0", className)}
    >
      <AnimatePresence initial={false}>
        {items.map((item, index) => (
          <motion.li
            key={item.id}
            className={cn("min-w-0", itemClassName)}
            custom={staggerDelay(index, items.length, stagger, maxStagger)}
            variants={motionVariants}
            initial={reduced ? false : "hidden"}
            animate="shown"
            exit="gone"
          >
            {children(item, index)}
          </motion.li>
        ))}
      </AnimatePresence>
      {items.length === 0 && empty != null ? (
        <li data-slot="stagger-list-empty" className="text-sm text-muted-foreground">
          {empty}
        </li>
      ) : null}
    </ul>
  )
}
