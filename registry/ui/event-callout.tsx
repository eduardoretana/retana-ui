"use client"

/** Dated event with an inset action row. */

import * as React from "react"
import { Calendar, ChevronRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type EventCalloutProps = {
  title: string
  when: string
  icon?: React.ReactNode
  action?: string
  onAction?: () => void
  className?: string
}

export function EventCallout({ title, when, icon, action, onAction, className }: EventCalloutProps) {
  return (
    <section data-slot="event-callout" className={cn("flex flex-col gap-3 rounded-2xl bg-primary p-3 text-primary-foreground", className)}>
      <div className="flex items-start gap-3">
        <span aria-hidden className="grid size-9 shrink-0 place-items-center rounded-full bg-foreground text-background [&_svg]:size-4">
          {icon ?? <Calendar />}
        </span>
        <div className="min-w-0">
          <p className="text-sm font-medium wrap-break-word">{title}</p>
          <p className="font-mono text-xs opacity-80">{when}</p>
        </div>
      </div>
      {action ? (
        <button
          type="button"
          onClick={onAction}
          className="flex w-full items-center justify-between gap-2 rounded-full bg-card px-3 py-2 text-start text-sm text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="truncate">{action}</span>
          <ChevronRight className="size-4 shrink-0" aria-hidden />
        </button>
      ) : null}
    </section>
  )
}
