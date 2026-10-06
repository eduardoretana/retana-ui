"use client"

/** Full-width status banner. Pass the next copy to crossfade the message. */

import * as React from "react"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

export type StatusBannerStat = { label: string; value: string }

export type StatusBannerProps = {
  title: string
  body?: string
  stats?: readonly StatusBannerStat[]
  /** Changes the crossfade key. Defaults to the title. */
  stateKey?: string
  className?: string
}

export function StatusBanner({ title, body, stats = [], stateKey, className }: StatusBannerProps) {
  const reduced = useReducedMotion() ?? false
  const bannerBody = (
    <>
      <div className="flex min-w-0 items-start gap-3">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-card text-foreground">
          <Check className="size-4" />
        </span>
        <div className="min-w-0">
          <h2 className="text-lg font-medium wrap-break-word">{title}</h2>
          {body ? <p className="text-sm opacity-80 wrap-break-word">{body}</p> : null}
        </div>
      </div>
      {stats.length ? (
        <dl className="flex flex-wrap gap-4">
          {stats.map((stat, index) => (
            <div key={stat.label} className={cn("min-w-24", index > 0 && "border-s border-primary-foreground/20 ps-4")}>
              <dt className="text-xs opacity-70">{stat.label}</dt>
              <dd className="font-mono text-sm">{stat.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}
    </>
  )
  return (
    <section data-slot="status-banner" className={cn("overflow-hidden rounded-2xl bg-primary px-4 py-4 text-primary-foreground", className)}>
      {reduced ? (
        <div className="flex flex-wrap items-center justify-between gap-4">{bannerBody}</div>
      ) : (
        <AnimatePresence initial={false}>
          <motion.div
            key={stateKey ?? title}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-wrap items-center justify-between gap-4"
          >
            {bannerBody}
          </motion.div>
        </AnimatePresence>
      )}
    </section>
  )
}
