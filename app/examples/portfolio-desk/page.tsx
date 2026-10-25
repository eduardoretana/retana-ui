import type { Metadata } from "next"

import { ThemeToggle } from "@/components/demo/theme-toggle"

import { PortfolioDeskDemo } from "./demo"

export const metadata: Metadata = {
  title: "Mesa de portafolio",
  description: "Cronograma, tabla, conversación y aprobación con datos inventados.",
}

export default function Page() {
  return (
    <main className="min-h-dvh bg-background">
      <header className="flex items-start gap-4 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
          <h1 className="text-lg font-semibold tracking-tight">Mesa de portafolio</h1>
          <p className="max-w-3xl text-sm text-muted-foreground">
            Las cuatro piezas juntas. Taller Bruma no existe: los nombres, las fechas y los mensajes son inventados.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <div className="px-4 pb-8">
        <PortfolioDeskDemo />
      </div>
    </main>
  )
}
