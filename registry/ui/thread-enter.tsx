"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * Entrada de 8 px y 200 ms, solo opacity y transform.
 */

import type { ReactNode } from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"

export function motionReduced() {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

const RISE =
  "@keyframes thread-rise{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}@media (prefers-reduced-motion:reduce){.thread-rise{animation:none}}"

export function ThreadEnter({
  play = false,
  delay = 0,
  className,
  children,
}: {
  play?: boolean
  delay?: number
  className?: string
  children: ReactNode
}) {
  const reduced = Boolean(useReducedMotion()) || motionReduced()
  const on = play && !reduced
  return (
    <div
      data-motion={on ? "rise" : "off"}
      className={cn(on && "thread-rise", className)}
      style={on ? { animation: `thread-rise 200ms cubic-bezier(0,0,0.58,1) ${delay}s both` } : undefined}
    >
      {on ? <style>{RISE}</style> : null}
      {children}
    </div>
  )
}
