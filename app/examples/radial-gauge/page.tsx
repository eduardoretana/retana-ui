import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { GaugeDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Medidor radial",
  description: "Un semicírculo con aguja y tope.",
}

export default function Page() {
  return (
    <ExampleFrame title="Medidor radial" description="Un semicírculo con aguja y tope.">
      <Demo />
    </ExampleFrame>
  )
}
