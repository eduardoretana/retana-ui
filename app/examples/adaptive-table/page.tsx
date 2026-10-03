import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tabla adaptativa",
  description: "Tabla agrupada que pliega columnas según el ancho del contenedor.",
}

export default function AdaptiveTablePage() {
  return (
    <ExampleFrame
      wide
      title="Tabla adaptativa"
      description="Las columnas de menos prioridad desaparecen, el importe se pliega en el nombre y el resto se estira. Sirve para un panel estrecho. data-table es la tabla TanStack completa."
    >
      <Demo />
    </ExampleFrame>
  )
}
