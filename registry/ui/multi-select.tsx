"use client"

import * as React from "react"
import { Check, ChevronDown, X } from "lucide-react"

import { cn } from "@/lib/utils"

export type MultiSelectOption = {
  value: string
  label: string
  disabled?: boolean
}

export type MultiSelectProps = {
  options: readonly MultiSelectOption[]
  value?: string[]
  defaultValue?: string[]
  onValueChange?: (value: string[]) => void
  onCreate?: (label: string) => void
  creatable?: boolean
  placeholder?: string
  searchPlaceholder?: string
  emptyLabel?: string
  createLabel?: string
  removeLabel?: string
  disabled?: boolean
  className?: string
}

export function MultiSelect({
  options,
  value,
  defaultValue = [],
  onValueChange,
  onCreate,
  creatable = false,
  placeholder = "Select",
  searchPlaceholder = "Search",
  emptyLabel = "No results",
  createLabel = "Create",
  removeLabel = "Remove",
  disabled = false,
  className,
}: MultiSelectProps) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue)
  const [created, setCreated] = React.useState<MultiSelectOption[]>([])
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const listId = React.useId()
  const selected = value ?? uncontrolled
  const allOptions = React.useMemo(() => {
    const known = new Set(options.map((option) => option.value))
    return [...options, ...created.filter((option) => !known.has(option.value))]
  }, [created, options])

  const filtered = allOptions.filter((option) => option.label.toLowerCase().includes(query.trim().toLowerCase()))
  const canCreate =
    creatable &&
    query.trim().length > 0 &&
    !allOptions.some((option) => option.label.toLowerCase() === query.trim().toLowerCase())

  function commit(next: string[]) {
    if (value === undefined) setUncontrolled(next)
    onValueChange?.(next)
  }

  function toggle(optionValue: string) {
    commit(selected.includes(optionValue) ? selected.filter((item) => item !== optionValue) : [...selected, optionValue])
  }

  function create() {
    const label = query.trim()
    if (!label) return
    const option = { value: label.toLowerCase().replace(/\s+/g, "-"), label }
    setCreated((current) => [...current, option])
    onCreate?.(label)
    commit([...selected, option.value])
    setQuery("")
  }

  const rows = filtered.length + (canCreate ? 1 : 0)

  function onKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault()
      setOpen(true)
      setActive((current) => Math.min(rows - 1, current + 1))
    } else if (event.key === "ArrowUp") {
      event.preventDefault()
      setActive((current) => Math.max(0, current - 1))
    } else if (event.key === "Enter") {
      event.preventDefault()
      if (!open) {
        setOpen(true)
        return
      }
      if (canCreate && active === filtered.length) create()
      else if (filtered[active] && !filtered[active].disabled) toggle(filtered[active].value)
    } else if (event.key === "Escape") {
      setOpen(false)
    } else if (event.key === "Backspace" && query === "" && selected.length) {
      commit(selected.slice(0, -1))
    }
  }

  return (
    <div data-slot="multi-select" className={cn("relative", className)}>
      <div
        className={cn(
          "flex min-h-9 flex-wrap items-center gap-1 rounded-lg border border-input bg-transparent px-1.5 py-1 focus-within:ring-2 focus-within:ring-ring",
          disabled && "opacity-50",
        )}
      >
        {selected.map((item) => {
          const option = allOptions.find((entry) => entry.value === item)
          return (
            <span key={item} className="inline-flex items-center gap-1 rounded-md bg-muted px-1.5 py-0.5 text-xs">
              {option?.label ?? item}
              <button
                type="button"
                className="rounded-sm text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                aria-label={`${removeLabel} ${option?.label ?? item}`}
                disabled={disabled}
                onClick={() => toggle(item)}
              >
                <X className="size-3" />
              </button>
            </span>
          )
        })}
        <input
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          disabled={disabled}
          value={query}
          placeholder={selected.length ? searchPlaceholder : placeholder}
          onChange={(event) => {
            setQuery(event.target.value)
            setOpen(true)
            setActive(0)
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          className="h-6 min-w-24 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
        />
        <button
          type="button"
          aria-label={placeholder}
          disabled={disabled}
          className="grid size-6 place-items-center text-muted-foreground"
          onClick={() => setOpen((current) => !current)}
        >
          <ChevronDown className="size-4" />
        </button>
      </div>
      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable
          className="absolute z-20 mt-1 max-h-56 w-full overflow-auto rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
        >
          {filtered.map((option, index) => {
            const isSelected = selected.includes(option.value)
            return (
              <li key={option.value} role="presentation">
                <button
                  type="button"
                  role="option"
                  id={`${listId}-${index}`}
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onMouseEnter={() => setActive(index)}
                  onClick={() => toggle(option.value)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    index === active && "bg-muted",
                    option.disabled && "opacity-40",
                  )}
                >
                  <Check className={cn("size-3.5", isSelected ? "opacity-100" : "opacity-0")} />
                  {option.label}
                </button>
              </li>
            )
          })}
          {canCreate ? (
            <li role="presentation">
              <button
                type="button"
                className={cn(
                  "flex w-full rounded-md px-2 py-1.5 text-left text-sm",
                  active === filtered.length && "bg-muted",
                )}
                onMouseEnter={() => setActive(filtered.length)}
                onClick={create}
              >
                {createLabel} “{query.trim()}”
              </button>
            </li>
          ) : null}
          {!filtered.length && !canCreate ? <li className="px-2 py-1.5 text-sm text-muted-foreground">{emptyLabel}</li> : null}
        </ul>
      ) : null}
    </div>
  )
}
