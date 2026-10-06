import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { WorkspaceSwitcherDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Cambio de espacio",
  description: "El nombre y el menú salen de las opciones.",
}

export default function Page() {
  return (
    <ExampleFrame title="Cambio de espacio" description="El nombre y el menú salen de las opciones.">
      <Demo />
    </ExampleFrame>
  )
}
