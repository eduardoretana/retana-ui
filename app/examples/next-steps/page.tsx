import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { NextStepsDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Próximos pasos",
  description: "Qué sigue y una acción fija.",
}

export default function Page() {
  return (
    <ExampleFrame title="Próximos pasos" description="Qué sigue y una acción fija.">
      <Demo />
    </ExampleFrame>
  )
}
