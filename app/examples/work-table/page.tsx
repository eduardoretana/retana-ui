import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { WorkTableQueue } from "@/registry/blocks/work-table-queue"

export const metadata: Metadata = {
  title: "Tabla de trabajo",
  description: "Tabla con columnas y filas arrastrables, diseños y paginación.",
}

export default function WorkTablePage() {
  return (
    <ExampleFrame
      wide
      title="Tabla de trabajo"
      description="Columnas con asa, orden en vivo, diseños, densidad, selección y paginación. El orden se anuncia y se puede deshacer."
    >
      <WorkTableQueue />
    </ExampleFrame>
  )
}
