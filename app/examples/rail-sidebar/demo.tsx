"use client"

import { useState } from "react"
import {
  CircleHelp,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Users,
} from "lucide-react"

import { ThemeToggle } from "@/components/demo/theme-toggle"
import { DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import { RailSidebar, type RailSection } from "@/registry/blocks/rail-sidebar"

const sections: RailSection[] = [
  {
    id: "home",
    label: "Inicio",
    icon: <LayoutDashboard />,
    nav: [
      {
        id: "top",
        items: [
          { id: "home", label: "Inicio", href: "/home", icon: <LayoutDashboard /> },
          { id: "updates", label: "Novedades", href: "/updates", badge: 4 },
          { id: "inbox", label: "Bandeja", href: "/inbox", badge: 9 },
          { id: "tasks", label: "Mis tareas", href: "/tasks", badge: 3 },
        ],
      },
    ],
  },
  {
    id: "studio",
    label: "Estudio",
    icon: <FolderKanban />,
    badge: 6,
    nav: [
      {
        id: "top",
        items: [
          { id: "home", label: "Inicio", href: "/home" },
          { id: "updates", label: "Novedades", href: "/updates", badge: 4 },
          { id: "inbox", label: "Bandeja", href: "/inbox", badge: 9 },
          { id: "mine", label: "Mis tareas", href: "/tasks", badge: 3 },
        ],
      },
      {
        id: "workspace",
        label: "Estudio",
        items: [
          {
            id: "projects",
            label: "Proyectos",
            defaultOpen: true,
            items: [
              { id: "active", label: "Proyectos activos", href: "/projects", badge: 5, dot: "chart-1" },
              { id: "templates", label: "Plantillas", href: "/templates" },
              { id: "archive", label: "Archivo", href: "/archive", dot: "muted" },
            ],
          },
          {
            id: "tasks",
            label: "Tareas",
            items: [
              { id: "assigned", label: "Asignadas", href: "/tasks/assigned", badge: 7, dot: "chart-2" },
              { id: "review", label: "Revisión", href: "/tasks/review", badge: 2, dot: "chart-4" },
              { id: "done", label: "Hechas", href: "/tasks/done", dot: "chart-3" },
            ],
          },
          { id: "views", label: "Vistas", href: "/views" },
          { id: "teams", label: "Equipos", href: "/teams" },
          { id: "reports", label: "Informes", href: "/reports" },
        ],
      },
      {
        id: "projects-list",
        label: "Proyectos",
        items: [
          { id: "cedro", label: "Móvil Cedro", href: "/projects/cedro" },
          { id: "bruma", label: "Sitio Bruma", href: "/projects/bruma" },
        ],
      },
    ],
  },
  {
    id: "people",
    label: "Personas",
    icon: <Users />,
    nav: [
      {
        id: "people",
        items: [
          { id: "directory", label: "Directorio", href: "/people" },
          { id: "invites", label: "Invitaciones", href: "/people/invites", badge: 1 },
        ],
      },
    ],
  },
  {
    id: "settings",
    label: "Ajustes",
    icon: <Settings />,
    placement: "secondary",
    nav: [
      {
        id: "settings",
        items: [
          { id: "prefs", label: "Preferencias", href: "/settings" },
          { id: "billing", label: "Facturación", href: "/settings/billing" },
        ],
      },
    ],
  },
  {
    id: "help",
    label: "Ayuda",
    icon: <CircleHelp />,
    placement: "secondary",
    nav: [
      {
        id: "help",
        items: [{ id: "docs", label: "Guías", href: "/help" }],
      },
    ],
  },
]

export function Demo() {
  const [href, setHref] = useState("/projects")
  const [query, setQuery] = useState("")
  const [commandOpen, setCommandOpen] = useState(false)

  return (
    <RailSidebar
      sections={sections}
      defaultValue="studio"
      activeHref={href}
      onNavigate={setHref}
      onSearch={setQuery}
      onOpenCommand={() => setCommandOpen(true)}
      searchPlaceholder="Buscar o preguntar a la IA…"
      searchLabel="Buscar"
      commandLabel="Abrir comandos"
      railLabel="Secciones"
      markLabel="L"
      workspace={{
        name: "Lumen Field",
        subtitle: "Estudio de producto · 18 personas",
        options: [
          { id: "lumen", name: "Lumen Field", subtitle: "Estudio de producto · 18 personas" },
          { id: "orilla", name: "Orilla", subtitle: "Estudio de marca · 6 personas" },
          { id: "taller", name: "Taller Cinco", subtitle: "Interno · 4 personas" },
        ],
        defaultValue: "lumen",
      }}
      user={{ name: "Elena Voss", email: "elena@lumenfield.example" }}
      footerSlot={
        <>
          <DropdownMenuSeparator />
          <DropdownMenuItem>Perfil</DropdownMenuItem>
          <DropdownMenuItem>Cerrar sesión</DropdownMenuItem>
        </>
      }
    >
      <div className="flex items-start justify-between gap-3 p-6">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Ruta activa</p>
          <h1 className="truncate text-xl font-semibold">{href}</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {commandOpen ? "Paleta de comandos solicitada." : "⌘K abre la paleta del anfitrión."}
          </p>
          {query ? <p className="mt-1 text-sm">Búsqueda: {query}</p> : null}
        </div>
        <ThemeToggle />
      </div>
    </RailSidebar>
  )
}
