"use client"

import { Inbox } from "lucide-react"

import { StressCase } from "@/app/examples/stress-case"
import { SidebarIslands, type NavItem, type NavSection } from "@/registry/ui/sidebar-islands"

const token = "N".repeat(60)

function section(id: string, label: string, items?: NavItem[]): NavSection {
  const next: NavSection = { id, label, icon: <Inbox aria-hidden /> }
  if (items) next.items = items
  return next
}

const fifty: NavSection[] = Array.from({ length: 50 }, (_, index) =>
  section(index === 0 ? "vacio" : `fila-${index}`, index === 0 ? "" : index === 1 ? token : `Cuenta ${index}`, index === 3 ? [{ id: "hijo", label: token }] : undefined),
)

const deep: NavSection[] = [
  section("a", token, [{ id: "b", label: "المستوى الثاني", children: [{ id: "c", label: "Nivel 3 · semana" }] }]),
]

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold text-balance">Estrés · Islas de navegación</h1>
      <p className="max-w-2xl text-sm text-pretty text-muted-foreground">
        Cincuenta filas, un nombre de 60 caracteres, tres niveles, derecha a izquierda, 320 px y la hoja de 390 px. El teclado usa flechas, Inicio, Fin y Escape.
      </p>
      <StressCase label="Vacío">
        <SidebarIslands layout="rail" status="empty" className="h-80" />
      </StressCase>
      <StressCase label="Carga y error">
        <div className="flex flex-wrap gap-4">
          <SidebarIslands layout="rail" status="loading" className="h-80" />
          <SidebarIslands layout="rail" status="error" onRetry={() => {}} className="h-80" />
        </div>
      </StressCase>
      <StressCase label="50 ítems y nombre largo" width={360}>
        <SidebarIslands layout="rail" sections={fifty} activeId="fila-1" className="h-[28rem]" />
      </StressCase>
      <StressCase label="Tres niveles" width={320}>
        <SidebarIslands layout="rail" sections={deep} defaultOpenIds={["a", "b"]} className="h-80" />
      </StressCase>
      <StressCase label="RTL" width={360}>
        <div dir="rtl">
          <SidebarIslands layout="rail" sections={deep} defaultOpenIds={["a"]} className="h-80" />
        </div>
      </StressCase>
      <StressCase label="390 px · hoja" width={390}>
        <SidebarIslands layout="sheet" sections={fifty.slice(0, 8)} className="h-40" />
      </StressCase>
      <StressCase label="Emoji y segundo nivel">
        <SidebarIslands layout="rail" sections={[section("zoom", token, [{ id: "hijo", label: "😀 segundo nivel" }])]} defaultOpenIds={["zoom"]} className="h-80" />
      </StressCase>
      <StressCase label="Conteo grande y rol">
        <SidebarIslands
          layout="rail"
          sections={[
            { id: "bandeja", label: "Bandeja", icon: <Inbox aria-hidden />, badge: { count: 12840, tone: "alert" } },
            { id: "oculta", label: "Automatizaciones", hidden: true, icon: <Inbox aria-hidden /> },
          ]}
          className="h-80"
        />
      </StressCase>
    </main>
  )
}
