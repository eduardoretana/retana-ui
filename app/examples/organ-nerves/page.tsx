import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Nerves } from "@/registry/retana/ui/organ-nerves"

export const metadata: Metadata = {
  title: "Nervios periféricos",
  description: "Nervios periféricos en 3D: 41 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Nervios periféricos" description="Nervios periféricos en 3D: 41 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Nerves label="Nervios periféricos" /></div>
    </ExampleFrame>
  )
}
