"use client"

/**
 * Clean-room navigation island.
 *
 * Idea, layout, and motion only — from a public post with no license and no
 * code. No markup, copy, icons, or assets were copied. See NOTICE and
 * docs/learnings/L-KUZNETSOV-sidebar-shard.md.
 *
 * Family: navigation. The host owns persistence for `collapsed`, `activeId`,
 * and `teamId`. The flyout composes TreeNav. The team row composes
 * WorkspaceSwitcher. The profile is a popover on the host avatar and button:
 * UserMenu does not compile under exactOptionalPropertyTypes, so importing it
 * would fail strict-host on errors that already live in that file.
 * rail-sidebar stays a separate block: it is an in-flow shadcn sidebar whose
 * sheet traps focus, and a hover preview must not take focus.
 */

import * as React from "react"
import { flushSync } from "react-dom"
import { AnimatePresence, motion, useIsPresent, useReducedMotionConfig } from "motion/react"
import type { Transition } from "motion/react"
import { ChevronRight, Monitor, Moon, PanelLeft, RotateCcw, Search, Sun } from "lucide-react"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { TreeNav, type TreeNavNode } from "@/registry/retana/ui/tree-nav"
import { WorkspaceSwitcher, type WorkspaceOption } from "@/registry/retana/ui/workspace-switcher"

export const PREVIEW_INTENT_MS = 280
const PREVIEW_CLOSE_MS = 140

export type SidebarLocale = "es-MX" | "en"

export type NavBadge = {
  count: number
  tone?: "neutral" | "alert"
  label?: string
}

export type NavItem = {
  id: string
  label: string
  href?: string
  icon?: React.ReactNode
  badge?: NavBadge
  hidden?: boolean
  disabled?: boolean
  children?: readonly NavItem[]
  onSelect?: () => void
}

export type NavSection = {
  id: string
  label: string
  icon?: React.ReactNode
  href?: string
  badge?: NavBadge
  hidden?: boolean
  disabled?: boolean
  items?: readonly NavItem[]
  onSelect?: () => void
}

export type NavTeam = {
  id: string
  name: string
  detail?: string
  logo?: React.ReactNode
}

export type SidebarMeter = {
  used: number
  limit: number
  label: string
}

export type SidebarTheme = "light" | "dark" | "system"

export type SidebarProfileItem = {
  id: string
  label: string
  onSelect?: () => void
}

export type SidebarProfile = {
  name: string
  email: string
  plan?: string
  avatarSrc?: string
  items?: readonly SidebarProfileItem[]
  onSignOut?: () => void
  theme?: SidebarTheme
  onThemeChange?: (theme: SidebarTheme) => void
}

export type SidebarIslandsLabels = {
  navigation: string
  team: string
  search: string
  collapse: string
  expand: string
  openMenu: string
  loading: string
  emptyTitle: string
  emptyDetail: string
  emptyAction: string
  errorTitle: string
  errorDetail: string
  retry: string
  account: string
  signOut: string
  theme: string
  light: string
  dark: string
  system: string
}

export const sidebarIslandsLabels: SidebarIslandsLabels = {
  navigation: "Navegación",
  team: "Equipo",
  search: "Buscar",
  collapse: "Contraer la navegación",
  expand: "Expandir la navegación",
  openMenu: "Abrir la navegación",
  loading: "Cargando la navegación",
  emptyTitle: "Todavía no hay secciones",
  emptyDetail: "Cuando el equipo cree la primera, va a aparecer aquí.",
  emptyAction: "Crear la primera sección",
  errorTitle: "No se pudo cargar la navegación",
  errorDetail: "Revisa la conexión e inténtalo de nuevo.",
  retry: "Reintentar",
  account: "Menú de la cuenta",
  signOut: "Cerrar sesión",
  theme: "Tema",
  light: "Claro",
  dark: "Oscuro",
  system: "Sistema",
}

export const sidebarIslandsLabelsEn: SidebarIslandsLabels = {
  navigation: "Navigation",
  team: "Team",
  search: "Search",
  collapse: "Collapse navigation",
  expand: "Expand navigation",
  openMenu: "Open navigation",
  loading: "Loading navigation",
  emptyTitle: "No sections yet",
  emptyDetail: "When the team creates the first one, it shows up here.",
  emptyAction: "Create the first section",
  errorTitle: "Navigation could not be loaded",
  errorDetail: "Check the connection and try again.",
  retry: "Try again",
  account: "Account menu",
  signOut: "Sign out",
  theme: "Theme",
  light: "Light",
  dark: "Dark",
  system: "System",
}

export type SidebarIslandsStatus = "ready" | "loading" | "empty" | "error"

export type SidebarIslandsProps = {
  sections?: readonly NavSection[]
  teams?: readonly NavTeam[]
  teamId?: string
  onTeamChange?: (teamId: string) => void
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  activeId?: string
  onNavigate?: (id: string) => void
  defaultOpenIds?: readonly string[]
  onSearch?: () => void
  utilities?: readonly NavItem[]
  meter?: SidebarMeter
  profile?: SidebarProfile
  status?: SidebarIslandsStatus
  onRetry?: () => void
  onEmptyAction?: () => void
  labels?: Partial<SidebarIslandsLabels>
  locale?: SidebarLocale
  layout?: "auto" | "rail" | "sheet"
  className?: string
  railClassName?: string
  panelClassName?: string
  previewClassName?: string
  itemClassName?: string
  label?: string
}

type FlatRow = {
  item: NavItem
  depth: number
  parentId: string | null
}

export function islandMotion(reduced: boolean): Transition {
  if (reduced) return { duration: 0 }
  return { duration: 0.24, ease: [0.22, 1, 0.36, 1] }
}

export function formatNavCount(count: number, locale: SidebarLocale) {
  return new Intl.NumberFormat(locale === "en" ? "en-US" : "es-MX").format(count)
}

export function resolveSidebarLabels(partial?: Partial<SidebarIslandsLabels>): SidebarIslandsLabels {
  const next = { ...sidebarIslandsLabels }
  if (!partial) return next
  for (const key of Object.keys(sidebarIslandsLabels) as (keyof SidebarIslandsLabels)[]) {
    const value = partial[key]
    if (value) next[key] = value
  }
  return next
}

function visibleItems(items: readonly NavItem[] | undefined) {
  return (items ?? []).filter((item) => !item.hidden)
}

function sectionItem(section: NavSection): NavItem {
  const item: NavItem = { id: section.id, label: section.label }
  if (section.icon) item.icon = section.icon
  if (section.href) item.href = section.href
  if (section.badge) item.badge = section.badge
  if (section.disabled) item.disabled = true
  if (section.items) item.children = section.items
  if (section.onSelect) item.onSelect = section.onSelect
  return item
}

function flatten(items: readonly NavItem[], open: ReadonlySet<string>, depth = 0, parentId: string | null = null): FlatRow[] {
  const rows: FlatRow[] = []
  for (const item of visibleItems(items)) {
    rows.push({ item, depth, parentId })
    if (item.children?.length && open.has(item.id)) rows.push(...flatten(item.children, open, depth + 1, item.id))
  }
  return rows
}

function findItem(items: readonly NavItem[], id: string): NavItem | undefined {
  for (const item of items) {
    if (item.id === id) return item
    if (item.children) {
      const nested = findItem(item.children, id)
      if (nested) return nested
    }
  }
  return undefined
}

function toTree(items: readonly NavItem[] | undefined): TreeNavNode[] {
  const nodes: TreeNavNode[] = []
  for (const item of visibleItems(items)) {
    const node: TreeNavNode = { id: item.id, label: item.label }
    if (item.href) node.href = item.href
    if (item.icon) node.icon = item.icon
    if (item.badge) node.count = item.badge.count
    if (item.disabled) node.disabled = true
    const children = toTree(item.children)
    if (children.length) node.children = children
    nodes.push(node)
  }
  return nodes
}

function useNarrowScreen(layout: "auto" | "rail" | "sheet") {
  const narrow = React.useSyncExternalStore(
    (onChange) => {
      const media = window.matchMedia("(max-width: 480px)")
      media.addEventListener("change", onChange)
      return () => media.removeEventListener("change", onChange)
    },
    () => window.matchMedia("(max-width: 480px)").matches,
    () => false,
  )
  return layout === "sheet" || (layout === "auto" && narrow)
}

function useDirection(ref: React.RefObject<HTMLElement | null>) {
  const [rtl, setRtl] = React.useState(false)
  React.useLayoutEffect(() => {
    const node = ref.current
    if (!node) return
    setRtl(getComputedStyle(node).direction === "rtl")
  }, [ref])
  return rtl
}

function closedClip(rtl: boolean) {
  return rtl ? "inset(0 0 0 79.5% round 1rem)" : "inset(0 79.5% 0 0 round 1rem)"
}

const openClip = "inset(0 0 0 0 round 1rem)"

function CountBadge({ badge, locale, compact }: { badge: NavBadge; locale: SidebarLocale; compact?: boolean }) {
  const full = badge.label ?? formatNavCount(badge.count, locale)
  const text = compact && badge.count > 99 ? "99+" : formatNavCount(badge.count, locale)
  const hideVisual = Boolean(compact && badge.count > 99)
  return (
    <Badge variant={badge.tone === "alert" ? "destructive" : "secondary"} className="pointer-events-none h-5 min-w-5 px-1 tabular-nums">
      {hideVisual ? <span className="sr-only">{full}</span> : null}
      <span aria-hidden={hideVisual ? true : undefined}>{text}</span>
    </Badge>
  )
}

function useTypeahead() {
  const buffer = React.useRef({ text: "", timer: 0 })
  React.useEffect(() => {
    const state = buffer.current
    return () => window.clearTimeout(state.timer)
  }, [])
  return React.useCallback((event: React.KeyboardEvent, rows: readonly FlatRow[], currentId: string, focus: (id: string) => void) => {
    if (event.key.length !== 1 || event.altKey || event.ctrlKey || event.metaKey) return false
    event.preventDefault()
    const state = buffer.current
    window.clearTimeout(state.timer)
    state.text = `${state.text}${event.key.toLowerCase()}`
    state.timer = window.setTimeout(() => {
      state.text = ""
    }, 500)
    const start = Math.max(0, rows.findIndex((row) => row.item.id === currentId))
    const ordered = [...rows.slice(start + 1), ...rows.slice(0, start + 1)]
    const match = ordered.find((row) => row.item.label.toLowerCase().startsWith(state.text))
    if (match) focus(match.item.id)
    return true
  }, [])
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function ProfileFace({ name, avatarSrc }: { name: string; avatarSrc?: string }) {
  return (
    <Avatar>
      {avatarSrc ? <AvatarImage src={avatarSrc} alt="" /> : null}
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  )
}

function ProfileMenu({
  profile,
  labels,
  showDetail,
}: {
  profile: SidebarProfile
  labels: SidebarIslandsLabels
  showDetail: boolean
}) {
  const [theme, setTheme] = React.useState<SidebarTheme>(profile.theme ?? "system")
  const current = profile.theme ?? theme
  const showTheme = Boolean(profile.theme || profile.onThemeChange)
  const options: { value: SidebarTheme; label: string; icon: React.ReactNode }[] = [
    { value: "light", label: labels.light, icon: <Sun aria-hidden className="size-4" /> },
    { value: "dark", label: labels.dark, icon: <Moon aria-hidden className="size-4" /> },
    { value: "system", label: labels.system, icon: <Monitor aria-hidden className="size-4" /> },
  ]
  const face = <ProfileFace name={profile.name} {...(profile.avatarSrc ? { avatarSrc: profile.avatarSrc } : {})} />
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          data-slot="sidebar-islands-profile"
          className={cn(
            "flex min-h-11 items-center gap-2 rounded-lg outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
            showDetail ? "w-full px-2" : "size-11 justify-center",
          )}
          aria-label={`${labels.account}, ${profile.name}`}
        >
          {face}
          {showDetail ? (
            <span className="min-w-0 flex-1 text-start">
              <span className="flex min-w-0 items-center gap-2">
                <span className="truncate text-sm font-medium">{profile.name}</span>
                {profile.plan ? <Badge variant="secondary">{profile.plan}</Badge> : null}
              </span>
              <span className="block truncate text-xs text-muted-foreground">{profile.email}</span>
            </span>
          ) : null}
        </button>
      </PopoverTrigger>
      <PopoverContent side="top" align="start" aria-label={labels.account} className="w-68">
        <div className="flex items-center gap-2 px-1">
          <ProfileFace name={profile.name} {...(profile.avatarSrc ? { avatarSrc: profile.avatarSrc } : {})} />
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{profile.name}</p>
            <p className="truncate text-xs text-muted-foreground">{profile.email}</p>
          </div>
        </div>
        {showTheme ? (
          <div role="radiogroup" aria-label={labels.theme} className="flex gap-1">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={current === option.value}
                className={cn(
                  "flex min-h-11 flex-1 items-center justify-center gap-1 rounded-lg px-1 text-xs",
                  current === option.value ? "bg-accent text-accent-foreground" : "hover:bg-muted",
                )}
                onClick={() => {
                  setTheme(option.value)
                  profile.onThemeChange?.(option.value)
                }}
              >
                {option.icon}
                {option.label}
              </button>
            ))}
          </div>
        ) : null}
        {profile.items?.map((item) => (
          <button
            key={item.id}
            type="button"
            className="flex min-h-11 w-full items-center rounded-lg px-2 text-start text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            onClick={item.onSelect}
          >
            {item.label}
          </button>
        ))}
        {profile.onSignOut ? (
          <button
            type="button"
            className="flex min-h-11 w-full items-center rounded-lg px-2 text-start text-sm hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring"
            onClick={profile.onSignOut}
          >
            {labels.signOut}
          </button>
        ) : null}
      </PopoverContent>
    </Popover>
  )
}

function PreviewFlyout({
  id,
  label,
  className,
  reduced,
  rtl,
  previewRef,
  onPointerEnter,
  onPointerLeave,
  children,
}: {
  id: string
  label: string
  className?: string
  reduced: boolean
  rtl: boolean
  previewRef: React.RefObject<HTMLDivElement | null>
  onPointerEnter: () => void
  onPointerLeave: () => void
  children: React.ReactNode
}) {
  const present = useIsPresent()
  return (
    <motion.div
      ref={previewRef}
      id={id}
      role="region"
      aria-label={label}
      aria-hidden={present ? undefined : true}
      inert={present ? undefined : true}
      data-slot="sidebar-islands-preview"
      className={className}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      initial={reduced ? { opacity: 0 } : { opacity: 0, x: rtl ? 8 : -8 }}
      animate={{ opacity: 1, x: 0 }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, x: rtl ? 8 : -8 }}
      transition={islandMotion(reduced)}
    >
      {children}
    </motion.div>
  )
}

export function SidebarIslands({
  sections = [],
  teams = [],
  teamId,
  onTeamChange,
  collapsed,
  defaultCollapsed = false,
  onCollapsedChange,
  activeId,
  onNavigate,
  defaultOpenIds = [],
  onSearch,
  utilities = [],
  meter,
  profile,
  status = "ready",
  onRetry,
  onEmptyAction,
  labels: labelOverrides,
  locale = "es-MX",
  layout = "auto",
  className,
  railClassName,
  panelClassName,
  previewClassName,
  itemClassName,
  label,
}: SidebarIslandsProps) {
  const labels = resolveSidebarLabels(labelOverrides)
  const reduced = useReducedMotionConfig() === true
  const sheet = useNarrowScreen(layout)
  const uid = React.useId()
  const rootRef = React.useRef<HTMLDivElement>(null)
  const previewRef = React.useRef<HTMLDivElement>(null)
  const rtl = useDirection(rootRef)
  const [uncontrolledCollapsed, setUncontrolledCollapsed] = React.useState(defaultCollapsed)
  const isCollapsed = collapsed ?? uncontrolledCollapsed
  const [maskHold, setMaskHold] = React.useState(false)
  const [seenCollapsed, setSeenCollapsed] = React.useState(isCollapsed)
  const [openIds, setOpenIds] = React.useState<readonly string[]>(defaultOpenIds)
  const [hoverId, setHoverId] = React.useState<string | null>(null)
  const [pinnedId, setPinnedId] = React.useState<string | null>(null)
  const [sheetOpen, setSheetOpen] = React.useState(false)
  const [tabId, setTabId] = React.useState<string | null>(null)
  const intentTimer = React.useRef(0)
  const closeTimer = React.useRef(0)
  const typeahead = useTypeahead()

  if (seenCollapsed !== isCollapsed || (maskHold && (reduced || sheet || !isCollapsed))) {
    setSeenCollapsed(isCollapsed)
    setMaskHold(isCollapsed && !reduced && !sheet)
  }

  const topItems = React.useMemo(() => visibleItems(sections).map(sectionItem), [sections])
  const utilityItems = React.useMemo(() => visibleItems(utilities), [utilities])
  const allItems = React.useMemo(() => [...topItems, ...utilityItems], [topItems, utilityItems])
  const openSet = React.useMemo(() => new Set(openIds), [openIds])
  const rows = React.useMemo(() => flatten(allItems, openSet), [allItems, openSet])
  const view: SidebarIslandsStatus = status === "ready" && topItems.length === 0 ? "empty" : status
  const compact = isCollapsed && !sheet
  const showDetail = !compact || maskHold
  const previewId = hoverId ?? pinnedId
  const previewSection =
    compact && !maskHold && view === "ready"
      ? topItems.find((item) => item.id === previewId && visibleItems(item.children).length > 0)
      : undefined
  const motionTransition = islandMotion(reduced)

  React.useEffect(() => {
    return () => {
      window.clearTimeout(intentTimer.current)
      window.clearTimeout(closeTimer.current)
    }
  }, [])

  React.useEffect(() => {
    if (!previewSection) return
    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return
      const blocker = document.activeElement?.closest("[role='menu'], [role='dialog'], [data-slot='popover-content']")
      if (blocker) return
      const trigger = rootRef.current?.querySelector<HTMLElement>(`[data-rail-id="${previewSection?.id}"]`)
      const inside = previewRef.current?.contains(document.activeElement)
      flushSync(() => {
        setHoverId(null)
        setPinnedId(null)
      })
      if (inside && trigger) trigger.focus()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [previewSection])

  function commitCollapsed(next: boolean) {
    if (collapsed === undefined) setUncontrolledCollapsed(next)
    onCollapsedChange?.(next)
  }

  function toggle(id: string) {
    setOpenIds((current) => (current.includes(id) ? current.filter((item) => item !== id) : [...current, id]))
  }

  function activate(id: string) {
    const item = findItem(allItems, id)
    if (!item || item.disabled) return
    onNavigate?.(id)
    item.onSelect?.()
  }

  function focusRow(id: string) {
    flushSync(() => setTabId(id))
    document.getElementById(`${uid}-${id}`)?.focus()
  }

  function clearIntent() {
    window.clearTimeout(intentTimer.current)
  }

  function schedulePreview(id: string) {
    clearIntent()
    window.clearTimeout(closeTimer.current)
    intentTimer.current = window.setTimeout(() => setHoverId(id), reduced ? 0 : PREVIEW_INTENT_MS)
  }

  function schedulePreviewClose() {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setHoverId(null), reduced ? 0 : PREVIEW_CLOSE_MS)
  }

  function holdPreview() {
    window.clearTimeout(closeTimer.current)
    clearIntent()
  }

  function onRailPointerEnter(event: React.PointerEvent<HTMLElement>, item: NavItem) {
    if (!compact || maskHold || view !== "ready") return
    if (event.pointerType === "touch" || event.pointerType === "pen") return
    if (!visibleItems(item.children).length) return
    schedulePreview(item.id)
  }

  function onRailFocus(item: NavItem) {
    if (!compact || !visibleItems(item.children).length) return
    clearIntent()
    window.clearTimeout(closeTimer.current)
    setHoverId(item.id)
  }

  function onRailBlur(event: React.FocusEvent<HTMLElement>) {
    const next = event.relatedTarget
    if (next instanceof Node && previewRef.current?.contains(next)) return
    if (next instanceof Element && next.closest("[data-slot='sidebar-islands']")) return
    setHoverId(null)
  }

  function onRailClick(item: NavItem) {
    if (item.disabled) return
    const children = visibleItems(item.children)
    if (compact && children.length) {
      setPinnedId((current) => {
        const next = current === item.id ? null : item.id
        setHoverId(next)
        return next
      })
      return
    }
    if (children.length) toggle(item.id)
    activate(item.id)
  }

  function onRowKeyDown(event: React.KeyboardEvent<HTMLElement>, row: FlatRow, index: number) {
    if (typeahead(event, rows, row.item.id, focusRow)) return
    const children = visibleItems(row.item.children)
    const open = children.length > 0 && openSet.has(row.item.id)
    if (event.key === "ArrowDown" || event.key === "ArrowUp" || event.key === "Home" || event.key === "End") {
      event.preventDefault()
      const last = rows.length - 1
      let nextIndex = 0
      if (event.key === "ArrowDown") nextIndex = Math.min(index + 1, last)
      if (event.key === "ArrowUp") nextIndex = Math.max(index - 1, 0)
      if (event.key === "End") nextIndex = last
      const next = rows[nextIndex]
      if (next) focusRow(next.item.id)
      return
    }
    if (event.key === "ArrowRight") {
      if (compact && previewSection?.id === row.item.id) {
        event.preventDefault()
        previewRef.current?.querySelector<HTMLElement>("[role='treeitem']")?.focus()
        return
      }
      if (!children.length || row.item.disabled) return
      event.preventDefault()
      if (!open) {
        toggle(row.item.id)
        return
      }
      const child = children[0]
      if (child) focusRow(child.id)
      return
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault()
      if (compact && (hoverId || pinnedId)) {
        setHoverId(null)
        setPinnedId(null)
        return
      }
      if (open) {
        toggle(row.item.id)
        return
      }
      if (row.parentId) focusRow(row.parentId)
      return
    }
    if (event.key === "Escape" && compact) {
      setHoverId(null)
      setPinnedId(null)
    }
  }

  const currentTeam = teams.find((team) => team.id === teamId) ?? teams[0]
  const teamOptions = teams.map((team) => {
    const option: WorkspaceOption = { id: team.id, name: team.name }
    if (team.detail) option.detail = team.detail
    if (team.logo) option.logo = team.logo
    return option
  })
  const rowTab = tabId && rows.some((row) => row.item.id === tabId) ? tabId : (rows[0]?.item.id ?? null)

  function renderRows(items: readonly NavItem[], depth: number) {
    return visibleItems(items).map((item) => {
      const index = rows.findIndex((row) => row.item.id === item.id)
      const row = rows[index]
      if (!row) return null
      const children = visibleItems(item.children)
      const open = children.length > 0 && openSet.has(item.id)
      const current = item.id === activeId
      const name = item.badge ? `${item.label}, ${item.badge.label ?? formatNavCount(item.badge.count, locale)}` : item.label
      const rowClass = cn(
        "flex min-h-11 w-full min-w-0 items-center gap-2 rounded-lg px-1 text-start text-sm outline-none",
        "hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
        current && "bg-accent text-accent-foreground",
        item.disabled && "pointer-events-none opacity-50",
        itemClassName,
      )
      const shared = {
        id: `${uid}-${item.id}`,
        "data-nav-row": "",
        "data-rail-id": depth === 0 ? item.id : undefined,
        tabIndex: item.id === rowTab ? 0 : -1,
        "aria-current": current ? ("page" as const) : undefined,
        "aria-expanded": children.length ? open || previewSection?.id === item.id : undefined,
        "aria-controls": previewSection?.id === item.id ? `${uid}-preview` : open ? `${uid}-group-${item.id}` : undefined,
        "aria-haspopup": children.length && compact ? ("tree" as const) : undefined,
        "aria-disabled": item.disabled || undefined,
        "aria-label": compact ? name : undefined,
        className: rowClass,
        onClick: (event: React.MouseEvent<HTMLElement>) => {
          if (item.disabled) {
            event.preventDefault()
            return
          }
          if (compact && children.length) {
            onRailClick(item)
            return
          }
          if (onNavigate || item.onSelect || !item.href) event.preventDefault()
          if (children.length) toggle(item.id)
          activate(item.id)
        },
        onKeyDown: (event: React.KeyboardEvent<HTMLElement>) => onRowKeyDown(event, row, index),
        onPointerEnter: (event: React.PointerEvent<HTMLElement>) => onRailPointerEnter(event, item),
        onPointerLeave: () => {
          if (compact) schedulePreviewClose()
        },
        onFocus: () => onRailFocus(item),
        onBlur: onRailBlur,
      }
      const body = (
        <>
          <span aria-hidden className="relative grid size-11 shrink-0 place-items-center">
            {item.icon}
            {compact && item.badge ? (
              <span className="absolute end-0 top-0">
                <CountBadge badge={item.badge} locale={locale} compact />
              </span>
            ) : null}
          </span>
          <motion.span
            animate={{ opacity: compact ? 0 : 1 }}
            transition={motionTransition}
            className="flex min-w-0 flex-1 items-center gap-2"
            aria-hidden={compact ? true : undefined}
          >
            {children.length ? (
              <ChevronRight
                className={cn("size-4 shrink-0 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none", open && "rotate-90")}
                aria-hidden
              />
            ) : (
              <span className="size-4 shrink-0" aria-hidden />
            )}
            <span className="min-w-0 flex-1 truncate" title={item.label}>
              {item.label}
            </span>
            {item.badge ? <CountBadge badge={item.badge} locale={locale} /> : null}
          </motion.span>
        </>
      )
      const control =
        item.href && !compact ? (
          <a href={item.href} {...shared}>
            {body}
          </a>
        ) : (
          <button type="button" {...shared}>
            {body}
          </button>
        )
      return (
        <div key={item.id} className="relative min-w-0">
          {depth === 0 && compact ? (
            <Tooltip>
              <TooltipTrigger asChild>{control}</TooltipTrigger>
              <TooltipContent side={rtl ? "left" : "right"} hidden={previewSection?.id === item.id}>
                {item.label}
              </TooltipContent>
            </Tooltip>
          ) : (
            control
          )}
          {showDetail && open ? (
            <div id={`${uid}-group-${item.id}`} role="group" className="ms-4 border-s border-border ps-1">
              <motion.div initial={reduced ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={motionTransition}>
                {renderRows(children, depth + 1)}
              </motion.div>
            </div>
          ) : null}
        </div>
      )
    })
  }

  const islandBody = (
    <div className="flex h-full min-h-0 flex-col">
      <div className={cn("flex gap-1", showDetail ? "flex-row items-center p-2" : "flex-col items-center p-1")}>
        {compact ? (
          <Button type="button" variant="ghost" size="icon" className="size-11 shrink-0" aria-label={labels.expand} aria-expanded={false} onClick={() => commitCollapsed(false)}>
            <PanelLeft className="rotate-180" />
          </Button>
        ) : null}
        {teams.length ? (
          <div className={cn("min-w-0", showDetail ? "flex-1" : "w-11 overflow-hidden")}>
            <WorkspaceSwitcher
              name={currentTeam?.name ?? labels.team}
              {...(currentTeam?.detail ? { detail: currentTeam.detail } : {})}
              {...(currentTeam?.logo ? { logo: currentTeam.logo } : {})}
              options={teamOptions}
              {...(teamId ? { value: teamId } : {})}
              {...(onTeamChange ? { onValueChange: onTeamChange } : {})}
              label={currentTeam ? `${labels.team}, ${currentTeam.name}` : labels.team}
              {...(compact ? { className: "w-11 justify-center px-0 [&>span.min-w-0]:sr-only [&>svg]:hidden" } : {})}
            />
          </div>
        ) : (
          <span className="sr-only">{labels.team}</span>
        )}
        {showDetail && onSearch ? (
          <Button type="button" variant="ghost" size="icon" className="size-11 shrink-0" aria-label={labels.search} onClick={onSearch}>
            <Search />
          </Button>
        ) : null}
        {showDetail && !sheet ? (
          <Button type="button" variant="ghost" size="icon" className="size-11 shrink-0" aria-label={labels.collapse} aria-expanded onClick={() => commitCollapsed(true)}>
            <PanelLeft />
          </Button>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2" aria-busy={view === "loading" || undefined}>
        {view === "loading" ? (
          <div className="flex flex-col gap-2" role="status">
            <span className="sr-only">{labels.loading}</span>
            {Array.from({ length: 6 }, (_, index) => (
              <Skeleton key={index} className="h-11 w-full" />
            ))}
          </div>
        ) : null}
        {view === "error" ? (
          <div role="alert" className="flex flex-col gap-2 p-2">
            <p className="text-sm font-medium text-balance">{labels.errorTitle}</p>
            {showDetail ? <p className="text-sm text-pretty text-muted-foreground">{labels.errorDetail}</p> : null}
            {onRetry ? (
              <Button type="button" variant="outline" className="min-h-11" onClick={onRetry}>
                <RotateCcw data-icon="inline-start" />
                {showDetail ? labels.retry : <span className="sr-only">{labels.retry}</span>}
              </Button>
            ) : null}
          </div>
        ) : null}
        {view === "empty" ? (
          <Empty className="border-0 px-2 py-6">
            <EmptyHeader>
              <EmptyTitle>{labels.emptyTitle}</EmptyTitle>
              {showDetail ? <EmptyDescription>{labels.emptyDetail}</EmptyDescription> : null}
            </EmptyHeader>
            {onEmptyAction && showDetail ? (
              <EmptyContent>
                <Button type="button" className="min-h-11" onClick={onEmptyAction}>
                  {labels.emptyAction}
                </Button>
              </EmptyContent>
            ) : null}
          </Empty>
        ) : null}
        {view === "ready" ? (
          <div className="flex flex-col gap-1">
            {renderRows(topItems, 0)}
            {utilityItems.length ? (
              <>
                <Separator className="my-2" />
                {renderRows(utilityItems, 0)}
              </>
            ) : null}
          </div>
        ) : null}
      </div>
      {meter && showDetail ? (
        <p className="mx-2 mb-2 flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs text-muted-foreground">
          <span className="min-w-0 flex-1 truncate">{meter.label}</span>
          <span className="shrink-0 tabular-nums">
            {formatNavCount(meter.used, locale)}/{formatNavCount(meter.limit, locale)}
          </span>
        </p>
      ) : null}
      {profile ? (
        <div className={cn(showDetail ? "p-2 pt-0" : "p-1")}>
          <ProfileMenu profile={profile} labels={labels} showDetail={showDetail} />
        </div>
      ) : null}
    </div>
  )

  const island = (
    <motion.div
      data-slot="sidebar-islands-panel"
      className={cn(
        "flex h-full w-68 flex-col overflow-hidden rounded-2xl bg-card text-card-foreground shadow-md ring-1 ring-foreground/10",
        sheet ? "relative h-dvh w-full pt-12" : "absolute inset-y-0 start-0",
        panelClassName,
      )}
      initial={false}
      animate={{ clipPath: sheet || !compact ? openClip : closedClip(rtl) }}
      transition={motionTransition}
      onAnimationComplete={() => {
        setMaskHold((current) => (isCollapsed && current ? false : current))
      }}
    >
      {islandBody}
    </motion.div>
  )

  const preview = (
    <AnimatePresence>
      {previewSection ? (
        <PreviewFlyout
          key={previewSection.id}
          previewRef={previewRef}
          id={`${uid}-preview`}
          label={previewSection.label}
          className={cn("absolute top-0 z-30 start-full ps-2", previewClassName)}
          reduced={reduced}
          rtl={rtl}
          onPointerEnter={holdPreview}
          onPointerLeave={schedulePreviewClose}
        >
          <div className="max-h-[min(36rem,80vh)] w-68 overflow-y-auto rounded-2xl bg-popover p-2 text-popover-foreground shadow-md ring-1 ring-foreground/10">
            <p className="truncate px-2 py-1 text-sm font-medium">{previewSection.label}</p>
            <TreeNav
              className="rounded-none bg-transparent p-0 shadow-none ring-0"
              items={toTree(previewSection.children)}
              label={previewSection.label}
              selected={activeId ?? null}
              onSelect={(node) => activate(node.id)}
            />
          </div>
        </PreviewFlyout>
      ) : null}
    </AnimatePresence>
  )

  const rootProps = {
    ref: rootRef,
    "data-slot": "sidebar-islands",
    "data-collapsed": compact ? "true" : "false",
    "data-mask": showDetail ? "open" : "closed",
    "data-motion": reduced ? "reduced" : "full",
    "data-layout": sheet ? "sheet" : "rail",
    "data-status": view,
    "data-preview": previewSection?.id,
    className: cn("relative h-full min-h-96", sheet ? "w-fit" : showDetail ? "w-68" : "w-14", className, railClassName),
  }

  const nav = (
    <nav aria-label={label ?? labels.navigation} className="flex h-full min-h-0 flex-col">
      {island}
      {preview}
    </nav>
  )

  if (sheet) {
    return (
      <div {...rootProps}>
        <Button type="button" variant="outline" size="icon" className="size-11" aria-label={labels.openMenu} onClick={() => setSheetOpen(true)}>
          <PanelLeft />
        </Button>
        <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
          <SheetContent side="left" className="h-dvh w-full! gap-0 overflow-hidden bg-popover p-0 sm:max-w-sm">
            <SheetHeader className="sr-only">
              <SheetTitle>{labels.navigation}</SheetTitle>
            </SheetHeader>
            <TooltipProvider delayDuration={700}>{nav}</TooltipProvider>
          </SheetContent>
        </Sheet>
      </div>
    )
  }

  return (
    <TooltipProvider delayDuration={700}>
      <div {...rootProps}>{nav}</div>
    </TooltipProvider>
  )
}
