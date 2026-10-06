"use client"

/** Grouped documents in review or checklist mode. */

import * as React from "react"
import { ChevronDown, Eye, FileText, MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { ConfidenceBadge } from "@/registry/retana/ui/confidence-badge"

export type DocumentRowAction = { id: string; label: string }

export type DocumentRow = {
  id: string
  name: string
  meta?: string
  status?: React.ReactNode
  /** 0–1. Null shows the unchecked labels. */
  score?: number | null
  date?: string | null
  missing?: boolean
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  previewLabel?: string
  onPreview?: () => void
  actions?: readonly DocumentRowAction[]
  onAction?: (actionId: string) => void
  uncheckedLabel?: string
  unsetLabel?: string
}

export type DocumentGroup = {
  id: string
  label: string
  countLabel?: string
  icon?: React.ReactNode
  status?: React.ReactNode
  items: readonly DocumentRow[]
  defaultOpen?: boolean
}

export type DocumentListProps = {
  title?: string
  mode?: "review" | "checklist"
  groups: readonly DocumentGroup[]
  header?: React.ReactNode
  emptyLabel?: string
  className?: string
}

export function DocumentList({ title, mode = "review", groups, header, emptyLabel = "No documents", className }: DocumentListProps) {
  const total = groups.reduce((sum, group) => sum + group.items.length, 0)
  return (
    <section data-slot="document-list" data-mode={mode} className={cn("flex min-w-0 flex-col gap-3", className)}>
      {title || header ? (
        <header className="flex flex-wrap items-center justify-between gap-2">
          {title ? <h3 className="text-sm font-medium">{title}</h3> : <span />}
          {header}
        </header>
      ) : null}
      {total === 0 ? <p className="text-sm text-muted-foreground">{emptyLabel}</p> : null}
      {groups.map((group) => (
        <Collapsible key={group.id} defaultOpen={group.defaultOpen ?? true} className="rounded-xl bg-muted">
          <CollapsibleTrigger className="flex w-full items-center gap-2 px-3 py-2 text-start text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            <span aria-hidden className="text-muted-foreground [&_svg]:size-4">
              {group.icon ?? <FileText className="size-4" />}
            </span>
            <span className="font-medium">{group.label}</span>
            <span className="text-xs text-muted-foreground">{group.countLabel ?? `${group.items.length}`}</span>
            <span className="ms-auto flex items-center gap-2">
              {group.status}
              <ChevronDown className="size-4 text-muted-foreground" aria-hidden />
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent className="flex flex-col gap-1 px-1 pb-1">
            {group.items.map((item) => (
              <DocumentLine key={item.id} item={item} mode={mode} />
            ))}
          </CollapsibleContent>
        </Collapsible>
      ))}
    </section>
  )
}

function DocumentLine({ item, mode }: { item: DocumentRow; mode: "review" | "checklist" }) {
  const missing = Boolean(item.missing)
  return (
    <div
      data-slot="document-row"
      data-missing={missing ? "" : undefined}
      className={cn(
        "flex min-w-0 flex-wrap items-center gap-2 rounded-lg bg-card px-2 py-2 text-sm hover:bg-muted/80",
        missing && "text-muted-foreground",
      )}
    >
      {mode === "checklist" ? (
        <Checkbox checked={item.checked} onCheckedChange={(value) => item.onCheckedChange?.(value === true)} aria-label={item.name} />
      ) : (
        <span
          aria-hidden
          className={cn(
            "grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground",
            missing && "bg-destructive/10 text-destructive",
          )}
        >
          <FileText className="size-4" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="block truncate font-medium">{item.name}</span>
        {item.meta && mode === "review" ? <span className="block truncate text-xs text-muted-foreground">{item.meta}</span> : null}
      </span>
      {mode === "review" ? (
        <>
          {item.status}
          {missing || item.score == null ? (
            <span className="font-mono text-xs text-muted-foreground">{item.uncheckedLabel ?? "Not checked"}</span>
          ) : (
            <ConfidenceBadge score={item.score} variant="segments" className="w-24" />
          )}
          <span className="w-16 shrink-0 text-end font-mono text-xs text-muted-foreground">
            {item.date ?? item.unsetLabel ?? "Not set"}
          </span>
        </>
      ) : (
        <span className="truncate text-xs text-muted-foreground">{item.meta}</span>
      )}
      {item.onPreview ? (
        <Button type="button" size="icon-sm" variant="ghost" className="rounded-full" aria-label={item.previewLabel ?? item.name} onClick={item.onPreview}>
          <Eye />
        </Button>
      ) : null}
      {item.actions?.length ? (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button type="button" size="icon-sm" variant="ghost" className="rounded-full" aria-label={item.name}>
              <MoreHorizontal />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {item.actions.map((action) => (
              <DropdownMenuItem key={action.id} onSelect={() => item.onAction?.(action.id)}>
                {action.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      ) : null}
    </div>
  )
}
