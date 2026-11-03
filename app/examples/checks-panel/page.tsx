import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Panel de comprobaciones",
  description: "Una pastilla con el conteo que abre lint, tipos, unit, preview y e2e.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame
      title="Panel de comprobaciones"
      description="La pastilla nace cerrada. Cada fila trae icono, palabra, barra y tiempo. El tiempo estimado lo dice."
    >
      <Demo />
    </ExampleFrame>
  )
}
