"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */

import { cn } from "@/lib/utils"
import { deskInitials } from "@/registry/retana/lib/inbox"
import type { ConversationItemData } from "@/registry/retana/lib/thread-desk"

export type ConversationItemProps = {
  item: ConversationItemData
  selected?: boolean
  id?: string
  onSelect?: (id: string) => void
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  className?: string
}

export function ConversationItem({
  item,
  selected = false,
  id,
  onSelect,
  status = "ready",
  emptyLabel = "Sin conversación",
  loadingLabel = "Cargando la fila",
  error,
  className,
}: ConversationItemProps) {
  if (status === "loading") return <div role="status" aria-label={loadingLabel} className="h-14 animate-pulse rounded-xl bg-muted" />
  if (status === "error") return <p role="alert" className="text-sm text-destructive">{error}</p>
  if (status === "empty") return <p role="status" className="text-sm text-muted-foreground">{emptyLabel}</p>
  const contact = item.kind === "contact"
  return (
    <button
      id={id}
      type="button"
      role="option"
      aria-selected={selected}
      data-slot="conversation-item"
      className={cn(
        "flex min-h-11 w-full items-center gap-3 rounded-xl px-2 py-2 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
        selected ? "bg-muted" : "hover:bg-muted/70",
        className,
      )}
      onClick={() => onSelect?.(item.id)}
    >
      <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-foreground text-xs font-medium text-background">
        <span aria-hidden>{deskInitials(item.title)}</span>
        {item.presence ? (
          <span
            data-presence={item.presence}
            className={cn(
              "absolute end-0 bottom-0 size-2.5 rounded-full ring-2 ring-background",
              item.presence === "online" && "bg-primary",
              item.presence === "offline" && "bg-muted-foreground",
              item.presence === "away" && "bg-accent-foreground",
            )}
          />
        ) : null}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-2">
          <span className={cn("truncate text-sm", item.unread ? "font-semibold" : "font-medium")}>{item.title}</span>
          {item.time ? <time className="ms-auto shrink-0 text-xs text-muted-foreground tabular-nums">{item.time}</time> : null}
        </span>
        {contact && item.role ? <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.role}</span> : null}
        {!contact && item.preview ? <span className="mt-0.5 block truncate text-xs text-muted-foreground">{item.preview}</span> : null}
        {item.channel || item.stage || item.windowLabel ? (
          <span className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
            {item.channel ? <span className="text-xs font-medium text-primary">{item.channel}</span> : null}
            {item.stage ? <span className="rounded-full border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground">{item.stage}</span> : null}
            {item.windowLabel ? <span className="text-[11px] font-medium text-primary">{item.windowLabel}</span> : null}
          </span>
        ) : null}
      </span>
      {item.unread ? (
        <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[11px] font-medium text-primary-foreground tabular-nums">
          {item.unread}
        </span>
      ) : null}
    </button>
  )
}
