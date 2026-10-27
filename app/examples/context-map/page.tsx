import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Mapa del contexto",
  description: "Qué llena la ventana del taller: archivos, charla y el resumen.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Mapa del contexto"
      description="Abre un bloque o compara antes y después de resumir. El espacio libre sigue a la vista."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
