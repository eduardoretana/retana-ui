import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { StatusBannerDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Franja de estado",
  description: "La franja cruza el mensaje cuando cambia la clave.",
}

export default function Page() {
  return (
    <ExampleFrame title="Franja de estado" description="La franja cruza el mensaje cuando cambia la clave.">
      <Demo />
    </ExampleFrame>
  )
}
