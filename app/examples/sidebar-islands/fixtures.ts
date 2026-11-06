import type { SceneLocale } from "@/app/catalog/scene-types"
import type { NavBadge, NavItem, NavSection, NavTeam, SidebarIslandsLabels, SidebarIslandsStatus, SidebarMeter, SidebarProfile } from "@/registry/ui/sidebar-islands"
import { sidebarIslandsLabels, sidebarIslandsLabelsEn } from "@/registry/ui/sidebar-islands"

export type Copy = {
  id: string
  es: string
  en: string
  badge?: NavBadge
  hidden?: boolean
  children?: readonly Copy[]
}

export type IslandFixture = {
  id: string
  sections: readonly Copy[]
  collapsed: boolean
  openIds: readonly string[]
  status: SidebarIslandsStatus
  activeId: string
  teamId: string
}

const informes: Copy = {
  id: "informes",
  es: "Informes",
  en: "Reports",
  children: [
    { id: "prospectos", es: "Prospectos", en: "Leads", badge: { count: 18, tone: "neutral" } },
    {
      id: "ventas",
      es: "Ventas",
      en: "Sales",
      children: [
        {
          id: "trimestre",
          es: "Trimestre",
          en: "Quarter",
          children: [{ id: "semana", es: "Semana 14", en: "Week 14" }],
        },
      ],
    },
    { id: "actividad", es: "Actividad", en: "Activity" },
  ],
}

const catalog: Copy[] = [
  { id: "bandeja", es: "Bandeja", en: "Inbox", badge: { count: 5, tone: "alert", label: "5 sin leer" } },
  { id: "tratos", es: "Tratos", en: "Deals" },
  { id: "personas", es: "Personas", en: "People" },
  {
    id: "tareas",
    es: "Tareas",
    en: "Tasks",
    badge: { count: 3, tone: "neutral" },
    children: [
      { id: "hoy", es: "Para hoy", en: "Due today" },
      { id: "espera", es: "En espera", en: "Waiting" },
    ],
  },
  informes,
  {
    id: "automatizaciones",
    es: "Automatizaciones",
    en: "Automations",
    children: [
      { id: "seguimiento", es: "Seguimiento", en: "Follow-up" },
      { id: "recordatorio", es: "Recordatorio", en: "Reminder" },
    ],
  },
  { id: "agenda", es: "Agenda", en: "Schedule" },
  { id: "favoritos", es: "Favoritos", en: "Favorites" },
]

export const utilities: readonly Copy[] = [
  { id: "ajustes", es: "Ajustes", en: "Settings" },
  { id: "ayuda", es: "Ayuda", en: "Help" },
]

export const filled: IslandFixture = {
  id: "filled",
  sections: catalog,
  collapsed: false,
  openIds: ["informes"],
  status: "ready",
  activeId: "bandeja",
  teamId: "norte",
}

export const empty: IslandFixture = {
  id: "empty",
  sections: [],
  collapsed: false,
  openIds: [],
  status: "empty",
  activeId: "",
  teamId: "norte",
}

export const loading: IslandFixture = {
  id: "loading",
  sections: [],
  collapsed: false,
  openIds: [],
  status: "loading",
  activeId: "",
  teamId: "norte",
}

export const error: IslandFixture = {
  id: "error",
  sections: [],
  collapsed: false,
  openIds: [],
  status: "error",
  activeId: "",
  teamId: "norte",
}

export const rail: IslandFixture = {
  id: "rail",
  sections: catalog,
  collapsed: true,
  openIds: [],
  status: "ready",
  activeId: "bandeja",
  teamId: "norte",
}

export const role: IslandFixture = {
  id: "role",
  sections: catalog.map((section) => {
    if (section.id === "bandeja") return { ...section, badge: { count: 12840, tone: "alert" as const, label: "12840 sin leer" } }
    if (section.id === "tareas") return { ...section, badge: { count: 2400, tone: "neutral" as const } }
    if (section.id === "automatizaciones" || section.id === "favoritos") return { ...section, hidden: true }
    return section
  }),
  collapsed: false,
  openIds: ["informes", "ventas", "trimestre"],
  status: "ready",
  activeId: "semana",
  teamId: "bajio",
}

export function islandLabels(locale: SceneLocale): SidebarIslandsLabels {
  return locale === "en" ? sidebarIslandsLabelsEn : sidebarIslandsLabels
}

export function islandTeams(locale: SceneLocale): NavTeam[] {
  const en = locale === "en"
  return [
    { id: "norte", name: en ? "North workshop" : "Taller Norte", detail: "León" },
    { id: "bajio", name: en ? "Bajío workshop" : "Taller Bajío", detail: "Celaya" },
  ]
}

export function islandMeter(locale: SceneLocale): SidebarMeter {
  return { used: 42, limit: 800, label: locale === "en" ? "Agent seats" : "Lugares de agente" }
}

export function islandProfile(locale: SceneLocale): Omit<SidebarProfile, "items" | "onSignOut" | "onThemeChange" | "theme"> {
  return {
    name: "Camila Ortega",
    email: "camila.ortega@taller-norte.example",
    plan: locale === "en" ? "Team" : "Equipo",
  }
}

export function islandMenu(locale: SceneLocale) {
  return locale === "en"
    ? [
        { id: "billing", label: "Review billing" },
        { id: "settings", label: "Open settings" },
        { id: "help", label: "Open help" },
      ]
    : [
        { id: "billing", label: "Revisar la facturación" },
        { id: "settings", label: "Abrir ajustes" },
        { id: "help", label: "Abrir la ayuda" },
      ]
}

function itemFrom(copy: Copy, locale: SceneLocale): NavItem {
  const item: NavItem = { id: copy.id, label: locale === "en" ? copy.en : copy.es }
  if (copy.badge) item.badge = copy.badge
  if (copy.hidden) item.hidden = true
  if (copy.children?.length) item.children = copy.children.map((child) => itemFrom(child, locale))
  return item
}

export function islandSections(copies: readonly Copy[], locale: SceneLocale): NavSection[] {
  return copies.map((copy) => {
    const item = itemFrom(copy, locale)
    const section: NavSection = { id: item.id, label: item.label }
    if (item.badge) section.badge = item.badge
    if (item.hidden) section.hidden = true
    if (item.children) section.items = item.children
    return section
  })
}

export function islandUtilities(locale: SceneLocale): NavItem[] {
  return utilities.map((copy) => itemFrom(copy, locale))
}
