import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Vessels } from "@/registry/retana/ui/organ-vessels"

export const metadata: Metadata = {
  title: "Vasos sanguíneos",
  description: "Vasos sanguíneos en 3D: 51 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Vasos sanguíneos" description="Vasos sanguíneos en 3D: 51 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Vessels label="Vasos sanguíneos" /></div>
    </ExampleFrame>
  )
}
