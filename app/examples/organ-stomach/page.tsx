import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Stomach } from "@/registry/retana/ui/organ-stomach"

export const metadata: Metadata = {
  title: "Estómago",
  description: "Estómago en 3D: 9 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Estómago" description="Estómago en 3D: 9 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Stomach label="Estómago" /></div>
    </ExampleFrame>
  )
}
