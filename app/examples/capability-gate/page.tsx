import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Compuerta de capacidad",
  description: "Muestra el contenido solo tras comprobar la función, sin un destello del aviso.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Compuerta de capacidad" description="Muestra el contenido solo tras comprobar la función, sin un destello del aviso.">
      <Demo />
    </ExampleFrame>
  )
}
