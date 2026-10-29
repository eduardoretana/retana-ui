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
      description="Cada celda pide su tramo. A 390 px hay una columna. Desde 480 px hay dos. Desde 896 px se usa el número de columnas pedido."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
