import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { InsightCardDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Tarjeta de lectura",
  description: "Tarjeta invertida con viñetas, estado, cifras o lista.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tarjeta de lectura" description="Tarjeta invertida con viñetas, estado, cifras o lista.">
      <Demo />
    </ExampleFrame>
  )
}
