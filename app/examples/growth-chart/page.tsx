import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { GrowthChartDemo as Demo } from "@/app/examples/salud/demos"

export const metadata: Metadata = {
  title: "Curva de crecimiento",
  description: "Percentiles de peso, talla y perímetro cefálico. Tú provees y licencias las tablas (OMS/CDC).",
}

export default function Page() {
  return (
    <ExampleFrame title="Curva de crecimiento" description="Percentiles de peso, talla y perímetro cefálico. Tú provees y licencias las tablas (OMS/CDC)." size="wide">
      <Demo />
    </ExampleFrame>
  )
}
