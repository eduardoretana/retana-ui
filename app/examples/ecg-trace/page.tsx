import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { EcgTraceDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Trazo de ECG",
  description: "Tira de ritmo grabada o en vivo sobre papel estándar, con pausa y detección de ondas.",
}

export default function Page() {
  return (
    <ExampleFrame title="Trazo de ECG" description="Tira de ritmo grabada o en vivo sobre papel estándar, con pausa y detección de ondas." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
