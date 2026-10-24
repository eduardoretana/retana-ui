import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Brain } from "@/registry/retana/ui/organ-brain"

export const metadata: Metadata = {
  title: "Cerebro",
  description: "Cerebro en 3D: 19 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Cerebro" description="Cerebro en 3D: 19 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Brain label="Cerebro" /></div>
    </ExampleFrame>
  )
}
