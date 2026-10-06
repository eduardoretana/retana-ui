import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Barra de lectura",
  description: "Una barra ligada al scroll, de 0 a 1.",
}

export default function Page() {
  return (
    <ExampleFrame title="Barra de lectura" description="El avance es la posición del scroll. No hay una animación aparte.">
      <Demo />
    </ExampleFrame>
  )
}
