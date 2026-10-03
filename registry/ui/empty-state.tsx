"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useIsPresent,
  useMotionValue,
  useReducedMotion,
  type AnimationPlaybackControls,
  type HTMLMotionProps,
  type MotionProps,
  type TargetAndTransition,
  type Transition,
} from "motion/react"
import { Folder } from "lucide-react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type EmptyStateClassNames = {
  root?: string
  icon?: string
  title?: string
  description?: string
  action?: string
}

export type EmptyStateProps = {
  title: string
  description: string
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
  classNames?: EmptyStateClassNames
  /** Optional accessible label for the state region. */
  label?: string
}

const exitFast: Transition = { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] }
const textIn: TargetAndTransition = { opacity: 0, y: "0.3em", filter: `blur(${motionPresets.blur.soft}px)` }
const textOut: TargetAndTransition = {
  opacity: 0,
  y: "-0.3em",
  filter: `blur(${motionPresets.blur.subtle}px)`,
  transition: exitFast,
}
const iconIn: TargetAndTransition = { opacity: 0, scale: 0.6, filter: `blur(${motionPresets.blur.subtle}px)` }
const shown: TargetAndTransition = { opacity: 1, y: "0em", scale: 1, filter: "blur(0px)" }
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionPresets.duration.instant } }

function Swap(props: HTMLMotionProps<"span">) {
  const present = useIsPresent()
  return <motion.span {...props} aria-hidden={present ? props["aria-hidden"] : true} />
}

function iconKey(icon: React.ReactNode) {
  if (!React.isValidElement(icon)) return "icon"
  const type = icon.type as string | { displayName?: string; name?: string }
  return typeof type === "string" ? type : type.displayName ?? type.name ?? "icon"
}

function HeightFrame({ reduce, morphKey, children }: { reduce: boolean | null; morphKey: string; children: React.ReactNode }) {
  const frame = React.useRef<HTMLDivElement>(null)
  const content = React.useRef<HTMLDivElement>(null)
  const height = useMotionValue<number | "auto">("auto")
  const changedAt = React.useRef(0)
  React.useLayoutEffect(() => {
    changedAt.current = performance.now()
  }, [morphKey])
  React.useEffect(() => {
    const node = content.current
    if (!node || typeof ResizeObserver === "undefined") return
    let last: number | undefined
    let controls: AnimationPlaybackControls | undefined
    const settle = () => {
      height.jump("auto")
      if (frame.current) Object.assign(frame.current.style, { overflow: "", height: "auto" })
    }
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.blockSize ?? node.offsetHeight
      const current = height.get()
      const from = typeof current === "number" ? current : last
      last = next
      controls?.stop()
      if (reduce || from === undefined || from === next || performance.now() - changedAt.current > 120) return settle()
      if (frame.current) Object.assign(frame.current.style, { overflow: "hidden", height: `${from}px` })
      controls = animate(height, [from, next], { ...motionPresets.spring.smooth, onComplete: settle })
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
      controls?.stop()
    }
  }, [height, reduce])
  return (
    <motion.div ref={frame} className="w-full max-w-full" style={{ height }}>
      <div ref={content} className="flow-root">
        {children}
      </div>
    </motion.div>
  )
}

export function EmptyState({ title, description, action, icon, className, classNames, label }: EmptyStateProps) {
  const reduce = useReducedMotion()
  const glyph = icon ?? <Folder width={24} height={24} strokeWidth={1.5} />
  const enter: Transition = reduce
    ? { duration: motionPresets.duration.instant }
    : { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }
  const swap: MotionProps = {
    initial: reduce ? { opacity: 0 } : textIn,
    animate: shown,
    exit: reduce ? fadeOut : textOut,
    transition: enter,
  }
  return (
    <section
      data-slot="empty-state"
      aria-label={label}
      className={cn(
        "flex w-full min-w-0 flex-col items-center px-5 py-12 text-center",
        className,
        classNames?.root,
      )}
    >
      <motion.div
        data-slot="empty-state-icon"
        aria-hidden="true"
        className={cn(
          "relative grid size-12 place-items-center rounded-xl border border-border bg-muted text-muted-foreground",
          classNames?.icon,
        )}
        initial={reduce ? false : { opacity: 0, scale: 0.92 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={reduce ? { duration: 0 } : { duration: motionPresets.duration.considered, ease: [...motionPresets.ease.enter] }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <Swap
            key={iconKey(glyph)}
            className="grid place-items-center"
            initial={reduce ? { opacity: 0 } : iconIn}
            animate={shown}
            exit={reduce ? fadeOut : { ...iconIn, transition: exitFast }}
            transition={reduce ? enter : motionPresets.spring.snappy}
          >
            {glyph}
          </Swap>
        </AnimatePresence>
      </motion.div>
      <HeightFrame reduce={reduce} morphKey={`${title}\n${description}`}>
        <h3 className={cn("relative mt-5 text-base font-medium text-foreground", classNames?.title)}>
          <AnimatePresence mode="popLayout" initial={false}>
            <Swap key={title} className="block text-balance wrap-anywhere" {...swap}>
              {title}
            </Swap>
          </AnimatePresence>
        </h3>
        <p className={cn("relative mx-auto mt-2 max-w-72 text-sm text-muted-foreground", classNames?.description)}>
          <AnimatePresence mode="popLayout" initial={false}>
            <Swap key={description} className="block text-balance wrap-anywhere" {...swap}>
              {description}
            </Swap>
          </AnimatePresence>
        </p>
      </HeightFrame>
      {action ? (
        <div data-slot="empty-state-action" className={cn("mt-5 flex flex-wrap justify-center gap-3", classNames?.action)}>
          {action}
        </div>
      ) : null}
    </section>
  )
}
