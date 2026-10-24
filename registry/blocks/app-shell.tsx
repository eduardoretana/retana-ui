"use client"

/**
 * Workspace chrome for product screens. Public Affect UI previews suggested
 * the arrangement (sidebar, progress, content card). No Affect source, copy,
 * or assets are included — the host theme supplies every color.
 */

import * as React from "react"
import { PanelLeft, Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export const shellDensity = {
  comfortable: {
    sidebar: "w-64",
    pad: "gap-3 p-3",
    item: "min-h-8 px-2.5 py-1.5 text-sm",
  },
  compact: {
    sidebar: "w-56",
    pad: "gap-2 p-2",
    item: "min-h-7 px-2 py-1 text-xs",
  },
} as const

export type ShellDensity = keyof typeof shellDensity

export type ShellWorkspace = {
  id: string
  name: string
  plan?: string
}

export type ShellNavItem = {
  id: string
  label: string
  href?: string
  icon?: React.ReactNode
  badge?: string
}

export type ShellProject = {
  id: string
  name: string
  href?: string
}

export type ShellStep = {
  id: string
  label: string
  done: boolean
}

export type ShellGettingStarted = {
  label: string
  items: ShellStep[]
}

export type ShellUser = {
  name: string
  email?: string
  initials?: string
}

export type ShellAction = {
  id: string
  label: string
}

export type AppShellClassNames = {
  root?: string
  sidebar?: string
  nav?: string
  projects?: string
  progress?: string
  user?: string
  card?: string
}

export type AppShellProps = {
  workspace?: ShellWorkspace
  workspaces?: ShellWorkspace[]
  onWorkspaceChange?: (id: string) => void
  nav?: ShellNavItem[]
  projects?: ShellProject[]
  projectsLabel?: string
  gettingStarted?: ShellGettingStarted
  onStepToggle?: (id: string, done: boolean) => void
  user?: ShellUser
  userActions?: ShellAction[]
  onUserAction?: (id: string) => void
  activeId?: string
  defaultActiveId?: string
  onNavigate?: (id: string) => void
  density?: ShellDensity
  collapsed?: boolean
  defaultCollapsed?: boolean
  onCollapsedChange?: (collapsed: boolean) => void
  collapseLabel?: string
  expandLabel?: string
  sidebarLabel?: string
  navLabel?: string
  showSearch?: boolean
  searchLabel?: string
  searchPlaceholder?: string
  onSearch?: (query: string) => void
  children?: React.ReactNode
  className?: string
  classNames?: AppShellClassNames
  busy?: boolean
  contentLabel?: string
}

export const acmeWorkspace: ShellWorkspace = { id: "acme", name: "Acme", plan: "Equipo" }

export const acmeWorkspaces: ShellWorkspace[] = [
  acmeWorkspace,
  { id: "harbor", name: "Harbor", plan: "Inicio" },
]

export const acmeNav: ShellNavItem[] = [
  { id: "home", label: "Inicio" },
  { id: "inbox", label: "Bandeja", badge: "3" },
  { id: "assistant", label: "Asistente" },
  { id: "settings", label: "Ajustes" },
]

export const acmeProjects: ShellProject[] = [
  { id: "faro", name: "Faro" },
  { id: "cuaderno", name: "Cuaderno" },
  { id: "lumen", name: "Lumen" },
]

export const acmeGettingStarted: ShellGettingStarted = {
  label: "Primeros pasos",
  items: [
    { id: "space", label: "Nombrar el espacio", done: true },
    { id: "invite", label: "Invitar a una persona", done: true },
    { id: "tool", label: "Conectar una herramienta", done: false },
    { id: "brief", label: "Escribir un encargo", done: false },
  ],
}

export const acmeUser: ShellUser = {
  name: "Mara Solís",
  email: "mara@acme.example",
  initials: "MS",
}

export const acmeShellProps: Pick<
  AppShellProps,
  "workspace" | "workspaces" | "nav" | "projects" | "gettingStarted" | "user" | "activeId"
> = {
  workspace: acmeWorkspace,
  workspaces: acmeWorkspaces,
  nav: acmeNav,
  projects: acmeProjects,
  gettingStarted: acmeGettingStarted,
  user: acmeUser,
}

function nameInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (!parts.length) return "·"
  return parts
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("")
}

export function ScreenFrame({
  shell = true,
  shellProps,
  children,
  className,
  classNames,
}: {
  shell?: boolean
  shellProps?: Partial<AppShellProps>
  children: React.ReactNode
  className?: string
  classNames?: AppShellClassNames
}) {
  if (!shell) {
    return (
      <div className={cn("flex min-h-dvh min-w-0 flex-col bg-background text-foreground", className)}>
        {children}
      </div>
    )
  }
  return (
    <AppShell className={className} classNames={classNames} {...acmeShellProps} {...shellProps}>
      {children}
    </AppShell>
  )
}

export function AppShell({
  workspace = acmeWorkspace,
  workspaces = acmeWorkspaces,
  onWorkspaceChange,
  nav = acmeNav,
  projects = acmeProjects,
  projectsLabel = "Proyectos",
  gettingStarted = acmeGettingStarted,
  onStepToggle,
  user = acmeUser,
  userActions = [
    { id: "account", label: "Cuenta" },
    { id: "sign-out", label: "Cerrar sesión" },
  ],
  onUserAction,
  activeId: activeIdProp,
  defaultActiveId = "home",
  onNavigate,
  density = "comfortable",
  collapsed: collapsedProp,
  defaultCollapsed = false,
  onCollapsedChange,
  collapseLabel = "Ocultar barra",
  expandLabel = "Mostrar barra",
  sidebarLabel = "Espacio de trabajo",
  navLabel = "Secciones",
  showSearch = true,
  searchLabel = "Buscar en el espacio",
  searchPlaceholder = "Buscar",
  onSearch,
  children,
  className,
  classNames,
  busy = false,
  contentLabel = "Contenido",
}: AppShellProps) {
  const densityClass = shellDensity[density]
  const listId = React.useId()
  const searchId = React.useId()
  const userMenuId = React.useId()
  const [workspaceOpen, setWorkspaceOpen] = React.useState(false)
  const [userOpen, setUserOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [collapsedState, setCollapsedState] = React.useState(defaultCollapsed)
  const collapsed = collapsedProp ?? collapsedState
  const [activeState, setActiveState] = React.useState(defaultActiveId)
  const activeId = activeIdProp ?? activeState
  const [steps, setSteps] = React.useState(gettingStarted.items)
  const progressItems = onStepToggle ? gettingStarted.items : steps
  const done = progressItems.filter((item) => item.done).length
  const total = progressItems.length
  const ratio = total === 0 ? 0 : Math.round((done / total) * 100)
  const needle = query.trim().toLowerCase()
  const visibleNav = needle ? nav.filter((item) => item.label.toLowerCase().includes(needle)) : nav
  const visibleProjects = needle
    ? projects.filter((item) => item.name.toLowerCase().includes(needle))
    : projects

  function setCollapsed(next: boolean) {
    onCollapsedChange?.(next)
    if (collapsedProp === undefined) setCollapsedState(next)
  }

  function select(id: string) {
    onNavigate?.(id)
    if (activeIdProp === undefined) setActiveState(id)
  }

  function toggleStep(step: ShellStep) {
    const nextDone = !step.done
    onStepToggle?.(step.id, nextDone)
    if (!onStepToggle) {
      setSteps((current) => current.map((item) => (item.id === step.id ? { ...item, done: nextDone } : item)))
    }
  }

  const initials = user.initials?.trim() || nameInitials(user.name)

  return (
    <div
      data-slot="app-shell"
      data-density={density}
      data-collapsed={collapsed ? "true" : "false"}
      className={cn(
        "@container/shell flex h-dvh min-h-[32rem] w-full min-w-0 bg-muted/40 p-2 text-foreground",
        className,
        classNames?.root,
      )}
    >
      <div className="flex min-h-0 w-full min-w-0 flex-1 flex-col gap-2 @min-[800px]/shell:flex-row">
        {collapsed ? null : (
          <aside
            aria-label={sidebarLabel}
            className={cn(
              "flex max-h-[46%] min-h-0 shrink-0 flex-col overflow-hidden rounded-xl border border-sidebar-border bg-sidebar text-sidebar-foreground @min-[800px]/shell:max-h-none",
              densityClass.sidebar,
              densityClass.pad,
              classNames?.sidebar,
            )}
          >
            <div className="relative">
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full justify-start px-2 py-1.5 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                aria-expanded={workspaces.length > 1 ? workspaceOpen : undefined}
                aria-controls={workspaces.length > 1 ? listId : undefined}
                aria-haspopup={workspaces.length > 1 ? "listbox" : undefined}
                onClick={() => {
                  if (workspaces.length > 1) setWorkspaceOpen((open) => !open)
                }}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-md bg-sidebar-primary text-xs font-semibold text-sidebar-primary-foreground">
                  {(workspace.name.trim()[0] ?? "A").toUpperCase()}
                </span>
                <span className="min-w-0 flex-1 text-left">
                  <span className="block truncate font-medium">{workspace.name || "Espacio"}</span>
                  {workspace.plan ? (
                    <span className="block truncate text-xs text-muted-foreground">{workspace.plan}</span>
                  ) : null}
                </span>
              </Button>
              {workspaceOpen && workspaces.length > 1 ? (
                <ul
                  id={listId}
                  role="listbox"
                  aria-label="Espacios"
                  className="absolute inset-x-0 top-full z-10 mt-1 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
                >
                  {workspaces.map((item) => (
                    <li key={item.id} role="presentation">
                      <button
                        type="button"
                        role="option"
                        aria-selected={item.id === workspace.id}
                        className="flex w-full min-w-0 items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                        onClick={() => {
                          onWorkspaceChange?.(item.id)
                          setWorkspaceOpen(false)
                        }}
                      >
                        <span className="truncate">{item.name}</span>
                        {item.plan ? <span className="shrink-0 text-xs text-muted-foreground">{item.plan}</span> : null}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>

            {showSearch ? (
              <form
                onSubmit={(event) => {
                  event.preventDefault()
                  onSearch?.(query)
                }}
              >
                <label htmlFor={searchId} className="sr-only">
                  {searchLabel}
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id={searchId}
                    value={query}
                    placeholder={searchPlaceholder}
                    className="h-8 bg-background pl-7"
                    onChange={(event) => {
                      setQuery(event.target.value)
                      onSearch?.(event.target.value)
                    }}
                  />
                </div>
              </form>
            ) : null}

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-auto">
              <nav aria-label={navLabel} className={cn("flex flex-col gap-0.5", classNames?.nav)}>
                {visibleNav.length === 0 ? (
                  <p className="px-2 text-xs text-muted-foreground">Sin secciones</p>
                ) : (
                  visibleNav.map((item) => {
                    const current = item.id === activeId
                    const itemClass = cn(
                      "flex w-full min-w-0 items-center gap-2 rounded-md text-left motion-safe:transition-colors motion-reduce:transition-none hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                      densityClass.item,
                      current && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                    )
                    const inner = (
                      <>
                        {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
                        <span className="min-w-0 flex-1 truncate">{item.label}</span>
                        {item.badge ? (
                          <span className="shrink-0 rounded-full bg-sidebar-primary px-1.5 text-[10px] font-medium text-sidebar-primary-foreground tabular-nums">
                            {item.badge}
                          </span>
                        ) : null}
                      </>
                    )
                    if (item.href) {
                      return (
                        <a
                          key={item.id}
                          href={item.href}
                          aria-current={current ? "page" : undefined}
                          className={itemClass}
                          onClick={() => select(item.id)}
                        >
                          {inner}
                        </a>
                      )
                    }
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-current={current ? "page" : undefined}
                        className={itemClass}
                        onClick={() => select(item.id)}
                      >
                        {inner}
                      </button>
                    )
                  })
                )}
              </nav>

              <div className={cn("flex flex-col gap-0.5", classNames?.projects)}>
                <p className="px-2 text-[11px] font-medium tracking-wide text-muted-foreground uppercase">{projectsLabel}</p>
                {visibleProjects.length === 0 ? (
                  <p className="px-2 text-xs text-muted-foreground">Sin proyectos</p>
                ) : (
                  <ul className="flex flex-col gap-0.5">
                    {visibleProjects.map((project) => {
                      const current = project.id === activeId
                      const itemClass = cn(
                        "flex w-full min-w-0 items-center rounded-md text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                        densityClass.item,
                        current && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
                      )
                      const label = <span className="truncate">{project.name}</span>
                      return (
                        <li key={project.id}>
                          {project.href ? (
                            <a href={project.href} aria-current={current ? "page" : undefined} className={itemClass} onClick={() => select(project.id)}>
                              {label}
                            </a>
                          ) : (
                            <button type="button" aria-current={current ? "page" : undefined} className={itemClass} onClick={() => select(project.id)}>
                              {label}
                            </button>
                          )}
                        </li>
                      )
                    })}
                  </ul>
                )}
              </div>

              <div className={cn("rounded-lg border border-sidebar-border bg-background/60 p-2.5", classNames?.progress)}>
                <div className="flex items-center justify-between gap-2 text-xs">
                  <p className="min-w-0 truncate font-medium">{gettingStarted.label}</p>
                  <p className="shrink-0 tabular-nums text-muted-foreground">
                    {done} de {total}
                  </p>
                </div>
                <div
                  className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted"
                  role="progressbar"
                  aria-valuemin={0}
                  aria-valuemax={Math.max(total, 1)}
                  aria-valuenow={done}
                  aria-label={gettingStarted.label}
                >
                  <div
                    className="h-full rounded-full bg-primary motion-safe:transition-[width] motion-reduce:transition-none"
                    style={{ width: `${ratio}%` }}
                  />
                </div>
                {progressItems.length > 0 ? (
                  <ul className="mt-2 flex flex-col gap-1">
                    {progressItems.map((step) => (
                      <li key={step.id}>
                        <label className="flex min-w-0 items-start gap-2 text-xs text-muted-foreground">
                          <input
                            type="checkbox"
                            className="mt-0.5 size-3.5 shrink-0 accent-primary"
                            checked={step.done}
                            onChange={() => toggleStep(step)}
                          />
                          <span className={cn("min-w-0 break-words", step.done && "line-through")}>{step.label}</span>
                        </label>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-muted-foreground">Nada pendiente</p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-1">
              <div className={cn("relative min-w-0 flex-1", classNames?.user)}>
                <button
                  type="button"
                  className="flex w-full min-w-0 items-center gap-2 rounded-md px-1.5 py-1 text-left hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                  aria-expanded={userOpen}
                  aria-controls={userMenuId}
                  onClick={() => setUserOpen((open) => !open)}
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-[10px] font-medium text-foreground">
                    {initials}
                  </span>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{user.name || "Invitado"}</span>
                    {user.email ? <span className="block truncate text-xs text-muted-foreground">{user.email}</span> : null}
                  </span>
                </button>
                {userOpen ? (
                  <ul
                    id={userMenuId}
                    className="absolute inset-x-0 bottom-full z-10 mb-1 rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-md"
                  >
                    {userActions.map((action) => (
                      <li key={action.id}>
                        <button
                          type="button"
                          className="w-full rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
                          onClick={() => {
                            onUserAction?.(action.id)
                            setUserOpen(false)
                          }}
                        >
                          {action.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              <Button type="button" variant="ghost" size="icon-sm" aria-label={collapseLabel} onClick={() => setCollapsed(true)}>
                <PanelLeft />
              </Button>
            </div>
          </aside>
        )}

        <section
          aria-label={contentLabel}
          aria-busy={busy || undefined}
          className={cn(
            "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden rounded-xl border border-border bg-background shadow-sm",
            classNames?.card,
          )}
        >
          {collapsed ? (
            <div className="flex items-center gap-2 border-b border-border px-3 py-2">
              <Button type="button" variant="outline" size="icon-sm" aria-label={expandLabel} onClick={() => setCollapsed(false)}>
                <PanelLeft />
              </Button>
              <p className="min-w-0 truncate text-sm font-medium">{workspace.name || "Espacio"}</p>
            </div>
          ) : null}
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-auto">{children}</div>
        </section>
      </div>
    </div>
  )
}
