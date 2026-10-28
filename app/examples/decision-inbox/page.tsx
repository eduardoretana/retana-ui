import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Bandeja de decisiones",
  description: "Llamadas abiertas con dos respuestas. La elegida se confirma y se puede cerrar.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Bandeja de decisiones"
      description="Responde y cierra. El primer intento en Error deja la llamada abierta."
    >
      <Demo />
    </ExampleFrame>
  )
}
