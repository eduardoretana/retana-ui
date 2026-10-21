import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Joints } from "@/registry/retana/ui/organ-joints"

export const metadata: Metadata = {
  title: "Articulaciones y ligamentos",
  description: "Articulaciones y ligamentos en 3D: 197 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Articulaciones y ligamentos" description="Articulaciones y ligamentos en 3D: 197 estructuras seleccionables. Modelo bajo CC BY-SA 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Joints label="Articulaciones y ligamentos" /></div>
    </ExampleFrame>
  )
}
