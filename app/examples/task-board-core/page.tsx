import type { Metadata } from "next"

import { TaskBoardCoreDemo } from "./demo"

export const metadata: Metadata = {
  title: "Núcleo del tablero",
  description: "Fechas, vencidos, conteos y posición. Datos de demostración.",
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
        <h1 className="mt-1 text-2xl font-semibold">Núcleo del tablero</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Funciones puras. El tablero y el detalle las usan. Los encargos son de demostración.
        </p>
      </header>
      <TaskBoardCoreDemo />
    </main>
  )
}
