import type { Metadata } from "next"

import { DeskFrame } from "@/app/examples/desk/frame"

import { PipelineBoardDemo } from "./demo"

export const metadata: Metadata = {
  title: "Tablero de candidatos",
  description: "Kanban de reclutamiento. Datos inventados.",
}

export default function Page() {
  return (
    <DeskFrame
      title="Tablero de candidatos"
      description="Columnas inyectadas. Arrastra o usa las flechas. Una transición que salta etapas no está permitida en esta demostración."
    >
      <PipelineBoardDemo />
    </DeskFrame>
  )
}
