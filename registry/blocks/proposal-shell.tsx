"use client"

/** Clean-room proposal app shell. Groups, header, and command menu are props. */

import * as React from "react"
import { Bell, Search } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"
import { RailSidebar, type RailSection, type RailUser, type RailWorkspace } from "@/registry/retana/blocks/rail-sidebar"
import { CommandPalette, type CommandPaletteItem } from "@/registry/retana/ui/command-palette"
import { AvatarGroup, type AvatarGroupMember } from "@/registry/retana/ui/avatar-group"
import { ProposalMotionDialog } from "@/registry/retana/ui/proposal-dialog"

export type ProposalPeriod = {
  value: string
  label: string
}

export type ProposalShellProps = {
  sections: readonly RailSection[]
  activeHref?: string
  section?: string
  defaultSection?: string
  onSectionChange?: (id: string) => void
  onNavigate?: (href: string) => void
  workspace?: RailWorkspace
  user?: RailUser
  people?: readonly AvatarGroupMember[]
  peopleLabel?: string
  periods: readonly ProposalPeriod[]
  period: string
  onPeriodChange?: (value: string) => void
  periodLabel?: string
  primaryLabel: string
  onPrimary?: () => void
  primaryDisabled?: boolean
  unread?: number
  bellLabel?: string
  onBell?: () => void
  searchLabel?: string
  commandBadge?: string
  commandItems: readonly CommandPaletteItem[]
  commandTitle?: string
  commandPlaceholder?: string
  commandEmpty?: string
  onCommand?: (item: CommandPaletteItem) => void
  contained?: boolean
  heading?: React.ReactNode
  titleAside?: React.ReactNode
  navStyle?: "row" | "pill"
  panelFooter?: React.ReactNode
  className?: string
  children?: React.ReactNode
}

export function ProposalShell({
  sections,
  activeHref,
  section,
  defaultSection,
  onSectionChange,
  onNavigate,
  workspace,
  user,
  people = [],
  peopleLabel = "People on this workspace",
  periods,
  period,
  onPeriodChange,
  periodLabel = "Period",
  primaryLabel,
  onPrimary,
  primaryDisabled,
  unread = 0,
  bellLabel = "Notifications",
  onBell,
  searchLabel = "Search",
  commandBadge = "⌘K",
  commandItems,
  commandTitle = "Commands",
  commandPlaceholder = "Search commands",
  commandEmpty = "No matching commands",
  onCommand,
  contained = false,
  heading,
  titleAside,
  navStyle = "row",
  panelFooter,
  className,
  children,
}: ProposalShellProps) {
  const [commandOpen, setCommandOpen] = React.useState(false)
  const current = periods.find((item) => item.value === period) ?? periods[0]

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault()
        setCommandOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const frame = (
    <>
      <div data-slot="proposal-shell" className="flex min-h-full min-w-0 flex-col">
        <header className="flex flex-wrap items-center gap-2 border-b border-border px-3 py-2 sm:px-4">
          {heading ? <div className="flex min-w-0 items-center gap-2">{heading}{titleAside}</div> : null}
          <Button
            type="button"
            variant="outline"
            className="h-8 min-w-0 flex-1 justify-start gap-2 px-2 font-normal text-muted-foreground sm:max-w-xs"
            onClick={() => setCommandOpen(true)}
          >
            <Search />
            <span className="truncate">{searchLabel}</span>
            <kbd className="ms-auto hidden rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline">
              {commandBadge}
            </kbd>
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="relative"
            aria-label={unread > 0 ? `${bellLabel}, ${unread}` : bellLabel}
            onClick={onBell}
          >
            <Bell />
            {unread > 0 ? (
              <span data-slot="proposal-unread" className="absolute top-1 right-1 size-2 rounded-full bg-destructive" />
            ) : null}
          </Button>
          {people.length > 0 ? <AvatarGroup members={[...people]} max={3} size="sm" label={peopleLabel} /> : null}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="max-w-36">
                <span className="truncate">{current?.label ?? periodLabel}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{periodLabel}</DropdownMenuLabel>
              {periods.map((item) => (
                <DropdownMenuItem key={item.value} onSelect={() => onPeriodChange?.(item.value)}>
                  {item.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button type="button" size="sm" className="ms-auto" disabled={primaryDisabled} onClick={onPrimary}>
            <span className="truncate">{primaryLabel}</span>
          </Button>
        </header>
        <div className="min-w-0 flex-1 p-3 sm:p-4">{children}</div>
      </div>
      <ProposalMotionDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title={commandTitle}
        className="w-[min(100%-2rem,28rem)]"
      >
        <CommandPalette
          items={commandItems}
          label={commandTitle}
          placeholder={commandPlaceholder}
          emptyLabel={commandEmpty}
          onSelect={(item) => {
            onCommand?.(item)
            setCommandOpen(false)
          }}
        />
      </ProposalMotionDialog>
    </>
  )

  const rail = {
    sections,
    activeHref,
    value: section,
    defaultValue: defaultSection ?? sections[0]?.id,
    onValueChange: onSectionChange,
    onNavigate,
    workspace,
    user,
    itemStyle: navStyle,
    panelFooter,
  }

  if (contained) {
    return (
      <div className={cn("flex h-full min-h-0 overflow-hidden rounded-xl border border-border bg-background", className)}>
        <div className="w-64 shrink-0">
          <RailSidebar {...rail} contained className="h-full rounded-none border-0" />
        </div>
        <div className="min-w-0 flex-1 overflow-auto">{frame}</div>
      </div>
    )
  }

  return (
    <RailSidebar {...rail} className={className} insetClassName="min-w-0">
      {frame}
    </RailSidebar>
  )
}
