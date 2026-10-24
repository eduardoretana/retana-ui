"use client"

/** Clean-room AE dashboard piece. Theme tokens only. */

import { useId } from "react"
import { motion, useReducedMotion } from "motion/react"
import { ArrowDownRight, ArrowUpRight } from "lucide-react"

import { cn } from "@/lib/utils"
import { growTransition } from "@/registry/retana/lib/ae-dash"
import { AeCard, AeSkeleton } from "@/registry/retana/blocks/ae/card-shell"

export type StatSparklineCardProps = {
  label: string
  value: string
  change: string
  direction: "up" | "down"
  series: number[]
  hint?: string
  /** True when a lower value is good, such as overdue quotes. Flips the tone. */
  invert?: boolean
  loading?: boolean
  className?: string
}

export function sparkPath(series: number[], width = 120, height = 40) {
  if (series.length === 0) return ""
  if (series.length === 1) return `M0 ${height / 2} L${width} ${height / 2}`
  const min = Math.min(...series)
  const span = Math.max(...series) - min || 1
  return series
    .map((value, index) => {
      const x = (index / (series.length - 1)) * width
      const y = height - 4 - ((value - min) / span) * (height - 8)
      return `${index ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`
    })
    .join(" ")
}

export function StatSparklineCard({ label, value, change, direction, series, hint, invert = false, loading = false, className }: StatSparklineCardProps) {
  const reduce = !!useReducedMotion()
  const id = useId()
  const good = invert ? direction === "down" : direction === "up"
  const Arrow = direction === "up" ? ArrowUpRight : ArrowDownRight
  const path = sparkPath(series)
  return (
    <AeCard label={label} className={className}>
      {loading ? (
        <AeSkeleton rows={2} />
      ) : (
        <div className="flex min-w-0 items-end justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-3xl font-bold tracking-tight tabular-nums">{value}</p>
            <p className="mt-2 flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
              <span
                data-good={good}
                className={cn("inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-semibold tabular-nums", good ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive")}
              >
                <Arrow aria-hidden className="size-3" />
                <span className="sr-only">{direction === "up" ? "Sube" : "Baja"}</span>
                {change}
              </span>
              {hint}
            </p>
          </div>
          <svg viewBox="0 0 120 40" className={cn("h-10 w-24 shrink-0 overflow-visible", good ? "text-primary" : "text-destructive")} aria-hidden focusable="false">
            <defs>
              <linearGradient id={`${id}-f`} x1="0" x2="0" y1="0" y2="1">
                <stop offset="0" stopColor="currentColor" stopOpacity="0.25" />
                <stop offset="1" stopColor="currentColor" stopOpacity="0" />
              </linearGradient>
            </defs>
            {path ? <path d={`${path} L120 40 L0 40 Z`} fill={`url(#${id}-f)`} /> : null}
            <motion.path d={path} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={growTransition(reduce)} />
          </svg>
        </div>
      )}
    </AeCard>
  )
}
