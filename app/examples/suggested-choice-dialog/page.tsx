import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { DialogDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Diálogo con sugerencia",
  description: "La opción sugerida empieza seleccionada.",
}

export default function Page() {
  return (
    <ExampleFrame title="Diálogo con sugerencia" description="La opción sugerida empieza seleccionada.">
      <Demo />
    </ExampleFrame>
  )
}
