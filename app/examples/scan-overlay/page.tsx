import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Capa de proceso",
  description: "Un velo de proceso sobre una imagen, quieto si se reduce el movimiento.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Capa de proceso" description="Un velo de proceso sobre una imagen, quieto si se reduce el movimiento.">
      <Demo />
    </ExampleFrame>
  )
}
