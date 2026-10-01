import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Gráfico de barras",
  description: "Un periodo, el promedio y la lectura de cada barra.",
}

export default function BarChartPage() {
  return (
    <ExampleFrame title="Gráfico de barras" description="El promedio descansa en el titular. Las flechas leen cada barra sin mover el resto de la página.">
      <Demo />
    </ExampleFrame>
  )
}
