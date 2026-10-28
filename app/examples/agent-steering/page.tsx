import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Dirección en vivo",
  description: "Notas para un agente que ya está trabajando: esperan al siguiente paso o entran ahora.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Dirección en vivo"
      description="Enter deja la nota en espera. Ctrl o Cmd Enter la aplica al paso actual. El primer intento en Error se deshace."
    >
      <Demo />
    </ExampleFrame>
  )
}
