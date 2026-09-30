import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Dock de navegación",
  description: "Barra flotante con aumento al cursor, tooltips y búsqueda desplegable.",
}

export default function DockNavPage() {
  return (
    <ExampleFrame
      title="Dock de navegación"
      description="Pasa el cursor para ampliar los iconos. La búsqueda baja desde su casilla y vuelve con Escape."
    >
      <Demo />
    </ExampleFrame>
  )
}
