import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { SuggestionDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Tarjeta de sugerencia",
  description: "Una propuesta con confianza y evidencia.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tarjeta de sugerencia" description="Una propuesta con confianza y evidencia.">
      <Demo />
    </ExampleFrame>
  )
}
