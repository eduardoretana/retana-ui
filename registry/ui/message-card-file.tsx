"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 */

import { Download, FileText } from "lucide-react"

import { cn } from "@/lib/utils"

export type MessageCardFileProps = {
  name?: string
  detail?: string
  status?: string
  downloadLabel?: string
  onDownload?: () => void
  state?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  onRetry?: () => void
  retryLabel?: string
  className?: string
}

export function MessageCardFile({
  name,
  detail,
  status,
  downloadLabel = "Descargar",
  onDownload,
  state = "ready",
  emptyLabel = "Sin archivo",
  loadingLabel = "Cargando archivo",
  error,
  onRetry,
  retryLabel = "Reintentar",
  className,
}: MessageCardFileProps) {
  if (state === "loading") {
    return <div role="status" aria-label={loadingLabel} className="h-16 animate-pulse rounded-2xl bg-muted" />
  }
  if (state === "error") {
    return (
      <div role="alert" className="flex items-center justify-between gap-2 rounded-2xl border border-border p-3">
        <p className="text-sm text-destructive">{error}</p>
        {onRetry ? (
          <button type="button" className="h-11 rounded-full px-3 text-sm" onClick={onRetry}>
            {retryLabel}
          </button>
        ) : null}
      </div>
    )
  }
  if (state === "empty" || !name) {
    return (
      <p role="status" className="rounded-2xl border border-dashed border-border px-3 py-4 text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }
  return (
    <div data-slot="message-card-file" className={cn("flex items-center gap-3 rounded-2xl border border-border bg-card p-3", className)}>
      <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-muted text-foreground">
        <FileText aria-hidden />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium">{name}</span>
        {detail ? <span className="block truncate text-xs text-muted-foreground">{detail}</span> : null}
        {status ? <span className="mt-1 inline-flex rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">{status}</span> : null}
      </span>
      {onDownload ? (
        <button
          type="button"
          aria-label={downloadLabel}
          className="grid size-11 place-items-center rounded-full text-foreground hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          onClick={onDownload}
        >
          <Download aria-hidden />
        </button>
      ) : null}
    </div>
  )
}
