import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Ausencias",
  description: "Agenda con festivos, solicitudes y aprobar o rechazar.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Ausencias"
      description="El bloque junta la agenda, la tabla de solicitudes y aprobar o rechazar. Duplicar o borrar un evento avisa en un toast."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
