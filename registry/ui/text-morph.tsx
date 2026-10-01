"use client"

/** Adapted from Arc UI (MIT). */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import { AnimatePresence, animate, motion, useReducedMotion, type AnimationPlaybackControls } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type TextMorphProps = {
  children: string
  as?: "span" | "div" | "p" | "strong" | "h1" | "h2" | "h3"
  className?: string
  id?: string
}

const enter = [...motionPresets.ease.enter] as [number, number, number, number]
const standard = [...motionPresets.ease.standard] as [number, number, number, number]
const blurred = `blur(${motionPresets.blur.soft}px)`
const HANDOFF = 0.05

function toGlyphs(text: string) {
  const seen = new Map<string, number>()
  return Array.from(text).map((char) => {
    const count = seen.get(char) ?? 0
    seen.set(char, count + 1)
    return { char, key: `${char}-${count}` }
  })
}

const measure = (element: HTMLElement) => parseFloat(getComputedStyle(element).width)

export function TextMorph({ children, as = "span", className, id }: TextMorphProps) {
  const Tag = as
  const reduced = useReducedMotion()
  const frame = useRef<HTMLSpanElement>(null)
  const track = useRef<HTMLSpanElement>(null)
  const width = useRef(0)
  const sizing = useRef<AnimationPlaybackControls | null>(null)
  const glyphs = useMemo(() => toGlyphs(children), [children])
  const [labels, setLabels] = useState({ current: children, previous: children })
  if (labels.current !== children) setLabels({ current: children, previous: labels.current })
  const kept = useMemo(() => new Set(toGlyphs(labels.previous).map((glyph) => glyph.key)), [labels.previous])
  let entering = 0

  useLayoutEffect(() => {
    const frameElement = frame.current
    const trackElement = track.current
    if (!frameElement || !trackElement) return
    const next = measure(trackElement)
    if (!Number.isFinite(next)) return
    if (width.current && Math.abs(next - width.current) > 0.5 && !reduced) {
      sizing.current = animate(frameElement, { width: next }, motionPresets.spring.morph)
    } else {
      sizing.current?.stop()
      frameElement.style.width = `${next}px`
    }
    width.current = next
  }, [children, reduced])

  useEffect(() => {
    const frameElement = frame.current
    const trackElement = track.current
    if (!frameElement || !trackElement || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(() => {
      const next = measure(trackElement)
      if (!Number.isFinite(next) || Math.abs(next - width.current) < 0.5) return
      sizing.current?.stop()
      frameElement.style.width = `${next}px`
      width.current = next
    })
    observer.observe(trackElement)
    return () => observer.disconnect()
  }, [])

  return (
    <Tag id={id} data-slot="text-morph" className={cn("inline-block max-w-full", className)}>
      <span className="sr-only">{children}</span>
      <span ref={frame} className="inline-block overflow-hidden align-bottom whitespace-nowrap" aria-hidden="true">
        <span ref={track} className="inline-flex">
          <AnimatePresence mode="popLayout" initial={false}>
            {glyphs.map(({ char, key }) => {
              const order = kept.has(key) ? 0 : entering++
              return (
                <motion.span
                  key={key}
                  layout="position"
                  className="inline-block"
                  initial={reduced ? false : { opacity: 0, scale: 0.8, y: "0.14em", filter: blurred }}
                  animate={{ opacity: 1, scale: 1, y: "0em", filter: "blur(0px)" }}
                  exit={
                    reduced
                      ? { opacity: 0, transition: { duration: 0 } }
                      : { opacity: 0, scale: 0.86, y: "-0.1em", filter: blurred, transition: { duration: motionPresets.duration.exit, ease: standard } }
                  }
                  transition={
                    reduced
                      ? { duration: 0 }
                      : {
                          layout: motionPresets.spring.morph,
                          default: {
                            duration: motionPresets.duration.standard + 0.04,
                            ease: enter,
                            delay: HANDOFF + Math.min(order, 8) * motionPresets.stagger.char * 2,
                          },
                        }
                  }
                >
                  {char === " " ? "\u00a0" : char}
                </motion.span>
              )
            })}
          </AnimatePresence>
        </span>
      </span>
    </Tag>
  )
}
