import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Parathyroid } from "@/registry/retana/ui/organ-parathyroid"

export const metadata: Metadata = {
  title: "Paratiroides",
  description: "Paratiroides en 3D: 9 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Paratiroides" description="Paratiroides en 3D: 9 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Parathyroid label="Paratiroides" /></div>
    </ExampleFrame>
  )
}
