import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tabla comparativa",
  description: "En una pantalla estrecha elige un plan y la tabla se apila.",
}

export default function ComparisonTablePage() {
  return (
    <ExampleFrame wide title="Tabla comparativa" description="Tu plan se queda. En 320px eliges con cuál compararlo y las filas se apilan en dos columnas.">
      <Demo />
    </ExampleFrame>
  )
}
