import type { Metadata } from "next"

import { DeskFrame } from "@/app/examples/desk/frame"

import { TicketDeskDemo } from "./demo"

export const metadata: Metadata = {
  title: "Escritorio de piezas",
  description: "Lista, hilo y propiedades de las piezas del taller Bruma.",
}

export default function Page() {
  return (
    <DeskFrame
      title="Escritorio de piezas"
      description="Filtro por estado, respuesta o nota, y la fecha prometida en tono de alerta cuando ya pasó. Datos ficticios de Estudio Bruma."
    >
      <TicketDeskDemo />
    </DeskFrame>
  )
}
