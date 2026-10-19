"use client"

import { StressCase } from "@/app/examples/stress-case"

import { AppShell, type ShellNavItem, type ShellProject } from "@/registry/blocks/app-shell"

const long = "a".repeat(60)
const manyNav: ShellNavItem[] = Array.from({ length: 10 }, (_, index) => ({ id: `n-${index}`, label: `Sección ${index + 1}` }))
const manyProjects: ShellProject[] = Array.from({ length: 10 }, (_, index) => ({ id: `p-${index}`, name: `Proyecto ${index + 1}` }))

export default function StressPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-semibold">Estrés · Shell de la aplicación</h1>
      <StressCase label="320px" width={320}>
        <AppShell className="h-[28rem] min-h-0">
          <p className="p-3 text-sm">Tarjeta</p>
        </AppShell>
      </StressCase>
      <StressCase label="Ancho">
        <div className="w-[960px] max-w-none">
          <AppShell className="h-[28rem] min-h-0" nav={manyNav} projects={manyProjects} />
        </div>
      </StressCase>
      <StressCase label="RTL" width={320}>
        <div dir="rtl">
          <AppShell className="h-[24rem] min-h-0" workspace={{ id: "rtl", name: "مرحبا" }} user={{ name: "مرحبا" }} />
        </div>
      </StressCase>
      <StressCase label="Vacío, una palabra, 60 caracteres y ocupado">
        <AppShell
          className="h-[24rem] min-h-0"
          busy
          nav={[]}
          projects={[]}
          gettingStarted={{ label: long, items: [] }}
          workspace={{ id: "long", name: long }}
          user={{ name: "Horno" }}
        >
          <p className="p-3 text-sm break-all">{long}</p>
        </AppShell>
      </StressCase>
    </main>
  )
}
