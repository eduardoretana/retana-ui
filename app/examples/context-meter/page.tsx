import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Medidor de contexto",
  description: "Un anillo compacto del cupo de contexto, con el desglose al pulsarlo.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Medidor de contexto" description="Un anillo compacto del cupo de contexto, con el desglose al pulsarlo.">
      <Demo />
    </ExampleFrame>
  )
}
