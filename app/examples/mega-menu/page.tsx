import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Mega menú",
  description: "Barra con un panel ancho. En un marco estrecho se apila.",
}

export default function MegaMenuPage() {
  return (
    <ExampleFrame
      wide
      title="Mega menú"
      description="Pasa el cursor o usa las flechas. En un contenedor menor de 768px el panel se vuelve un acordeón."
    >
      <Demo />
    </ExampleFrame>
  )
}
