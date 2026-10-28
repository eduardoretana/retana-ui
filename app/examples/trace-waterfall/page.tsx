import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Trazo de la corrida",
  description: "Dónde se fue el tiempo de la cotización del cobalto, con el paso más lento marcado.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Trazo de la corrida"
      description="La cotización PED-1048 en un solo reloj. El precio del esmalte es el tramo lento. Plegado esconde los pasos de Bruma."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
