"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, type TargetAndTransition, type Transition, type Variants } from "motion/react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type ActionButtonClassNames = {
  root?: string
  content?: string
  label?: string
  icon?: string
}

export type ActionButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "onDrag" | "onDragEnd" | "onDragStart" | "onAnimationStart"
> & {
  label: string
  successLabel?: string
  pendingLabel?: string
  onAction: () => void | Promise<void>
  resetAfterMs?: number
  onActionError?: (error: unknown) => void
  classNames?: ActionButtonClassNames
}

const pressVariants: Variants = {
  pressed: (button: React.RefObject<HTMLButtonElement | null>) => ({
    scale: (button.current?.offsetWidth ?? 0) > 220 ? 0.985 : 0.97,
    transition: { duration: motionPresets.duration.instant, ease: [...motionPresets.ease.standard] },
  }),
}

const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
const glyphIn: TargetAndTransition = { opacity: 0, y: 5, filter: `blur(${motionPresets.blur.soft}px)` }
const glyphOut: TargetAndTransition = {
  opacity: 0,
  y: -4,
  filter: `blur(${motionPresets.blur.subtle}px)`,
  transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
}
const iconIn: TargetAndTransition = { opacity: 0, scale: 0.6, filter: `blur(${motionPresets.blur.subtle}px)` }
const iconOut: TargetAndTransition = { ...iconIn, transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] } }
const arrowIn: TargetAndTransition = { opacity: 0, x: -6, filter: `blur(${motionPresets.blur.subtle}px)` }
const arrowOut: TargetAndTransition = {
  opacity: 0,
  x: 8,
  filter: `blur(${motionPresets.blur.subtle}px)`,
  transition: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.standard] },
}
const iconRest: TargetAndTransition = { ...rest, x: 0 }
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 }
const fadeOut: TargetAndTransition = { opacity: 0, transition: { duration: motionPresets.duration.instant } }
const iconEnter: Transition = {
  ...motionPresets.spring.snappy,
  opacity: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] },
  filter: { duration: motionPresets.duration.fast, ease: [...motionPresets.ease.enter] },
}
const instant = { duration: motionPresets.duration.instant }

function useMorphWidth(content: React.RefObject<HTMLElement | null>, key: string, reduced: boolean) {
  const width = useMotionValue<number | "auto">("auto")
  const lastKey = React.useRef(key)
  const armedUntil = React.useRef(0)

  React.useLayoutEffect(() => {
    if (lastKey.current === key) return
    lastKey.current = key
    armedUntil.current = performance.now() + 700
  }, [key])

  React.useEffect(() => {
    const node = content.current
    const slot = node?.parentElement
    if (!node || !slot || typeof ResizeObserver === "undefined") return
    let measured = false
    const observer = new ResizeObserver(([entry]) => {
      const next = entry?.contentRect.width ?? 0
      if (!next || !measured || reduced || performance.now() > armedUntil.current) {
        measured = next > 0
        width.jump(next || "auto")
        delete slot.dataset.morphing
        return
      }
      slot.dataset.morphing = ""
      animate(width, next, { ...motionPresets.spring.morph, onComplete: () => { delete slot.dataset.morphing } })
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [content, reduced, width])

  return width
}

function DrawnCheck({ reduced }: { reduced: boolean }) {
  return (
    <svg width={17} height={17} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path
        d="M4 12l5 5L20 6"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter], delay: 0.05 },
          opacity: { duration: 0.05, delay: 0.05 },
        }}
      />
    </svg>
  )
}

type Glyph = { id: string; char: string; order: number }
const toGlyphs = (chars: string[], seq: number): Glyph[] => chars.map((char, order) => ({ id: `${seq}:${order}`, char, order }))

function useGlyphs(text: string) {
  const [state, setState] = React.useState(() => ({ text, seq: 0, glyphs: toGlyphs([...text], 0) }))
  if (state.text === text) return state.glyphs
  const prev = [...state.text]
  const next = [...text]
  let start = 0
  let end = 0
  while (start < prev.length && start < next.length && prev[start] === next[start]) start++
  while (end < prev.length - start && end < next.length - start && prev[prev.length - 1 - end] === next[next.length - 1 - end]) end++
  if (start < 2) start = 0
  if (end < 2) end = 0
  const seq = state.seq + 1
  const glyphs = [
    ...state.glyphs.slice(0, start),
    ...toGlyphs(next.slice(start, next.length - end), seq),
    ...state.glyphs.slice(state.glyphs.length - end),
  ]
  setState({ text, seq, glyphs })
  return glyphs
}

function MorphText({ text, reduced, className }: { text: string; reduced: boolean; className?: string }) {
  const glyphs = useGlyphs(text)
  const rowRef = React.useRef<HTMLSpanElement>(null)
  const width = useMorphWidth(rowRef, text, reduced)
  return (
    <motion.span
      data-slot="action-button-label"
      className={cn("inline-flex min-w-0 max-w-full overflow-hidden data-morphing:[clip-path:inset(-0.6em_0_-0.6em_-0.3em)]", className)}
      style={{ width }}
      aria-hidden="true"
    >
      <span ref={rowRef} className="relative inline-flex flex-none whitespace-pre">
        <AnimatePresence mode="popLayout" initial={false}>
          {glyphs.map((glyph) => (
            <motion.span
              key={glyph.id}
              className="inline-block"
              layout={reduced ? false : "position"}
              layoutDependency={text}
              initial={reduced ? fadeIn : glyphIn}
              animate={rest}
              exit={reduced ? fadeOut : glyphOut}
              transition={reduced ? instant : { duration: motionPresets.duration.standard, ease: [...motionPresets.ease.enter], delay: Math.min(glyph.order * motionPresets.stagger.char, 0.1), layout: motionPresets.spring.morph }}
            >
              {glyph.char}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
    </motion.span>
  )
}

export function ActionButton({
  label,
  successLabel = "Saved",
  pendingLabel = "Saving",
  onAction,
  resetAfterMs = 2400,
  onActionError,
  className,
  classNames,
  disabled,
  ...props
}: ActionButtonProps) {
  const [state, setState] = React.useState<"idle" | "pending" | "success">("idle")
  const resetTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)
  const buttonRef = React.useRef<HTMLButtonElement>(null)
  const reduceMotion = useReducedMotion() ?? false
  const text = state === "pending" ? pendingLabel : state === "success" ? successLabel : label

  React.useEffect(() => () => { if (resetTimer.current) clearTimeout(resetTimer.current) }, [])

  async function run() {
    if (state === "pending") return
    if (resetTimer.current) clearTimeout(resetTimer.current)
    setState("pending")
    try {
      await onAction()
      setState("success")
      if (resetAfterMs > 0) resetTimer.current = setTimeout(() => setState("idle"), resetAfterMs)
    } catch (error) {
      setState("idle")
      onActionError?.(error)
    }
  }

  const pending = state === "pending"
  const arrow = state === "idle"

  return (
    <motion.button
      {...props}
      ref={buttonRef}
      tabIndex={props.tabIndex ?? 0}
      type={props.type ?? "button"}
      data-slot="action-button"
      data-state={state}
      className={cn(
        "relative inline-flex w-max max-w-full min-w-0 min-h-9 items-center justify-center overflow-hidden rounded-lg border border-primary bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/80 hover:shadow-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 data-[state=pending]:cursor-progress motion-reduce:transition-none",
        className,
        classNames?.root,
      )}
      disabled={disabled}
      aria-disabled={pending ? true : props["aria-disabled"]}
      aria-busy={pending}
      onClick={() => void run()}
      custom={buttonRef}
      variants={pressVariants}
      whileTap={reduceMotion || disabled || pending ? undefined : "pressed"}
      transition={motionPresets.spring.snappy}
    >
      <span data-slot="action-button-content" className={cn("inline-flex min-w-0 max-w-full items-center justify-center gap-2 whitespace-nowrap", classNames?.content)} aria-hidden="true">
        <MorphText text={text} reduced={reduceMotion} className={classNames?.label} />
        <span data-slot="action-button-icon" className={cn("grid size-[17px] shrink-0 place-items-center", classNames?.icon)}>
          <AnimatePresence initial={false}>
            <motion.span
              key={state}
              className="col-start-1 row-start-1 grid size-[17px] place-items-center"
              initial={reduceMotion ? fadeIn : arrow ? arrowIn : iconIn}
              animate={iconRest}
              exit={reduceMotion ? fadeOut : arrow ? arrowOut : iconOut}
              transition={reduceMotion ? instant : iconEnter}
            >
              {pending ? (
                <span className="inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent motion-reduce:animate-none" />
              ) : state === "success" ? (
                <DrawnCheck reduced={reduceMotion} />
              ) : (
                <ArrowRight className="size-[17px]" width={17} height={17} aria-hidden="true" />
              )}
            </motion.span>
          </AnimatePresence>
        </span>
      </span>
      <span className="sr-only">{label}</span>
      <span className="sr-only" role="status">{state === "pending" ? pendingLabel : state === "success" ? successLabel : ""}</span>
    </motion.button>
  )
}
