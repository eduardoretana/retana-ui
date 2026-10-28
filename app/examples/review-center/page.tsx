import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Centro de revisión",
  description: "La fila de lo que el taller todavía no deja salir, una pieza a la vez.",
}

export default function Page() {
  return (
    <ExampleFrame title="Centro de revisión" description="Aprueba, edita, rechaza o salta. El tramo dudoso del anticipo queda marcado." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
