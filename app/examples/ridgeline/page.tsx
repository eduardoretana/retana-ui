import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Crestas",
  description: "Varias distribuciones apiladas. El puntero o las flechas levantan una cresta.",
}

export default function RidgelinePage() {
  return (
    <ExampleFrame title="Crestas" description="Arriba y abajo eligen la cresta. Izquierda y derecha recorren los valores." wide>
      <Demo />
    </ExampleFrame>
  )
}
