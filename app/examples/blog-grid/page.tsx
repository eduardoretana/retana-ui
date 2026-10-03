import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Cuadrícula del diario",
  description: "Filtra las notas del taller y abre una en la misma página.",
}

export default function BlogGridPage() {
  return (
    <ExampleFrame wide title="Cuadrícula del diario" description="Las categorías filtran las notas. Abrir una la lee aquí mismo y devolver el foco a la tarjeta.">
      <Demo />
    </ExampleFrame>
  )
}
