import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { TierDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Distribución por tramos",
  description: "Tramos seleccionables con el teclado.",
}

export default function Page() {
  return (
    <ExampleFrame title="Distribución por tramos" description="Tramos seleccionables con el teclado.">
      <Demo />
    </ExampleFrame>
  )
}
