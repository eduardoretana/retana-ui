"use client"

/** Adapted from Arc UI (MIT). */

import { useEffect, useRef, useState, useSyncExternalStore } from "react"
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type TextShimmerProps = {
  children: string
  active?: boolean
  duration?: number
  as?: "span" | "p" | "div" | "h2" | "h3" | "h4"
  className?: string
  id?: string
}

const subscribe = () => () => {}

function usePageVisible() {
  const [visible, setVisible] = useState(true)
  useEffect(() => {
    const onChange = () => setVisible(document.visibilityState !== "hidden")
    onChange()
    document.addEventListener("visibilitychange", onChange)
    return () => document.removeEventListener("visibilitychange", onChange)
  }, [])
  return visible
}

export function TextShimmer({ children, active = true, duration = 1.8, as = "span", className, id }: TextShimmerProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const prefersReduced = useReducedMotion()
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)
  const reduced = Boolean(hydrated && prefersReduced)
  const inView = useInView(ref, { margin: "64px" })
  const pageVisible = usePageVisible()
  const running = active && !reduced && inView && pageVisible
  const Tag = as

  return (
    <Tag
      id={id}
      data-slot="text-shimmer"
      data-state={active ? "active" : "idle"}
      className={cn("inline-block max-w-full", className)}
      aria-busy={active || undefined}
    >
      <span ref={ref} className="inline-grid">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={children}
            className="col-start-1 row-start-1 bg-clip-text text-transparent"
            style={{
              backgroundImage:
                "linear-gradient(90deg, var(--muted-foreground), var(--foreground), var(--muted-foreground))",
              backgroundSize: "200% 100%",
            }}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.3em", filter: `blur(${motionPresets.blur.soft}px)` }}
            animate={
              reduced
                ? { opacity: 1, backgroundPositionX: "0%" }
                : {
                    opacity: 1,
                    y: "0em",
                    filter: "blur(0px)",
                    backgroundPositionX: running ? ["100%", "-100%"] : "0%",
                  }
            }
            transition={
              running
                ? { backgroundPositionX: { duration, repeat: Infinity, ease: "linear" }, default: { duration: motionPresets.duration.standard } }
                : { duration: reduced ? motionPresets.duration.instant : motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }
            }
            exit={
              reduced
                ? { opacity: 0, transition: { duration: motionPresets.duration.instant } }
                : { opacity: 0, y: "-0.24em", filter: `blur(${motionPresets.blur.subtle}px)` }
            }
          >
            {children}
          </motion.span>
        </AnimatePresence>
      </span>
    </Tag>
  )
}
