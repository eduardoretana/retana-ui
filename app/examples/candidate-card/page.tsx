import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta de candidato",
  description: "Avatar, fecha de aplicación, puntaje, avance por etapa y agregar evaluación.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Tarjeta de candidato"
      description="Flechas en el nombre cambian la etapa si la transición está permitida. El primer intento en Error se deshace."
    >
      <Demo />
    </ExampleFrame>
  )
}
