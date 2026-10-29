import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Lista de hallazgos",
  description: "Lista seleccionable. La fila activa se eleva.",
}

export default function Page() {
  return (
    <ExampleFrame title="Lista de hallazgos" description="Lista seleccionable. La fila activa se eleva.">
      <Demo />
    </ExampleFrame>
  )
}
