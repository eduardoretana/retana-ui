"use client"

/** Clean-room AE dashboard piece. Several series as gradient-filled areas with a legend that toggles them. Theme tokens only. */

import { useId, useState } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { growTransition } from "@/registry/retana/lib/ae-dash"
import { AeCard, AeEmpty } from "@/registry/retana/blocks/ae/card-shell"

export type AreaSeries = { id: string; label: string; values: number[] }

export type MultiAreaChartCardProps = { title?: string; labels: string[]; series: AreaSeries[]; className?: string }

/** Host chart tokens. The first series takes the accent. */
const tones = ["text-primary", "text-[color:var(--chart-2)]", "text-[color:var(--chart-4)]", "text-[color:var(--chart-5)]"]
const W = 600
const H = 220

function linePath(values: number[], max: number) {
  const last = Math.max(1, values.length - 1)
  return values.map((value, index) => `${index ? "L" : "M"}${((index / last) * W).toFixed(1)} ${(H - 8 - (value / max) * (H - 24)).toFixed(1)}`).join(" ")
}

export function MultiAreaChartCard({ title = "Actividad por mes", labels, series, className }: MultiAreaChartCardProps) {
  const reduce = !!useReducedMotion()
  const id = useId()
  const [hidden, setHidden] = useState<string[]>([])
  const visible = series.filter((item) => !hidden.includes(item.id))
  const max = Math.max(1, ...visible.flatMap((item) => item.values))
  return (
    <AeCard
      title={title}
      className={className}
      action={
        <ul aria-label="Series" className="flex flex-wrap justify-end gap-1.5">
          {series.map((item, index) => {
            const on = !hidden.includes(item.id)
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => setHidden((prev) => (on ? [...prev, item.id] : prev.filter((key) => key !== item.id)))}
                  className={cn("inline-flex items-center gap-1.5 rounded-full border border-border/60 px-2.5 py-1 text-xs outline-none focus-visible:ring-2 focus-visible:ring-ring", on ? "text-foreground" : "text-muted-foreground line-through opacity-60")}
                >
                  <span aria-hidden className={cn("size-2 rounded-full bg-current", tones[index % tones.length])} />
                  {item.label}
                </button>
              </li>
            )
          })}
        </ul>
      }
    >
      {visible.length === 0 || labels.length === 0 ? (
        <AeEmpty>Activa al menos una serie.</AeEmpty>
      ) : (
        <figure className="grid gap-2">
          <figcaption className="sr-only">
            {visible.map((item) => `${item.label}: ${item.values.map((value, index) => `${labels[index]} ${value}`).join(", ")}`).join(". ")}
          </figcaption>
          <svg viewBox={`0 0 ${W} ${H}`} className="h-56 w-full overflow-visible" preserveAspectRatio="none" aria-hidden focusable="false">
            {[0.25, 0.5, 0.75, 1].map((step) => (
              <line key={step} x1="0" x2={W} y1={H - 8 - step * (H - 24)} y2={H - 8 - step * (H - 24)} className="stroke-border" strokeDasharray="4 6" vectorEffect="non-scaling-stroke" />
            ))}
            {series.map((item, index) => {
              if (hidden.includes(item.id)) return null
              const d = linePath(item.values, max)
              return (
                <g key={item.id} className={tones[index % tones.length]}>
                  <defs>
                    <linearGradient id={`${id}-${item.id}`} x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0" stopColor="currentColor" stopOpacity="0.28" />
                      <stop offset="1" stopColor="currentColor" stopOpacity="0" />
                    </linearGradient>
                  </defs>
                  <motion.path d={`${d} L${W} ${H} L0 ${H} Z`} fill={`url(#${id}-${item.id})`} initial={{ opacity: reduce ? 1 : 0 }} animate={{ opacity: 1 }} transition={growTransition(reduce, index + 2)} />
                  <motion.path d={d} fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: reduce ? 1 : 0 }} animate={{ pathLength: 1 }} transition={growTransition(reduce, index)} />
                </g>
              )
            })}
          </svg>
          <div className="flex justify-between text-xs text-muted-foreground" aria-hidden>
            {labels.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>
        </figure>
      )}
    </AeCard>
  )
}
