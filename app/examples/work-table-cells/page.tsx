import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { CellsDemo } from "@/app/examples/work-table-cells/preview"

export const metadata: Metadata = {
  title: "Celdas de la tabla de trabajo",
  description: "Título, persona, prioridad, fecha, estado, SLA, esfuerzo y números.",
}

export default function WorkTableCellsPage() {
  return (
    <ExampleFrame
      title="Celdas de la tabla de trabajo"
      description="Título con identificador, persona, bandera de prioridad, fecha relativa, pastilla de estado, SLA, esfuerzo y números compactos. Los tonos salen de status-tone."
    >
      <CellsDemo />
    </ExampleFrame>
  )
}
