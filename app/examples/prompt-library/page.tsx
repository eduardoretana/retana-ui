import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Biblioteca de prompts",
  description: "La nota para Celaya se arma cuando cada espacio está lleno.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Biblioteca de prompts"
      description="Llena los espacios y usa el prompt. En Error, el primer uso se deshace. Un espacio vacío no deja usarlo."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
