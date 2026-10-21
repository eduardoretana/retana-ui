import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Lungs } from "@/registry/retana/ui/organ-lungs"

export const metadata: Metadata = {
  title: "Pulmones",
  description: "Pulmones en 3D: 20 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Pulmones" description="Pulmones en 3D: 20 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Lungs label="Pulmones" /></div>
    </ExampleFrame>
  )
}
