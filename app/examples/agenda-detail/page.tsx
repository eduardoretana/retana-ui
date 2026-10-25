import type { Metadata } from "next"

import { AgendaDetailDemo } from "./demo"

export const metadata: Metadata = {
  title: "Detalle del evento",
  description: "Detalle y participantes de un evento. Datos de demostración.",
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
        <h1 className="mt-1 text-2xl font-semibold">Detalle del evento</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Detalle y participantes. Unirse, el resumen y la sala son callbacks. Datos inventados.
        </p>
      </header>
      <AgendaDetailDemo />
    </main>
  )
}
