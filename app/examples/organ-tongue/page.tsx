import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Tongue } from "@/registry/retana/ui/organ-tongue"

export const metadata: Metadata = {
  title: "Lengua",
  description: "Lengua en 3D: 13 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Lengua" description="Lengua en 3D: 13 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Tongue label="Lengua" /></div>
    </ExampleFrame>
  )
}
