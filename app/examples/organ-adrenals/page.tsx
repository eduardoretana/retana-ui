import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Adrenals } from "@/registry/retana/ui/organ-adrenals"

export const metadata: Metadata = {
  title: "Glándulas suprarrenales",
  description: "Glándulas suprarrenales en 3D: 12 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Glándulas suprarrenales" description="Glándulas suprarrenales en 3D: 12 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Adrenals label="Glándulas suprarrenales" /></div>
    </ExampleFrame>
  )
}
