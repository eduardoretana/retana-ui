import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Celda de estado y acciones",
  description: "Un estado con acciones en la misma celda. El nombre accesible junta las dos cosas.",
}

export default function StatusActionCellPage() {
  return (
    <ExampleFrame
      title="Celda de estado y acciones"
      description="Hasta tres acciones quedan a la vista. El resto, y todas cuando el contenedor mide 390 px, entran en el menú."
    >
      <Demo />
    </ExampleFrame>
  )
}
