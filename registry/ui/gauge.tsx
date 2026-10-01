"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import {
  AnimatePresence,
  animate,
  motion,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useReducedMotion,
  useTransform,
  type Variants,
} from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type GaugeTone = "accent" | "success" | "warning" | "danger"

export type GaugeThreshold = {
  from: number
  tone: GaugeTone
  label: string
}

export type GaugeClassNames = {
  root?: string
  visual?: string
  value?: string
  status?: string
  label?: string
  detail?: string
}

export type GaugeProps = {
  value: number
  min?: number
  max?: number
  label: string
  detail?: string
  tone?: GaugeTone
  thresholds?: GaugeThreshold[]
  className?: string
  classNames?: GaugeClassNames
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

const reveal = { ...motionPresets.spring.smooth, visualDuration: motionPresets.duration.considered * 1.6 }

const toneClass: Record<GaugeTone, string> = {
  accent: "text-primary",
  success: "text-primary",
  warning: "text-muted-foreground",
  danger: "text-destructive",
}

function Swap({ text, direction = 1 }: { text: string; direction?: number }) {
  const reduceMotion = !!useReducedMotion()
  return (
    <span className="relative block min-w-0">
      <AnimatePresence mode="popLayout" initial={false} custom={direction}>
        <motion.span key={text} className="inline-block wrap-anywhere" custom={direction} variants={reduceMotion ? fade : rise} initial="hidden" animate="shown" exit="gone">
          {text}
        </motion.span>
      </AnimatePresence>
    </span>
  )
}

const radius = 42
const start = -135
const span = 270

function arcFor(sweep: number) {
  const end = start + span * Math.min(1, Math.max(0, sweep))
  const at = (angle: number) =>
    `${(50 + radius * Math.sin((angle * Math.PI) / 180)).toFixed(3)} ${(50 - radius * Math.cos((angle * Math.PI) / 180)).toFixed(3)}`
  return `M ${at(start)} A ${radius} ${radius} 0 ${end - start > 180 ? 1 : 0} 1 ${at(end)}`
}

const track = arcFor(1)

export function Gauge({
  value,
  min = 0,
  max = 100,
  label,
  detail,
  tone = "accent",
  thresholds,
  className,
  classNames,
}: GaugeProps) {
  const safeMax = max > min ? max : min + 1
  const percentage = Math.min(1, Math.max(0, (value - min) / (safeMax - min)))
  const displayValue = Math.round(percentage * 100)
  const bands = [...(thresholds ?? [])].sort((a, b) => a.from - b.from)
  const bandAt = (at: number) => bands.filter((threshold) => at >= threshold.from - 1e-6).pop()
  const band = bandAt(value)
  const ref = React.useRef<HTMLElement>(null)
  const sizer = React.useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, amount: 0.5 })
  const reduceMotion = !!useReducedMotion()
  const sweep = useMotionValue(0)
  const count = useMotionValue(0)
  const digitsWidth = useMotionValue<number | "auto">("auto")
  const [filled, setFilled] = React.useState(false)
  const [live, setLive] = React.useState(band)
  const path = useTransform(sweep, arcFor)
  const arcOpacity = useTransform(sweep, (current) => Math.min(1, Math.max(0, current / 0.02)))
  const digits = useTransform(count, (current) => String(Math.round(Math.min(100, Math.max(0, current)))))
  const [moved, setMoved] = React.useState({ value: displayValue, direction: 1 })
  if (moved.value !== displayValue) setMoved({ value: displayValue, direction: displayValue < moved.value ? -1 : 1 })

  React.useEffect(() => {
    if (reduceMotion) {
      sweep.jump(percentage)
      count.jump(percentage * 100)
      const frame = requestAnimationFrame(() => setFilled(true))
      return () => cancelAnimationFrame(frame)
    }
    if (!inView) return
    const arc = animate(sweep, percentage, filled ? motionPresets.spring.morph : reveal)
    const number = animate(count, percentage * 100, {
      ...(filled ? motionPresets.spring.smooth : reveal),
      onComplete: () => setFilled(true),
    })
    return () => {
      arc.stop()
      number.stop()
    }
  }, [count, filled, inView, percentage, reduceMotion, sweep])

  useMotionValueEvent(count, "change", (current) => {
    const next = bandAt(min + (current / 100) * (safeMax - min))
    const changed = next?.from !== live?.from || next?.label !== live?.label
    if (filled) {
      if (changed) setLive(next)
    } else if (inView && Math.abs(current - percentage * 100) < 1) {
      if (changed) setLive(next)
      setFilled(true)
    }
  })
  const shown = reduceMotion || !filled ? band : live
  const activeTone = shown?.tone ?? tone

  React.useEffect(() => {
    const node = sizer.current
    if (!node || typeof ResizeObserver === "undefined") return
    let measured: string | null = null
    const observer = new ResizeObserver(([entry]) => {
      const next = entry.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth
      if (measured !== null && measured !== node.textContent && !reduceMotion) animate(digitsWidth, next, motionPresets.spring.smooth)
      else digitsWidth.jump(next)
      measured = node.textContent
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [digitsWidth, reduceMotion])

  return (
    <figure
      ref={ref}
      data-slot="gauge"
      data-tone={activeTone}
      aria-label={`${label}: ${value} of ${safeMax}${band ? `, ${band.label}` : ""}`}
      className={cn("grid min-w-0 justify-items-center gap-2.5 text-center", className, classNames?.root)}
    >
      <div
        data-slot="gauge-visual"
        role="meter"
        aria-label={label}
        aria-valuemin={min}
        aria-valuemax={safeMax}
        aria-valuenow={Math.min(safeMax, Math.max(min, value))}
        aria-valuetext={`${displayValue}%${band ? `, ${band.label}` : ""}`}
        className={cn("relative aspect-[100/90] w-full max-w-44", classNames?.visual)}
      >
        <svg viewBox="0 0 100 90" className="block size-full overflow-visible" aria-hidden="true" focusable="false">
          <path d={track} fill="none" stroke="currentColor" strokeWidth={9} strokeLinecap="round" className="text-muted-foreground/30" />
          <motion.path d={path} fill="none" stroke="currentColor" strokeWidth={9} strokeLinecap="round" className={toneClass[activeTone]} style={{ opacity: arcOpacity }} />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-0 grid aspect-square place-content-center justify-items-center gap-1" aria-hidden="true">
          <span className={cn("relative inline-flex items-baseline text-3xl leading-none font-medium text-foreground tabular-nums", classNames?.value)}>
            <motion.span className="inline-flex justify-end whitespace-nowrap" style={{ width: digitsWidth }}>
              {digits}
            </motion.span>
            <span className="ms-px font-sans text-[0.5em] text-muted-foreground">%</span>
            <span ref={sizer} className="pointer-events-none absolute top-0 left-0 invisible whitespace-nowrap">
              {displayValue}
            </span>
          </span>
          {thresholds ? (
            <span className={cn("min-h-[1.4em] min-w-24 text-xs leading-snug font-medium", toneClass[activeTone], classNames?.status)}>
              <Swap text={filled ? (shown?.label ?? "") : ""} direction={moved.direction} />
            </span>
          ) : null}
        </div>
      </div>
      <figcaption className="grid min-w-0 gap-0.5">
        <strong className={cn("text-sm font-medium", classNames?.label)}>
          <Swap text={label} />
        </strong>
        {detail ? (
          <span className={cn("text-xs text-muted-foreground tabular-nums", classNames?.detail)}>
            <Swap text={detail} direction={moved.direction} />
          </span>
        ) : null}
      </figcaption>
    </figure>
  )
}
