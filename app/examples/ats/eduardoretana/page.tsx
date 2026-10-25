import type { Metadata } from "next"

import { DeskFrame } from "@/app/examples/desk/frame"

import { RetanaAtsDemo } from "./demo"

export const metadata: Metadata = {
  title: "Contrataciones · etapas de Eduardo",
  description:
    "El seguimiento de candidatos con las etapas, etiquetas y colores observados en eduardoretana.com. Las personas son inventadas.",
}

export default function Page() {
  return (
    <DeskFrame
      title="Contrataciones"
      description="Mismas piezas del seguimiento, vestidas con las etapas de la app pública: embudo (Postulación, Screening, Prueba técnica, Calculadora, Entrevista) y contratación (Registro a Contratado), más No apto y Rechazado. El color de cada columna llega por className. La etapa se calcula con las banderas de la persona. Psicometría, Identidad y Contratos no se mueven a mano. Helena Ibarra trae cuatro evaluaciones: «Mover a Identidad, 3 de 4 sí». Nadie de esta página es un candidato real."
    >
      <RetanaAtsDemo />
    </DeskFrame>
  )
}
