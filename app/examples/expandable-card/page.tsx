import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta expandible",
  description: "Una tarjeta densa que abre su detalle en el mismo lugar.",
}

export default function ExpandableCardPage() {
  return (
    <ExampleFrame title="Tarjeta expandible" description="El cuadro crece en ancho y alto. Escape cierra y devuelve el foco.">
      <Demo />
    </ExampleFrame>
  )
}
