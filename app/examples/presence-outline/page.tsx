import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Contorno de selección",
  description: "Resalta el campo que otra persona tiene seleccionado.",
}

export default function PresenceOutlinePage() {
  return (
    <ExampleFrame title="Contorno de selección" description="Priya está en Brief y Scribe en Notas. Enfoca un campo para publicar tu selección.">
      <Demo />
    </ExampleFrame>
  )
}
