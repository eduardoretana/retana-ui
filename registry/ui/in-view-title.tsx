"use client"

/** Adapted from Arc UI (MIT). */

import { Fragment, useEffect, useRef, useState, useSyncExternalStore } from "react"
import { motion, useInView, useReducedMotion, type Transition } from "motion/react"

import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type InViewTitleVariant = "word" | "line" | "blur" | "tracking" | "wipe"

export type InViewTitleProps = {
  text: string
  variant?: InViewTitleVariant
  as?: "h1" | "h2" | "h3"
  lines?: string[]
  className?: string
  id?: string
  once?: boolean
}

const subscribe = () => () => {}
const FALLBACK_MS = 2400
const lateBoot = typeof window !== "undefined" && performance.now() > FALLBACK_MS
const enter = [...motionPresets.ease.enter] as [number, number, number, number]
const standard = [...motionPresets.ease.standard] as [number, number, number, number]
const TRACK_EM = 0.06

function reveal(instant: boolean, visible: boolean, delay: number, settle = 0.8): Transition {
  if (instant) return { duration: 0 }
  if (!visible) return { duration: motionPresets.duration.exit, ease: standard }
  const track = (duration: number, ease: readonly [number, number, number, number] = enter) => ({
    duration,
    delay,
    ease: [ease[0], ease[1], ease[2], ease[3]] as [number, number, number, number],
  })
  return {
    y: track(settle),
    x: track(settle),
    filter: track(settle * 0.78),
    opacity: track(settle * 0.56, standard),
  }
}

export function InViewTitle({ text, variant = "blur", as = "h2", lines, className, id, once = true }: InViewTitleProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once, amount: 0.45 })
  const [passed, setPassed] = useState(false)
  useEffect(() => {
    if (inView || passed) return
    const revealPassedTitle = () => {
      if (ref.current && ref.current.getBoundingClientRect().top < 0) setPassed(true)
    }
    revealPassedTitle()
    window.addEventListener("scroll", revealPassedTitle, { passive: true })
    return () => window.removeEventListener("scroll", revealPassedTitle)
  }, [inView, passed])
  const prefersReduced = useReducedMotion()
  const hydrated = useSyncExternalStore(subscribe, () => true, () => false)
  const [serverRendered] = useState(!hydrated)
  const reduced = Boolean(hydrated && prefersReduced)
  const late = hydrated && serverRendered && lateBoot
  const visible = reduced || late || inView || passed
  const instant = Boolean(reduced || late)
  const Tag = as
  const words = text.split(" ").filter(Boolean)
  const step = Math.min(motionPresets.stagger.word * 1.5, 0.4 / Math.max(words.length, 1))

  if (variant === "word") {
    return (
      <div ref={ref} data-slot="in-view-title" className={cn("max-w-full", className)}>
        <Tag id={id} aria-label={text}>
          {words.map((word, index) => (
            <Fragment key={`${word}-${index}`}>
              <span className="inline-block overflow-hidden align-bottom" aria-hidden="true">
                <motion.span
                  className="inline-block"
                  initial={false}
                  animate={visible ? { y: "0em", opacity: 1 } : { y: "0.9em", opacity: 0 }}
                  transition={reveal(instant, visible, index * step)}
                >
                  {word}
                </motion.span>
              </span>
              {index < words.length - 1 ? " " : null}
            </Fragment>
          ))}
        </Tag>
      </div>
    )
  }

  if (variant === "line") {
    const titleLines = lines?.length ? lines : [text]
    return (
      <div ref={ref} data-slot="in-view-title" className={cn("max-w-full", className)}>
        <Tag id={id} aria-label={text}>
          {titleLines.map((line, index) => (
            <span className="block overflow-hidden" aria-hidden="true" key={`${line}-${index}`}>
              <motion.span
                className="block"
                initial={false}
                animate={visible ? { y: "0%", opacity: 1 } : { y: "112%", opacity: 0 }}
                transition={reveal(instant, visible, index * motionPresets.stagger.line, 0.86)}
              >
                {line}
              </motion.span>
            </span>
          ))}
        </Tag>
      </div>
    )
  }

  if (variant === "tracking") {
    return (
      <div ref={ref} data-slot="in-view-title" className={cn("max-w-full", className)}>
        <Tag id={id} aria-label={text}>
          {words.map((word, index) => {
            const letters = Array.from(word)
            const center = (letters.length - 1) / 2
            const delay = index * motionPresets.stagger.char * 2
            return (
              <Fragment key={`${word}-${index}`}>
                <motion.span
                  className="inline-flex"
                  aria-hidden="true"
                  initial={false}
                  animate={visible ? { opacity: 1, filter: "blur(0px)" } : { opacity: 0, filter: `blur(${motionPresets.blur.soft}px)` }}
                  transition={reveal(instant, visible, delay, 0.9)}
                >
                  {letters.map((letter, letterIndex) => (
                    <motion.span
                      key={letterIndex}
                      className="inline-block"
                      initial={false}
                      animate={{ x: visible ? "0em" : `${(center - letterIndex) * TRACK_EM}em` }}
                      transition={reveal(instant, visible, delay, 1)}
                    >
                      {letter}
                    </motion.span>
                  ))}
                </motion.span>
                {index < words.length - 1 ? " " : null}
              </Fragment>
            )
          })}
        </Tag>
      </div>
    )
  }

  if (variant === "wipe") {
    return (
      <div ref={ref} data-slot="in-view-title" className={cn("max-w-full", className)}>
        <motion.div
          className="inline-block max-w-full"
          initial={false}
          animate={visible ? { clipPath: "inset(0 0% 0 0)", x: "0em" } : { clipPath: "inset(0 100% 0 0)", x: "-0.12em" }}
          transition={reveal(instant, visible, 0, 0.9)}
        >
          <Tag id={id}>{text}</Tag>
        </motion.div>
      </div>
    )
  }

  return (
    <div ref={ref} data-slot="in-view-title" className={cn("max-w-full", className)}>
      <Tag id={id} aria-label={text}>
        {words.map((word, index) => (
          <Fragment key={`${word}-${index}`}>
            <motion.span
              className="inline-block"
              aria-hidden="true"
              initial={false}
              animate={visible ? { opacity: 1, y: "0em", filter: "blur(0px)" } : { opacity: 0, y: "0.2em", filter: `blur(${motionPresets.blur.text}px)` }}
              transition={reveal(instant, visible, index * step)}
            >
              {word}
            </motion.span>
            {index < words.length - 1 ? " " : null}
          </Fragment>
        ))}
      </Tag>
    </div>
  )
}
