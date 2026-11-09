"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * También cubre una cotización: el título y el monto llegan por props.
 */

import { cn } from "@/lib/utils"

export type MessageCardInvoiceProps = {
  title?: string
  amount?: string
  due?: string
  state?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  className?: string
}

export function MessageCardInvoice({
  title,
  amount,
  due,
  state = "ready",
  emptyLabel = "Sin monto",
  loadingLabel = "Cargando monto",
  error,
  className,
}: MessageCardInvoiceProps) {
  if (state === "loading") return <div role="status" aria-label={loadingLabel} className="h-20 animate-pulse rounded-2xl bg-muted" />
  if (state === "error") {
    return (
      <p role="alert" className="rounded-2xl border border-border p-3 text-sm text-destructive">
        {error}
      </p>
    )
  }
  if (state === "empty" || !amount) {
    return (
      <p role="status" className="rounded-2xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }
  return (
    <div data-slot="message-card-invoice" className={cn("grid gap-2 rounded-2xl border border-border bg-card p-4", className)}>
      {title ? <p className="text-xs text-muted-foreground">{title}</p> : null}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-2xl font-semibold tracking-tight tabular-nums">{amount}</p>
        {due ? <span className="rounded-full bg-primary px-2.5 py-1 text-xs font-medium text-primary-foreground">{due}</span> : null}
      </div>
    </div>
  )
}
