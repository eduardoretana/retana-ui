"use client"

import type { ReactNode } from "react"
import { BarChart3, Calendar, Heart, Inbox, LifeBuoy, ListChecks, Play, Settings, Tag, Users } from "lucide-react"

import { formatSceneCall, type Scene, type SceneFrame, type SceneRenderProps } from "@/app/catalog/scene-types"
import { useSceneSim } from "@/app/catalog/use-scene-sim"
import { SidebarIslands, type NavItem, type NavSection, type SidebarTheme } from "@/registry/ui/sidebar-islands"

import {
  empty,
  error as broken,
  filled,
  islandLabels,
  islandMenu,
  islandMeter,
  islandProfile,
  islandSections,
  islandTeams,
  islandUtilities,
  loading,
  rail,
  role,
  type IslandFixture,
} from "./fixtures"

const frame: SceneFrame = { size: "lg", surface: "canvas", padding: "md" }

const icons: Record<string, ReactNode> = {
  bandeja: <Inbox aria-hidden />,
  tratos: <Tag aria-hidden />,
  personas: <Users aria-hidden />,
  tareas: <ListChecks aria-hidden />,
  informes: <BarChart3 aria-hidden />,
  automatizaciones: <Play aria-hidden />,
  agenda: <Calendar aria-hidden />,
  favoritos: <Heart aria-hidden />,
  ajustes: <Settings aria-hidden />,
  ayuda: <LifeBuoy aria-hidden />,
}

function paint(items: readonly NavItem[]): NavItem[] {
  return items.map((item) => {
    const next: NavItem = { id: item.id, label: item.label }
    const icon = icons[item.id]
    if (icon) next.icon = icon
    if (item.badge) next.badge = item.badge
    if (item.hidden) next.hidden = true
    if (item.children) next.children = paint(item.children)
    return next
  })
}

function paintSections(sections: readonly NavSection[]): NavSection[] {
  return sections.map((section) => {
    const next: NavSection = { id: section.id, label: section.label }
    const icon = icons[section.id]
    if (icon) next.icon = icon
    if (section.badge) next.badge = section.badge
    if (section.hidden) next.hidden = true
    if (section.items) next.items = paint(section.items)
    return next
  })
}

type IslandState = {
  collapsed: boolean
  activeId: string
  teamId: string
  status: IslandFixture["status"]
  theme: SidebarTheme
}

function snapshot(fixture: IslandFixture): IslandState {
  return {
    collapsed: fixture.collapsed,
    activeId: fixture.activeId,
    teamId: fixture.teamId,
    status: fixture.status,
    theme: "system",
  }
}

function IslandScene({ locale, log, fixture }: SceneRenderProps & { fixture: IslandFixture }) {
  const sim = useSceneSim(snapshot(fixture), log)
  const labels = islandLabels(locale)
  const profile = islandProfile(locale)
  return (
    <SidebarIslands
      className="h-[34rem]"
      label={labels.navigation}
      labels={labels}
      locale={locale === "en" ? "en" : "es-MX"}
      sections={paintSections(islandSections(fixture.sections, locale))}
      utilities={paint(islandUtilities(locale))}
      teams={islandTeams(locale)}
      teamId={sim.state.teamId}
      onTeamChange={(teamId) => {
        sim.patch(formatSceneCall("onTeamChange", [teamId]), (current) => ({ ...current, teamId }))
      }}
      collapsed={sim.state.collapsed}
      onCollapsedChange={(collapsed) => {
        sim.patch(formatSceneCall("onCollapsedChange", [collapsed]), (current) => ({ ...current, collapsed }))
      }}
      activeId={sim.state.activeId}
      onNavigate={(id) => {
        sim.patch(formatSceneCall("onNavigate", [id]), (current) => ({ ...current, activeId: id }))
      }}
      defaultOpenIds={fixture.openIds}
      onSearch={() => log(formatSceneCall("onSearch"))}
      meter={islandMeter(locale)}
      profile={{
        ...profile,
        theme: sim.state.theme,
        items: islandMenu(locale).map((item) => ({
          ...item,
          onSelect: () => log(formatSceneCall("onProfile", [item.id])),
        })),
        onSignOut: () => log(formatSceneCall("onSignOut")),
        onThemeChange: (theme) => {
          sim.patch(formatSceneCall("onThemeChange", [theme]), (current) => ({ ...current, theme }))
        },
      }}
      status={sim.state.status}
      onRetry={() => {
        sim.patch(formatSceneCall("onRetry"), (current) => ({ ...current, status: "ready", collapsed: false }))
      }}
      onEmptyAction={() => log(formatSceneCall("onEmptyAction"))}
    />
  )
}

function scene(id: string, fixture: IslandFixture, label: string, labelEn: string): Scene {
  return {
    id,
    label,
    labelEn,
    frame,
    render: function Render(props: SceneRenderProps) {
      return <IslandScene {...props} fixture={fixture} />
    },
  }
}

export const scenes: Scene[] = [
  scene("filled", filled, "Lleno", "Filled"),
  scene("empty", empty, "Vacío", "Empty"),
  scene("loading", loading, "Cargando", "Loading"),
  scene("error", broken, "Error", "Error"),
  scene("rail", rail, "Riel", "Rail"),
  scene("role", role, "Rol", "Role"),
]
