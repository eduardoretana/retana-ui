import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { WellCardDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Tarjeta en pozo",
  description: "Un contenedor apagado con una tarjeta interior.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tarjeta en pozo" description="Un contenedor apagado con una tarjeta interior.">
      <Demo />
    </ExampleFrame>
  )
}
