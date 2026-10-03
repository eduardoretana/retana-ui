import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Línea de tiempo",
  description: "Un feed por día que se abre en el sitio y se recorre con el teclado.",
}

export default function TimelinePage() {
  return (
    <ExampleFrame title="Línea de tiempo" description="Hoy y ayer se agrupan solos. Enter abre el detalle." wide>
      <Demo />
    </ExampleFrame>
  )
}
