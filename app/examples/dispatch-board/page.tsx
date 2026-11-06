import type { Metadata } from "next"

import { ThemeToggle } from "@/components/demo/theme-toggle"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tablero de despacho",
  description: "Timeline horizontal por persona para visitas de campo. Datos de una cooperativa inventada.",
}

export default function Page() {
  return (
    <main className="flex h-dvh flex-col bg-background">
      <header className="flex items-start gap-4 px-4 py-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
          <h1 className="text-lg font-semibold tracking-tight">Tablero de despacho</h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            Campo Norte, una cooperativa inventada. Las filas son personas, las columnas son horas y la lista de la derecha guarda las visitas sin asignar.
          </p>
        </div>
        <ThemeToggle />
      </header>
      <div className="min-h-0 flex-1 px-3 pb-3">
        <Demo />
      </div>
    </main>
  )
}
