"use client"

import * as React from "react"
import {
  ChevronRight,
  Moon,
  Search,
  Sun,
  SunMoon,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import { toast, Toaster } from "sonner"

import { cn } from "@/lib/utils"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import {
  useAdminTheme,
  type ThemeChoice,
  type ThemeController,
} from "@/registry/retana/hooks/use-admin-theme"

export type AdminNavItem = {
  href: string
  label: string
  icon: LucideIcon
  description?: string
}

export type AdminNavGroup = {
  label: string
  items: AdminNavItem[]
}

export type AdminCrumb = {
  label: string
  href?: string
}

export type AdminLinkProps = {
  href: string
  className?: string
  children?: React.ReactNode
  title?: string
  onClick?: (event: React.MouseEvent<HTMLAnchorElement>) => void
  "aria-current"?: "page" | undefined
}

export type AdminShellProps = {
  groups: readonly AdminNavGroup[]
  pathname: string
  onNavigate?: (href: string) => void
  linkComponent?: React.ComponentType<AdminLinkProps>
  /** Brand block in the sidebar header. */
  brand?: React.ReactNode
  /** Right side of the top bar, before the theme button. */
  actions?: React.ReactNode
  theme?: ThemeChoice
  resolvedTheme?: "light" | "dark"
  onThemeChange?: (theme: ThemeChoice) => void
  /** next-themes (or any host) controller. Wins over theme/onThemeChange. */
  themeController?: ThemeController
  commandLabel?: string
  className?: string
  contentClassName?: string
  showToaster?: boolean
  children?: React.ReactNode
}

export function breadcrumbsFor(
  groups: readonly AdminNavGroup[],
  pathname: string,
  rootLabel = "Admin",
): AdminCrumb[] {
  const crumbs: AdminCrumb[] = [{ label: rootLabel, href: groups[0]?.items[0]?.href }]
  for (const group of groups) {
    for (const item of group.items) {
      const exact = pathname === item.href
      const nested = item.href !== "/" && pathname.startsWith(`${item.href}/`)
      if (exact || nested) {
        crumbs.push({ label: item.label, href: item.href })
        return crumbs
      }
    }
  }
  return crumbs
}

function ThemeIcon({ theme }: { theme: ThemeChoice }) {
  if (theme === "dark") return <Moon />
  if (theme === "light") return <Sun />
  return <SunMoon />
}

export function AdminShell({
  groups,
  pathname,
  onNavigate,
  linkComponent,
  brand,
  actions,
  theme,
  resolvedTheme,
  onThemeChange,
  themeController,
  commandLabel = "Search pages",
  className,
  contentClassName,
  showToaster = true,
  children,
}: AdminShellProps) {
  const controller = themeController ?? (
    onThemeChange
      ? {
          theme: theme ?? "system",
          setTheme: onThemeChange,
          resolvedTheme,
        }
      : undefined
  )
  const themeState = useAdminTheme(controller)
  const [commandOpen, setCommandOpen] = React.useState(false)
  const crumbs = breadcrumbsFor(groups, pathname)
  const LinkComponent = linkComponent ?? "a"

  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  function go(href: string) {
    onNavigate?.(href)
    setCommandOpen(false)
  }

  return (
    <SidebarProvider className={cn("min-h-svh bg-background", className)}>
      <Sidebar collapsible="icon" className="border-sidebar-border">
        <SidebarHeader className="border-b border-sidebar-border">
          {brand ?? (
            <div className="px-2 py-1 text-sm font-semibold group-data-[collapsible=icon]:hidden">
              Admin
            </div>
          )}
        </SidebarHeader>
        <SidebarContent>
          {groups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const active = pathname === item.href
                    const Icon = item.icon
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.label}>
                          <LinkComponent
                            href={item.href}
                            aria-current={active ? "page" : undefined}
                            onClick={(event) => {
                              if (onNavigate) {
                                event.preventDefault()
                                go(item.href)
                              }
                            }}
                          >
                            <Icon />
                            <span>{item.label}</span>
                          </LinkComponent>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarRail />
      </Sidebar>
      <SidebarInset className="min-w-0 bg-background">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-2 border-b border-border bg-background/95 px-3 backdrop-blur-sm motion-reduce:backdrop-blur-none">
          <SidebarTrigger className="motion-reduce:transition-none" />
          <Breadcrumb>
            <BreadcrumbList>
              {crumbs.map((crumb, index) => {
                const last = index === crumbs.length - 1
                return (
                  <React.Fragment key={`${crumb.label}-${index}`}>
                    {index > 0 ? (
                      <BreadcrumbSeparator>
                        <ChevronRight />
                      </BreadcrumbSeparator>
                    ) : null}
                    <BreadcrumbItem>
                      {last || !crumb.href ? (
                        <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <LinkComponent
                            href={crumb.href}
                            onClick={(event) => {
                              if (onNavigate && crumb.href) {
                                event.preventDefault()
                                go(crumb.href)
                              }
                            }}
                          >
                            {crumb.label}
                          </LinkComponent>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                )
              })}
            </BreadcrumbList>
          </Breadcrumb>
          <div className="ml-auto flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="hidden sm:inline-flex"
              onClick={() => setCommandOpen(true)}
            >
              <Search />
              {commandLabel}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="sm:hidden"
              aria-label={commandLabel}
              onClick={() => setCommandOpen(true)}
            >
              <Search />
            </Button>
            {actions}
            <Button
              type="button"
              variant="ghost"
              size="icon"
              aria-label={`Theme: ${themeState.theme}`}
              onClick={themeState.cycle}
            >
              <ThemeIcon theme={themeState.theme} />
            </Button>
          </div>
        </header>
        <div className={cn("flex min-w-0 flex-1 flex-col gap-4 p-4 md:p-6", contentClassName)}>
          {children}
        </div>
      </SidebarInset>
      <CommandDialog
        open={commandOpen}
        onOpenChange={setCommandOpen}
        title={commandLabel}
        description={commandLabel}
      >
        <CommandInput placeholder={commandLabel} />
        <CommandList>
          <CommandEmpty>No pages</CommandEmpty>
          {groups.map((group) => (
            <CommandGroup key={group.label} heading={group.label}>
              {group.items.map((item) => {
                const Icon = item.icon
                return (
                  <CommandItem
                    key={item.href}
                    value={`${item.label} ${item.description ?? ""}`}
                    onSelect={() => go(item.href)}
                  >
                    <Icon />
                    <span>{item.label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
      {showToaster ? (
        <Toaster
          theme={themeState.resolvedTheme}
          richColors
          closeButton
        />
      ) : null}
    </SidebarProvider>
  )
}

export { toast as adminToast }
