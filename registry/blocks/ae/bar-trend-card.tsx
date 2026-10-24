"use client"

/** Clean-room AE dashboard piece. Bars grow from the bottom; the last bar uses the accent. Theme tokens only. */

import { useId, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { growTransition } from "@/registry/retana/lib/ae-dash"
import { AeCard, AeEmpty, AeSkeleton } from "@/registry/retana/blocks/ae/card-shell"

export type BarPoint = { label: string; value: number }

export type BarTrendCardProps = {
  title?: string
  data: BarPoint[]
  ranges?: { value: number; label: string }[]
  defaultRange?: number
  unit?: string
  loading?: boolean
  className?: string
}

const defaultRanges = [
  { value: 3, label: "Últimos 3 meses" },
  { value: 7, label: "Últimos 7 meses" },
]

export function BarTrendCard({ title = "Expedientes cerrados", data, ranges = defaultRanges, defaultRange = 7, unit = "expedientes", loading = false, className }: BarTrendCardProps) {
  const reduce = !!useReducedMotion()
  const selectId = useId()
  const [range, setRange] = useState(defaultRange)
  const shown = data.slice(-range)
  const max = Math.max(1, ...shown.map((point) => point.value))
  return (
    <AeCard
      title={title}
      className={className}
      action={
        <>
          <label htmlFor={selectId} className="sr-only">
            Periodo
          </label>
          <select id={selectId} value={range} onChange={(event) => setRange(Number(event.target.value))} className="h-9 rounded-full border border-input bg-background px-3 text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {ranges.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </>
      }
    >
      {loading ? (
        <AeSkeleton rows={4} />
      ) : shown.length === 0 ? (
        <AeEmpty>Sin datos en este periodo.</AeEmpty>
      ) : (
        <figure className="grid gap-2">
          <figcaption className="sr-only">
            {title}: {shown.map((point) => `${point.label} ${point.value} ${unit}`).join(", ")}
          </figcaption>
          <div className="flex h-48 items-end gap-2 sm:gap-3" aria-hidden>
            {shown.map((point, index) => {
              const last = index === shown.length - 1
              return (
                <div key={`${range}-${point.label}`} className="flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2">
                  <span className={cn("text-xs font-semibold tabular-nums", last ? "text-primary" : "text-muted-foreground")}>{point.value}</span>
                  <motion.div
                    className={cn("w-full max-w-12 rounded-full", last ? "bg-primary shadow-md" : "bg-muted")}
                    style={{ height: `${(point.value / max) * 100}%`, originY: 1 }}
                    initial={{ scaleY: reduce ? 1 : 0 }}
                    animate={{ scaleY: 1 }}
                    transition={growTransition(reduce, index)}
                  />
                  <span className="text-xs text-muted-foreground">{point.label}</span>
                </div>
              )
            })}
          </div>
        </figure>
      )}
    </AeCard>
  )
}
