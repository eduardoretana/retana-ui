"use client"

/** Highlight, soft, or inverted callout. Copy and icon come from props. */

import * as React from "react"

import { cn } from "@/lib/utils"

export type AccentCalloutProps = {
  title: string
  body?: React.ReactNode
  icon?: React.ReactNode
  surface?: "accent" | "soft" | "inverted"
  action?: React.ReactNode
  inset?: React.ReactNode
  className?: string
}

const surfaceClass = {
  accent: "bg-primary text-primary-foreground",
  soft: "bg-primary/15 text-foreground",
  inverted: "bg-foreground text-background",
} as const

export function AccentCallout({
  title,
  body,
  icon,
  surface = "accent",
  action,
  inset,
  className,
}: AccentCalloutProps) {
  const inverted = surface === "inverted"
  return (
    <section
      data-slot="accent-callout"
      data-surface={surface}
      className={cn("flex min-w-0 flex-col gap-3 rounded-2xl p-3", surfaceClass[surface], className)}
    >
      <div className="flex min-w-0 items-start gap-3">
        {icon ? (
          <span
            aria-hidden
            className={cn(
              "grid size-9 shrink-0 place-items-center rounded-full [&_svg]:size-4",
              surface === "accent" ? "bg-foreground text-background" : "bg-primary text-primary-foreground",
              inverted && "bg-background text-foreground",
            )}
          >
            {icon}
          </span>
        ) : null}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium wrap-break-word">{title}</p>
          {body ? (
            <div className={cn("mt-0.5 text-xs wrap-break-word", inverted ? "text-background/70" : "opacity-80")}>{body}</div>
          ) : null}
        </div>
        {action}
      </div>
      {inset ? (
        <div className={cn("rounded-full bg-card px-3 py-2 text-sm text-card-foreground", inverted && "bg-background text-foreground")}>
          {inset}
        </div>
      ) : null}
    </section>
  )
}
