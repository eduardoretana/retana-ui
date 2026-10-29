"use client"

/** Completion tiles. The first featured tile uses the accent surface. */

import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { CollectionPhaseNotice, type CollectionPhase } from "@/registry/retana/lib/collection-phase"

export type CheckTile = {
  id: string
  value: string
  label: string
  detail?: string
  featured?: boolean
}

export type CheckTilesProps = {
  items: readonly CheckTile[]
  label?: string
  className?: string
  phase?: CollectionPhase
  disabled?: boolean
  phaseLabel?: string
}

export function CheckTiles({ items, label = "Checks", className, phase = "ready", disabled = false, phaseLabel }: CheckTilesProps) {
  if (phase !== "ready") {
    return (
      <div data-slot="check-tiles" data-phase={phase} aria-disabled={disabled || undefined} className={cn("rounded-xl border border-border bg-card p-3", className)}>
        <CollectionPhaseNotice phase={phase} label={phaseLabel} />
      </div>
    )
  }
  return (
    <ul data-slot="check-tiles" aria-label={label} inert={disabled || undefined} className={cn("grid gap-2 sm:grid-cols-3", disabled && "opacity-60", className)}>
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            "flex min-w-0 flex-col gap-1 rounded-xl p-3",
            item.featured ? "bg-primary text-primary-foreground" : "bg-muted text-foreground",
          )}
        >
          <span className={cn("grid size-6 place-items-center rounded-full", item.featured ? "bg-card text-foreground" : "bg-card text-foreground")}>
            <Check className="size-3.5" aria-hidden />
          </span>
          <p className="text-lg font-medium tabular-nums wrap-break-word">{item.value}</p>
          <p className="text-sm wrap-break-word">{item.label}</p>
          {item.detail ? <p className={cn("text-xs wrap-break-word", item.featured ? "opacity-80" : "text-muted-foreground")}>{item.detail}</p> : null}
        </li>
      ))}
    </ul>
  )
}
