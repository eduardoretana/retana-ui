"use client"

import { Folder, House } from "lucide-react"

import { StressCase } from "@/app/examples/stress-case"
import { RailSidebar, type RailSection } from "@/registry/blocks/rail-sidebar"

const word = "Inicio"
const sentences = "El estudio prepara la entrega del jueves y todavía faltan tres revisiones del cliente."
const unbroken = "A".repeat(60)
const emoji = "🚀 Lanzamiento"
const rtl = "مرحبا بالفريق"

function section(id: string, label: string, items: RailSection["nav"][number]["items"]): RailSection {
  return { id, label, icon: <House />, nav: [{ id: `${id}-nav`, label, items }] }
}

const realistic: RailSection = {
  id: "studio",
  label: "Estudio",
  icon: <Folder />,
  badge: 3,
  nav: [
    {
      id: "top",
      items: [
        { id: "home", label: "Inicio", href: "/home" },
        { id: "inbox", label: "Bandeja", href: "/inbox", badge: 12 },
      ],
    },
    {
      id: "work",
      label: "Estudio",
      items: [
        {
          id: "projects",
          label: "Proyectos",
          defaultOpen: true,
          items: [
            { id: "a", label: "Activos", href: "/a", badge: 4, dot: "chart-2" },
            { id: "b", label: "Archivo", href: "/b", dot: "muted" },
          ],
        },
      ],
    },
  ],
}

const manyItems = Array.from({ length: 40 }, (_, index) => ({
  id: `item-${index}`,
  label: index % 5 === 0 ? unbroken : `Elemento ${index + 1}`,
  href: `/item/${index}`,
  badge: index % 4 === 0 ? index : undefined,
}))

export default function RailSidebarStressPage() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · barra lateral</h1>
      <StressCase label="Vacío" width={360}>
        <RailSidebar contained sections={[]} user={{ name: "Elena Voss", email: "elena@lumenfield.example" }} className="h-80" />
      </StressCase>
      <StressCase label="Una palabra" width={360}>
        <RailSidebar contained sections={[section("one", word, [{ id: "only", label: word, href: "/one" }])]} className="h-80" />
      </StressCase>
      <StressCase label="Varias frases" width={360}>
        <RailSidebar
          contained
          sections={[section("long", sentences, [{ id: "long", label: sentences, href: "/long" }])]}
          className="h-80"
        />
      </StressCase>
      <StressCase label="Cadena de 60 caracteres" width={360}>
        <RailSidebar
          contained
          sections={[section("raw", unbroken, [{ id: "raw", label: unbroken, href: "/raw" }])]}
          className="h-80"
        />
      </StressCase>
      <StressCase label="Emoji" width={360}>
        <RailSidebar contained sections={[section("emoji", emoji, [{ id: "emoji", label: emoji, href: "/emoji" }])]} className="h-80" />
      </StressCase>
      <StressCase label="Texto de derecha a izquierda" width={360}>
        <div dir="rtl">
          <RailSidebar contained sections={[section("rtl", rtl, [{ id: "rtl", label: rtl, href: "/rtl" }])]} className="h-80" />
        </div>
      </StressCase>
      <StressCase label="Cantidad 0 enlaces" width={360}>
        <RailSidebar contained sections={[{ id: "empty", label: "Vacío", icon: <House />, nav: [] }]} className="h-80" />
      </StressCase>
      <StressCase label="Cantidad 1" width={360}>
        <RailSidebar contained sections={[section("solo", "Solo", [{ id: "solo", label: "Solo", href: "/solo" }])]} className="h-80" />
      </StressCase>
      <StressCase label="Realista" width={360}>
        <RailSidebar
          contained
          sections={[realistic]}
          defaultValue="studio"
          activeHref="/a"
          workspace={{ name: "Lumen Field", subtitle: "18 personas" }}
          user={{ name: "Elena Voss", email: "elena@lumenfield.example" }}
          className="h-96"
        />
      </StressCase>
      <StressCase label="10× elementos" width={360}>
        <RailSidebar contained sections={[section("many", "Lista", manyItems)]} className="h-96" />
      </StressCase>
      <StressCase label="Contenedor 320px" width={320}>
        <RailSidebar contained sections={[realistic]} workspace={{ name: "Lumen Field", subtitle: "Estudio de producto · 18 personas" }} className="h-96" />
      </StressCase>
      <StressCase label="Apretado por un hermano">
        <div className="flex w-80 gap-2">
          <div className="w-36 shrink-0 rounded-md bg-muted p-2 text-sm">Hermano</div>
          <div className="min-w-0 flex-1">
            <RailSidebar contained sections={[realistic]} className="h-80" />
          </div>
        </div>
      </StressCase>
      <StressCase label="Muy ancho" width={1100}>
        <RailSidebar contained sections={[realistic]} workspace={{ name: "Lumen Field", subtitle: "18 personas" }} className="h-80" />
      </StressCase>
      <StressCase label="Deshabilitado" width={360}>
        <RailSidebar
          contained
          sections={[section("off", "Estudio", [{ id: "off", label: "No disponible", href: "/off", disabled: true }])]}
          className="h-64"
        />
      </StressCase>
    </main>
  )
}
