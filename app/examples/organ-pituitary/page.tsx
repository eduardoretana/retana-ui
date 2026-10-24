import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Pituitary } from "@/registry/retana/ui/organ-pituitary"

export const metadata: Metadata = {
  title: "Hipófisis",
  description: "Hipófisis en 3D: 19 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Hipófisis" description="Hipófisis en 3D: 19 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Pituitary label="Hipófisis" /></div>
    </ExampleFrame>
  )
}
