import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"

import { Demo } from "./demo"

export const metadata: Metadata = {
  title: "Cuadrícula de partes",
  description: "Cien celdas, una por cada parte del total.",
}

export default function WaffleChartPage() {
  return (
    <ExampleFrame title="Cuadrícula de partes" description="Las flechas recorren las celdas. La leyenda fija una categoría." wide>
      <Demo />
    </ExampleFrame>
  )
}
