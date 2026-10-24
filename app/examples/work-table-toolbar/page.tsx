import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { ToolbarDemo } from "@/app/examples/work-table-toolbar/preview"

export const metadata: Metadata = {
  title: "Barra de la tabla de trabajo",
  description: "Búsqueda, prioridad, responsable, ciclo y orden.",
}

export default function WorkTableToolbarPage() {
  return (
    <ExampleFrame
      wide
      title="Barra de la tabla de trabajo"
      description="Búsqueda, prioridades P0–P3, responsables con avatar, ciclo, orden y botones para restablecer, expandir y restaurar."
    >
      <ToolbarDemo />
    </ExampleFrame>
  )
}
