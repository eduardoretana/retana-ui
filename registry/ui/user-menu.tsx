"use client"

/** Adapted from Arc UI (MIT). */

import * as React from "react"
import { createPortal } from "react-dom"
import { AnimatePresence, motion, useReducedMotion } from "motion/react"
import type { Transition, Variants } from "motion/react"
import { ChevronDown, LoaderCircle, LogOut, Monitor, Moon, Sun, SunMoon } from "lucide-react"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { motionPresets } from "@/registry/retana/lib/motion"

export type UserStatus = "available" | "busy" | "away"
export type ThemePreference = "light" | "dark" | "system"

/** Statuses in menu order. Shape carries the meaning as well as color: solid, barred, or hollow. */
export const userStatuses: { value: UserStatus; label: string }[] = [
  { value: "available", label: "Available" },
  { value: "busy", label: "Busy" },
  { value: "away", label: "Away" },
]

const themes: { value: ThemePreference; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Light", icon: <Sun className="size-3.5" aria-hidden="true" /> },
  { value: "dark", label: "Dark", icon: <Moon className="size-3.5" aria-hidden="true" /> },
  { value: "system", label: "System", icon: <Monitor className="size-3.5" aria-hidden="true" /> },
]

export interface UserMenuUser {
  name: string
  email: string
  plan?: string
  avatarSrc?: string
  avatarSrcSet?: string
}

export interface UserMenuItem {
  label: string
  icon?: React.ReactNode
  keys?: string[]
  onSelect?: () => void
}

export type UserMenuClassNames = {
  root?: string
  trigger?: string
  panel?: string
  sheet?: string
  item?: string
}

/**
 * The account menu behind a person's photo. On viewports at most 640px wide it opens as a bottom sheet.
 * Theme and sign-out stay props: this menu reports the choice and does not apply a theme itself.
 */
export interface UserMenuProps {
  user: UserMenuUser
  /** Presence status. Passing `status` or `onStatusChange` shows the presence dot and an inline status switch. */
  status?: UserStatus
  defaultStatus?: UserStatus
  onStatusChange?: (status: UserStatus) => void
  theme?: ThemePreference
  defaultTheme?: ThemePreference
  /** Reports the choice. Applying it to the page is up to the app. */
  onThemeChange?: (theme: ThemePreference) => void
  /** Shows the inline light, dark, and system switch. */
  showTheme?: boolean
  items?: UserMenuItem[]
  onSignOut?: () => void | Promise<unknown>
  signOutKeys?: string[]
  align?: "start" | "center" | "end"
  /** Shows the name and a chevron beside the avatar from 640px up. */
  showName?: boolean
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
  /** Renders the desktop panel in a portal on the body. Pass false to keep it inside the trigger's wrapper. */
  portal?: boolean
  ref?: React.Ref<HTMLButtonElement>
  className?: string
  classNames?: UserMenuClassNames
}

type Highlight = { top: number; height: number; tone?: string; glide: boolean }
type OpenReason = "first" | "last" | "pointer" | null

const compactQuery = "(max-width: 640px)"
const subscribeCompact = (change: () => void) => {
  const query = window.matchMedia(compactQuery)
  query.addEventListener("change", change)
  return () => query.removeEventListener("change", change)
}
const subscribeNothing = () => () => {}
const statusLabel = (status: UserStatus) => userStatuses.find((option) => option.value === status)?.label ?? status
const enter = [...motionPresets.ease.enter] as [number, number, number, number]
const standard = [...motionPresets.ease.standard] as [number, number, number, number]
const exitEase = [...motionPresets.ease.exit] as [number, number, number, number]

const panelMotion: Variants = {
  closed: { opacity: 0, scale: 0.94 },
  open: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      visualDuration: 0.3,
      bounce: 0,
      opacity: { duration: 0.14, ease: enter },
      delayChildren: 0.03,
      staggerChildren: 0.016,
    },
  },
  exit: { opacity: 0, scale: 0.97, transition: { duration: motionPresets.duration.instant, ease: exitEase } },
}
const stillMotion: Variants = {
  closed: { opacity: 0 },
  open: { opacity: 1, transition: { duration: motionPresets.duration.instant } },
  exit: { opacity: 0, transition: { duration: 0.1 } },
}
const rowMotion: Variants = {
  closed: { opacity: 0, y: 3 },
  open: { opacity: 1, y: 0, transition: { duration: motionPresets.duration.standard, ease: enter } },
}

/** A presence mark that morphs between statuses: a hole opens for away and a bar slides in for busy. */
export function PresenceDot({ status, className }: { status: UserStatus | "offline"; className?: string }) {
  return (
    <span
      data-slot="presence-dot"
      data-status={status}
      aria-hidden="true"
      className={cn(
        "relative inline-block size-[var(--dot-size,0.625rem)] shrink-0 rounded-full bg-primary",
        "before:absolute before:inset-0 before:m-auto before:size-[46%] before:scale-0 before:rounded-full before:bg-[var(--presence-surface,var(--color-background))] before:transition-transform before:content-['']",
        "after:absolute after:inset-0 after:m-auto after:h-[22%] after:min-h-px after:w-[58%] after:scale-x-0 after:rounded-xs after:bg-[var(--presence-surface,var(--color-background))] after:transition-transform after:content-['']",
        "data-[status=available]:bg-primary data-[status=busy]:bg-destructive data-[status=busy]:after:scale-x-100",
        "data-[status=away]:bg-muted-foreground data-[status=away]:before:scale-100",
        "data-[status=offline]:bg-muted-foreground data-[status=offline]:before:scale-100",
        className,
      )}
    />
  )
}

function initialsOf(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

function Face({ user, status, size }: { user: UserMenuUser; status?: UserStatus; size: "sm" | "md" }) {
  return (
    <span
      data-slot="user-menu-face"
      data-size={size}
      className="relative inline-grid shrink-0 [--dot-size:0.7rem] [--presence-surface:var(--color-popover)] data-[size=md]:size-10 data-[size=md]:[--dot-size:0.75rem] data-[size=sm]:size-8"
    >
      <Avatar className="size-full after:border-border">
        {user.avatarSrc ? <AvatarImage src={user.avatarSrc} srcSet={user.avatarSrcSet} alt="" /> : null}
        <AvatarFallback className="bg-muted text-[0.7rem] font-medium text-muted-foreground">{initialsOf(user.name)}</AvatarFallback>
      </Avatar>
      {status ? <PresenceDot status={status} className="absolute -right-px -bottom-px shadow-[0_0_0_2px_var(--presence-surface)]" /> : null}
    </span>
  )
}

function Rise({ text, reduced }: { text: string; reduced: boolean }) {
  return (
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={text}
        className="inline-block whitespace-nowrap"
        initial={reduced ? { opacity: 0 } : { opacity: 0, y: "0.35em", filter: `blur(${motionPresets.blur.subtle}px)` }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={
          reduced
            ? { opacity: 0, transition: { duration: 0 } }
            : {
                opacity: 0,
                y: "-0.35em",
                filter: `blur(${motionPresets.blur.subtle}px)`,
                transition: { duration: motionPresets.duration.fast, ease: standard },
              }
        }
        transition={reduced ? { duration: 0 } : { duration: motionPresets.duration.standard, ease: enter }}
      >
        {text}
      </motion.span>
    </AnimatePresence>
  )
}

function Keys({ keys }: { keys: string[] }) {
  return (
    <kbd className="ml-auto inline-flex shrink-0 items-center gap-px text-xs text-muted-foreground tabular-nums" aria-hidden="true">
      {keys.map((key, index) => (
        <kbd key={`${key}-${index}`} className="inline-block min-w-[1.05em] text-center font-[inherit]">
          {key}
        </kbd>
      ))}
    </kbd>
  )
}

function Segmented<T extends string>({
  label,
  icon,
  value,
  options,
  onChange,
  variants,
}: {
  label: string
  icon: React.ReactNode
  value: T
  options: { value: T; label: string; icon: React.ReactNode }[]
  onChange: (value: T) => void
  variants?: Variants
}) {
  const index = Math.max(0, options.findIndex((option) => option.value === value))
  return (
    <motion.div className="relative flex h-11 items-center gap-3 px-3 group-data-[sheet]/menu:h-14" data-stop="group" data-label={label} variants={variants}>
      <span className="inline-grid w-4 shrink-0 place-items-center text-muted-foreground" aria-hidden="true">
        {icon}
      </span>
      <span className="flex-1 text-sm group-data-[sheet]/menu:text-base" aria-hidden="true">
        {label}
      </span>
      <div
        className="relative isolate inline-grid h-[1.875rem] auto-cols-8 grid-flow-col rounded-full bg-muted p-0.5 group-data-[sheet]/menu:h-10 group-data-[sheet]/menu:auto-cols-11"
        role="group"
        aria-label={label}
        style={{ "--index": index, "--count": options.length } as React.CSSProperties}
      >
        <span
          className="absolute top-0.5 bottom-0.5 left-0.5 z-0 w-8 rounded-full bg-background shadow-sm transition-transform group-data-[sheet]/menu:w-11 translate-x-[calc(var(--index)*100%)]"
          aria-hidden="true"
        />
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="menuitemradio"
            tabIndex={-1}
            aria-checked={option.value === value}
            aria-label={option.label}
            title={option.label}
            className="relative z-10 grid place-items-center rounded-full text-muted-foreground outline-none aria-checked:text-foreground"
            onClick={() => onChange(option.value)}
          >
            {option.icon}
          </button>
        ))}
      </div>
    </motion.div>
  )
}

const getStops = (root: HTMLElement | null) => Array.from(root?.querySelectorAll<HTMLElement>("[data-stop]") ?? [])

function focusStop(stop: HTMLElement | undefined) {
  if (!stop) return
  const target = stop.dataset.stop === "group" ? (stop.querySelector<HTMLElement>('[aria-checked="true"]') ?? stop.querySelector<HTMLElement>("button")) : stop
  target?.focus({ preventScroll: true })
}

export function UserMenu({
  user,
  status: statusProp,
  defaultStatus = "available",
  onStatusChange,
  theme: themeProp,
  defaultTheme = "system",
  onThemeChange,
  showTheme = true,
  items = [],
  onSignOut,
  signOutKeys,
  align = "end",
  showName = false,
  open: openProp,
  defaultOpen = false,
  onOpenChange,
  portal = true,
  ref,
  className,
  classNames,
}: UserMenuProps) {
  const id = React.useId()
  const menuId = `${id}-menu`
  const triggerId = `${id}-trigger`
  const reduced = !!useReducedMotion()
  const hydrated = React.useSyncExternalStore(subscribeNothing, () => true, () => false)
  const compact = React.useSyncExternalStore(subscribeCompact, () => window.matchMedia(compactQuery).matches, () => false)
  const [innerOpen, setInnerOpen] = React.useState(defaultOpen)
  const [innerStatus, setInnerStatus] = React.useState(defaultStatus)
  const [innerTheme, setInnerTheme] = React.useState(defaultTheme)
  const [signingOut, setSigningOut] = React.useState(false)
  const [highlight, setHighlight] = React.useState<Highlight | null>(null)
  const open = openProp ?? innerOpen
  const showStatus = statusProp !== undefined || onStatusChange !== undefined
  const status = statusProp ?? innerStatus
  const theme = themeProp ?? innerTheme
  const rootRef = React.useRef<HTMLSpanElement>(null)
  const triggerRef = React.useRef<HTMLButtonElement | null>(null)
  const surfaceRef = React.useRef<HTMLDivElement>(null)
  const listRef = React.useRef<HTMLDivElement>(null)
  const reason = React.useRef<OpenReason>(null)
  const typed = React.useRef({ text: "", timer: 0 })
  const mounted = React.useRef(true)
  const pending = React.useRef(false)
  const sheet = hydrated && compact
  const inline = !portal && !sheet

  React.useEffect(() => {
    mounted.current = true
    const current = typed.current
    return () => {
      mounted.current = false
      window.clearTimeout(current.timer)
    }
  }, [])

  function setTriggerRef(node: HTMLButtonElement | null) {
    triggerRef.current = node
    if (typeof ref === "function") ref(node)
    else if (ref) ref.current = node
  }

  function setOpen(next: boolean, why: OpenReason = null) {
    reason.current = next ? why : null
    if (next) setSigningOut(pending.current)
    setHighlight(null)
    setInnerOpen(next)
    onOpenChange?.(next)
  }
  function close(returnFocus: boolean) {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus({ preventScroll: true })
  }

  React.useEffect(() => {
    if (!open) return
    const why = reason.current
    reason.current = null
    if (!why) return
    const frame = requestAnimationFrame(() => {
      const stops = getStops(listRef.current)
      if (why === "first") focusStop(stops[0])
      else if (why === "last") focusStop(stops.at(-1))
      else surfaceRef.current?.focus({ preventScroll: true })
    })
    return () => cancelAnimationFrame(frame)
  }, [open, sheet])

  React.useLayoutEffect(() => {
    if (!open || sheet) return
    const place = () => {
      const panel = surfaceRef.current
      const trigger = triggerRef.current
      if (!panel || !trigger) return
      const rect = trigger.getBoundingClientRect()
      const width = panel.offsetWidth
      const height = panel.offsetHeight
      let left: number
      let top: number
      if (inline) {
        const root = rootRef.current?.getBoundingClientRect()
        left = (root?.left ?? 0) + panel.offsetLeft
        top = (root?.top ?? 0) + panel.offsetTop
      } else {
        const wanted = align === "start" ? rect.left : align === "center" ? rect.left + rect.width / 2 - width / 2 : rect.right - width
        left = Math.min(Math.max(12, wanted), window.innerWidth - width - 12)
        const below = rect.bottom + 8
        top = below + height > window.innerHeight - 12 && rect.top - 8 - height > 12 ? rect.top - 8 - height : below
        panel.style.left = `${left}px`
        panel.style.top = `${top}px`
      }
      const faceCenter = rect.left + Math.min(rect.width, 40) / 2
      const originX = align === "end" && rect.width > 40 ? rect.right - 20 - left : faceCenter - left
      panel.style.setProperty("--origin-x", `${Math.min(Math.max(0, originX), width)}px`)
      panel.style.setProperty("--origin-y", top < rect.top ? `${height}px` : "0px")
    }
    place()
    if (inline) return
    window.addEventListener("resize", place)
    window.addEventListener("scroll", place, true)
    return () => {
      window.removeEventListener("resize", place)
      window.removeEventListener("scroll", place, true)
    }
  }, [open, sheet, inline, align])

  React.useEffect(() => {
    if (!open || sheet) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node
      if (surfaceRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      reason.current = null
      setHighlight(null)
      setInnerOpen(false)
      onOpenChange?.(false)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [open, sheet, onOpenChange])

  function changeStatus(value: UserStatus) {
    setInnerStatus(value)
    onStatusChange?.(value)
  }
  function changeTheme(value: ThemePreference) {
    setInnerTheme(value)
    onThemeChange?.(value)
  }

  function signOut() {
    if (pending.current) return
    const result = onSignOut?.()
    if (!result || typeof (result as Promise<unknown>).then !== "function") {
      close(true)
      return
    }
    pending.current = true
    setSigningOut(true)
    const done = () => {
      pending.current = false
      if (mounted.current) close(false)
    }
    ;(result as Promise<unknown>).then(done, done)
  }

  function onListFocus(event: React.FocusEvent<HTMLDivElement>) {
    const stop = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>("[data-stop]") : null
    if (!stop) {
      setHighlight(null)
      return
    }
    setHighlight((current) => ({ top: stop.offsetTop, height: stop.offsetHeight, tone: stop.dataset.tone, glide: current !== null }))
  }

  function onItemPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return
    if (document.activeElement !== event.currentTarget) event.currentTarget.focus({ preventScroll: true })
  }
  function onListPointerMove(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch" || !highlight) return
    const group = event.target instanceof HTMLElement ? event.target.closest<HTMLElement>('[data-stop="group"]') : null
    if (!group || group.contains(document.activeElement)) return
    setHighlight(null)
    surfaceRef.current?.focus({ preventScroll: true })
  }
  function onListPointerLeave(event: React.PointerEvent<HTMLElement>) {
    if (event.pointerType === "touch") return
    setHighlight(null)
    surfaceRef.current?.focus({ preventScroll: true })
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    const stops = getStops(listRef.current)
    const active = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const current = active?.closest<HTMLElement>("[data-stop]") ?? null
    const index = current ? stops.indexOf(current) : -1
    const step = (to: HTMLElement | undefined) => {
      event.preventDefault()
      focusStop(to)
    }
    switch (event.key) {
      case "ArrowDown":
        return step(stops[(index + 1) % stops.length])
      case "ArrowUp":
        return step(stops[index <= 0 ? stops.length - 1 : index - 1])
      case "Home":
        return step(stops[0])
      case "End":
        return step(stops.at(-1))
      case "Escape":
      case "Tab":
        event.preventDefault()
        return close(true)
      case "ArrowLeft":
      case "ArrowRight": {
        if (current?.dataset.stop !== "group") return
        event.preventDefault()
        const segments = Array.from(current.querySelectorAll<HTMLButtonElement>('[role="menuitemradio"]'))
        const at = Math.max(0, segments.findIndex((segment) => segment.getAttribute("aria-checked") === "true"))
        const next = segments[(at + (event.key === "ArrowRight" ? 1 : -1) + segments.length) % segments.length]
        next?.focus({ preventScroll: true })
        next?.click()
        return
      }
    }
    if (event.key.length !== 1 || event.ctrlKey || event.metaKey || event.altKey || event.key === " ") return
    const memory = typed.current
    window.clearTimeout(memory.timer)
    memory.text += event.key.toLowerCase()
    memory.timer = window.setTimeout(() => {
      memory.text = ""
    }, 500)
    const ordered = [...stops.slice(index + 1), ...stops.slice(0, index + 1)]
    const search = memory.text.length > 1 && current?.dataset.label?.toLowerCase().startsWith(memory.text) ? [current] : ordered
    const match = search.find((stop) => stop.dataset.label?.toLowerCase().startsWith(memory.text))
    if (match) step(match)
  }

  function onTriggerClick(event: React.MouseEvent<HTMLButtonElement>) {
    if (open) {
      close(false)
      return
    }
    setOpen(true, event.detail === 0 ? "first" : "pointer")
  }
  function onTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return
    event.preventDefault()
    setOpen(true, event.key === "ArrowDown" ? "first" : "last")
  }

  const glide: Transition = highlight?.glide && !reduced ? motionPresets.spring.snappy : { duration: 0 }
  const row = reduced ? undefined : rowMotion
  const menuProps = { id: menuId, role: "menu" as const, "aria-labelledby": triggerId, tabIndex: -1 as const, onKeyDown }

  const content = (
    <>
      <motion.div className="flex items-center gap-3 px-2 pt-2 pb-2.5" variants={row}>
        <Face user={user} status={showStatus ? status : undefined} size="md" />
        <div className="grid min-w-0 flex-1 gap-px">
          <div className="flex min-w-0 items-center gap-2">
            <span className="truncate text-sm font-medium">{user.name}</span>
            {user.plan ? <span className="inline-flex h-[18px] shrink-0 items-center rounded-full bg-accent px-1.5 text-[11px] font-medium text-accent-foreground">{user.plan}</span> : null}
          </div>
          <span className="truncate text-xs text-muted-foreground" title={user.email}>
            {user.email}
          </span>
        </div>
      </motion.div>
      <div ref={listRef} className="relative" onFocus={onListFocus} onPointerMove={onListPointerMove} onPointerLeave={onListPointerLeave}>
        <motion.span
          className="pointer-events-none absolute inset-x-0 top-0 rounded-lg bg-accent opacity-0 data-[tone=danger]:bg-destructive/10"
          data-tone={highlight?.tone}
          aria-hidden="true"
          initial={false}
          animate={highlight ? { y: highlight.top, height: highlight.height, opacity: 1 } : { opacity: 0 }}
          transition={{ default: glide, opacity: { duration: reduced ? 0 : 0.1 } }}
        />
        {items.length > 0 ? (
          <>
            <div className="mx-1 my-1.5 h-px bg-border" role="separator" />
            {items.map((item) => (
              <motion.button
                key={item.label}
                type="button"
                role="menuitem"
                tabIndex={-1}
                data-slot="user-menu-item"
                className={cn(
                  "relative flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm outline-none group-data-[sheet]/menu:h-12 group-data-[sheet]/menu:text-base",
                  classNames?.item,
                )}
                data-stop="item"
                data-label={item.label}
                variants={row}
                onPointerMove={onItemPointerMove}
                onClick={() => {
                  close(true)
                  item.onSelect?.()
                }}
              >
                <span className="inline-grid w-4 shrink-0 place-items-center text-muted-foreground" aria-hidden="true">
                  {item.icon}
                </span>
                <span className="min-w-0 flex-1 truncate">{item.label}</span>
                {item.keys ? <span className="group-data-[sheet]/menu:hidden"><Keys keys={item.keys} /></span> : null}
              </motion.button>
            ))}
          </>
        ) : null}
        {showTheme || showStatus ? (
          <>
            <div className="mx-1 my-1.5 h-px bg-border" role="separator" />
            {showStatus ? (
              <Segmented
                label="Status"
                icon={<PresenceDot status={status} />}
                value={status}
                onChange={changeStatus}
                options={userStatuses.map((option) => ({ ...option, icon: <PresenceDot status={option.value} /> }))}
                variants={row}
              />
            ) : null}
            {showTheme ? (
              <Segmented
                label="Theme"
                icon={<SunMoon className="size-4" aria-hidden="true" />}
                value={theme}
                onChange={changeTheme}
                options={themes}
                variants={row}
              />
            ) : null}
          </>
        ) : null}
        <div className="mx-1 my-1.5 h-px bg-border" role="separator" />
        <motion.button
          type="button"
          role="menuitem"
          tabIndex={-1}
          data-slot="user-menu-sign-out"
          className={cn(
            "relative flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm text-destructive outline-none group-data-[sheet]/menu:h-12 group-data-[sheet]/menu:text-base",
            classNames?.item,
          )}
          data-stop="item"
          data-tone="danger"
          data-label="Sign out"
          variants={row}
          aria-busy={signingOut || undefined}
          onPointerMove={onItemPointerMove}
          onClick={signOut}
        >
          <span className="inline-grid w-4 shrink-0 place-items-center" aria-hidden="true">
            {signingOut ? <LoaderCircle className="size-4 animate-spin" /> : <LogOut className="size-4" />}
          </span>
          <span className="relative inline-flex min-w-0 flex-1">
            <Rise text={signingOut ? "Signing out" : "Sign out"} reduced={reduced} />
          </span>
          {signOutKeys ? (
            <span className="group-data-[sheet]/menu:hidden">
              <Keys keys={signOutKeys} />
            </span>
          ) : null}
        </motion.button>
      </div>
    </>
  )

  const panel = (
    <AnimatePresence>
      {open && !sheet ? (
        <motion.div
          key="panel"
          ref={surfaceRef}
          {...menuProps}
          data-slot="user-menu-panel"
          className={cn(
            "group/menu z-50 box-border w-68 max-w-[calc(100vw-1.5rem)] rounded-xl bg-popover p-1.5 text-left text-popover-foreground shadow-md ring-1 ring-foreground/10 outline-none",
            inline ? "absolute top-[calc(100%+0.5rem)]" : "fixed top-0 left-0",
            inline && align === "end" && "right-0",
            inline && align === "start" && "left-0",
            inline && align === "center" && "left-1/2 -ml-34",
            classNames?.panel,
          )}
          data-inline={inline || undefined}
          data-align={align}
          style={{ transformOrigin: "var(--origin-x, 100%) var(--origin-y, 0px)" }}
          variants={reduced ? stillMotion : panelMotion}
          initial="closed"
          animate="open"
          exit="exit"
        >
          {content}
        </motion.div>
      ) : null}
    </AnimatePresence>
  )

  return (
    <span ref={rootRef} data-slot="user-menu" className={cn("relative inline-flex shrink-0 align-middle", className, classNames?.root)}>
      <Button
        ref={setTriggerRef}
        id={triggerId}
        type="button"
        variant="ghost"
        data-slot="user-menu-trigger"
        data-state={open ? "open" : "closed"}
        className={cn("group/trigger h-10 gap-2 rounded-full px-1", showName && "pr-2.5 max-[640px]:pr-1", classNames?.trigger)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`Account menu, ${user.name}${showStatus ? `, ${statusLabel(status)}` : ""}`}
        onClick={onTriggerClick}
        onKeyDown={onTriggerKeyDown}
      >
        <Face user={user} status={showStatus ? status : undefined} size="sm" />
        {showName ? (
          <>
            <span className="max-w-44 truncate text-sm font-medium max-[640px]:hidden">{user.name}</span>
            <ChevronDown className="size-3.5 shrink-0 text-muted-foreground transition-transform group-data-[state=open]/trigger:rotate-180 max-[640px]:hidden" aria-hidden="true" />
          </>
        ) : null}
      </Button>
      {sheet ? (
        <Sheet
          open={open}
          onOpenChange={(next) => {
            if (!next) close(true)
          }}
        >
          <SheetContent
            side="bottom"
            data-slot="user-menu-sheet"
            className={cn("max-h-[88dvh] gap-0 rounded-t-xl px-2.5 pb-[max(0.75rem,env(safe-area-inset-bottom))]", classNames?.sheet)}
          >
            <SheetHeader className="sr-only">
              <SheetTitle>Account menu</SheetTitle>
            </SheetHeader>
            <div ref={surfaceRef} {...menuProps} data-slot="user-menu-panel" className="group/menu outline-none" data-sheet="">
              <span className="mx-auto mb-2 block h-1.5 w-9 rounded-full bg-border" aria-hidden="true" />
              {content}
            </div>
          </SheetContent>
        </Sheet>
      ) : inline ? (
        panel
      ) : hydrated ? (
        createPortal(panel, document.body)
      ) : null}
    </span>
  )
}
