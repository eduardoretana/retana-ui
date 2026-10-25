import type { Metadata } from "next"

import { TaskDetailDemo } from "./demo"

export const metadata: Metadata = {
  title: "Detalle del encargo",
  description: "Campos, subtareas y comentarios. Datos de demostración.",
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
        <h1 className="mt-1 text-2xl font-semibold">Detalle del encargo</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Flecha izquierda y derecha cambian de encargo cuando el foco no está en un campo. Datos inventados.
        </p>
      </header>
      <TaskDetailDemo />
    </main>
  )
}
