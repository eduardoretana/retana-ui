import type { Metadata } from "next"

import { DeskFrame } from "@/app/examples/desk/frame"

import { NotificationInboxDemo } from "./demo"

export const metadata: Metadata = {
  title: "Avisos del taller",
  description: "Pestañas con conteo, actividad y propiedades de las piezas.",
}

export default function Page() {
  return (
    <DeskFrame
      title="Avisos del taller"
      description="Todos, sin leer, equipos y destacados. Archivar, posponer y seguir una pieza. Datos ficticios de Estudio Bruma."
    >
      <NotificationInboxDemo />
    </DeskFrame>
  )
}
