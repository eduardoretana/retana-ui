"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */

import type { ReactNode } from "react"

import { cn } from "@/lib/utils"
import { deskInitials } from "@/registry/retana/lib/inbox"
import { groupMessages, type ThreadMessageData } from "@/registry/retana/lib/thread-desk"
import { MessageBubble } from "@/registry/retana/ui/message-bubble"
import { MessageCardFile } from "@/registry/retana/ui/message-card-file"
import { MessageCardInvoice } from "@/registry/retana/ui/message-card-invoice"
import { MessageCardMetric } from "@/registry/retana/ui/message-card-metric"
import { TypingIndicator } from "@/registry/retana/ui/typing-indicator"

export type ChatThreadProps = {
  label: string
  title?: string
  status?: string
  presence?: "online" | "offline" | "away"
  messages?: readonly ThreadMessageData[]
  typing?: { names: readonly string[]; label?: string }
  onRetryMessage?: (id: string) => void
  retryLabel?: string
  state?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  onRetry?: () => void
  actions?: ReactNode
  className?: string
}

export function ChatThread({
  label,
  title,
  status,
  presence,
  messages = [],
  typing,
  onRetryMessage,
  retryLabel = "Reintentar",
  state = "ready",
  emptyLabel = "Aún no hay mensajes",
  loadingLabel = "Cargando el hilo",
  error,
  onRetry,
  actions,
  className,
}: ChatThreadProps) {
  const grouped = groupMessages(messages)
  return (
    <section data-slot="chat-thread" className={cn("flex min-h-0 min-w-0 flex-1 flex-col", className)}>
      <header className="flex items-center gap-3 border-b border-border px-1 py-3">
        <span className="relative grid size-10 place-items-center rounded-full bg-foreground text-xs font-medium text-background" aria-hidden>
          {title ? deskInitials(title) : "?"}
          {presence ? (
            <span
              data-presence={presence}
              className={cn(
                "absolute end-0 bottom-0 size-2.5 rounded-full ring-2 ring-background",
                presence === "online" && "bg-primary",
                presence === "offline" && "bg-muted-foreground",
                presence === "away" && "bg-accent-foreground",
              )}
            />
          ) : null}
        </span>
        <span className="min-w-0 flex-1">
          {title ? <span className="block truncate text-sm font-semibold">{title}</span> : null}
          {status ? <span className="block truncate text-xs text-muted-foreground">{status}</span> : null}
        </span>
        {actions}
      </header>
      {state === "loading" ? (
        <div role="status" aria-label={loadingLabel} className="grid flex-1 gap-3 p-4">
          <span className="h-12 w-2/3 animate-pulse rounded-2xl bg-muted" />
          <span className="ms-auto h-12 w-1/2 animate-pulse rounded-2xl bg-muted" />
        </div>
      ) : null}
      {state === "error" ? (
        <div role="alert" className="m-4 grid gap-2 rounded-2xl border border-border p-3">
          <p className="text-sm text-destructive">{error}</p>
          {onRetry ? (
            <button type="button" className="h-11 justify-self-start rounded-full px-3 text-sm text-primary" onClick={onRetry}>
              {retryLabel}
            </button>
          ) : null}
        </div>
      ) : null}
      {state === "ready" ? (
        <div role="log" aria-live="polite" aria-relevant="additions" aria-label={label} className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-1 py-4">
          {grouped.length === 0 ? <p className="text-sm text-muted-foreground">{emptyLabel}</p> : null}
          {grouped.map((message) => (
            <div key={message.id} className="grid gap-2">
              {message.body ? (
                <MessageBubble
                  side={message.side}
                  author={message.author}
                  time={message.time}
                  delivery={message.delivery}
                  deliveryLabel={message.deliveryLabel}
                  grouped={message.grouped}
                  enter={message.enter}
                  onRetry={message.delivery === "failed" ? () => onRetryMessage?.(message.id) : undefined}
                  retryLabel={retryLabel}
                >
                  {message.body}
                </MessageBubble>
              ) : null}
              {message.note ? (
                <div className="max-w-md rounded-2xl border border-border bg-card p-3">
                  <p className="text-sm font-medium">{message.note.title}</p>
                  <p className="text-xs text-muted-foreground">{message.note.detail}</p>
                  {message.note.body ? <p className="mt-2 text-sm">{message.note.body}</p> : null}
                </div>
              ) : null}
              {message.file ? <MessageCardFile name={message.file.name} detail={message.file.detail} status={message.file.status} /> : null}
              {message.invoice ? <MessageCardInvoice title={message.invoice.title} amount={message.invoice.amount} due={message.invoice.due} /> : null}
              {message.metric ? (
                <MessageCardMetric
                  title={message.metric.title}
                  chip={message.metric.chip}
                  value={message.metric.value}
                  caption={message.metric.caption}
                  filled={message.metric.filled}
                  total={message.metric.total}
                  start={message.metric.start}
                  end={message.metric.end}
                />
              ) : null}
            </div>
          ))}
          {typing?.names?.length ? (
            <TypingIndicator names={typing.names} label={() => typing.label ?? ""} dots />
          ) : null}
        </div>
      ) : null}
    </section>
  )
}
