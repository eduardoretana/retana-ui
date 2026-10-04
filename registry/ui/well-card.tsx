"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"

import { cn } from "@/lib/utils"

export type WellCardClassNames = {
  root?: string
  header?: string
  title?: string
  subtitle?: string
  count?: string
  actions?: string
  body?: string
  footer?: string
}

export type WellCardProps = {
  title: string
  subtitle?: React.ReactNode
  count?: number | string
  actions?: React.ReactNode
  footer?: React.ReactNode
  /** Inset body sits on a card surface inside the muted well. */
  inset?: boolean
  density?: "default" | "compact"
  as?: "section" | "article" | "div"
  headerLevel?: 2 | 3 | 4
  children?: React.ReactNode
  className?: string
  classNames?: WellCardClassNames
}

export function WellCard({
  title,
  subtitle,
  count,
  actions,
  footer,
  inset = true,
  density = "default",
  as: Tag = "section",
  headerLevel = 2,
  children,
  className,
  classNames,
}: WellCardProps) {
  const titleId = React.useId()
  const Heading = `h${headerLevel}` as "h2" | "h3" | "h4"
  const pad = density === "compact" ? "p-1.5" : "p-2"
  const bodyPad = density === "compact" ? "p-3" : "p-4"
  return (
    <Tag
      data-slot="well-card"
      data-density={density}
      aria-labelledby={titleId}
      className={cn("@container min-w-0 rounded-2xl bg-muted text-foreground", pad, className, classNames?.root)}
    >
      <div className={cn("flex flex-wrap items-start justify-between gap-2 px-3 pt-2 pb-3", classNames?.header)}>
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <Heading id={titleId} className={cn("m-0 text-[15px] font-medium break-words", classNames?.title)}>
              {title}
            </Heading>
            {count != null && count !== "" ? (
              <span className={cn("rounded-full bg-background px-2 py-0.5 text-xs tabular-nums text-muted-foreground", classNames?.count)}>
                {count}
              </span>
            ) : null}
          </div>
          {subtitle ? <p className={cn("mt-0.5 text-xs text-muted-foreground", classNames?.subtitle)}>{subtitle}</p> : null}
        </div>
        {actions ? <div className={cn("flex flex-wrap items-center gap-2", classNames?.actions)}>{actions}</div> : null}
      </div>
      <div className={cn(inset && "rounded-xl bg-card text-card-foreground", inset && bodyPad, classNames?.body)}>
        {children}
        {footer ? <div className={cn("mt-3 text-sm", classNames?.footer)}>{footer}</div> : null}
      </div>
    </Tag>
  )
}
