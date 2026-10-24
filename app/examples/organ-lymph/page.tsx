import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Lymph } from "@/registry/retana/ui/organ-lymph"

export const metadata: Metadata = {
  title: "Ganglio linfático",
  description: "Ganglio linfático en 3D: 7 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Ganglio linfático" description="Ganglio linfático en 3D: 7 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Lymph label="Ganglio linfático" /></div>
    </ExampleFrame>
  )
}
