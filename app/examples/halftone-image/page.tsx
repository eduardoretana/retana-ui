import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Imagen en puntos",
  description: "Imagen dibujada con puntos que reaccionan al cursor.",
}

export default function HalftoneImagePage() {
  return (
    <ExampleFrame title="Imagen en puntos" description="El lienzo toma el color del texto del tema. Con movimiento reducido, los puntos no siguen al cursor.">
      <Demo />
    </ExampleFrame>
  )
}
