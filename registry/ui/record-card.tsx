"use client"

/** Record media card. Hero, compact media, or gallery tile. */

import * as React from "react"
import { ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type RecordCardStat = { label: string; value: string }

export type RecordCardProps = {
  variant?: "hero" | "media" | "tile"
  title: string
  subtitle?: string
  code?: string
  status?: React.ReactNode
  cover?: React.ReactNode
  /** 0–100. Fill uses primary at or above highlightFrom. */
  progress?: number
  progressLabel?: string
  highlightFrom?: number
  stats?: readonly RecordCardStat[]
  chips?: React.ReactNode
  footer?: React.ReactNode
  onOpen?: () => void
  openLabel?: string
  className?: string
}

export function RecordCover({ seed = "a" }: { seed?: string }) {
  const n = [...seed].reduce((sum, char) => sum + char.charCodeAt(0), 0)
  const wash = ["bg-primary/25", "bg-foreground/10", "bg-chart-2/30"][n % 3]
  return (
    <div data-slot="record-cover" className="absolute inset-0 bg-muted" aria-hidden>
      <div className={cn("absolute inset-0", wash)} />
      <div className="absolute -end-6 -top-8 size-28 rounded-full bg-foreground/10" />
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-foreground/30 to-transparent" />
    </div>
  )
}

export function RecordCard({
  variant = "tile",
  title,
  subtitle,
  code,
  status,
  cover,
  progress,
  progressLabel = "Progress",
  highlightFrom = 90,
  stats = [],
  chips,
  footer,
  onOpen,
  openLabel = "Open",
  className,
}: RecordCardProps) {
  const media = (
    <div className={cn("relative overflow-hidden bg-muted", variant === "tile" ? "aspect-[16/10] rounded-xl" : "min-h-36 flex-1 rounded-2xl")}>
      {cover ?? <RecordCover seed={code ?? title} />}
      <div className="absolute inset-x-2 top-2 flex items-start justify-between gap-2">
        {code ? (
          <span className="inline-flex h-6 max-w-[70%] items-center rounded-full bg-card/95 px-2 font-mono text-xs text-card-foreground">
            <span className="truncate">{code}</span>
          </span>
        ) : (
          <span />
        )}
        {status}
      </div>
      {chips ? <div className="absolute inset-x-2 bottom-2 flex flex-wrap gap-1">{chips}</div> : null}
    </div>
  )
  const bar =
    progress != null ? (
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-2 text-xs">
          <span className="text-muted-foreground">{progressLabel}</span>
          <span className="font-mono tabular-nums">{progress}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-muted" role="meter" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={progressLabel}>
          <div
            className={cn("h-full rounded-full", progress >= highlightFrom ? "bg-primary" : "bg-foreground")}
            style={{ width: `${Math.max(0, Math.min(100, progress))}%` }}
          />
        </div>
      </div>
    ) : null

  if (variant === "media") {
    return (
      <article data-slot="record-card" data-variant="media" className={cn("flex min-h-48 flex-col", className)}>
        {media}
      </article>
    )
  }

  if (variant === "hero") {
    return (
      <article data-slot="record-card" data-variant="hero" className={cn("relative flex min-h-64 flex-col", className)}>
        {media}
        <div className="relative z-[1] -mt-16 px-3 pb-1">
          <div className="rounded-2xl bg-card p-3 text-card-foreground shadow-sm">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h3 className="truncate text-base font-medium">{title}</h3>
                {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
              </div>
              {onOpen ? (
                <Button type="button" size="icon" variant="ghost" className="rounded-full" aria-label={openLabel} onClick={onOpen}>
                  <ArrowUpRight />
                </Button>
              ) : null}
            </div>
            {bar ? <div className="mt-3">{bar}</div> : null}
            {stats.length ? (
              <dl className="mt-3 grid grid-cols-3 overflow-hidden rounded-xl border border-border">
                {stats.slice(0, 3).map((stat) => (
                  <div key={stat.label} className="min-w-0 px-2 py-2 not-first:border-s border-border">
                    <dt className="truncate text-[10px] text-muted-foreground">{stat.label}</dt>
                    <dd className="truncate text-sm font-medium">{stat.value}</dd>
                  </div>
                ))}
              </dl>
            ) : null}
          </div>
        </div>
      </article>
    )
  }

  const inner = (
    <>
      {media}
      <div className="flex min-w-0 flex-1 flex-col gap-2 p-3">
        <h3 className="truncate text-sm font-medium">{title}</h3>
        {subtitle ? <p className="truncate text-xs text-muted-foreground">{subtitle}</p> : null}
        {stats.length ? (
          <dl className="grid grid-cols-2 overflow-hidden rounded-lg border border-border">
            {stats.slice(0, 2).map((stat) => (
              <div key={stat.label} className="min-w-0 px-2 py-1.5 not-first:border-s border-border">
                <dt className="truncate text-[10px] text-muted-foreground">{stat.label}</dt>
                <dd className="truncate text-sm">{stat.value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
        {bar}
        {footer ? <div className="mt-auto flex items-center justify-between gap-2 pt-1 text-xs">{footer}</div> : null}
      </div>
    </>
  )

  if (!onOpen) {
    return (
      <article data-slot="record-card" data-variant="tile" className={cn("flex min-w-0 flex-col overflow-hidden rounded-2xl bg-card", className)}>
        {inner}
      </article>
    )
  }

  return (
    <article
      data-slot="record-card"
      data-variant="tile"
      className={cn(
        "flex min-w-0 flex-col overflow-hidden rounded-2xl bg-card transition-shadow hover:ring-2 hover:ring-foreground focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <button type="button" onClick={onOpen} aria-label={openLabel ?? title} className="flex min-w-0 flex-1 flex-col text-start focus-visible:outline-none">
        {inner}
      </button>
    </article>
  )
}
