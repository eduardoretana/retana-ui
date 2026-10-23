"use client"

/** Clean-room AE dashboard surface. Theme tokens only. */

import type { ReactNode } from "react"
import { motion, useReducedMotion } from "motion/react"

import { cn } from "@/lib/utils"
import { aeCard, liftOnHover, riseItem } from "@/registry/retana/lib/ae-dash"

export type AeCardProps = {
  title?: ReactNode
  action?: ReactNode
  children: ReactNode
  className?: string
  /** Section label for screen readers when there is no visible title. */
  label?: string
  as?: "section" | "article"
}

/** White card with a large radius, soft shadow, staggered rise and hover lift. Put it inside an `AeStagger`. */
export function AeCard({ title, action, children, className, label, as = "section" }: AeCardProps) {
  const reduce = !!useReducedMotion()
  const Tag = as === "article" ? motion.article : motion.section
  return (
    <Tag
      data-slot="ae-card"
      aria-label={typeof title === "string" ? title : label}
      variants={riseItem(reduce)}
      whileHover={liftOnHover(reduce)}
      className={cn(aeCard, "flex min-w-0 flex-col gap-4 p-5 transition-shadow hover:shadow-md", className)}
    >
      {title || action ? (
        <header className="flex min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-2">
          {title ? <h3 className="min-w-0 text-base font-semibold break-words">{title}</h3> : <span />}
          {action}
        </header>
      ) : null}
      {children}
    </Tag>
  )
}

/** Runs the staggered entrance of every AeCard inside it. */
export function AeStagger({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <motion.div data-slot="ae-stagger" initial="hidden" animate="shown" variants={{ hidden: {}, shown: { transition: { staggerChildren: 0.07 } } }} className={className}>
      {children}
    </motion.div>
  )
}

export function AeEmpty({ children }: { children: ReactNode }) {
  return <p className="rounded-2xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">{children}</p>
}

export function AeSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Cargando" className="grid gap-3">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="h-6 animate-pulse rounded-full bg-muted motion-reduce:animate-none" />
      ))}
    </div>
  )
}
