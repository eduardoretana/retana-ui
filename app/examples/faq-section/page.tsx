import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Preguntas",
  description: "Acordeón, temas al lado, o una búsqueda.",
}

export default function FaqSectionPage() {
  return (
    <ExampleFrame wide title="Preguntas" description="Las flechas saltan de pregunta en pregunta. La búsqueda marca lo que coincide.">
      <Demo />
    </ExampleFrame>
  )
}
