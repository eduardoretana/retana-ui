import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { TrendDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Tendencia anotada",
  description: "Una curva con meta, banda y comparación.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tendencia anotada" description="Una curva con meta, banda y comparación.">
      <Demo />
    </ExampleFrame>
  )
}
