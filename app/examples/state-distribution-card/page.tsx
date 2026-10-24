import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Clientes por estado",
  description: "Ranking de estados con barras que crecen; el primero lleva el acento.",
}

export default function Page() {
  return (
    <ExampleFrame title="Clientes por estado" description="Ranking de estados con barras que crecen; el primero lleva el acento.">
      <Demo />
    </ExampleFrame>
  )
}
