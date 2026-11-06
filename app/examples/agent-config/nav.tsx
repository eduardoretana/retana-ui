"use client"

import {
  Bell,
  Bot,
  Cable,
  ClipboardList,
  Database,
  Gauge,
  LayoutDashboard,
  ScrollText,
  Settings,
  Users,
  Workflow,
} from "lucide-react"

import type { SceneLocale } from "@/app/catalog/scene-types"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
} from "@/components/ui/sidebar"

const groups = {
  es: [
    {
      id: "workspace",
      label: "Espacio",
      items: [
        { id: "overview", label: "Resumen", icon: LayoutDashboard },
        { id: "workflows", label: "Flujos", icon: Workflow },
        { id: "builder", label: "Constructor de flujos", icon: Workflow },
        { id: "agents", label: "Configuración de agentes", icon: Bot, current: true },
      ],
    },
    {
      id: "operations",
      label: "Operación",
      items: [
        { id: "review", label: "Cola de revisión", icon: ClipboardList },
        { id: "runs", label: "Corridas", icon: Gauge },
        { id: "connectors", label: "Conectores", icon: Cable },
        { id: "sources", label: "Fuentes", icon: Database },
      ],
    },
    {
      id: "admin",
      label: "Administración",
      items: [
        { id: "team", label: "Equipo", icon: Users },
        { id: "notices", label: "Avisos", icon: Bell },
        { id: "audit", label: "Bitácora", icon: ScrollText },
        { id: "settings", label: "Ajustes", icon: Settings },
      ],
    },
  ],
  en: [
    {
      id: "workspace",
      label: "Workspace",
      items: [
        { id: "overview", label: "Overview", icon: LayoutDashboard },
        { id: "workflows", label: "Workflows", icon: Workflow },
        { id: "builder", label: "Workflow builder", icon: Workflow },
        { id: "agents", label: "Agent configuration", icon: Bot, current: true },
      ],
    },
    {
      id: "operations",
      label: "Operations",
      items: [
        { id: "review", label: "Review queue", icon: ClipboardList },
        { id: "runs", label: "Runs", icon: Gauge },
        { id: "connectors", label: "Connectors", icon: Cable },
        { id: "sources", label: "Sources", icon: Database },
      ],
    },
    {
      id: "admin",
      label: "Administration",
      items: [
        { id: "team", label: "Team", icon: Users },
        { id: "notices", label: "Notices", icon: Bell },
        { id: "audit", label: "Audit log", icon: ScrollText },
        { id: "settings", label: "Settings", icon: Settings },
      ],
    },
  ],
} as const

/** Existing sidebar primitives. The console only receives this as a slot. */
export function NimboNav({ locale }: { locale: SceneLocale }) {
  return (
    <SidebarProvider className="min-h-0 w-full">
      <Sidebar collapsible="none" className="w-full border-0">
        <SidebarContent>
          {groups[locale].map((group) => (
            <SidebarGroup key={group.id}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const Icon = item.icon
                    const current = "current" in item && item.current
                    return (
                      <SidebarMenuItem key={item.id}>
                        <SidebarMenuButton type="button" isActive={current} aria-current={current ? "page" : undefined}>
                          <Icon />
                          <span>{item.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>
      </Sidebar>
    </SidebarProvider>
  )
}
