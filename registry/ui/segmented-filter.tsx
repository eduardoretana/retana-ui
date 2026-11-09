"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * Extiende segmented-control con objetivo de 44 px. No copia su pista.
 */

import { cn } from "@/lib/utils"
import { SegmentedControl, type SegmentedControlProps } from "@/registry/retana/ui/segmented-control"

export type SegmentedFilterProps = SegmentedControlProps & {
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
}

export function SegmentedFilter({
  classNames,
  status = "ready",
  emptyLabel = "Sin filtros",
  loadingLabel = "Cargando filtros",
  error,
  options,
  ...props
}: SegmentedFilterProps) {
  if (status === "loading") {
    return (
      <div role="status" aria-label={loadingLabel} className="h-11 animate-pulse rounded-lg bg-muted" />
    )
  }
  if (status === "error") {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    )
  }
  if (status === "empty" || options.length === 0) {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }
  return (
    <SegmentedControl
      {...props}
      options={options}
      classNames={{
        ...classNames,
        option: cn("min-h-11", classNames?.option),
      }}
    />
  )
}
