import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { WorkTableBoard } from "@/registry/blocks/work-table-board"

export const metadata: Metadata = {
  title: "Tablero agrupado",
  description: "Tabla de trabajo agrupada por estado, con grupos colapsables.",
}

export default function WorkTableBoardPage() {
  return (
    <ExampleFrame
      wide
      title="Tablero agrupado"
      description="Grupos por estado, con conteo y suma de puntos. Arrastrar una fila a otro grupo cambia el estado. Cada grupo puede mostrar más filas."
    >
      <WorkTableBoard />
    </ExampleFrame>
  )
}
