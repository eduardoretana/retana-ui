"use client"

/** Organization switcher. Names and the menu come from props. */

import * as React from "react"
import { ChevronsUpDown } from "lucide-react"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

export type WorkspaceOption = {
  id: string
  name: string
  detail?: string
  logo?: React.ReactNode
}

export type WorkspaceSwitcherProps = {
  name: string
  detail?: string
  logo?: React.ReactNode
  options?: readonly WorkspaceOption[]
  value?: string
  onValueChange?: (id: string) => void
  label?: string
  className?: string
}

export function WorkspaceSwitcher({
  name,
  detail,
  logo,
  options = [],
  value,
  onValueChange,
  label = "Workspace",
  className,
}: WorkspaceSwitcherProps) {
  const current = options.find((option) => option.id === value)
  const title = current?.name ?? name
  const subtitle = current?.detail ?? detail
  const mark = current?.logo ?? logo ?? title.slice(0, 1)
  const body = (
    <>
      <span aria-hidden className="grid size-8 shrink-0 place-items-center rounded-lg bg-card text-xs font-semibold">
        {mark}
      </span>
      <span className="min-w-0 flex-1 text-start">
        <span className="block truncate text-sm font-medium">{title}</span>
        {subtitle ? <span className="block truncate text-xs text-muted-foreground">{subtitle}</span> : null}
      </span>
    </>
  )
  if (!options.length) {
    return (
      <div data-slot="workspace-switcher" className={cn("flex items-center gap-2 rounded-xl bg-muted px-2 py-2", className)}>
        {body}
      </div>
    )
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-slot="workspace-switcher"
        aria-label={label}
        className={cn(
          "flex w-full items-center gap-2 rounded-xl bg-muted px-2 py-2 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
          className,
        )}
      >
        {body}
        <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {options.map((option) => (
          <DropdownMenuItem key={option.id} onSelect={() => onValueChange?.(option.id)} className="gap-2">
            <span aria-hidden className="grid size-7 place-items-center rounded-md bg-muted text-xs font-semibold">
              {option.logo ?? option.name.slice(0, 1)}
            </span>
            <span className="min-w-0">
              <span className="block truncate">{option.name}</span>
              {option.detail ? <span className="block truncate text-xs text-muted-foreground">{option.detail}</span> : null}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
