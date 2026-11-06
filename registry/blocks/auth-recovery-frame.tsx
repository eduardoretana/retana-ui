"use client"

/** Clean-room chrome for the recovery cards. No theme of its own. */

import { useEffect, useId, useRef, type ReactNode } from "react"
import { motion, useReducedMotionConfig } from "motion/react"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type AuthBrand = { name: string; mark?: ReactNode }

export function AuthRecoveryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <a
      href={href}
      className="inline-flex min-h-11 items-center self-start text-sm font-medium text-foreground underline-offset-4 hover:underline focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
    >
      {children}
    </a>
  )
}

export function AuthRecoveryFrame({
  slot,
  title,
  description,
  status,
  brand,
  phase,
  className,
  children,
}: {
  slot: string
  title: string
  description?: string
  status?: string
  brand?: AuthBrand
  phase: string
  className?: string
  children: ReactNode
}) {
  const reduce = useReducedMotionConfig() ?? false
  const titleId = useId()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const focusTitle = phase === "sent" || phase === "success" || phase === "invalid-link" || phase === "expired"

  useEffect(() => {
    if (focusTitle) headingRef.current?.focus()
  }, [focusTitle, phase, title])

  return (
    <Card
      data-slot={slot}
      data-phase={phase}
      data-motion={reduce ? "reduced" : "full"}
      role="region"
      aria-labelledby={titleId}
      className={cn("@container w-full min-w-0 max-w-md gap-0 overflow-hidden py-0", className)}
    >
      <div className="grid min-w-0 gap-5 p-6 @max-[380px]:p-5">
        {brand ? (
          <p className="inline-flex min-w-0 items-center gap-2 text-sm font-medium">
            {brand.mark ? <span aria-hidden="true">{brand.mark}</span> : null}
            <span className="truncate">{brand.name}</span>
          </p>
        ) : null}
        <motion.div
          key={phase}
          className="grid min-w-0 gap-5"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }}
        >
          <div className="grid gap-1">
            <h2 id={titleId} ref={headingRef} tabIndex={-1} className="text-xl font-medium text-balance outline-none @min-[380px]:text-2xl">
              {title}
            </h2>
            {description ? <p className="text-sm text-pretty text-muted-foreground">{description}</p> : null}
          </div>
          {children}
        </motion.div>
      </div>
      <p className="sr-only" role="status">
        {status}
      </p>
    </Card>
  )
}
