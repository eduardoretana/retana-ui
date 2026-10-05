import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { GaugeStudio } from "@/registry/blocks/gauge-studio"

export const metadata: Metadata = {
  title: "Estudio de medidores",
  description: "Plantillas, capas, reproducción y controles del estudio.",
}

export default function Page() {
  return (
    <ExampleFrame
      wide
      title="Estudio de medidores"
      description="Elige una plantilla, apila otro dial, cambia el valor y copia el código. Deshacer es Control o Comando Z."
    >
      <GaugeStudio />
    </ExampleFrame>
  )
}
