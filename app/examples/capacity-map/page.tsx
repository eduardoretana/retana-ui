import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Mapa de cupos",
  description: "Cupos por zona enlazados con una tabla, con simulación de demanda que no se guarda.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Mapa de cupos"
      description="Zonas en acordeón, grupos con un pasillo, estados extensibles, resaltado cruzado con la tabla y una previsión de demanda que se descarta."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
