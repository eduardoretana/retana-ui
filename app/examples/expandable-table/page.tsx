import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tabla expansible",
  description: "Una fila del taller se abre en tareas, partidas o subtareas.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Tabla expansible"
      description="Abre un pedido en tarjetas, en partidas con total, o en subtareas unidas por una línea. La flecha derecha abre y la izquierda cierra."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
