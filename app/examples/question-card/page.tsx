import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Pregunta del agente",
  description: "El agente pregunta con opciones y una respuesta libre.",
}

export default function QuestionCardPage() {
  return (
    <ExampleFrame title="Pregunta del agente" description="Selección múltiple en este ejemplo, más un campo libre. También existe el modo de una sola opción.">
      <Demo />
    </ExampleFrame>
  )
}
