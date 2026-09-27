import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Selección múltiple",
  description: "Selector con búsqueda, chips y creación de opciones.",
}

export default function MultiSelectPage() {
  return (
    <ExampleFrame title="Selección múltiple" description="Busca, marca varias fichas y crea una opción si no existe. Retroceso quita la última.">
      <Demo />
    </ExampleFrame>
  )
}
