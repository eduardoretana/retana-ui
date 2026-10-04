import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Error en el mensaje",
  description: "Un fallo en línea bajo el mensaje, con reintento.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Error en el mensaje" description="Un fallo en línea bajo el mensaje, con reintento.">
      <Demo />
    </ExampleFrame>
  )
}
