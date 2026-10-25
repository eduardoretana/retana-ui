"use client"

/**
 * Clean-room rich disclosure card.
 * It is a dialog surface, not a text tooltip, because it can hold actions.
 * Positioning and collision come from the host Hover Card primitive.
 * No theme tokens of its own. Spanish chrome is the default.
 */

import * as React from "react"
import { HoverCard } from "radix-ui"

import { Avatar, AvatarFallback, AvatarGroup, AvatarGroupCount } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type TooltipCardPerson = {
  id: string
  name: string
}

export type TooltipCardMetric = {
  id: string
  label: string
  value: string
  hint?: string
}

export type TooltipCardAction = {
  id: string
  label: string
  onSelect: () => void
  disabled?: boolean
}

export type TooltipCardLabels = {
  people: string
  morePeople: (count: number) => string
  actions: string
}

export const tooltipCardLabels: TooltipCardLabels = {
  people: "Personas",
  morePeople: (count) => `+${count}`,
  actions: "Acciones",
}

export const tooltipCardLabelsEn: TooltipCardLabels = {
  people: "People",
  morePeople: (count) => `+${count}`,
  actions: "Actions",
}

export type TooltipCardClassNames = {
  content?: string
  eyebrow?: string
  title?: string
  description?: string
  people?: string
  metrics?: string
  actions?: string
}

export type TooltipCardProps = {
  children: React.ReactElement
  title: string
  eyebrow?: string
  description?: string
  people?: readonly TooltipCardPerson[]
  metrics?: readonly TooltipCardMetric[]
  actions?: readonly TooltipCardAction[]
  /** Extra nodes inside the card, after the metrics. */
  extra?: React.ReactNode
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  side?: "top" | "right" | "bottom" | "left"
  align?: "start" | "center" | "end"
  openDelay?: number
  closeDelay?: number
  disabled?: boolean
  labels?: Partial<TooltipCardLabels>
  className?: string
  classNames?: TooltipCardClassNames
}

const subscribe = () => () => {}

function useHydrated() {
  return React.useSyncExternalStore(subscribe, () => true, () => false)
}

export function personInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "?"
  const first = parts[0]?.[0] ?? ""
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : ""
  return `${first}${last}`.toLocaleUpperCase("es-MX")
}

function focusables(root: HTMLElement) {
  return [...root.querySelectorAll<HTMLElement>("button:not([disabled]), a[href], input:not([disabled]), textarea:not([disabled]), select:not([disabled])")]
}

export function TooltipCard({
  children,
  title,
  eyebrow,
  description,
  people = [],
  metrics = [],
  actions = [],
  extra,
  open,
  defaultOpen,
  onOpenChange,
  side = "top",
  align = "start",
  openDelay = 80,
  closeDelay = 140,
  disabled = false,
  labels,
  className,
  classNames,
}: TooltipCardProps) {
  const copy = { ...tooltipCardLabels, ...labels }
  const titleId = React.useId()
  const contentId = React.useId()
  const triggerRef = React.useRef<HTMLElement | null>(null)
  const contentRef = React.useRef<HTMLDivElement | null>(null)
  const returnFocus = React.useRef(false)
  const hydrated = useHydrated()
  const described = Boolean(description)

  if (disabled) return children

  function focusTrigger() {
    queueMicrotask(() => triggerRef.current?.focus())
  }

  function handleOpenChange(next: boolean) {
    onOpenChange?.(next)
    if (!next && returnFocus.current) {
      returnFocus.current = false
      focusTrigger()
    }
  }

  function enterCard(event: React.KeyboardEvent) {
    if (event.key !== "Tab" || event.shiftKey) return
    const content = contentRef.current
    if (!content) return
    const first = focusables(content)[0]
    if (!first) return
    event.preventDefault()
    first.focus()
  }

  function cycleCard(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      returnFocus.current = true
      return
    }
    if (event.key !== "Tab") return
    const items = focusables(event.currentTarget)
    if (!items.length) return
    const first = items[0]
    const last = items[items.length - 1]
    if (event.shiftKey && event.target === first) {
      event.preventDefault()
      triggerRef.current?.focus()
    } else if (!event.shiftKey && event.target === last) {
      event.preventDefault()
      triggerRef.current?.focus()
    }
  }

  const visiblePeople = people.slice(0, 4)
  const extraPeople = Math.max(0, people.length - visiblePeople.length)

  return (
    <HoverCard.Root open={open} defaultOpen={defaultOpen} onOpenChange={handleOpenChange} openDelay={openDelay} closeDelay={closeDelay}>
      <HoverCard.Trigger
        asChild
        aria-haspopup="dialog"
        aria-controls={contentId}
        onKeyDown={enterCard}
        ref={(node) => {
          triggerRef.current = node
        }}
      >
        {children}
      </HoverCard.Trigger>
      <HoverCard.Portal>
        <HoverCard.Content
          ref={contentRef}
          id={contentId}
          role="dialog"
          aria-modal={false}
          aria-labelledby={titleId}
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={12}
          onEscapeKeyDown={() => {
            returnFocus.current = true
          }}
          onKeyDown={cycleCard}
          data-slot="tooltip-card"
          data-hydrated={hydrated ? "true" : "false"}
          className={cn(
            "z-50 flex w-72 max-w-[min(20rem,calc(100vw-1.5rem))] flex-col gap-3 rounded-lg border border-border bg-popover p-3 text-popover-foreground shadow-md outline-none",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 motion-reduce:animate-none",
            "focus-visible:ring-3 focus-visible:ring-ring",
            className,
            classNames?.content,
          )}
        >
          <div className="flex min-w-0 flex-col gap-1">
            {eyebrow ? <p className={cn("truncate text-xs text-muted-foreground", classNames?.eyebrow)}>{eyebrow}</p> : null}
            <h2 id={titleId} className={cn("text-sm font-medium break-words [overflow-wrap:anywhere]", classNames?.title)}>
              {title}
            </h2>
            {described ? (
              <p className={cn("text-sm text-muted-foreground break-words whitespace-pre-wrap [overflow-wrap:anywhere]", classNames?.description)}>
                {description}
              </p>
            ) : null}
          </div>
          {people.length ? (
            <div className={cn("flex min-w-0 items-center gap-2", classNames?.people)}>
              <AvatarGroup role="group" aria-label={copy.people}>
                {visiblePeople.map((person) => (
                  <Avatar key={person.id} size="sm">
                    <AvatarFallback>{personInitials(person.name)}</AvatarFallback>
                  </Avatar>
                ))}
                {extraPeople > 0 ? <AvatarGroupCount>{copy.morePeople(extraPeople)}</AvatarGroupCount> : null}
              </AvatarGroup>
              <p className="min-w-0 truncate text-xs text-muted-foreground">{people.map((person) => person.name).join(", ")}</p>
            </div>
          ) : null}
          {metrics.length ? (
            <dl className={cn("grid grid-cols-2 gap-2", classNames?.metrics)}>
              {metrics.map((metric) => (
                <div key={metric.id} className="min-w-0">
                  <dt className="truncate text-xs text-muted-foreground">{metric.label}</dt>
                  <dd className="truncate text-sm font-medium tabular-nums">{metric.value}</dd>
                  {metric.hint ? <p className="truncate text-xs text-muted-foreground">{metric.hint}</p> : null}
                </div>
              ))}
            </dl>
          ) : null}
          {actions.length ? (
            <div className={cn("flex flex-wrap gap-2", classNames?.actions)} role="group" aria-label={copy.actions}>
              {actions.map((action) => (
                <Button key={action.id} type="button" size="sm" variant="outline" disabled={action.disabled} onClick={action.onSelect}>
                  {action.label}
                </Button>
              ))}
            </div>
          ) : null}
          {extra}
        </HoverCard.Content>
      </HoverCard.Portal>
    </HoverCard.Root>
  )
}
