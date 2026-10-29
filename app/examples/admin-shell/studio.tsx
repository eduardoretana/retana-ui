"use client"

import { useState } from "react"
import { FolderKanban, LayoutDashboard, Users } from "lucide-react"

import { AdminShell, type AdminNavGroup } from "@/registry/ui/admin-shell"

const groups: AdminNavGroup[] = [
  {
    label: "Sitio",
    items: [
      { href: "resumen", label: "Resumen", icon: LayoutDashboard, description: "Qué pasa hoy" },
      { href: "proyectos", label: "Proyectos", icon: FolderKanban, description: "Trabajos publicados" },
      { href: "clientes", label: "Logos de clientes", icon: Users, description: "Marcas en la portada" },
    ],
  },
]

export function AdminShellDemo() {
  const [pathname, setPathname] = useState("proyectos")
  const current = groups[0]?.items.find((item) => item.href === pathname)

  return (
    <AdminShell
      groups={groups}
      pathname={pathname}
      onNavigate={setPathname}
      showToaster={false}
      commandLabel="Buscar páginas"
      emptyCommand="Ninguna página"
      themeLabel="Tema"
      themeNames={{ light: "claro", dark: "oscuro", system: "sistema" }}
      rootLabel="Estudio"
      sidebarLabel="Alternar el menú"
      brand={<p className="px-2 py-1 text-sm font-semibold">Estudio Acme</p>}
      actions={<span className="text-xs text-muted-foreground">Demostración</span>}
    >
      <div className="flex flex-col gap-2 p-6">
        <h1 className="text-xl font-semibold">{current?.label}</h1>
        <p className="max-w-prose text-sm text-muted-foreground">
          {current?.description}. La navegación no usa Next: el ejemplo cambia de pantalla con
          estado local. Cmd o Ctrl + K abre el buscador. El botón de tema alterna claro, oscuro y
          sistema.
        </p>
      </div>
    </AdminShell>
  )
}
