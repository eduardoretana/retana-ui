import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Plan por periodo",
  description: "Real, pronóstico y reparto sobre una cuadrícula.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Plan por periodo"
      description="Grupos con banda, real sólido y pronóstico claro, reparto con el deslizador, y celdas que se editan como hoja."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
