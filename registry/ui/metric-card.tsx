"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type Variants } from "motion/react"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { AnimatedCounter } from "@/registry/retana/ui/animated-counter"

export type MetricCardClassNames = {
  root?: string
  label?: string
  change?: string
  value?: string
  context?: string
}

export type MetricCardProps = {
  label: string
  value: number
  suffix?: string
  context: string
  change?: string
  className?: string
  classNames?: MetricCardClassNames
}

const rise: Variants = {
  hidden: (direction: number) => ({
    opacity: 0,
    y: `${0.3 * direction}em`,
    filter: `blur(${motionPresets.blur.soft}px)`,
  }),
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] },
  },
  gone: (direction: number) => ({
    opacity: 0,
    y: `${-0.3 * direction}em`,
    filter: `blur(${motionPresets.blur.subtle}px)`,
    transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
  }),
}

const fade: Variants = {
  hidden: { opacity: 0, y: 0, filter: "blur(0px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.instant } },
  gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.instant } },
}

function amountIn(text: string) {
  return Number(text.replace(/,/g, "").match(/-?\d+(?:\.\d+)?/)?.[0] ?? NaN)
}

function Swap({ text, morph = false, block = false }: { text: string; morph?: boolean; block?: boolean }) {
  const reduceMotion = !!useReducedMotion()
  const sizer = React.useRef<HTMLSpanElement>(null)
  const width = useMotionValue<number | "auto">("auto")
  const [shown, setShown] = React.useState({ text, direction: 1 })
  if (shown.text !== text) setShown({ text, direction: amountIn(text) < amountIn(shown.text) ? -1 : 1 })
  React.useEffect(() => {
    const node = sizer.current
    if (!node || typeof ResizeObserver === "undefined") return
    let measured: string | null = null
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth
      if (next && measured !== null && measured !== node.textContent && !reduceMotion) animate(width, next, motionPresets.spring.morph)
      else width.jump(next || "auto")
      measured = next ? node.textContent : null
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [morph, reduceMotion, width])
  return (
    <motion.span className={cn("relative max-w-full", block ? "block" : "inline-flex overflow-x-clip align-top whitespace-nowrap")} style={morph ? { width } : undefined}>
      {morph ? (
        <span ref={sizer} className="pointer-events-none absolute top-0 left-0 invisible whitespace-nowrap" aria-hidden="true">
          {text}
        </span>
      ) : null}
      <AnimatePresence mode="popLayout" initial={false} custom={shown.direction}>
        <motion.span key={text} className={cn("min-w-0 wrap-anywhere", block ? "block" : "inline-block")} custom={shown.direction} variants={reduceMotion ? fade : rise} initial="hidden" animate="shown" exit="gone">
          {text}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  )
}

function trendOf(change: string) {
  if (/^[+]/.test(change)) return "up"
  if (/^[-−]/.test(change)) return "down"
  return undefined
}

export function MetricCard({ label, value, suffix, context, change, className, classNames }: MetricCardProps) {
  const reduceMotion = !!useReducedMotion()
  const trend = change ? trendOf(change) : undefined
  return (
    <Card
      data-slot="metric-card"
      className={cn("min-w-0 gap-0 py-6 shadow-sm ring-border max-[380px]:py-4", className, classNames?.root)}
    >
      <CardHeader className="flex-row items-start justify-between gap-3">
        <span data-slot="metric-card-label" className={cn("min-w-0 text-sm text-muted-foreground", classNames?.label)}>
          <Swap text={label} block />
        </span>
        <AnimatePresence initial={false}>
          {change ? (
            <motion.span
              key="change"
              className="inline-flex shrink-0"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96, transition: { duration: motionPresets.duration.fast } }}
              transition={reduceMotion ? { duration: 0 } : motionPresets.spring.snappy}
            >
              <Badge
                variant="outline"
                data-slot="metric-card-change"
                data-trend={trend}
                className={cn(
                  "h-auto border-border px-2 py-0.5 font-normal text-muted-foreground tabular-nums",
                  trend === "up" && "border-transparent bg-primary/10 text-primary",
                  trend === "down" && "border-transparent bg-destructive/10 text-destructive",
                  classNames?.change,
                )}
              >
                <Swap text={change} morph />
              </Badge>
            </motion.span>
          ) : null}
        </AnimatePresence>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AnimatedCounter value={value} suffix={suffix} animateOnView className={classNames?.value} />
        <p data-slot="metric-card-context" className={cn("text-sm text-muted-foreground", classNames?.context)}>
          <Swap text={context} block />
        </p>
      </CardContent>
    </Card>
  )
}
