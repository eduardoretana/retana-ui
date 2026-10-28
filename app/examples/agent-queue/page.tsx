import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Cola de agentes",
  description: "Trabajo en espera, lugares de agente y la forma de la cola cuando el taller se detiene.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Cola de agentes"
      description="Sube un pedido, detén a los agentes o reintenta el aviso a Celaya. El primer reintento en Falló se deshace."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
