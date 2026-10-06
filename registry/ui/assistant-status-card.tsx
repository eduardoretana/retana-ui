"use client"

/** Assistant on/off card with an attention link. Labels are props. */

import * as React from "react"
import { ChevronRight } from "lucide-react"

import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export type AssistantStatusCardProps = {
  name: string
  detail?: string
  icon?: React.ReactNode
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  switchLabel?: string
  attention?: string
  onAttention?: () => void
  className?: string
}

export function AssistantStatusCard({
  name,
  detail,
  icon,
  checked = true,
  onCheckedChange,
  switchLabel = "Assistant",
  attention,
  onAttention,
  className,
}: AssistantStatusCardProps) {
  return (
    <section data-slot="assistant-status-card" className={cn("flex flex-col gap-2 rounded-2xl bg-primary p-3 text-primary-foreground", className)}>
      <div className="flex items-center gap-2">
        <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-full bg-foreground text-background [&_svg]:size-3.5">
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium">{name}</span>
          {detail ? <span className="block truncate text-xs opacity-80">{detail}</span> : null}
        </span>
        <Switch checked={checked} onCheckedChange={onCheckedChange} aria-label={switchLabel} className="data-checked:bg-foreground" />
      </div>
      {attention ? (
        <button
          type="button"
          onClick={onAttention}
          className="flex w-full items-center justify-between gap-2 rounded-full bg-card px-3 py-2 text-start text-sm text-card-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <span className="truncate">{attention}</span>
          <ChevronRight className="size-4 shrink-0" aria-hidden />
        </button>
      ) : null}
    </section>
  )
}
