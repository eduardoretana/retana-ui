import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Gráfico de dona",
  description: "Partes de un total, con leyenda que muestra u oculta cada segmento.",
}

export default function DonutChartPage() {
  return (
    <ExampleFrame title="Gráfico de dona" description="La leyenda apaga un segmento y el anillo se reparte. Las flechas pasan de una fila a la siguiente.">
      <Demo />
    </ExampleFrame>
  )
}
