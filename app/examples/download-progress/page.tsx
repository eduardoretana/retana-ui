import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Progreso de descarga",
  description: "Una tarjeta para una descarga grande, con velocidad y tiempo restante.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Progreso de descarga" description="Una tarjeta para una descarga grande, con velocidad y tiempo restante.">
      <Demo />
    </ExampleFrame>
  )
}
