"use client"

import { FolderKanban, LayoutDashboard, Settings, Users } from "lucide-react"

import { RailSidebar, type RailSection } from "@/registry/blocks/rail-sidebar"

const sections: RailSection[] = [
  {
    id: "studio",
    label: "Estudio",
    icon: <FolderKanban />,
    nav: [
      {
        id: "top",
        items: [
          { id: "home", label: "Inicio", href: "/home", icon: <LayoutDashboard /> },
          { id: "inbox", label: "Bandeja", href: "/inbox", badge: 9 },
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
            items: [{ id: "active", label: "Activos", href: "/projects", badge: 5, dot: "chart-1" }],
          },
        ],
      },
    ],
  },
  { id: "people", label: "Personas", icon: <Users />, placement: "secondary", nav: [] },
  { id: "settings", label: "Ajustes", icon: <Settings />, placement: "secondary", nav: [] },
]

export default function RailSidebarPreview() {
  return (
    <div className="h-full bg-muted/30 p-2">
      <RailSidebar
        contained
        sections={sections}
        defaultValue="studio"
        activeHref="/projects"
        markLabel="L"
        workspace={{ name: "Lumen Field", subtitle: "18 personas" }}
        user={{ name: "Elena Voss", email: "elena@lumenfield.example" }}
        className="h-full"
      />
    </div>
  )
}
