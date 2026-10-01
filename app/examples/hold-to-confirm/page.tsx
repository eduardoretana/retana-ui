import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Mantener para confirmar",
  description: "Solo confirma si se sostiene el botón.",
}

export default function HoldToConfirmPage() {
  return (
    <ExampleFrame title="Mantener para confirmar" description="Un toque corto no cuenta. El relleno avanza mientras se sostiene.">
      <Demo />
    </ExampleFrame>
  )
}
