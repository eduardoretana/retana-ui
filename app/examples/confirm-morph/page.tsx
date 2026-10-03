import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Confirmar en el lugar",
  description: "Pregunta, ejecuta y deshace en la misma pastilla.",
}

export default function ConfirmMorphPage() {
  return (
    <ExampleFrame title="Confirmar en el lugar" description="Escape o un toque fuera cancela la pregunta. El ancho cambia con cada cara.">
      <Demo />
    </ExampleFrame>
  )
}
