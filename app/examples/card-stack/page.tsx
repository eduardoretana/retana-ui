import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Pila de tarjetas",
  description: "Una baraja que se lanza a un lado y se puede deshacer.",
}

export default function CardStackPage() {
  return (
    <ExampleFrame title="Pila de tarjetas" description="Arrastra la de arriba, o usa las flechas. Deshacer la trae de vuelta.">
      <Demo />
    </ExampleFrame>
  )
}
