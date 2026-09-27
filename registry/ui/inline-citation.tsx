"use client"

import * as React from "react"

import { cn } from "@/lib/utils"

export type CitationSource = {
  title: string
  domain: string
  excerpt: string
  href?: string
}

export type InlineCitationProps = {
  index: number
  source: CitationSource
  className?: string
  cardClassName?: string
}

function safeHref(href: string | undefined) {
  if (!href) return null
  return /^(https?:|mailto:)/i.test(href.trim()) ? href.trim() : null
}

export function InlineCitation({ index, source, className, cardClassName }: InlineCitationProps) {
  const [open, setOpen] = React.useState(false)
  const closeTimer = React.useRef<number>(0)
  const tooltipId = React.useId()
  const href = safeHref(source.href)

  function show() {
    window.clearTimeout(closeTimer.current)
    setOpen(true)
  }

  function hide() {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setOpen(false), 120)
  }

  React.useEffect(() => () => window.clearTimeout(closeTimer.current), [])

  return (
    <span
      data-slot="inline-citation"
      className={cn("relative inline-flex", className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      {href ? (
        <a
          href={href}
          aria-describedby={open ? tooltipId : undefined}
          className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 align-super text-[10px] font-medium text-foreground tabular-nums no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false)
          }}
        >
          {index}
        </a>
      ) : (
        <button
          type="button"
          aria-describedby={open ? tooltipId : undefined}
          className="mx-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-muted px-1 align-super text-[10px] font-medium text-foreground tabular-nums focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onKeyDown={(event) => {
            if (event.key === "Escape") setOpen(false)
          }}
        >
          {index}
        </button>
      )}
      {open ? (
        <span
          role="tooltip"
          id={tooltipId}
          className={cn(
            "absolute bottom-[calc(100%+0.4rem)] left-1/2 z-30 w-64 -translate-x-1/2 rounded-lg border border-border bg-popover p-3 text-left text-popover-foreground shadow-lg",
            cardClassName,
          )}
        >
          <span className="block text-sm font-medium leading-snug">{source.title}</span>
          <span className="mt-0.5 block text-[11px] text-muted-foreground">{source.domain}</span>
          <span className="mt-2 block text-xs leading-relaxed text-muted-foreground">{source.excerpt}</span>
        </span>
      ) : null}
    </span>
  )
}
