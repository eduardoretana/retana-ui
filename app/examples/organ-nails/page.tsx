import type { Metadata } from "next"

import { ExampleFrame } from "@/app/examples/example-frame"
import { Nails } from "@/registry/retana/ui/organ-nails"

export const metadata: Metadata = {
  title: "Uñas",
  description: "Uñas en 3D: 14 estructuras seleccionables. Modelo bajo CC0 1.0; el crédito queda visible.",
}

export default function Page() {
  return (
    <ExampleFrame title="Uñas" description="Uñas en 3D: 14 estructuras seleccionables. Modelo bajo CC0 1.0; el crédito queda visible." size="wide">
      <div className="h-[32rem]"><Nails label="Uñas" /></div>
    </ExampleFrame>
  )
}
