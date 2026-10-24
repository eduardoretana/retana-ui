import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Skin } from "@/registry/retana/ui/organ-skin"

export const metadata: Metadata = {
  title: "Piel",
  description: "Piel en 3D: 13 estructuras seleccionables. Modelo bajo CC0 1.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Piel" description="Piel en 3D: 13 estructuras seleccionables. Modelo bajo CC0 1.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Skin label="Piel" /></div>
    </ExampleFrame>
  )
}
