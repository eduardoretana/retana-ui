import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Hair } from "@/registry/retana/ui/organ-hair"

export const metadata: Metadata = {
  title: "Folículo piloso",
  description: "Folículo piloso en 3D: 14 estructuras seleccionables. Modelo bajo CC0 1.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Folículo piloso" description="Folículo piloso en 3D: 14 estructuras seleccionables. Modelo bajo CC0 1.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Hair label="Folículo piloso" /></div>
    </ExampleFrame>
  )
}
