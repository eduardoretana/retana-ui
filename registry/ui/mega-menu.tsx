"use client"

/* eslint-disable react-hooks/immutability -- Hover timers live in a stable object updated from events, not during render. */

/**
 * Clean-room behavior. Visual inspiration only — no premium source,
 * class names, colors, images, or icons were copied.
 */

import * as React from "react"
import { ArrowRight, ChevronDown } from "lucide-react"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

export type MegaMenuLink = {
  id: string
  label: string
  href: string
  icon?: React.ReactNode
  description?: string
}

export type MegaMenuColumn = {
  id: string
  title: string
  icon?: React.ReactNode
  items: MegaMenuLink[]
  viewAll?: { label: string; href: string }
}

export type MegaMenuFeatured = {
  title: string
  description?: string
  href?: string
  cta?: { label: string; href: string }
  media?: React.ReactNode
}

export type MegaMenuPanel = {
  featured?: MegaMenuFeatured
  columns?: MegaMenuColumn[]
  highlights?: MegaMenuLink[]
  highlightsLabel?: string
}

export type MegaMenuItem = {
  id: string
  label: string
  href?: string
  badge?: string
  panel?: MegaMenuPanel
}

export type MegaMenuRenderLink = (props: {
  href: string
  className?: string
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLElement>
}) => React.ReactElement

export type MegaMenuProps = {
  items: MegaMenuItem[]
  /** Accessible name of the navigation landmark. */
  label?: string
  openOn?: "hover" | "click"
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string | null) => void
  renderLink?: MegaMenuRenderLink
  /** auto follows the nav width. wide and narrow are for tests and fixed frames. */
  layout?: "auto" | "wide" | "narrow"
  openDelayMs?: number
  closeDelayMs?: number
  className?: string
}

const NARROW_BELOW = 768

function useNarrow(ref: React.RefObject<HTMLElement | null>, layout: "auto" | "wide" | "narrow") {
  const [measured, setMeasured] = React.useState(false)
  React.useLayoutEffect(() => {
    if (layout !== "auto") return
    const element = ref.current
    if (!element) return
    const read = () => {
      const width = element.getBoundingClientRect().width
      setMeasured(width > 0 && width < NARROW_BELOW)
    }
    read()
    const observer = new ResizeObserver(read)
    observer.observe(element)
    return () => observer.disconnect()
  }, [layout, ref])
  if (layout === "narrow") return true
  if (layout === "wide") return false
  return measured
}

export function MegaMenu({
  items,
  label = "Main",
  openOn = "hover",
  value,
  defaultValue = null,
  onValueChange,
  renderLink,
  layout = "auto",
  openDelayMs = 120,
  closeDelayMs = 200,
  className,
}: MegaMenuProps) {
  const rootRef = React.useRef<HTMLElement>(null)
  const timers = React.useState(() => ({
    open: null as number | null,
    close: null as number | null,
    pending: null as string | null,
  }))[0]
  const narrow = useNarrow(rootRef, layout)
  const [internal, setInternal] = React.useState<string | null>(defaultValue)
  const openId = value !== undefined ? value : internal
  const uid = React.useId()
  const openItem = items.find((item) => item.id === openId && item.panel) ?? null

  const setOpen = React.useCallback(
    (next: string | null) => {
      if (value === undefined) setInternal(next)
      onValueChange?.(next)
    },
    [onValueChange, value],
  )

  const clearTimers = React.useCallback(() => {
    if (timers.open != null) window.clearTimeout(timers.open)
    if (timers.close != null) window.clearTimeout(timers.close)
    timers.open = null
    timers.close = null
  }, [timers])

  React.useEffect(() => clearTimers, [clearTimers])

  React.useEffect(() => {
    const id = timers.pending
    if (!id || id !== openId) return
    timers.pending = null
    document.getElementById(`${uid}-${id}-panel`)?.querySelector<HTMLElement>("a, button")?.focus()
  }, [openId, timers, uid])

  function scheduleOpen(id: string) {
    if (timers.close != null) window.clearTimeout(timers.close)
    if (timers.open != null) window.clearTimeout(timers.open)
    if (openDelayMs <= 0) {
      setOpen(id)
      return
    }
    timers.open = window.setTimeout(() => setOpen(id), openDelayMs)
  }

  function scheduleClose() {
    if (timers.open != null) window.clearTimeout(timers.open)
    if (timers.close != null) window.clearTimeout(timers.close)
    if (closeDelayMs <= 0) {
      setOpen(null)
      return
    }
    timers.close = window.setTimeout(() => setOpen(null), closeDelayMs)
  }

  function toggle(id: string) {
    clearTimers()
    setOpen(openId === id ? null : id)
  }

  function focusTrigger(id: string) {
    document.getElementById(`${uid}-trigger-${id}`)?.focus()
  }

  function moveTrigger(current: string, direction: 1 | -1 | "start" | "end") {
    const index = items.findIndex((item) => item.id === current)
    const nextIndex =
      direction === "start" ? 0 : direction === "end" ? items.length - 1 : (index + direction + items.length) % items.length
    const next = items[nextIndex]
    if (!next) return
    focusTrigger(next.id)
    if (openOn === "hover" && openId && next.panel) scheduleOpen(next.id)
    if (openOn === "hover" && openId && !next.panel) scheduleClose()
  }

  function onBarKeyDown(event: React.KeyboardEvent<HTMLElement>, item: MegaMenuItem) {
    if (event.key === "ArrowRight") {
      event.preventDefault()
      moveTrigger(item.id, 1)
      return
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      moveTrigger(item.id, -1)
      return
    }
    if (event.key === "Home") {
      event.preventDefault()
      moveTrigger(item.id, "start")
      return
    }
    if (event.key === "End") {
      event.preventDefault()
      moveTrigger(item.id, "end")
      return
    }
    if (event.key === "ArrowDown" && item.panel) {
      event.preventDefault()
      clearTimers()
      timers.pending = item.id
      setOpen(item.id)
    }
  }

  function onNavKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    if (event.key !== "Escape" || !openId) return
    event.preventDefault()
    clearTimers()
    const returnId = openId
    setOpen(null)
    focusTrigger(returnId)
  }

  React.useEffect(() => {
    if (!openId) return
    function onPointerDown(event: PointerEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        clearTimers()
        setOpen(null)
      }
    }
    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [clearTimers, openId, setOpen])

  function link(props: {
    href: string
    className?: string
    children: React.ReactNode
    onClick?: React.MouseEventHandler<HTMLElement>
    onKeyDown?: React.KeyboardEventHandler<HTMLElement>
    itemId?: string
  }) {
    const triggerId = props.itemId ? `${uid}-trigger-${props.itemId}` : undefined
    if (renderLink) {
      return React.cloneElement(
        renderLink(props) as React.ReactElement<{
          onKeyDown?: React.KeyboardEventHandler<HTMLElement>
          id?: string
          "data-mega-trigger"?: string
        }>,
        {
          onKeyDown: props.onKeyDown,
          id: triggerId,
          "data-mega-trigger": props.itemId ? "" : undefined,
        },
      )
    }
    return (
      <a
        href={props.href}
        id={triggerId}
        className={props.className}
        data-mega-trigger={props.itemId ? "" : undefined}
        onClick={props.onClick}
        onKeyDown={props.onKeyDown}
      >
        {props.children}
      </a>
    )
  }

  const barClass =
    "inline-flex h-10 max-w-full min-w-0 items-center gap-1.5 rounded-md px-3 text-sm font-medium text-foreground outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"

  return (
    <nav
      ref={rootRef}
      aria-label={label}
      data-slot="mega-menu"
      data-layout={narrow ? "narrow" : "wide"}
      className={cn("relative min-w-0", className)}
      onKeyDown={onNavKeyDown}
      onMouseEnter={() => {
        if (openOn === "hover" && timers.close != null) window.clearTimeout(timers.close)
      }}
      onMouseLeave={() => {
        if (openOn === "hover" && openId) scheduleClose()
      }}
      onBlur={(event) => {
        const next = event.relatedTarget as Node | null
        if (!next || rootRef.current?.contains(next)) return
        clearTimers()
        setOpen(null)
      }}
    >
      <ul className={cn("flex min-w-0 items-center gap-1", narrow && "flex-col items-stretch")}>
        {items.map((item) => {
          const controls = item.panel ? `${uid}-${item.id}-panel` : undefined
          const expanded = Boolean(item.panel && openId === item.id)
          return (
            <li
              key={item.id}
              className={cn("min-w-0", narrow && "w-full border-b border-border last:border-b-0")}
              onMouseEnter={() => {
                if (openOn !== "hover") return
                if (item.panel) scheduleOpen(item.id)
                else if (openId) scheduleClose()
              }}
            >
              {item.panel ? (
                <button
                  type="button"
                  id={`${uid}-trigger-${item.id}`}
                  data-mega-trigger=""
                  className={cn(barClass, "justify-between", expanded && "bg-accent", narrow ? "w-full" : "w-auto")}
                  aria-expanded={expanded}
                  aria-controls={controls}
                  onClick={() => toggle(item.id)}
                  onKeyDown={(event) => onBarKeyDown(event, item)}
                >
                  <span className="inline-flex min-w-0 items-center gap-1.5">
                    <span className="truncate">{item.label}</span>
                    {item.badge ? <Badge variant="secondary">{item.badge}</Badge> : null}
                  </span>
                  <ChevronDown
                    className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none", expanded && "rotate-180")}
                    aria-hidden="true"
                  />
                </button>
              ) : item.href ? (
                link({
                  href: item.href,
                  itemId: item.id,
                  className: cn(barClass, narrow && "w-full justify-between"),
                  onClick: () => setOpen(null),
                  onKeyDown: (event) => onBarKeyDown(event, item),
                  children: (
                    <>
                      <span className="truncate">{item.label}</span>
                      {item.badge ? <Badge variant="secondary">{item.badge}</Badge> : null}
                    </>
                  ),
                })
              ) : null}
              {narrow && expanded && item.panel ? (
                <div className="px-2 pb-3">
                  <PanelBody id={controls ?? ""} label={item.label} panel={item.panel} link={link} onNavigate={() => setOpen(null)} />
                </div>
              ) : null}
            </li>
          )
        })}
      </ul>
      {!narrow && openItem?.panel ? (
        <div className="absolute inset-x-0 top-full z-40 pt-2">
          <PanelBody
            id={`${uid}-${openItem.id}-panel`}
            label={openItem.label}
            panel={openItem.panel}
            link={link}
            onNavigate={() => setOpen(null)}
            floating
          />
        </div>
      ) : null}
    </nav>
  )
}

type MenuLink = (props: {
  href: string
  className?: string
  children: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLElement>
}) => React.ReactElement

function PanelBody({
  id,
  label,
  panel,
  link,
  onNavigate,
  floating = false,
}: {
  id: string
  label: string
  panel: MegaMenuPanel
  link: MenuLink
  onNavigate: () => void
  floating?: boolean
}) {
  return (
    <div
      id={id}
      role="region"
      aria-label={label}
      data-state="open"
      className={cn(
        "@container rounded-xl bg-popover p-4 text-popover-foreground shadow-lg ring-1 ring-foreground/10",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:duration-300 motion-safe:data-[state=open]:slide-in-from-top-2 motion-reduce:animate-none",
        !floating && "shadow-none ring-0 px-0",
      )}
    >
      <div className="grid gap-5 @min-[48rem]:grid-cols-[minmax(12rem,0.9fr)_minmax(0,1.6fr)_minmax(10rem,0.8fr)]">
        {panel.featured ? <Featured featured={panel.featured} link={link} onNavigate={onNavigate} /> : null}
        {panel.columns?.length ? (
          <div className="grid gap-5 @min-[36rem]:grid-cols-3">
            {panel.columns.map((column) => (
              <section key={column.id} aria-label={column.title} className="min-w-0">
                <h3 className="flex items-center gap-2 text-sm font-semibold">
                  {column.icon ? <span aria-hidden="true">{column.icon}</span> : null}
                  <span className="truncate">{column.title}</span>
                </h3>
                <Separator className="my-2" />
                <ul className="flex flex-col">
                  {column.items.map((item) => (
                    <li key={item.id}>
                      {link({
                        href: item.href,
                        onClick: onNavigate,
                        className:
                          "flex min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-primary focus-visible:bg-accent focus-visible:text-primary focus-visible:outline-none",
                        children: (
                          <>
                            {item.icon ? <span aria-hidden="true">{item.icon}</span> : null}
                            <span className="truncate">{item.label}</span>
                          </>
                        ),
                      })}
                    </li>
                  ))}
                </ul>
                {column.viewAll ? (
                  <div className="mt-2 px-2">
                    {link({
                      href: column.viewAll.href,
                      onClick: onNavigate,
                      className: "inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline",
                      children: (
                        <>
                          {column.viewAll.label}
                          <ArrowRight className="size-3.5 rtl:rotate-180" aria-hidden="true" />
                        </>
                      ),
                    })}
                  </div>
                ) : null}
              </section>
            ))}
          </div>
        ) : null}
        {panel.highlights?.length ? (
          <section aria-label={panel.highlightsLabel ?? "Highlights"} className="flex min-w-0 flex-col gap-1">
            {panel.highlightsLabel ? <h3 className="px-2 text-sm font-semibold">{panel.highlightsLabel}</h3> : null}
            <ul className="flex flex-col">
              {panel.highlights.map((item) => (
                <li key={item.id}>
                  {link({
                    href: item.href,
                    onClick: onNavigate,
                    className: "flex min-w-0 items-start gap-3 rounded-md p-2 hover:bg-accent focus-visible:bg-accent focus-visible:outline-none",
                    children: (
                      <>
                        <span className="grid size-9 shrink-0 place-items-center rounded-md bg-muted text-foreground" aria-hidden="true">
                          {item.icon}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-medium">{item.label}</span>
                          {item.description ? <span className="block text-xs text-pretty text-muted-foreground">{item.description}</span> : null}
                        </span>
                      </>
                    ),
                  })}
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </div>
  )
}

function Featured({
  featured,
  link,
  onNavigate,
}: {
  featured: MegaMenuFeatured
  link: MenuLink
  onNavigate: () => void
}) {
  return (
    <div className="flex min-w-0 flex-col justify-between gap-4 rounded-xl bg-primary p-4 text-primary-foreground">
      <div className="flex flex-col gap-3">
        {featured.media ? <div aria-hidden="true">{featured.media}</div> : null}
        <div className="min-w-0">
          <p className="text-base font-semibold text-pretty">{featured.title}</p>
          {featured.description ? <p className="mt-1 text-sm text-pretty text-primary-foreground/80">{featured.description}</p> : null}
        </div>
      </div>
      {featured.cta ? (
        link({
          href: featured.cta.href,
          onClick: onNavigate,
          className:
            "inline-flex h-9 w-fit max-w-full items-center gap-1.5 rounded-lg bg-background px-3 text-sm font-medium text-foreground hover:bg-background/90",
          children: (
            <>
              <span className="truncate">{featured.cta.label}</span>
              <ArrowRight className="size-4 shrink-0 rtl:rotate-180" aria-hidden="true" />
            </>
          ),
        })
      ) : null}
    </div>
  )
}
