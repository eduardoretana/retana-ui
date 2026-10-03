import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Campo de búsqueda",
  description: "Entrada de búsqueda con un control para limpiar.",
}

export default function SearchFieldPage() {
  return (
    <ExampleFrame title="Campo de búsqueda" description="El botón de limpiar aparece con el texto y devuelve el foco al campo.">
      <Demo />
    </ExampleFrame>
  )
}
