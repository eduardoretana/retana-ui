"use client"

/** Adapted from Arc UI (MIT). */

import { forwardRef, useCallback, useEffect, useId, useRef, useState } from "react"
import type { ButtonHTMLAttributes, HTMLAttributes, KeyboardEvent as ReactKeyboardEvent, MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent, ReactNode, Ref, RefObject } from "react"
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react"
import { ArrowRight, BookOpen, Boxes, ChevronDown, History, LayoutTemplate, Menu, MessagesSquare, Route, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type SiteHeaderVariant = "simple" | "centered" | "mega"

export type SiteHeaderLink = {
  label: string
  description?: string
  icon?: ReactNode
  href?: string
}

export type SiteHeaderFeature = {
  title: string
  description?: string
  href?: string
  image?: { src: string; alt: string }
}

export type SiteHeaderItem = {
  value: string
  label: string
  href?: string
  links?: SiteHeaderLink[]
  feature?: SiteHeaderFeature
}

export type SiteHeaderAction = {
  label: string
  href?: string
  onClick?: () => void
}

export type SiteHeaderDestination = {
  label: string
  href?: string
  section?: string
}

export type SiteHeaderClassNames = {
  root?: string
  bar?: string
  nav?: string
  panel?: string
  sheet?: string
  actions?: string
}

export type SiteHeaderProps = {
  variant?: SiteHeaderVariant
  brand?: { name: string; href?: string; mark?: ReactNode }
  items?: SiteHeaderItem[]
  current?: string
  defaultCurrent?: string
  onCurrentChange?: (value: string) => void
  onNavigate?: (destination: SiteHeaderDestination) => void
  secondaryAction?: SiteHeaderAction | null
  primaryAction?: SiteHeaderAction | null
  sticky?: boolean
  scrollContainer?: RefObject<HTMLElement | null>
  scrollThreshold?: number
  label?: string
  className?: string
  classNames?: SiteHeaderClassNames
}

const ICON = { size: 18, strokeWidth: 1.75, "aria-hidden": true } as const
const HOVER_INTENT = 70
const LEAVE_GRACE = 180

export const siteHeaderExampleItems: SiteHeaderItem[] = [
  {
    value: "work",
    label: "Work",
    links: [
      { label: "Bowls", description: "Daily stoneware and serving pieces", icon: <Boxes {...ICON} /> },
      { label: "Sets", description: "Dinner sets for the gallery", icon: <LayoutTemplate {...ICON} /> },
      { label: "Archive", description: "Past firings and sold work", icon: <History {...ICON} /> },
      { label: "Workshops", description: "Saturday benches in the studio", icon: <BookOpen {...ICON} /> },
    ],
    feature: { title: "Friday firing", description: "Kiln 2 is loaded with the new glaze." },
  },
  {
    value: "visit",
    label: "Visit",
    links: [
      { label: "Studio", description: "By appointment", icon: <Route {...ICON} /> },
      { label: "Gallery", description: "What is on the shelves", icon: <LayoutTemplate {...ICON} /> },
      { label: "Notes", description: "From the bench", icon: <MessagesSquare {...ICON} /> },
      { label: "Shipping", description: "How pieces travel", icon: <Boxes {...ICON} /> },
    ],
  },
  { value: "kiln", label: "Kiln" },
  { value: "journal", label: "Journal" },
]

function assignRef<T>(ref: Ref<T> | undefined, node: T | null) {
  if (typeof ref === "function") ref(node)
  else if (ref) ref.current = node
}

function useScrolled(threshold: number, container?: RefObject<HTMLElement | null>) {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    const node = container?.current ?? null
    const target: HTMLElement | Window = node ?? window
    const read = () => (node ? node.scrollTop : window.scrollY)
    const update = () => {
      const y = read()
      setScrolled((previous) => (previous ? y > threshold / 2 : y > threshold))
    }
    update()
    target.addEventListener("scroll", update, { passive: true })
    return () => target.removeEventListener("scroll", update)
  }, [threshold, container])
  return scrolled
}

function Destination({
  link,
  onChoose,
  children,
  ...rest
}: Omit<HTMLAttributes<HTMLElement>, "onClick" | "children"> & {
  link: { href?: string; label: string }
  onChoose: (event: ReactMouseEvent) => void
  children: ReactNode
}) {
  if (link.href) {
    return <a {...rest} href={link.href} onClick={onChoose}>{children}</a>
  }
  return <button {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)} type="button" onClick={onChoose}>{children}</button>
}

/**
 * A site header that sticks to the top, turns solid after a short scroll, opens mega-menu panels,
 * and folds into a menu sheet on narrow layouts.
 */
export const SiteHeader = forwardRef<HTMLElement, SiteHeaderProps>(function SiteHeader({
  variant = "mega",
  brand = { name: "Studio" },
  items = siteHeaderExampleItems,
  current: currentProp,
  defaultCurrent,
  onCurrentChange,
  onNavigate,
  secondaryAction = { label: "Sign in" },
  primaryAction = { label: "Book a visit" },
  sticky = true,
  scrollContainer,
  scrollThreshold = 8,
  label = "Main",
  className,
  classNames,
}, ref) {
  const id = useId()
  const reduced = useReducedMotion() ?? false
  const scrolled = useScrolled(scrollThreshold, scrollContainer)
  const [innerCurrent, setInnerCurrent] = useState(defaultCurrent)
  const current = currentProp ?? innerCurrent
  const [hovered, setHovered] = useState<string | null>(null)
  const [open, setOpen] = useState<{ value: string; direction: number } | null>(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const [expanded, setExpanded] = useState<string | null>(null)
  const rootRef = useRef<HTMLElement | null>(null)
  const menuButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRefs = useRef(new Map<string, HTMLButtonElement | HTMLAnchorElement>())
  const panelRef = useRef<HTMLDivElement>(null)
  const openTimer = useRef<number | undefined>(undefined)
  const closeTimer = useRef<number | undefined>(undefined)
  const focusFirst = useRef(false)
  const hasPanels = variant === "mega"
  const openItem = open ? items.find((item) => item.value === open.value) : undefined
  const solid = scrolled || menuOpen || !!open

  const setRefs = useCallback((node: HTMLElement | null) => {
    rootRef.current = node
    assignRef(ref, node)
  }, [ref])

  const clearTimers = useCallback(() => {
    window.clearTimeout(openTimer.current)
    window.clearTimeout(closeTimer.current)
  }, [])

  useEffect(() => clearTimers, [clearTimers])

  useEffect(() => {
    const node = rootRef.current
    if (!node || typeof ResizeObserver === "undefined") return
    const observer = new ResizeObserver(([entry]) => {
      const width = entry.contentRect.width
      if (!width) return
      if (width >= 760) {
        setMenuOpen(false)
        setExpanded(null)
      } else setOpen(null)
    })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const openPanel = useCallback((value: string | null) => {
    setOpen((previous) => {
      if (!value) return null
      if (previous?.value === value) return previous
      const from = previous ? items.findIndex((item) => item.value === previous.value) : -1
      const to = items.findIndex((item) => item.value === value)
      return { value, direction: from < 0 ? 0 : Math.sign(to - from) }
    })
  }, [items])

  const close = useCallback((restoreFocus = false) => {
    clearTimers()
    setOpen((previous) => {
      if (restoreFocus && previous) triggerRefs.current.get(previous.value)?.focus()
      return null
    })
  }, [clearTimers])

  const closeMenu = useCallback((restoreFocus = false) => {
    setMenuOpen(false)
    setExpanded(null)
    if (restoreFocus) menuButtonRef.current?.focus()
  }, [])

  const choose = useCallback((destination: SiteHeaderDestination, section: string | undefined) => {
    if (section) {
      if (currentProp === undefined) setInnerCurrent(section)
      onCurrentChange?.(section)
    }
    onNavigate?.(destination)
    close()
    closeMenu()
  }, [close, closeMenu, currentProp, onCurrentChange, onNavigate])

  useEffect(() => {
    if (!open && !menuOpen) return
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        close()
        closeMenu()
      }
    }
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      if (open) close(true)
      else closeMenu(true)
    }
    document.addEventListener("pointerdown", onPointer)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onPointer)
      document.removeEventListener("keydown", onKey)
    }
  }, [open, menuOpen, close, closeMenu])

  useEffect(() => {
    if (!menuOpen) return
    const scroller: HTMLElement = scrollContainer?.current ?? document.documentElement
    const previous = scroller.style.getPropertyValue("overflow")
    scroller.style.setProperty("overflow", "hidden")
    return () => {
      if (previous) scroller.style.setProperty("overflow", previous)
      else scroller.style.removeProperty("overflow")
    }
  }, [menuOpen, scrollContainer])

  useEffect(() => {
    if (!open || !focusFirst.current) return
    focusFirst.current = false
    const frame = requestAnimationFrame(() => panelRef.current?.querySelector<HTMLElement>("[data-panel-link]")?.focus())
    return () => cancelAnimationFrame(frame)
  }, [open])

  function onTriggerPointerEnter(event: ReactPointerEvent, value: string) {
    if (event.pointerType !== "mouse") return
    window.clearTimeout(closeTimer.current)
    window.clearTimeout(openTimer.current)
    if (open) openPanel(value)
    else openTimer.current = window.setTimeout(() => openPanel(value), HOVER_INTENT)
  }

  function onNavKeyDown(event: ReactKeyboardEvent<HTMLElement>) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return
    const triggers = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-nav-item]"))
    const index = triggers.indexOf(document.activeElement as HTMLElement)
    if (index < 0) return
    event.preventDefault()
    const nextIndex = (index + (event.key === "ArrowRight" ? 1 : -1) + triggers.length) % triggers.length
    triggers[nextIndex]?.focus()
    if (open) {
      const item = items[nextIndex]
      openPanel(item && hasPanels && item.links?.length ? item.value : null)
    }
  }

  function onPanelKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp" && event.key !== "Home" && event.key !== "End") return
    const unique = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("[data-panel-link]"))
    if (!unique.length) return
    event.preventDefault()
    const index = unique.indexOf(document.activeElement as HTMLElement)
    const next = event.key === "Home" ? 0 : event.key === "End" ? unique.length - 1 : event.key === "ArrowDown" ? Math.min(index + 1, unique.length - 1) : index - 1
    if (next < 0) {
      close(true)
      return
    }
    unique[next]?.focus()
  }

  function actionNode(action: SiteHeaderAction, kind: "secondary" | "primary") {
    const onClick = () => {
      action.onClick?.()
      if (action.href) onNavigate?.({ label: action.label, href: action.href })
      closeMenu()
    }
    const classes = cn(kind === "secondary" && "max-sm:hidden @max-[759px]/header:hidden")
    if (action.href) {
      return (
        <Button asChild variant={kind === "primary" ? "default" : "ghost"} size="sm" className={classes}>
          <a href={action.href} onClick={onClick}>{action.label}</a>
        </Button>
      )
    }
    return <Button type="button" variant={kind === "primary" ? "default" : "ghost"} size="sm" className={classes} onClick={onClick}>{action.label}</Button>
  }

  return (
    <header
      ref={setRefs}
      data-slot="site-header"
      data-variant={variant}
      data-scrolled={solid ? "" : undefined}
      className={cn("@container/header relative z-20 border-b border-transparent text-foreground motion-reduce:transition-none", sticky && "sticky top-0", solid && "border-border bg-background shadow-sm", className, classNames?.root)}
    >
      <div
        className="relative mx-auto w-full max-w-6xl px-4"
        onPointerLeave={(event) => {
          if (event.pointerType !== "mouse") return
          window.clearTimeout(openTimer.current)
          closeTimer.current = window.setTimeout(() => openPanel(null), LEAVE_GRACE)
        }}
        onPointerEnter={(event) => {
          if (event.pointerType === "mouse") window.clearTimeout(closeTimer.current)
        }}
      >
        <div className={cn("flex h-16 items-center gap-2", variant === "centered" && "@min-[760px]/header:grid @min-[760px]/header:grid-cols-[1fr_auto_1fr]", classNames?.bar)}>
          <Destination link={{ label: brand.name, href: brand.href }} className="inline-flex min-w-0 items-center gap-2 rounded-lg py-2 text-sm font-medium focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onChoose={() => { onNavigate?.({ label: brand.name, href: brand.href }); close(); closeMenu() }}>
            {brand.mark ?? <span aria-hidden className="grid size-6 shrink-0 place-items-center rounded-full border border-border text-xs">{brand.name.slice(0, 1)}</span>}
            <span className="truncate">{brand.name}</span>
          </Destination>

          <LayoutGroup id={id}>
            <nav className={cn("hidden min-w-0 @min-[760px]/header:block", variant !== "centered" && "ml-4", classNames?.nav)} aria-label={label} onKeyDown={onNavKeyDown} onPointerLeave={() => setHovered(null)}>
              <ul className={cn("flex items-center gap-0.5", variant === "centered" && "rounded-full border border-border bg-muted p-0.5")}>
                {items.map((item) => {
                  const isCurrent = current === item.value
                  const withPanel = hasPanels && !!item.links?.length
                  const isOpen = open?.value === item.value
                  const common = {
                    "data-nav-item": "",
                    "data-current": isCurrent ? "true" : undefined,
                    "data-state": isOpen ? "open" : "closed",
                    className: cn("relative inline-flex h-9 items-center gap-1 rounded-lg px-3 text-sm font-medium text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none data-[current=true]:text-foreground data-[state=open]:text-foreground", variant === "centered" && "rounded-full"),
                    onPointerEnter: (event: ReactPointerEvent) => {
                      if (event.pointerType === "mouse") setHovered(item.value)
                      if (withPanel) onTriggerPointerEnter(event, item.value)
                      else if (event.pointerType === "mouse" && open) closeTimer.current = window.setTimeout(() => openPanel(null), LEAVE_GRACE)
                    },
                    onFocus: () => setHovered(null),
                  }
                  const decorations = (
                    <>
                      {hovered === item.value && variant !== "centered" ? <motion.span layoutId="hover" className="absolute inset-0 -z-10 rounded-lg bg-muted" transition={reduced ? { duration: 0 } : motionPresets.spring.gentle} aria-hidden /> : null}
                      {isCurrent ? <motion.span layoutId="current" className={cn("absolute bottom-1 left-3 right-3 h-0.5 rounded-full bg-primary", variant === "centered" && "inset-0 h-auto rounded-full border border-border bg-background")} transition={reduced ? { duration: 0 } : motionPresets.spring.morph} aria-hidden /> : null}
                    </>
                  )
                  return (
                    <li key={item.value}>
                      {withPanel ? (
                        <button
                          {...common}
                          ref={(node) => { if (node) triggerRefs.current.set(item.value, node); else triggerRefs.current.delete(item.value) }}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={isOpen ? `${id}-panel` : undefined}
                          onClick={() => { clearTimers(); openPanel(isOpen ? null : item.value) }}
                          onKeyDown={(event) => {
                            if (event.key !== "ArrowDown") return
                            event.preventDefault()
                            focusFirst.current = true
                            openPanel(item.value)
                            if (open?.value === item.value) panelRef.current?.querySelector<HTMLElement>("[data-panel-link]")?.focus()
                          }}
                        >
                          {decorations}
                          <span className="relative">{item.label}</span>
                          <ChevronDown className="relative size-3.5 transition-transform group-data-[state=open]:rotate-180 data-[state=open]:rotate-180 motion-reduce:transition-none" data-state={isOpen ? "open" : "closed"} aria-hidden />
                        </button>
                      ) : (
                        <Destination
                          link={item}
                          {...common}
                          aria-current={isCurrent ? "page" : undefined}
                          onChoose={() => choose({ label: item.label, href: item.href, section: item.value }, item.value)}
                        >
                          {decorations}
                          <span className="relative">{item.label}</span>
                        </Destination>
                      )}
                    </li>
                  )
                })}
              </ul>
            </nav>
          </LayoutGroup>

          <div className={cn("ml-auto flex items-center gap-2", variant === "centered" && "@min-[760px]/header:ml-0 @min-[760px]/header:justify-self-end", classNames?.actions)}>
            {secondaryAction ? actionNode(secondaryAction, "secondary") : null}
            {primaryAction ? actionNode(primaryAction, "primary") : null}
            <Button
              ref={menuButtonRef}
              type="button"
              variant="ghost"
              size="icon"
              className="@min-[760px]/header:hidden"
              aria-expanded={menuOpen}
              aria-controls={`${id}-sheet`}
              aria-label={menuOpen ? "Close menu" : "Open menu"}
              onClick={() => { if (menuOpen) closeMenu(); else setMenuOpen(true) }}
            >
              {menuOpen ? <X aria-hidden /> : <Menu aria-hidden />}
            </Button>
          </div>
        </div>

        {hasPanels ? (
          <AnimatePresence>
            {openItem?.links ? (
              <motion.div
                key="panel"
                id={`${id}-panel`}
                ref={panelRef}
                data-slot="site-header-panel"
                role="region"
                aria-label={openItem.label}
                className={cn("absolute inset-x-4 top-full z-30 hidden overflow-hidden rounded-xl border border-border bg-popover text-popover-foreground shadow-lg @min-[760px]/header:block", classNames?.panel)}
                onKeyDown={onPanelKeyDown}
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: reduced ? 0 : motionPresets.duration.standard, ease: [...motionPresets.ease.enter] }}
              >
                <div className={cn("grid gap-2 p-3", openItem.feature && "md:grid-cols-[minmax(0,1fr)_16rem]")}>
                  <ul className="grid gap-1 sm:grid-cols-2">
                    {openItem.links.map((link) => (
                      <li key={link.label}>
                        <Destination link={link} data-panel-link="" className="flex w-full items-start gap-3 rounded-lg p-3 text-left hover:bg-muted focus-visible:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onChoose={() => choose({ label: link.label, href: link.href, section: openItem.value }, openItem.value)}>
                          {link.icon ? <span className="mt-0.5 text-muted-foreground">{link.icon}</span> : null}
                          <span className="grid min-w-0 gap-0.5">
                            <span className="text-sm font-medium">{link.label}</span>
                            {link.description ? <span className="text-sm text-pretty text-muted-foreground">{link.description}</span> : null}
                          </span>
                        </Destination>
                      </li>
                    ))}
                  </ul>
                  {openItem.feature ? (
                    <Destination link={{ label: openItem.feature.title, href: openItem.feature.href }} data-panel-link="" className="grid content-start gap-1 rounded-lg bg-muted p-3 text-left focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none" onChoose={() => choose({ label: openItem.feature!.title, href: openItem.feature!.href, section: openItem.value }, openItem.value)}>
                      {openItem.feature.image ? (
                        <span className="mb-1 block overflow-hidden rounded-lg bg-border">
                          <img src={openItem.feature.image.src} alt={openItem.feature.image.alt} className="aspect-video w-full object-cover" />
                        </span>
                      ) : null}
                      <span className="inline-flex items-center gap-1 text-sm font-medium">{openItem.feature.title}<ArrowRight className="size-3.5" aria-hidden /></span>
                      {openItem.feature.description ? <span className="text-sm text-muted-foreground">{openItem.feature.description}</span> : null}
                    </Destination>
                  ) : null}
                </div>
              </motion.div>
            ) : null}
          </AnimatePresence>
        ) : null}
      </div>

      <AnimatePresence>
        {menuOpen ? (
          <>
            <motion.div key="scrim" className="absolute inset-x-0 top-full z-30 h-dvh bg-foreground/20 @min-[760px]/header:hidden" onClick={() => closeMenu()} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduced ? 0 : motionPresets.duration.standard }} aria-hidden />
            <motion.div
              key="sheet"
              id={`${id}-sheet`}
              data-slot="site-header-sheet"
              className={cn("absolute inset-x-0 top-full z-40 overflow-hidden border-b border-border bg-background @min-[760px]/header:hidden", classNames?.sheet)}
              initial={reduced ? { opacity: 0 } : { height: 0 }}
              animate={reduced ? { opacity: 1 } : { height: "auto" }}
              exit={reduced ? { opacity: 0 } : { height: 0 }}
              transition={reduced ? { duration: 0 } : motionPresets.spring.smooth}
            >
              <nav className="max-h-[calc(100dvh-4rem)] overflow-y-auto px-4 py-2" aria-label={label}>
                <ul>
                  {items.map((item) => {
                    const isCurrent = current === item.value
                    const group = !!item.links?.length && variant === "mega"
                    const isExpanded = expanded === item.value
                    return (
                      <li key={item.value} className="border-b border-border">
                        {group ? (
                          <>
                            <button type="button" className="flex min-h-12 w-full items-center justify-between gap-3 text-left text-base font-medium" data-current={isCurrent ? "true" : undefined} aria-expanded={isExpanded} aria-controls={`${id}-group-${item.value}`} onClick={() => setExpanded(isExpanded ? null : item.value)}>
                              <span className="min-w-0 truncate">{item.label}</span>
                              <ChevronDown className={cn("size-4 shrink-0 text-muted-foreground transition-transform motion-reduce:transition-none", isExpanded && "rotate-180")} aria-hidden />
                            </button>
                            <AnimatePresence initial={false}>
                              {isExpanded ? (
                                <motion.div id={`${id}-group-${item.value}`} initial={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} animate={reduced ? { opacity: 1 } : { height: "auto", opacity: 1 }} exit={reduced ? { opacity: 0 } : { height: 0, opacity: 0 }} className="overflow-hidden">
                                  <ul className="grid pb-3">
                                    {item.links!.map((link) => (
                                      <li key={link.label}>
                                        <Destination link={link} className="flex min-h-11 w-full items-center gap-3 rounded-lg px-2 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground" onChoose={() => choose({ label: link.label, href: link.href, section: item.value }, item.value)}>
                                          {link.icon}
                                          <span className="min-w-0 truncate">{link.label}</span>
                                        </Destination>
                                      </li>
                                    ))}
                                  </ul>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </>
                        ) : (
                          <Destination link={item} className="flex min-h-12 w-full items-center justify-between gap-3 text-left text-base font-medium" data-current={isCurrent ? "true" : undefined} aria-current={isCurrent ? "page" : undefined} onChoose={() => choose({ label: item.label, href: item.href, section: item.value }, item.value)}>
                            <span className="min-w-0 truncate">{item.label}</span>
                            {isCurrent ? <span className="size-1.5 shrink-0 rounded-full bg-primary" aria-hidden /> : null}
                          </Destination>
                        )}
                      </li>
                    )
                  })}
                </ul>
                {secondaryAction || primaryAction ? (
                  <div className="grid grid-cols-2 gap-2 py-4">
                    {[secondaryAction, primaryAction].map((action, index) => action ? (
                      action.href ? (
                        <Button key={action.label} asChild variant={index === 0 ? "outline" : "default"}>
                          <a href={action.href} onClick={() => { action.onClick?.(); if (action.href) onNavigate?.({ label: action.label, href: action.href }); closeMenu() }}>{action.label}</a>
                        </Button>
                      ) : (
                        <Button key={action.label} type="button" variant={index === 0 ? "outline" : "default"} onClick={() => { action.onClick?.(); closeMenu() }}>{action.label}</Button>
                      )
                    ) : null)}
                  </div>
                ) : null}
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
    </header>
  )
})
