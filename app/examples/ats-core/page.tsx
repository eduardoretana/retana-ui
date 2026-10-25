import type { Metadata } from "next"

import { AtsCoreDemo } from "./demo"

export const metadata: Metadata = {
  title: "Núcleo de candidatos",
  description: "Puntajes, embudo y recomendación. Datos de demostración.",
}

export default function Page() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-8">
      <header>
        <p className="text-xs font-medium tracking-[0.14em] text-muted-foreground uppercase">Ejemplo</p>
        <h1 className="mt-1 text-2xl font-semibold">Núcleo de candidatos</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Funciones puras. La etapa la calcula el anfitrión. Los nombres son de Taller Nube, un estudio inventado.
        </p>
      </header>
      <AtsCoreDemo />
    </main>
  )
}
