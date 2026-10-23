import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Dashboard de capacitación AE",
  description: "Pantalla de capacitación de asesores: barra flotante, cursos, áreas, tareas y ranking. Datos ficticios.",
}

export default function Page() {
  return (
    <ExampleFrame title="Dashboard de capacitación AE" description="Pantalla de capacitación de asesores: barra flotante, cursos, áreas, tareas y ranking. Datos ficticios." size="desk">
      <Demo />
    </ExampleFrame>
  )
}
