import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Teeth } from "@/registry/retana/ui/organ-teeth"

export const metadata: Metadata = {
  title: "Dientes",
  description: "Dientes en 3D: 33 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Dientes" description="Dientes en 3D: 33 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Teeth label="Dientes" /></div>
    </ExampleFrame>
  )
}
