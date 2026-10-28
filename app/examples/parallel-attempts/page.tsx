import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Intentos en paralelo",
  description: "Tres maneras de escribir la nota para Celaya del pedido PED-990.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Intentos en paralelo"
      description="Quédate con una nota. En Falló, la primera elección se deshace. Un empate no elige solo."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
