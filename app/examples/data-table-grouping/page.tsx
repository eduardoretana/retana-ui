import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { DataTableGroupingDemo } from "./demo"

export const metadata: Metadata = {
  title: "Tabla con agrupación",
  description: "Agrupación en caliente, árbol con subtotales, maestro-detalle y pie de gran total.",
}

export default function DataTableGroupingPage() {
  return (
    <ExampleFrame
      wide
      title="Tabla con agrupación"
      description="Una tabla configurable: agrupa sin perder la selección, pliega grupos, suma un árbol y abre el detalle de una fila. Los datos son ficticios."
    >
      <DataTableGroupingDemo />
    </ExampleFrame>
  )
}
