import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tarjeta de función",
  description: "Ilustración, icono, título, descripción y un solo enlace opcional dentro de la rejilla bento.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Tarjeta de función"
      description="La zona de ilustración es un hueco. Con un preset, el dibujo se achica, se pone al lado o crece según la celda, no según la ventana. Si hay enlace, la tarjeta entera es ese enlace."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
