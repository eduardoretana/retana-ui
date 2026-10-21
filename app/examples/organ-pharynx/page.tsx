import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Pharynx } from "@/registry/retana/ui/organ-pharynx"

export const metadata: Metadata = {
  title: "Faringe",
  description: "Faringe en 3D: 20 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Faringe" description="Faringe en 3D: 20 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Pharynx label="Faringe" /></div>
    </ExampleFrame>
  )
}
