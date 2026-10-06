"use client"

/** Outcome callout, upcoming steps, and a pinned action. */

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type NextStep = {
  id: string
  title: string
  detail?: string
  icon?: React.ReactNode
}

export type NextStepsProps = {
  title: string
  body?: string
  steps?: readonly NextStep[]
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function NextSteps({ title, body, steps = [], actionLabel, onAction, className }: NextStepsProps) {
  return (
    <section data-slot="next-steps" className={cn("flex min-w-0 flex-col gap-3 rounded-2xl bg-card p-3", className)}>
      <div className="rounded-xl bg-primary/15 px-3 py-2">
        <p className="text-sm font-medium wrap-break-word">{title}</p>
        {body ? <p className="text-xs text-muted-foreground wrap-break-word">{body}</p> : null}
      </div>
      {steps.length ? (
        <ol className="flex flex-col gap-2">
          {steps.map((step) => (
            <li key={step.id} className="flex items-start gap-2 text-sm">
              <span aria-hidden className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-muted-foreground [&_svg]:size-3.5">
                {step.icon}
              </span>
              <span className="min-w-0">
                <span className="block font-medium wrap-break-word">{step.title}</span>
                {step.detail ? <span className="block text-xs text-muted-foreground wrap-break-word">{step.detail}</span> : null}
              </span>
            </li>
          ))}
        </ol>
      ) : null}
      {actionLabel ? (
        <Button type="button" className="w-full rounded-full" onClick={onAction}>
          {actionLabel}
        </Button>
      ) : null}
    </section>
  )
}
