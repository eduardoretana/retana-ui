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

export function TypingIndicator({ field = "isTyping", className, label = defaultTypingLabel, names, avatar, dots }: TypingIndicatorProps) {
  if (names) {
    void avatar
    void dots
    void label
    return null
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
