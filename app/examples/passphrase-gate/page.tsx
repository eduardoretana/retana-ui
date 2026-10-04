import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Puerta de frase",
  description: "Crea o abre con una frase. El valor no se guarda.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Puerta de frase" description="Crea o abre con una frase. El valor no se guarda.">
      <Demo />
    </ExampleFrame>
  )
}
