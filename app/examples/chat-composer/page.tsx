import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Compositor de chat",
  description: "Campo que crece, envía con Enter y puede detener la generación.",
}

export default function ChatComposerPage() {
  return (
    <ExampleFrame
      title="Compositor de chat"
      description="Enter envía, Mayús+Enter inserta un salto. Mientras se genera, el botón pasa a detener."
    >
      <Demo />
    </ExampleFrame>
  )
}
