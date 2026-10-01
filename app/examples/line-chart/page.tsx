import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Gráfico de líneas",
  description: "Dos series sobre la misma semana, con leyenda y lectura por teclado.",
}

export default function LineChartPage() {
  return (
    <ExampleFrame wide title="Gráfico de líneas" description="La leyenda apaga una serie. Las flechas recorren el cruce sin perder el nombre del día.">
      <Demo />
    </ExampleFrame>
  )
}
