import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Árbol de navegación",
  description: "Tarjeta con carpetas, conteos y línea guía.",
}

export default function TreeNavPage() {
  return (
    <ExampleFrame
      title="Árbol de navegación"
      description="Abre una carpeta con el clic o con la flecha derecha. Escribe para saltar a una fila visible."
    >
      <Demo />
    </ExampleFrame>
  )
}
