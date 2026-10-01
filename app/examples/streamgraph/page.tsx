import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Gráfico de flujo",
  description: "Cómo cambia la mezcla de varias capas a lo largo de las semanas.",
}

export default function StreamgraphPage() {
  return (
    <ExampleFrame wide title="Gráfico de flujo" description="Izquierda y derecha recorren el tiempo. Arriba y abajo cambian de capa. La leyenda adelgaza la que se apaga.">
      <Demo />
    </ExampleFrame>
  )
}
