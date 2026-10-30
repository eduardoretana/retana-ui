"use client"

/** Adapted from Arc UI (MIT). The value reel is number-roll. */

import * as React from "react"
import { AnimatePresence, motion, useInView, useReducedMotionConfig, type Variants } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { formatNumberRoll, NumberRoll } from "@/registry/retana/ui/number-roll"

export type AnimatedCounterClassNames = {
  root?: string
  label?: string
  value?: string
}

export type AnimatedCounterProps = {
  value: number
  label?: string
  prefix?: string
  suffix?: string
  decimals?: number
  /** Roll every digit up from zero the first time the counter scrolls into view. */
  animateOnView?: boolean
  /** Formatting locale. Fixed by default so server and client render the same digits. */
  locale?: string
  className?: string
  classNames?: AnimatedCounterClassNames
}

const rise: Variants = {
  hidden: { opacity: 0, y: "0.3em", filter: `blur(${motionPresets.blur.soft}px)` },
  shown: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter] },
  },
  gone: {
    opacity: 0,
    y: "-0.3em",
    filter: `blur(${motionPresets.blur.subtle}px)`,
    transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
  },
}

const fade: Variants = {
  hidden: { opacity: 0, y: 0, filter: "blur(0px)" },
  shown: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.instant } },
  gone: { opacity: 0, y: 0, filter: "blur(0px)", transition: { duration: motionPresets.duration.instant } },
}

export function AnimatedCounter({
  value,
  label,
  prefix = "",
  suffix = "",
  decimals = 0,
  animateOnView = false,
  locale = "en-US",
  className,
  classNames,
}: AnimatedCounterProps) {
  const ref = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.6 })
  const reduceMotion = useReducedMotionConfig() === true
  const armed = animateOnView && !inView
  const text = `${prefix}${formatNumberRoll(value, decimals, locale)}${suffix}`
  return (
    <span
      ref={ref}
      data-slot="animated-counter"
      className={cn(
        "relative inline-flex min-w-0 flex-col text-3xl leading-none font-medium text-foreground tabular-nums",
        className,
        classNames?.root,
      )}
    >
      {label ? (
        <span data-slot="animated-counter-label" className={cn("mb-2 block text-xs leading-normal font-normal text-muted-foreground", classNames?.label)}>
          <span className="relative block min-w-0">
            <AnimatePresence initial={false}>
              <motion.span
                key={label}
                className="block wrap-anywhere"
                variants={reduceMotion ? fade : rise}
                initial="hidden"
                animate="shown"
                exit="gone"
              >
                {label}
              </motion.span>
            </AnimatePresence>
          </span>
        </span>
      ) : null}
      <span className="sr-only">{text}</span>
      <span data-slot="animated-counter-value" className={cn("inline-flex items-baseline whitespace-nowrap select-none", classNames?.value)} aria-hidden="true">
        <NumberRoll value={armed ? 0 : value} decimals={decimals} locale={locale} prefix={prefix} suffix={suffix} announce={false} />
      </span>
    </span>
  )
}
