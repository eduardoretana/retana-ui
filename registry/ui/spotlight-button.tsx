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
 * Adapted from Evil Buttons highlight-button (Apache-2.0).
 * https://github.com/radiumcoders/Evil-Buttons
 * Upstream commit ec0fa86f8d06. The upstream repository has no NOTICE file.
 *
 * Modifications (Retana UI, 2026):
 * - Renamed HighlightButton to SpotlightButton.
 * - Replaced hardcoded colors with host button variants and semantic tokens.
 * - The spotlight defaults to a mix of the host foreground and background.
 * - The click ripple is skipped when the reader prefers reduced motion.
 */

import * as React from "react"
import { motion, useReducedMotion } from "motion/react"

import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type SpotlightButtonProps = Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "onDrag" | "onDragStart" | "onDragEnd" | "onAnimationStart"
> & {
  variant?: "default" | "secondary" | "outline"
  /** CSS color for the cursor spotlight and ripple. Defaults to host tokens. */
  highlightColor?: string
  /** Radius of the cursor spotlight in pixels. */
  highlightSize?: number
  /** CSS color the border lights up with near the cursor. */
  borderColor?: string
}

type Ripple = { id: number; x: number; y: number; size: number }

const BORDER_MASK = {
  padding: 1,
  mask: "linear-gradient(var(--foreground) 0 0) content-box exclude, linear-gradient(var(--foreground) 0 0)",
  WebkitMask: "linear-gradient(var(--foreground) 0 0) content-box xor, linear-gradient(var(--foreground) 0 0)",
} satisfies React.CSSProperties

export function SpotlightButton({
  variant = "default",
  highlightColor = "color-mix(in oklch, var(--foreground) 24%, var(--background))",
  highlightSize = 90,
  borderColor = "color-mix(in oklch, var(--foreground) 55%, var(--background))",
  className,
  style,
  children,
  onPointerMove,
  onPointerDown,
  onClick,
  type = "button",
  ...props
}: SpotlightButtonProps) {
  const reduced = useReducedMotion() ?? false
  const buttonRef = React.useRef<HTMLButtonElement | null>(null)
  const rippleIdRef = React.useRef(0)
  const [ripples, setRipples] = React.useState<Ripple[]>([])

  const track = (clientX: number, clientY: number) => {
    const button = buttonRef.current
    if (!button) return null
    const rect = button.getBoundingClientRect()
    const x = clientX - rect.left
    const y = clientY - rect.top
    button.style.setProperty("--hl-x", `${x}px`)
    button.style.setProperty("--hl-y", `${y}px`)
    return { x, y, rect }
  }

  const addRipple = (x: number, y: number, rect: DOMRect) => {
    if (reduced) return
    const size = 2 * Math.hypot(Math.max(x, rect.width - x), Math.max(y, rect.height - y))
    const id = ++rippleIdRef.current
    setRipples((current) => [...current, { id, x, y, size }])
  }

  return (
    <motion.button
      ref={buttonRef}
      type={type}
      data-slot="spotlight-button"
      onPointerMove={(event) => {
        onPointerMove?.(event)
        track(event.clientX, event.clientY)
      }}
      onPointerDown={(event) => {
        onPointerDown?.(event)
        const hit = track(event.clientX, event.clientY)
        if (hit) addRipple(hit.x, hit.y, hit.rect)
      }}
      onClick={(event) => {
        onClick?.(event)
        if (event.detail === 0 && buttonRef.current) {
          const rect = buttonRef.current.getBoundingClientRect()
          addRipple(rect.width / 2, rect.height / 2, rect)
        }
      }}
      style={
        {
          "--hl-color": highlightColor,
          "--hl-border": borderColor,
          "--hl-size": `${highlightSize}px`,
          ...style,
        } as React.CSSProperties
      }
      className={cn(
        buttonVariants({ variant, size: "default" }),
        "group/highlight relative overflow-hidden motion-reduce:active:translate-y-0",
        className,
      )}
      {...props}
    >
      <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[inherit]">
        <span
          className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover/highlight:opacity-100 motion-reduce:transition-none"
          style={{
            background:
              "radial-gradient(var(--hl-size) circle at var(--hl-x, 50%) var(--hl-y, 50%), var(--hl-color), transparent 70%)",
          }}
        />
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute rounded-full"
            style={{
              left: ripple.x - ripple.size / 2,
              top: ripple.y - ripple.size / 2,
              width: ripple.size,
              height: ripple.size,
              background: "var(--hl-color)",
            }}
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onAnimationComplete={() => setRipples((current) => current.filter(({ id }) => id !== ripple.id))}
          />
        ))}
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-300 group-hover/highlight:opacity-100 motion-reduce:transition-none"
        style={{
          ...BORDER_MASK,
          background:
            "radial-gradient(calc(var(--hl-size) * 0.9) circle at var(--hl-x, 50%) var(--hl-y, 50%), var(--hl-border), transparent 75%)",
        }}
      />
      <span className="relative inline-flex items-center gap-1.5">{children}</span>
    </motion.button>
  )
}
