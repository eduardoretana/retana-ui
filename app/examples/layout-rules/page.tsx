import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { LayoutRulesGallery } from "./gallery"

export const metadata: Metadata = {
  title: "Reglas de layout",
  description: "Cinco reglas de medida, borde, color, tipo y continuidad, cada una con un sí y un no.",
}

export default function LayoutRulesPage() {
  return (
    <ExampleFrame
      title="Reglas de layout"
      description="Clean-room de una referencia pública sin licencia. Cada regla muestra qué no y qué sí, en 390 px."
    >
      <LayoutRulesGallery />
    </ExampleFrame>
  )
}
