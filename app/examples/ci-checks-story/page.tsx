import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Escenario de comprobaciones",
  description: "Crear, fallar, arreglar y fusionar un pull request ficticio del Taller Ladrillo.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame
      size="wide"
      title="Escenario de comprobaciones"
      description="El escenario recorre crear, fallar, arreglar y fusionar. La pastilla nace cerrada. Nada llama a GitHub."
    >
      <Demo />
    </ExampleFrame>
  )
}
