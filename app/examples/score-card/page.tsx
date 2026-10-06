import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { ScoreCardDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Tarjeta de puntaje",
  description: "Medidor de marcas, ficha y tres cifras.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tarjeta de puntaje" description="Medidor de marcas, ficha y tres cifras.">
      <Demo />
    </ExampleFrame>
  )
}
