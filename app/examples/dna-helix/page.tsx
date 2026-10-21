import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { DnaHelixDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Doble hélice de ADN",
  description: "Hélice B-DNA procedural desde una secuencia, con selección de pares de bases.",
}

export default function Page() {
  return (
    <ExampleFrame title="Doble hélice de ADN" description="Hélice B-DNA procedural desde una secuencia, con selección de pares de bases." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
