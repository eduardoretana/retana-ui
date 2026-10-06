import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { AccentCalloutDemo as Demo } from "@/app/examples/review/screens"

export const metadata: Metadata = {
  title: "Aviso de acento",
  description: "Acento, suave o invertido, con el texto que pases.",
}

export default function Page() {
  return (
    <ExampleFrame title="Aviso de acento" description="Acento, suave o invertido, con el texto que pases.">
      <Demo />
    </ExampleFrame>
  )
}
