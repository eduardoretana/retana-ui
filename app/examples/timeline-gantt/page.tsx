import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Cronograma",
  description: "Cronograma por frentes con avance, resumen de fase y un panel de edición. Datos de un taller inventado.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Cronograma"
      description="Taller Bruma, una imprenta inventada. El avance rellena la barra. El panel pide el cambio y el anfitrión lo guarda."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
