import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Ventana de contexto",
  description: "Fuentes del taller dentro de una ventana de 80 000 tokens.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Ventana de contexto"
      description="El recorrido carga fuentes y compacta la charla. Reiniciar lo vuelve a empezar. En Error, el primer quitar se deshace."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
