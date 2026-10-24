import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Liver } from "@/registry/retana/ui/organ-liver"

export const metadata: Metadata = {
  title: "Hígado",
  description: "Hígado en 3D: 7 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Hígado" description="Hígado en 3D: 7 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Liver label="Hígado" /></div>
    </ExampleFrame>
  )
}
