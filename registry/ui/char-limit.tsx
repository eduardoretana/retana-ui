"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/input-controls/char-limit-indicator/char-limit-indicator.tsx

import * as React from "react"

import { cn } from "@/lib/utils"

export type CharLimitClassNames = {
  root?: string
  ring?: string
  label?: string
}

export type CharLimitProps = {
  value?: string
  count?: number
  max: number
  showAt?: number
  alwaysShow?: boolean
  countFn?: (value: string) => number
  size?: number
  describedById?: string
  locale?: string
  className?: string
  classNames?: CharLimitClassNames
}

export function countGraphemes(value: string, locale = "en") {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity: "grapheme" })
    return [...segmenter.segment(value)].length
  }
  return [...value].length
}

export function countWords(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return 0
  return trimmed.split(/\s+/).length
}

function band(ratio: number, over: boolean) {
  if (over) return "over"
  if (ratio >= 0.9) return "warn"
  return "ok"
}

export function CharLimit({
  value = "",
  count,
  max,
  showAt,
  alwaysShow = false,
  countFn,
  size = 20,
  describedById,
  locale = "en",
  className,
  classNames,
}: CharLimitProps) {
  const used = count ?? (countFn ? countFn(value) : countGraphemes(value, locale))
  const safeMax = max > 0 ? max : 1
  const ratio = used / safeMax
  const over = used > max
  const revealAt = showAt ?? 0.7 * max
  const visible = alwaysShow || used >= revealAt
  const generatedId = React.useId()
  const liveId = describedById ?? generatedId
  const bandNow = band(ratio, over)
  const [announced, setAnnounced] = React.useState({ band: bandNow, text: "" })
  let announcement = announced.text
  if (announced.band !== bandNow) {
    const left = max - used
    announcement = over ? `${Math.abs(left)} characters over the limit` : `${left} characters left`
    setAnnounced({ band: bandNow, text: announcement })
  }

  if (!visible) {
    return (
      <span id={liveId} className="sr-only">
        {announcement}
      </span>
    )
  }

  const stroke = 2
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const dash = circumference * (1 - Math.min(Math.max(ratio, 0), 1))
  const tone = over ? "text-destructive" : ratio >= 0.9 ? "text-accent-foreground" : "text-primary"
  const label = over ? `${used - max}` : `${used}/${max}`

  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs", className, classNames?.root)}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn("-rotate-90", classNames?.ring)} aria-hidden="true">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="text-muted" stroke="currentColor" />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dash}
          className={tone}
          stroke="currentColor"
        />
      </svg>
      <span className={cn("font-mono tabular-nums", tone, over ? "" : ratio >= 0.9 ? "" : "text-muted-foreground", classNames?.label)}>
        {over ? `-${used - max}` : label}
      </span>
      <span id={liveId} className="sr-only" aria-live="polite">
        {announcement || `${max - used} characters left`}
      </span>
    </span>
  )
}
