"use client"

/** Adapted from Arc UI (MIT). Scroll trigger is clean-room. */

import { Fragment, useLayoutEffect, useRef, useState, type CSSProperties, type RefObject } from "react"
import { useMotionValueEvent, type MotionValue } from "motion/react"

import { cn } from "@/lib/utils"
import { clampUnit, useScrollProgress } from "@/registry/retana/hooks/use-scroll-progress"
import { motionPresets } from "@/registry/retana/lib/motion"
import { useAnimationTimeline } from "@/registry/retana/lib/scroll-timeline"
import { useMotionPreference } from "@/registry/retana/ui/motion-preference"

export type TextRevealTrigger = "mount" | "scroll"

export type TextRevealProps = {
  text: string
  as?: "h1" | "h2" | "h3" | "p"
  className?: string
  classNames?: { word?: string; line?: string }
  id?: string
  /** Seconds before the first word rises. Used when trigger is mount. */
  delay?: number
  /** mount plays once. scroll ties each word to the viewport. Default mount. */
  trigger?: TextRevealTrigger
}

const MAX_STAGGER = motionPresets.duration.considered
const enter = `cubic-bezier(${motionPresets.ease.enter.join(", ")})`

/**
 * Opacity for one word along a scroll-linked reveal.
 * A non-finite progress means the fallback could not run, so the word stays fully visible.
 */
export function scrollWordOpacity(progress: number) {
  if (!Number.isFinite(progress)) return 1
  return 0.2 + clampUnit(progress) * 0.8
}

export function textRevealDriver(trigger: TextRevealTrigger, reduced: boolean, viewTimeline: boolean) {
  if (trigger !== "scroll") return "mount" as const
  if (reduced) return "reduced" as const
  if (viewTimeline) return "css" as const
  return "hook" as const
}

export const TEXT_REVEAL_CSS = `
@keyframes retana-text-reveal {
  from { opacity: 0; transform: translateY(0.35em); filter: blur(var(--reveal-blur, 4px)); }
  to { opacity: 1; transform: none; filter: none; }
}
@keyframes retana-text-reveal-scroll {
  from { opacity: 0.2; }
  to { opacity: 1; }
}
[data-slot="text-reveal"][data-trigger="mount"] [data-slot="text-reveal-word"] {
  display: inline-block;
  animation: retana-text-reveal ${motionPresets.duration.considered}s ${enter} both;
  animation-delay: var(--reveal-delay, 0s);
}
@supports (animation-timeline: view()) {
  [data-slot="text-reveal"][data-trigger="scroll"][data-driver="css"] [data-slot="text-reveal-word"] {
    display: inline-block;
    animation-name: retana-text-reveal-scroll;
    animation-duration: auto;
    animation-timing-function: linear;
    animation-fill-mode: both;
    animation-timeline: view();
    animation-range: entry 20% cover 50%;
  }
}
[data-slot="text-reveal"][data-reduced="true"] [data-slot="text-reveal-word"] {
  animation: none;
  opacity: 1;
  transform: none;
  filter: none;
}
@media (prefers-reduced-motion: reduce) {
  [data-slot="text-reveal-word"] { animation: none; opacity: 1; transform: none; filter: none; }
}
`

export function TextReveal({
  text,
  as = "h2",
  className,
  classNames,
  id,
  delay = 0,
  trigger = "mount",
}: TextRevealProps) {
  const Tag = as
  const reduced = useMotionPreference()
  const viewTimeline = useAnimationTimeline("view()")
  const driver = textRevealDriver(trigger, reduced, viewTimeline)
  const lines = text.split("\n").map((line) => line.split(" ").filter(Boolean))
  const count = lines.reduce((total, words) => total + words.length, 0)
  const step = Math.min(motionPresets.stagger.word, MAX_STAGGER / Math.max(count, 1))
  const blur = as === "p" ? motionPresets.blur.soft : motionPresets.blur.text
  let index = 0

  return (
    <Tag
      id={id}
      data-slot="text-reveal"
      data-trigger={trigger}
      data-driver={driver}
      data-reduced={reduced ? "true" : "false"}
      className={cn("max-w-full", className)}
      style={{ "--reveal-blur": `${blur}px` } as CSSProperties}
    >
      <style>{TEXT_REVEAL_CSS}</style>
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      {lines.map((words, lineIndex) => (
        <Fragment key={lineIndex}>
          <span data-slot="text-reveal-line" className={cn("inline", classNames?.line)} aria-hidden="true">
            {words.map((word, wordIndex) => {
              const position = index++
              const wordStyle = { "--reveal-delay": `${delay + position * step + lineIndex * step}s` } as CSSProperties
              return (
                <Fragment key={`${word}-${position}`}>
                  <span className="inline-block overflow-hidden align-bottom">
                    {driver === "hook" ? (
                      <ScrollRevealWord word={word} className={classNames?.word} />
                    ) : (
                      <span
                        data-slot="text-reveal-word"
                        className={classNames?.word}
                        style={driver === "reduced" ? { ...wordStyle, opacity: 1 } : wordStyle}
                      >
                        {word}
                      </span>
                    )}
                  </span>
                  {wordIndex < words.length - 1 ? " " : null}
                </Fragment>
              )
            })}
          </span>
          {lineIndex < lines.length - 1 ? " " : null}
        </Fragment>
      ))}
    </Tag>
  )
}

function ScrollRevealWord({ word, className }: { word: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const { progress } = useScrollProgress({
    target: ref,
    offset: ["start end", "center center"],
  })
  const opacity = useWordOpacity(progress, ref)

  return (
    <span ref={ref} data-slot="text-reveal-word" data-driver="hook" className={className} style={{ opacity }}>
      {word}
    </span>
  )
}

function useWordOpacity(progress: MotionValue<number>, ref: RefObject<HTMLElement | null>) {
  const [opacity, setOpacity] = useState(1)
  useMotionValueEvent(progress, "change", (next) => {
    if (!ref.current) return
    setOpacity(scrollWordOpacity(next))
  })
  useLayoutEffect(() => {
    if (!ref.current) return
    setOpacity(scrollWordOpacity(progress.get()))
  }, [progress, ref])
  return opacity
}
