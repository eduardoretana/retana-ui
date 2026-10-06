"use client"

/** Gauge, optional record row, and tone-colored mini stats. */

import * as React from "react"
import { useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { RadialGauge } from "@/registry/retana/ui/radial-gauge"
import type { StatusTone } from "@/registry/retana/lib/status-tone"

export type ScoreStat = { id: string; label: string; value: number | string; tone?: StatusTone }

export type ScoreCardProps = {
  title: string
  chip?: React.ReactNode
  value: number
  max?: number
  caption?: string
  surface?: "accent" | "neutral"
  record?: { title: string; meta: string }
  stats?: readonly ScoreStat[]
  className?: string
}

const statTone: Record<StatusTone, string> = {
  neutral: "text-foreground",
  accent: "text-primary",
  warning: "text-chart-4",
  critical: "text-destructive",
  info: "text-chart-2",
  positive: "text-primary",
}

function useCount(value: number) {
  const reduced = useReducedMotion() ?? false
  const [shown, setShown] = React.useState(value)
  const from = React.useRef(value)
  React.useEffect(() => {
    if (reduced) {
      from.current = value
      return
    }
    const startValue = from.current
    const start = performance.now()
    let frame = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / 400)
      const next = Math.round(startValue + (value - startValue) * t)
      setShown(next)
      if (t < 1) frame = requestAnimationFrame(tick)
      else from.current = value
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [reduced, value])
  return reduced ? value : shown
}

export function ScoreCard({
  title,
  chip,
  value,
  max = 100,
  caption,
  surface = "neutral",
  record,
  stats = [],
  className,
}: ScoreCardProps) {
  const shown = useCount(value)
  return (
    <section data-slot="score-card" className={cn("flex min-w-0 flex-col gap-3 rounded-2xl bg-card p-3", className)}>
      <header className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {chip}
      </header>
      <div className={cn("rounded-xl px-3 py-2", surface === "accent" ? "bg-primary/15" : "bg-muted")}>
        <RadialGauge
          variant="ticks"
          value={shown}
          max={max}
          label={caption ?? title}
          ticks={36}
          tone="neutral"
          suffix="%"
          formatter={(next) => String(Math.round(next))}
          classNames={{ value: "text-4xl", label: "text-xs" }}
        />
      </div>
      {record ? (
        <div className="flex items-center justify-between gap-2 rounded-xl bg-card px-1 text-sm">
          <span className="truncate">{record.title}</span>
          <span className="shrink-0 font-mono text-xs text-muted-foreground">{record.meta}</span>
        </div>
      ) : null}
      {stats.length ? (
        <div className="grid grid-cols-3 gap-2">
          {stats.map((stat) => (
            <div key={stat.id} className="min-w-0 rounded-xl bg-muted px-2 py-2">
              <p className={cn("font-mono text-lg tabular-nums", statTone[stat.tone ?? "neutral"])}>{stat.value}</p>
              <p className="truncate text-[10px] text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      ) : null}
    </section>
  )
}
