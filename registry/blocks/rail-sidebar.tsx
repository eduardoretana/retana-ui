"use client"

import * as React from "react"
import {
  ChevronDown,
  ChevronRight,
  ChevronsUpDown,
  PanelLeftIcon,
  Search,
} from "lucide-react"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export type RailDot =
  | "chart-1"
  | "chart-2"
  | "chart-3"
  | "chart-4"
  | "chart-5"
  | "primary"
  | "muted"
  | "destructive"

export type RailLinkRenderProps = {
  href: string
  className?: string
  children: React.ReactNode
  "aria-current"?: "page"
  onClick?: (event: React.MouseEvent<HTMLElement>) => void
}

export type RailLink = {
  id: string
  label: string
  href?: string
  icon?: React.ReactNode
  badge?: string | number
  dot?: RailDot
  disabled?: boolean
  /** Single element, such as a Next.js or React Router link. */
  asChild?: React.ReactElement
}

export type RailEntry = RailLink & {
  /** When set, the entry is a collapsible group of sub-items. */
  items?: readonly RailLink[]
  defaultOpen?: boolean
}

export type RailNavGroup = {
  id: string
  /** Omit for a flat list with no heading. */
  label?: string
  items: readonly RailEntry[]
}

export type RailSection = {
  id: string
  label: string
  icon: React.ReactNode
  badge?: string | number
  /** Secondary sections sit above the avatar. */
  placement?: "primary" | "secondary"
  nav: readonly RailNavGroup[]
}

export type RailWorkspaceOption = {
  id: string
  name: string
  subtitle?: string
  logo?: React.ReactNode
}

export type RailWorkspace = {
  name: string
  subtitle?: string
  logo?: React.ReactNode
  options?: readonly RailWorkspaceOption[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
}

export type RailUser = {
  name: string
  email?: string
  avatarUrl?: string
}

export type RailSidebarProps = {
  sections: readonly RailSection[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  /** Href of the current page. Matching links get aria-current="page". */
  activeHref?: string
  renderLink?: (props: RailLinkRenderProps) => React.ReactElement
  onNavigate?: (href: string) => void
  workspace?: RailWorkspace
  user?: RailUser
  /** Menu body for the user dropdown. Render menu items here. */
  footerSlot?: React.ReactNode
  onSearch?: (query: string) => void
  onOpenCommand?: () => void
  searchPlaceholder?: string
  /** One collapsible entry open at a time, or several. */
  type?: "single" | "multiple"
  /** Passed to the shadcn sidebar. "icon" keeps the rail and hides the panel. */
  collapsible?: "offcanvas" | "icon" | "none"
  /** In-flow layout for thumbnails, tests, and narrow containers. */
  contained?: boolean
  mark?: React.ReactNode
  markLabel?: string
  children?: React.ReactNode
  className?: string
  railClassName?: string
  panelClassName?: string
  itemClassName?: string
  groupClassName?: string
  headerClassName?: string
  footerClassName?: string
  searchClassName?: string
  insetClassName?: string
  railLabel?: string
  panelLabel?: string
  searchLabel?: string
  commandLabel?: string
  collapseLabel?: string
  expandLabel?: string
}

const DOT_CLASS: Record<RailDot, string> = {
  "chart-1": "bg-chart-1",
  "chart-2": "bg-chart-2",
  "chart-3": "bg-chart-3",
  "chart-4": "bg-chart-4",
  "chart-5": "bg-chart-5",
  primary: "bg-primary",
  muted: "bg-muted-foreground",
  destructive: "bg-destructive",
}

function useControllable(value: string | undefined, defaultValue: string | undefined, onChange?: (next: string) => void) {
  const [uncontrolled, setUncontrolled] = React.useState(defaultValue ?? "")
  const selected = value ?? uncontrolled
  const setSelected = React.useCallback(
    (next: string) => {
      if (value === undefined) setUncontrolled(next)
      onChange?.(next)
    },
    [onChange, value],
  )
  return [selected, setSelected] as const
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

function ItemBody({ item, className }: { item: RailLink; className?: string }) {
  return (
    <>
      {item.dot ? (
        <span className={cn("size-2 shrink-0 rounded-full", DOT_CLASS[item.dot])} aria-hidden />
      ) : item.icon ? (
        <span className="text-muted-foreground [&_svg]:size-4" aria-hidden>
          {item.icon}
        </span>
      ) : null}
      <span className={cn("min-w-0 flex-1 truncate text-start", className)}>{item.label}</span>
      {item.badge != null && item.badge !== "" ? (
        <Badge variant="secondary" className="ms-auto tabular-nums">
          {item.badge}
        </Badge>
      ) : null}
    </>
  )
}

function RailAnchor({
  item,
  active,
  className,
  renderLink,
  onNavigate,
}: {
  item: RailLink
  active: boolean
  className: string
  renderLink?: RailSidebarProps["renderLink"]
  onNavigate?: (href: string) => void
}) {
  const current = active ? "page" : undefined
  const onClick = (event: React.MouseEvent<HTMLElement>) => {
    if (item.disabled) {
      event.preventDefault()
      return
    }
    if (item.href && onNavigate) {
      event.preventDefault()
      onNavigate(item.href)
    }
  }

  if (item.asChild) {
    return (
      <Slot.Root
        className={className}
        aria-current={current}
        aria-disabled={item.disabled || undefined}
        onClick={onClick}
      >
        {React.cloneElement(item.asChild, undefined, <ItemBody item={item} />)}
      </Slot.Root>
    )
  }

  if (item.href && renderLink) {
    return renderLink({
      href: item.href,
      className,
      "aria-current": current,
      onClick,
      children: <ItemBody item={item} />,
    })
  }

  if (item.href) {
    return (
      <a
        href={item.href}
        className={className}
        aria-current={current}
        aria-disabled={item.disabled || undefined}
        onClick={onClick}
      >
        <ItemBody item={item} />
      </a>
    )
  }

  return (
    <button type="button" className={className} disabled={item.disabled} aria-current={current} onClick={onClick}>
      <ItemBody item={item} />
    </button>
  )
}

function entryOpen(type: "single" | "multiple", single: string | null, many: readonly string[], id: string) {
  return type === "single" ? single === id : many.includes(id)
}

function RailColumns({
  sections,
  sectionId,
  onSectionChange,
  activeHref,
  renderLink,
  onNavigate,
  workspace,
  user,
  footerSlot,
  onSearch,
  onOpenCommand,
  searchPlaceholder,
  type,
  panelVisible,
  onTogglePanel,
  mark,
  markLabel,
  className,
  railClassName,
  panelClassName,
  itemClassName,
  groupClassName,
  headerClassName,
  footerClassName,
  searchClassName,
  railLabel,
  panelLabel,
  searchLabel,
  commandLabel,
  collapseLabel,
  expandLabel,
  showCollapse,
}: {
  sections: readonly RailSection[]
  sectionId: string
  onSectionChange: (id: string) => void
  panelVisible: boolean
  onTogglePanel?: () => void
  showCollapse: boolean
} & Pick<
  RailSidebarProps,
  | "activeHref"
  | "renderLink"
  | "onNavigate"
  | "workspace"
  | "user"
  | "footerSlot"
  | "onSearch"
  | "onOpenCommand"
  | "searchPlaceholder"
  | "type"
  | "mark"
  | "markLabel"
  | "className"
  | "railClassName"
  | "panelClassName"
  | "itemClassName"
  | "groupClassName"
  | "headerClassName"
  | "footerClassName"
  | "searchClassName"
  | "railLabel"
  | "panelLabel"
  | "searchLabel"
  | "commandLabel"
  | "collapseLabel"
  | "expandLabel"
>) {
  const accordion = type ?? "single"
  const railRef = React.useRef<HTMLElement>(null)
  const section = sections.find((item) => item.id === sectionId) ?? sections[0]
  const primary = sections.filter((item) => item.placement !== "secondary")
  const secondary = sections.filter((item) => item.placement === "secondary")
  const [workspaceId, setWorkspaceId] = useControllable(
    workspace?.value,
    workspace?.defaultValue ?? workspace?.options?.[0]?.id,
    workspace?.onValueChange,
  )
  const activeWorkspace =
    workspace?.options?.find((option) => option.id === workspaceId) ??
    (workspace
      ? { id: workspaceId, name: workspace.name, subtitle: workspace.subtitle, logo: workspace.logo }
      : undefined)

  const sectionKey = section?.id ?? ""
  const defaultOpenIds = section?.nav.flatMap((group) =>
    group.items.filter((item) => item.defaultOpen && item.items?.length).map((item) => item.id),
  ) ?? []
  const [openBySection, setOpenBySection] = React.useState<Record<string, { single: string | null; many: string[] }>>({})
  const openState = openBySection[sectionKey] ?? {
    single: defaultOpenIds[0] ?? null,
    many: defaultOpenIds,
  }
  const singleOpen = openState.single
  const manyOpen = openState.many

  React.useEffect(() => {
    if (!onOpenCommand) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k" || !(event.metaKey || event.ctrlKey)) return
      event.preventDefault()
      onOpenCommand()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [onOpenCommand])

  function toggleEntry(id: string) {
    setOpenBySection((current) => {
      const previous = current[sectionKey] ?? {
        single: defaultOpenIds[0] ?? null,
        many: defaultOpenIds,
      }
      if (accordion === "single") {
        return { ...current, [sectionKey]: { ...previous, single: previous.single === id ? null : id } }
      }
      const many = previous.many.includes(id) ? previous.many.filter((item) => item !== id) : [...previous.many, id]
      return { ...current, [sectionKey]: { ...previous, many } }
    })
  }

  function onRailKeyDown(event: React.KeyboardEvent<HTMLElement>) {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"]
    if (!keys.includes(event.key)) return
    const buttons = [...(railRef.current?.querySelectorAll<HTMLButtonElement>("[data-rail-section]") ?? [])]
    if (!buttons.length) return
    event.preventDefault()
    const index = buttons.findIndex((button) => button === document.activeElement)
    const next =
      event.key === "Home"
        ? 0
        : event.key === "End"
          ? buttons.length - 1
          : event.key === "ArrowDown"
            ? (Math.max(index, 0) + 1) % buttons.length
            : (index <= 0 ? buttons.length : index) - 1
    buttons[next]?.focus()
  }

  const itemClass = cn(
    "flex w-full min-w-0 items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aria-[current=page]:bg-accent aria-[current=page]:font-medium",
    itemClassName,
  )

  const userMenu = user ? (
    <DropdownMenuContent align="start" className="w-56">
      <DropdownMenuLabel className="font-normal">
        <span className="block truncate text-sm font-medium">{user.name}</span>
        {user.email ? <span className="block truncate text-xs text-muted-foreground">{user.email}</span> : null}
      </DropdownMenuLabel>
      {footerSlot}
    </DropdownMenuContent>
  ) : null

  return (
    <TooltipProvider>
      <div className={cn("flex h-full min-h-0 w-full min-w-0", className)}>
        <nav
          ref={railRef}
          aria-label={railLabel ?? "Sections"}
          onKeyDown={onRailKeyDown}
          className={cn(
            "flex w-12 shrink-0 flex-col items-center gap-1 border-e border-border bg-sidebar px-1.5 py-2 text-sidebar-foreground",
            railClassName,
          )}
        >
          <div className="mb-1 grid size-8 place-items-center rounded-lg bg-primary text-xs font-semibold text-primary-foreground">
            {mark ?? (markLabel ?? "A").slice(0, 1)}
          </div>
          <div className="flex w-full flex-col items-center gap-1">
            {primary.map((item) => (
              <RailSectionButton
                key={item.id}
                item={item}
                pressed={item.id === section?.id}
                onSelect={onSectionChange}
              />
            ))}
          </div>
          <div className="mt-auto flex w-full flex-col items-center gap-1">
            {showCollapse && onTogglePanel ? (
              <button
                type="button"
                onClick={onTogglePanel}
                aria-pressed={panelVisible}
                aria-label={panelVisible ? (collapseLabel ?? "Collapse panel") : (expandLabel ?? "Expand panel")}
                className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <PanelLeftIcon className="size-4" />
              </button>
            ) : null}
            {secondary.map((item) => (
              <RailSectionButton
                key={item.id}
                item={item}
                pressed={item.id === section?.id}
                onSelect={onSectionChange}
              />
            ))}
            {user ? (
              panelVisible ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="mt-1 inline-flex">
                      <Avatar size="sm">
                        {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                        <AvatarFallback>{initials(user.name)}</AvatarFallback>
                      </Avatar>
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>{user.name}</TooltipContent>
                </Tooltip>
              ) : (
                <DropdownMenu>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger
                        aria-label={user.name}
                        className="mt-1 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <Avatar size="sm">
                          {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                          <AvatarFallback>{initials(user.name)}</AvatarFallback>
                        </Avatar>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <TooltipContent>{user.name}</TooltipContent>
                  </Tooltip>
                  {userMenu}
                </DropdownMenu>
              )
            ) : null}
          </div>
        </nav>

        {panelVisible ? (
          <div
            id="rail-panel"
            role="region"
            aria-label={panelLabel ?? section?.label ?? "Navigation"}
            className={cn("flex min-w-0 flex-1 flex-col bg-card", panelClassName)}
          >
            <div className={cn("flex flex-col gap-2 p-3", headerClassName)}>
              {workspace && activeWorkspace ? (
                workspace.options && workspace.options.length > 0 ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      className="flex w-full items-center gap-2 rounded-lg bg-muted px-2 py-2 text-start hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <WorkspaceMark logo={activeWorkspace.logo} name={activeWorkspace.name} />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">{activeWorkspace.name}</span>
                        {activeWorkspace.subtitle ? (
                          <span className="block truncate text-xs text-muted-foreground">{activeWorkspace.subtitle}</span>
                        ) : null}
                      </span>
                      <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      {workspace.options.map((option) => (
                        <DropdownMenuItem key={option.id} onSelect={() => setWorkspaceId(option.id)} className="gap-2">
                          <WorkspaceMark logo={option.logo} name={option.name} />
                          <span className="min-w-0">
                            <span className="block truncate">{option.name}</span>
                            {option.subtitle ? (
                              <span className="block truncate text-xs text-muted-foreground">{option.subtitle}</span>
                            ) : null}
                          </span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <div className="flex items-center gap-2 rounded-lg bg-muted px-2 py-2">
                    <WorkspaceMark logo={workspace.logo} name={workspace.name} />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium">{workspace.name}</span>
                      {workspace.subtitle ? (
                        <span className="block truncate text-xs text-muted-foreground">{workspace.subtitle}</span>
                      ) : null}
                    </span>
                  </div>
                )
              ) : null}

              <div className={cn("relative", searchClassName)}>
                <Search className="pointer-events-none absolute start-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  aria-label={searchLabel ?? "Search"}
                  aria-keyshortcuts="Meta+K"
                  placeholder={searchPlaceholder ?? "Search or ask AI…"}
                  onChange={(event) => onSearch?.(event.target.value)}
                  className="ps-8 pe-14 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
                />
                {onOpenCommand ? (
                  <button
                    type="button"
                    onClick={onOpenCommand}
                    aria-label={commandLabel ?? "Open command menu"}
                    className="absolute end-1.5 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <kbd>⌘K</kbd>
                  </button>
                ) : (
                  <kbd className="pointer-events-none absolute end-2 top-1/2 -translate-y-1/2 rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-2 pb-2">
              {section?.nav.map((group) => (
                <div key={group.id} className={cn("mb-2", groupClassName)}>
                  {group.label ? (
                    <p className="truncate px-2 py-1.5 text-xs font-medium text-muted-foreground">{group.label}</p>
                  ) : null}
                  <ul className="flex flex-col gap-0.5">
                    {group.items.map((item) => {
                      const nested = item.items ?? []
                      const open = nested.length > 0 && entryOpen(accordion, singleOpen, manyOpen, item.id)
                      const active = Boolean(item.href && item.href === activeHref)
                      return (
                        <li key={item.id}>
                          {nested.length > 0 ? (
                            <button
                              type="button"
                              aria-expanded={open}
                              aria-controls={`${item.id}-items`}
                              onClick={() => toggleEntry(item.id)}
                              className={itemClass}
                            >
                              {open ? (
                                <ChevronDown className="size-4 shrink-0 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="size-4 shrink-0 text-muted-foreground rtl:rotate-180" />
                              )}
                              <ItemBody item={item} />
                            </button>
                          ) : (
                            <RailAnchor
                              item={item}
                              active={active}
                              className={itemClass}
                              renderLink={renderLink}
                              onNavigate={onNavigate}
                            />
                          )}
                          {nested.length > 0 ? (
                            <div
                              id={`${item.id}-items`}
                              className={cn(
                                "grid transition-[grid-template-rows,opacity] duration-200 ease-out motion-reduce:transition-none",
                                open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                              )}
                              inert={open ? undefined : true}
                            >
                              <div className="overflow-hidden">
                                <ul className="ms-4 flex flex-col gap-0.5 border-s border-border py-0.5 ps-2">
                                  {nested.map((child) => (
                                    <li key={child.id}>
                                      <RailAnchor
                                        item={child}
                                        active={Boolean(child.href && child.href === activeHref)}
                                        className={itemClass}
                                        renderLink={renderLink}
                                        onNavigate={onNavigate}
                                      />
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            </div>
                          ) : null}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              ))}
              {!section?.nav.length ? (
                <p className="px-2 py-3 text-sm text-muted-foreground">No links</p>
              ) : null}
            </div>

            {user ? (
              <div className={cn("border-t border-border p-2", footerClassName)}>
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-start hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar size="sm">
                      {user.avatarUrl ? <AvatarImage src={user.avatarUrl} alt="" /> : null}
                      <AvatarFallback>{initials(user.name)}</AvatarFallback>
                    </Avatar>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{user.name}</span>
                      {user.email ? <span className="block truncate text-xs text-muted-foreground">{user.email}</span> : null}
                    </span>
                    <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
                  </DropdownMenuTrigger>
                  {userMenu}
                </DropdownMenu>
              </div>
            ) : footerSlot ? (
              <div className={cn("border-t border-border p-2", footerClassName)}>{footerSlot}</div>
            ) : null}
          </div>
        ) : null}
      </div>
    </TooltipProvider>
  )
}

function WorkspaceMark({ logo, name }: { logo?: React.ReactNode; name: string }) {
  return (
    <span className="grid size-8 shrink-0 place-items-center rounded-md bg-background text-xs font-semibold">
      {logo ?? initials(name).slice(0, 1)}
    </span>
  )
}

function RailSectionButton({
  item,
  pressed,
  onSelect,
}: {
  item: RailSection
  pressed: boolean
  onSelect: (id: string) => void
}) {
  const label = item.badge != null && item.badge !== "" ? `${item.label}, ${item.badge}` : item.label
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          data-rail-section=""
          aria-pressed={pressed}
          aria-label={label}
          tabIndex={pressed ? 0 : -1}
          onClick={() => onSelect(item.id)}
          className={cn(
            "relative grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            pressed && "bg-accent text-accent-foreground",
          )}
        >
          <span className="[&_svg]:size-4">{item.icon}</span>
          {item.badge != null && item.badge !== "" ? (
            <span className="absolute end-1 top-1 size-1.5 rounded-full bg-primary" aria-hidden />
          ) : null}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

function columnProps(props: RailSidebarProps, sectionId: string, onSectionChange: (id: string) => void, panelVisible: boolean, onTogglePanel?: () => void, showCollapse = true) {
  return {
    sections: props.sections,
    sectionId,
    onSectionChange,
    activeHref: props.activeHref,
    renderLink: props.renderLink,
    onNavigate: props.onNavigate,
    workspace: props.workspace,
    user: props.user,
    footerSlot: props.footerSlot,
    onSearch: props.onSearch,
    onOpenCommand: props.onOpenCommand,
    searchPlaceholder: props.searchPlaceholder,
    type: props.type,
    mark: props.mark,
    markLabel: props.markLabel,
    railClassName: props.railClassName,
    panelClassName: props.panelClassName,
    itemClassName: props.itemClassName,
    groupClassName: props.groupClassName,
    headerClassName: props.headerClassName,
    footerClassName: props.footerClassName,
    searchClassName: props.searchClassName,
    railLabel: props.railLabel,
    panelLabel: props.panelLabel,
    searchLabel: props.searchLabel,
    commandLabel: props.commandLabel,
    collapseLabel: props.collapseLabel,
    expandLabel: props.expandLabel,
    panelVisible,
    onTogglePanel,
    showCollapse,
  }
}

function ContainedRail(props: RailSidebarProps) {
  const [sectionId, setSectionId] = useControllable(
    props.value,
    props.defaultValue ?? props.sections[0]?.id,
    props.onValueChange,
  )
  const [panelOpen, setPanelOpen] = React.useState(true)
  const collapsible = props.collapsible ?? "icon"
  const panelVisible = collapsible === "none" ? true : panelOpen
  return (
    <div className={cn("flex h-full min-h-0 w-full overflow-hidden rounded-xl border border-border bg-card", props.className)}>
      <RailColumns
        {...columnProps(
          props,
          sectionId,
          setSectionId,
          panelVisible,
          collapsible === "none" ? undefined : () => setPanelOpen((open) => !open),
          collapsible !== "none",
        )}
      />
    </div>
  )
}

function ShellRail(props: RailSidebarProps) {
  const { state, isMobile, toggleSidebar } = useSidebar()
  const [sectionId, setSectionId] = useControllable(
    props.value,
    props.defaultValue ?? props.sections[0]?.id,
    props.onValueChange,
  )
  const collapsible = props.collapsible ?? "icon"
  const panelVisible = collapsible === "none" ? true : isMobile || state === "expanded"
  return (
    <>
      <Sidebar
        collapsible={collapsible}
        className="border-0 bg-transparent"
        style={{ "--sidebar-width": "20rem" } as React.CSSProperties}
      >
        <div className="flex h-full min-h-0 overflow-hidden bg-sidebar md:my-2 md:ms-2 md:rounded-xl md:border md:border-border md:bg-card md:shadow-sm">
          <RailColumns
            {...columnProps(props, sectionId, setSectionId, panelVisible, toggleSidebar, collapsible !== "none")}
          />
        </div>
      </Sidebar>
      <SidebarInset className={props.insetClassName}>
        <div className="flex items-center gap-2 border-b border-border p-2 md:hidden">
          <SidebarTrigger />
        </div>
        {props.children}
      </SidebarInset>
    </>
  )
}

export function RailSidebar(props: RailSidebarProps) {
  if (props.contained) return <ContainedRail {...props} />
  return (
    <SidebarProvider
      className={cn("min-h-svh", props.className)}
      style={{ "--sidebar-width": "20rem", "--sidebar-width-icon": "3rem" } as React.CSSProperties}
    >
      <ShellRail {...props} />
    </SidebarProvider>
  )
}

export { SidebarTrigger as RailSidebarTrigger }
