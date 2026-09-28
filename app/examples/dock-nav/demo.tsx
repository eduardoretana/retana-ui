"use client"

import { useState } from "react"
import { Compass, House, LayoutGrid, Search, User, Wrench } from "lucide-react"

import { DockNav, type DockNavItem, type DockNavPosition } from "@/registry/ui/dock-nav"
import { cn } from "@/lib/utils"

const items: DockNavItem[] = [
  { value: "home", label: "Inicio", icon: <House />, group: "main" },
  { value: "services", label: "Servicios", icon: <LayoutGrid />, group: "main" },
  { value: "pathways", label: "Rutas", icon: <Compass />, badge: "NUEVO", group: "main" },
  { value: "tools", label: "Herramientas", icon: <Wrench />, group: "main" },
  { value: "search", label: "Buscar", icon: <Search />, kind: "search", group: "account" },
  { value: "profile", label: "Perfil", icon: <User />, href: "#perfil", group: "account" },
]

const positions: DockNavPosition[] = ["inline", "top", "bottom"]

export function Demo() {
  const [value, setValue] = useState("home")
  const [position, setPosition] = useState<DockNavPosition>("inline")
  const [query, setQuery] = useState("")
  const current = items.find((item) => item.value === value)

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Posición">
        {positions.map((option) => (
          <button
            key={option}
            type="button"
            aria-pressed={position === option}
            onClick={() => setPosition(option)}
            className={cn(
              "rounded-full border border-border px-3 py-1 text-sm",
              position === option ? "bg-foreground text-background" : "text-muted-foreground hover:bg-muted",
            )}
          >
            {option}
          </button>
        ))}
      </div>
      <div
        id="dock-demo"
        className="flex min-h-[28rem] flex-col items-center justify-center gap-8 rounded-2xl border border-border bg-muted/30 px-4 py-16"
      >
        <DockNav
          label="Principal"
          items={items}
          value={value}
          onValueChange={setValue}
          position={position}
          search={{
            placeholder: "Busca servicios, rutas, herramientas...",
            onSearch: setQuery,
          }}
        />
        <p className="text-sm text-muted-foreground">
          Ruta activa: <span className="text-foreground">{current?.label ?? value}</span>
          {query ? <span> · Búsqueda: {query}</span> : null}
        </p>
      </div>
    </div>
  )
}
