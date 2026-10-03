"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command"
import { cn } from "@/lib/utils"

export type CommandPaletteItem = {
  id: string
  label: string
  description?: string
  group?: string
  keywords?: string[]
  icon?: React.ReactNode
  shortcut?: string
}

export type CommandPaletteProps = {
  items: readonly CommandPaletteItem[]
  placeholder?: string
  emptyLabel?: string
  onSelect?: (item: CommandPaletteItem) => void
  label?: string
  className?: string
  classNames?: { input?: string; list?: string; item?: string }
}

export function CommandPalette({
  items,
  placeholder = "Search commands",
  emptyLabel = "No matching commands",
  onSelect,
  label = "Command palette",
  className,
  classNames,
}: CommandPaletteProps) {
  const groups = React.useMemo(() => {
    const order: string[] = []
    const map = new Map<string, CommandPaletteItem[]>()
    for (const item of items) {
      const group = item.group ?? ""
      if (!map.has(group)) {
        map.set(group, [])
        order.push(group)
      }
      map.get(group)?.push(item)
    }
    return order.map((group) => ({ group, items: map.get(group) ?? [] }))
  }, [items])

  return (
    <Command
      data-slot="command-palette"
      label={label}
      className={cn("rounded-xl border border-border bg-popover", className)}
    >
      <CommandInput placeholder={placeholder} aria-label={label} className={classNames?.input} />
      <CommandList className={classNames?.list}>
        <CommandEmpty>{emptyLabel}</CommandEmpty>
        {groups.map(({ group, items: groupItems }) => (
          <CommandGroup key={group || "default"} heading={group || undefined}>
            {groupItems.map((item) => (
              <CommandItem
                key={item.id}
                value={[item.label, item.description, ...(item.keywords ?? [])].filter(Boolean).join(" ")}
                onSelect={() => onSelect?.(item)}
                className={classNames?.item}
              >
                {item.icon}
                <span className="min-w-0 flex-1">
                  <span className="block truncate">{item.label}</span>
                  {item.description ? <span className="block truncate text-xs text-muted-foreground">{item.description}</span> : null}
                </span>
                {item.shortcut ? <CommandShortcut>{item.shortcut}</CommandShortcut> : null}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  )
}
