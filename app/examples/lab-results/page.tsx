import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { LabResultsDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Resultados de laboratorio",
  description: "Valores marcados contra rangos de referencia, con tendencia y sparkline histórico.",
}

export default function Page() {
  return (
    <ExampleFrame title="Resultados de laboratorio" description="Valores marcados contra rangos de referencia, con tendencia y sparkline histórico." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
