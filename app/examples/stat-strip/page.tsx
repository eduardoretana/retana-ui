import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { StatStripDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Franja de cifras",
  description: "Una fila de números con su cambio.",
}

export default function Page() {
  return (
    <ExampleFrame title="Franja de cifras" description="Una fila de números con su cambio.">
      <Demo />
    </ExampleFrame>
  )
}
