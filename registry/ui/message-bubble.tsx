"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * La tinta propia usa foreground. El acento único es primary.
 */

import type { ReactNode } from "react"
import { AlertCircle, Check, CheckCheck } from "lucide-react"

import { cn } from "@/lib/utils"
import { deskInitials } from "@/registry/retana/lib/inbox"
import type { DeliveryState } from "@/registry/retana/lib/thread-desk"
import { ThreadEnter } from "@/registry/retana/ui/thread-enter"

export type MessageBubbleProps = {
  side: "incoming" | "outgoing"
  author: string
  time?: string
  children?: ReactNode
  /** Rich card rendered in the same column, outside the ink bubble. */
  attachment?: ReactNode
  delivery?: DeliveryState
  deliveryLabel?: string
  grouped?: "single" | "start" | "middle" | "end"
  enter?: boolean
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

function DeliveryIcon({ delivery }: { delivery: DeliveryState }) {
  if (delivery === "sent") return <Check className="size-3" aria-hidden />
  if (delivery === "delivered" || delivery === "read") return <CheckCheck className={cn("size-3", delivery === "read" && "text-primary")} aria-hidden />
  if (delivery === "failed") return <AlertCircle className="size-3" aria-hidden />
  return null
}

export function MessageBubble({
  side,
  author,
  time,
  children,
  attachment,
  delivery,
  deliveryLabel,
  grouped = "single",
  enter = false,
  onRetry,
  retryLabel = "Reintentar",
  className,
}: MessageBubbleProps) {
  const mine = side === "outgoing"
  const showMeta = grouped === "single" || grouped === "start"
  const showAvatar = !mine && (grouped === "single" || grouped === "end")
  return (
    <article data-slot="message-bubble" data-side={side} data-delivery={delivery} data-grouped={grouped} className={cn("flex w-full gap-2", mine && "justify-end", className)}>
      {!mine ? (
        showAvatar ? (
          <span className="mt-auto grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-[10px] font-medium text-background" aria-hidden>
            {deskInitials(author)}
          </span>
        ) : (
          <span className="size-8 shrink-0" aria-hidden />
        )
      ) : null}
      <ThreadEnter play={enter} className={cn("flex max-w-[min(100%,28rem)] flex-col gap-1", mine && "items-end")}>
        {showMeta ? (
          <p className={cn("px-1 text-xs text-muted-foreground", mine && "text-end")}>
            {mine ? (
              <>
                {time ? <time className="tabular-nums">{time}</time> : null}
                {time ? " · " : null}
                {author}
              </>
            ) : (
              <>
                <span className="font-medium text-foreground">{author}</span>
                {time ? (
                  <time className="ms-2 tabular-nums">{time}</time>
                ) : null}
              </>
            )}
          </p>
        ) : null}
        {children != null && children !== false && children !== "" ? (
          <div
            className={cn(
              "rounded-2xl px-3 py-2 text-sm leading-relaxed wrap-break-word",
              mine ? "rounded-ee-md bg-foreground text-background" : "rounded-es-md bg-muted text-foreground",
            )}
          >
            {children}
          </div>
        ) : null}
        {attachment}
        {delivery && delivery !== "sending" ? (
          <p className={cn("flex items-center gap-1 px-1 text-[11px]", delivery === "failed" ? "text-destructive" : "text-muted-foreground")}>
            <DeliveryIcon delivery={delivery} />
            {deliveryLabel}
          </p>
        ) : null}
        {delivery === "failed" && onRetry ? (
          <button type="button" className="h-11 rounded-full px-3 text-sm font-medium text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onClick={onRetry}>
            {retryLabel}
          </button>
        ) : null}
      </ThreadEnter>
    </article>
  )
}
