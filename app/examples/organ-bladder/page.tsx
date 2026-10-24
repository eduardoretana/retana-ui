import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Bladder } from "@/registry/retana/ui/organ-bladder"

export const metadata: Metadata = {
  title: "Vejiga",
  description: "Vejiga en 3D: 12 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Vejiga" description="Vejiga en 3D: 12 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Bladder label="Vejiga" /></div>
    </ExampleFrame>
  )
}
