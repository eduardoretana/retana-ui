import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Pendientes",
  description: "Cada línea compara un antes y un después.",
}

export default function SlopeChartPage() {
  return (
    <ExampleFrame title="Pendientes" description="Arriba y abajo recorren el orden del segundo momento." wide>
      <Demo />
    </ExampleFrame>
  )
}
