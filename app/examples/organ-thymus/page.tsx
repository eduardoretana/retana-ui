import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Thymus } from "@/registry/retana/ui/organ-thymus"

export const metadata: Metadata = {
  title: "Timo",
  description: "Timo en 3D: 13 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Timo" description="Timo en 3D: 13 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Thymus label="Timo" /></div>
    </ExampleFrame>
  )
}
