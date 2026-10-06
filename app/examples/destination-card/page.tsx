import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { DestinationCardDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Tarjeta de destino",
  description: "Destino, estado y pares etiqueta-valor.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tarjeta de destino" description="Destino, estado y pares etiqueta-valor.">
      <Demo />
    </ExampleFrame>
  )
}
