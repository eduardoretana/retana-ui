import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Breast } from "@/registry/retana/ui/organ-breast"

export const metadata: Metadata = {
  title: "Mama",
  description: "Mama en 3D: 16 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Mama" description="Mama en 3D: 16 estructuras seleccionables. Modelo bajo CC BY 4.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Breast label="Mama" /></div>
    </ExampleFrame>
  )
}
