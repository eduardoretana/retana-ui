import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Lienzo de cámara",
  description: "Una vista de cámara con un callback por cuadro. El bucle se pausa fuera de pantalla.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Lienzo de cámara" description="Una vista de cámara con un callback por cuadro. El bucle se pausa fuera de pantalla.">
      <Demo />
    </ExampleFrame>
  )
}
