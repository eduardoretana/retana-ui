import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Marcador",
  description: "Resaltado de texto con una aparición breve.",
}

export default function MarkerPage() {
  return (
    <ExampleFrame title="Marcador" description="El subrayado crece de izquierda a derecha. Con movimiento reducido aparece de inmediato.">
      <Demo />
    </ExampleFrame>
  )
}
