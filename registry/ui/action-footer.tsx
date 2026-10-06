"use client"

/** Hint plus secondary and primary actions. Swap the actions as state changes. */

import * as React from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type ActionFooterProps = {
  hint?: React.ReactNode
  secondary?: { label: string; onSelect?: () => void; icon?: React.ReactNode }
  primary?: { label: string; onSelect?: () => void; icon?: React.ReactNode }
  disabled?: boolean
  className?: string
}

export function ActionFooter({ hint, secondary, primary, disabled = false, className }: ActionFooterProps) {
  return (
    <footer
      data-slot="action-footer"
      data-disabled={disabled ? "" : undefined}
      className={cn("flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3", className)}
    >
      <div className="min-w-0 text-xs text-muted-foreground wrap-break-word">{hint}</div>
      <div className="flex flex-wrap items-center gap-2">
        {secondary ? (
          <Button type="button" variant="outline" className="rounded-full" disabled={disabled} onClick={secondary.onSelect}>
            {secondary.icon}
            {secondary.label}
          </Button>
        ) : null}
        {primary ? (
          <Button type="button" className="rounded-full" disabled={disabled} onClick={primary.onSelect}>
            {primary.icon}
            {primary.label}
          </Button>
        ) : null}
      </div>
    </footer>
  )
}
