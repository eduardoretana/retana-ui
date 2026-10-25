import type { Metadata } from "next"

import { TaskCardDemo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta de encargo",
  description: "Tarjeta con prioridad, responsables y fecha. Datos de demostración.",
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
        <h1 className="mt-1 text-2xl font-semibold">Tarjeta de encargo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Flechas en el título cambian la etapa. Datos inventados de la Cooperativa Lumen.
        </p>
      </header>
      <TaskCardDemo />
    </main>
  )
}
