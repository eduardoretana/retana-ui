import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Donde se cruzan",
  description: "Bruma y Caja reescribieron el anticipo y la entrega del pedido PED-1048.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Donde se cruzan"
      description="Quédate con una redacción por cruce. El pedido se archiva cuando ya no queda ninguno abierto. En Error, la primera elección se deshace."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
