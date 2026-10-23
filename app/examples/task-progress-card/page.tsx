import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tareas con avance",
  description: "Lista de tareas con barra de progreso, fecha y contador de completas.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tareas con avance" description="Lista de tareas con barra de progreso, fecha y contador de completas.">
      <Demo />
    </ExampleFrame>
  )
}
