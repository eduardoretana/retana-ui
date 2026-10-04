import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Pulsar para hablar",
  description: "Mantén para grabar y suelta para enviar, con un modo de alternar.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Pulsar para hablar" description="Mantén para grabar y suelta para enviar, con un modo de alternar.">
      <Demo />
    </ExampleFrame>
  )
}
