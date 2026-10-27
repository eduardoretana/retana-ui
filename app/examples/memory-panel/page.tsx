import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Lo que recuerda",
  description: "Recuerdos de Mariana, el anticipo y el horno 2.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Lo que recuerda"
      description="Pausa, edita u olvida un recuerdo. Apagar el interruptor no borra la lista. En Error, el primer olvidar se deshace."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
