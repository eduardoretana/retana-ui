import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Eye } from "@/registry/retana/ui/organ-eye"

export const metadata: Metadata = {
  title: "Ojo",
  description: "Ojo en 3D: 21 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Ojo" description="Ojo en 3D: 21 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Eye label="Ojo" /></div>
    </ExampleFrame>
  )
}
