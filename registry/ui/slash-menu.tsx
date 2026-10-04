"use client"

// Adapted from LocalMode UI (MIT) — apps/ui/registry/localmode/input-controls/slash-command-palette/slash-command-palette.tsx

import * as React from "react"

import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command"
import { cn } from "@/lib/utils"

export type SlashCommand = {
  id: string
  name: string
  description?: string
  category?: string
  icon?: React.ReactNode
}

export type SlashTriggerState = {
  open: boolean
  query: string
  anchorRect: DOMRect | null
  close: () => void
  replaceTrigger: (text: string) => void
}

export function useSlashTrigger(
  ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement | null>,
  options?: { trigger?: string },
) {
  const trigger = options?.trigger ?? "/"
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [anchorRect, setAnchorRect] = React.useState<DOMRect | null>(null)
  const dismissed = React.useRef<string | null>(null)

  const tokenAtCaret = React.useCallback(
    (element: HTMLTextAreaElement | HTMLInputElement) => {
      const cursor = element.selectionStart ?? element.value.length
      const before = element.value.slice(0, cursor)
      const escaped = trigger.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      return before.match(new RegExp(`(?:^|\\s)(${escaped}[^\\s]*)$`))
    },
    [trigger],
  )

  const read = React.useCallback(() => {
    const element = ref.current
    if (!element) return
    const match = tokenAtCaret(element)
    if (!match || !match[1].startsWith(trigger)) {
      dismissed.current = null
      setOpen(false)
      setQuery("")
      return
    }
    if (dismissed.current === match[1]) {
      setOpen(false)
      return
    }
    setOpen(true)
    setQuery(match[1].slice(trigger.length))
    setAnchorRect(element.getBoundingClientRect())
  }, [ref, tokenAtCaret, trigger])

  React.useEffect(() => {
    const element = ref.current
    if (!element) return
    const onInput = () => read()
    element.addEventListener("input", onInput)
    element.addEventListener("click", onInput)
    element.addEventListener("keyup", onInput)
    return () => {
      element.removeEventListener("input", onInput)
      element.removeEventListener("click", onInput)
      element.removeEventListener("keyup", onInput)
    }
  }, [read, ref])

  const close = React.useCallback(() => {
    const element = ref.current
    const match = element ? tokenAtCaret(element) : null
    dismissed.current = match?.[1] ?? ""
    setOpen(false)
  }, [ref, tokenAtCaret])

  const replaceTrigger = React.useCallback(
    (text: string) => {
      const element = ref.current
      if (!element) return
      const cursor = element.selectionStart ?? element.value.length
      const before = element.value.slice(0, cursor)
      const after = element.value.slice(cursor)
      const match = tokenAtCaret(element)
      if (!match || match.index == null) return
      const start = match.index + (match[0].length - match[1].length)
      const next = `${element.value.slice(0, start)}${text}${after}`
      const prototype = Object.getPrototypeOf(element)
      const setter = Object.getOwnPropertyDescriptor(prototype, "value")?.set
      setter?.call(element, next)
      element.dispatchEvent(new Event("input", { bubbles: true }))
      const caret = start + text.length
      element.setSelectionRange(caret, caret)
      setOpen(false)
      setQuery("")
    },
    [ref, tokenAtCaret],
  )

  return { open, query, anchorRect, close, replaceTrigger }
}

export type SlashMenuProps = {
  commands: SlashCommand[]
  open: boolean
  query?: string
  onSelect: (command: SlashCommand) => void
  onDismiss: () => void
  placement?: "input" | "caret"
  inputId?: string
  className?: string
  classNames?: { root?: string; item?: string }
}

export function SlashMenu({ commands, open, query = "", onSelect, onDismiss, inputId, className, classNames }: SlashMenuProps) {
  const listId = React.useId()
  const filtered = React.useMemo(() => {
    const needle = query.trim().toLowerCase()
    if (!needle) return commands
    return commands.filter((command) => `${command.name} ${command.description ?? ""}`.toLowerCase().includes(needle))
  }, [commands, query])
  const queryKey = `${open}:${query}`
  const [activeState, setActiveState] = React.useState({ key: queryKey, index: 0 })
  const active = activeState.key === queryKey ? activeState.index : 0
  const setActive = (update: number | ((current: number) => number)) => {
    setActiveState((current) => {
      const base = current.key === queryKey ? current.index : 0
      const index = typeof update === "function" ? update(base) : update
      return { key: queryKey, index }
    })
  }

  React.useEffect(() => {
    const input = inputId ? document.getElementById(inputId) : null
    if (!input) return
    input.setAttribute("aria-expanded", open ? "true" : "false")
    input.setAttribute("aria-controls", listId)
    input.setAttribute("role", "combobox")
    input.setAttribute("aria-autocomplete", "list")
    if (open && filtered[active]) input.setAttribute("aria-activedescendant", `${listId}-${filtered[active].id}`)
    else input.removeAttribute("aria-activedescendant")
  }, [active, filtered, inputId, listId, open])

  React.useEffect(() => {
    if (!open || !inputId) return
    const input = document.getElementById(inputId)
    if (!input) return
    const onKey = (event: Event) => {
      const key = (event as KeyboardEvent).key
      if (key === "ArrowDown" || key === "ArrowUp") {
        event.preventDefault()
        setActive((current) => {
          if (filtered.length === 0) return 0
          const delta = key === "ArrowDown" ? 1 : -1
          return (current + delta + filtered.length) % filtered.length
        })
      }
      if ((key === "Enter" || key === "Tab") && filtered[active]) {
        event.preventDefault()
        onSelect(filtered[active])
      }
      if (key === "Escape") {
        event.preventDefault()
        onDismiss()
      }
    }
    input.addEventListener("keydown", onKey)
    return () => input.removeEventListener("keydown", onKey)
  }, [active, filtered, inputId, onDismiss, onSelect, open])

  if (!open) return null

  const groups = new Map<string, SlashCommand[]>()
  for (const command of filtered) {
    const key = command.category ?? "Commands"
    groups.set(key, [...(groups.get(key) ?? []), command])
  }

  return (
    <div
      id={listId}
      className={cn("w-full max-w-sm overflow-hidden rounded-lg border border-border bg-popover text-popover-foreground shadow-md", className, classNames?.root)}
    >
      <Command shouldFilter={false} label="Commands">
        <CommandList>
          {filtered.length === 0 ? <CommandEmpty>No commands</CommandEmpty> : null}
          {[...groups.entries()].map(([category, items]) => (
            <CommandGroup key={category} heading={category}>
              {items.map((command) => {
                const index = filtered.findIndex((item) => item.id === command.id)
                const selected = index === active
                return (
                  <CommandItem
                    key={command.id}
                    id={`${listId}-${command.id}`}
                    value={command.id}
                    data-selected={selected ? "true" : undefined}
                    onSelect={() => onSelect(command)}
                    onMouseMove={() => setActive(index)}
                    className={classNames?.item}
                  >
                    {command.icon}
                    <span className="truncate font-medium">/{command.name}</span>
                    {command.description ? <span className="ml-auto max-w-[9rem] truncate text-xs text-muted-foreground">{command.description}</span> : null}
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </Command>
    </div>
  )
}
