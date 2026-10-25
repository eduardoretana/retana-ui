import type { Metadata } from "next"

import { ThemeToggle } from "@/components/demo/theme-toggle"

import { AgendaDemo } from "./demo"

export const metadata: Metadata = {
  title: "Agenda",
  description: "Agenda por día, semana y mes. Datos de demostración de un estudio inventado.",
}

export default function Page() {
  return (
    <main className="flex h-dvh flex-col bg-background">
      <header className="flex items-start gap-4 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
          <h1 className="text-lg font-semibold tracking-tight">Agenda</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Estudio Cálamo, un taller inventado. Alt y flechas mueven el evento. El botón de sincronizar no llama a ningún proveedor.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <div className="min-h-0 flex-1 px-3 pb-3">
        <AgendaDemo />
      </div>
    </main>
  )
}
