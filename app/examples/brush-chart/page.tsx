import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Gráfico con cepillo",
  description: "Toda la historia abajo y un recorte que se mueve con el teclado.",
}

export default function BrushChartPage() {
  return (
    <ExampleFrame wide title="Gráfico con cepillo" description="La franja de abajo es la historia completa. Las flechas mueven la ventana y leen el punto que queda a la vista.">
      <Demo />
    </ExampleFrame>
  )
}
