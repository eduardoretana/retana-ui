import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Cita en línea",
  description: "Marcador numérico que muestra la fuente al pasar o enfocar.",
}

export default function InlineCitationPage() {
  return (
    <ExampleFrame title="Cita en línea" description="Pasa el cursor o enfoca el número para ver título, dominio y extracto. Las fuentes son ficticias.">
      <Demo />
    </ExampleFrame>
  )
}
