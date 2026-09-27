import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Lista de tareas",
  description: "Checklist de un agente con barra de progreso.",
}

export default function TaskListPage() {
  return (
    <ExampleFrame title="Lista de tareas" description="El progreso sigue a las tareas marcadas. Los textos del agente son ficticios.">
      <Demo />
    </ExampleFrame>
  )
}
