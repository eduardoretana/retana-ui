"use client"

/** Status plus row actions. The accessible name is the status and the action labels. */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { StatusPill, type StatusPillAppearance } from "@/registry/retana/ui/status-pill"
import type { StatusTone } from "@/registry/retana/ui/status-pill"

export type { StatusTone }

const MAX_VISIBLE = 3

export type StatusActionVariant = "default" | "outline" | "ghost" | "destructive"

export type StatusAction = {
  id: string
  label: string
  onClick: () => void
  variant?: StatusActionVariant
  disabled?: boolean
  /** Keeps the control in the tab order and sets aria-busy. */
  pending?: boolean
}

export type StatusActionCellProps = {
  /** Visible status text. Also the start of the accessible name. */
  label: string
  /** Semantic tone. `status` is the same value when a caller uses that name. */
  tone?: StatusTone
  status?: StatusTone
  actions?: readonly StatusAction[]
  density?: "regular" | "compact"
  appearance?: Extract<StatusPillAppearance, "soft" | "outline" | "text">
  className?: string
  /** Visible actions before the rest move into the menu. Defaults to 3. */
  maxVisible?: number
  /**
   * `true` keeps every action in the menu. `false` keeps the inline row.
   * Omit it to collapse at 390px, either the viewport or the nearest container.
   */
  collapse?: boolean
  menuLabel?: string
  moreLabel?: string
  /** Inline failure. Announced as an alert, not by color alone. */
  error?: string
}

export function statusActionAccessibleName(label: string, actions: readonly { label: string }[]) {
  const actionLabels = actions.map((action) => action.label.trim()).filter(Boolean).join(", ")
  return actionLabels ? `${label}, ${actionLabels}` : label
}

function stopRowActivation(event: React.SyntheticEvent) {
  event.stopPropagation()
}

function ActionControl({
  action,
  density,
  onActivate,
}: {
  action: StatusAction
  density: "regular" | "compact"
  onActivate: (action: StatusAction) => void
}) {
  const blocked = action.disabled || action.pending
  return (
    <Button
      type="button"
      size={density === "compact" ? "xs" : "sm"}
      variant={action.variant ?? "outline"}
      aria-busy={action.pending || undefined}
      aria-disabled={blocked || undefined}
      className={cn("max-w-full", blocked && "opacity-50")}
      onClick={(event) => {
        stopRowActivation(event)
        if (blocked) return
        onActivate(action)
      }}
    >
      <span className="truncate">{action.label}</span>
    </Button>
  )
}

function ActionMenu({
  actions,
  label,
  density,
  onActivate,
}: {
  actions: readonly StatusAction[]
  label: string
  density: "regular" | "compact"
  onActivate: (action: StatusAction) => void
}) {
  const names = actions.map((action) => action.label).join(", ")
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          type="button"
          size={density === "compact" ? "xs" : "sm"}
          variant="outline"
          aria-label={names ? `${label}: ${names}` : label}
          className="max-w-full"
          onClick={stopRowActivation}
          onKeyDown={stopRowActivation}
        >
          <span className="truncate">{label}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {actions.map((action) => {
          const blocked = action.disabled || action.pending
          return (
            <DropdownMenuItem
              key={action.id}
              aria-busy={action.pending || undefined}
              aria-disabled={blocked || undefined}
              onSelect={(event) => {
                if (blocked) {
                  event.preventDefault()
                  return
                }
                onActivate(action)
              }}
            >
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function StatusActionCell({
  label,
  tone,
  status,
  actions = [],
  density = "regular",
  appearance = "soft",
  className,
  maxVisible = MAX_VISIBLE,
  collapse,
  menuLabel = "Actions",
  moreLabel = "More actions",
  error,
}: StatusActionCellProps) {
  const errorId = React.useId()
  const resolvedTone = tone ?? status ?? "neutral"
  const limit = Math.max(0, maxVisible)
  const visible = actions.slice(0, limit)
  const overflow = actions.slice(limit)
  const accessibleName = statusActionAccessibleName(label, actions)
  const menuOnly = collapse === true
  const auto = collapse == null

  function activate(action: StatusAction) {
    if (action.disabled || action.pending) return
    action.onClick()
  }

  return (
    <div
      data-slot="status-action-cell"
      data-density={density}
      data-collapsed={menuOnly ? "true" : auto ? "auto" : "false"}
      role="group"
      aria-label={accessibleName}
      aria-describedby={error ? errorId : undefined}
      className={cn("flex min-w-0 max-w-full flex-wrap items-center gap-2", density === "compact" && "gap-1", className)}
      onClick={stopRowActivation}
      onKeyDown={stopRowActivation}
    >
      <StatusPill label={label} tone={resolvedTone} appearance={appearance} className="max-w-full" />
      {actions.length > 0 && !menuOnly ? (
        <div className={cn("flex min-w-0 flex-wrap items-center gap-1", auto && "max-[390px]:hidden @max-[390px]:hidden")}>
          {visible.map((action) => (
            <ActionControl key={action.id} action={action} density={density} onActivate={activate} />
          ))}
          {overflow.length > 0 ? <ActionMenu actions={overflow} label={moreLabel} density={density} onActivate={activate} /> : null}
        </div>
      ) : null}
      {actions.length > 0 ? (
        <div className={cn(menuOnly ? "inline-flex" : "hidden", auto && "max-[390px]:inline-flex @max-[390px]:inline-flex")}>
          <ActionMenu actions={actions} label={menuLabel} density={density} onActivate={activate} />
        </div>
      ) : null}
      {error ? (
        <p id={errorId} role="alert" className="w-full text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  )
}
