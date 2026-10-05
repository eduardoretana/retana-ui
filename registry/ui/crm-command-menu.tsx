"use client"

/**
 * Clean-room company command menu. Behavior is inspired by an unlicensed reference.
 * No source, class names, copy, or assets were copied.
 * command-palette is the grouped command list. This one searches companies.
 */

import * as React from "react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import { companySearchText, crmInitials, type CrmCompany, type CrmStatusTone } from "@/registry/retana/lib/crm-companies"

export type CrmCommandAction = {
  id: string
  label: string
  keywords?: string
  shortcut?: string
}

export type CrmCommandMenuLabels = {
  label?: string
  description?: string
  placeholder?: string
  empty?: string
  companies?: string
  actions?: string
  results?: (count: number) => string
}

export type CrmCommandMenuProps = {
  companies: readonly CrmCompany[]
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  onSelectCompany?: (company: CrmCompany) => void
  actions?: readonly CrmCommandAction[]
  onSelectAction?: (action: CrmCommandAction) => void
  /** Listen for Cmd-K or Ctrl-K. Turn this off when the sidebar already does. */
  hotkey?: boolean
  formatValue?: (value: number) => string
  labels?: CrmCommandMenuLabels
  className?: string
}

const TONE_VARIANT: Record<CrmStatusTone, "default" | "secondary" | "outline" | "destructive"> = {
  emphasis: "default",
  neutral: "secondary",
  muted: "outline",
  danger: "destructive",
}

function useControllable(value: boolean | undefined, defaultValue: boolean, onChange?: (next: boolean) => void) {
  const [internal, setInternal] = React.useState(defaultValue)
  const current = value ?? internal
  const set = React.useCallback(
    (next: boolean) => {
      if (value === undefined) setInternal(next)
      onChange?.(next)
    },
    [onChange, value],
  )
  return [current, set] as const
}

export function CrmCommandMenu({
  companies,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  onSelectCompany,
  actions = [],
  onSelectAction,
  hotkey = true,
  formatValue = (value) => new Intl.NumberFormat(undefined, { maximumFractionDigits: 0 }).format(value),
  labels,
  className,
}: CrmCommandMenuProps) {
  const [open, setOpen] = useControllable(openProp, defaultOpen, onOpenChange)
  const [query, setQuery] = React.useState("")
  const copy = {
    label: labels?.label ?? "Search companies",
    description: labels?.description ?? "Find a company or run a command",
    placeholder: labels?.placeholder ?? "Search companies",
    empty: labels?.empty ?? "No matching companies",
    companies: labels?.companies ?? "Companies",
    actions: labels?.actions ?? "Actions",
  }
  const needle = query.trim().toLocaleLowerCase()
  const matches = React.useMemo(() => {
    const filtered = needle ? companies.filter((company) => companySearchText(company).includes(needle)) : companies
    return filtered.slice(0, 20)
  }, [companies, needle])

  React.useEffect(() => {
    if (!hotkey) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      setOpen(!open)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [hotkey, open, setOpen])

  function changeOpen(next: boolean) {
    if (!next) setQuery("")
    setOpen(next)
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={changeOpen}
      title={copy.label}
      description={copy.description}
      className={cn("sm:max-w-lg", className)}
    >
      <Command shouldFilter={false} label={copy.label} data-slot="crm-command-menu">
        <CommandInput placeholder={copy.placeholder} value={query} onValueChange={setQuery} aria-label={copy.label} />
        <CommandList>
          <CommandEmpty>{copy.empty}</CommandEmpty>
          {actions.length > 0 ? (
            <CommandGroup heading={copy.actions}>
              {actions.map((action) => (
                <CommandItem
                  key={action.id}
                  value={action.id}
                  onSelect={() => {
                    onSelectAction?.(action)
                    changeOpen(false)
                  }}
                >
                  <span className="min-w-0 flex-1 truncate">{action.label}</span>
                  {action.shortcut ? <span className="text-xs text-muted-foreground">{action.shortcut}</span> : null}
                </CommandItem>
              ))}
            </CommandGroup>
          ) : null}
          {actions.length > 0 && matches.length > 0 ? <CommandSeparator /> : null}
          {matches.length > 0 ? (
            <CommandGroup heading={labels?.results?.(matches.length) ?? copy.companies}>
              <div className="sr-only" role="row">
                <span>Name</span>
                <span>Status</span>
                <span>Owner</span>
                <span>Pipeline</span>
              </div>
              {matches.map((company) => {
                const value = formatValue(company.pipelineValue)
                return (
                  <CommandItem
                    key={company.id}
                    value={company.id}
                    onSelect={() => {
                      onSelectCompany?.(company)
                      changeOpen(false)
                    }}
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                      <span className="flex min-w-0 items-center gap-2">
                        <Avatar size="sm">
                          {company.logoUrl ? <AvatarImage src={company.logoUrl} alt="" /> : null}
                          <AvatarFallback>{crmInitials(company.name)}</AvatarFallback>
                        </Avatar>
                        <span className="min-w-0 truncate font-medium">{company.name}</span>
                        <Badge variant={TONE_VARIANT[company.statusTone ?? "neutral"]} className="ms-auto">
                          {company.statusLabel}
                        </Badge>
                      </span>
                      <span className="flex min-w-0 items-center gap-2 ps-8 text-xs text-muted-foreground">
                        <span className="min-w-0 truncate">{company.owner}</span>
                        <span className="ms-auto shrink-0 tabular-nums text-foreground">{value}</span>
                      </span>
                      <span className="sr-only">
                        {company.name}, {company.statusLabel}, {company.owner}, {value}
                      </span>
                    </span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ) : null}
        </CommandList>
      </Command>
    </CommandDialog>
  )
}
