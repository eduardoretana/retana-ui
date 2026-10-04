import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { HeaderDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Encabezado de expediente",
  description: "Título, meta, personas y acciones.",
}

export default function Page() {
  return (
    <ExampleFrame title="Encabezado de expediente" description="Título, meta, personas y acciones.">
      <Demo />
    </ExampleFrame>
  )
}
