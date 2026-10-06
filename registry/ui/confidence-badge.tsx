"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/results/confidence-score-badge/confidence-score-badge.tsx

import { cn } from "@/lib/utils"

export type ConfidenceTier = "high" | "medium" | "low"
export type ConfidenceVariant = "badge" | "dial" | "bar" | "dots" | "segments"

export type ConfidenceBadgeProps = {
  score: number
  thresholds?: { high: number; medium: number }
  variant?: ConfidenceVariant
  /** Dot count for variant="dots". Ignored by the other variants. */
  dots?: number
  className?: string
  classNames?: { root?: string; label?: string }
}

export function confidenceTier(score: number, thresholds = { high: 0.8, medium: 0.5 }): ConfidenceTier {
  if (score >= thresholds.high) return "high"
  if (score >= thresholds.medium) return "medium"
  return "low"
}

export function ConfidenceBadge({
  score,
  thresholds,
  variant = "badge",
  dots = 12,
  className,
  classNames,
}: ConfidenceBadgeProps) {
  const clamped = Math.min(1, Math.max(0, score))
  const percent = Math.round(clamped * 100)
  const tier = confidenceTier(clamped, thresholds)
  const label = `Confidence ${percent}%, ${tier}`
  const tone =
    tier === "high"
      ? "bg-primary text-primary-foreground"
      : tier === "medium"
        ? "bg-secondary text-secondary-foreground"
        : "bg-muted text-muted-foreground"

  if (variant === "dial") {
    const size = 36
    const stroke = 3
    const radius = (size - stroke) / 2
    const circumference = 2 * Math.PI * radius
    return (
      <span
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        className={cn("relative inline-flex size-9 items-center justify-center", className, classNames?.root)}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden="true">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth={stroke} className="text-muted" stroke="currentColor" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            strokeWidth={stroke}
            strokeDasharray={circumference}
            strokeDashoffset={circumference * (1 - clamped)}
            className="text-primary"
            stroke="currentColor"
          />
        </svg>
        <span className={cn("absolute text-[10px] font-medium tabular-nums", classNames?.label)}>{percent}</span>
      </span>
    )
  }

  if (variant === "dots") {
    const count = Math.max(4, Math.min(24, Math.round(dots)))
    const filled = Math.round(clamped * count)
    return (
      <span
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        data-variant="dots"
        className={cn("inline-flex items-center gap-1", className, classNames?.root)}
      >
        {Array.from({ length: count }, (_, index) => (
          <span key={index} aria-hidden className={cn("size-1.5 rounded-full", index < filled ? "bg-primary" : "bg-current opacity-25")} />
        ))}
      </span>
    )
  }

  if (variant === "segments") {
    const count = 5
    const filled = Math.max(0, Math.min(count, Math.round(clamped * count)))
    const lit = clamped >= 0.9 ? "bg-primary" : clamped >= 0.75 ? "bg-chart-4" : "bg-destructive"
    return (
      <span
        role="meter"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={percent}
        data-variant="segments"
        className={cn("inline-flex items-center gap-1.5", className, classNames?.root)}
      >
        <span aria-hidden className="inline-flex gap-0.5">
          {Array.from({ length: count }, (_, index) => (
            <span key={index} className={cn("h-2 w-2 rounded-[2px]", index < filled ? lit : "bg-muted")} />
          ))}
        </span>
        <span className={cn("font-mono text-xs tabular-nums", classNames?.label)}>{percent}%</span>
      </span>
    )
  }

  if (variant === "bar") {
    return (
      <span className={cn("inline-flex min-w-24 items-center gap-2", className, classNames?.root)} aria-label={label}>
        <span role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={percent} className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <span className={cn("block h-full rounded-full", tier === "low" ? "bg-muted-foreground" : "bg-primary")} style={{ width: `${percent}%` }} />
        </span>
        <span className={cn("text-xs tabular-nums", classNames?.label)}>{tier}</span>
      </span>
    )
  }

  return (
    <span aria-label={label} className={cn("inline-flex h-5 items-center gap-1 rounded-full px-2 text-xs font-medium", tone, className, classNames?.root)}>
      <span aria-hidden="true">{tier === "high" ? "●" : tier === "medium" ? "◐" : "○"}</span>
      <span className={classNames?.label}>{percent}%</span>
    </span>
  )
}
