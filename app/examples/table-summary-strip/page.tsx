import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Franja de cifras de la tabla",
  description: "Cifras arriba de la tabla, con estado y acciones en la fila y una tendencia por serie.",
}

export default function TableSummaryStripPage() {
  return (
    <ExampleFrame
      size="wide"
      title="Franja de cifras de la tabla"
      description="La franja se compone encima de la tabla de datos, la expansible, la de trabajo o la adaptativa. No es una tabla nueva."
    >
      <Demo />
    </ExampleFrame>
  )
}
