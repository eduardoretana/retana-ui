import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Skeleton } from "@/registry/retana/ui/organ-skeleton"

export const metadata: Metadata = {
  title: "Esqueleto",
  description: "Esqueleto en 3D: 242 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Esqueleto" description="Esqueleto en 3D: 242 estructuras seleccionables. Modelo bajo CC BY-SA 2.1 JP; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Skeleton label="Esqueleto" /></div>
    </ExampleFrame>
  )
}
