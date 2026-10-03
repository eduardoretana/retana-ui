"use client"

/** Adapted from Arc UI (MIT). */

import { useId, useLayoutEffect, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent, type ReactNode } from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Transition, type Variants } from "motion/react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type ExpandableCardProps = Omit<
  ComponentPropsWithoutRef<"article">,
  "title" | "children" | "onAnimationStart" | "onAnimationEnd" | "onAnimationIteration" | "onDrag" | "onDragStart" | "onDragEnd" | "onDragOver" | "onDragLeave" | "onDragEnter" | "onDragExit" | "onDrop"
> & {
  title: string
  description?: string
  children: ReactNode
  defaultExpanded?: boolean
  width?: number
  expandedWidth?: number
  classNames?: { trigger?: string; panel?: string; title?: string }
}

const morph = motionPresets.spring.smooth
const closeHold = 0.06
const settleTime = 450
const boxTransition = (expanded: boolean, hold: boolean): Transition => (expanded || !hold ? morph : { ...morph, delay: closeHold })
const contentTransition = (expanded: boolean): Transition =>
  expanded
    ? { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.standard], delay: 0.12 }
    : { duration: 0.1, ease: [...motionPresets.ease.standard] }
const still: Transition = { duration: 0 }

const wordMotion: Variants = {
  enter: { opacity: 0, y: ".35em", filter: `blur(${motionPresets.blur.soft}px)` },
  center: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] } },
  exit: { opacity: 0, y: "-.3em", filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] } },
}

function RollingText({ text, reduced }: { text: string; reduced: boolean }) {
  return (
    <span>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          {text.split(/(\s+)/).map((word, index) => (
            <motion.span key={`${index}:${word}`} className="inline-block whitespace-pre" variants={wordMotion} initial={reduced ? false : "enter"} animate="center" exit={reduced ? undefined : "exit"}>
              {word}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </span>
  )
}

export function ExpandableCard({
  title,
  description,
  children,
  defaultExpanded = false,
  width,
  expandedWidth,
  className,
  classNames,
  style,
  onKeyDown,
  ...rest
}: ExpandableCardProps) {
  const [expanded, setExpanded] = useState(defaultExpanded)
  const [hold, setHold] = useState(true)
  const lastToggle = useRef(0)
  const [room, setRoom] = useState<number | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()
  const reduceMotion = useReducedMotion() ?? false

  useLayoutEffect(() => {
    const track = trackRef.current
    if (!track) return
    const measure = () => setRoom(track.clientWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(track)
    return () => observer.disconnect()
  }, [])

  const openCap = expandedWidth ?? width
  const fit = (cap: number | undefined) => (room === null ? undefined : Math.min(room, cap ?? room))
  const boxWidth = fit(expanded ? openCap : width)
  const innerWidth = fit(openCap)
  const boxWidthValue = useMotionValue<number | string>("100%")
  const placed = useRef(false)
  const widthTransition = reduceMotion ? still : boxTransition(expanded, hold)

  useLayoutEffect(() => {
    if (boxWidth === undefined) return
    if (!placed.current) {
      placed.current = true
      boxWidthValue.jump(boxWidth)
      return
    }
    const controls = animate(boxWidthValue, boxWidth, widthTransition)
    return () => controls.stop()
    // widthTransition is derived from expanded and hold, which already change boxWidth.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boxWidth, boxWidthValue])

  const toggle = (next: boolean) => {
    const now = performance.now()
    setHold(now - lastToggle.current > settleTime)
    lastToggle.current = now
    setExpanded(next)
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    onKeyDown?.(event)
    if (event.defaultPrevented || event.key !== "Escape" || !expanded) return
    event.preventDefault()
    toggle(false)
    triggerRef.current?.focus()
  }

  const capStyle = {
    ...style,
    width: boxWidthValue,
    maxWidth: "100%",
  }

  return (
    <div ref={trackRef} data-slot="expandable-card-track" className="flex w-full min-w-0 justify-center">
      <motion.article
        {...rest}
        data-slot="expandable-card"
        data-expanded={expanded || undefined}
        className={cn("min-w-0 overflow-hidden rounded-lg border border-border bg-card text-card-foreground", className)}
        style={{ ...capStyle, ...(width ? { maxWidth: expanded ? (expandedWidth ?? width) : width } : {}) }}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={triggerRef}
          type="button"
          data-slot="expandable-card-trigger"
          className={cn("flex w-full items-center gap-3 px-4 py-3 text-left", classNames?.trigger)}
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => toggle(!expanded)}
        >
          <span className="min-w-0 flex-1">
            <strong data-slot="expandable-card-title" className={cn("block truncate", classNames?.title)}>
              {title}
            </strong>
            {description ? (
              <span className="text-sm text-muted-foreground">
                <RollingText text={description} reduced={reduceMotion} />
              </span>
            ) : null}
          </span>
          <motion.span aria-hidden="true" initial={false} animate={{ rotate: expanded ? 180 : 0 }} transition={reduceMotion ? still : boxTransition(expanded, hold)}>
            <ChevronDown />
          </motion.span>
        </button>
        <motion.div
          id={panelId}
          data-slot="expandable-card-panel"
          className={cn("overflow-hidden", classNames?.panel)}
          inert={!expanded}
          initial={false}
          animate={{ height: expanded ? "auto" : 0 }}
          transition={reduceMotion ? still : boxTransition(expanded, hold)}
        >
          <motion.div
            className="px-4 pb-4"
            style={innerWidth === undefined ? undefined : { width: innerWidth }}
            initial={false}
            animate={{ opacity: expanded ? 1 : 0 }}
            transition={reduceMotion ? still : contentTransition(expanded)}
          >
            {children}
          </motion.div>
        </motion.div>
      </motion.article>
    </div>
  )
}
