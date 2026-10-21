import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Kidneys } from "@/registry/retana/ui/organ-kidneys"

export const metadata: Metadata = {
  title: "Riñones",
  description: "Riñones en 3D: 6 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Riñones" description="Riñones en 3D: 6 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Kidneys label="Riñones" /></div>
    </ExampleFrame>
  )
}
