"use client"

/** Clean-room AE dashboard piece. Theme tokens only. */

import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { growTransition } from "@/registry/retana/lib/ae-dash"
import { AeCard } from "@/registry/retana/blocks/ae/card-shell"

export type RadialValue = { label: string; value: number; caption?: string; tone?: "accent" | "muted" }

export type RadialPairCardProps = { title?: string; items: [RadialValue, RadialValue] | RadialValue[]; className?: string }

const R = 42
const C = 2 * Math.PI * R

export function RadialRing({ label, value, caption, tone = "accent", index = 0 }: RadialValue & { index?: number }) {
  const reduce = !!useReducedMotion()
  const clamped = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0))
  return (
    <figure className="flex min-w-0 flex-col items-center gap-2" role="meter" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={clamped} aria-valuetext={`${clamped}%`}>
      <div className="relative size-28">
        <svg viewBox="0 0 100 100" className={cn("size-full -rotate-90", tone === "accent" ? "text-primary" : "text-foreground")} aria-hidden focusable="false">
          <circle cx="50" cy="50" r={R} fill="none" className="stroke-muted" strokeWidth="9" />
          <motion.circle cx="50" cy="50" r={R} fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeDasharray={C} initial={{ strokeDashoffset: reduce ? C * (1 - clamped / 100) : C }} animate={{ strokeDashoffset: C * (1 - clamped / 100) }} transition={growTransition(reduce, index)} />
        </svg>
        <span className="absolute inset-0 grid place-items-center text-2xl font-bold tabular-nums">{clamped}%</span>
      </div>
      <figcaption className="text-center">
        <span className="block text-sm font-medium">{label}</span>
        {caption ? <span className="block text-xs text-muted-foreground">{caption}</span> : null}
      </figcaption>
    </figure>
  )
}

export function RadialPairCard({ title = "Desempeño del equipo", items, className }: RadialPairCardProps) {
  return (
    <AeCard title={title} className={className}>
      <div className="grid grid-cols-2 gap-4">
        {items.slice(0, 2).map((item, index) => (
          <RadialRing key={item.label} {...item} tone={item.tone ?? (index === 0 ? "accent" : "muted")} index={index} />
        ))}
      </div>
    </AeCard>
  )
}
