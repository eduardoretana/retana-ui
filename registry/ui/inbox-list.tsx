"use client"

import * as React from "react"
import { Inbox, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Input } from "@/components/ui/input"
import { deskInitials, foldInboxText, type DeskPresence } from "@/registry/retana/lib/inbox"

export type InboxRow = {
  id: string
  title: string
  subtitle?: string
  preview?: string
  time?: string
  unread?: number
  presence?: DeskPresence
  meta?: React.ReactNode
}

export type InboxListClassNames = {
  root?: string
  header?: string
  search?: string
  list?: string
  item?: string
  empty?: string
}

export type InboxListProps = {
  label: string
  title?: string
  countLabel?: string
  query?: string
  defaultQuery?: string
  onQueryChange?: (query: string) => void
  searchLabel?: string
  toolbar?: React.ReactNode
  items: readonly InboxRow[]
  selectedId?: string | null
  defaultSelectedId?: string | null
  onSelect?: (id: string) => void
  emptyTitle?: string
  emptyDescription?: string
  className?: string
  classNames?: InboxListClassNames
}

function sameRow(row: InboxRow, query: string) {
  if (!query.trim()) return true
  const hay = foldInboxText([row.title, row.subtitle, row.preview].filter(Boolean).join(" "))
  return hay.includes(foldInboxText(query))
}

export function InboxList({
  label,
  title,
  countLabel,
  query: queryProp,
  defaultQuery = "",
  onQueryChange,
  searchLabel = "Search",
  toolbar,
  items,
  selectedId: selectedProp,
  defaultSelectedId = null,
  onSelect,
  emptyTitle = "Nothing here",
  emptyDescription,
  className,
  classNames,
}: InboxListProps) {
  const listId = React.useId()
  const [queryState, setQueryState] = React.useState(defaultQuery)
  const [selectedState, setSelectedState] = React.useState<string | null>(defaultSelectedId)
  const query = queryProp ?? queryState
  const selectedId = selectedProp !== undefined ? selectedProp : selectedState
  const visible = items.filter((item) => sameRow(item, query))

  function setQuery(next: string) {
    if (queryProp === undefined) setQueryState(next)
    onQueryChange?.(next)
  }

  function select(id: string) {
    if (selectedProp === undefined) setSelectedState(id)
    onSelect?.(id)
  }

  function onListKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (!visible.length) return
    const index = Math.max(0, visible.findIndex((item) => item.id === selectedId))
    const last = visible.length - 1
    const nextIndex =
      event.key === "ArrowDown"
        ? Math.min(last, index + 1)
        : event.key === "ArrowUp"
          ? Math.max(0, index - 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : -1
    if (nextIndex < 0 || !visible[nextIndex]) return
    event.preventDefault()
    select(visible[nextIndex].id)
    document.getElementById(`${listId}-${visible[nextIndex].id}`)?.focus()
  }

  return (
    <section
      data-slot="inbox-list"
      aria-label={label}
      className={cn("flex min-h-0 min-w-0 flex-col bg-background", className, classNames?.root)}
    >
      <header className={cn("flex flex-col gap-2 border-b border-border p-3", classNames?.header)}>
        {title || countLabel ? (
          <div className="flex items-baseline justify-between gap-2">
            {title ? <h2 className="truncate text-sm font-semibold">{title}</h2> : <span />}
            {countLabel ? <p className="shrink-0 text-xs text-muted-foreground tabular-nums">{countLabel}</p> : null}
          </div>
        ) : null}
        <div className="flex items-center gap-2">
          <div className={cn("relative min-w-0 flex-1", classNames?.search)}>
            <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder={searchLabel}
              aria-label={searchLabel}
              className="h-8 pl-7"
            />
          </div>
          {toolbar}
        </div>
      </header>
      {visible.length === 0 ? (
        <div className={cn("flex flex-1 flex-col items-center justify-center gap-2 px-6 py-10 text-center", classNames?.empty)} role="status">
          <Inbox className="size-5 text-muted-foreground" aria-hidden />
          <p className="text-sm font-medium wrap-anywhere">{emptyTitle}</p>
          {emptyDescription ? <p className="text-xs text-muted-foreground wrap-anywhere">{emptyDescription}</p> : null}
        </div>
      ) : (
        <div
          role="listbox"
          aria-label={label}
          aria-activedescendant={selectedId ? `${listId}-${selectedId}` : undefined}
          className={cn("flex min-h-0 flex-1 flex-col overflow-y-auto", classNames?.list)}
          onKeyDown={onListKeyDown}
        >
          {visible.map((item) => {
            const selected = item.id === selectedId
            return (
              <button
                key={item.id}
                id={`${listId}-${item.id}`}
                type="button"
                role="option"
                aria-selected={selected}
                tabIndex={selected || (!selectedId && item === visible[0]) ? 0 : -1}
                className={cn(
                  "flex w-full min-w-0 gap-2 border-b border-border px-3 py-2.5 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  selected ? "bg-muted" : "hover:bg-muted/60",
                  classNames?.item,
                )}
                onClick={() => select(item.id)}
              >
                <PresenceMark name={item.title} presence={item.presence} />
                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline gap-2">
                    <span className={cn("truncate text-sm", item.unread ? "font-semibold" : "font-medium")}>{item.title}</span>
                    {item.time ? <time className="ml-auto shrink-0 text-[11px] text-muted-foreground tabular-nums">{item.time}</time> : null}
                  </span>
                  {item.subtitle ? <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.subtitle}</span> : null}
                  {item.preview ? <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.preview}</span> : null}
                  {item.meta ? <span className="mt-1.5 flex min-w-0 flex-wrap items-center gap-1.5">{item.meta}</span> : null}
                </span>
                {item.unread ? (
                  <span className="mt-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground tabular-nums">
                    <span className="sr-only">{item.unread} unread</span>
                    <span aria-hidden>{item.unread}</span>
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      )}
    </section>
  )
}

export function PresenceMark({ name, presence }: { name: string; presence?: DeskPresence }) {
  return (
    <span className="relative mt-0.5 grid size-8 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
      <span aria-hidden>{deskInitials(name)}</span>
      {presence ? (
        <span className="sr-only">{presence}</span>
      ) : null}
      {presence ? (
        <span
          data-presence={presence}
          className={cn(
            "absolute end-0 bottom-0 size-2 rounded-full ring-2 ring-background",
            presence === "online" && "bg-primary",
            presence === "offline" && "bg-muted-foreground",
            presence === "away" && "bg-accent-foreground",
          )}
        />
      ) : null}
    </span>
  )
}
