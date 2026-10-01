"use client"

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
}

export function TypingIndicator({ field = "isTyping", className, label = defaultTypingLabel }: TypingIndicatorProps) {
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
