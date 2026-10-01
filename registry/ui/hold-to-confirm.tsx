"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type MotionValue, type TargetAndTransition } from "motion/react"
import { Trash2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type HoldToConfirmClassNames = {
  root?: string
  face?: string
  fill?: string
  label?: string
  icon?: string
}

export type HoldToConfirmProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children" | "onClick" | "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart" | "onAnimationEnd"
> & {
  label: string
  confirmedLabel?: string
  onConfirm: () => void
  duration?: number
  icon?: React.ReactNode
  tone?: "danger" | "neutral"
  confirmed?: boolean
  onHoldChange?: (holding: boolean) => void
  classNames?: HoldToConfirmClassNames
}

const enter = [...motionPresets.ease.enter] as [number, number, number, number]
const standard = [...motionPresets.ease.standard] as [number, number, number, number]
const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
const textIn: TargetAndTransition = { opacity: 0, y: "0.3em", filter: `blur(${motionPresets.blur.soft}px)` }
const textOut: TargetAndTransition = { opacity: 0, y: "-0.3em", filter: `blur(${motionPresets.blur.subtle}px)`, transition: { duration: 0.15, ease: standard } }
const iconIn: TargetAndTransition = { opacity: 0, scale: 0.6, filter: `blur(${motionPresets.blur.subtle}px)` }
const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: 0.15, ease: standard } }
const fadeIn: TargetAndTransition = { opacity: 0 }
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: 0.1 } }
const iconEnter = {
  ...motionPresets.spring.snappy,
  opacity: { duration: motionPresets.duration.fast, ease: enter },
  filter: { duration: motionPresets.duration.fast, ease: enter },
}

function DrawnCheck({ reduced }: { reduced: boolean }) {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path
        d="M4 12.5l5 5L20 6.5"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ pathLength: { duration: 0.32, ease: enter, delay: 0.08 }, opacity: { duration: 0.05, delay: 0.08 } }}
      />
    </svg>
  )
}

type FaceProps = {
  icon: React.ReactNode
  text: string
  done: boolean
  width: MotionValue<number | "auto">
  reduced: boolean
  measure?: (node: HTMLSpanElement | null) => void
  classNames?: HoldToConfirmClassNames
}

function Face({ icon, text, done, width, reduced, measure, classNames }: FaceProps) {
  return (
    <span data-slot="hold-to-confirm-face" className={cn("inline-flex min-w-0 max-w-full items-center gap-2 whitespace-nowrap", classNames?.face)}>
      <span data-slot="hold-to-confirm-icon" className={cn("grid size-[18px] shrink-0 place-items-center [&_svg]:size-[18px]", classNames?.icon)}>
        <AnimatePresence initial={false}>
          <motion.span
            key={done ? "done" : "idle"}
            className="col-start-1 row-start-1 grid place-items-center"
            initial={reduced ? fadeIn : iconIn}
            animate={rest}
            exit={reduced ? fadeOut : iconOut}
            transition={reduced ? { duration: 0.15 } : iconEnter}
          >
            {done ? <DrawnCheck reduced={reduced} /> : icon}
          </motion.span>
        </AnimatePresence>
      </span>
      <motion.span
        data-slot="hold-to-confirm-label"
        className={cn("relative inline-flex min-w-0 max-w-full overflow-hidden [clip-path:inset(-0.6em_-3px)]", classNames?.label)}
        style={{ width }}
      >
        {measure ? (
          <span ref={measure} className="pointer-events-none invisible absolute top-0 left-0 whitespace-nowrap">
            {text}
          </span>
        ) : null}
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span
            key={text}
            className="block max-w-full truncate whitespace-nowrap"
            initial={reduced ? fadeIn : textIn}
            animate={rest}
            exit={reduced ? fadeOut : textOut}
            transition={{ duration: reduced ? 0.15 : 0.22, ease: enter }}
          >
            {text}
          </motion.span>
        </AnimatePresence>
      </motion.span>
    </span>
  )
}

function useLabelWidth(reduced: boolean) {
  const width = useMotionValue<number | "auto">("auto")
  const [node, setNode] = React.useState<HTMLSpanElement | null>(null)

  React.useEffect(() => {
    if (!node || typeof ResizeObserver === "undefined") return
    let lastText: string | null = null
    let sizing: AnimationPlaybackControls | null = null
    const observer = new ResizeObserver(([entry]) => {
      const next = entry?.borderBoxSize?.[0]?.inlineSize ?? node.offsetWidth
      const text = node.textContent
      const morph = lastText !== null && lastText !== text && !reduced && typeof width.get() === "number"
      lastText = text
      sizing?.stop()
      if (morph) sizing = animate(width, next, motionPresets.spring.morph)
      else width.jump(next)
    })
    observer.observe(node)
    return () => {
      observer.disconnect()
      sizing?.stop()
    }
  }, [node, reduced, width])

  return [width, setNode] as const
}

export function HoldToConfirm({
  label,
  confirmedLabel = "Done",
  onConfirm,
  duration = 1200,
  icon = <Trash2 strokeWidth={1.75} />,
  tone = "danger",
  confirmed,
  onHoldChange,
  className,
  classNames,
  disabled,
  style,
  ...props
}: HoldToConfirmProps) {
  const reduced = useReducedMotion() ?? false
  const hintId = React.useId()
  const [ownDone, setOwnDone] = React.useState(false)
  const [completions, setCompletions] = React.useState(0)
  const done = confirmed ?? ownDone
  const [holding, setHolding] = React.useState(false)
  const progress = useMotionValue(0)
  const scale = useMotionValue(1)
  const clipPath = useTransform(progress, (value) => `inset(0 ${((1 - Math.min(1, Math.max(0, value))) * 100).toFixed(3)}% 0 0)`)
  const [width, measure] = useLabelWidth(reduced)
  const source = React.useRef<"pointer" | "key" | null>(null)
  const pointerType = React.useRef("mouse")
  const fill = React.useRef<AnimationPlaybackControls | null>(null)
  const press = React.useRef<AnimationPlaybackControls | null>(null)
  const button = React.useRef<HTMLButtonElement>(null)
  const text = done ? confirmedLabel : label
  const seconds = (duration / 1000).toLocaleString("en-US", { maximumFractionDigits: 1 })

  function pressTo(pressed: boolean) {
    press.current?.stop()
    if (reduced) {
      scale.jump(1)
      return
    }
    const depth = (button.current?.offsetWidth ?? 0) > 220 ? 0.985 : 0.97
    press.current = animate(scale, pressed ? depth : 1, motionPresets.spring.snappy)
  }

  function rewind() {
    fill.current?.stop()
    if (reduced) progress.jump(0)
    else fill.current = animate(progress, 0, { ...motionPresets.spring.smooth, velocity: 0 })
  }

  function stopHolding() {
    source.current = null
    setHolding(false)
    onHoldChange?.(false)
    pressTo(false)
  }

  function complete() {
    if (!source.current) return
    stopHolding()
    if (pointerType.current === "touch") navigator.vibrate?.(12)
    setOwnDone(true)
    setCompletions((count) => count + 1)
    onConfirm()
  }

  function begin(from: "pointer" | "key") {
    if (done || disabled || source.current) return
    source.current = from
    setHolding(true)
    onHoldChange?.(true)
    pressTo(true)
    fill.current?.stop()
    fill.current = animate(progress, 1, {
      duration: ((1 - progress.get()) * duration) / 1000,
      ease: "linear",
      onComplete: complete,
    })
  }

  function release() {
    if (!source.current) return
    stopHolding()
    rewind()
  }

  const syncFill = React.useEffectEvent(() => {
    if (done && progress.get() < 1 && !source.current) {
      fill.current?.stop()
      if (reduced) progress.jump(1)
      else fill.current = animate(progress, 1, motionPresets.spring.smooth)
    }
    if (!done && progress.get() > 0 && !source.current) rewind()
  })

  React.useEffect(() => {
    syncFill()
  }, [done, completions])

  React.useEffect(() => () => {
    fill.current?.stop()
    press.current?.stop()
  }, [])

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    if (!event.isPrimary || event.button !== 0) return
    pointerType.current = event.pointerType
    event.currentTarget.setPointerCapture(event.pointerId)
    begin("pointer")
  }

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    if (source.current !== "pointer") return
    const box = event.currentTarget.getBoundingClientRect()
    const slack = 24
    if (event.clientX < box.left - slack || event.clientX > box.right + slack || event.clientY < box.top - slack || event.clientY > box.bottom + slack) release()
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== " " && event.key !== "Enter") return
    event.preventDefault()
    if (!event.repeat) begin("key")
  }

  function onKeyUp(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== " " && event.key !== "Enter") return
    event.preventDefault()
    if (source.current === "key") release()
  }

  return (
    <>
      <motion.button
        {...props}
        ref={button}
        type="button"
        data-slot="hold-to-confirm"
        data-tone={tone}
        data-state={done ? "done" : holding ? "holding" : "idle"}
        className={cn(
          "relative inline-flex w-max max-w-full min-w-0 min-h-9 touch-manipulation items-center justify-center overflow-hidden rounded-lg border bg-background px-4 text-sm font-medium select-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50 aria-disabled:cursor-default motion-reduce:transition-none",
          tone === "danger"
            ? "border-destructive/40 text-destructive enabled:hover:bg-destructive/10"
            : "border-border text-foreground enabled:hover:bg-muted",
          className,
          classNames?.root,
        )}
        disabled={disabled}
        aria-disabled={done || undefined}
        aria-label={text}
        aria-describedby={done ? undefined : hintId}
        style={{ ...style, scale }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={release}
        onPointerCancel={release}
        onLostPointerCapture={release}
        onKeyDown={onKeyDown}
        onKeyUp={onKeyUp}
        onBlur={release}
        onContextMenu={(event) => event.preventDefault()}
      >
        <Face icon={icon} text={text} done={done} width={width} reduced={reduced} measure={measure} classNames={classNames} />
        <motion.span
          data-slot="hold-to-confirm-fill"
          className={cn(
            "pointer-events-none absolute -inset-px flex items-center justify-center rounded-lg text-background",
            tone === "danger" ? "bg-destructive" : "bg-foreground",
            classNames?.fill,
          )}
          style={{ clipPath }}
          aria-hidden="true"
        >
          <Face icon={icon} text={text} done={done} width={width} reduced={reduced} classNames={classNames} />
        </motion.span>
      </motion.button>
      <span id={hintId} className="sr-only">{`Press and hold for ${seconds} seconds to confirm. With a keyboard, hold Space or Enter.`}</span>
      <span className="sr-only" role="status">{done ? confirmedLabel : ""}</span>
    </>
  )
}
