import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { EventCalloutDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Aviso de evento",
  description: "Fecha y una acción al pie.",
}

export default function Page() {
  return (
    <ExampleFrame title="Aviso de evento" description="Fecha y una acción al pie.">
      <Demo />
    </ExampleFrame>
  )
}
