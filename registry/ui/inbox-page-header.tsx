"use client"

/**
 * Bandeja de conversaciones.
 * Fuente: concepto visual de Divan Raj (@desdivj),
 * https://x.com/desdivj/status/2119738295039250507
 * Licencia: sin licencia, clean-room. No se copiaron assets, logos,
 * ilustraciones ni textos.
 * No reutiliza page-header: esa pieza es el encabezado de un proyecto.
 */

import { Bell } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export type InboxCrumb = {
  label: string
  href?: string
}

export type InboxHeaderAction = {
  id: string
  label: string
  onSelect?: () => void
}

export type InboxPageHeaderProps = {
  crumbs?: readonly InboxCrumb[]
  title: string
  subtitle?: string
  actions?: readonly InboxHeaderAction[]
  bellLabel?: string
  bellCount?: number
  onBell?: () => void
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  className?: string
}

export function InboxPageHeader({
  crumbs = [],
  title,
  subtitle,
  actions = [],
  bellLabel,
  bellCount = 0,
  onBell,
  status = "ready",
  emptyLabel = "Sin encabezado",
  loadingLabel = "Cargando el encabezado",
  error,
  className,
}: InboxPageHeaderProps) {
  if (status === "loading") {
    return (
      <div role="status" aria-label={loadingLabel} className="h-24 animate-pulse rounded-2xl bg-muted" />
    )
  }
  if (status === "error") {
    return (
      <p role="alert" className="text-sm text-destructive">
        {error}
      </p>
    )
  }
  if (status === "empty") {
    return (
      <p role="status" className="text-sm text-muted-foreground">
        {emptyLabel}
      </p>
    )
  }
  return (
    <header data-slot="inbox-page-header" className={cn("flex flex-col gap-4", className)}>
      <div className="flex items-center justify-between gap-3">
        {crumbs.length ? (
          <nav aria-label="Breadcrumb" className="inline-flex max-w-full items-center gap-1.5 overflow-hidden rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
            {crumbs.map((crumb, index) => {
              const last = index === crumbs.length - 1
              return (
                <span key={`${crumb.label}-${index}`} className="inline-flex items-center gap-1.5">
                  {index > 0 ? <span aria-hidden>/</span> : null}
                  {last || !crumb.href ? (
                    <span className={last ? "text-foreground" : undefined}>{crumb.label}</span>
                  ) : (
                    <a href={crumb.href} className="hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                      {crumb.label}
                    </a>
                  )}
                </span>
              )
            })}
          </nav>
        ) : (
          <span />
        )}
        {bellLabel ? (
          <Button type="button" variant="outline" className="relative size-11 rounded-full" aria-label={bellCount > 0 ? `${bellLabel}, ${bellCount}` : bellLabel} onClick={onBell}>
            <Bell aria-hidden />
            {bellCount > 0 ? (
              <span className="absolute end-1 top-1 grid min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {bellCount}
              </span>
            ) : null}
          </Button>
        ) : null}
      </div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
          {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {actions.length ? (
          <div className="flex flex-wrap gap-2">
            {actions.map((action) => (
              <Button key={action.id} type="button" variant="outline" className="h-11 rounded-full px-4" onClick={action.onSelect}>
                {action.label}
              </Button>
            ))}
          </div>
        ) : null}
      </div>
    </header>
  )
}
