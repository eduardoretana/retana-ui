"use client"

import { Compass, House, LayoutGrid, Search, User, Wrench } from "lucide-react"

import { DockNav, type DockNavItem } from "@/registry/ui/dock-nav"

const items: DockNavItem[] = [
  { value: "home", label: "Inicio", icon: <House />, group: "main" },
  { value: "services", label: "Servicios", icon: <LayoutGrid />, group: "main" },
  { value: "pathways", label: "Rutas", icon: <Compass />, badge: "NUEVO", group: "main" },
  { value: "tools", label: "Herramientas", icon: <Wrench />, group: "main" },
  { value: "search", label: "Buscar", icon: <Search />, kind: "search", group: "account" },
  { value: "profile", label: "Perfil", icon: <User />, group: "account" },
]

export default function DockNavPreview() {
  return (
    <div className="flex h-full items-center justify-center overflow-hidden bg-muted/30 px-2">
      <div className="origin-center scale-[0.72]">
        <DockNav
          label="Principal"
          defaultValue="home"
          items={items}
          search={{ placeholder: "Busca servicios, rutas, herramientas..." }}
        />
      </div>
    </div>
  )
}
