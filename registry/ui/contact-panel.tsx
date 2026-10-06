"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Separator } from "@/components/ui/separator"
import { deskInitials, type DeskOption, type DeskPresence } from "@/registry/retana/lib/inbox"

export type ContactField = {
  id: string
  label: string
  value: string
  options?: readonly DeskOption[]
  onChange?: (value: string) => void
  readOnly?: boolean
}

export type ContactSection = {
  id: string
  title: string
  defaultOpen?: boolean
  content: React.ReactNode
}

export type ContactPanelClassNames = {
  root?: string
  tabs?: string
  card?: string
  section?: string
}

export type ContactPanelProps = {
  tab?: "details" | "copilot"
  defaultTab?: "details" | "copilot"
  onTabChange?: (tab: "details" | "copilot") => void
  detailsLabel?: string
  copilotLabel?: string
  contactName: string
  presence?: DeskPresence
  presenceLabel?: string
  viewContactLabel?: string
  onViewContact?: () => void
  fields?: readonly ContactField[]
  spamLabel?: string
  onMarkSpam?: () => void
  sections?: readonly ContactSection[]
  copilot?: React.ReactNode
  copilotEmpty?: string
  className?: string
  classNames?: ContactPanelClassNames
}

export function ContactPanel({
  tab: tabProp,
  defaultTab = "details",
  onTabChange,
  detailsLabel = "Details",
  copilotLabel = "Copilot",
  contactName,
  presence,
  presenceLabel,
  viewContactLabel = "View contact",
  onViewContact,
  fields = [],
  spamLabel = "Mark as spam",
  onMarkSpam,
  sections = [],
  copilot,
  copilotEmpty = "Nothing suggested yet.",
  className,
  classNames,
}: ContactPanelProps) {
  const [tabState, setTabState] = React.useState(defaultTab)
  const tab = tabProp ?? tabState
  const detailsId = React.useId()
  const copilotId = React.useId()
  const detailsTab = React.useId()
  const copilotTab = React.useId()

  function setTab(next: "details" | "copilot") {
    if (tabProp === undefined) setTabState(next)
    onTabChange?.(next)
  }

  function onTabKey(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return
    event.preventDefault()
    const next = tab === "details" ? "copilot" : "details"
    setTab(next)
    document.getElementById(next === "details" ? detailsTab : copilotTab)?.focus()
  }

  return (
    <aside
      data-slot="contact-panel"
      data-tab={tab}
      className={cn("flex min-h-0 min-w-0 flex-col bg-background", className, classNames?.root)}
    >
      <div role="tablist" aria-label={detailsLabel} className={cn("flex border-b border-border", classNames?.tabs)}>
        {(
          [
            { id: detailsTab, panel: detailsId, value: "details" as const, label: detailsLabel },
            { id: copilotTab, panel: copilotId, value: "copilot" as const, label: copilotLabel },
          ]
        ).map((item) => {
          const selected = tab === item.value
          return (
            <button
              key={item.value}
              id={item.id}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls={item.panel}
              tabIndex={selected ? 0 : -1}
              className={cn(
                "flex-1 border-b-2 px-3 py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                selected ? "border-foreground text-foreground" : "border-transparent text-muted-foreground",
              )}
              onClick={() => setTab(item.value)}
              onKeyDown={onTabKey}
            >
              {item.label}
            </button>
          )
        })}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        <div id={detailsId} role="tabpanel" aria-labelledby={detailsTab} hidden={tab !== "details"} className="flex flex-col gap-4 p-3">
          <div className={cn("flex items-center gap-3", classNames?.card)}>
            <span className="relative grid size-10 shrink-0 place-items-center rounded-full bg-muted text-xs font-medium text-muted-foreground">
              <span aria-hidden>{deskInitials(contactName)}</span>
              {presence ? (
                <span
                  data-presence={presence}
                  className={cn(
                    "absolute end-0 bottom-0 size-2.5 rounded-full ring-2 ring-background",
                    presence === "online" && "bg-primary",
                    presence === "offline" && "bg-muted-foreground",
                    presence === "away" && "bg-accent-foreground",
                  )}
                />
              ) : null}
            </span>
            <span className="min-w-0">
              <span className="block truncate text-sm font-semibold">{contactName}</span>
              {presenceLabel ? <span className="block text-xs text-muted-foreground">{presenceLabel}</span> : null}
            </span>
          </div>
          {onViewContact ? (
            <Button type="button" variant="outline" size="sm" onClick={onViewContact}>
              {viewContactLabel}
            </Button>
          ) : null}
          <div className="grid gap-3">
            {fields.map((field) => (
              <label key={field.id} className="grid gap-1">
                <span className="text-xs text-muted-foreground">{field.label}</span>
                {field.options && !field.readOnly ? (
                  <select
                    aria-label={field.label}
                    value={field.value}
                    onChange={(event) => field.onChange?.(event.target.value)}
                    className="h-8 rounded-md border border-input bg-background px-2 text-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {field.options.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span className="text-sm wrap-anywhere">{field.value || "—"}</span>
                )}
              </label>
            ))}
          </div>
          {onMarkSpam ? (
            <Button type="button" variant="outline" onClick={onMarkSpam}>
              {spamLabel}
            </Button>
          ) : null}
          {sections.length ? <Separator /> : null}
          {sections.map((section) => (
            <Collapsible key={section.id} defaultOpen={section.defaultOpen} className={classNames?.section}>
              <CollapsibleTrigger className="flex w-full items-center justify-between gap-2 py-1 text-left text-xs font-medium text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none">
                {section.title}
                <ChevronDown className="size-3.5" aria-hidden />
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-2 text-sm">{section.content}</CollapsibleContent>
            </Collapsible>
          ))}
        </div>
        <div id={copilotId} role="tabpanel" aria-labelledby={copilotTab} hidden={tab !== "copilot"} className="flex flex-col gap-3 p-3">
          {copilot ?? <p className="text-sm text-muted-foreground">{copilotEmpty}</p>}
        </div>
      </div>
    </aside>
  )
}
