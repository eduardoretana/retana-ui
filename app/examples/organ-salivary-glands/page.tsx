import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { SalivaryGlands } from "@/registry/retana/ui/organ-salivary-glands"

export const metadata: Metadata = {
  title: "Glándulas salivales",
  description: "Glándulas salivales en 3D: 15 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Glándulas salivales" description="Glándulas salivales en 3D: 15 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><SalivaryGlands label="Glándulas salivales" /></div>
    </ExampleFrame>
  )
}
