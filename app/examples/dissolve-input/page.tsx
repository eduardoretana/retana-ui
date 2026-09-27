import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Campo que se desvanece",
  description: "Al enviar o limpiar, el texto se rompe en partículas.",
}

export default function DissolveInputPage() {
  return (
    <ExampleFrame title="Campo que se desvanece" description="Enter o Limpiar sueltan el texto en partículas. Con movimiento reducido, el campo solo se vacía.">
      <Demo />
    </ExampleFrame>
  )
}
