import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Medidor de almacenamiento",
  description: "El almacenamiento del origen, con una petición de persistencia.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Medidor de almacenamiento" description="El almacenamiento del origen, con una petición de persistencia.">
      <Demo />
    </ExampleFrame>
  )
}
