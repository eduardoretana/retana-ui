import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Muscles } from "@/registry/retana/ui/organ-muscles"

export const metadata: Metadata = {
  title: "Músculos",
  description: "Músculos en 3D: 177 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Músculos" description="Músculos en 3D: 177 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Muscles label="Músculos" /></div>
    </ExampleFrame>
  )
}
