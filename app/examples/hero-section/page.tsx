import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Sección hero",
  description: "Tres portadas: tablero, flujo y editorial.",
}

export default function HeroSectionPage() {
  return (
    <ExampleFrame wide title="Sección hero" description="Una portada con tablero, otra con el flujo de un pedido, y una editorial. El control cambia la variante.">
      <Demo />
    </ExampleFrame>
  )
}
