import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Matriz de confusión",
  description: "Una rejilla de calor, con conteos o porcentajes y una tabla de respaldo.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Matriz de confusión" description="Una rejilla de calor, con conteos o porcentajes y una tabla de respaldo.">
      <Demo />
    </ExampleFrame>
  )
}
