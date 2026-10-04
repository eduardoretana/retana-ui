"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/conversation/suggestions/suggestions.tsx

import * as React from "react"

import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

export type PromptSuggestion = string | { label: string; value?: string; icon?: React.ReactNode }

export type PromptSuggestionsClassNames = {
  root?: string
  item?: string
}

export type PromptSuggestionsProps = {
  items: PromptSuggestion[]
  onSelect?: (value: string) => void
  layout?: "scroll" | "wrap"
  loading?: boolean
  label?: string
  className?: string
  classNames?: PromptSuggestionsClassNames
}

function normalize(item: PromptSuggestion) {
  if (typeof item === "string") return { label: item, value: item, icon: null }
  return { label: item.label, value: item.value ?? item.label, icon: item.icon ?? null }
}

export function PromptSuggestions({
  items,
  onSelect,
  layout = "wrap",
  loading = false,
  label = "Suggestions",
  className,
  classNames,
}: PromptSuggestionsProps) {
  const normalized = items.map(normalize)
  const [active, setActive] = React.useState(0)

  if (loading) {
    return (
      <div className={cn("flex gap-2", className)} aria-hidden="true">
        <Skeleton className="h-7 w-24 rounded-full" />
        <Skeleton className="h-7 w-28 rounded-full" />
        <Skeleton className="h-7 w-20 rounded-full" />
      </div>
    )
  }

  if (normalized.length === 0) return null

  return (
    <div
      role="list"
      aria-label={label}
      className={cn(
        layout === "scroll"
          ? "flex snap-x gap-2 overflow-x-auto [mask-image:linear-gradient(to_right,transparent,black_12px,black_calc(100%-12px),transparent)]"
          : "flex flex-wrap gap-2",
        className,
        classNames?.root,
      )}
      onKeyDown={(event) => {
        if (layout !== "scroll") return
        if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
        event.preventDefault()
        const delta = event.key === "ArrowRight" ? 1 : -1
        const next = (active + delta + normalized.length) % normalized.length
        setActive(next)
        document.getElementById(`suggestion-${next}`)?.focus()
      }}
    >
      {normalized.map((item, index) => (
        <div role="listitem" key={`${item.value}-${index}`} className="snap-start">
          <Button
            id={layout === "scroll" ? `suggestion-${index}` : undefined}
            type="button"
            variant="outline"
            size="sm"
            tabIndex={layout === "scroll" ? (index === active ? 0 : -1) : 0}
            className={cn("max-w-[240px] rounded-full", classNames?.item)}
            onClick={() => onSelect?.(item.value)}
            onFocus={() => setActive(index)}
          >
            {item.icon}
            <span className="truncate">{item.label}</span>
          </Button>
        </div>
      ))}
    </div>
  )
}
