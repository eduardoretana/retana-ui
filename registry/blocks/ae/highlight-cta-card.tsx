"use client"

/** Clean-room AE dashboard piece. Theme tokens only: the accent is the host primary. */

import { motion, useReducedMotion } from "motion/react"
import { Plus } from "lucide-react"

import { cn } from "@/lib/utils"
import { aeCard, liftOnHover, riseItem } from "@/registry/retana/lib/ae-dash"

export type HighlightCtaCardProps = {
  eyebrow: string
  value: string
  caption?: string
  actionLabel?: string
  onAction?: () => void
  disabled?: boolean
  className?: string
}

export function HighlightCtaCard({ eyebrow, value, caption, actionLabel = "Crear nueva", onAction, disabled, className }: HighlightCtaCardProps) {
  const reduce = !!useReducedMotion()
  return (
    <motion.section
      aria-label={eyebrow}
      variants={riseItem(reduce)}
      whileHover={liftOnHover(reduce)}
      className={cn(aeCard, "relative flex min-h-64 min-w-0 flex-col justify-between gap-6 overflow-hidden border-transparent bg-gradient-to-b from-primary to-primary/75 p-6 text-primary-foreground shadow-lg", className)}
    >
      <span aria-hidden className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-primary-foreground/10" />
      <div className="relative min-w-0">
        <p className="text-sm font-medium opacity-90">{eyebrow}</p>
        <p className="mt-3 text-5xl font-bold tracking-tight tabular-nums">{value}</p>
        {caption ? <p className="mt-2 text-sm opacity-85">{caption}</p> : null}
      </div>
      <button
        type="button"
        onClick={onAction}
        disabled={disabled ?? !onAction}
        className="relative inline-flex w-fit items-center gap-2 rounded-full bg-primary-foreground px-5 py-2.5 text-sm font-semibold text-primary shadow-sm transition-transform outline-none hover:scale-[1.03] focus-visible:ring-2 focus-visible:ring-primary-foreground focus-visible:ring-offset-2 focus-visible:ring-offset-primary active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 motion-reduce:transition-none motion-reduce:hover:scale-100"
      >
        <Plus aria-hidden className="size-4" />
        {actionLabel}
      </button>
    </motion.section>
  )
}
