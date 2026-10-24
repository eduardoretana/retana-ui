import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Larynx } from "@/registry/retana/ui/organ-larynx"

export const metadata: Metadata = {
  title: "Laringe",
  description: "Laringe en 3D: 20 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Laringe" description="Laringe en 3D: 20 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Larynx label="Laringe" /></div>
    </ExampleFrame>
  )
}
