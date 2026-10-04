import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Orbe de voz",
  description: "Un visual de voz según el estado, que se detiene si se reduce el movimiento.",
}

export default function ExamplePage() {
  return (
    <ExampleFrame title="Orbe de voz" description="Un visual de voz según el estado, que se detiene si se reduce el movimiento.">
      <Demo />
    </ExampleFrame>
  )
}
