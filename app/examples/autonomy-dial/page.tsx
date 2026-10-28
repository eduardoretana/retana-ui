import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Dial de autonomía",
  description: "Tres paradas para lo que un agente puede hacer solo, y un candado para lo que siempre pregunta.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Dial de autonomía"
      description="Cambia el nivel o pon un candado. El primer cambio en Error vuelve al nivel anterior."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
