"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * Barra en píldoras. Solo el color de cada segmento, sin animar el resto.
 */

import { cn } from "@/lib/utils"

export type MessageCardMetricProps = {
  title?: string
  chip?: string
  value?: string
  caption?: string
  filled?: number
  total?: number
  start?: string
  end?: string
  state?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  className?: string
}

export function MessageCardMetric({
  title,
  chip,
  value,
  caption,
  filled = 0,
  total = 0,
  start,
  end,
  state = "ready",
  emptyLabel = "Sin métrica",
  loadingLabel = "Cargando métrica",
  error,
  className,
}: MessageCardMetricProps) {
  if (state === "loading") return <div role="status" aria-label={loadingLabel} className="h-24 animate-pulse rounded-2xl bg-muted" />
  if (state === "error") {
    return (
      <p role="alert" className="rounded-2xl border border-border p-3 text-sm text-destructive">
        {error}
      </p>
    )
  }
  if (state === "empty" || total <= 0) {
    return (
      <p role="status" className="rounded-2xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }
  const safeFilled = Math.max(0, Math.min(filled, total))
  return (
    <div data-slot="message-card-metric" className={cn("grid gap-3 rounded-2xl border border-border bg-card p-4", className)}>
      <div className="flex items-center justify-between gap-2">
        {title ? <p className="text-sm font-medium">{title}</p> : <span />}
        {chip ? <span className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{chip}</span> : null}
      </div>
      <p className="text-2xl font-semibold tracking-tight">
        {value} {caption ? <span className="text-sm font-normal text-muted-foreground">{caption}</span> : null}
      </p>
      <div className="flex gap-1" aria-hidden>
        {Array.from({ length: total }, (_, index) => (
          <span
            key={index}
            data-slot="metric-segment"
            data-filled={index < safeFilled ? "true" : "false"}
            className={cn("h-2 flex-1 rounded-full", index < safeFilled ? "bg-primary" : "bg-muted")}
          />
        ))}
      </div>
      <div className="flex justify-between gap-3 text-xs text-muted-foreground">
        {start ? <span>{start}</span> : <span />}
        {end ? <span>{end}</span> : null}
      </div>
    </div>
  )
}
