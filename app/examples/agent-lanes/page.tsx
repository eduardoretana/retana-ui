import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Carriles de agentes",
  description: "Bruma, Horno y Caja en la misma mañana, con el pase de la cotización y el anticipo que espera un visto.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Carriles de agentes"
      description="A las 11:40 Horno sigue en la foto y Caja espera el visto del anticipo. El primer visto en Error se deshace."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
