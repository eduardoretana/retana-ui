import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Árbol de agentes",
  description: "Quién lanzó a quién, con estados en vivo, costo y reintento.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame
      wide
      title="Árbol de agentes"
      description="Quién lanzó a quién. Los datos del boletín del faro son ficticios."
    >
      <Demo />
    </ExampleFrame>
  )
}
