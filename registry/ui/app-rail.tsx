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

export type AppRailItem = {
  id: string
  label: string
  icon?: ReactNode
  active?: boolean
}

export type AppRailWorkspace = {
  id: string
  label: string
}

export type AppRailProps = {
  label: string
  mark?: string
  items?: readonly AppRailItem[]
  workspaces?: readonly AppRailWorkspace[]
  user?: { name: string }
  settingsLabel?: string
  onSelect?: (id: string) => void
  onWorkspace?: (id: string) => void
  onSettings?: () => void
  status?: "ready" | "loading" | "empty" | "error"
  emptyLabel?: string
  loadingLabel?: string
  error?: string
  className?: string
}

const buttonClass =
  "grid size-11 place-items-center rounded-xl text-sidebar-foreground hover:bg-sidebar-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"

export function AppRail({
  label,
  mark = "R",
  items = [],
  workspaces = [],
  user,
  settingsLabel = "Ajustes",
  onSelect,
  onWorkspace,
  onSettings,
  status = "ready",
  emptyLabel = "Sin destinos",
  loadingLabel = "Cargando el riel",
  error,
  className,
}: AppRailProps) {
  return (
    <nav
      aria-label={label}
      data-slot="app-rail"
      className={cn("flex w-14 shrink-0 flex-col items-center gap-1 border-e border-sidebar-border bg-sidebar px-1.5 py-3", className)}
    >
      <span className="mb-2 grid size-11 place-items-center rounded-full bg-foreground text-sm font-semibold text-background" aria-hidden>
        {mark.slice(0, 1)}
      </span>
      {status === "loading" ? (
        <div role="status" aria-label={loadingLabel} className="size-11 animate-pulse rounded-xl bg-sidebar-accent" />
      ) : null}
      {status === "error" ? (
        <p role="alert" className="px-1 text-center text-[11px] text-destructive">
          {error}
        </p>
      ) : null}
      {status === "empty" || (status === "ready" && items.length === 0) ? (
        <p role="status" className="px-1 text-center text-[11px] text-sidebar-foreground">
          {emptyLabel}
        </p>
      ) : null}
      {status === "ready"
        ? items.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-current={item.active ? "page" : undefined}
              className={cn(buttonClass, item.active && "bg-sidebar-accent text-sidebar-accent-foreground")}
              onClick={() => onSelect?.(item.id)}
            >
              {item.icon ?? <span className="size-4 rounded-sm border border-current" aria-hidden />}
              <span className="sr-only">{item.label}</span>
            </button>
          ))
        : null}
      <span className="mt-auto" />
      {workspaces.map((space) => (
        <button key={space.id} type="button" className={buttonClass} onClick={() => onWorkspace?.(space.id)}>
          <span aria-hidden className="text-xs font-medium">
            {deskInitials(space.label)}
          </span>
          <span className="sr-only">{space.label}</span>
        </button>
      ))}
      {onSettings ? (
        <button type="button" className={buttonClass} onClick={onSettings}>
          <span className="sr-only">{settingsLabel}</span>
          <span aria-hidden className="size-4 rounded-full border border-current" />
        </button>
      ) : null}
      {user ? (
        <span className="grid size-11 place-items-center rounded-full bg-sidebar-accent text-xs font-medium text-sidebar-accent-foreground">
          <span className="sr-only">{user.name}</span>
          <span aria-hidden>{deskInitials(user.name)}</span>
        </span>
      ) : null}
    </nav>
  )
}
