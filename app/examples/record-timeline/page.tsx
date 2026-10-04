import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { TimelineDemo as Demo } from "@/app/examples/desk/screens"

export const metadata: Metadata = {
  title: "Línea de un expediente",
  description: "La vida de un registro, de lo antiguo a lo nuevo.",
}

export default function Page() {
  return (
    <ExampleFrame title="Línea de un expediente" description="La vida de un registro, de lo antiguo a lo nuevo.">
      <Demo />
    </ExampleFrame>
  )
}
