import type { Metadata } from "next"

import { AssessmentFormDemo } from "./demo"

export const metadata: Metadata = {
  title: "Evaluación",
  description: "Formulario de scorecard. Datos inventados.",
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
        <h1 className="mt-1 text-2xl font-semibold">Agregar evaluación</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Cada criterio se califica con estrellas. Al enviar sale un scorecard con criterios, promedio y veredicto.
        </p>
      </header>
      <AssessmentFormDemo />
    </main>
  )
}
