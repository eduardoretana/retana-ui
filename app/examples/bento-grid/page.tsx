import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Rejilla bento",
  description: "Celdas con span que a 390 px quedan en una columna y en desktop arman el muro.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Rejilla bento"
      description="Cada celda pide su tramo o un preset: compacta, ancha, alta o grande. A 390 px hay una columna y el dibujo sigue el ancho real de la celda."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
