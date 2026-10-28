import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Acciones del mensaje",
  description: "Copiar, pedir otra versión, anotar por qué y leer la respuesta del taller.",
}

export default function Page() {
  return (
    <ExampleFrame title="Acciones del mensaje" description="La barra queda bajo la respuesta ya cerrada. Otra versión no borra la anterior." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
