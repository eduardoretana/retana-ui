import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Costo de la corrida",
  description: "Costo, tokens y caché de una corrida de ejemplo, con cascada acumulada.",
}

export default function Page() {
  return (
    <ExampleFrame
      title="Costo de la corrida"
      description="Una corrida de ejemplo. Los precios son ilustrativos. La cascada suma el costo de cada paso y el interruptor pasa a tokens."
      size="desk"
    >
      <Demo />
    </ExampleFrame>
  )
}
