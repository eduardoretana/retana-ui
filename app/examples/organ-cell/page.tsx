import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Cell } from "@/registry/retana/ui/organ-cell"

export const metadata: Metadata = {
  title: "Célula",
  description: "Célula en 3D: 15 estructuras seleccionables. Modelo bajo CC0 1.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Célula" description="Célula en 3D: 15 estructuras seleccionables. Modelo bajo CC0 1.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Cell label="Célula" /></div>
    </ExampleFrame>
  )
}
