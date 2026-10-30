import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Área con cursor",
  description: "El trazo entra de izquierda a derecha. El cursor lee cada punto.",
}

export default function Page() {
  return (
    <ExampleFrame title="Área con cursor" description="El trazo entra de izquierda a derecha. El cursor lee cada punto.">
      <Demo />
    </ExampleFrame>
  )
}
