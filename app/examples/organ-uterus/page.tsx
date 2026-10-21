import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Uterus } from "@/registry/retana/ui/organ-uterus"

export const metadata: Metadata = {
  title: "Útero",
  description: "Útero en 3D: 27 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Útero" description="Útero en 3D: 27 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Uterus label="Útero" /></div>
    </ExampleFrame>
  )
}
