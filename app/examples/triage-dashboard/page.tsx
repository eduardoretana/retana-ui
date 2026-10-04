import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { TriageDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Tablero de triaje",
  description: "Resumen de una cola de defectos.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tablero de triaje" description="Resumen de una cola de defectos." wide>
      <Demo />
    </ExampleFrame>
  )
}
