import type { Metadata } from "next"

import { AgendaCoreDemo } from "./demo"

export const metadata: Metadata = {
  title: "Núcleo de la agenda",
  description: "Zonas horarias, traslapes y la semana que empieza en lunes.",
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
        <h1 className="mt-1 text-2xl font-semibold">Núcleo de la agenda</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Funciones puras. La agenda las usa para colocar eventos. Los datos son de demostración.
        </p>
      </header>
      <AgendaCoreDemo />
    </main>
  )
}
