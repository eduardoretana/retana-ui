import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Respuesta con fuentes",
  description: "El anticipo y la entrega, cada frase con el pasaje que la sostiene.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Respuesta con fuentes"
      description="Abre una cita para ver el pasaje. Una fuente que no existe no deja un número roto."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
