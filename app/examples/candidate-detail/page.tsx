import type { Metadata } from "next"

import { CandidateDetailDemo } from "./demo"

export const metadata: Metadata = {
  title: "Detalle del candidato",
  description: "Panel de candidato con debrief y scorecards. Datos inventados.",
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
        <h1 className="mt-1 text-2xl font-semibold">Detalle del candidato</h1>
        <p className="mt-2 text-sm text-muted-foreground">El debrief suma las scorecards. Mover etapa llama al callback y puede rechazarse.</p>
      </header>
      <CandidateDetailDemo />
    </main>
  )
}
