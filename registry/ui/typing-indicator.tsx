"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * El modo con presencia sigue el adaptador de este repo. El modo con `names`
 * es presentacional y no exige proveedor.
 */

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { readPresenceInfo, useOthers, type PresenceInfo } from "@/registry/retana/lib/presence"

export function defaultTypingLabel(names: readonly string[]) {
  if (names.length === 0) return ""
  if (names.length === 1) return `${names[0]} is typing…`
  if (names.length === 2) return `${names[0]} and ${names[1]} are typing…`
  return `${names[0]} and ${names.length - 1} others are typing…`
}

export type TypingIndicatorProps = {
  field?: string
  className?: string
  label?: (names: string[]) => string
  /** When set, the row is presentational and does not read presence. */
  names?: readonly string[]
  avatar?: ReactNode
  dots?: boolean
}

function Dots() {
  const reduced = Boolean(useReducedMotion()) || (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches)
  return (
    <span aria-hidden className="inline-flex items-center gap-0.5">
      {[0, 1, 2].map((dot) => (
        <motion.span
          key={dot}
          className="size-1.5 rounded-full bg-muted-foreground"
          animate={reduced ? { opacity: 0.7 } : { opacity: [0.35, 1, 0.35] }}
          transition={reduced ? { duration: 0 } : { duration: 0.8, repeat: Infinity, delay: dot * 0.12, ease: [0, 0, 0.58, 1] }}
        />
      ))}
    </span>
  )
}

export function TypingIndicator({ field = "isTyping", className, label = defaultTypingLabel, names, avatar, dots }: TypingIndicatorProps) {
  if (names) {
    const text = label([...names])
    if (!text && !dots) return null
    return (
      <p
        data-slot="typing-indicator"
        data-dots={dots ? "true" : undefined}
        className={cn("flex min-h-11 items-center gap-2 text-sm text-muted-foreground", className)}
        aria-live="polite"
      >
        {avatar}
        {dots ? <Dots /> : null}
        <span>{text}</span>
      </p>
    )
  }
  return <PresenceTyping field={field} className={className} label={label} />
}

function PresenceTyping({ field = "isTyping", className, label = defaultTypingLabel }: TypingIndicatorProps) {
  const others = useOthers<Record<string, unknown>, PresenceInfo>()
  const names = others
    .filter((user) => {
      const presence = user.presence as Record<string, unknown>
      return presence?.[field] === true
    })
    .map((user) => readPresenceInfo(user.info).name)
  const text = label(names)

  return (
    <p className={cn("min-h-5 truncate text-sm text-muted-foreground", className)} aria-live="polite">
      {text}
    </p>
  )
}
