import type { Metadata } from "next"

import { DeskFrame } from "@/app/examples/desk/frame"

import { AtsDemo } from "./demo"

export const metadata: Metadata = {
  title: "Seguimiento de candidatos",
  description: "Tablero de reclutamiento con detalle y evaluación. Datos de un taller inventado.",
}

export default function Page() {
  return (
    <DeskFrame
      title="Seguimiento de candidatos"
      description="Datos de Taller Nube, un estudio inventado. La etapa sale de getStage, no de un campo guardado. Flechas en el nombre mueven de columna si la transición está permitida. Nada de esto es un cliente real."
    >
      <AtsDemo />
    </DeskFrame>
  )
}
