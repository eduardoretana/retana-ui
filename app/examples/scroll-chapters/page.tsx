import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Capítulos con progreso",
  description: "Índice fijo con barra total por scroll() y una barra por capítulo con view-timeline y timeline-scope. CSS puro.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Capítulos con progreso"
      description="La barra de arriba sigue todo el recorrido. Cada capítulo llena la suya mientras se lee. Sin soporte, el índice es una lista de enlaces."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
