"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion, type TargetAndTransition, type Transition } from "motion/react"
import { CircleAlert, Copy } from "lucide-react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"
import { useCopyFeedback } from "@/registry/retana/hooks/use-copy-feedback"

export type CopyButtonClassNames = {
  root?: string
  icon?: string
  label?: string
}

export type CopyButtonProps = {
  value: string
  label?: string
  copiedLabel?: string
  failedLabel?: string
  className?: string
  classNames?: CopyButtonClassNames
  iconOnly?: boolean
  variant?: "outline" | "plain"
  disabled?: boolean
  onCopied?: () => void
}

const settle = { type: "spring", visualDuration: 0.5, bounce: 0.06 } as const
const enter = { duration: 0.36, ease: [...motionPresets.ease.enter] } as const
const instant = { duration: motionPresets.duration.instant } as const
const soft = `blur(${motionPresets.blur.soft}px)`
const rest: TargetAndTransition = { opacity: 1, y: 0, scale: 1, filter: "blur(0px)" }
const fadeIn: TargetAndTransition = { ...rest, opacity: 0 }
const fadeOut: TargetAndTransition = { opacity: 0, transition: instant }
const iconIn: TargetAndTransition = { opacity: 0, scale: 0.6, filter: soft }
const iconOut: TargetAndTransition = { opacity: 0, scale: 0.6, filter: soft, transition: { duration: 0.24, ease: [...motionPresets.ease.standard] } }
const iconEnter: Transition = { scale: settle, opacity: { ...enter, delay: 0.03 }, filter: { ...enter, delay: 0.03 } }
const glyphIn: TargetAndTransition = { opacity: 0, y: 4, filter: soft }
const glyphOut: TargetAndTransition = { opacity: 0, y: -3, filter: soft, transition: { duration: 0.2, ease: [...motionPresets.ease.standard] } }

function DrawnCheck({ reduced }: { reduced: boolean }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <motion.path
        d="M4 12l5 5L20 6"
        initial={reduced ? false : { pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{
          pathLength: { duration: 0.5, ease: [...motionPresets.ease.standard], delay: 0.05 },
          opacity: { duration: 0.01, delay: 0.05 },
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

function MorphText({ text, reduced }: { text: string; reduced: boolean }) {
  const glyphs = useGlyphs(text)
  return (
    <span className="relative inline-flex justify-self-start whitespace-pre">
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
            transition={reduced ? instant : { ...enter, delay: Math.min(glyph.order * 0.02, 0.12), layout: settle }}
          >
            {glyph.char === " " ? "\u00a0" : glyph.char}
          </motion.span>
        ))}
      </AnimatePresence>
    </span>
  )
}

export function CopyButton({
  value,
  label = "Copy",
  copiedLabel = "Copied",
  failedLabel = "Failed",
  className,
  classNames,
  iconOnly = false,
  variant = "outline",
  disabled,
  onCopied,
}: CopyButtonProps) {
  const { state, copy } = useCopyFeedback()
  const reduced = useReducedMotion() ?? false
  const text = state === "copied" ? copiedLabel : state === "error" ? failedLabel : label

  async function handleCopy() {
    if (await copy(value)) onCopied?.()
  }

  return (
    <>
      <button
        type="button"
        data-slot="copy-button"
        data-copy-state={state}
        className={cn(
          "inline-flex max-w-full min-h-8 items-center justify-center gap-2 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none disabled:opacity-50 motion-reduce:transition-none",
          iconOnly && "size-8 px-0",
          variant === "plain" && "border-transparent bg-transparent text-muted-foreground hover:bg-muted",
          className,
          classNames?.root,
        )}
        onClick={() => void handleCopy()}
        aria-label={label}
        disabled={disabled}
      >
        <span data-slot="copy-button-icon" className={cn("relative grid size-4 shrink-0", classNames?.icon)} aria-hidden="true">
          <AnimatePresence initial={false}>
            <motion.span
              key={state}
              data-state={state}
              className={cn(
                "absolute inset-0 grid place-items-center",
                state === "copied" && "text-primary",
                state === "error" && "text-destructive",
              )}
              initial={reduced ? fadeIn : iconIn}
              animate={rest}
              exit={reduced ? fadeOut : iconOut}
              transition={reduced ? instant : iconEnter}
            >
              {state === "copied" ? <DrawnCheck reduced={reduced} /> : state === "error" ? <CircleAlert size={16} strokeWidth={1.8} /> : <Copy size={16} strokeWidth={1.8} />}
            </motion.span>
          </AnimatePresence>
        </span>
        {iconOnly ? null : (
          <span data-slot="copy-button-label" className={cn("grid min-w-0 overflow-x-clip text-left whitespace-nowrap", classNames?.label)} aria-hidden="true">
            <span className="invisible col-start-1 row-start-1">{label}</span>
            <span className="invisible col-start-1 row-start-1">{copiedLabel}</span>
            <span className="invisible col-start-1 row-start-1">{failedLabel}</span>
            <span className="col-start-1 row-start-1">
              <MorphText text={text} reduced={reduced} />
            </span>
          </span>
        )}
      </button>
      <span className="sr-only" role="status" aria-live="polite">
        {state === "idle" ? "" : state === "error" ? `${label}: Could not copy` : `${label}: ${copiedLabel}`}
      </span>
    </>
  )
}
