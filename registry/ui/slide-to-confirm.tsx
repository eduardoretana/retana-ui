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
 */

import * as React from "react"
import { animate, motion, useMotionValue, useReducedMotion, useTransform, type AnimationPlaybackControls, type Transition } from "motion/react"

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

function resist(t: number, resistance: number) {
  return Math.pow(t, 1 + resistance * 1.5)
}

function unresist(t: number, resistance: number) {
  return Math.pow(t, 1 / (1 + resistance * 1.5))
}

function followSpring(smoothness: number): Transition {
  const amount = clamp01(smoothness)
  return { type: "spring", stiffness: 1400 - amount * 1220, damping: 70 - amount * 46, mass: 0.4 + amount * 0.4 }
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
  const reduceMotion = useReducedMotion()
  const trackRef = React.useRef<HTMLDivElement | null>(null)
  const resetTimeoutRef = React.useRef<number | null>(null)
  const controlsRef = React.useRef<AnimationPlaybackControls | null>(null)
  const originRef = React.useRef(0)
  const armedRef = React.useRef(false)
  const draggingRef = React.useRef(false)
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

  React.useEffect(
    () =>
      progress.on("change", (value) => {
        setPercent((current) => {
          const next = Math.round(value * 100)
          return current === next ? current : next
        })
      }),
    [progress],
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

  const fire = () => {
    setArmedState(false)
    setState("success")
    moveTo(range, SNAP_END)
    onConfirm?.()
    if (resetAfter > 0) {
      resetTimeoutRef.current = window.setTimeout(() => {
        resetTimeoutRef.current = null
        setState("idle")
        moveTo(0, SNAP_BACK)
      }, resetAfter)
    }
  }

  const release = () => {
    if (armedRef.current) fire()
    else {
      setState("idle")
      moveTo(0, SNAP_BACK)
    }
  }

  const handlePointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    onPointerDown?.(event)
    if (locked || range <= 0 || event.defaultPrevented) return
    if (event.pointerType === "mouse" && event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    const current = clamp01(x.get() / range)
    originRef.current = event.clientX - unresist(current, resistance) * range
    draggingRef.current = true
    setState("sliding")
  }

  const handlePointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!draggingRef.current || range <= 0) return
    const raw = event.clientX - originRef.current
    const next = raw < 0 ? -PULL_BACK * (1 - 1 / (1 + -raw / 60)) : resist(clamp01(raw / range), resistance) * range
    moveTo(next, smoothness > 0 ? followSpring(smoothness) : null)
    setArmedState(next / range >= safeThreshold)
  }

  const handlePointerEnd = () => {
    if (!draggingRef.current) return
    draggingRef.current = false
    release()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    onKeyDown?.(event)
    if (locked || range <= 0 || event.defaultPrevented) return
    const current = clamp01(x.get() / range)
    let next: number | null = null
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = current + KEY_STEP
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = current - KEY_STEP
    else if (event.key === "Home") next = 0
    else if (event.key === "End") next = 1
    if (next === null) return
    event.preventDefault()
    next = clamp01(next)
    if (next >= safeThreshold) {
      fire()
      return
    }
    setState(next > 0 ? "sliding" : "idle")
    moveTo(next * range, followSpring(smoothness))
  }

  const handleBlur = (event: React.FocusEvent<HTMLButtonElement>) => {
    onBlur?.(event)
    if (!isSuccess && x.get() !== 0) {
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
          "absolute top-1 left-1 z-10 inline-flex size-10 touch-none items-center justify-center rounded-full border border-border bg-background text-foreground shadow-sm outline-none",
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
