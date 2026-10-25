import type { Metadata } from "next"

import { DeskFrame } from "@/app/examples/desk/frame"

import { TaskBoardDemo } from "./demo"

export const metadata: Metadata = {
  title: "Tablero de encargos",
  description: "Tablero de tareas con detalle lateral. Datos de demostración de una cooperativa inventada.",
}

export default function Page() {
  return (
    <DeskFrame
      title="Tablero de encargos"
      description="Datos de demostración de la Cooperativa Lumen, un taller inventado. Flechas en el título mueven de columna. En el detalle, flecha izquierda y derecha cambian de encargo. Nada de esto es un cliente real."
    >
      <TaskBoardDemo />
    </DeskFrame>
  )
}
