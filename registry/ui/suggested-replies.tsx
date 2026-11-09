"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * Cada chip pide aprobación. Esta pieza no envía el mensaje.
 */

import { Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"
import type { SuggestionItem } from "@/registry/retana/lib/thread-desk"
import { ThreadEnter } from "@/registry/retana/ui/thread-enter"

export type SuggestedRepliesProps = {
  label?: string
  items?: readonly SuggestionItem[]
  onApprove?: (id: string) => void
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  className?: string
}

export function SuggestedReplies({
  label = "Sugerencias",
  items = [],
  onApprove,
  status = "ready",
  emptyLabel = "Sin sugerencias",
  loadingLabel = "Cargando sugerencias",
  error,
  className,
}: SuggestedRepliesProps) {
  if (status === "loading") {
    return <div role="status" aria-label={loadingLabel} className="h-11 w-40 animate-pulse rounded-full bg-muted" />
  }
  if (status === "error") {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    )
  }
  if (status === "empty" || items.length === 0) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }
  return (
    <div role="list" aria-label={label} data-slot="suggested-replies" className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item, index) => (
        <div role="listitem" key={item.id}>
          <ThreadEnter play delay={index * 0.05}>
            <button
              type="button"
              data-stagger={String(index * 50)}
              className="inline-flex h-11 items-center gap-1.5 rounded-full border border-border bg-background px-3 text-sm hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              onClick={() => onApprove?.(item.id)}
            >
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              {item.label}
            </button>
          </ThreadEnter>
        </div>
      ))}
    </div>
  )
}
