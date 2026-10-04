import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Barras de audio",
  description: "Una fila de barras de actividad, por niveles o en reposo.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Barras de audio" description="Una fila de barras de actividad, por niveles o en reposo.">
      <Demo />
    </ExampleFrame>
  )
}
