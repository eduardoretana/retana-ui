"use client"

/** Side-by-side callouts. One row can be marked as added. */

import * as React from "react"
import { ArrowRight } from "lucide-react"

import { cn } from "@/lib/utils"

export type ComparePanelProps = {
  title: string
  location?: string
  beforeLabel: string
  afterLabel: string
  before: readonly string[]
  after: readonly string[]
  highlightIndex?: number
  className?: string
}

export function ComparePanel({
  title,
  location,
  beforeLabel,
  afterLabel,
  before,
  after,
  highlightIndex,
  className,
}: ComparePanelProps) {
  return (
    <section data-slot="compare-panel" className={cn("rounded-2xl bg-foreground p-4 text-background", className)}>
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{title}</h3>
        {location ? <p className="font-mono text-xs text-primary">{location}</p> : null}
      </header>
      <div className="grid items-start gap-2 md:grid-cols-[1fr_auto_1fr]">
        <Column label={beforeLabel} rows={before} />
        <ArrowRight className="mx-auto size-4 text-primary md:mt-8" aria-hidden />
        <Column label={afterLabel} rows={after} highlightIndex={highlightIndex} />
      </div>
    </section>
  )
}

function Column({ label, rows, highlightIndex }: { label: string; rows: readonly string[]; highlightIndex?: number }) {
  return (
    <div className="min-w-0 rounded-xl border border-background/20 p-2">
      <p className="mb-2 text-xs text-background/60">{label}</p>
      <ul className="flex flex-col gap-1">
        {rows.map((row, index) => (
          <li
            key={`${row}-${index}`}
            className={cn(
              "rounded-md px-2 py-1 font-mono text-xs uppercase wrap-break-word",
              index === highlightIndex && "bg-primary text-primary-foreground",
            )}
          >
            {row}
          </li>
        ))}
      </ul>
    </div>
  )
}
