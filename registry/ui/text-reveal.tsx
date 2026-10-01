"use client"

/** Adapted from Arc UI (MIT). */

import { Fragment, type CSSProperties } from "react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type TextRevealProps = {
  text: string
  as?: "h1" | "h2" | "h3" | "p"
  className?: string
  classNames?: { word?: string; line?: string }
  id?: string
  /** Seconds before the first word rises. */
  delay?: number
}

const MAX_STAGGER = motionPresets.duration.considered

const css = `
@keyframes retana-text-reveal {
  from { opacity: 0; transform: translateY(0.35em); filter: blur(var(--reveal-blur, 4px)); }
  to { opacity: 1; transform: none; filter: none; }
}
[data-slot="text-reveal-word"] {
  display: inline-block;
  animation: retana-text-reveal 0.48s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--reveal-delay, 0s);
}
@media (prefers-reduced-motion: reduce) {
  [data-slot="text-reveal-word"] { animation: none; }
}
`

export function TextReveal({ text, as = "h2", className, classNames, id, delay = 0 }: TextRevealProps) {
  const Tag = as
  const lines = text.split("\n").map((line) => line.split(" ").filter(Boolean))
  const count = lines.reduce((total, words) => total + words.length, 0)
  const step = Math.min(motionPresets.stagger.word, MAX_STAGGER / Math.max(count, 1))
  const blur = as === "p" ? motionPresets.blur.soft : motionPresets.blur.text
  let index = 0

  return (
    <Tag
      id={id}
      data-slot="text-reveal"
      className={cn("max-w-full", className)}
      style={{ "--reveal-blur": `${blur}px` } as CSSProperties}
    >
      <style>{css}</style>
      <span className="sr-only">{text.replace(/\n/g, " ")}</span>
      {lines.map((words, lineIndex) => (
        <Fragment key={lineIndex}>
          <span data-slot="text-reveal-line" className={cn("inline", classNames?.line)} aria-hidden="true">
            {words.map((word, wordIndex) => {
              const position = index++
              return (
                <Fragment key={`${word}-${position}`}>
                  <span className="inline-block overflow-hidden align-bottom">
                    <span
                      data-slot="text-reveal-word"
                      className={classNames?.word}
                      style={{ "--reveal-delay": `${delay + position * step + lineIndex * step}s` } as CSSProperties}
                    >
                      {word}
                    </span>
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
