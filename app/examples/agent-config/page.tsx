import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Configuración de agentes",
  description: "Pantalla para configurar los agentes de IA de Nimbo, con bandas, guardas y versiones.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Configuración de agentes"
      description="Cambia las bandas, compara el borrador y publica. El primer intento en Fallo al publicar vuelve al borrador."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
