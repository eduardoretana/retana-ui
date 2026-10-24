import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Pancreas } from "@/registry/retana/ui/organ-pancreas"

export const metadata: Metadata = {
  title: "Páncreas",
  description: "Páncreas en 3D: 15 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Páncreas" description="Páncreas en 3D: 15 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Pancreas label="Páncreas" /></div>
    </ExampleFrame>
  )
}
