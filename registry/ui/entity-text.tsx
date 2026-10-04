"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/results/redacted-text-display/redacted-text-display.tsx

import * as React from "react"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

export type EntitySpan = {
  start: number
  end: number
  type: string
  score?: number
}

export type EntityTextMode = "highlight" | "redact" | "mask"

export type EntitySegment =
  | { kind: "text"; value: string }
  | { kind: "entity"; value: string; entity: EntitySpan }

export function segmentText(text: string, entities: EntitySpan[]): EntitySegment[] {
  const ranked = [...entities]
    .filter((entity) => entity.start >= 0 && entity.end <= text.length && entity.start < entity.end)
    .sort((a, b) => b.end - b.start - (a.end - a.start) || a.start - b.start)
  const chosen: EntitySpan[] = []
  for (const entity of ranked) {
    if (chosen.some((other) => entity.start < other.end && other.start < entity.end)) continue
    chosen.push(entity)
  }
  chosen.sort((a, b) => a.start - b.start)
  const segments: EntitySegment[] = []
  let cursor = 0
  for (const entity of chosen) {
    if (entity.start > cursor) segments.push({ kind: "text", value: text.slice(cursor, entity.start) })
    segments.push({ kind: "entity", value: text.slice(entity.start, entity.end), entity })
    cursor = entity.end
  }
  if (cursor < text.length) segments.push({ kind: "text", value: text.slice(cursor) })
  return segments
}

function chartFor(type: string, types: string[]) {
  const index = Math.max(0, types.indexOf(type))
  return `var(--chart-${(index % 5) + 1})`
}

export type EntityTextProps = {
  text: string
  entities: EntitySpan[]
  mode?: EntityTextMode
  maskedTypes?: string[]
  onMaskedTypesChange?: (types: string[]) => void
  types?: Record<string, { label?: string; color?: string }>
  className?: string
}

export function EntityText({ text, entities, mode = "highlight", maskedTypes = [], onMaskedTypesChange, types, className }: EntityTextProps) {
  const segments = segmentText(text, entities)
  const typeNames = [...new Set(entities.map((entity) => entity.type))]
  const counts = new Map<string, number>()
  for (const entity of entities) counts.set(entity.type, (counts.get(entity.type) ?? 0) + 1)

  return (
    <TooltipProvider>
      <div className={cn("flex flex-col gap-3 text-sm leading-6", className)}>
        <p>
          {segments.map((segment, index) => {
            if (segment.kind === "text") return <span key={index}>{segment.value}</span>
            const label = types?.[segment.entity.type]?.label ?? segment.entity.type
            const color = types?.[segment.entity.type]?.color ?? chartFor(segment.entity.type, typeNames)
            const hidden = mode === "redact" || (mode === "mask" && maskedTypes.includes(segment.entity.type))
            const spoken = hidden ? label : `${label}: ${segment.value}`
            return (
              <Tooltip key={index}>
                <TooltipTrigger asChild>
                  <mark
                    aria-label={spoken}
                    className="rounded-sm px-0.5 underline decoration-2"
                    style={{
                      backgroundColor: hidden ? "var(--muted)" : `color-mix(in oklab, ${color} 18%, var(--background))`,
                      textDecorationColor: color,
                    }}
                  >
                    {hidden ? `[${label}]` : segment.value}
                  </mark>
                </TooltipTrigger>
                <TooltipContent>
                  {label}
                  {segment.entity.score != null ? ` · ${Math.round(segment.entity.score * 100)}%` : ""}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </p>
        <ul className="flex flex-wrap gap-1.5">
          {typeNames.map((type) => {
            const label = types?.[type]?.label ?? type
            const active = !maskedTypes.includes(type)
            return (
              <li key={type}>
                <button
                  type="button"
                  aria-pressed={active}
                  className="rounded-full border border-border px-2 py-0.5 text-xs focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  onClick={() => {
                    if (!onMaskedTypesChange) return
                    onMaskedTypesChange(active ? [...maskedTypes, type] : maskedTypes.filter((item) => item !== type))
                  }}
                >
                  {label} {counts.get(type)}
                </button>
              </li>
            )
          })}
        </ul>
      </div>
    </TooltipProvider>
  )
}
