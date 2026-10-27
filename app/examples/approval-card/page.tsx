import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Compuerta de aprobación",
  description: "El anticipo espera un visto. El reloj avisa y, si se acaba, no manda la transferencia.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Compuerta de aprobación"
      description="Aprueba, rechaza o pausa el reloj del anticipo de $18,400.00 MXN. Si el reloj se acaba, no sale solo. El primer visto en Error se deshace."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
