"use client"

/** Selectable findings. The selected row is a raised card. */

import * as React from "react"
import { Check, TriangleAlert, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type IssueSeverity = "pass" | "minor" | "critical" | "fixed"

export type IssueListItem = {
  id: string
  title: string
  description?: string
  severity: IssueSeverity
  badge?: React.ReactNode
}

export type IssueListProps = {
  label?: string
  items: readonly IssueListItem[]
  value?: string
  onValueChange?: (id: string) => void
  emptyLabel?: string
  className?: string
}

const iconWrap: Record<IssueSeverity, string> = {
  pass: "bg-primary/15 text-foreground",
  minor: "bg-chart-4/20 text-foreground",
  critical: "bg-destructive/10 text-destructive",
  fixed: "bg-primary/15 text-foreground",
}

function Mark({ severity }: { severity: IssueSeverity }) {
  const Icon = severity === "critical" ? X : severity === "minor" ? TriangleAlert : Check
  return (
    <span aria-hidden className={cn("grid size-7 shrink-0 place-items-center rounded-full", iconWrap[severity])}>
      <Icon className="size-3.5" />
    </span>
  )
}

export function IssueList({ label = "Findings", items, value, onValueChange, emptyLabel = "None", className }: IssueListProps) {
  function onKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
    event.preventDefault()
    const next = event.key === "ArrowDown" ? Math.min(items.length - 1, index + 1) : Math.max(0, index - 1)
    onValueChange?.(items[next]?.id ?? "")
    const rows = event.currentTarget.closest("ul")?.querySelectorAll<HTMLButtonElement>("[data-issue]")
    rows?.[next]?.focus()
  }
  return (
    <section data-slot="issue-list" className={cn("flex min-w-0 flex-col gap-2", className)}>
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-medium">{label}</h3>
        <span className="font-mono text-xs text-muted-foreground">{items.length}</span>
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        <ul role="listbox" aria-label={label} className="flex flex-col gap-1">
          {items.map((item, index) => {
            const selected = item.id === value
            return (
              <li key={item.id}>
                <button
                  type="button"
                  role="option"
                  data-issue=""
                  aria-selected={selected}
                  onClick={() => onValueChange?.(item.id)}
                  onKeyDown={(event) => onKey(event, index)}
                  className={cn(
                    "flex w-full items-start gap-2 rounded-xl px-2 py-2 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected ? "border border-border bg-card shadow-sm" : "hover:bg-muted",
                  )}
                >
                  <Mark severity={item.severity} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium wrap-break-word">{item.title}</span>
                    {item.description ? <span className="mt-0.5 line-clamp-2 block text-xs text-muted-foreground">{item.description}</span> : null}
                  </span>
                  {item.badge}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
