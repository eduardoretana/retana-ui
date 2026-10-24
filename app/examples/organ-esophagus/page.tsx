import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Esophagus } from "@/registry/retana/ui/organ-esophagus"

export const metadata: Metadata = {
  title: "Esófago",
  description: "Esófago en 3D: 17 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Esófago" description="Esófago en 3D: 17 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Esophagus label="Esófago" /></div>
    </ExampleFrame>
  )
}
