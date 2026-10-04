import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Panel de artefacto",
  description: "Un lienzo acoplado para contenido generado, con copiar y descargar.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Panel de artefacto" description="Un lienzo acoplado para contenido generado, con copiar y descargar.">
      <Demo />
    </ExampleFrame>
  )
}
