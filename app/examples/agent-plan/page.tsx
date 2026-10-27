import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Plan del agente",
  description: "Pasos del viernes para revisar, mover, quitar o reintentar antes de que el taller los corra.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Plan del agente"
      description="Renombra un paso, súbelo con Alt y flecha, o reintenta el aviso a Celaya. El primer reintento en Falló se deshace."
      size="wide"
    >
      <Demo />
    </ExampleFrame>
  )
}
