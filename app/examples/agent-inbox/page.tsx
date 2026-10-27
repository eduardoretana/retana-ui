import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Bandeja de agentes",
  description: "Trabajo de fondo del taller, con el último paso a la vista y una aprobación antes de que salga.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Bandeja de agentes"
      description="Despliega el anticipo, apruébalo o reintenta el aviso a Celaya. El primer reintento en Falló se deshace."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
