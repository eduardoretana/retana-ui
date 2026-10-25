import type { Metadata } from "next"

import { CandidateCardDemo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta de candidato",
  description: "Tarjeta de kanban con puntaje y evaluación. Datos inventados.",
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
        <h1 className="mt-1 text-2xl font-semibold">Tarjeta de candidato</h1>
        <p className="mt-2 text-sm text-muted-foreground">Flechas en el nombre cambian la etapa si la transición está permitida.</p>
      </header>
      <CandidateCardDemo />
    </main>
  )
}
