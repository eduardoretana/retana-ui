import type { Metadata } from "next"

import { CandidateRowDemo } from "./demo"

export const metadata: Metadata = {
  title: "Fila de candidato",
  description: "Fila de la lista con puntaje y etapa. Datos inventados.",
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
        <h1 className="mt-1 text-2xl font-semibold">Fila de candidato</h1>
        <p className="mt-2 text-sm text-muted-foreground">El orden inicial es por puntaje. La etapa la pone getStage.</p>
      </header>
      <CandidateRowDemo />
    </main>
  )
}
