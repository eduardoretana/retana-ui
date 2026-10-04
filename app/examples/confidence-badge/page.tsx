import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Insignia de confianza",
  description: "Una puntuación de 0 a 1 como insignia, dial o barra, con el nivel en texto.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Insignia de confianza" description="Una puntuación de 0 a 1 como insignia, dial o barra, con el nivel en texto.">
      <Demo />
    </ExampleFrame>
  )
}
