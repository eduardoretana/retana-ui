"use client"

/** Independent implementation of a common dashboard pattern. */

import * as React from "react"
import { ChevronRight, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"
import { PriorityBadge, type PriorityLevel } from "@/registry/retana/ui/priority-badge"

export type AttentionChip =
  | { type: "priority"; level: PriorityLevel; label?: string }
  | { type: "date"; label: string }
  | { type: "status"; label: string; tone?: "neutral" | "good" | "bad" }
  | { type: "progress"; done: number; total: number }
  | { type: "text"; label: string }

export type AttentionAction = {
  id: string
  label: string
  onSelect: () => void
}

export type AttentionItem = {
  id: string
  title: string
  description?: string
  tone?: "critical" | "neutral" | "positive"
  chips?: readonly AttentionChip[]
  href?: string
  onSelect?: (item: AttentionItem) => void
  actions?: readonly AttentionAction[]
}

export type AttentionListClassNames = {
  root?: string
  item?: string
  title?: string
  description?: string
  empty?: string
}

export type AttentionListProps = {
  items: readonly AttentionItem[]
  label?: string
  max?: number
  moreLabel?: (hidden: number) => string
  emptyLabel?: string
  emptyHint?: string
  loading?: boolean
  loadingRows?: number
  className?: string
  classNames?: AttentionListClassNames
}

const tileClass = {
  critical: "bg-destructive/10 text-destructive",
  neutral: "bg-muted text-muted-foreground",
  positive: "bg-chart-2/20 text-foreground",
} as const

function chipText(chip: AttentionChip): string {
  if (chip.type === "priority") return chip.label ?? chip.level
  if (chip.type === "progress") return `${chip.done} of ${chip.total}`
  return chip.label
}

function rowName(item: AttentionItem): string {
  const chips = (item.chips ?? []).map(chipText).filter(Boolean)
  return [item.title, ...chips].join(", ")
}

function Chips({ chips }: { chips: readonly AttentionChip[] }) {
  return (
    <div className="flex flex-wrap gap-1" aria-hidden>
      {chips.map((chip, index) => {
        if (chip.type === "priority") return <PriorityBadge key={`${chip.level}-${index}`} level={chip.level} label={chip.label} />
        const tone = chip.type === "status" ? chip.tone : undefined
        return (
          <span
            key={`${chip.type}-${index}`}
            className={cn(
              "inline-flex h-6 max-w-full items-center rounded-full bg-muted px-2 text-xs text-foreground",
              tone === "good" && "bg-chart-2/20",
              tone === "bad" && "bg-destructive/10 text-destructive",
              chip.type === "progress" && "bg-chart-2/15",
            )}
          >
            <span className="truncate">{chipText(chip)}</span>
          </span>
        )
      })}
    </div>
  )
}

export function AttentionList({
  items,
  label = "Needs you",
  max,
  moreLabel = (hidden) => `Show ${hidden} more`,
  emptyLabel = "You're all caught up",
  emptyHint = "Nothing is waiting on you.",
  loading = false,
  loadingRows = 3,
  className,
  classNames,
}: AttentionListProps) {
  const [open, setOpen] = React.useState(false)
  const visible = max != null && !open ? items.slice(0, max) : items
  const hidden = items.length - visible.length

  function onRowKey(event: React.KeyboardEvent<HTMLElement>, index: number) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
    const rows = event.currentTarget.closest("ul")?.querySelectorAll<HTMLElement>("[data-attention-row]")
    if (!rows?.length) return
    event.preventDefault()
    const next = event.key === "ArrowDown" ? Math.min(rows.length - 1, index + 1) : Math.max(0, index - 1)
    rows[next]?.focus()
  }

  return (
    <div data-slot="attention-list" className={cn("min-w-0", className, classNames?.root)}>
      {loading ? (
        <ul className="flex flex-col gap-3" aria-busy="true" aria-label={label}>
          {Array.from({ length: loadingRows }, (_, index) => (
            <li key={index} className="flex gap-3">
              <Skeleton className="size-8 shrink-0" />
              <div className="flex flex-1 flex-col gap-2">
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-3 w-full" />
              </div>
            </li>
          ))}
        </ul>
      ) : items.length === 0 ? (
        <div className={cn("flex flex-col items-start gap-1 py-4", classNames?.empty)}>
          <p className="text-sm font-medium">{emptyLabel}</p>
          <p className="text-xs text-muted-foreground">{emptyHint}</p>
        </div>
      ) : (
        <ul role="list" aria-label={label} className="flex flex-col">
          {visible.map((item, index) => {
            const tone = item.tone ?? "neutral"
            const name = rowName(item)
            const interactive = Boolean(item.href || item.onSelect)
            const body = (
              <>
                <span className={cn("grid size-8 shrink-0 place-items-center rounded-lg text-xs font-medium", tileClass[tone])} aria-hidden>
                  {index + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className={cn("block truncate text-sm font-medium", classNames?.title)}>{item.title}</span>
                  {item.description ? (
                    <span className={cn("mt-0.5 line-clamp-2 block text-xs text-muted-foreground", classNames?.description)}>
                      {item.description}
                    </span>
                  ) : null}
                  {item.chips?.length ? (
                    <span className="mt-2 block">
                      <Chips chips={item.chips} />
                    </span>
                  ) : null}
                </span>
                {interactive ? <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden /> : null}
              </>
            )
            const rowClass = cn(
              "flex w-full min-w-0 items-start gap-3 rounded-lg py-3 text-start hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              index > 0 && "border-t border-border",
              classNames?.item,
            )
            return (
              <li key={item.id} className="flex min-w-0 items-start gap-1">
                {item.href ? (
                  <a
                    data-attention-row=""
                    href={item.href}
                    aria-label={name}
                    className={cn(rowClass, "flex-1")}
                    onClick={(event) => {
                      if (!item.onSelect) return
                      event.preventDefault()
                      item.onSelect(item)
                    }}
                    onKeyDown={(event) => onRowKey(event, index)}
                  >
                    {body}
                  </a>
                ) : interactive ? (
                  <button
                    data-attention-row=""
                    type="button"
                    aria-label={name}
                    className={cn(rowClass, "flex-1")}
                    onClick={() => item.onSelect?.(item)}
                    onKeyDown={(event) => onRowKey(event, index)}
                  >
                    {body}
                  </button>
                ) : (
                  <div className={cn(rowClass, "flex-1")}>{body}</div>
                )}
                {item.actions?.length ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button type="button" variant="ghost" size="icon-sm" className="mt-2 shrink-0" aria-label={`Actions for ${item.title}`}>
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {item.actions.map((action) => (
                        <DropdownMenuItem key={action.id} onSelect={() => action.onSelect()}>
                          {action.label}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : null}
              </li>
            )
          })}
        </ul>
      )}
      {hidden > 0 ? (
        <Button type="button" variant="ghost" size="sm" className="mt-1" onClick={() => setOpen(true)}>
          {moreLabel(hidden)}
        </Button>
      ) : null}
    </div>
  )
}
