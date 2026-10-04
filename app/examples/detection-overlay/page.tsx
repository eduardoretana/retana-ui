import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Cajas de detección",
  description: "Cajas con etiqueta sobre una imagen, y una leyenda.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Cajas de detección" description="Cajas con etiqueta sobre una imagen, y una leyenda.">
      <Demo />
    </ExampleFrame>
  )
}
