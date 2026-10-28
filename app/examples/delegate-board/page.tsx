import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Tablero de delegación",
  description: "Entrega trabajo a un agente, o dáselo a quien esté libre primero.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Tablero de delegación"
      description="Elige en la lista, arrastra, o reparte lo pendiente. El primer intento en Error no asigna."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
