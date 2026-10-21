import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Thyroid } from "@/registry/retana/ui/organ-thyroid"

export const metadata: Metadata = {
  title: "Tiroides",
  description: "Tiroides en 3D: 18 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Tiroides" description="Tiroides en 3D: 18 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Thyroid label="Tiroides" /></div>
    </ExampleFrame>
  )
}
