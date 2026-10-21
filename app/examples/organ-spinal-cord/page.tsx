import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { SpinalCord } from "@/registry/retana/ui/organ-spinal-cord"

export const metadata: Metadata = {
  title: "Médula espinal",
  description: "Médula espinal en 3D: 63 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Médula espinal" description="Médula espinal en 3D: 63 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><SpinalCord label="Médula espinal" /></div>
    </ExampleFrame>
  )
}
