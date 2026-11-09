"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * La búsqueda reutiliza foldInboxText. El filtro reutiliza segmented-filter.
 */

import { useId, useState, type KeyboardEvent } from "react"

import { cn } from "@/lib/utils"
import type { ConversationItemData, ConversationSection, ThreadFilter, ThreadStatus } from "@/registry/retana/lib/thread-desk"
import { matchesConversation } from "@/registry/retana/lib/thread-desk"
import { ConversationItem } from "@/registry/retana/ui/conversation-item"
import { SegmentedFilter } from "@/registry/retana/ui/segmented-filter"

export type ConversationListProps = {
  label: string
  title?: string
  countLabel?: string
  searchLabel?: string
  shortcut?: string
  query?: string
  onQueryChange?: (query: string) => void
  filters?: readonly ThreadFilter[]
  filter?: string
  onFilterChange?: (value: string) => void
  sections?: readonly ConversationSection[]
  items?: readonly ConversationItemData[]
  selectedId?: string | null
  onSelect?: (id: string) => void
  status?: ThreadStatus
  emptyTitle?: string
  loadingLabel?: string
  error?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function ConversationList({
  label,
  title,
  countLabel,
  searchLabel = "Buscar",
  shortcut,
  query: queryProp,
  onQueryChange,
  filters,
  filter,
  onFilterChange,
  sections,
  items = [],
  selectedId,
  onSelect,
  status = "ready",
  emptyTitle = "Sin conversaciones",
  loadingLabel = "Cargando conversaciones",
  error,
  onRetry,
  retryLabel = "Reintentar",
  className,
}: ConversationListProps) {
  const listId = useId()
  const [queryState, setQueryState] = useState("")
  const query = queryProp ?? queryState
  const visible = items.filter((item) => matchesConversation(item, filter, query))

  function setQuery(next: string) {
    if (queryProp === undefined) setQueryState(next)
    onQueryChange?.(next)
  }

  function onListKey(event: KeyboardEvent<HTMLDivElement>) {
    if (!visible.length) return
    const index = Math.max(0, visible.findIndex((item) => item.id === selectedId))
    const nextIndex = event.key === "ArrowDown" ? Math.min(visible.length - 1, index + 1) : event.key === "ArrowUp" ? Math.max(0, index - 1) : -1
    if (nextIndex < 0) {
      if (event.key === "Enter" && visible[index]) onSelect?.(visible[index].id)
      return
    }
    event.preventDefault()
    const next = visible[nextIndex]
    if (next) onSelect?.(next.id)
  }

  const known = new Set((sections ?? []).map((section) => section.id))
  const groups = sections?.length
    ? [
        ...sections.map((section) => ({ ...section, rows: visible.filter((item) => item.section === section.id) })),
        ...[...new Set(visible.map((item) => item.section).filter((id): id is string => typeof id === "string" && !known.has(id)))].map((id) => ({
          id,
          label: id,
          hint: undefined,
          rows: visible.filter((item) => item.section === id),
        })),
      ]
    : [{ id: "all", label: "", hint: undefined, rows: visible }]

  return (
    <section data-slot="conversation-list" className={cn("flex min-h-0 min-w-0 flex-col gap-3", className)}>
      {title || countLabel ? (
        <div className="flex items-center justify-between gap-2 px-1">
          {title ? <h2 className="truncate text-sm font-semibold">{title}</h2> : <span />}
          {countLabel ? (
            <p className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground tabular-nums">
              <span className="sr-only">{`Total ${countLabel}`}</span>
              <span aria-hidden>{countLabel}</span>
            </p>
          ) : null}
        </div>
      ) : null}
      <div className="relative">
        <input
          type="search"
          data-slot="conversation-search"
          value={query}
          aria-label={searchLabel}
          placeholder={searchLabel}
          onChange={(event) => setQuery(event.target.value)}
          className="h-11 w-full rounded-xl border border-input bg-background ps-3 pe-14 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
        />
        {shortcut ? (
          <kbd className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 rounded-md bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
            {shortcut}
          </kbd>
        ) : null}
      </div>
      {filters?.length ? (
        <SegmentedFilter label={label} options={[...filters]} value={filter} onValueChange={onFilterChange} />
      ) : null}
      {status === "loading" ? (
        <div role="status" aria-label={loadingLabel} className="grid gap-2">
          <span className="sr-only">{loadingLabel}</span>
          <span className="h-14 animate-pulse rounded-xl bg-muted" />
          <span className="h-14 animate-pulse rounded-xl bg-muted" />
        </div>
      ) : null}
      {status === "error" ? (
        <div role="alert" className="grid gap-2 rounded-xl border border-border p-3">
          <p className="text-sm text-destructive">{error}</p>
          {onRetry ? (
            <button type="button" className="h-11 rounded-full bg-foreground px-4 text-sm text-background" onClick={onRetry}>
              {retryLabel}
            </button>
          ) : null}
        </div>
      ) : null}
      {status === "empty" || (status === "ready" && visible.length === 0) ? (
        <div role="status" className="px-2 py-8 text-center text-sm text-muted-foreground">
          {emptyTitle}
        </div>
      ) : null}
      {status === "ready" && visible.length > 0 ? (
        <div
          role="listbox"
          aria-label={label}
          tabIndex={0}
          className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onKeyDown={onListKey}
        >
          {groups.map((group) =>
            group.rows.length ? (
              <div key={group.id} className="grid gap-1">
                {group.label ? (
                  <p className="px-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">
                    {group.label}
                    {group.hint ? <span className="ms-2 normal-case tracking-normal">{group.hint}</span> : null}
                  </p>
                ) : null}
                {group.rows.map((item) => (
                  <ConversationItem key={item.id} id={`${listId}-${item.id}`} item={item} selected={item.id === selectedId} onSelect={onSelect} />
                ))}
              </div>
            ) : null,
          )}
        </div>
      ) : null}
    </section>
  )
}
