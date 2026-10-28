import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Cursores de agentes",
  description: "Bruma, Horno y Caja sobre la nota del pedido, con una sugerencia de precio.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Cursores de agentes"
      description="Bruma está en el precio y propone dejar el anticipo en $18,400.00 MXN. Caja está ausente."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
