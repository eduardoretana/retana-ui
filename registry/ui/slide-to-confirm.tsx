"use client"

/**
 * Copyright 2026 radiumcoders
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Adapted from Evil Buttons slide-to-detonate (Apache-2.0).
 * https://github.com/radiumcoders/Evil-Buttons
 * https://evilbuttons.com/r/slide-to-detonate.json
 * Upstream commit ec0fa86f8d06. The upstream repository has no NOTICE file.
 *
 * Modifications (Retana UI, 2026):
 * - Renamed SlideToDetonate to SlideToConfirm. Default label is "Slide to confirm".
 * - Removed the dark and light color variants. Track, trail, and
 *   handle use host tokens.
 * - Removed the automatic navigator.vibrate tick. Haptics stay opt-in.
 * - Reduced motion snaps the handle with no spring and no label shimmer.
 *
 * Gesture track: Emil Kowalski, emilkowalski/skills
 * @715c1807e08c497cfd1dc4feb450a2a3300ef2a9 skills/gestures (MIT).
 * While the pointer is down the handle is the finger. smoothness does not
 * feed a spring during the move. It only softens the release spring.
 * resistance pushes back past the end of the track, not along it.
 */

import * as React from "react"
import { animate, motion, useMotionValue, useReducedMotion, useReducedMotionConfig, useTransform, type AnimationPlaybackControls, type Transition } from "motion/react"

import { cn } from "@/lib/utils"

type SlideState = "idle" | "sliding" | "success"

export type SlideToConfirmProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onClick" | "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart" | "style"
> & {
  children?: React.ReactNode
  label?: React.ReactNode
  onConfirm?: () => void
  /** Fraction of the track (0–1) the handle must cross. Default 0.9. */
  threshold?: number
  /** Milliseconds to stay confirmed before resetting. 0 stays confirmed. */
  resetAfter?: number
  /** How hard the end of the track pushes back, 0–1. Default 0.35. */
  resistance?: number
  /** How softly the handle follows the pointer, 0–1. Default 0.4. */
  smoothness?: number
  className?: string
}

const HANDLE = 40
const TRACK_PADDING = 4
const KEY_STEP = 0.1
const PULL_BACK = 10
const SNAP_BACK: Transition = { type: "spring", stiffness: 520, damping: 34, mass: 0.7 }
const SNAP_END: Transition = { type: "spring", stiffness: 700, damping: 40 }

const clamp01 = (value: number) => Math.min(1, Math.max(0, value))

function overshoot(distance: number, resistance: number) {
  const limit = 28 * (1 - clamp01(resistance)) + 4
  return (1 - 1 / ((distance * 0.55) / limit + 1)) * limit
}

/** Release spring for this piece. smoothness 0 is stiffer. velocity is px/s. */
function releaseSpring(smoothness: number, velocity: number): Transition {
  const amount = clamp01(smoothness)
  return { type: "spring", stiffness: 520 + (1 - amount) * 180, damping: 34, mass: 0.7, velocity }
}

function velocityOf(samples: { t: number; x: number }[], now: number) {
  const recent = samples.filter((sample) => now - sample.t <= 100)
  const first = recent[0]
  const last = recent[recent.length - 1]
  if (!first || !last || last === first || now - last.t > 60) return 0
  return ((last.x - first.x) / (last.t - first.t)) * 1000
}

function ChevronsIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
      <path d="m6 17 5-5-5-5" />
      <path d="m13 17 5-5-5-5" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.25" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function SlideToConfirm({
  children,
  label = "Slide to confirm",
  onConfirm,
  threshold = 0.9,
  resetAfter = 1600,
  resistance = 0.35,
  smoothness = 0.4,
  className,
  disabled,
  onPointerDown,
  onKeyDown,
  onBlur,
  ...props
}: SlideToConfirmProps) {
  const mediaReduced = useReducedMotion() ?? false
  const configReduced = useReducedMotionConfig() ?? false
  const reduceMotion = mediaReduced || configReduced
  const trackRef = React.useRef<HTMLDivElement | null>(null)
  const resetTimeoutRef = React.useRef<number | null>(null)
  const controlsRef = React.useRef<AnimationPlaybackControls | null>(null)
  const originRef = React.useRef(0)
  const intendedRef = React.useRef(0)
  const armedRef = React.useRef(false)
  const draggingRef = React.useRef(false)
  const samplesRef = React.useRef<{ t: number; x: number }[]>([])
  const [state, setState] = React.useState<SlideState>("idle")
  const [armed, setArmed] = React.useState(false)
  const [range, setRange] = React.useState(0)
  const [percent, setPercent] = React.useState(0)
  const x = useMotionValue(0)
  const progress = useTransform(() => (range > 0 ? clamp01(x.get() / range) : 0))
  const labelOpacity = useTransform(progress, [0, 0.6], [1, 0])
  const trailWidth = useTransform(() => Math.max(0, x.get()) + HANDLE)
  const trailOpacity = useTransform(progress, [0, 0.15, 1], [0, 0.55, 1])
  const safeThreshold = clamp01(threshold)
  const isSuccess = state === "success"
  const locked = disabled || isSuccess
  const labelText = children ?? label

  const measure = React.useCallback(() => {
    const node = trackRef.current
    if (!node) return
    setRange(Math.max(0, node.clientWidth - HANDLE - TRACK_PADDING * 2))
  }, [])

  React.useEffect(() => {
    measure()
    const node = trackRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(measure)
    observer.observe(node)
    return () => observer.disconnect()
  }, [measure])

  React.useEffect(
    () => () => {
      controlsRef.current?.stop()
      if (resetTimeoutRef.current !== null) window.clearTimeout(resetTimeoutRef.current)
    },
    [],
  )

  const moveTo = (to: number, transition: Transition | null) => {
    controlsRef.current?.stop()
    if (!transition || reduceMotion) {
      x.set(to)
      return
    }
    controlsRef.current = animate(x, to, transition)
  }

  const setArmedState = (next: boolean) => {
    if (armedRef.current === next) return
    armedRef.current = next
    setArmed(next)
  }

  const fire = (velocity = 0) => {
    intendedRef.current = 1
    setArmedState(false)
    setState("success")
    setPercent(100)
    moveTo(range, reduceMotion ? null : { ...SNAP_END, velocity })
    onConfirm?.()
    if (resetAfter > 0) {
      resetTimeoutRef.current = window.setTimeout(() => {
        resetTimeoutRef.current = null
        intendedRef.current = 0
        setState("idle")
        moveTo(0, SNAP_BACK)
      }, resetAfter)
    }
  }

  const release = (velocity: number) => {
    if (armedRef.current) fire(velocity)
    else {
      intendedRef.current = 0
      setState("idle")
      setPercent(0)
      moveTo(0, reduceMotion ? null : releaseSpring(smoothness, velocity))
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event)
    if (locked || range <= 0 || event.defaultPrevented) return
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    originRef.current = event.clientX - x.get()
    samplesRef.current = [{ t: event.timeStamp, x: x.get() }]
    draggingRef.current = true
    setState("sliding")
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current || range <= 0) return
    const raw = event.clientX - originRef.current
    const next = raw < 0 ? -PULL_BACK * (1 - 1 / (1 + -raw / 60)) : raw > range ? range + overshoot(raw - range, resistance) : raw
    x.set(next)
    samplesRef.current.push({ t: event.timeStamp, x: next })
    const first = samplesRef.current[0]
    while (samplesRef.current.length > 2 && first && event.timeStamp - first.t > 100) samplesRef.current.shift()
    intendedRef.current = clamp01(next / range)
    const shown = Math.round(intendedRef.current * 100)
    event.currentTarget.setAttribute("aria-valuenow", String(shown))
    event.currentTarget.setAttribute("aria-valuetext", `${shown}%`)
    setArmedState(intendedRef.current >= safeThreshold)
  }

  const handlePointerEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    release(reduceMotion ? 0 : velocityOf(samplesRef.current, event.timeStamp))
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    if (locked || range <= 0 || event.defaultPrevented) return
    const current = intendedRef.current
    let next: number | null = null
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = current + KEY_STEP
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = current - KEY_STEP
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = 1
    if (next === null) return
    event.preventDefault()
    next = clamp01(next)
    intendedRef.current = next
    if (next >= safeThreshold - 1e-6) {
      fire()
      return
    }
    setState(next > 0 ? "sliding" : "idle")
    setPercent(Math.round(next * 100))
    moveTo(next * range, reduceMotion ? null : releaseSpring(smoothness, 0))
  }

  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    onBlur?.(event)
    if (!isSuccess && x.get() !== 0) {
      intendedRef.current = 0
      setArmedState(false)
      setState("idle")
      moveTo(0, SNAP_BACK)
    }
  }

  return (
    <div
      ref={trackRef}
      data-state={state}
      data-armed={armed || undefined}
      data-slot="slide-to-confirm"
      className={cn(
        "group/slide relative inline-flex h-12 min-w-64 items-center overflow-hidden rounded-full border border-border bg-muted select-none",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <motion.span
        aria-hidden
        className="pointer-events-none absolute top-1 bottom-1 left-1 rounded-full bg-primary/25"
        style={{ width: trailWidth, opacity: trailOpacity }}
      />
      <span className="pointer-events-none absolute inset-0 flex items-center justify-center pl-11 text-sm font-medium">
        {isSuccess ? null : (
          <motion.span
            style={{
              opacity: labelOpacity,
              backgroundImage: "linear-gradient(90deg, var(--muted-foreground), var(--foreground), var(--muted-foreground))",
              backgroundSize: "250% 100%",
            }}
            animate={reduceMotion || disabled ? { backgroundPosition: "50% 0" } : { backgroundPosition: ["100% 0", "0% 0"] }}
            transition={{ duration: 2.6, ease: "linear", repeat: Infinity }}
            className="bg-clip-text text-transparent"
          >
            {labelText}
          </motion.span>
        )}
      </span>
      <motion.button
        type="button"
        role="slider"
        aria-label={typeof labelText === "string" ? labelText : "Slide to confirm"}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={isSuccess ? 100 : percent}
        aria-valuetext={isSuccess ? "Confirmed" : `${percent}%`}
        disabled={disabled}
        data-state={state}
        data-armed={armed || undefined}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onLostPointerCapture={handlePointerEnd}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        style={{ x }}
        className={cn(
          "absolute top-1 left-1 z-10 inline-flex size-10 touch-pan-y items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm outline-none",
          "focus-visible:ring-2 focus-visible:ring-ring",
          armed && "bg-primary text-primary-foreground",
          isSuccess && "bg-primary text-primary-foreground",
          locked ? "cursor-default" : "cursor-grab data-[state=sliding]:cursor-grabbing",
          disabled && "cursor-not-allowed",
        )}
        {...props}
      >
        {isSuccess ? <CheckIcon /> : <ChevronsIcon />}
      </motion.button>
    </div>
  )
}
