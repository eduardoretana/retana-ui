import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Vistas de colección",
  description: "Una colección que cambia entre tablero, lista y línea de tiempo con un morph continuo.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Vistas de colección"
      description="La píldora cambia la vista. Tablero, lista y línea de tiempo comparten título y avatares."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
