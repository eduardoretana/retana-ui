"use client"

/**
 * Clean-room header notices for a company book.
 * notification-center is the grouped inbox. notification-stack is the depth stack.
 * This popover is the short list tied to company records.
 */

import * as React from "react"
import { Bell, Check } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import type { CrmNotice } from "@/registry/retana/lib/crm-companies"

export type CrmNotificationsLabels = {
  label?: string
  empty?: string
  markAll?: string
  unread?: (count: number) => string
  markRead?: (notice: CrmNotice) => string
}

export type CrmNotificationsProps = {
  items?: readonly CrmNotice[]
  defaultItems?: readonly CrmNotice[]
  onItemsChange?: (items: CrmNotice[]) => void
  onSelect?: (notice: CrmNotice) => void
  open?: boolean
  onOpenChange?: (open: boolean) => void
  labels?: CrmNotificationsLabels
  className?: string
}

export function CrmNotifications({
  items,
  defaultItems = [],
  onItemsChange,
  onSelect,
  open,
  onOpenChange,
  labels,
  className,
}: CrmNotificationsProps) {
  const [internal, setInternal] = React.useState<CrmNotice[]>(() => [...defaultItems])
  const list = items ? [...items] : internal
  const unread = list.filter((notice) => !notice.read).length
  const copy = {
    label: labels?.label ?? "Notifications",
    empty: labels?.empty ?? "No notifications",
    markAll: labels?.markAll ?? "Mark all read",
  }

  function commit(next: CrmNotice[]) {
    if (!items) setInternal(next)
    onItemsChange?.(next)
  }

  function markRead(notice: CrmNotice) {
    commit(list.map((item) => (item.id === notice.id ? { ...item, read: true } : item)))
    onSelect?.(notice)
  }

  function markAll() {
    commit(list.map((item) => ({ ...item, read: true })))
  }

  function onItemKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (!["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) return
    const parent = event.currentTarget.parentElement
    if (!parent) return
    const buttons = [...parent.querySelectorAll<HTMLButtonElement>("[data-notice]")]
    const index = buttons.indexOf(event.currentTarget)
    if (index < 0) return
    event.preventDefault()
    const next =
      event.key === "ArrowDown" ? buttons[index + 1] : event.key === "ArrowUp" ? buttons[index - 1] : event.key === "Home" ? buttons[0] : buttons[buttons.length - 1]
    next?.focus()
  }

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="icon"
          className={cn("relative", className)}
          aria-label={labels?.unread?.(unread) ?? `${copy.label}${unread ? `, ${unread} unread` : ""}`}
          data-slot="crm-notifications"
        >
          <Bell aria-hidden="true" />
          {unread > 0 ? (
            <span className="absolute -top-1 -end-1 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground tabular-nums">
              {unread > 9 ? "9+" : unread}
            </span>
          ) : null}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(22rem,var(--radix-popover-content-available-width))] p-0" aria-label={copy.label}>
        <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2">
          <p className="text-sm font-medium">{copy.label}</p>
          <Button type="button" variant="ghost" size="sm" onClick={markAll} disabled={unread === 0}>
            <Check data-icon="inline-start" aria-hidden="true" />
            {copy.markAll}
          </Button>
        </div>
        {list.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">{copy.empty}</p>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <div className="flex flex-col p-1">
              {list.map((notice) => (
                <button
                  key={notice.id}
                  type="button"
                  data-notice=""
                  className="flex min-w-0 flex-col gap-0.5 rounded-lg px-2 py-2 text-start hover:bg-muted focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
                  aria-label={labels?.markRead?.(notice) ?? `${notice.title}${notice.read ? "" : ", unread"}`}
                  onClick={() => markRead(notice)}
                  onKeyDown={onItemKeyDown}
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {notice.read ? (
                      <span className="size-2 shrink-0 rounded-full bg-transparent" aria-hidden="true" />
                    ) : (
                      <span className="size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1 truncate text-sm font-medium">{notice.title}</span>
                    <time className="shrink-0 text-xs text-muted-foreground" dateTime={notice.dateTime}>
                      {notice.time}
                    </time>
                  </span>
                  {notice.description ? <span className="line-clamp-2 ps-4 text-xs text-muted-foreground">{notice.description}</span> : null}
                </button>
              ))}
            </div>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
