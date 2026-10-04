"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/audio/waveform-activity-bars/waveform-activity-bars.tsx

import { cn } from "@/lib/utils"

export type AudioBarsProps = {
  count?: number
  levels?: number[]
  active?: boolean
  label?: string
  className?: string
}

export function AudioBars({ count = 5, levels, active = false, label, className }: AudioBarsProps) {
  const bars = levels ?? Array.from({ length: count }, () => (active ? 0.65 : 0.35))
  return (
    <span
      className={cn("inline-flex h-6 items-end gap-0.5", className)}
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {bars.map((level, index) => (
        <span
          key={index}
          className={cn("w-1 rounded-full bg-primary", active && !levels && "motion-safe:animate-pulse")}
          style={{
            height: `${Math.max(15, Math.min(100, level * 100))}%`,
            animationDelay: active && !levels ? `${index * 80}ms` : undefined,
          }}
        />
      ))}
    </span>
  )
}
