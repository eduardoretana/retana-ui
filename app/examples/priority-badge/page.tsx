import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { PriorityDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Insignia de prioridad",
  description: "Cuatro niveles con barras de señal.",
}

export default function Page() {
  return (
    <ExampleFrame title="Insignia de prioridad" description="Cuatro niveles con barras de señal.">
      <Demo />
    </ExampleFrame>
  )
}
