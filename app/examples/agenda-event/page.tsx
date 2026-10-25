import type { Metadata } from "next"

import { AgendaEventDemo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta de evento",
  description: "Evento de agenda con horario, categoría y estado en curso.",
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
        <h1 className="mt-1 text-2xl font-semibold">Tarjeta de evento</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Alt y flechas mueven el horario cuando hay un callback. Datos inventados del Estudio Cálamo.
        </p>
      </header>
      <AgendaEventDemo />
    </main>
  )
}
