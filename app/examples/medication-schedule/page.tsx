import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { MedicationScheduleDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Horario de medicamentos",
  description: "Línea de tiempo diaria de tomas con registro y avisos de interacción que tú provees.",
}

export default function Page() {
  return (
    <ExampleFrame title="Horario de medicamentos" description="Línea de tiempo diaria de tomas con registro y avisos de interacción que tú provees." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
